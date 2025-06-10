#fastapi
import fastapi
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.api.routes import users
from app.api.routes import domain
from psycopg2.extras import RealDictCursor
from typing import Optional, List
import uuid  # For generating user_uuid
import hashlib # For password hashing
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(
    title="FusionPBX API",
    description="API สำหรับระบบจัดการ FusionPBX",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # หรือกำหนดเฉพาะ origin ที่ต้องการ
    allow_credentials=True,
    allow_methods=["*"],  # อนุญาตทุก method เช่น GET, POST, OPTIONS
    allow_headers=["*"],
)


# Include routers
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(domain.router, prefix="/api/domain", tags=["Domain"])

@app.get("/")
async def root():
    return {"message": "Welcome to FusionPBX API"}
