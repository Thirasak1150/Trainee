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
                order=[
                    {
                        "order_index": "asc"
                    }
                ],
                include={
                    "menu_items": {
                        "where": {
                            "role_menu_items": {
                                "some": {
                                    "roles_id": role_id
                                }
                            }
                        },
                     
                    }
                }
                
            )
            for header in menu_headers:
                if header.menu_items:
                    header.menu_items.sort(
                        key=lambda item: item.order_index if item.order_index is not None else float('inf')
                    )
            return menu_headers

    except Exception as e:
        print(e)
        return {"error": str(e)}




async def get_menu_by_role(role_id: str):
    """
    ดึงเมนูทั้งหมด พร้อมสถานะการเข้าถึงสำหรับ role ที่ระบุ
    """
    print(f"Fetching all menus with status for role_id: {role_id}")
    try:
        async for db in get_db():
            all_headers = await db.menu_headers.find_many(
                include={
                    "menu_items": {
                        "include": {
                            "role_menu_items": {
                                "where": {
                                    "roles_id": role_id
                                }
                            }
                        }
                    },
                    "role_menus": {
                        "where": {
                            "roles_id": role_id
                        }
                    }
                }
            )

            # Sort headers by order_index
            all_headers.sort(key=lambda h: h.order_index if h.order_index is not None else float('inf'))

            # Sort menu_items within each header by order_index
            for header in all_headers:
                if header.menu_items:
                    header.menu_items.sort(key=lambda i: i.order_index if i.order_index is not None else float('inf'))

            return all_headers
    except Exception as e:
        print(e)
        return {"error": str(e)}

async def update_role_menu_access(role_id: str, menu_header_id: str, enable: bool):
    """
    อัปเดตสิทธิ์การเข้าถึง Menu Header สำหรับ Role ที่ระบุ
    """
    try:
        async for db in get_db():
            if enable:
                # เพิ่มสิทธิ์
                await db.role_menus.create(
                    data={
                        'roles_id': role_id,
                        'menu_headers_id': menu_header_id
                    }
                )
                return {"message": f"Access granted for header {menu_header_id} to role {role_id}"}
            else:
                # ลบสิทธิ์
                await db.role_menus.delete_many(
                    where={
                        'roles_id': role_id,
                        'menu_headers_id': menu_header_id
                    }
                )
                return {"message": f"Access revoked for header {menu_header_id} from role {role_id}"}
    except Exception as e:
        print(f"Error updating role menu access: {e}")
        raise e

async def update_role_menu_item_access(role_id: str, menu_item_id: str, enable: bool):
    """
    อัปเดตสิทธิ์การเข้าถึง Menu Item สำหรับ Role ที่ระบุ
    """
    try:
        async for db in get_db():
            if enable:
                # เพิ่มสิทธิ์
                await db.role_menu_items.create(
                    data={
                        'roles_id': role_id,
                        'menu_items_id': menu_item_id
                    }
                )
                return {"message": f"Access granted for item {menu_item_id} to role {role_id}"}
            else:
                # ลบสิทธิ์
                await db.role_menu_items.delete_many(
                    where={
                        'roles_id': role_id,
                        'menu_items_id': menu_item_id
                    }
                )
                return {"message": f"Access revoked for item {menu_item_id} from role {role_id}"}
    except Exception as e:
        print(f"Error updating role menu item access: {e}")
        raise e


async def update_menu_header_name(menu_header_id: str, new_name: str):
    """
    Updates the custom name for a specific Menu Header.
    """
    try:
        async for db in get_db():
            await db.menu_headers.update(
                where={'menu_headers_id': menu_header_id},
                data={'name_custom': new_name}
            )
            return {"message": f"Menu header {menu_header_id} name updated successfully."}
    except Exception as e:
        print(f"Error updating menu header name: {e}")
        raise e

async def update_menu_item_name(menu_item_id: str, new_name: str):
    """
    Updates the custom name for a specific Menu Item.
    """
    try:
        async for db in get_db():
            await db.menu_items.update(
                where={'menu_items_id': menu_item_id},
                data={'name_custom': new_name}
            )
            return {"message": f"Menu item {menu_item_id} name updated successfully."}
    except Exception as e:
        print(f"Error updating menu item name: {e}")
        raise e

async def reset_all_menu_names():
    """
    Resets all custom menu names to null for both headers and items within a transaction.
    """
    try:
        async for db in get_db():
            async with db.tx() as transaction:
                await transaction.menu_headers.update_many(
                    data={'name_custom': None},
                    where={}
                )
                await transaction.menu_items.update_many(
                    data={'name_custom': None},
                    where={}
                )
            return {"message": "All custom menu names have been reset."}
    except Exception as e:
        print(f"Error resetting all menu names: {e}")
        raise e

