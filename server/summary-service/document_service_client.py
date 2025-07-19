import logging
from typing import List
import httpx
from models import DocumentChunkModel


logger = logging.getLogger(__name__)


class DocumentServiceClient:
    def __init__(self):
        self.service_name = "document-service"
        self.http_client = httpx.AsyncClient()

    async def get_all_document_chunks(
        self, document_id: str
    ) -> List[DocumentChunkModel]:
        try:
            logger.info(f"Fetching all chunks for document ID: {document_id}")

            response = await self.http_client.get(
                f"http://{self.service_name}/api/documents/{document_id}/chunks"
            )

            if response:
                chunks = []

                for chunk_data in response:
                    chunk = DocumentChunkModel(
                        text=chunk_data["text"],
                        document_id=chunk_data["documentId"],
                        document_name=f"Document {document_id}",
                        original_filename="Unknown",
                        chunk_index=chunk_data.get("chunkIndex", 0),
                    )
                    chunks.append(chunk)

                logger.info(
                    f"Successfully retrieved {len(chunks)} chunks for document {document_id}"
                )
                return chunks
            else:
                logger.warning(f"No chunks found for document: {document_id}")
                return []

        except Exception as e:
            logger.error(f"Error fetching chunks for document {document_id}: {str(e)}")
            return []
