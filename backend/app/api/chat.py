from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database import schemas
from app.services.chat_service import chat_service

router = APIRouter()

@router.post("", response_model=schemas.ChatResponse, status_code=status.HTTP_200_OK)
def send_chat_message(payload: schemas.ChatRequest, db: Session = Depends(get_db)):
    """
    Send a message to a conversation.
    If conversation_id is not provided (or doesn't exist), a new conversation is started.
    """
    return chat_service.send_message(
        db=db,
        message_content=payload.message,
        conversation_id=payload.conversation_id
    )
