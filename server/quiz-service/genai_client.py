import base64
from typing import Any
import httpx
from pydantic import BaseModel


class GenaiClient:
    def __init__(self):
        self.http_client = httpx.AsyncClient(timeout=60.0 * 5)

    async def generate_content(
        self,
        files: list[bytes],
        messages: list[str],
        system_prompt: str | None = None,
        temperature: float = 0.1,
        response_schema: BaseModel | None = None,
    ) -> dict[str, Any]:
        parts = []

        for file in files:
            parts.append(
                {
                    "inline_data": {
                        "mime_type": "application/pdf",
                        "data": base64.b64encode(file).decode("utf-8"),
                    }
                }
            )
        for message in messages:
            parts.append({"text": message})

        return (
            await self.http_client.post(
                "http://genai-service/api/genai/generate-content",
                headers={"Content-Type": "application/json"},
                json={"contents": [{"parts": parts}]}
                | {
                    "system_prompt": system_prompt or "You are a helpful AI assistant.",
                    "temperature": temperature,
                    "response_schema": response_schema.model_json_schema()
                    if response_schema
                    else None,
                },
            )
        ).json()
