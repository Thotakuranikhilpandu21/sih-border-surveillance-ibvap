import os

class Settings:
    PROJECT_NAME: str = "IBVAP — Intelligent Border Video Analytics Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ibvap.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "sih26187-ibvap-secret-key-production")
    FRS_SIMILARITY_THRESHOLD: float = 0.82

settings = Settings()
