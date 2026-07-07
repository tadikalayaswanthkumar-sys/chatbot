from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

@router.get("")
@router.get("/")
def health_check():
    """
    Health check endpoint to verify backend status.
    """
    # Not fallback if either OpenAI or Groq keys are provided
    has_live_key = bool(settings.OPENAI_API_KEY) or bool(getattr(settings, "GROQ_API_KEY", ""))
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "debug_mode": settings.DEBUG,
        "ai_fallback": not has_live_key
    }
