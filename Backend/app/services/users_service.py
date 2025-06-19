from app.db.db import get_db
from app.schemas.usersSchemas import LoginResponse, UserLoginCredentials, User
from fastapi import HTTPException
import uuid
import hashlib
# import psycopg2
# from psycopg2.extras import RealDictCursor
# Prisma will be used for DB access

async def get_all_users():
    print(f"all users")
    try:
        async for db in get_db():
            # Note: Prisma uses 'take' for the limit
            users = await db.users.find_many(
                include={"roles": True}
            )
            list_users = []
            for user in users:
       
                list_users.append({
                    "users_id": user.users_id,
                    "username": user.username,
                    "roles": user.roles.name,
                    "full_name": user.full_name,
                    "email": user.email,
                    "user_enabled": user.user_enabled,  # Convert boolean to string to match frontend expectations
                })
            return list_users
        # TODO: Remove psycopg2 code after full Prisma migration
    except Exception as e:
        print(e)
        return {"error": str(e)}

async def get_user_by_uuid(user_uuid: str):
    print("user uuid", user_uuid)
    try:
        async for db in get_db():
            user = await db.users.find_unique(where={"users_id": user_uuid})
            return user
    except Exception as e:
        print(e)
        return {"error": str(e)}

async def get_user_by_login(username: str,password: str):
    print("user login", username, password)
#     model roles {
#   roles_id    String          @id @default(uuid()) @db.Uuid
#   name        String          @unique
#   description String?

#   users       users[]
#   role_menus  role_menus[]
#   role_menu_items role_menu_items[]
# }
    try:
        async for db in get_db():
            user = await db.users.find_first(
                where={"username": username},
                include={"roles": True}  # << รวมตาราง roles ที่สัมพันธ์
            )
            if not user:
                return {"error": "User not found"}
            if user.password_hash != password:
                return {"error": "Incorrect password"}
            domains_id = await db.domains.find_first(
                where={"manager_id": user.users_id}
            )
            print("user loginSucces", user) 
            return {"message": "Login successful",
            "user_id": user.users_id,
            "username": user.username,
            "permissions": user.roles.name,
            "full_name": user.full_name,
            "email": user.email,
            "domains_id": domains_id.domains_id if domains_id else None,
            "domain_name": domains_id.domain_name if domains_id else None,
            }
        # TODO: Remove psycopg2 code after full Prisma migration
    except Exception as e:
        return {"error": str(e)}

async def create_user(user_data: dict):
    print("user_data", user_data)
    try:
        async for db in get_db():
            user = await db.users.create(
                data={
                    "username": user_data["username"],
                    "password_hash": user_data["password"],
                    "full_name": user_data.get("full_name"),
                    "email": user_data.get("email"),
                    "roles_id": user_data["roles_id"],
                }
            )
            return user
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")

async def update_user(users_id: str, user_data: dict):
    try:
        async for db in get_db():
            # First get the current user to check for existence
            current_user = await db.users.find_unique(
                where={"users_id": users_id}
            )
            
            if not current_user:
                raise HTTPException(status_code=404, detail="User not found")

            # Prepare update data dynamically, only including fields present in the request
            update_data = {}

            # List of fields that can be updated from user profile page
            updatable_fields = ["username", "full_name", "email", "user_enabled"]
            for field in updatable_fields:
                if field in user_data:
                    update_data[field] = user_data[field]

            # Handle password update separately
            if "password" in user_data and user_data["password"]:
                update_data["password_hash"] = user_data["password"]
            
            # Handle roles_id update separately (might be used by other admin features)
            if "roles_id" in user_data and user_data["roles_id"]:
                update_data["roles_id"] = user_data["roles_id"]
            
            # If there's nothing to update, we can return early.
            if not update_data:
                return current_user
           
            user = await db.users.update(
                where={"users_id": users_id},
                data=update_data
            )
            return user
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")

async def delete_user(users_id: str):
    try:
        async for db in get_db():
            user = await db.users.delete(where={"users_id": users_id})
            return {"message": f"User with ID {users_id} deleted successfully."}
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=404, detail="User not found")

async def get_user_by_username(username: str):
    print(f"getting user by username: {username}")
    try:
        async for db in get_db():
            user = await db.users.find_unique(
                where={"username": username},
                include={"roles": True}
            )
            if not user:
                return None
            
            return {
                "users_id": user.users_id,
                "username": user.username,
                "roles": user.roles.name,
                "full_name": user.full_name,
                "email": user.email,
                "user_enabled": user.user_enabled,
            }
    except Exception as e:
        print(f"An unexpected error occurred while fetching user by username: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")

async def login_for_access_token(credentials: UserLoginCredentials):
    try:
        async for db in get_db():
            user = await db.users.find_first(where={"username": credentials.username})
            if not user:
                raise HTTPException(status_code=401, detail="Incorrect username or password")
            # สมมติว่า password_hash เป็น hash ที่ client ส่งมาแล้ว (หรือจะ hash ที่ backend ก็ได้)
            hashed_password = hashlib.sha256(credentials.password.encode()).hexdigest()
            if user.password_hash != hashed_password:
                raise HTTPException(status_code=401, detail="Incorrect username or password")
            # Return user info (customize as needed)
            return user
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
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