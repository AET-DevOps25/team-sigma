import pytest
from unittest.mock import patch, Mock
from summary_service import SummaryService
from models import DocumentChunkModel
from fastapi import HTTPException
from genai_client import GenaiClient

@pytest.fixture
def summary_service():
    return SummaryService()

@pytest.mark.asyncio
async def test_empty_chunks(summary_service):
    """Test summary generation with empty chunks"""
    summary = await summary_service.generate_document_summary("Test Doc", [])
    assert summary == "No content available to summarize for this document."

@pytest.mark.asyncio
@patch('genai_client.GenaiClient.__init__')
async def test_service_unavailable(mock_genai_init):
    """Test behavior when genai client is not available"""
    mock_genai_init.side_effect = Exception("Failed to initialize")    
    service = SummaryService()
    
    test_chunk = DocumentChunkModel(
        text="test content",
        document_id=123,
        document_name="Test Document",
        original_filename="test.pdf",
        chunk_index=1
    )
    
    with pytest.raises(HTTPException) as exc:
        await service.generate_document_summary("Test Doc", [test_chunk])
    assert exc.value.status_code == 503
    assert "Summary service temporarily unavailable" in str(exc.value.detail) 