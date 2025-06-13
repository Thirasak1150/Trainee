from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict
from app.services.menu_service import (
    get_all_menus_items, 
    get_menu_by_user_id, 
    get_menu_by_role,
    update_role_menu_access,
    update_role_menu_item_access,
    update_menu_header_name,
    update_menu_item_name,
    reset_all_menu_names
)
from pydantic import BaseModel

class NameUpdateRequest(BaseModel):
    name: str

router = APIRouter()


@router.get("/")
async def read_menus(skip: int = 0, limit: int = 100):
    """
    ดึงข้อมูลเมนูทั้งหมด
    """
    menus = await get_all_menus_items()
    return menus

@router.get("/{user_id}")
async def get_menu_by_user_id_endpoint(user_id: str):
    """
    ดึงข้อมูลเมนูตาม user_id
    """
    return await get_menu_by_user_id(user_id)


@router.get("/role/{role_id}")
async def get_menu_by_role_endpoint(role_id: str):
    """
    ดึงข้อมูลเมนูตาม role_id
    """
    return await get_menu_by_role(role_id)

@router.put("/header/{role_id}/{menu_header_id}")
async def update_menu_header_access_endpoint(role_id: str, menu_header_id: str, enable: bool):
    """
    อัปเดตสิทธิ์การเข้าถึง Menu Header สำหรับ Role
    """
    try:
        result = await update_role_menu_access(role_id, menu_header_id, enable)
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.put("/item/{role_id}/{menu_item_id}")
async def update_menu_item_access_endpoint(role_id: str, menu_item_id: str, enable: bool):
    """
    อัปเดตสิทธิ์การเข้าถึง Menu Item สำหรับ Role
    """
    try:
        result = await update_role_menu_item_access(role_id, menu_item_id, enable)
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.put("/name/header/{menu_header_id}")
async def update_menu_header_name_endpoint(menu_header_id: str, request: NameUpdateRequest):
    """
    Update the custom name of a Menu Header.
    """
    try:
        result = await update_menu_header_name(menu_header_id, request.name)
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.put("/name/item/{menu_item_id}")
async def update_menu_item_name_endpoint(menu_item_id: str, request: NameUpdateRequest):
    """
    Update the custom name of a Menu Item.
    """
    try:
        result = await update_menu_item_name(menu_item_id, request.name)
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/reset-names")
async def reset_all_menu_names_endpoint():
    """
    Reset all custom menu names to their default values.
    """
    try:
        result = await reset_all_menu_names()
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
