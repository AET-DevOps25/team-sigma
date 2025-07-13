import logging
import json
import asyncio
from typing import Optional, List
from urllib.parse import quote_plus
import py_eureka_client.eureka_client as eureka_client
import httpx
from models import DocumentModel, DocumentChunkModel


logger = logging.getLogger(__name__)


class DocumentServiceClient:
    
    def __init__(self):
        self.service_name = "document-service"

    async def get_all_document_chunks(self, document_id: str) -> List[DocumentChunkModel]:
        try:
            logger.info(f"Fetching all chunks for document ID: {document_id}")            
            
            endpoint = f"/api/documents/{document_id}/chunks"            
            

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
                chunks = []
                
                for chunk_data in response:
                    chunk = DocumentChunkModel(
                        text=chunk_data["text"],
                        document_id=chunk_data["documentId"],
                        document_name=f"Document {document_id}",
                        original_filename="Unknown",
                        chunk_index=chunk_data.get("chunkIndex", 0)
                    )
                    chunks.append(chunk)
                
                logger.info(f"Successfully retrieved {len(chunks)} chunks for document {document_id}")
                return chunks
            else:
                logger.warning(f"No chunks found for document: {document_id}")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching chunks for document {document_id}: {str(e)}")
            return [] 