import logging
from typing import List
from fastapi import HTTPException
from models import DocumentChunkModel
from genai_client import GenaiClient
from prometheus_client import Counter


logger = logging.getLogger(__name__)

# Prometheus metrics for AI usage tracking
ai_summary_requests_total = Counter(
    "ai_summary_requests_total",
    "Total number of AI summary requests",
    ["model", "status"],
)

ai_summary_tokens_used = Counter(
    "ai_summary_tokens_used_total",
    "Total tokens used by AI model for summaries",
    ["model", "token_type"],
)


SUMMARY_PROMPT = """You are an expert document summarizer. Your task is to create a comprehensive, well-structured summary of the provided document content.

INSTRUCTIONS:
1. Create a concise but comprehensive summary that captures the main themes, key points, and important details
2. Use markdown formatting to structure your summary with clear sections, headings, and bullet points
3. Structure your response with the following format:
   - Start with a brief overview paragraph
   - Use ## headings for main sections
   - Use bullet points (•) for key information within sections
   - Use **bold** for important terms or concepts
   - Use *italics* for emphasis where appropriate
4. Focus on the most important information and insights
5. Be objective and factual, avoiding personal opinions
6. Aim for a summary that is about 10-20% of the original length but captures all essential information

DOCUMENT CONTENT:
{content}

SUMMARY:"""


class SummaryService:
    def __init__(self):
        try:
            self.genai_client = GenaiClient()
        except Exception as e:
            logger.error(f"Failed to initialize GenAI client: {str(e)}")
            self.genai_client = None

    async def generate_document_summary(
        self, document_name: str, chunks: List[DocumentChunkModel]
    ) -> str:
        if not self.genai_client:
            ai_summary_requests_total.labels(
                model="gpt-3.5-turbo", status="failed"
            ).inc()
            raise HTTPException(
                status_code=503,
                detail="Summary service temporarily unavailable. Please try again later.",
            )

        if not chunks:
            ai_summary_requests_total.labels(
                model="gpt-3.5-turbo", status="no_chunks"
            ).inc()
            return "No content available to summarize for this document."

        # Combine all chunks into one text
        combined_content = ""
        for chunk in chunks:
            combined_content += f"{chunk.text}\n\n"

        # Truncate content if it's too long for the model
        max_content_length = 10000
        if len(combined_content) > max_content_length:
            combined_content = (
                combined_content[:max_content_length]
                + "...\n\n[Content truncated due to length]"
            )

        model_name = "gpt-3.5-turbo"

        try:
            # Prepare the messages for GenAI service
            system_prompt = f"You are an expert document summarizer. Create a comprehensive summary of the document '{document_name}'."
            user_message = SUMMARY_PROMPT.format(content=combined_content)

            response = await self.genai_client.generate_content(
                messages=[user_message], system_prompt=system_prompt, temperature=0.1
            )

            if hasattr(response, "usage") and response.usage:
                ai_summary_tokens_used.labels(
                    model=model_name, token_type="prompt"
                ).inc(response.usage.prompt_tokens)
                ai_summary_tokens_used.labels(
                    model=model_name, token_type="completion"
                ).inc(response.usage.completion_tokens)
                ai_summary_tokens_used.labels(model=model_name, token_type="total").inc(
                    response.usage.total_tokens
                )

            ai_summary_requests_total.labels(model=model_name, status="success").inc()
            logger.info(
                f"AI summary request completed - Model: {model_name}, Document: {document_name}, Chunks: {len(chunks)}"
            )

            return response["content"]["parts"][0]["text"]

        except Exception as e:
            ai_summary_requests_total.labels(model=model_name, status="failed").inc()
            logger.error(
                f"Error generating AI summary for document {document_name}: {str(e)}"
            )
            return f"I apologize, but I encountered an error while generating the summary for '{document_name}'. Please try again."
