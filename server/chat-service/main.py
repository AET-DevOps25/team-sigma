from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import py_eureka_client.eureka_client as eureka_client
import uvicorn
import os
import logging
import json
import asyncio
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

EUREKA_SERVER = os.getenv("EUREKA_CLIENT_SERVICEURL_DEFAULTZONE", "http://localhost:8761/eureka/")
SERVICE_NAME = os.getenv("SPRING_APPLICATION_NAME", "chat-service")
SERVER_PORT = int(os.getenv("SERVER_PORT", "8082"))

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

class ChatRequest(BaseModel):
    message: str
    document_id: str

class ChatResponse(BaseModel):
    response: str
    document_info: Optional[DocumentModel] = None

class DocumentServiceClient:
    
    def __init__(self):
        self.service_name = "document-service"
    
    async def get_document_by_id(self, document_id: str) -> Optional[DocumentModel]:
        try:
            logger.info(f"Fetching document with ID: {document_id}")
            
            endpoint = f"/api/documents/{document_id}"
            loop = asyncio.get_event_loop()
            
            response = await loop.run_in_executor(
                None,
                lambda: eureka_client.do_service(
                    self.service_name,
                    endpoint,
                    return_type="json"
                )
            )
            
            if response:
                # Convert Java field names to Python field names
                python_document_data = {
                    "id": response["id"],
                    "name": response["name"],
                    "original_filename": response["originalFilename"],
                    "content_type": response["contentType"],
                    "file_size": response["fileSize"],
                    "description": response.get("description"),
                    "organization_id": response.get("organizationId"),
                    "created_at": response["createdAt"],
                    "updated_at": response.get("updatedAt"),
                    "chunk_count": response["chunkCount"]
                }
                
                logger.info(f"Successfully fetched document: {python_document_data['name']}")
                return DocumentModel(**python_document_data)
            else:
                logger.warning(f"Document not found with ID: {document_id}")
                return None
                
        except Exception as e:
            logger.error(f"Error fetching document {document_id}: {str(e)}")
            if "404" in str(e) or "Not Found" in str(e):
                return None
            return None

document_client = DocumentServiceClient()

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
    description="AI-powered chat service for document Q&A",
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

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": SERVICE_NAME}

@app.get("/eureka/services")
async def get_eureka_services():
    """Debug endpoint to check if document service is discoverable via Eureka"""
    try:
        target_service = "document-service"
        
        try:
            # Test eureka_client.do_service to check if document service is discoverable
            loop = asyncio.get_event_loop()
            health_response = await loop.run_in_executor(
                None,
                lambda: eureka_client.do_service(target_service, "/api/documents/", return_type="string")
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
    """Chat endpoint that fetches document information and provides contextual responses"""
    
    # Fetch document information from document service via Eureka
    document = await document_client.get_document_by_id(request.document_id)
    
    if document is None:
        raise HTTPException(
            status_code=404, 
            detail=f"Document with ID {request.document_id} not found"
        )
    
    # Generate contextual response based on document information
    response_text = (
        f"AI Response: I understand you're asking '{request.message}' about the document "
        f"'{document.name}' (ID: {document.id}). This document was uploaded on "
        f"{document.created_at.strftime('%Y-%m-%d %H:%M:%S')} and contains {document.chunk_count} "
        f"chunks of processed content. The original file '{document.original_filename}' "
        f"is {document.file_size / 1024:.1f} KB in size."
    )
    
    if document.description:
        response_text += f" Document description: {document.description}"
    
    # For now, this is a enhanced dummy response. 
    # TODO: Implement actual AI processing using document chunks for RAG
    response_text += " [This is currently a demonstration response - full AI integration pending]"
    
    logger.info(f"Processed chat request for document {document.name}")
    
    return ChatResponse(
        response=response_text,
        document_info=document
    )

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