import time
import random
from typing import List, Dict
from app.core.config import settings
from app.core.prompt import get_system_prompt

# Conditionally import OpenAI to avoid crash if not installed, though listed in requirements
try:
    from openai import OpenAI
    client_available = True
except ImportError:
    client_available = False

class AIService:
    def __init__(self):
        self.groq_api_key = getattr(settings, "GROQ_API_KEY", "")
        self.openai_api_key = settings.OPENAI_API_KEY
        self.model = settings.AI_MODEL
        self.client = None
        
        if client_available:
            if self.groq_api_key:
                try:
                    self.client = OpenAI(
                        api_key=self.groq_api_key,
                        base_url="https://api.groq.com/openai/v1"
                    )
                    # Default to a Groq-compatible model if current model is OpenAI-specific
                    if self.model == "gpt-4o-mini" or self.model.startswith("gpt-"):
                        self.model = "llama-3.3-70b-versatile"
                except Exception:
                    self.client = None
            elif self.openai_api_key:
                try:
                    self.client = OpenAI(api_key=self.openai_api_key)
                except Exception:
                    self.client = None

    def generate_response(self, prompt: str, chat_history: List[Dict[str, str]] = None) -> str:
        """
        Generates an AI response based on the current prompt and chat history.
        Uses OpenAI if the key is provided, otherwise falls back to a simulated AI response.
        """
        system_prompt = get_system_prompt()
        
        # Build messages list
        messages = [{"role": "system", "content": system_prompt}]
        
        if chat_history:
            for msg in chat_history:
                messages.append({"role": msg["role"], "content": msg["content"]})
                
        messages.append({"role": "user", "content": prompt})

        if self.client:
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=0.7,
                )
                return response.choices[0].message.content
            except Exception as e:
                # If real API fails (e.g. rate limit, invalid key), fallback to simulation with error note
                return f"[API Error: {str(e)}]\n\n{self._generate_simulated_response(prompt)}"
        else:
            return self._generate_simulated_response(prompt)

    def generate_title(self, first_message: str) -> str:
        """
        Generates a short, context-appropriate title for a conversation.
        """
        if self.client:
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are a title generator. Summarize the user's message in 3-5 words. Do not use punctuation or quotes."},
                        {"role": "user", "content": first_message}
                    ],
                    max_tokens=10,
                    temperature=0.5
                )
                return response.choices[0].message.content.strip().replace('"', '').replace("'", "")
            except Exception:
                pass
        
        # Simple fallback title generation
        words = first_message.split()
        if len(words) > 5:
            return " ".join(words[:4]) + "..."
        return " ".join(words)

    def _generate_simulated_response(self, user_msg: str) -> str:
        """
        A simulated AI response engine for development without API keys.
        Supports keyword mapping to look smart and responsive.
        """
        # Sleep to simulate network delay
        time.sleep(random.uniform(0.5, 1.2))
        
        user_msg_lower = user_msg.lower()
        
        if "hello" in user_msg_lower or "hi" in user_msg_lower or "hey" in user_msg_lower:
            return (
                "Hello! 👋 I am your simulated AI assistant. How can I help you today?\n\n"
                "I can write code, answer general questions, or discuss ideas. Since we are running in simulation mode, "
                "I'll respond locally!"
            )
            
        if "help" in user_msg_lower:
            return (
                "Here are some things I can assist you with:\n\n"
                "- **Programming**: Ask me about HTML, CSS, JavaScript, Python, or SQL.\n"
                "- **Writing**: I can help you draft emails, blog posts, or resumes.\n"
                "- **Explanations**: I can explain complex technical terms simply."
            )
            
        if "code" in user_msg_lower or "python" in user_msg_lower or "javascript" in user_msg_lower or "function" in user_msg_lower:
            return (
                "Here is a code snippet you might find useful!\n\n"
                "### Python Example\n"
                "```python\n"
                "def greet_user(name: str) -> str:\n"
                "    \"\"\"\n"
                "    Generates a personalized greeting message.\n"
                "    \"\"\"\n"
                "    return f\"Hello, {name}! Welcome to our system.\"\n\n"
                "# Example Usage\n"
                "print(greet_user(\"Visitor\"))\n"
                "```\n\n"
                "Let me know if you'd like me to explain how this works or help with a different language!"
            )
            
        if "explain" in user_msg_lower or "what is" in user_msg_lower or "why" in user_msg_lower:
            return (
                "That's an interesting question! Let's break it down:\n\n"
                "1. **Core Concept**: It centers on separation of concerns and clear structure.\n"
                "2. **Primary Function**: By isolating logic into service and route layers, applications become highly maintainable.\n"
                "3. **Practical Application**: This layout prevents code bloat and facilitates modular growth.\n\n"
                "Would you like to explore any of these points in more depth?"
            )
            
        # Default fallback responses
        responses = [
            f"Thank you for sharing that! As a simulated assistant, I'm analyzing your query about: \"{user_msg}\".\n\nIs there anything specific you would like me to draft, solve, or research for you?",
            f"I hear you! That sounds like an interesting topic. Let me know how I can assist with that in detail.\n\n*(Note: You can unlock real AI responses by adding your `GROQ_API_KEY` to the `backend/.env` file and restarting the backend server)*.",
            "I'm here to help! Could you provide a bit more context or specify what you'd like to achieve? That way, I can give you a more detailed and tailored response."
        ]
        return random.choice(responses)

ai_service = AIService()
