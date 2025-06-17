from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Body
from app.services.role_service import get_all_roles, create_role, delete_role, update_role
from typing import Dict
router = APIRouter()


@router.get("/")
async def read_roles(skip: int = 0, limit: int = 100):
    """
    ดึงข้อมูลผู้ใช้ทั้งหมด
    """
    roles = await get_all_roles(skip=skip, limit=limit)
    print("roles", roles)
    return roles


@router.post("/")
async def new_role(payload: Dict = Body(...)):
    """
    สร้าง role ใหม่
    """
    try:
        name = payload.get("name")
        description = payload.get("description")
        if not name:
            raise HTTPException(status_code=400, detail="Role name is required")
        role = await create_role(name=name, description=description)
        return role
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{role_id}")
async def edit_role(role_id: str, payload: Dict = Body(...)):
    """
    แก้ไข role
    """
    try:
        name = payload.get("name")
        description = payload.get("description")
        if not name:
            raise HTTPException(status_code=400, detail="Role name is required")
        role = await update_role(role_id=role_id, name=name, description=description)
        return role
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{role_id}")
async def remove_role(role_id: str):
    """
    ลบ role
    """
    try:
        result = await delete_role(role_id=role_id)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
