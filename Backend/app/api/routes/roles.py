from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from app.services.role_service import get_all_roles
from typing import Dict
router = APIRouter()


@router.get("/")
async def read_roles(skip: int = 0, limit: int = 100):
    """
    ดึงข้อมูลผู้ใช้ทั้งหมด
    """
    roles = await get_all_roles(skip=skip, limit=limit)
    return roles
