#fastapi
import fastapi
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Optional, List
import uuid  # For generating user_uuid
import hashlib # For password hashing

app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # หรือกำหนดเฉพาะ origin ที่ต้องการ
    allow_credentials=True,
    allow_methods=["*"],  # อนุญาตทุก method เช่น GET, POST, OPTIONS
    allow_headers=["*"],
)
class UserCreate(BaseModel):
    username: str
    password: str
    Lname: str
    Fname: str

# Model สำหรับข้อมูลผู้ใช้
class UserLoginCredentials(BaseModel):
    username: str
    password: str

class UserDetails(BaseModel):
    user_uuid: str
    username: str

class LoginResponse(BaseModel):
    message: str
    user: str
    permissions: str

class User(BaseModel):
    user_uuid: str
    domain_uuid: Optional[str] = None
    username: str
    user_email: str = ""  # กำหนดค่า default เป็นสตริงว่าง
    user_status: Optional[str] = None
    user_enabled: Optional[str] = None
    
# ฟังก์ชันสำหรับเชื่อมต่อฐานข้อมูล
def get_db_connection():
    SQLALCHEMY_DATABASE_URL = "postgresql://postgres:Plankton273855@localhost:5432/fusionpbx"

    return psycopg2.connect(
        host="host.docker.internal",  # เปลี่ยนเป็น host.docker.internal
        database="fusionpbx",
        user="postgres",
        password="Plankton273855",
        cursor_factory=RealDictCursor
    )

# Endpoint สำหรับดึงข้อมูลผู้ใช้ทั้งหมด
@app.get("/users", response_model=List[User])
async def get_users():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM public.view_users")
        users = cur.fetchall()
        print(users)
        cur.close()
        conn.close()
        return users
    except Exception as e:
        print(e)
        return {"error": str(e)}

# Endpoint สำหรับดึงข้อมูลผู้ใช้ตาม username
@app.get("/users/{username}", response_model=User)
async def get_user_by_username(username: str):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM public.view_users WHERE username = %s", (username,))
        user = cur.fetchone()
        cur.close()
        conn.close()
        if user:
            return user
        return {"error": "User not found"}
    except Exception as e:
        return {"error": str(e)}

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q} 

@app.post("/users")
async def create_user(user: UserCreate):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Generate a new user_uuid
        new_user_uuid = str(uuid.uuid4())

        # Hash the password (using SHA-256 as an example)
        hashed_password = hashlib.sha256(user.password.encode('utf-8')).hexdigest()

        # Insert the new user into the v_users table
        # Assuming domain_uuid can be NULL for now, or you might need to fetch/provide it
        # Setting user_enabled to 'true' by default
        cur.execute(
            """INSERT INTO public.v_users 
               (user_uuid, username, password, user_enabled, insert_date, add_date) 
               VALUES (%s, %s, %s, %s, NOW(), NOW())""",
            (new_user_uuid, user.username, hashed_password, 'true')
        )
        conn.commit()
        
        cur.close()
        conn.close()
        
        return {"message": f"User '{user.username}' created successfully.", "user_uuid": new_user_uuid}
    except psycopg2.Error as e:
        # Log the error for debugging
        print(f"Database error: {e}")
        # You might want to rollback in case of an error if the connection is still open
        # if conn:
        #     conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e.pgcode} - {e.diag.message_primary}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")

# Endpoint for user login
@app.post("/login", response_model=LoginResponse)
async def login_for_access_token(credentials: UserLoginCredentials):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
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
            raise HTTPException(status_code=404, detail="User not found")

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
            raise HTTPException(status_code=401, detail="Invalid username or password")
        print("User record user_uuid:", user_record['user_uuid'])
        user_uuid = user_record['user_uuid']
        cur.execute(
            "SELECT group_names FROM public.view_users WHERE user_uuid = %s", 
            (user_uuid,)
        ) 
        group_names = cur.fetchone()
        print("Group names:", group_names['group_names'])
        user_details_data = {

            "username": user_record['username']
            # If UserDetails requires more fields (e.g., email, full_name),
            # they would need to be fetched and added here.
        }
        
        # The error showed 'superadmin' as a string, so wrap it in a list.
        # If group_names['group_names'] could be a comma-separated list of groups,
        # you might need: [name.strip() for name in group_names['group_names'].split(',') if name.strip()]
 
        return LoginResponse(
            message="Login successful", 
            user=user_record['username'], 
            permissions=group_names['group_names']
        )

    except psycopg2.Error as e:
        print(f"Database error during login: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {e.pgcode} - {e.diag.message_primary}")
    except Exception as e:
        print(f"An unexpected error occurred during login: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred during login.")
