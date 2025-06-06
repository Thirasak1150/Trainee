FROM python:3.11-slim

WORKDIR /app


# ติดตั้ง Python และ Node dependencies
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# คัดลอกโปรเจคทั้งหมด
COPY . .


# สั่ง Prisma migrate แล้วรัน backend
WORKDIR /app
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port 8000 --reload"]