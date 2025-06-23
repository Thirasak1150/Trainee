from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from prisma import Prisma
from app.db.db import get_db
from app.services import contact_serivce
from app.services.contact_serivce import ContactCreate, ContactUpdate

router = APIRouter()

@router.get("/")
async def read_contacts(
    domain_id: str, 
    contact_type: Optional[str] = Query(None, enum=["INTERNAL", "EXTERNAL"])
):
    """
    Retrieve all contacts, with an option to filter by domain_id and contact_type.
    """
    contacts = await contact_serivce.get_all_contacts(domain_id=domain_id, contact_type=contact_type)
    return contacts

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_new_contact(contact: ContactCreate):
    """
    Create a new contact.
    - For INTERNAL type, `extension_id` is required and must be valid and unlinked.
    - For EXTERNAL type, `extension_id` is ignored.
    """
    new_contact = await contact_serivce.create_contact(contact)
    return new_contact

@router.put("/{contact_id}")
async def update_existing_contact(contact_id: str, contact: ContactUpdate):
    """
    Update a contact by its ID.
    Validates changes to `contact_type` and `extension_id` linkage.
    """
    updated_contact = await contact_serivce.update_contact(contact_id, contact)
    return updated_contact

@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_contact(contact_id: str):
    """
    Delete a contact by its ID.
    """
    await contact_serivce.delete_contact(contact_id)
    return

