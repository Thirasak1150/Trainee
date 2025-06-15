from pydantic import BaseModel, Field
from typing import Optional

# Base schema for common extension attributes
class ExtensionBase(BaseModel):
    extension_number: str
    voicemail_enabled: bool = Field(default=False)
    is_active: bool = Field(default=True)
    call_forwarding: Optional[str] = None
    description: Optional[str] = None
    domain_id: str
    user_id: Optional[str] = None

# Schema for creating a new extension
class ExtensionCreate(ExtensionBase):
    pass

# Schema for updating an existing extension
class ExtensionUpdate(BaseModel):
    extension_number: Optional[str] = None
    voicemail_enabled: Optional[bool] = None
    is_active: Optional[bool] = None
    call_forwarding: Optional[str] = None
    description: Optional[str] = None
    user_id: Optional[str] = None

# Schema for representing a domain within an extension response
class DomainForExtension(BaseModel):
    domains_id: str
    domain_name: str

    class Config:
        from_attributes = True

# Schema for the full extension object returned by the API
class Extension(ExtensionBase):
    extension_id: str
    domain: DomainForExtension

    class Config:
        from_attributes = True