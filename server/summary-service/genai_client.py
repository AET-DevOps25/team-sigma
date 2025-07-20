from typing import Any
import httpx


class GenaiClient:
    def __init__(self):
        self.http_client = httpx.AsyncClient()

    async def generate_content(
        self,
        messages: list[str],
        system_prompt: str | None = None,
        temperature: float = 0.1,
    ) -> dict[str, Any]:
        return (
            await self.http_client.post(
                "http://genai-service/api/genai/generate-content",
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{"parts": [{"text": message}]}] for message in messages
                }
                | {
                    "system_prompt": system_prompt or "You are a helpful AI assistant.",
                    "temperature": temperature,
                },
            )
        ).json()
