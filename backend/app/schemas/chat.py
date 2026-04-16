import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.enums import MessageRole


class SendMessageRequest(BaseModel):
    content: str
    model: str | None = None


class ChatMessageResponse(BaseModel):
    id: uuid.UUID
    agent_type: str
    role: MessageRole
    content: str
    metadata_: dict | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatHistoryResponse(BaseModel):
    messages: list[ChatMessageResponse]
    total: int
