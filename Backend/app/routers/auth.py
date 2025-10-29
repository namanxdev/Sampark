from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import uuid

from ..database import get_db
from ..models.models import User, Panchayat
from ..schemas.schemas import UserCreate, UserResponse, Token, UserLogin
from ..utils.security import verify_password, get_password_hash, create_access_token
from ..utils.dependencies import get_current_user, check_admin_role
from ..config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(check_admin_role)  # Only admins can register users
):
    """
    Register a new user (admin only)
    """
    # Check if username already exists
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    if user.email:
        existing_email = db.query(User).filter(User.email == user.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Create new user
    user_id = f"USER_{uuid.uuid4().hex[:12].upper()}"
    hashed_password = get_password_hash(user.password)
    
    db_user = User(
        user_id=user_id,
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        role=user.role,
        panchayat_id=user.panchayat_id
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login endpoint - returns JWT token
    
    Use username and password to get access token
    """
    # Find user by username
    user = db.query(User).filter(User.username == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.user_id},
        expires_delta=access_token_expires
    )
    
    # Get panchayat info if exists
    panchayat_info = None
    if user.panchayat_id:
        panchayat = db.query(Panchayat).filter(
            Panchayat.panchayat_id == user.panchayat_id
        ).first()
        if panchayat:
            panchayat_info = {
                "panchayat_id": panchayat.panchayat_id,
                "name": panchayat.name,
                "block": panchayat.block,
                "district": panchayat.district,
                "state": panchayat.state
            }
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_info": user,
        "panchayat_info": panchayat_info
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current logged-in user information
    """
    return current_user


@router.post("/logout")
async def logout():
    """
    Logout endpoint (token invalidation handled on client side)
    """
    return {"message": "Successfully logged out"}
