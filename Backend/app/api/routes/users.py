from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from app.services.users_service import get_all_users, get_user_by_username, create_user, update_user, delete_user, login_for_access_token
from app.schemas.usersSchemas import UserLoginCredentials, LoginResponse
from typing import Dict

router = APIRouter()

@router.get("/")
async def read_users(skip: int = 0, limit: int = 100):
    """
    ดึงข้อมูลผู้ใช้ทั้งหมด
    """
    users = await get_all_users()
    return users


# Endpoint สำหรับดึงข้อมูลผู้ใช้ตาม username
@router.get("/{username}")
async def Get_user_by_username(username: str):
    return await get_user_by_username(username)


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_new_user(user_data: Dict):
    """
    สร้างผู้ใช้ใหม่
    """
    print(user_data)
    return await create_user(user_data)


@router.put("/{user_uuid}")
async def update_existing_user(user_uuid: str, user_data: Dict):
    """
    อัปเดตข้อมูลผู้ใช้
    """
    return await update_user(user_uuid, user_data)


@router.delete("/{user_uuid}", status_code=status.HTTP_200_OK)
async def delete_existing_user(user_uuid: str):
    """
    ลบผู้ใช้
    """
    return await delete_user(user_uuid)


@router.post("/login", response_model=LoginResponse)
async def Login_for_access_token(credentials: UserLoginCredentials):
    print("ddddddddddddddddddd")
    return await login_for_access_token(credentials)
