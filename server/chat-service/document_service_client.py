import logging
import asyncio
import json
from typing import Optional, List
from urllib.parse import quote_plus
import py_eureka_client.eureka_client as eureka_client
import httpx
from models import DocumentModel, DocumentChunkModel


logger = logging.getLogger(__name__)


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
                    "chunk_count": response["chunkCount"],
                    "conversation": response.get("conversation", [])
                }
                
                logger.info(f"Successfully fetched document: {python_document_data['name']}")
                return DocumentModel(**python_document_data)
            else:
                logger.warning(f"Document not found with ID: {document_id}")
                return None
                
        except Exception as e:
            logger.error(f"Error fetching document {document_id}: {str(e)}")
            return None

    async def search_similar_chunks(self, query: str, limit: int = 5) -> List[DocumentChunkModel]:
        try:
            logger.info(f"Searching similar chunks for query: '{query}' with limit: {limit}")
            
            endpoint = f"/api/documents/search/chunks?q={quote_plus(query)}&limit={limit}"
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
                        document_name=chunk_data["documentName"],
                        original_filename=chunk_data["originalFilename"],
                        chunk_index=chunk_data["chunkIndex"]
                    )
                    chunks.append(chunk)
                
                logger.info(f"Successfully retrieved {len(chunks)} chunks")
                return chunks
            else:
                logger.warning(f"No chunks found for query: {query}")
                return []
                
        except Exception as e:
            logger.error(f"Error searching chunks for query '{query}': {str(e)}")
            return []

    async def add_message_to_conversation(self, document_id: str, message_type: str, content: str) -> bool:
        try:
            logger.info(f"Adding {message_type} message to document {document_id}")
            
            endpoint = f"/api/documents/{document_id}/conversation"
            loop = asyncio.get_event_loop()
            
            request_body = {
                "messageType": message_type,
                "content": content
            }
            
            response = await loop.run_in_executor(
                None,
                lambda: eureka_client.do_service(
                    self.service_name,
                    endpoint,
                    return_type="json",
                    method="POST",
                    data=request_body,
                    headers={"Content-Type": "application/json"}
                )
            )
            
            if response:
                logger.info(f"Successfully added {message_type} message to document {document_id}")
                return True
            else:
                logger.warning(f"Failed to add message to document {document_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error adding message to document {document_id}: {str(e)}")
            return False 