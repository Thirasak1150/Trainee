from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas import extensionSchemas
from app.services import extension_service
from app.schemas.domainSchemas import Domain

router = APIRouter()

@router.get("/extensions/domains")
async def get_all_domains():
    """Retrieve all active domains."""
    return await extension_service.get_all_domains()

@router.get("/extensions/domain/{domain_id}")
async def get_extensions_by_domain(domain_id: str):
    """Retrieve all extensions for a specific domain."""
    return await extension_service.get_extensions_by_domain(domain_id)

@router.post("/extensions", )
async def create_extension(extension: extensionSchemas.ExtensionCreate):
    """Create a new extension."""

    return await extension_service.create_extension(extension)
    # print("new_extension", new_extension)
    # # After creating, fetch it again to include the related domain object for the response
    # return await extension_service.get_extensions_by_domain(new_extension.domain_id)

@router.put("/extensions/{extension_id}", )
async def Update_extension(extension_id: str, extension: extensionSchemas.ExtensionUpdate):
    """Update an existing extension."""
    print("extension text", extension)
    print("extension_id", extension_id)
    return await extension_service.update_extension(extension_id, extension)
    # if not updated_extension:
    #     raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Extension not found")
    # # After updating, fetch it again to include the related domain object for the response
    # return await extension_service.get_extensions_by_domain(updated_extension.domain_id)


@router.delete("/extensions/{extension_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Extensions"])
async def delete_extension(extension_id: str):
    """Delete an extension."""
    deleted_extension = await extension_service.delete_extension(extension_id)
    if not deleted_extension:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Extension not found")
    return