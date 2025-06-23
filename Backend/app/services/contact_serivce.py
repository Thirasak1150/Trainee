from fastapi import HTTPException
from pydantic import BaseModel
from prisma import Prisma
from app.db.db import get_db

# Pydantic models for request body validation
class ContactCreate(BaseModel):
    full_name: str
    phone_number: str | None = None
    contact_type: str
    domain_id: str
    extension_id: str | None = None

class ContactUpdate(BaseModel):
    full_name: str | None = None
    phone_number: str | None = None
    contact_type: str | None = None
    extension_id: str | None = None

# ประกาศฟังก์ชันชื่อ get_all_contacts เป็นฟังก์ชันแบบ asynchronous (ทำงานไม่ต่อเนื่อง)
# รับพารามิเตอร์ 2 ตัวคือ:
# - domain_id: เป็น string, คือ ID ของโดเมนที่ต้องการค้นหาผู้ติดต่อ (จำเป็นต้องมี)
# - contact_type: เป็น string หรือ None, คือประเภทของผู้ติดต่อ ('INTERNAL' หรือ 'EXTERNAL') (อาจจะไม่มีก็ได้)
async def get_all_contacts(domain_id: str, contact_type: str | None = None):
    """
    Docstring: คำอธิบายการทำงานของฟังก์ชัน
    ทำหน้าที่คืนค่ารายชื่อผู้ติดต่อทั้งหมด โดยมีการกรองจาก domain_id และ contact_type (ถ้ามี)
    """
    # พิมพ์ค่า domain_id และ contact_type ที่ได้รับมาเพื่อตรวจสอบ
    print("domain_id", domain_id)
    print("contact_type", contact_type)
    # เริ่มต้นบล็อก try-except เพื่อดักจับข้อผิดพลาดที่อาจเกิดขึ้น
    try:
        # วนลูปเพื่อขอการเชื่อมต่อกับฐานข้อมูล (database session) แบบ asynchronous
        async for db in get_db():
            # สร้าง Dictionary ชื่อ where_clause เพื่อใช้เก็บเงื่อนไขในการค้นหาข้อมูลในฐานข้อมูล
            # โดยกำหนดเงื่อนไขเริ่มต้นว่าต้องมี domain_id ตรงกับที่รับมา
            where_clause = {'domain_id': domain_id}

            # ตรวจสอบว่ามีการส่ง contact_type มาหรือไม่ และค่าที่ส่งมาเป็น "INTERNAL" หรือ "EXTERNAL"
            if contact_type and contact_type.upper() in ["INTERNAL", "EXTERNAL"]:
                # ถ้าเงื่อนไขเป็นจริง ให้เพิ่มเงื่อนไขการค้นหาด้วย contact_type เข้าไปใน where_clause
                where_clause['contact_type'] = contact_type.upper()

            # ค้นหาข้อมูลในตาราง contacts จากฐานข้อมูล
            contacts_found = await db.contacts.find_many(
                where=where_clause,  # ใช้เงื่อนไขการค้นหาจาก where_clause
                include={            # กำหนดให้ดึงข้อมูลจากตารางอื่นที่เกี่ยวข้องมาด้วย
                    "domain": True,      # ดึงข้อมูล domain ที่เชื่อมกับ contact
                    "extension": True    # ดึงข้อมูล extension ที่เชื่อมกับ contact
                },
            )
            # พิมพ์ข้อมูลที่ค้นเจอเพื่อตรวจสอบ
            print("contacts_found", contacts_found)

            # ถ้าไม่พบข้อมูลผู้ติดต่อใดๆ
            if not contacts_found:
                return []  # ให้คืนค่าเป็น list ว่างกลับไป

            # สร้าง list ว่างชื่อ results เพื่อเตรียมเก็บข้อมูลที่จะส่งกลับ
            results = []
            # วนลูปเพื่อจัดการข้อมูลผู้ติดต่อ (c) แต่ละรายการที่ค้นเจอ
            for c in contacts_found:
                # จัดรูปแบบข้อมูล domain ถ้ามีข้อมูล (c.domain) อยู่, ถ้าไม่มีจะเป็น None
                domain_info = {
                    "domain_id": c.domain.domains_id,
                    "domain_name": c.domain.domain_name
                } if c.domain else None

                # นำข้อมูลที่จัดรูปแบบแล้ว เพิ่มเข้าไปใน list `results`
                results.append({
                    "contact_id": c.contact_id,
                    "full_name": c.full_name,
                    "phone_number": c.phone_number,
                    "contact_type": c.contact_type,
                    "extension_id": c.extension_id,
                    # ดึงหมายเลข extension ถ้ามีข้อมูล (c.extension), ถ้าไม่มีให้เป็น None
                    "extension_number": c.extension.extension_number if c.extension else None,
                    "domain": domain_info, # ข้อมูล domain ที่จัดรูปแบบไว้
                    "updated_at": c.updated_at
                })
            # คืนค่า list ของผู้ติดต่อทั้งหมดที่จัดรูปแบบเรียบร้อยแล้ว
            return results
    # หากเกิดข้อผิดพลาด (Exception) ใดๆ ขึ้นในบล็อก try
    except Exception as e:
        # พิมพ์ข้อผิดพลาดออกมาเพื่อตรวจสอบ
        print(f"Error in get_all_contacts: {e}")
        # ส่ง HTTP Exception กลับไปพร้อมสถานะ 500 (Internal Server Error) และรายละเอียดของข้อผิดพลาด
        raise HTTPException(status_code=500, detail=str(e))


async def create_contact(contact_data: ContactCreate):
    try:
        async for db in get_db():
            if not contact_data.domain_id:
                raise HTTPException(status_code=400, detail="domain_id is required")
            
            domain_exists = await db.domains.find_unique(where={'domains_id': contact_data.domain_id})
            if not domain_exists:
                raise HTTPException(status_code=404, detail=f"Domain with id {contact_data.domain_id} not found")

            if contact_data.contact_type.upper() == 'INTERNAL':
                if not contact_data.extension_id:
                    raise HTTPException(status_code=400, detail='extension_id is required for INTERNAL contacts')
                
                existing_extension = await db.extensions.find_unique(where={'extension_id': contact_data.extension_id})
                if not existing_extension:
                    raise HTTPException(status_code=404, detail=f'Extension with id {contact_data.extension_id} not found')
                
                if existing_extension.domain_id != contact_data.domain_id:
                    raise HTTPException(status_code=400, detail="Extension does not belong to the specified domain")

                existing_contact_link = await db.contacts.find_first(where={'extension_id': contact_data.extension_id})
                if existing_contact_link:
                    raise HTTPException(status_code=409, detail=f'Extension {existing_extension.extension_number} is already linked to another contact')
            
            elif contact_data.contact_type.upper() == 'EXTERNAL':
                contact_data.extension_id = None  # Ensure extension_id is null for EXTERNAL
            
            new_contact = await db.contacts.create(
                data={
                    'full_name': contact_data.full_name,
                    'phone_number': contact_data.phone_number,
                    'contact_type': contact_data.contact_type.upper(),
                    'extension_id': contact_data.extension_id,
                    'domain_id': contact_data.domain_id
                }
            )
            return new_contact
    except HTTPException:
        raise
    except Exception as e:
        print(f'Error in create_contact: {e}')
        raise HTTPException(status_code=500, detail=str(e))


async def update_contact(contact_id: str, contact_data: ContactUpdate):
    try:
        async for db in get_db():
            existing_contact = await db.contacts.find_unique(where={'contact_id': contact_id})
            if not existing_contact:
                raise HTTPException(status_code=404, detail=f'Contact with id {contact_id} not found')

            update_data = contact_data.dict(exclude_unset=True)
            
            if 'domain_id' in update_data:
                del update_data['domain_id']

            contact_type_final = (update_data.get('contact_type') or existing_contact.contact_type).upper()

            if contact_type_final == 'INTERNAL':
                ext_id = update_data.get('extension_id') or existing_contact.extension_id
                if not ext_id:
                    raise HTTPException(status_code=400, detail='extension_id is required for INTERNAL contacts')

                ext = await db.extensions.find_unique(where={'extension_id': ext_id})
                if not ext:
                    raise HTTPException(status_code=404, detail=f'Extension with id {ext_id} not found')

                if ext.domain_id != existing_contact.domain_id:
                    raise HTTPException(status_code=400, detail="Cannot link to an extension from a different domain.")

                other_contact = await db.contacts.find_first(where={'extension_id': ext_id, 'NOT': {'contact_id': contact_id}})
                if other_contact:
                    raise HTTPException(status_code=409, detail=f'Extension {ext.extension_number} is already linked to another contact')
                
                update_data['extension_id'] = ext_id
            
            elif contact_type_final == 'EXTERNAL':
                update_data['extension_id'] = None

            if not update_data:
                return existing_contact

            updated_contact = await db.contacts.update(
                where={'contact_id': contact_id},
                data=update_data
            )
            return updated_contact
    except HTTPException:
        raise
    except Exception as e:
        print(f'Error in update_contact: {e}')
        raise HTTPException(status_code=500, detail=str(e))

async def delete_contact(contact_id: str):
    """Delete a contact by its ID."""
    try:
        async for db in get_db():
            existing_contact = await db.contacts.find_unique(where={"contact_id": contact_id})
            if not existing_contact:
                raise HTTPException(status_code=404, detail=f"Contact with id {contact_id} not found")

            await db.contacts.delete(where={"contact_id": contact_id})
            return {"message": f"Contact with id {contact_id} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in delete_contact: {e}")
        raise HTTPException(status_code=500, detail=str(e))