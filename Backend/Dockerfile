FROM python:3.11-slim

WORKDIR /app


# ติดตั้ง Python และ Node dependencies
COPY requirements.txt .

# Set PYTHONPATH to ensure modules in the '/app' directory are found
ENV PYTHONPATH="/app"

RUN pip install --no-cache-dir -r requirements.txt

# คัดลอกโปรเจคทั้งหมด
COPY . .

# Ensure WORKDIR is /app before running CMD, as PYTHONPATH is /app
WORKDIR /app
# Target app.main:app and explicitly set reload directory to /app/app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--reload-dir", "/app/app"]
