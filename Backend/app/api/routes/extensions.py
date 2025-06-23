from fastapi import APIRouter, Depends
from typing import List
from pydantic import BaseModel
from app.services import group_extensions_service
from app.db.db import get_db
from prisma import Prisma

router = APIRouter()

# Pydantic model for Extension response
class ExtensionResponse(BaseModel):
    extension_id: str
    extension_number: str
    class Config:
        orm_mode = True

@router.get("/extensions/available/{domain_id}", response_model=List[ExtensionResponse])
async def get_available_extensions(domain_id: str, db: Prisma = Depends(get_db)):
    """
    Get all available extensions for a specific domain that are not in any group.
    """
    extensions = await group_extensions_service.get_available_extensions_by_domain(db, domain_id)
    return extensions
from app.schemas import extensionSchemas
from app.services import extension_service

router = APIRouter()

@router.get("/extensions/domains")
async def get_all_domains(db: Prisma = Depends(get_db)):
    """Retrieve all active domains."""
    return await extension_service.get_all_domains(db)

@router.get("/extensions/domain/{domain_id}", response_model=List[extensionSchemas.Extension])
async def get_extensions_by_domain(domain_id: str, db: Prisma = Depends(get_db)):
    """Retrieve all extensions for a specific domain."""
    return await extension_service.get_extensions_by_domain(db, domain_id)


@router.get("/extensions", response_model=List[extensionSchemas.Extension])
async def read_extensions(db: Prisma = Depends(get_db)):
    """Retrieve all extensions."""
    return await extension_service.get_all_extensions(db)

@router.post("/extensions", response_model=extensionSchemas.Extension)
async def create_extension(extension: extensionSchemas.ExtensionCreate, db: Prisma = Depends(get_db)):
    """Create a new extension."""
    new_extension = await extension_service.create_extension(db, extension)
    # Fetch the newly created extension with its domain to match the response_model
    return await extension_service.get_extension_by_id(db, new_extension.extension_id)

@router.put("/extensions/{extension_id}")
async def update_extension(extension_id: str, extension: extensionSchemas.ExtensionUpdate, db: Prisma = Depends(get_db)):
    """Update an existing extension."""
    updated_extension = await extension_service.update_extension(db, extension_id, extension)
    # Fetch the updated extension with its domain to match the response_model
    return await extension_service.get_extensions_by_domain(db, updated_extension.domain_id)


@router.delete("/extensions/{extension_id}")
async def delete_extension(extension_id: str, db: Prisma = Depends(get_db)):
    """Delete an extension."""
    await extension_service.delete_extension(db, extension_id)
    return