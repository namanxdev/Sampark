from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid

from ..database import get_db
from ..models.models import Survey, User
from ..schemas.schemas import (
    SurveyCreate, SurveyUpdate, SurveyResponse, 
    ConflictResponse, ConflictField
)
from ..utils.dependencies import get_current_user, check_admin_role

router = APIRouter(prefix="/api/surveys", tags=["Surveys"])


@router.post("", response_model=SurveyResponse, status_code=status.HTTP_201_CREATED)
async def create_survey(
    survey: SurveyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new survey or sync offline data
    
    Handles:
    - New survey creation
    - Conflict detection if survey already exists
    """
    # Check if survey already exists
    existing_survey = db.query(Survey).filter(
        Survey.survey_id == survey.survey_id
    ).first()
    
    if existing_survey:
        # Conflict detected - check timestamps
        conflicts = detect_conflicts(existing_survey, survey)
        
        if conflicts:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "status": "conflict",
                    "survey_id": survey.survey_id,
                    "conflicts": conflicts,
                    "message": "Data conflict detected"
                }
            )
    
    # Create new survey
    db_survey = Survey(
        survey_id=survey.survey_id,
        panchayat_id=survey.panchayat_id,
        user_id=current_user.user_id,
        village_name=survey.village_name,
        basic_info=survey.basic_info,
        infrastructure=survey.infrastructure,
        sanitation=survey.sanitation,
        connectivity=survey.connectivity,
        land_forest=survey.land_forest,
        electricity=survey.electricity,
        waste_management=survey.waste_management,
        completion_percentage=survey.completion_percentage,
        is_complete=survey.is_complete,
        sync_status="synced",
        last_synced_at=datetime.utcnow(),
        client_timestamp=survey.client_timestamp,
        server_timestamp=datetime.utcnow()
    )
    
    db.add(db_survey)
    db.commit()
    db.refresh(db_survey)
    
    return db_survey


@router.get("", response_model=List[SurveyResponse])
async def get_surveys(
    panchayat_id: Optional[str] = Query(None),
    since: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get surveys for a panchayat
    
    Query params:
    - panchayat_id: Filter by panchayat (defaults to user's panchayat)
    - since: Get surveys updated after this date (for sync)
    """
    query = db.query(Survey)
    
    # Filter by panchayat
    if panchayat_id:
        query = query.filter(Survey.panchayat_id == panchayat_id)
    elif current_user.panchayat_id:
        query = query.filter(Survey.panchayat_id == current_user.panchayat_id)
    
    # Filter by date for incremental sync
    if since:
        query = query.filter(Survey.updated_at > since)
    
    surveys = query.order_by(Survey.updated_at.desc()).all()
    return surveys


@router.get("/{survey_id}", response_model=SurveyResponse)
async def get_survey(
    survey_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific survey by ID"""
    survey = db.query(Survey).filter(Survey.survey_id == survey_id).first()
    
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Survey not found"
        )
    
    # Check if user has access to this survey
    if current_user.role == "staff" and survey.panchayat_id != current_user.panchayat_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return survey


@router.put("/{survey_id}", response_model=SurveyResponse)
async def update_survey(
    survey_id: str,
    survey_update: SurveyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update an existing survey
    
    Handles conflict detection based on timestamps
    """
    db_survey = db.query(Survey).filter(Survey.survey_id == survey_id).first()
    
    if not db_survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Survey not found"
        )
    
    # Check access
    if current_user.role == "staff" and db_survey.panchayat_id != current_user.panchayat_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Check for conflicts
    if survey_update.client_timestamp and db_survey.server_timestamp:
        # Ensure both datetimes are timezone-aware or naive
        client_ts = survey_update.client_timestamp
        server_ts = db_survey.server_timestamp
        
        # Make both timezone-naive for comparison
        if client_ts.tzinfo is not None:
            client_ts = client_ts.replace(tzinfo=None)
        if server_ts.tzinfo is not None:
            server_ts = server_ts.replace(tzinfo=None)
            
        if server_ts > client_ts:
            conflicts = detect_conflicts(db_survey, survey_update)
            if conflicts:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail={
                        "status": "conflict",
                        "survey_id": survey_id,
                        "conflicts": conflicts
                    }
                )
    
    # Update fields
    update_data = survey_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field != "client_timestamp":
            setattr(db_survey, field, value)
    
    db_survey.version += 1
    db_survey.server_timestamp = datetime.utcnow()
    db_survey.last_synced_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_survey)
    
    return db_survey


@router.delete("/{survey_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_survey(
    survey_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin_role)  # Only admins can delete
):
    """Delete a survey (admin only)"""
    survey = db.query(Survey).filter(Survey.survey_id == survey_id).first()
    
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Survey not found"
        )
    
    db.delete(survey)
    db.commit()
    
    return None


# ============= Helper Functions =============

def detect_conflicts(db_survey: Survey, incoming_survey) -> List[dict]:
    """
    Detect conflicts between database survey and incoming survey
    
    Returns list of conflicting fields
    """
    conflicts = []
    
    # List of module fields to check
    module_fields = [
        "basic_info", "infrastructure", "sanitation",
        "connectivity", "land_forest", "electricity", "waste_management"
    ]
    
    for field in module_fields:
        db_value = getattr(db_survey, field)
        incoming_value = getattr(incoming_survey, field, None)
        
        # Skip if incoming value is None (not being updated)
        if incoming_value is None:
            continue
        
        # Check if values are different
        if db_value != incoming_value and db_value is not None:
            conflicts.append({
                "field_name": field,
                "server_value": db_value,
                "client_value": incoming_value,
                "server_timestamp": db_survey.server_timestamp.isoformat(),
                "client_timestamp": getattr(incoming_survey, "client_timestamp", datetime.utcnow()).isoformat()
            })
    
    return conflicts
