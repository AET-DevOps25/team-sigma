from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class ConversationMessage(BaseModel):
    messageIndex: int
    messageType: str
    content: str
    createdAt: str

class DocumentModel(BaseModel):
    id: int
    name: str
    original_filename: str
    content_type: str
    file_size: int
    description: Optional[str] = None
    organization_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    chunk_count: int
    conversation: Optional[List[ConversationMessage]] = []


class DocumentChunkModel(BaseModel):
    text: str
    document_id: int
    document_name: str
    original_filename: str
    chunk_index: int


class ChatRequest(BaseModel):
    message: str
    document_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    document: Optional[DocumentModel] = None  # Full updated document with conversation
    sources: List[str] = []
    chunk_count: int = 0 