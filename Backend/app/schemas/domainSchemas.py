from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime




class Domain(BaseModel):
    domains_id: str = Field(..., alias='domains_id')
    domain_name: str
    enable: bool
    created_at: datetime
    created_by: Optional[str] = None
    updated_at: datetime
    updated_by: Optional[str] = None

    class Config:
        orm_mode = True
        populate_by_name = True

class DomainCreate(BaseModel):
    domain_name: str
    enable: bool = True
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    
    class Config:
        orm_mode = True

class DomainUpdate(BaseModel):
    domain_name: str
    enable: bool
    updated_by: Optional[str] = None
    created_by: Optional[str] = None
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
