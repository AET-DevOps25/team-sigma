import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
import os

os.environ["GEMINI_API_KEY"] = "test-api-key"

from main import app

client = TestClient(app)

def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/api/genai/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
@patch('httpx.AsyncClient.post')
async def test_generate_content_success(mock_post):
    """Test successful content generation"""
    # Mock response from Gemini API
    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_response.text = '''
    {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "text": "Generated response"
                        }
                    ]
                }
            }
        ]
    }
    '''
    mock_post.return_value = mock_response
    
    response = client.post(
        "/api/genai/generate-content",
        json={
            "contents": [
                {
                    "parts": [
                        {
                            "text": "Hello"
                        }
                    ]
                }
            ],
            "system_prompt": "You are a test assistant",
            "temperature": 0.7
        }
    )
    
    assert response.status_code == 200

@pytest.mark.asyncio
@patch('httpx.AsyncClient.post')
async def test_generate_content_api_error(mock_post):
    """Test error handling when Gemini API fails"""
    # Mock error response from Gemini API
    mock_response = AsyncMock()
    mock_response.status_code = 500
    mock_response.text = "Internal Server Error"
    mock_post.return_value = mock_response
    
    response = client.post(
        "/api/genai/generate-content",
        json={
            "contents": [
                {
                    "parts": [
                        {
                            "text": "Hello"
                        }
                    ]
                }
            ]
        }
    )
    
    assert response.status_code == 500
