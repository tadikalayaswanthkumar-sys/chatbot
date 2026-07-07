import os

PROMPT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SYSTEM_PROMPT_PATH = os.path.join(PROMPT_DIR, "prompts", "system_prompt.txt")

def get_system_prompt() -> str:
    """
    Reads the system prompt from the prompt file.
    Falls back to a default prompt if the file does not exist.
    """
    if os.path.exists(SYSTEM_PROMPT_PATH):
        try:
            with open(SYSTEM_PROMPT_PATH, "r", encoding="utf-8") as f:
                return f.read().strip()
        except Exception:
            pass
    
    return (
        "You are a helpful, professional, and friendly AI chatbot assistant. "
        "Keep your answers clear, concise, and structured."
    )
