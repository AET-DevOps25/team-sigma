import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from main import app

client = TestClient(app)

def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/api/summary/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
@patch('main.document_client.get_all_document_chunks')
async def test_generate_summary_no_chunks(mock_get_chunks):
    """Test summary generation with no chunks available"""
    mock_get_chunks.return_value = []
    
    response = client.post(
        "/api/summary",
        json={"document_id": "test-123"}
    )
    
    assert response.status_code == 200
    assert "No content available" in response.json()["summary"] 