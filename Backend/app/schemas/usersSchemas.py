from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime

class LoginResponse(BaseModel):
    message: str
    user: str
    user_uuid:str
    permissions: str

class UserLoginCredentials(BaseModel):
    username: str
    password: str


class User(BaseModel):
    user_uuid: str
    domain_uuid: Optional[str] = None
    username: str
    user_email: str = ""  # กำหนดค่า default เป็นสตริงว่าง
    user_status: Optional[str] = None
    user_enabled: Optional[str] = None
    
class UserUpdate(BaseModel):
    username: str
    user_email: Optional[str] = None
    full_name: Optional[str] = None
    password: Optional[str] = None