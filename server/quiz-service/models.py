from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


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


class LLMQuizQuestion(BaseModel):
    question: str = Field(..., description="The question to be answered")
    option1: str = Field(..., description="The first option")
    option2: str = Field(..., description="The second option")
    option3: str = Field(..., description="The third option")
    option4: str = Field(..., description="The fourth option")
    correct_answer: int = Field(
        ...,
        min=0,
        max=3,
        description="The index of the correct answer",
        serialization_alias="correctAnswer",
    )
    explanation: str = Field(..., description="The explanation of the correct answer")


class QuizQuestion(BaseModel):
    id: str
    question: str
    options: list[str]
    correct_answer: int = Field(..., serialization_alias="correctAnswer")
    explanation: str
