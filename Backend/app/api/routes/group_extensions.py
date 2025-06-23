from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from pydantic import BaseModel
from app.services import group_extensions_service
from app.db.db import get_db
from prisma import Prisma
from prisma.models import group_extensions as GroupExtensionsModel
from prisma.models import extensions as ExtensionsModel

router = APIRouter()

# Pydantic model for creating a group
class GroupCreate(BaseModel):
    name: str
    description: str | None = None
    domain_id: str
    extension_ids: List[str] = []

# Pydantic model for updating a group
class GroupUpdate(BaseModel):
    name: str
    description: str | None = None
    is_active: bool
    extension_ids: List[str] = []

# Pydantic model for Extension response
class ExtensionResponse(BaseModel):
    extension_id: str
    extension_number: str
    class Config:
        orm_mode = True

# Pydantic model for Group response
class GroupResponse(BaseModel):
    group_id: str
    name: str
    description: str | None
    is_active: bool
    extensions: List[ExtensionResponse] = []
    class Config:
        orm_mode = True

@router.get("/{domain_id}", response_model=List[GroupResponse])
async def get_all_group_extensions(domain_id: str, db: Prisma = Depends(get_db)):
    """
    Get all group extensions for a specific domain.
    """
    groups = await group_extensions_service.get_group_extensions_by_domain(db, domain_id)
    return groups

@router.get("/available/{domain_id}", response_model=List[ExtensionResponse])
async def get_available_extensions(domain_id: str, db: Prisma = Depends(get_db)):
    """
    Get all available extensions for a specific domain that are not in any group.
    """
    extensions = await group_extensions_service.get_available_extensions_by_domain(db, domain_id)
    return extensions

@router.post("/", response_model=GroupResponse)
async def create_group(group_data: GroupCreate, db: Prisma = Depends(get_db)):
    """
    Create a new group extension.
    """
    new_group = await group_extensions_service.create_group_extension(
        db=db,
        name=group_data.name,
        description=group_data.description,
        domain_id=group_data.domain_id,
        extension_ids=group_data.extension_ids
    )
    if not new_group:
        raise HTTPException(status_code=400, detail="Could not create group extension.")
    return new_group

@router.put("/{group_id}", response_model=GroupResponse)
async def update_group(group_id: str, group_data: GroupUpdate, db: Prisma = Depends(get_db)):
    """
    Update a group extension.
    """
    updated_group = await group_extensions_service.update_group_extension(
        db=db,
        group_id=group_id,
        name=group_data.name,
        description=group_data.description,
        is_active=group_data.is_active,
        extension_ids=group_data.extension_ids
    )
    if not updated_group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found or could not be updated.")
    return updated_group

@router.delete("/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_group(group_id: str, db: Prisma = Depends(get_db)):
    """
    Delete a group extension.
    """
    success = await group_extensions_service.delete_group_extension(db, group_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found or could not be deleted.")
    return
