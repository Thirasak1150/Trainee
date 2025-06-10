from app.db.db import get_db_connection
from app.schemas.usersSchemas import LoginResponse, UserLoginCredentials, User
from fastapi import HTTPException
import uuid
import hashlib
import psycopg2
from psycopg2.extras import RealDictCursor

async def get_all_users():
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM public.v_users")
        users = cur.fetchall()
        print(users)
        cur.close()
        conn.close()
        return users
    except Exception as e:
        print(e)
        return {"error": str(e)}

async def get_user_by_username(username: str):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM public.v_users WHERE username = %s", (username,))
        user = cur.fetchone()
        cur.close()
        conn.close()
        if user:
            return user
        return {"error": "User not found"}
    except Exception as e:
        return {"error": str(e)}

async def create_user(user_data: dict):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Generate a new user_uuid
        new_user_uuid = str(uuid.uuid4())

        # Insert the new user into the v_users table
        cur.execute(
            """INSERT INTO public.v_users 
               (user_uuid, username, user_enabled, user_email, insert_date) 
               VALUES (%s, %s, %s, %s, NOW())
               RETURNING *""",
            (new_user_uuid, user_data['username'], user_data.get('user_enabled', 'false'), user_data.get('email', ''))
        )
        new_user = cur.fetchone()
        conn.commit()
        
        cur.close()
        conn.close()
        
        return new_user
    except psycopg2.Error as e:
        print(f"Database error: {e}")
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e.pgcode} - {e.diag.message_primary}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")

async def update_user(user_uuid: str, user_data: dict):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Update the user in the v_users table
        cur.execute(
            """UPDATE public.v_users 
               SET username = %s, user_enabled = %s, user_email = %s, api_key = %s, update_date = NOW()
               WHERE user_uuid = %s
               RETURNING *""",
            (user_data['username'], user_data.get('user_enabled', 'false'), user_data.get('email', ''), user_data.get('api_key', None), user_uuid)
        )
        updated_user = cur.fetchone()
        conn.commit()
        
        cur.close()
        conn.close()
        
        if updated_user:
            return updated_user
        raise HTTPException(status_code=404, detail="User not found")
    except psycopg2.Error as e:
        print(f"Database error: {e}")
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e.pgcode} - {e.diag.message_primary}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")

async def delete_user(user_uuid: str):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Delete the user from the v_users table
        cur.execute("DELETE FROM public.v_users WHERE user_uuid = %s RETURNING user_uuid", (user_uuid,))
        deleted_user = cur.fetchone()
        conn.commit()
        
        cur.close()
        conn.close()
        
        if deleted_user:
            return {"message": f"User with UUID {user_uuid} deleted successfully."}
        raise HTTPException(status_code=404, detail="User not found")
    except psycopg2.Error as e:
        print(f"Database error: {e}")
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e.pgcode} - {e.diag.message_primary}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")

async def login_for_access_token(credentials: UserLoginCredentials):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        print("Credentials:", credentials)
        # Fetch user from database
        cur.execute(
            "SELECT user_uuid, username, password, salt, user_enabled FROM public.v_users WHERE username = %s", 
            (credentials.username,)
        )
        user_record = cur.fetchone()
        print("User record after fetch:", user_record) # Moved and clarified print statement


        if not user_record:
            cur.close()
            conn.close()
            print("User not found")
            
            return LoginResponse(
                message="User not found", 
                user_uuid="",
                user="", 
                permissions=[]
            )
        if user_record['user_enabled'] != 'true':
            cur.close()
            conn.close()
            raise HTTPException(status_code=403, detail="User account disabled")

        # Verify password (consistent with create_user, ignoring salt for now)
        # WARNING: This is a simplified password check. Production systems should use the salt
        # and match FusionPBX's specific hashing algorithm if it differs.
        
        print("User record password:", user_record['password'])
        if user_record['password'] != credentials.password:
            
            cur.close()
            conn.close()
            return LoginResponse(
                message="User not found", 
                user_uuid="",
                user="", 
                permissions=[]
            )
        print("User record user_uuid:", user_record['user_uuid'])
        cur.execute(
            "SELECT group_name FROM public.v_user_groups WHERE user_uuid = %s", 
            (user_record['user_uuid'],)
        )
        group_names = cur.fetchall()
        print("group_names:", group_names)
        # Extract group names from the result, handling empty or None cases
        permissions_list = [group['group_name'] for group in group_names if group and 'group_name' in group] if group_names else []
      
        cur.close()
        conn.close()

        return LoginResponse(
            message="Login successful", 
            user_uuid=user_record['user_uuid'],
            user=user_record['username'], 
            permissions=permissions_list[0]
        )

    except psycopg2.Error as e:
        print(f"Database error during login: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {e.pgcode} - {e.diag.message_primary}")
    except Exception as e:
        print(f"An unexpected error occurred during login: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred during login.")
    finally:
        if conn:
            conn.close()