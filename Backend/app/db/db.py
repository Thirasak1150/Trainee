from prisma import Prisma
from contextlib import asynccontextmanager

# สร้าง Prisma client instance ที่สามารถ import ได้โดยตรง
prisma = Prisma()

# สร้าง async context manager สำหรับการเชื่อมต่อกับฐานข้อมูล
@asynccontextmanager
async def get_prisma():
    try:
        await prisma.connect()
        yield prisma
    finally:
        await prisma.disconnect()

# ฟังก์ชันสำหรับการเชื่อมต่อกับฐานข้อมูลในการใช้งานแบบ dependency
async def get_db():
    # The connection is now managed by startup/shutdown events in main.py
    # This generator simply yields the already connected instance.
    yield prisma

