from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import logging
import openai
from dotenv import load_dotenv
from models import ChatRequest, ChatResponse
from chat_service import ChatService
from document_service_client import DocumentServiceClient
from prometheus_fastapi_instrumentator import Instrumentator

load_dotenv(dotenv_path="../../.env")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SERVICE_NAME = os.getenv("SPRING_APPLICATION_NAME", "chat-service")
SERVER_PORT = int(os.getenv("SERVER_PORT", "80"))

openai.api_key = os.getenv("OPENAI_API_KEY")
if not openai.api_key:
    logger.warning("OPENAI_API_KEY not set. RAG functionality will be limited.")

document_client = DocumentServiceClient()
chat_service = ChatService()

app = FastAPI(
    title="Chat Service",
    description="AI-powered chat service for document Q&A using RAG. Supports both general document search and document-specific queries.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

instrumentator = Instrumentator()
instrumentator.instrument(app).expose(app)


@app.get("/api/chat/health")
async def health_check():
    return {"status": "healthy", "service": SERVICE_NAME}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        logger.info(f"Processing chat request: '{request.message}'")

        conversation_history = None
        if request.document_id:
            current_document = await document_client.get_document_by_id(
                request.document_id
            )
            if current_document and current_document.conversation:
                conversation_history = current_document.conversation

            try:
                await document_client.add_message_to_conversation(
                    request.document_id, "HUMAN", request.message
                )
                logger.info(
                    f"Successfully saved user message to document {request.document_id}"
                )
            except Exception as e:
                logger.error(
                    f"Failed to save user message to document {request.document_id}: {str(e)}"
                )

        chunks = await document_client.search_similar_chunks(request.message, limit=5)

        if not chunks and not conversation_history:
            return ChatResponse(
                response="I couldn't find any relevant information in the uploaded documents to answer your question. Please make sure your question is related to the content of the documents.",
                document=None,
                chunk_count=0,
            )

        ai_response = await chat_service.generate_rag_response(
            request.message, chunks, conversation_history
        )

        if request.document_id:
            try:
                await document_client.add_message_to_conversation(
                    request.document_id, "AI", ai_response
                )
                logger.info(
                    f"Successfully saved AI response to document {request.document_id}"
                )
            except Exception as e:
                logger.error(
                    f"Failed to save AI response to document {request.document_id}: {str(e)}"
                )

        updated_document = None
        if request.document_id:
            updated_document = await document_client.get_document_by_id(
                request.document_id
            )

        logger.info(
            f"Generated response using {len(chunks)} chunks and conversation history: {conversation_history is not None}"
        )

        return ChatResponse(
            response=ai_response, document=updated_document, chunk_count=len(chunks)
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error while processing chat request",
        )


@app.get("/api/documents/{document_id}")
async def get_document_info(document_id: str):
    """Get document information by ID"""
    document = await document_client.get_document_by_id(document_id)

    if document is None:
        raise HTTPException(
            status_code=404, detail=f"Document with ID {document_id} not found"
        )

    return document


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=SERVER_PORT, reload=True)
