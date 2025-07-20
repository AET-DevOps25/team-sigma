import logging
from typing import Optional
import httpx
from models import DocumentModel


logger = logging.getLogger(__name__)


class DocumentServiceClient:
    def __init__(self):
        self.service_name = "document-service"
        self.http_client = httpx.AsyncClient()

    async def download_document_by_id(self, document_id: str) -> Optional[bytes]:
        try:
            logger.info(f"Fetching document with ID: {document_id}")
            return (
                await self.http_client.get(
                    f"http://{self.service_name}/api/documents/{document_id}/download"
                )
            ).content

        except Exception as e:
            logger.error(f"Error fetching document {document_id}: {str(e)}")
            return None
