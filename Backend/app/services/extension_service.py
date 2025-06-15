from fastapi import HTTPException, status
from app.db.db import get_db
from app.schemas import extensionSchemas
from prisma.models import extensions, domains

async def get_all_domains():
    async for db in get_db():
        try:
            all_domains = await db.domains.find_many(where={'enable': True})
            return all_domains
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

async def get_extensions_by_domain(domain_id: str):
    async for db in get_db():
        try:
            domain_extensions = await db.extensions.find_many(
                where={'domain_id': domain_id},
                include={'domain': True}
            )
            print("domain_extensions", domain_extensions)
            return domain_extensions
        except Exception as e:
            print("error", e)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

async def create_extension(extension_data: extensionSchemas.ExtensionCreate):
    print("extension_data", extension_data)
    async for db in get_db():
        try:
            print("dbextension_dataextension_data", extension_data)
            new_extension = await db.extensions.create(
                data=extension_data.dict()
            )
            print("new_extensionnnnnnnnnnnnnnnnnnnnnnnn", new_extension)
            return new_extension
        except HTTPException as e:
            raise e

async def update_extension(extension_id: str, extension_data: extensionSchemas.ExtensionUpdate):
    async for db in get_db():
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

async def delete_extension(extension_id: str):
    async for db in get_db():
        try:
            deleted_extension = await db.extensions.delete(
                where={'extension_id': extension_id}
            )
            if not deleted_extension:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Extension not found")
            return deleted_extension
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))