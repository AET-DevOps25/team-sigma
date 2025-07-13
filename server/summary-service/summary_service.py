import openai
import logging
import time
from typing import List
from fastapi import HTTPException
from models import DocumentChunkModel
from prometheus_client import Counter, Histogram, Gauge


logger = logging.getLogger(__name__)

# Prometheus metrics for AI usage tracking
ai_summary_requests_total = Counter(
    'ai_summary_requests_total',
    'Total number of AI summary requests',
    ['model', 'status']
)

ai_summary_tokens_used = Counter(
    'ai_summary_tokens_used_total',
    'Total tokens used by AI model for summaries',
    ['model', 'token_type']
)


SUMMARY_PROMPT = """You are an expert document summarizer. Your task is to create a comprehensive, well-structured summary of the provided document content.

INSTRUCTIONS:
1. Create a concise but comprehensive summary that captures the main themes, key points, and important details
2. Structure your summary with clear sections if the content warrants it
3. Focus on the most important information and insights
4. Be objective and factual, avoiding personal opinions
5. If the document contains specific data, examples, or conclusions, include them in your summary
6. Aim for a summary that is about 10-20% of the original length but captures all essential information

DOCUMENT CONTENT:
{content}

SUMMARY:"""


class SummaryService:
    
    def __init__(self):
        self.client = None
        if openai.api_key:
            try:
                self.client = openai.OpenAI(api_key=openai.api_key)
                logger.info("OpenAI client initialized successfully for summary service")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI client: {str(e)}")
                self.client = None
    
    async def generate_document_summary(self, document_name: str, chunks: List[DocumentChunkModel]) -> str:
        if not self.client:
            ai_summary_requests_total.labels(model="gpt-3.5-turbo", status="failed").inc()
            raise HTTPException(status_code=500, detail="Summary service temporarily unavailable. Please try again later.")
        
        if not chunks:
            ai_summary_requests_total.labels(model="gpt-3.5-turbo", status="no_chunks").inc()
            return "No content available to summarize for this document."
        
        # Combine all chunks into one text
        combined_content = ""
        for chunk in chunks:
            combined_content += f"{chunk.text}\n\n"
        
        # Truncate content if it's too long for the model
        max_content_length = 10000
        if len(combined_content) > max_content_length:
            combined_content = combined_content[:max_content_length] + "...\n\n[Content truncated due to length]"
        
        model_name = "gpt-3.5-turbo"
        
        try:
            response = self.client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": f"You are an expert document summarizer. Create a comprehensive summary of the document '{document_name}'."},
                    {"role": "user", "content": SUMMARY_PROMPT.format(content=combined_content)}
                ],
                max_tokens=1000,  # Allow for longer summaries
                temperature=0.1
            )
            
            # Track token usage
            if hasattr(response, 'usage') and response.usage:
                ai_summary_tokens_used.labels(model=model_name, token_type="prompt").inc(response.usage.prompt_tokens)
                ai_summary_tokens_used.labels(model=model_name, token_type="completion").inc(response.usage.completion_tokens)
                ai_summary_tokens_used.labels(model=model_name, token_type="total").inc(response.usage.total_tokens)
            
            # Track successful request
            ai_summary_requests_total.labels(model=model_name, status="success").inc()
            
            logger.info(f"AI summary request completed - Model: {model_name}, Document: {document_name}, Chunks: {len(chunks)}")
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            # Track failed request
            ai_summary_requests_total.labels(model=model_name, status="failed").inc()
            
            logger.error(f"Error generating AI summary for document {document_name}: {str(e)}")
            return f"I apologize, but I encountered an error while generating the summary for '{document_name}'. Please try again." 