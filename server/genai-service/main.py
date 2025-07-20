from typing import List
from pydantic import BaseModel, Field, ConfigDict
from pydantic_settings import BaseSettings, SettingsConfigDict
from fastapi import FastAPI, HTTPException, status
import httpx


# Environment configuration
class Env(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    gemini_api_key: str = Field(..., env="GEMINI_API_KEY")


class GeminiGenerationPartInlineDataData(BaseModel):
    mime_type: str = Field(..., serialization_alias="mimeType")
    data: str = Field(..., serialization_alias="data")


# Pydantic models for Gemini API structures
class GeminiGenerationPartText(BaseModel):
    text: str


class GeminiGenerationPartInlineData(BaseModel):
    inline_data: GeminiGenerationPartInlineDataData = Field(
        ..., serialization_alias="inlineData"
    )


class GeminiGenerationContent(BaseModel):
    parts: List[GeminiGenerationPartText | GeminiGenerationPartInlineData]


class GeminiGenerationConfig(BaseModel):
    temperature: float


class GeminiGenerationRequest(BaseModel):
    contents: List[GeminiGenerationContent]
    system_instruction: GeminiGenerationContent | None = Field(
        ..., serialization_alias="systemInstruction"
    )
    generation_config: GeminiGenerationConfig = Field(
        ..., serialization_alias="generationConfig"
    )


class GeminiGenerationCandidate(BaseModel):
    content: GeminiGenerationContent


class GeminiGenerationResponse(BaseModel):
    candidates: List[GeminiGenerationCandidate]


class GenerateContentRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    contents: List[GeminiGenerationContent]
    system_prompt: str | None = Field(default=None)
    model: str = Field(default="gemini-2.5-flash-lite-preview-06-17")
    temperature: float = Field(default=1.0)


class GenerateContentResponse(BaseModel):
    content: GeminiGenerationContent


def _create_gemini_client(env: Env) -> httpx.AsyncClient:
    headers = {
        "x-goog-api-key": env.gemini_api_key,
        "Content-Type": "application/json",
    }
    return httpx.AsyncClient(headers=headers)


# Initialize application
env = Env()
gemini_client = _create_gemini_client(env)
app = FastAPI()


@app.post("/api/genai/generate-content")
async def generate_content(request: GenerateContentRequest) -> GenerateContentResponse:
    gemini_request = GeminiGenerationRequest(
        contents=request.contents,
        system_instruction=GeminiGenerationContent(
            parts=[
                GeminiGenerationPartText(
                    text=request.system_prompt or "You are a helpful AI assistant."
                )
            ]
        ),
        generation_config=GeminiGenerationConfig(temperature=request.temperature),
    )

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{request.model}:generateContent"

        response = await gemini_client.post(
            url,
            content=gemini_request.model_dump_json(exclude_none=True, by_alias=True),
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to call Gemini API: {response.text}",
            )

        response = GeminiGenerationResponse.model_validate_json(response.text)
        if not response.candidates:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Empty response from Gemini API",
            )

        return GenerateContentResponse(content=response.candidates[0].content)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@app.on_event("shutdown")
async def shutdown_event():
    await gemini_client.aclose()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=3000)
