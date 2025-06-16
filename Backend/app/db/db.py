from prisma import Prisma
from contextlib import asynccontextmanager

# สร้าง Prisma client instance ที่สามารถ import ได้โดยตรง
prisma = Prisma(auto_register=True)

# สร้าง async context manager สำหรับการเชื่อมต่อกับฐานข้อมูล
@asynccontextmanager
async def get_db_context():
    try:
        if not prisma.is_connected():
            await prisma.connect()
        yield prisma
    finally:
        # Do not disconnect here to keep Prisma client alive across requests.
        # Disconnect will be handled on application shutdown event if needed.
        pass

# ฟังก์ชันสำหรับการเชื่อมต่อกับฐานข้อมูลในการใช้งานแบบ dependency
async def get_db():
    async with get_db_context() as db:
        yield db
