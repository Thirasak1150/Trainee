from app.db.db import get_db
from fastapi import HTTPException
from app.schemas import trunkSchemas

async def get_all_trunks(domain_id: str):
    try:
        async for db in get_db():
            trunks = await db.trunks.find_many(
                where={"domain_id": domain_id}
            )
            if not trunks:
                raise HTTPException(status_code=404, detail="Trunks not found")
            print(trunks)
            return trunks
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_all_trunks: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def create_trunk(trunk: trunkSchemas.TrunkCreate):
    try:
        async for db in get_db():
            new_trunk = await db.trunks.create(
                data=trunk.dict()
            )
            return new_trunk
    except Exception as e:
        print(f"Error in create_trunk: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def get_trunk_by_id(trunk_id: str):
    try:
        async for db in get_db():
            trunk = await db.trunks.find_unique(where={"trunk_id": trunk_id})
            if not trunk:
                raise HTTPException(status_code=404, detail="Trunk not found")
            return trunk
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_trunk_by_id: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def update_trunk(trunk_id: str, trunk_update: trunkSchemas.TrunkUpdate):
    try:
        async for db in get_db():
            updated_trunk = await db.trunks.update(
                where={"trunk_id": trunk_id},
                data=trunk_update.dict(exclude_unset=True)
            )
            if not updated_trunk:
                raise HTTPException(status_code=404, detail="Trunk not found")
            return updated_trunk
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in update_trunk: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def delete_trunk(trunk_id: str):
    try:
        async for db in get_db():
            deleted_trunk = await db.trunks.delete(
                where={"trunk_id": trunk_id}
            )
            if not deleted_trunk:
                raise HTTPException(status_code=404, detail="Trunk not found")
            return deleted_trunk
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in delete_trunk: {e}")
        raise HTTPException(status_code=500, detail=str(e))