from fastapi import HTTPException
from pydantic import BaseModel
from prisma import Prisma
from app.db.db import get_db

# Pydantic models for request body validation
class ContactCreate(BaseModel):
    full_name: str
    phone_number: str | None = None
    contact_type: str  # Expects 'INTERNAL' or 'EXTERNAL'
    extension_id: str | None = None

class ContactUpdate(BaseModel):
    full_name: str | None = None
    phone_number: str | None = None
    contact_type: str | None = None
    extension_id: str | None = None

async def get_all_contacts(contact_type: str | None = None):
    """Return all contacts, optionally filtered by contact_type."""

    try:
        async for db in get_db():
            where_clause = {}
            if contact_type and contact_type.upper() in ["INTERNAL", "EXTERNAL"]:
                where_clause['contact_type'] = contact_type.upper()

            contacts_found = await db.contacts.find_many(
            where=where_clause,
            include={
                "extension": {
                    "include": {
                        "domain": True
                    }
                }
            },
            
        )
        print("contacts_found", contacts_found)
        if not contacts_found:
            return []

        results = []
        for c in contacts_found:
            domain_info = None
            if c.extension and c.extension.domain:
                domain_info = {
                    "domain_id": c.extension.domain.domains_id,
                    "domain_name": c.extension.domain.domain_name
                }

            results.append(
                {
                    "contact_id": c.contact_id,
                    "full_name": c.full_name,
                    "phone_number": c.phone_number,
                    "contact_type": c.contact_type,
                    "extension_id": c.extension_id,
                    "extension_number": c.extension.extension_number if c.extension else None,
                    "domain": domain_info,
                    "updated_at": c.updated_at
                }
            )
        return results
    except Exception as e:
        print(f"Error in get_all_contacts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def create_contact(contact_data: ContactCreate):
    try:
        async for db in get_db():
            if contact_data.contact_type.upper() == 'INTERNAL':
                if not contact_data.extension_id:
                    raise HTTPException(status_code=400, detail='extension_id is required for INTERNAL contacts')
                existing_extension = await db.extensions.find_unique(where={'extension_id': contact_data.extension_id})
                if not existing_extension:
                    raise HTTPException(status_code=404, detail=f'Extension with id {contact_data.extension_id} not found')
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
                    'extension_id': contact_data.extension_id
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
            contact_type_final = (update_data.get('contact_type') or existing_contact.contact_type).upper()
            if contact_type_final == 'INTERNAL':
                ext_id = update_data.get('extension_id') or existing_contact.extension_id
                if not ext_id:
                    raise HTTPException(status_code=400, detail='extension_id is required for INTERNAL contacts')
                ext = await db.extensions.find_unique(where={'extension_id': ext_id})
                if not ext:
                    raise HTTPException(status_code=404, detail=f'Extension with id {ext_id} not found')
                other_contact = await db.contacts.find_first(where={'extension_id': ext_id, 'NOT': {'contact_id': contact_id}})
                if other_contact:
                    raise HTTPException(status_code=409, detail=f'Extension {ext.extension_number} is already linked to another contact')
                update_data['extension_id'] = ext_id  # Ensure extension_id is set
            elif contact_type_final == 'EXTERNAL':
                update_data['extension_id'] = None  # Ensure extension_id is null for EXTERNAL
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