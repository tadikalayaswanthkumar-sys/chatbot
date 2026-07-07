from sqlalchemy.orm import Session
from app.database import crud, schemas
from fastapi import HTTPException, status

class ConversationService:
    @staticmethod
    def list_conversations(db: Session):
        """
        List all active conversations.
        """
        return crud.get_conversations(db)

    @staticmethod
    def get_conversation_by_id(db: Session, conversation_id: str):
        """
        Retrieve a conversation with all its associated messages.
        """
        conversation = crud.get_conversation(db, conversation_id)
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conversation with ID {conversation_id} not found"
            )
        return conversation

    @staticmethod
    def create_new_conversation(db: Session, conversation_schema: schemas.ConversationCreate):
        """
        Create a new conversation workspace.
        """
        return crud.create_conversation(db, conversation_schema)

    @staticmethod
    def delete_conversation_by_id(db: Session, conversation_id: str):
        """
        Remove a conversation and all its messages.
        """
        success = crud.delete_conversation(db, conversation_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conversation with ID {conversation_id} not found"
            )
        return {"status": "success", "message": "Conversation deleted successfully"}

conversation_service = ConversationService()
