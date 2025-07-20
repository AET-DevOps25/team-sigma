# noqa: D104
import uuid
from fastapi import FastAPI, HTTPException
from document_service_client import DocumentServiceClient
from genai_client import GenaiClient
from pydantic import RootModel
from models import LLMQuizQuestion, QuizQuestion

app = FastAPI(
    title="Quiz Service",
    description="Generates quiz questions for documents using GenAI",
    version="1.0.0",
    openapi_url="/api/quiz/openapi.json",
    docs_url="/api/quiz/swagger-ui.html",
    redoc_url="/api/quiz/redoc",
)

document_client = DocumentServiceClient()
genai_client = GenaiClient()


PROMPT = """
Generate 10 quiz questions for the given document.
The questions are single-choice questions with 4 options.
The questions should be like in an exam, meaning they shouldn't contain details that nobody cares about.
Those questions will prepare students for an exam.
Make sure that the whole slide is covered by the questions.
""".strip()


@app.get("/api/quiz/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.post("/api/quiz/{document_id}")
async def index(document_id: str) -> list[QuizQuestion]:
    document_bytes = await document_client.download_document_by_id(document_id)
    if not document_bytes:
        raise HTTPException(status_code=404, detail="Document not found")

    response_schema = RootModel[list[LLMQuizQuestion]]

    response = await genai_client.generate_content(
        files=[document_bytes],
        messages=[PROMPT],
        system_prompt="You are a helpful assistant that generates quiz questions for a given document.",
        temperature=0.1,
        response_schema=response_schema,
    )

    questions = response_schema.model_validate_json(
        response["content"]["parts"][0]["text"]
    )

    return [
        QuizQuestion(
            id=str(uuid.uuid4()),
            question=question.question,
            options=[
                question.option1,
                question.option2,
                question.option3,
                question.option4,
            ],
            correct_answer=question.correct_answer,
            explanation=question.explanation,
        )
        for question in questions.root
    ]


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=3000)
