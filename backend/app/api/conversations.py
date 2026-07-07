from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database import schemas
from app.services.conversation_service import conversation_service

router = APIRouter()

@router.get("", response_model=List[schemas.ConversationResponse])
def get_conversations(db: Session = Depends(get_db)):
    """
    Retrieve all conversations, ordered by last update.
    """
    return conversation_service.list_conversations(db)

@router.get("/{conversation_id}", response_model=schemas.ConversationDetailResponse)
def get_conversation(conversation_id: str, db: Session = Depends(get_db)):
    """
    Retrieve details for a single conversation, including its full message thread.
    """
    return conversation_service.get_conversation_by_id(db, conversation_id)

@router.post("", response_model=schemas.ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(conversation: schemas.ConversationCreate, db: Session = Depends(get_db)):
    """
    Create a new empty conversation.
    """
    return conversation_service.create_new_conversation(db, conversation)

@router.delete("/{conversation_id}")
def delete_conversation(conversation_id: str, db: Session = Depends(get_db)):
    """
    Delete a conversation and all its messages.
    """
    return conversation_service.delete_conversation_by_id(db, conversation_id)
