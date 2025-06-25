from pydantic import BaseModel, Field, validator
from enum import Enum
from datetime import datetime
from typing import Optional, Any
from uuid import UUID, uuid4

class TrunkType(str, Enum):
    REGISTER = "Register"
    PEER = "PEER"
    ACCOUNT = "ACCOUNT"
    WEBRTC = "WEBRTC"

class TransportType(str, Enum):
    UDP = "UDP"
    TCP = "TCP"
    TLS = "TLS"
    WSS = "WSS"
    WS = "WS"

class TrunkBase(BaseModel):
    trunk_id: Optional[str] = None
    domain_id: Optional[str] = None
    name: Optional[str] = None
    transport: Optional[TransportType] = None
    host: Optional[str] = None
    port: Optional[int] = None
    username: Optional[str] = None
    password: Optional[str] = None
    auth_username: Optional[str] = None
    register_trunk: Optional[bool] = None
    trunk_type: Optional[TrunkType] = None
    is_active: Optional[bool] = None
    description: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class TrunkCreate(BaseModel):
    domain_id: Optional[str] = None
    name: Optional[str] = None
    transport: Optional[TransportType] = None
    host: Optional[str] = None
    port: Optional[int] = None
    username: Optional[str] = None
    password: Optional[str] = None
    auth_username: Optional[str] = None
    register_trunk: bool = Field(default=False)
    trunk_type: TrunkType = Field(default=TrunkType.REGISTER)
    is_active: bool = Field(default=True)
    description: str = Field(default="")

class TrunkUpdate(BaseModel):
    name: Optional[str] = None
    transport: Optional[TransportType] = None
    host: Optional[str] = None
    port: Optional[int] = Field(default=None, ge=1, le=65535)
    username: Optional[str] = None
    password: Optional[str] = None
    auth_username: Optional[str] = None
    register_trunk: Optional[bool] = None
    trunk_type: Optional[TrunkType] = None
    is_active: Optional[bool] = None
    description: Optional[str] = None

class TrunkInDB(TrunkBase):
    class Config:
        from_attributes = True