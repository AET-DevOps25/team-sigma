from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import py_eureka_client.eureka_client as eureka_client
import uvicorn
import os
import logging
import json
import openai
from dotenv import load_dotenv
from models import DocumentModel, DocumentChunkModel, ChatRequest, ChatResponse
from chat_service import ChatService
from document_service_client import DocumentServiceClient
from prometheus_fastapi_instrumentator import Instrumentator

load_dotenv(dotenv_path="../../.env")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

EUREKA_SERVER = os.getenv("EUREKA_CLIENT_SERVICEURL_DEFAULTZONE", "http://localhost:8761/eureka/")
SERVICE_NAME = os.getenv("SPRING_APPLICATION_NAME", "chat-service")
SERVER_PORT = int(os.getenv("SERVER_PORT", "8082"))

openai.api_key = os.getenv("OPENAI_API_KEY")
if not openai.api_key:
    logger.warning("OPENAI_API_KEY not set. RAG functionality will be limited.")

document_client = DocumentServiceClient()
chat_service = ChatService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Chat Service...")    
    try:
        await eureka_client.init_async(
            eureka_server=EUREKA_SERVER,
            app_name=SERVICE_NAME,
            instance_port=SERVER_PORT,
            instance_host="chat-service"
        )
        
        logger.info(f"Registered {SERVICE_NAME} with Eureka at {EUREKA_SERVER}")
    except Exception as e:
        logger.error(f"Failed to register with Eureka: {str(e)}")    
    yield
    
    logger.info("Shutting down Chat Service...")
    try:
        eureka_client.stop()
    except Exception as e:
        logger.error(f"Error during shutdown: {str(e)}")

app = FastAPI(
    title="Chat Service",
    description="AI-powered chat service for document Q&A using RAG. Supports both general document search and document-specific queries.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics instrumentation
instrumentator = Instrumentator()
instrumentator.instrument(app).expose(app)

@app.get("/api/chat/health")
async def health_check():
    return {"status": "healthy", "service": SERVICE_NAME}

@app.get("/eureka/services")
async def get_eureka_services():
    """Debug endpoint to check if document service is discoverable via Eureka"""
    try:
        target_service = "document-service"
        
        try:
            health_response = await eureka_client.do_service(
                target_service,
                "/api/documents/",
                return_type="string"
            )
            
            if health_response:
                return {
                    "services": {
                        target_service: {
                            "status": "discovered_and_accessible",
                            "method": "eureka_client.do_service()",
                            "health_check": "success"
                        }
                    },
                    "library": "py-eureka-client"
                }
            else:
                return {
                    "services": {
                        target_service: {"status": "not_found", "error": "Service not accessible"}
                    },
                    "library": "py-eureka-client"
                }
        except Exception as e:
            return {
                "services": {
                    target_service: {"status": "discovery_failed", "error": str(e)}
                },
                "library": "py-eureka-client"
            }
        
    except Exception as e:
        logger.error(f"Failed to check Eureka services: {str(e)}")
        return {"error": str(e)}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat endpoint with RAG (Retrieval-Augmented Generation)
    
    Supports two modes:
    1. General chat: searches across all documents (no document_id provided)
    2. Document-specific chat: provide document_id to chat about a specific document
    
    Uses vector similarity search to find relevant text chunks and generates
    AI responses based strictly on the retrieved document content.
    """
    try:
        logger.info(f"Processing chat request: '{request.message}'")
        
        if request.document_id:
            try:
                await document_client.add_message_to_conversation(
                    request.document_id, 
                    "HUMAN", 
                    request.message
                )
                logger.info(f"Successfully saved user message to document {request.document_id}")
            except Exception as e:
                logger.error(f"Failed to save user message to document {request.document_id}: {str(e)}")
        
        chunks = await document_client.search_similar_chunks(request.message, limit=5)
        
        if not chunks:
            return ChatResponse(
                response="I couldn't find any relevant information in the uploaded documents to answer your question. Please make sure your question is related to the content of the documents.",
                document_info=None,
                chunk_count=0
            )
        
        ai_response = await chat_service.generate_rag_response(request.message, chunks)
        
        if request.document_id:
            try:
                await document_client.add_message_to_conversation(
                    request.document_id, 
                    "AI", 
                    ai_response
                )
                logger.info(f"Successfully saved AI response to document {request.document_id}")
            except Exception as e:
                logger.error(f"Failed to save AI response to document {request.document_id}: {str(e)}")
        
        updated_document = None
        if request.document_id:
            updated_document = await document_client.get_document_by_id(request.document_id)
        
        logger.info(f"Generated response using {len(chunks)} chunks")
        
        return ChatResponse(
            response=ai_response,
            document=updated_document,
            chunk_count=len(chunks)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error while processing chat request")


@app.get("/api/documents/{document_id}")
async def get_document_info(document_id: str):
    """Get document information by ID"""
    document = await document_client.get_document_by_id(document_id)
    
    if document is None:
        raise HTTPException(
            status_code=404,
            detail=f"Document with ID {document_id} not found"
        )
    
    return document

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=SERVER_PORT,
        reload=True
    ) 