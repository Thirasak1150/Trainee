from app.db.db import get_db
# Prisma will be used for DB access


async def get_all_menus_items():
    try:
        async for db in get_db():
            menus = await db.menu_items.find_many()
            print(menus)
            return menus
    except Exception as e:
        print(e)
        return {"error": str(e)}


async def get_menu_by_user_id(user_id: str):
    try:
        async for db in get_db():
            # ดึง role ของผู้ใช้
            user = await db.users.find_unique(
                where={"users_id": user_id},
                include={"roles": True}
            )
            if not user:
                return {"error": "User not found"}
            
            role_id = user.roles_id
            print("role_id", role_id)
            # ดึง menu_headers ที่ role นี้สามารถเข้าถึงได้
            menu_headers = await db.menu_headers.find_many(
                where={
                    "role_menus": {
                        "some": {
                            "roles_id": role_id
                        }
                    }
                },
                include={
                    "menu_items": {
                        "where": {
                            "role_menu_items": {
                                "some": {
                                    "roles_id": role_id
                                }
                            }
                        }
                    }
                }
            )

            return menu_headers

    except Exception as e:
        print(e)
        return {"error": str(e)}
