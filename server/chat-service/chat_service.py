import openai
import logging
from typing import List
from fastapi import HTTPException
from models import DocumentChunkModel


logger = logging.getLogger(__name__)


PROMPT = """You are a helpful AI assistant that answers questions based strictly on the provided document content. 

IMPORTANT INSTRUCTIONS:
1. Only answer questions using information from the provided documents
2. If the question cannot be answered from the documents, clearly state that you don't have that information
3. Do not make up or infer information not explicitly stated in the documents
4. When possible, reference which document your information comes from
5. Be concise and accurate

DOCUMENT CONTENT:
{context}

QUESTION: {query}

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
    
    async def generate_rag_response(self, query: str, chunks: List[DocumentChunkModel]) -> str:
        if not self.client:
            raise HTTPException(status_code=500, detail="Service temporarily unavailable. Please try again later.")
        
        if not chunks:
            return "I couldn't find any relevant information in the uploaded documents to answer your question. Please make sure your question is related to the content of the documents."
        
        context = ""
        sources = []
        for i, chunk in enumerate(chunks):
            context += f"Document: {chunk.document_name}\nContent: {chunk.text}\n\n"
            sources.append(f"{chunk.document_name} (chunk {chunk.chunk_index})")

        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful AI assistant that answers questions based strictly on provided document content. Never make up information not found in the documents."},
                    {"role": "user", "content": PROMPT.format(context=context, query=query)}
                ],
                max_tokens=500,
                temperature=0.1
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            return f"I apologize, but I encountered an error while processing your question. Please try again." 