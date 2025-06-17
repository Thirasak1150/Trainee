#fastapi
import fastapi
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.api.routes import users
from app.api.routes import domain
from app.api.routes import menus
from app.api.routes import roles
from app.api.routes import extensions
from app.api.routes import contacts
from psycopg2.extras import RealDictCursor
from typing import Optional, List
import uuid  # For generating user_uuid
import hashlib # For password hashing
from fastapi.middleware.cors import CORSMiddleware
from app.db.db import prisma
app = FastAPI(
    title="FusionPBX API",
    description="API สำหรับระบบจัดการ FusionPBX",
    version="0.1.0",
)



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(domain.router, prefix="/api/domain", tags=["Domain"])
app.include_router(menus.router, prefix="/api/menu", tags=["Menu"])
app.include_router(roles.router, prefix="/api/roles", tags=["Roles"])
app.include_router(extensions.router, prefix="/api", tags=["Extensions"])
app.include_router(contacts.router, prefix="/api/contacts", tags=["Contacts"])

@app.get("/")
async def root():
    return {"message": "Welcome to FusionPBX API A"}

@app.on_event("startup")
async def startup():
    await prisma.connect()

@app.on_event("shutdown")
async def shutdown():
    await prisma.disconnect()
