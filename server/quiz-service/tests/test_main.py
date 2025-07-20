import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, Mock
from main import app

client = TestClient(app)

def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/api/quiz/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
@patch('main.document_client.download_document_by_id')
@patch('main.genai_client.generate_content')
async def test_generate_quiz_document_not_found(mock_generate_content, mock_download_document):
    """Test quiz generation when document is not found"""
    mock_download_document.return_value = None
    
    response = client.post("/api/quiz/test-123")
    
    assert response.status_code == 404
    assert response.json()["detail"] == "Document not found"
    mock_generate_content.assert_not_called()

@pytest.mark.asyncio
@patch('main.document_client.download_document_by_id')
@patch('main.genai_client.generate_content')
async def test_generate_quiz_success(mock_generate_content, mock_download_document):
    """Test successful quiz generation"""
    mock_download_document.return_value = b"test document content"
    
    mock_genai_response = {
        "content": {
            "parts": [{
                "text": '''[
                    {
                        "question": "What is Python?",
                        "option1": "A programming language",
                        "option2": "A snake",
                        "option3": "A text editor",
                        "option4": "An operating system",
                        "correct_answer": 0,
                        "explanation": "Python is a popular programming language"
                    }
                ]'''
            }]
        }
    }
    mock_generate_content.return_value = mock_genai_response
    
    response = client.post("/api/quiz/test-123")
    
    assert response.status_code == 200
    questions = response.json()
    assert len(questions) == 1
    assert questions[0]["question"] == "What is Python?"
    assert len(questions[0]["options"]) == 4
    assert questions[0]["options"][0] == "A programming language"
    assert questions[0]["correctAnswer"] == 0
    assert questions[0]["explanation"] == "Python is a popular programming language"
    assert "id" in questions[0]