from app.db.db import get_db
from fastapi import HTTPException


async def get_all_roles(skip: int = 0, limit: int = 100):
    print(f"all roles with skip: {skip}, limit: {limit}")
    try:
        async for db in get_db():
            # Note: Prisma uses 'take' for the limit
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
