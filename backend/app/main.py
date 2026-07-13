from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import (
    settings, engine, Base, get_db,
    ConversationCreate, ConversationResponse, ConversationDetailResponse,
    ChatRequest, ChatResponse, MessageResponse,
    get_conversations, get_conversation, create_conversation,
    delete_conversation, update_conversation_title,
    get_messages, create_message
)
from app.ai import ai_service

# Initialize tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="A FastAPI backend for the AI Chatbot application.",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": f"Welcome to the {settings.APP_NAME} API!",
        "documentation": "/docs" if settings.DEBUG else "Disabled in production"
    }

# Health Check Route
@app.get("/api/health")
def health_check():
    has_live_key = bool(settings.OPENAI_API_KEY) or bool(getattr(settings, "GROQ_API_KEY", ""))
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "debug_mode": settings.DEBUG,
        "ai_fallback": not has_live_key                                      
    }

# Conversations Routes
@app.get("/api/conversations", response_model=List[ConversationResponse])
def list_conversations(db: Session = Depends(get_db)):
    return get_conversations(db)

@app.post("/api/conversations", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_new_conversation(conversation: ConversationCreate, db: Session = Depends(get_db)):
    return create_conversation(db, conversation)

@app.get("/api/conversations/{conversation_id}", response_model=ConversationDetailResponse)
def get_conversation_details(conversation_id: str, db: Session = Depends(get_db)):
    conversation = get_conversation(db, conversation_id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation with ID {conversation_id} not found"
        )
    return conversation

@app.delete("/api/conversations/{conversation_id}")
def delete_conversation_by_id(conversation_id: str, db: Session = Depends(get_db)):
    success = delete_conversation(db, conversation_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation with ID {conversation_id} not found"
        )
    return {"status": "success", "message": "Conversation deleted successfully"}

# Chat Endpoint
@app.post("/api/chat", response_model=ChatResponse, status_code=status.HTTP_200_OK)
def send_chat_message(payload: ChatRequest, db: Session = Depends(get_db)):
    conversation_id = payload.conversation_id
    is_new_chat = False
    conversation = None
    
    if conversation_id:
        conversation = get_conversation(db, conversation_id)
        
    if not conversation:
        is_new_chat = True
        conv_create = ConversationCreate(title="New Conversation")
        conversation = create_conversation(db, conv_create)
        conversation_id = conversation.id

    # 1. Save user's message
    user_message = create_message(
        db=db,
        conversation_id=conversation_id,
        role="user",
        content=payload.message
    )

    # 2. Gather history (for AI context, limit to last 20 messages to prevent token bloat)
    history_msgs = get_messages(db, conversation_id)
    history_data = []
    # Exclude the user message we just saved from history to format separately
    for msg in history_msgs[:-1]:
        history_data.append({"role": msg.role, "content": msg.content})

    # 3. Call AI service
    ai_reply = ai_service.generate_response(payload.message, chat_history=history_data)

    # 4. Save AI's response
    ai_message = create_message(
        db=db,
        conversation_id=conversation_id,
        role="assistant",
        content=ai_reply
    )

    # 5. Automatically generate and update title if it's the first exchange
    title = conversation.title
    if is_new_chat or conversation.title == "New Conversation":
        generated_title = ai_service.generate_title(payload.message)
        if len(generated_title) > 40:
            generated_title = generated_title[:37] + "..."
        update_conversation_title(db, conversation_id, generated_title)
        title = generated_title

    # Return response payload matching ChatResponse
    return {
        "user_message": MessageResponse.model_validate(user_message),
        "ai_message": MessageResponse.model_validate(ai_message),
        "conversation_title": title
    }
