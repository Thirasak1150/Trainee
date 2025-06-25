from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.services import trunk_service
from app.schemas import trunkSchemas
from typing import List
router = APIRouter()

@router.get("/domain/{domain_id}", response_model=List[trunkSchemas.TrunkInDB])
async def read_trunks_by_domain(domain_id: str):
    """
    Get all trunks for a specific domain.
    """
    trunks = await trunk_service.get_all_trunks(domain_id)
    if not trunks:
        return []
    return trunks

@router.post("/", response_model=trunkSchemas.TrunkInDB, status_code=status.HTTP_201_CREATED)
async def create_new_trunk(trunk: trunkSchemas.TrunkCreate):
    """
    Create a new trunk.
    """
    return await trunk_service.create_trunk(trunk)

@router.get("/{trunk_id}", response_model=trunkSchemas.TrunkInDB)
async def read_trunk_by_id(trunk_id: str):
    """
    Get a single trunk by its ID.
    """
    trunk = await trunk_service.get_trunk_by_id(trunk_id)
    if not trunk:
        raise HTTPException(status_code=404, detail="Trunk not found")
    return trunk

@router.put("/{trunk_id}", response_model=trunkSchemas.TrunkInDB)
async def update_existing_trunk(trunk_id: str, trunk_update: trunkSchemas.TrunkUpdate):
    """
    Update a trunk.
    """
    updated_trunk = await trunk_service.update_trunk(trunk_id, trunk_update)
    if not updated_trunk:
        raise HTTPException(status_code=404, detail="Trunk not found")
    return updated_trunk

@router.delete("/{trunk_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_trunk(trunk_id: str):
    """
    Delete a trunk.
    """
    deleted_trunk = await trunk_service.delete_trunk(trunk_id)
    if not deleted_trunk:
        raise HTTPException(status_code=404, detail="Trunk not found")
    return
