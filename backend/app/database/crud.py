import datetime
from sqlalchemy.orm import Session
from app.database import models, schemas

# --- Conversation CRUD ---

def get_conversations(db: Session):
    """
    Get all conversations sorted by last updated timestamp descending.
    """
    return db.query(models.Conversation).order_by(models.Conversation.updated_at.desc()).all()

def get_conversation(db: Session, conversation_id: str):
    """
    Get a single conversation by ID.
    """
    return db.query(models.Conversation).filter(models.Conversation.id == conversation_id).first()

def create_conversation(db: Session, conversation_schema: schemas.ConversationCreate):
    """
    Create a new conversation.
    """
    db_conv = models.Conversation(title=conversation_schema.title)
    db.add(db_conv)
    db.commit()
    db.refresh(db_conv)
    return db_conv

def update_conversation_title(db: Session, conversation_id: str, title: str):
    """
    Update the title of an existing conversation and bump updated_at.
    """
    db_conv = get_conversation(db, conversation_id)
    if db_conv:
        db_conv.title = title
        db_conv.updated_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(db_conv)
    return db_conv

def delete_conversation(db: Session, conversation_id: str):
    """
    Delete a conversation (cascades to delete all messages).
    """
    db_conv = get_conversation(db, conversation_id)
    if db_conv:
        db.delete(db_conv)
        db.commit()
        return True
    return False

# --- Message CRUD ---

def get_messages(db: Session, conversation_id: str):
    """
    Get all messages for a specific conversation in chronological order.
    """
    return db.query(models.Message).filter(models.Message.conversation_id == conversation_id).order_by(models.Message.created_at.asc()).all()

def create_message(db: Session, conversation_id: str, role: str, content: str):
    """
    Create and record a new message for a conversation, updating the conversation's timestamp.
    """
    db_message = models.Message(
        conversation_id=conversation_id,
        role=role,
        content=content
    )
    db.add(db_message)
    
    # Touch conversation timestamp
    db_conv = get_conversation(db, conversation_id)
    if db_conv:
        db_conv.updated_at = datetime.datetime.utcnow()
        
    db.commit()
    db.refresh(db_message)
    return db_message
