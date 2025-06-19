from app.db.db import get_db
from app.schemas.domainSchemas import Domain, DomainCreate, DomainUpdate
from fastapi import HTTPException
import uuid

# Prisma will be used for DB access


async def get_all_domains():
    try:
        async for db in get_db():
            domains = await db.domains.find_many(
                include={
                    "creator": True,
                    "manager": True
                }
            )
            print(domains)
            return domains
    except Exception as e:
        print(e)
        return {"error": str(e)}

async def create_domain(domain: DomainCreate):
    try:
        async for db in get_db():
            new_domain = await db.domains.create(
                data={
                    "domain_name": domain.domain_name,
                    "enable": domain.enable if hasattr(domain, 'enable') else True,
                    "created_by": domain.created_by if hasattr(domain, 'created_by') else None,
                    "updated_by": domain.updated_by if hasattr(domain, 'updated_by') else None,
                }
            )
            return new_domain
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Error creating domain: {str(e)}")

async def update_domain(domains_id: str, domain: DomainUpdate):
    try:
        async for db in get_db():
            update_data = domain.dict(exclude_unset=True)

            updated_domain = await db.domains.update(
                where={"domains_id": domains_id},
                data=update_data
            )
            if updated_domain is None:
                raise HTTPException(status_code=404, detail="Domain not found")
            return updated_domain
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Error updating domain: {str(e)}")

async def delete_domain(domains_id: str):
    try:
        async for db in get_db():
            deleted_domain = await db.domains.delete(where={"domains_id": domains_id})
            return {"message": f"Domain with ID {domains_id} deleted successfully."}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=404, detail="Domain not found")
