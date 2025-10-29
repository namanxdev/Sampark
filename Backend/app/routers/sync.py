from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid

from ..database import get_db
from ..models.models import Survey, SyncLog, User
from ..schemas.schemas import SyncRequest, SyncResponse, SurveyCreate
from ..utils.dependencies import get_current_user

router = APIRouter(prefix="/api/sync", tags=["Sync"])


@router.post("/batch", response_model=SyncResponse)
async def batch_sync(
    sync_request: SyncRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Batch sync multiple surveys from offline device
    
    This endpoint handles:
    - Multiple survey submissions at once
    - Conflict detection for each survey
    - Logging sync operations
    """
    synced_count = 0
    failed_count = 0
    conflicts = []
    
    for survey_data in sync_request.surveys:
        try:
            # Check if survey exists
            existing_survey = db.query(Survey).filter(
                Survey.survey_id == survey_data.survey_id
            ).first()
            
            if existing_survey:
                # Update existing survey
                result = update_existing_survey(db, existing_survey, survey_data, current_user)
                if result["status"] == "conflict":
                    conflicts.append(survey_data.survey_id)
                    failed_count += 1
                    log_sync_operation(
                        db, survey_data.survey_id, current_user.user_id,
                        "update", "conflict", result.get("conflicts")
                    )
                else:
                    synced_count += 1
                    log_sync_operation(
                        db, survey_data.survey_id, current_user.user_id,
                        "update", "success"
                    )
            else:
                # Create new survey
                create_new_survey(db, survey_data, current_user)
                synced_count += 1
                log_sync_operation(
                    db, survey_data.survey_id, current_user.user_id,
                    "create", "success"
                )
        
        except Exception as e:
            failed_count += 1
            log_sync_operation(
                db, survey_data.survey_id, current_user.user_id,
                "create", "failed", error_message=str(e)
            )
    
    db.commit()
    
    return {
        "status": "completed" if failed_count == 0 else "partial",
        "synced_count": synced_count,
        "failed_count": failed_count,
        "conflicts": conflicts,
        "message": f"Synced {synced_count} surveys successfully. {failed_count} failed."
    }


@router.get("/status")
async def get_sync_status(
    panchayat_id: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get sync status for surveys
    
    Returns count of pending, synced, and conflicted surveys
    """
    query = db.query(Survey)
    
    # Filter by panchayat
    if panchayat_id:
        query = query.filter(Survey.panchayat_id == panchayat_id)
    elif current_user.panchayat_id:
        query = query.filter(Survey.panchayat_id == current_user.panchayat_id)
    
    # Count by status
    total = query.count()
    synced = query.filter(Survey.sync_status == "synced").count()
    pending = query.filter(Survey.sync_status == "pending").count()
    conflict = query.filter(Survey.sync_status == "conflict").count()
    failed = query.filter(Survey.sync_status == "failed").count()
    
    return {
        "total": total,
        "synced": synced,
        "pending": pending,
        "conflict": conflict,
        "failed": failed,
        "sync_percentage": round((synced / total * 100) if total > 0 else 0, 2)
    }


@router.get("/logs")
async def get_sync_logs(
    survey_id: str = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get sync logs for debugging
    
    Query params:
    - survey_id: Filter logs for specific survey
    - limit: Number of logs to return (default 50)
    """
    query = db.query(SyncLog)
    
    if survey_id:
        query = query.filter(SyncLog.survey_id == survey_id)
    
    logs = query.order_by(SyncLog.timestamp.desc()).limit(limit).all()
    
    return {
        "logs": [
            {
                "log_id": log.log_id,
                "survey_id": log.survey_id,
                "operation": log.operation,
                "status": log.status,
                "timestamp": log.timestamp.isoformat(),
                "error_message": log.error_message,
                "conflicts": log.conflicts
            }
            for log in logs
        ]
    }


# ============= Helper Functions =============

def update_existing_survey(db: Session, existing: Survey, incoming: SurveyCreate, user: User) -> dict:
    """Update existing survey and check for conflicts"""
    
    # Detect conflicts
    conflicts = []
    module_fields = [
        "basic_info", "infrastructure", "sanitation",
        "connectivity", "land_forest", "electricity", "waste_management"
    ]
    
    for field in module_fields:
        db_value = getattr(existing, field)
        incoming_value = getattr(incoming, field, None)
        
        if incoming_value is None:
            continue
        
        if db_value != incoming_value and db_value is not None:
            conflicts.append({
                "field_name": field,
                "server_value": db_value,
                "client_value": incoming_value
            })
    
    # If conflicts exist, return conflict status
    if conflicts:
        return {
            "status": "conflict",
            "conflicts": conflicts
        }
    
    # No conflicts - update survey
    for field in module_fields:
        incoming_value = getattr(incoming, field, None)
        if incoming_value is not None:
            setattr(existing, field, incoming_value)
    
    existing.village_name = incoming.village_name or existing.village_name
    existing.completion_percentage = incoming.completion_percentage
    existing.is_complete = incoming.is_complete
    existing.sync_status = "synced"
    existing.last_synced_at = datetime.utcnow()
    existing.server_timestamp = datetime.utcnow()
    existing.version += 1
    
    return {"status": "success"}


def create_new_survey(db: Session, survey_data: SurveyCreate, user: User):
    """Create a new survey from sync data"""
    
    new_survey = Survey(
        survey_id=survey_data.survey_id,
        panchayat_id=survey_data.panchayat_id,
        user_id=user.user_id,
        village_name=survey_data.village_name,
        basic_info=survey_data.basic_info,
        infrastructure=survey_data.infrastructure,
        sanitation=survey_data.sanitation,
        connectivity=survey_data.connectivity,
        land_forest=survey_data.land_forest,
        electricity=survey_data.electricity,
        waste_management=survey_data.waste_management,
        completion_percentage=survey_data.completion_percentage,
        is_complete=survey_data.is_complete,
        sync_status="synced",
        last_synced_at=datetime.utcnow(),
        client_timestamp=survey_data.client_timestamp,
        server_timestamp=datetime.utcnow()
    )
    
    db.add(new_survey)


def log_sync_operation(
    db: Session,
    survey_id: str,
    user_id: str,
    operation: str,
    status: str,
    conflicts: list = None,
    error_message: str = None
):
    """Log sync operation for audit trail"""
    
    log = SyncLog(
        survey_id=survey_id,
        user_id=user_id,
        operation=operation,
        status=status,
        conflicts=conflicts,
        error_message=error_message
    )
    
    db.add(log)
