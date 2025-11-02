from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models.models import User, Survey, Panchayat
from ..schemas.schemas import UserResponse
from ..utils.dependencies import get_current_user, check_admin_role
from pydantic import BaseModel


router = APIRouter(prefix="/api/users", tags=["Users Management"])


# ============= Response Schemas =============

class UserStats(BaseModel):
    """User statistics"""
    user_id: str
    username: str
    full_name: Optional[str]
    email: Optional[str]
    role: str
    panchayat_name: Optional[str]
    is_active: bool
    surveys_created: int
    last_survey_date: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True


class SurveyListItem(BaseModel):
    """Survey item for admin view"""
    survey_id: str
    village_name: Optional[str]
    created_by_username: str
    created_by_fullname: Optional[str]
    panchayat_name: Optional[str]
    completion_percentage: int
    is_complete: bool
    created_at: datetime
    updated_at: datetime
    sync_status: str
    
    class Config:
        from_attributes = True


class UsersOverview(BaseModel):
    """Overview of all users and their activity"""
    total_users: int
    active_users: int
    inactive_users: int
    admin_users: int
    staff_users: int
    total_surveys: int
    users: List[UserStats]


# ============= API Endpoints =============

@router.get("/overview", response_model=UsersOverview)
async def get_users_overview(
    current_user: User = Depends(check_admin_role),
    db: Session = Depends(get_db)
):
    """
    Get overview of all users with their statistics (Admin only)
    
    Returns:
    - Total user counts by status and role
    - List of all users with their survey statistics
    """
    # Get all users with their panchayat info
    users = db.query(User).all()
    
    # Calculate statistics
    total_users = len(users)
    active_users = sum(1 for u in users if u.is_active)
    inactive_users = total_users - active_users
    admin_users = sum(1 for u in users if u.role == 'admin')
    staff_users = sum(1 for u in users if u.role == 'staff')
    
    # Get total surveys count
    total_surveys = db.query(func.count(Survey.survey_id)).scalar()
    
    # Build user statistics
    user_stats = []
    for user in users:
        # Get panchayat name
        panchayat_name = None
        if user.panchayat_id:
            panchayat = db.query(Panchayat).filter(
                Panchayat.panchayat_id == user.panchayat_id
            ).first()
            if panchayat:
                panchayat_name = panchayat.name
        
        # Get user's survey count and last survey date
        surveys_created = db.query(func.count(Survey.survey_id)).filter(
            Survey.user_id == user.user_id
        ).scalar()
        
        last_survey = db.query(Survey).filter(
            Survey.user_id == user.user_id
        ).order_by(desc(Survey.created_at)).first()
        
        last_survey_date = last_survey.created_at if last_survey else None
        
        user_stats.append(UserStats(
            user_id=user.user_id,
            username=user.username,
            full_name=user.full_name,
            email=user.email,
            role=user.role,
            panchayat_name=panchayat_name,
            is_active=user.is_active,
            surveys_created=surveys_created,
            last_survey_date=last_survey_date,
            created_at=user.created_at
        ))
    
    return UsersOverview(
        total_users=total_users,
        active_users=active_users,
        inactive_users=inactive_users,
        admin_users=admin_users,
        staff_users=staff_users,
        total_surveys=total_surveys,
        users=user_stats
    )


@router.get("/surveys", response_model=List[SurveyListItem])
async def get_all_surveys(
    current_user: User = Depends(check_admin_role),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    user_id: Optional[str] = None,
    search: Optional[str] = None
):
    """
    Get all surveys created by all users (Admin only)
    
    Query Parameters:
    - skip: Number of records to skip (pagination)
    - limit: Maximum number of records to return
    - user_id: Filter by specific user
    - search: Search in village name or creator name
    
    Returns list of surveys with creator information
    """
    # Base query with joins
    query = db.query(
        Survey,
        User.username,
        User.full_name,
        Panchayat.name.label('panchayat_name')
    ).join(
        User, Survey.user_id == User.user_id
    ).outerjoin(
        Panchayat, Survey.panchayat_id == Panchayat.panchayat_id
    )
    
    # Apply filters
    if user_id:
        query = query.filter(Survey.user_id == user_id)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Survey.village_name.ilike(search_pattern)) |
            (User.username.ilike(search_pattern)) |
            (User.full_name.ilike(search_pattern))
        )
    
    # Order by most recent first
    query = query.order_by(desc(Survey.updated_at))
    
    # Apply pagination
    results = query.offset(skip).limit(limit).all()
    
    # Build response
    surveys = []
    for survey, username, full_name, panchayat_name in results:
        surveys.append(SurveyListItem(
            survey_id=survey.survey_id,
            village_name=survey.village_name,
            created_by_username=username,
            created_by_fullname=full_name,
            panchayat_name=panchayat_name,
            completion_percentage=survey.completion_percentage,
            is_complete=survey.is_complete,
            created_at=survey.created_at,
            updated_at=survey.updated_at,
            sync_status=survey.sync_status
        ))
    
    return surveys


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_details(
    user_id: str,
    current_user: User = Depends(check_admin_role),
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific user (Admin only)
    """
    user = db.query(User).filter(User.user_id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.patch("/{user_id}/toggle-active")
async def toggle_user_active_status(
    user_id: str,
    current_user: User = Depends(check_admin_role),
    db: Session = Depends(get_db)
):
    """
    Toggle user active/inactive status (Admin only)
    """
    user = db.query(User).filter(User.user_id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.user_id == current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    
    return {
        "message": f"User {'activated' if user.is_active else 'deactivated'} successfully",
        "user_id": user.user_id,
        "is_active": user.is_active
    }


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(check_admin_role),
    db: Session = Depends(get_db)
):
    """
    Delete a user account (Admin only)
    
    Note: This will not delete the user's surveys, only unlink them
    """
    user = db.query(User).filter(User.user_id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.user_id == current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Get survey count before deletion
    survey_count = db.query(func.count(Survey.survey_id)).filter(
        Survey.user_id == user_id
    ).scalar()
    
    # Delete user
    db.delete(user)
    db.commit()
    
    return {
        "message": "User deleted successfully",
        "user_id": user_id,
        "surveys_retained": survey_count
    }
