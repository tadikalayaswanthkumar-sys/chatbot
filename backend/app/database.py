import os
import datetime
import uuid
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import create_engine, Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

# --- Settings and Configuration ---
class Settings(BaseSettings):
    APP_NAME: str = "Chatbot Backend"
    DEBUG: bool = True
    DATABASE_URL: str = "sqlite:///./storage/chatbot.db"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    OPENAI_API_KEY: str = ""
    AI_MODEL: str = "gpt-4o-mini"
    GROQ_API_KEY: str = ""

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# --- Database Connection and Setup ---
if settings.DATABASE_URL.startswith("sqlite:///"):
    db_path = settings.DATABASE_URL.replace("sqlite:///", "")
    if not db_path.startswith("./") and not os.path.isabs(db_path):
        db_path = os.path.join(".", db_path)
    
    db_dir = os.path.dirname(db_path)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def generate_uuid():
    return str(uuid.uuid4())

# --- Database Models ---
class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    title = Column(String(255), nullable=False, default="New Conversation")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(50), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")

# --- Pydantic Schemas ---
class MessageBase(BaseModel):
    role: str
    content: str

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: str
    conversation_id: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class ConversationBase(BaseModel):
    title: Optional[str] = "New Conversation"

class ConversationCreate(ConversationBase):
    pass

class ConversationResponse(ConversationBase):
    id: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class ConversationDetailResponse(ConversationResponse):
    messages: List[MessageResponse] = []

    model_config = ConfigDict(from_attributes=True)

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    user_message: MessageResponse
    ai_message: MessageResponse
    conversation_title: str

# --- CRUD Operations ---
def get_conversations(db: SessionLocal):
    return db.query(Conversation).order_by(Conversation.updated_at.desc()).all()

def get_conversation(db: SessionLocal, conversation_id: str):
    return db.query(Conversation).filter(Conversation.id == conversation_id).first()

def create_conversation(db: SessionLocal, conversation_schema: ConversationCreate):
    db_conv = Conversation(title=conversation_schema.title)
    db.add(db_conv)
    db.commit()
    db.refresh(db_conv)
    return db_conv

def update_conversation_title(db: SessionLocal, conversation_id: str, title: str):
    db_conv = get_conversation(db, conversation_id)
    if db_conv:
        db_conv.title = title
        db_conv.updated_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(db_conv)
    return db_conv

def delete_conversation(db: SessionLocal, conversation_id: str):
    db_conv = get_conversation(db, conversation_id)
    if db_conv:
        db.delete(db_conv)
        db.commit()
        return True
    return False

def get_messages(db: SessionLocal, conversation_id: str):
    return db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at.asc()).all()

def create_message(db: SessionLocal, conversation_id: str, role: str, content: str):
    db_message = Message(
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
