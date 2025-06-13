from app.db.db import get_db
from fastapi import HTTPException


async def get_all_roles(skip: int = 0, limit: int = 100):
    print(f"all roles with skip: {skip}, limit: {limit}")
    try:
        async for db in get_db():
            roles = await db.roles.find_many(
                skip=skip,
                take=limit
            )
            if not roles:
                return {"error": "Roles not found"}
            roles_list = []
            for role in roles:
                print("roles", role)
                roles_list.append({"roles_id": role.roles_id,
                "name": role.name,
                "description": role.description})
            return roles_list
        # TODO: Remove psycopg2 code after full Prisma migration
    except Exception as e:
        print(e)
        return {"error": str(e)}


async def create_role(name: str, description: str | None = None):
    try:
        async for db in get_db():
            # Check if role with the same name already exists
            existing_role = await db.roles.find_unique(where={"name": name})
            if existing_role:
                raise HTTPException(
                    status_code=400, detail="Role with this name already exists")

            new_role = await db.roles.create(
                data={
                    "name": name,
                    "description": description
                }
            )
            return {"roles_id": new_role.roles_id, "name": new_role.name, "description": new_role.description}
    except HTTPException as http_exc:
        raise http_exc  # Re-raise HTTPException
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


async def update_role(role_id: str, name: str, description: str | None = None):
    try:
        async for db in get_db():
            # Check if the role exists
            role_to_update = await db.roles.find_unique(where={"roles_id": role_id})
            if not role_to_update:
                raise HTTPException(status_code=404, detail="Role not found")

            # Check if another role with the same name already exists
            if name != role_to_update.name:
                existing_role = await db.roles.find_unique(where={"name": name})
                if existing_role:
                    raise HTTPException(
                        status_code=400, detail="Another role with this name already exists")

            updated_role = await db.roles.update(
                where={"roles_id": role_id},
                data={
                    "name": name,
                    "description": description
                }
            )
            return {"roles_id": updated_role.roles_id, "name": updated_role.name, "description": updated_role.description}
    except HTTPException as http_exc:
        raise http_exc  # Re-raise HTTPException
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


async def delete_role(role_id: str):
    try:
        async for db in get_db():
            # Check if the role exists
            role_to_delete = await db.roles.find_unique(where={"roles_id": role_id})
            if not role_to_delete:
                raise HTTPException(status_code=404, detail="Role not found")

            # Check for related users before deleting
            related_users = await db.users.find_many(where={"roles_id": role_id})
            if related_users:
                raise HTTPException(
                    status_code=400, detail="Cannot delete role. It is currently assigned to one or more users.")

            await db.roles.delete(where={"roles_id": role_id})
            return {"message": "Role deleted successfully"}
    except HTTPException as http_exc:
        raise http_exc  # Re-raise HTTPException
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
