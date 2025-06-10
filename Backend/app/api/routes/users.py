from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from app.services.users_service import get_all_users, get_user_by_username,User, login_for_access_token
from app.schemas.usersSchemas import UserLoginCredentials, LoginResponse
router = APIRouter()
@router.get("/")
async def read_users(skip: int = 0, limit: int = 100):
    """
    ดึงข้อมูลผู้ใช้ทั้งหมด
    """
    users = await get_all_users()
    return users


# Endpoint สำหรับดึงข้อมูลผู้ใช้ตาม username
@router.get("/{username}", response_model=User)
async def Get_user_by_username(username: str):
    return await get_user_by_username(username)


# @router.post("/", response_model=User)
# async def create_user(user: UserCreate):
#     return await create_user(user)

@router.post("/login", response_model=LoginResponse)
async def Login_for_access_token(credentials: UserLoginCredentials):
    print("ddddddddddddddddddd")
    return await login_for_access_token(credentials)
