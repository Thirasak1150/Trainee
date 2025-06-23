from fastapi import HTTPException, status
from prisma.models import extensions

async def get_extension_by_id(db: "Prisma", extension_id: str) -> extensions:
    """Get a single extension by its ID."""
    extension = await db.extensions.find_unique(
        where={"extension_id": extension_id},
        include={"domain": True}
    )
    if not extension:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Extension with id {extension_id} not found",
        )
    return extension
from prisma.models import extensions

async def get_extension_by_id(db: "Prisma", extension_id: str) -> extensions:
    """Get a single extension by its ID."""
    extension = await db.extensions.find_unique(
        where={"extension_id": extension_id},
        include={"domain": True}
    )
    if not extension:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Extension with id {extension_id} not found",
        )
    return extension
from prisma import Prisma
from app.schemas import extensionSchemas

async def get_all_domains(db: Prisma):
    try:
        all_domains = await db.domains.find_many(where={'enable': True})
        return all_domains
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

async def get_extensions_by_domain(db: Prisma, domain_id: str):
    try:
        domain_extensions = await db.extensions.find_many(
            where={'domain_id': domain_id},
            include={'domain': True}
        )
        return domain_extensions
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

async def create_extension(db: Prisma, extension_data: extensionSchemas.ExtensionCreate):
    try:
        new_extension = await db.extensions.create(
            data=extension_data.dict()
        )
        return new_extension
    except Exception as e:
        # Catch potential Prisma-specific errors if needed, e.g., unique constraint violations
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

async def update_extension(db: Prisma, extension_id: str, extension_data: extensionSchemas.ExtensionUpdate):
    try:
        updated_extension = await db.extensions.update(
            where={'extension_id': extension_id},
            data=extension_data.dict(exclude_unset=True)
        )
        if not updated_extension:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Extension not found")
        return updated_extension
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

async def delete_extension(db: Prisma, extension_id: str):
    try:
        # First, check if the extension exists
        existing_extension = await db.extensions.find_unique(where={'extension_id': extension_id})
        if not existing_extension:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Extension not found")
        
        deleted_extension = await db.extensions.delete(
            where={'extension_id': extension_id}
        )
        return deleted_extension
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

async def get_all_extensions(db: Prisma):
    """Retrieve all extensions with their domain information."""
    try:
        all_extensions = await db.extensions.find_many(
            include={'domain': True},
         
        )
        return all_extensions
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))