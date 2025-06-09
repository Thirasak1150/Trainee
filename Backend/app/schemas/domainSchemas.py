from pydantic import BaseModel, Field, EmailStr, UUID4
from typing import Optional, List
from datetime import datetime




class Domain(BaseModel):
    domain_uuid: str
    domain_parent_uuid: Optional[str] = None
    domain_name: str
    domain_enabled: Optional[bool] = None       # เปลี่ยน str → bool
    domain_description: Optional[str] = None
    insert_date: Optional[datetime] = None      # เปลี่ยน str → datetime
    insert_user: Optional[str] = None
    update_date: Optional[datetime] = None      # เปลี่ยน str → datetime
    update_user: Optional[str] = None

class DomainCreate(BaseModel):
    domain_name: str
    domain_enabled: bool = False
    domain_description: Optional[str] = None

    class Config:
        orm_mode = True

class DomainUpdate(BaseModel):
    domain_name: str
    domain_enabled: bool
    domain_description: Optional[str] = None

    class Config:
        orm_mode = True

# CREATE TABLE public.v_domains (
#     domain_uuid uuid NOT NULL,
#     domain_parent_uuid uuid,
#     domain_name text,
#     domain_enabled boolean,
#     domain_description text,
#     insert_date timestamp with time zone,
#     insert_user uuid,
#     update_date timestamp with time zone,
#     update_user uuid
# );
