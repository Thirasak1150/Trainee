from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import Dict
from app.services.menu_service import get_all_menus_items, get_menu_by_user_id

router = APIRouter()


@router.get("/")
async def read_menus(skip: int = 0, limit: int = 100):
    """
    ดึงข้อมูลเมนูทั้งหมด
    """
    menus = await get_all_menus_items()
    return menus

@router.get("/{user_id}")
async def Get_menu_by_user_id(user_id: str):
    print("user_id", user_id)
    """
    ดึงข้อมูลเมนูตาม user_id
    """
    return await get_menu_by_user_id(user_id)