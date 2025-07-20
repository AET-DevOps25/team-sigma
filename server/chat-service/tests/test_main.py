import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from main import app
from models import DocumentModel, ConversationMessage

client = TestClient(app)

def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/api/chat/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
@patch('main.document_client.search_similar_chunks')
@patch('main.chat_service.generate_rag_response')
async def test_chat_no_document(mock_generate_response, mock_search_chunks):
    """Test chat without a specific document"""
    mock_search_chunks.return_value = ["chunk1", "chunk2"]
    mock_generate_response.return_value = "Test response"
    
    response = client.post(
        "/api/chat",
        json={"message": "test question", "document_id": None}
    )
    
    assert response.status_code == 200
    assert response.json()["response"] == "Test response"
    assert response.json()["chunk_count"] == 2
    assert response.json()["document"] is None

@pytest.mark.asyncio
@patch('main.document_client.search_similar_chunks')
async def test_chat_no_relevant_chunks(mock_search_chunks):
    """Test chat when no relevant chunks are found"""
    mock_search_chunks.return_value = []
    
    response = client.post(
        "/api/chat",
        json={"message": "test question", "document_id": None}
    )
    
    assert response.status_code == 200
    assert isinstance(response.json()["response"], str)
    assert len(response.json()["response"]) > 0
    assert response.json()["chunk_count"] == 0

@pytest.mark.asyncio
@patch('main.document_client.get_document_by_id')
async def test_get_document_not_found(mock_get_document):
    """Test getting non-existent document"""
    mock_get_document.return_value = None
    
    response = client.get("/api/documents/123")
    assert response.status_code == 404
