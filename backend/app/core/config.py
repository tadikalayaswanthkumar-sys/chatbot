import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

class Settings(BaseSettings):
    APP_NAME: str = "Chatbot Backend"
    DEBUG: bool = True
    DATABASE_URL: str = "sqlite:///./storage/chatbot.db"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    OPENAI_API_KEY: str = ""
    AI_MODEL: str = "gpt-4o-mini"
    GROQ_API_KEY: str = ""

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    # Pydantic v2 settings configuration
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
