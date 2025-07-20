import pytest
from unittest.mock import patch, Mock
from chat_service import ChatService
from models import ConversationMessage, DocumentChunkModel
from datetime import datetime

@pytest.fixture
def chat_service():
    return ChatService()

@pytest.mark.asyncio
async def test_generate_rag_response_no_chunks(chat_service):
    """Test response generation with no chunks"""
    response = await chat_service.generate_rag_response(
        "test question",
        chunks=[],
        conversation_history=None
    )
    # Verify we get a non-empty response
    assert isinstance(response, str)
    assert len(response) > 0

@pytest.mark.asyncio
async def test_generate_rag_response_with_history(chat_service):
    """Test response generation with conversation history"""
    history = [
        ConversationMessage(
            messageIndex=1,
            messageType="HUMAN",
            content="Previous question",
            createdAt=datetime.now().isoformat()
        ),
        ConversationMessage(
            messageIndex=2,
            messageType="AI",
            content="Previous answer",
            createdAt=datetime.now().isoformat()
        )
    ]
    
    chunks = [
        DocumentChunkModel(
            text="This is test chunk 1",
            document_id=1,
            document_name="Test Doc 1",
            original_filename="test1.pdf",
            chunk_index=1
        ),
        DocumentChunkModel(
            text="This is test chunk 2",
            document_id=1,
            document_name="Test Doc 1",
            original_filename="test1.pdf",
            chunk_index=2
        )
    ]
    
    # Mock the genai client's generate_content method
    with patch.object(chat_service.genai_client, 'generate_content') as mock_generate:
        mock_generate.return_value = {"content": {"parts": [{"text": "Test response"}]}}
        response = await chat_service.generate_rag_response(
            "test question",
            chunks=chunks,
            conversation_history=history
        )
        assert isinstance(response, str)
        assert len(response) > 0
