#fastapi
import fastapi
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.api.routes import users
from app.api.routes import domain
from app.api.routes import menus
from app.api.routes import roles
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
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(domain.router, prefix="/api/domain", tags=["Domain"])
app.include_router(menus.router, prefix="/api/menu", tags=["Menu"])
app.include_router(roles.router, prefix="/api/roles", tags=["Roles"])

@app.get("/")
async def root():
    return {"message": "Welcome to FusionPBX API A"}

@app.on_event("startup")
async def startup():
    await prisma.connect()

@app.on_event("shutdown")
async def shutdown():
    await prisma.disconnect()
