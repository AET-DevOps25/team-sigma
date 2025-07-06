from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


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
    document_info: Optional[DocumentModel] = None
    sources: List[str] = []
    chunk_count: int = 0 