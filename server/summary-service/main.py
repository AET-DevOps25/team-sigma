from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import logging
import openai
from dotenv import load_dotenv
from prometheus_fastapi_instrumentator import Instrumentator
from models import SummaryRequest, SummaryResponse
from summary_service import SummaryService
from document_service_client import DocumentServiceClient

load_dotenv(dotenv_path="../../.env")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SERVICE_NAME = os.getenv("SPRING_APPLICATION_NAME", "summary-service")
SERVER_PORT = int(os.getenv("SERVER_PORT", "80"))

openai.api_key = os.getenv("OPENAI_API_KEY")
if not openai.api_key:
    logger.warning("OPENAI_API_KEY not set. Summary functionality will be limited.")

document_client = DocumentServiceClient()
summary_service = SummaryService()

app = FastAPI(
    title="Summary Service",
    description="AI-powered summary service for generating document summaries and insights",
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


@app.get("/api/summary/health")
async def health_check():
    return {"status": "healthy", "service": SERVICE_NAME}


@app.post("/api/summary", response_model=SummaryResponse)
async def generate_summary(request: SummaryRequest):
    try:
        logger.info(f"Processing summary request for document: {request.document_id}")

        chunks = await document_client.get_all_document_chunks(request.document_id)

        if not chunks:
            return SummaryResponse(
                document_id=request.document_id,
                summary="No content available to summarize for this document.",
            )

        summary = await summary_service.generate_document_summary(
            f"Document {request.document_id}", chunks
        )

        logger.info(
            f"Generated summary for document {request.document_id} using {len(chunks)} chunks"
        )

        return SummaryResponse(document_id=request.document_id, summary=summary)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Error processing summary request for document {request.document_id}: {str(e)}"
        )
        raise HTTPException(
            status_code=500,
            detail="Internal server error while processing summary request",
        )


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=SERVER_PORT, reload=True)
