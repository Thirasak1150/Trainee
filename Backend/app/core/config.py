
from pydantic_settings import BaseSettings
from typing import List, Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):


   # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:Plankton273855@localhost:5432/fusionpbx")
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    class Config:
        case_sensitive = True

settings = Settings()