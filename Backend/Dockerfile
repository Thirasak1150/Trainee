FROM python:3.11-slim

WORKDIR /app

# ติดตั้ง Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# ติดตั้ง Python และ Node dependencies
COPY requirements.txt .
COPY package.json .

RUN pip install --no-cache-dir -r requirements.txt
RUN npm install

# คัดลอกโปรเจคทั้งหมด
COPY . .

# สร้าง Prisma Client
# สร้าง Prisma Client (ใช้ Python CLI เพื่อให้ binary ไปอยู่ใน cache ที่ mount ไม่ทับ)
RUN python3 -m prisma generate

# สั่ง Prisma deploy migration แล้วรัน backend
CMD ["sh", "-c", "npm run prisma:deploy && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]