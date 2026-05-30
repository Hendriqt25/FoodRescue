from pydantic import BaseModel


class ChatbotInput(BaseModel):
    message: str