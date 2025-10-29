from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class User(Base):
    """User model for Panchayat staff authentication"""
    __tablename__ = "users"
    
    user_id = Column(String(50), primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(String(50), default="staff")  # staff, admin, block_officer
    panchayat_id = Column(String(50), ForeignKey("panchayats.panchayat_id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    panchayat = relationship("Panchayat", back_populates="users")
    surveys = relationship("Survey", back_populates="user")


class Panchayat(Base):
    """Panchayat (Village Council) model"""
    __tablename__ = "panchayats"
    
    panchayat_id = Column(String(50), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    block = Column(String(255))
    district = Column(String(255))
    state = Column(String(100))
    pin_code = Column(String(10))
    contact_number = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    users = relationship("User", back_populates="panchayat")
    surveys = relationship("Survey", back_populates="panchayat")


class Survey(Base):
    """Survey model - stores all collected data"""
    __tablename__ = "surveys"
    
    survey_id = Column(String(50), primary_key=True, index=True)
    panchayat_id = Column(String(50), ForeignKey("panchayats.panchayat_id"), nullable=False)
    user_id = Column(String(50), ForeignKey("users.user_id"), nullable=False)
    village_name = Column(String(255))
    
    # Module data stored as JSONB for flexibility
    basic_info = Column(JSONB)
    infrastructure = Column(JSONB)
    sanitation = Column(JSONB)
    connectivity = Column(JSONB)
    land_forest = Column(JSONB)
    electricity = Column(JSONB)
    waste_management = Column(JSONB)
    
    # Completion tracking
    completion_percentage = Column(Integer, default=0)
    is_complete = Column(Boolean, default=False)
    
    # Sync tracking
    sync_status = Column(String(20), default="pending")  # pending, synced, conflict, failed
    last_synced_at = Column(DateTime)
    version = Column(Integer, default=1)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    client_timestamp = Column(DateTime)
    server_timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    panchayat = relationship("Panchayat", back_populates="surveys")
    user = relationship("User", back_populates="surveys")
    sync_logs = relationship("SyncLog", back_populates="survey")


class SyncLog(Base):
    """Log of all sync operations for debugging and audit"""
    __tablename__ = "sync_logs"
    
    log_id = Column(Integer, primary_key=True, index=True)
    survey_id = Column(String(50), ForeignKey("surveys.survey_id"), nullable=False)
    user_id = Column(String(50), ForeignKey("users.user_id"), nullable=False)
    
    operation = Column(String(20))  # create, update, conflict
    status = Column(String(20))  # success, failed, conflict
    
    # Conflict details
    conflicts = Column(JSONB)  # Store conflict details if any
    resolution = Column(String(50))  # server_wins, client_wins, manual
    
    # Error tracking
    error_message = Column(Text)
    retry_count = Column(Integer, default=0)
    
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    survey = relationship("Survey", back_populates="sync_logs")


class FormSchema(Base):
    """Schema definitions for different survey modules"""
    __tablename__ = "form_schemas"
    
    schema_id = Column(String(50), primary_key=True, index=True)
    module_name = Column(String(100), nullable=False)  # basic_info, infrastructure, etc.
    version = Column(String(20), default="1.0")
    schema_json = Column(JSONB, nullable=False)  # The actual JSON schema
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
