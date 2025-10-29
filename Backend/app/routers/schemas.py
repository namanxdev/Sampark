from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..database import get_db
from ..models.models import FormSchema
from ..schemas.schemas import FormSchemaCreate, FormSchemaResponse
from ..utils.dependencies import get_current_user, check_admin_role, User

router = APIRouter(prefix="/api/schemas", tags=["Form Schemas"])


@router.get("", response_model=dict)
async def get_all_schemas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all active form schemas
    
    Returns schemas grouped by module name
    """
    schemas = db.query(FormSchema).filter(FormSchema.is_active == True).all()
    
    # Group schemas by module name
    schemas_dict = {}
    for schema in schemas:
        schemas_dict[schema.module_name] = {
            "schema_id": schema.schema_id,
            "version": schema.version,
            "schema": schema.schema_json,
            "updated_at": schema.updated_at.isoformat()
        }
    
    return {
        "schemas": schemas_dict,
        "version": "1.0",  # Overall schema version
        "last_updated": max([s.updated_at for s in schemas]).isoformat() if schemas else None
    }


@router.get("/{module_name}", response_model=FormSchemaResponse)
async def get_schema_by_module(
    module_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get schema for a specific module (e.g., basic_info, infrastructure)"""
    schema = db.query(FormSchema).filter(
        FormSchema.module_name == module_name,
        FormSchema.is_active == True
    ).first()
    
    if not schema:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Schema for module '{module_name}' not found"
        )
    
    return schema


@router.post("", response_model=FormSchemaResponse, status_code=status.HTTP_201_CREATED)
async def create_schema(
    schema: FormSchemaCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(check_admin_role)
):
    """
    Create a new form schema (admin only)
    
    This allows adding new survey modules dynamically
    """
    # Check if schema with same ID exists
    existing = db.query(FormSchema).filter(
        FormSchema.schema_id == schema.schema_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Schema with this ID already exists"
        )
    
    db_schema = FormSchema(**schema.dict())
    db.add(db_schema)
    db.commit()
    db.refresh(db_schema)
    
    return db_schema


@router.put("/{schema_id}", response_model=FormSchemaResponse)
async def update_schema(
    schema_id: str,
    schema_update: FormSchemaCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(check_admin_role)
):
    """Update an existing schema (admin only)"""
    db_schema = db.query(FormSchema).filter(FormSchema.schema_id == schema_id).first()
    
    if not db_schema:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schema not found"
        )
    
    # Update fields
    for field, value in schema_update.dict().items():
        setattr(db_schema, field, value)
    
    db_schema.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_schema)
    
    return db_schema


@router.delete("/{schema_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_schema(
    schema_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(check_admin_role)
):
    """Deactivate a schema (admin only) - soft delete"""
    schema = db.query(FormSchema).filter(FormSchema.schema_id == schema_id).first()
    
    if not schema:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schema not found"
        )
    
    schema.is_active = False
    db.commit()
    
    return None
