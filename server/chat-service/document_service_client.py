import logging
from typing import Optional, List
from urllib.parse import quote_plus
import httpx
from models import DocumentModel, DocumentChunkModel


logger = logging.getLogger(__name__)


class DocumentServiceClient:
    def __init__(self):
        self.service_name = "document-service"
        self.http_client = httpx.AsyncClient()

    async def get_document_by_id(self, document_id: str) -> Optional[DocumentModel]:
        try:
            logger.info(f"Fetching document with ID: {document_id}")
            response = (
                await self.http_client.get(
                    f"http://{self.service_name}/api/documents/{document_id}"
                )
            ).json()

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
                    "conversation": response.get("conversation", []),
                }

                logger.info(
                    f"Successfully fetched document: {python_document_data['name']}"
                )
                return DocumentModel(**python_document_data)
            else:
                logger.warning(f"Document not found with ID: {document_id}")
                return None

        except Exception as e:
            logger.error(f"Error fetching document {document_id}: {str(e)}")
            return None

    async def search_similar_chunks(
        self, query: str, limit: int = 5
    ) -> List[DocumentChunkModel]:
        try:
            logger.info(
                f"Searching similar documents for query: '{query}' with limit: {limit}"
            )

            response = (
                await self.http_client.get(
                    f"http://{self.service_name}/api/documents/search/similar?q={quote_plus(query)}&limit={limit}"
                )
            ).json()

            if response:
                chunks = []
                document_cache = {}

                for chunk_data in response:
                    document_id = chunk_data["documentId"]

                    if document_id not in document_cache:
                        document_info = await self.get_document_by_id(str(document_id))
                        document_cache[document_id] = document_info

                    document_info = document_cache[document_id]

                    chunk = DocumentChunkModel(
                        text=chunk_data["text"],
                        document_id=document_id,
                        document_name=document_info.name
                        if document_info
                        else f"Document {document_id}",
                        original_filename=document_info.original_filename
                        if document_info
                        else "Unknown",
                        chunk_index=chunk_data.get("chunkIndex", 0),
                    )
                    chunks.append(chunk)

                logger.info(
                    f"Successfully retrieved {len(chunks)} chunks from similar documents search"
                )
                return chunks
            else:
                logger.warning(f"No chunks found for query: {query}")
                return []

        except Exception as e:
            logger.error(
                f"Error searching similar documents for query '{query}': {str(e)}"
            )
            return []

    async def add_message_to_conversation(
        self, document_id: str, message_type: str, content: str
    ) -> bool:
        try:
            logger.info(f"Adding {message_type} message to document {document_id}")
            request_body = {"messageType": message_type, "content": content}

            response = (
                await self.http_client.post(
                    f"http://{self.service_name}/api/documents/{document_id}/conversation",
                    json=request_body,
                )
            ).json()

            if response:
                logger.info(
                    f"Successfully added {message_type} message to document {document_id}"
                )
                return True
            else:
                logger.warning(f"Failed to add message to document {document_id}")
                return False

        except Exception as e:
            logger.error(f"Error adding message to document {document_id}: {str(e)}")
            return False
