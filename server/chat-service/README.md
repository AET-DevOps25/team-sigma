# Chat Service

A FastAPI-based chat service that provides AI-powered document Q&A functionality through integration with the document service.

## Features

- **Eureka Service Discovery**: Communicates with the document service through Eureka service registry
- **Document Integration**: Fetches document metadata and content for contextual chat responses
- **Vector Search**: Supports similarity search for finding related documents
- **Health Checks**: Provides health monitoring and service status endpoints

## Architecture

The chat service integrates with the document service through Eureka service discovery:

```
Chat Service → Eureka Server → Document Service
```

## API Endpoints

### Core Endpoints

- `POST /api/chat` - Main chat endpoint that accepts user messages and document IDs
- `GET /api/documents/{document_id}` - Fetch document information by ID
- `GET /api/documents/search/similar` - Search for similar documents using vector similarity

### Health & Monitoring

- `GET /health` - Service health check
- `GET /eureka/services` - Debug endpoint to view available services in Eureka

## Models

### ChatRequest
```json
{
  "message": "What is this document about?",
  "document_id": "123"
}
```

### ChatResponse
```json
{
  "response": "AI generated response based on document content",
  "document_info": {
    "id": 123,
    "name": "Sample Document",
    "original_filename": "sample.pdf",
    "content_type": "application/pdf",
    "file_size": 1024000,
    "description": "Sample document description",
    "organization_id": "org-123",
    "created_at": "2024-01-01T10:00:00",
    "updated_at": "2024-01-01T10:00:00",
    "chunk_count": 15
  }
}
```

## Environment Variables

- `SPRING_APPLICATION_NAME`: Service name for Eureka registration (default: `chat-service`)
- `SERVER_PORT`: Port to run the service on (default: `8082`)
- `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE`: Eureka server URL (default: `http://localhost:8761/eureka/`)
- `ENVIRONMENT`: Environment identifier (e.g., `docker`, `local`)

## Dependencies

- **FastAPI**: Web framework
- **py-eureka-client**: Eureka service discovery client
- **httpx**: Async HTTP client for service communication
- **pydantic**: Data validation and serialization

## Service Discovery

The chat service uses Eureka to discover the document service dynamically:

1. Registers itself with Eureka on startup
2. Queries Eureka to find document service instances
3. Uses the discovered service URL for HTTP communication
4. Falls back to direct service name (`document-service:8080`) if Eureka discovery fails

## Development

### Local Development
```bash
cd server/chat-service
pip install -r requirements.txt
python main.py
```

### Docker Development
```bash
# Build and run with docker-compose
docker-compose up chat-service
```

## Integration with Document Service

The chat service integrates with the document service to:

1. **Fetch Document Metadata**: Retrieves document information including name, type, size, and chunk count
2. **Provide Context**: Uses document information to generate more contextual chat responses
3. **Vector Search**: Leverages the document service's similarity search capabilities
4. **Error Handling**: Gracefully handles cases where documents are not found or service is unavailable

## Future Enhancements

- [ ] Implement actual AI/LLM integration for document Q&A
- [ ] Add RAG (Retrieval Augmented Generation) using document chunks
- [ ] Implement conversation history and context management
- [ ] Add support for multi-document conversations
- [ ] Integrate with external AI services (OpenAI, Claude, etc.)

## Troubleshooting

### Service Discovery Issues
- Check Eureka server is running and accessible
- Verify service registration with `/eureka/services` endpoint
- Check Docker network connectivity between services

### Document Service Communication
- Verify document service is registered with Eureka
- Check service health endpoints
- Review logs for HTTP communication errors 