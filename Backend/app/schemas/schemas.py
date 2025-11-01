from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from datetime import datetime


# ============= User Schemas =============

class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: str = "staff"
    panchayat_id: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(UserBase):
    user_id: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_info: UserResponse
    panchayat_info: Optional[Dict[str, Any]] = None


class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[str] = None


# ============= Panchayat Schemas =============

class PanchayatBase(BaseModel):
    name: str
    block: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pin_code: Optional[str] = None
    contact_number: Optional[str] = None


class PanchayatCreate(PanchayatBase):
    panchayat_id: str


class PanchayatResponse(PanchayatBase):
    panchayat_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============= Survey Schemas =============

class SurveyBase(BaseModel):
    village_name: Optional[str] = None
    basic_info: Optional[Dict[str, Any]] = None
    infrastructure: Optional[Dict[str, Any]] = None
    sanitation: Optional[Dict[str, Any]] = None
    connectivity: Optional[Dict[str, Any]] = None
    land_forest: Optional[Dict[str, Any]] = None
    electricity: Optional[Dict[str, Any]] = None
    waste_management: Optional[Dict[str, Any]] = None
    completion_percentage: int = Field(default=0, ge=0, le=100)
    is_complete: bool = False


class SurveyCreate(SurveyBase):
    survey_id: str
    panchayat_id: str
    client_timestamp: Optional[datetime] = None


class SurveyUpdate(BaseModel):
    village_name: Optional[str] = None
    basic_info: Optional[Dict[str, Any]] = None
    infrastructure: Optional[Dict[str, Any]] = None
    sanitation: Optional[Dict[str, Any]] = None
    connectivity: Optional[Dict[str, Any]] = None
    land_forest: Optional[Dict[str, Any]] = None
    electricity: Optional[Dict[str, Any]] = None
    waste_management: Optional[Dict[str, Any]] = None
    completion_percentage: Optional[int] = Field(default=None, ge=0, le=100)
    is_complete: Optional[bool] = None
    client_timestamp: Optional[datetime] = None


class SurveyResponse(SurveyBase):
    survey_id: str
    panchayat_id: str
    user_id: str
    sync_status: str
    last_synced_at: Optional[datetime] = None
    version: int
    created_at: datetime
    updated_at: datetime
    server_timestamp: datetime
    
    class Config:
        from_attributes = True


# ============= Conflict Resolution Schemas =============

class ConflictField(BaseModel):
    field_name: str
    server_value: Any
    client_value: Any
    server_timestamp: datetime
    client_timestamp: datetime


class ConflictResponse(BaseModel):
    status: str = "conflict"
    survey_id: str
    conflicts: list[ConflictField]
    message: str = "Data conflict detected. Please resolve manually."


class ConflictResolution(BaseModel):
    survey_id: str
    resolution: str  # "server_wins", "client_wins", "manual"
    manual_data: Optional[Dict[str, Any]] = None


# ============= Sync Schemas =============

class SyncRequest(BaseModel):
    surveys: list[SurveyCreate]


class SyncResponse(BaseModel):
    status: str
    synced_count: int
    failed_count: int
    conflicts: list[str] = []
    message: str


# ============= Schema Management =============

class FormSchemaBase(BaseModel):
    module_name: str
    version: str = "1.0"
    schema_json: Dict[str, Any]
    is_active: bool = True


class FormSchemaCreate(FormSchemaBase):
    schema_id: str


class FormSchemaResponse(FormSchemaBase):
    schema_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
