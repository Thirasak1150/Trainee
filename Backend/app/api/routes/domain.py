from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from app.services.domain_service import get_all_domains, create_domain, update_domain, delete_domain
from app.schemas.domainSchemas import Domain, DomainCreate, DomainUpdate
router = APIRouter()

@router.get("/" , response_model=list[Domain])
async def read_domains():
    """
    ดึงข้อมูลโดเมนทั้งหมด
    """
    domains = await get_all_domains()
    return domains

@router.post("/", response_model=Domain)
async def create_new_domain(domain: DomainCreate):
    """
    สร้างโดเมนใหม่
    """
    return await create_domain(domain)

@router.put("/{domains_id}", response_model=Domain)
async def update_existing_domain(domains_id: str, domain: DomainUpdate):
    """
    อัปเดตข้อมูลโดเมน
    """
    return await update_domain(domains_id, domain)

@router.delete("/{domains_id}")
async def delete_existing_domain(domains_id: str):
    """
    ลบโดเมน
    """
    return await delete_domain(domains_id)
