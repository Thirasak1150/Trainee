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
from fastapi.staticfiles import StaticFiles
from fastapi import APIRouter
from app.db.db import prisma
from pathlib import Path
from fastapi.responses import FileResponse
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

@app.on_event("startup")
async def startup():
    await prisma.connect()
api_router = APIRouter()
app.include_router(api_router, prefix="")

# เสิร์ฟ Static Files (สำหรับ Frontend)
from pathlib import Path
app.mount(
    "/assets",
    StaticFiles(directory=str(Path(__file__).parent / "frontend" / "assets"))
)
app.mount("/Animation", StaticFiles(directory=str(Path(__file__).parent / "frontend" / "Animation")))

# Route สำหรับเสิร์ฟหน้า Frontend (React หรืออื่นๆ)
@app.get("/favicon.ico")
async def favicon():
    return FileResponse(str(Path(__file__).parent / "frontend" / "favicon.ico"))

@app.get("/{full_path:path}")  # Match ทุกเส้นทางที่ไม่ใช่ API
async def serve_frontend(full_path: str):
    # ลองเช็คว่าเป็นไฟล์ใน assets หรือไม่
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API route not found")

    if full_path.startswith("assets/"):
        file_path = f"frontend/{full_path}"
        try:
            return FileResponse(file_path)
        except:
            pass
    
    # ถ้าไม่พบไฟล์ ให้ส่งกลับ index.html สำหรับ client-side routing
    return FileResponse(str(Path(__file__).parent / "frontend" / "index.html"))

@app.on_event("shutdown")
async def shutdown():
    await prisma.disconnect()
