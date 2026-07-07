from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

@router.get("")
@router.get("/")
def health_check():
    """
    Health check endpoint to verify backend status.
    """
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "debug_mode": settings.DEBUG,
        "ai_fallback": not bool(settings.OPENAI_API_KEY)
    }
