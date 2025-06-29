# OpenAPI Integration for Team Sigma API Gateway

This document explains the OpenAPI/Swagger integration implemented for the Team Sigma microservices architecture.

## Overview

OpenAPI (formerly Swagger) has been integrated into the API Gateway and all microservices to provide comprehensive API documentation. The setup includes:

- **API Gateway**: Aggregates documentation from all microservices
- **Document Service**: Provides detailed API docs for document management
- **Hello Service**: Simple example service with basic endpoints

## Architecture

The OpenAPI integration follows the pattern described in the [Baeldung Spring Cloud Gateway OpenAPI tutorial](https://www.baeldung.com/spring-cloud-gateway-integrate-openapi).

### API Gateway
- Acts as the central point for API documentation
- Aggregates OpenAPI specs from downstream services
- Provides a unified Swagger UI interface
- Accessible at: `http://localhost:8080/swagger-ui.html`

### Microservices
Each microservice provides its own OpenAPI specification:
- **Document Service**: `http://localhost:8080/api/documents/v3/api-docs`
- **Hello Service**: `http://localhost:8080/api/hello/v3/api-docs`

## Accessing the API Documentation

### Development Environment

1. **Start all services** using Docker Compose:
   ```bash
   docker-compose up -d
   ```

2. **Access the main Swagger UI** at:
   ```
   http://localhost:8080/swagger-ui.html
   ```

3. **Individual service documentation**:
   - Document Service: `http://localhost:8080/api/documents/swagger-ui.html`
   - Hello Service: `http://localhost:8080/api/hello/swagger-ui.html`

### Available Endpoints

#### API Gateway Endpoints
- `GET /api/gateway/health` - Gateway health check
- `GET /api/gateway/services` - List all registered services
- `GET /v3/api-docs` - OpenAPI specification

#### Document Service Endpoints (via Gateway)
- `POST /api/documents/upload` - Upload a document
- `GET /api/documents` - Get all documents
- `GET /api/documents/{id}` - Get document by ID
- `PUT /api/documents/{id}` - Update document metadata
- `DELETE /api/documents/{id}` - Delete document
- `GET /api/documents/{id}/download` - Download document
- `GET /api/documents/search` - Search documents
- `GET /api/documents/search/similar` - Vector similarity search

#### Hello Service Endpoints (via Gateway)
- `GET /api/hello/` - Simple greeting
- `GET /api/hello/{name}` - Personalized greeting

## Configuration Details

### Dependencies Added

All services now include SpringDoc OpenAPI dependencies:
```gradle
implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.6.0'
implementation 'org.springdoc:springdoc-openapi-starter-webmvc-api:2.6.0'
```

### API Gateway Configuration

The API Gateway (`application.yaml`) includes:
```yaml
springdoc:
  swagger-ui:
    enabled: true
    path: /swagger-ui.html
    urls:
      - url: /v3/api-docs
        name: "API Gateway"
      - url: /api/documents/v3/api-docs
        name: "Document Service"
      - url: /api/hello/v3/api-docs
        name: "Hello Service"
  api-docs:
    enabled: true
    path: /v3/api-docs
```

### Service Discovery Integration

The API Gateway uses Eureka service discovery to dynamically fetch OpenAPI specifications from registered microservices through the `OpenApiController`.

## Benefits

1. **Centralized Documentation**: All API documentation accessible from a single location
2. **Interactive Testing**: Swagger UI allows direct API testing
3. **Auto-Generated**: Documentation is automatically generated from code annotations
4. **Service Discovery**: Dynamically includes documentation from all registered services
5. **Detailed Schemas**: Complete request/response models with validation rules

## Usage Tips

1. **Testing APIs**: Use the Swagger UI "Try it out" buttons to test endpoints directly
2. **Code Generation**: Export OpenAPI specs to generate client SDKs
3. **API Design**: Use OpenAPI annotations to design APIs before implementation
4. **Documentation**: Keep annotations up-to-date as APIs evolve

## Next Steps

- Add more detailed examples in API documentation
- Implement API versioning strategy
- Add authentication/authorization documentation
- Create custom OpenAPI themes
- Set up automated API documentation deployment 