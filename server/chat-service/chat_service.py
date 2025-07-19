import openai
import logging
import time
from typing import List, Optional
from fastapi import HTTPException
from models import DocumentChunkModel, ConversationMessage
from prometheus_client import Counter, Histogram, Gauge


logger = logging.getLogger(__name__)

# Prometheus metrics for AI usage tracking
ai_requests_total = Counter(
    'ai_requests_total',
    'Total number of AI requests',
    ['model', 'status']
)

ai_tokens_used = Counter(
    'ai_tokens_used_total',
    'Total tokens used by AI model',
    ['model', 'token_type']
)


PROMPT = """You are a helpful AI assistant that answers questions based on the provided document content and conversation history.

IMPORTANT INSTRUCTIONS:
1. Use information from both the provided documents and conversation history to answer questions
2. If the question cannot be answered from either the documents or conversation history, clearly state that you don't have that information
3. Do not make up or infer information not explicitly stated in the documents or conversation
4. Be concise and accurate
5. Use the conversation history to understand context
6. If no document content is available but conversation history exists, answer based on the conversation history

DOCUMENT CONTENT:
{context}

CONVERSATION HISTORY:
{conversation_history}

CURRENT QUESTION: {query}

ANSWER:"""


class ChatService:
    
    def __init__(self):
        self.client = None
        if openai.api_key:
            try:
                self.client = openai.OpenAI(api_key=openai.api_key)
                logger.info("OpenAI client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI client: {str(e)}")
                self.client = None
    
    async def generate_rag_response(self, query: str, chunks: List[DocumentChunkModel], conversation_history: Optional[List[ConversationMessage]] = None) -> str:
        if not self.client:
            ai_requests_total.labels(model="gpt-3.5-turbo", status="failed").inc()
            raise HTTPException(status_code=500, detail="Service temporarily unavailable. Please try again later.")
        
        # Check if we have either chunks or conversation history
        if not chunks and not conversation_history:
            ai_requests_total.labels(model="gpt-3.5-turbo", status="no_content").inc()
            return "I couldn't find any relevant information in the uploaded documents to answer your question. Please make sure your question is related to the content of the documents."
        
        # Build document context
        context = ""
        if chunks:
            for i, chunk in enumerate(chunks):
                context += f"{chunk.text}\n\n"
        else:
            context = "No relevant document content found for this specific question."

        # Format conversation history
        conversation_context = ""
        if conversation_history:
            # Get the last 10 messages to avoid token limit issues
            recent_history = conversation_history[-10:] if len(conversation_history) > 10 else conversation_history
            for msg in recent_history:
                role = "Human" if msg.messageType == "HUMAN" else "Assistant"
                conversation_context += f"{role}: {msg.content}\n"
        
        if not conversation_context:
            conversation_context = "No previous conversation."

        model_name = "gpt-3.5-turbo"
        
        try:
            response = self.client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": "You are a helpful AI assistant that answers questions based on provided document content and conversation history. Use both sources to provide accurate answers. Never make up information not found in the sources."},
                    {"role": "user", "content": PROMPT.format(context=context, conversation_history=conversation_context, query=query)}
                ],
                max_tokens=500,
                temperature=0.1
            )
            
            # Track token usage
            if hasattr(response, 'usage') and response.usage:
                ai_tokens_used.labels(model=model_name, token_type="prompt").inc(response.usage.prompt_tokens)
                ai_tokens_used.labels(model=model_name, token_type="completion").inc(response.usage.completion_tokens)
                ai_tokens_used.labels(model=model_name, token_type="total").inc(response.usage.total_tokens)
            
            # Track successful request
            ai_requests_total.labels(model=model_name, status="success").inc()
            
            logger.info(f"AI request completed - Model: {model_name}, Chunks: {len(chunks)}, History messages: {len(conversation_history) if conversation_history else 0}")
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            # Track failed request
            ai_requests_total.labels(model=model_name, status="failed").inc()
            
            logger.error(f"Error generating AI response: {str(e)}")
            return f"I apologize, but I encountered an error while processing your question. Please try again." 