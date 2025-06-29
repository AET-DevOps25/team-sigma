from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import py_eureka_client.eureka_client as eureka_client
import uvicorn
import os
import logging
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

EUREKA_SERVER = os.getenv("EUREKA_CLIENT_SERVICEURL_DEFAULTZONE", "http://localhost:8761/eureka/")
SERVICE_NAME = os.getenv("SPRING_APPLICATION_NAME", "chat-service")
SERVER_PORT = int(os.getenv("SERVER_PORT", "8082"))

class ChatRequest(BaseModel):
    message: str
    document_id: str

class ChatResponse(BaseModel):
    response: str

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
        logger.error(f"Error during Eureka shutdown: {str(e)}")

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

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    response_text = f"AI Response: I understand you're asking '{request.message}' about document {request.document_id}. This is a dummy response from the FastAPI chat service!"
    
    return ChatResponse(response=response_text)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=SERVER_PORT,
        reload=True
    ) 