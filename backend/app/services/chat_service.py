from sqlalchemy.orm import Session
from app.database import crud, schemas
from app.services.ai_service import ai_service
from app.database.models import Conversation
import uuid

class ChatService:
    @staticmethod
    def send_message(db: Session, message_content: str, conversation_id: str = None):
        """
        Processes a chat transaction:
        1. Finds or creates the target conversation.
        2. Logs the user's message.
        3. Retrieves conversation history for context.
        4. Requests an AI completion.
        5. Logs the AI response.
        6. Updates the conversation's title dynamically if it was a new chat.
        """
        # Determine if we need to create a new conversation
        is_new_chat = False
        conversation = None
        
        if conversation_id:
            conversation = crud.get_conversation(db, conversation_id)
            
        if not conversation:
            # Create a brand new conversation if ID not provided or doesn't exist
            is_new_chat = True
            conv_create = schemas.ConversationCreate(title="New Conversation")
            conversation = crud.create_conversation(db, conv_create)
            conversation_id = conversation.id

        # 1. Save user's message
        user_message = crud.create_message(
            db=db,
            conversation_id=conversation_id,
            role="user",
            content=message_content
        )

        # 2. Gather history (for AI context, limit to last 20 messages to prevent token bloat)
        history_msgs = crud.get_messages(db, conversation_id)
        
        # Exclude the user message we just saved from history to format separately
        history_data = []
        for msg in history_msgs[:-1]:
            history_data.append({"role": msg.role, "content": msg.content})

        # 3. Call AI service
        ai_reply = ai_service.generate_response(message_content, chat_history=history_data)

        # 4. Save AI's response
        ai_message = crud.create_message(
            db=db,
            conversation_id=conversation_id,
            role="assistant",
            content=ai_reply
        )

        # 5. Automatically generate and update title if it's the first exchange
        title = conversation.title
        if is_new_chat or conversation.title == "New Conversation":
            generated_title = ai_service.generate_title(message_content)
            # Limit title length
            if len(generated_title) > 40:
                generated_title = generated_title[:37] + "..."
            crud.update_conversation_title(db, conversation_id, generated_title)
            title = generated_title

        # Build response payload matching schemas.ChatResponse
        return {
            "user_message": schemas.MessageResponse.model_validate(user_message),
            "ai_message": schemas.MessageResponse.model_validate(ai_message),
            "conversation_title": title
        }

chat_service = ChatService()
