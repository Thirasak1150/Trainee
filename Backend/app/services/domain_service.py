from app.db.db import get_db_connection
from app.schemas.domainSchemas import Domain, DomainCreate, DomainUpdate
from fastapi import HTTPException
import uuid
import hashlib
import psycopg2
from psycopg2.extras import RealDictCursor


async def get_all_domains():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM public.v_domains")
        
        domains = cur.fetchall()
        print("domain",domains)
        cur.close()
        conn.close()
        return [Domain(**domain) for domain in domains]
    except Exception as e:
        print(e)
        return {"error": str(e)}

async def create_domain(domain: DomainCreate):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        domain_uuid = str(uuid.uuid4())
        cur.execute("""
            INSERT INTO public.v_domains (domain_uuid, domain_name, domain_enabled, domain_description)
            VALUES (%s, %s, %s, %s)
            RETURNING *
        """, (domain_uuid, domain.domain_name, domain.domain_enabled, domain.domain_description))
        
        new_domain = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return Domain(**new_domain)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Error creating domain: {str(e)}")

async def update_domain(domain_uuid: str, domain: DomainUpdate):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            UPDATE public.v_domains
            SET domain_name = %s, domain_enabled = %s, domain_description = %s, update_date = CURRENT_TIMESTAMP
            WHERE domain_uuid = %s
            RETURNING *
        """, (domain.domain_name, domain.domain_enabled, domain.domain_description, domain_uuid))
        
        updated_domain = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        if updated_domain is None:
            raise HTTPException(status_code=404, detail="Domain not found")
        return Domain(**updated_domain)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Error updating domain: {str(e)}")

async def delete_domain(domain_uuid: str):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM public.v_domains WHERE domain_uuid = %s", (domain_uuid,))
        conn.commit()
        cur.close()
        conn.close()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Domain not found")
        return {"message": "Domain deleted successfully"}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Error deleting domain: {str(e)}")
