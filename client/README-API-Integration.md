# React Query API Integration

This client application demonstrates a clean React Query integration with microservices architecture through an API Gateway.

## Architecture Overview

### Simplified Approach
- **Single API Layer**: All endpoints use consistent React Query patterns with standard fetch API
- **Manual Types**: Simple TypeScript interfaces defined in the hooks file for type safety
- **Gateway Routing**: All microservice calls go through the API Gateway at port 8080
- **Consistent Caching**: React Query handles all caching, loading states, and background updates

### Why This Approach?

Initially we considered using `openapi-react-query` for type generation, but we found that:
- The gateway's OpenAPI schema only documents gateway management endpoints
- Microservice endpoints (like document service) are routed but not documented in the aggregated schema
- Simple manual typing provides better control and maintainability
- React Query's built-in features are sufficient for our needs

## API Structure

### Gateway Endpoints
- `GET /api/gateway/health` - Gateway health check
- `GET /api/gateway/services` - Service discovery
- `GET /api/{service}/v3/api-docs` - Individual service documentation

### Document Service (via Gateway Routing)
- `GET /api/documents` - List all documents
- `GET /api/documents/{id}` - Get document by ID
- `POST /api/documents/upload` - Upload new document
- `PUT /api/documents/{id}` - Update document metadata
- `DELETE /api/documents/{id}` - Delete document
- `GET /api/documents/{id}/download` - Download document file
- `GET /api/documents/search?q={query}` - Text search
- `GET /api/documents/search/similar?q={query}` - Vector similarity search

### Hello Service (via Gateway Routing)
- `GET /api/hello/` - Generic greeting
- `GET /api/hello/{name}` - Personal greeting

## Implementation

### React Query Hooks (`src/hooks/useApi.ts`)

All API calls are implemented using React Query hooks with:
- **Type Safety**: Manual TypeScript interfaces
- **Error Handling**: Consistent error handling across all endpoints
- **Caching**: Service-specific stale times and cache invalidation strategies
- **Loading States**: Built-in loading and error states
- **Mutations**: Optimistic updates and cache invalidation

```typescript
// Gateway hooks
export function useGatewayHealth()
export function useServices()
export function useServiceApiDocs(serviceName: string)

// Document service hooks
export function useDocuments()
export function useDocument(id: number)
export function useDocumentSearch(query: string)
export function useSimilarDocuments(query: string, limit?: number)

// Document mutations
export function useUploadDocument()
export function useUpdateDocument()
export function useDeleteDocument()

// File download hook
export function useDocumentDownload()

// Hello service
export function useHello(name?: string)
```

### Components

#### DocumentManager (`/document`)
- Full CRUD operations for documents
- File upload with multipart/form-data
- Search and vector similarity search
- Download and delete functionality
- Real-time status monitoring

#### ApiDemo (`/api-demo`)
- Gateway health and service discovery
- Hello service integration
- Document service health check
- Live API documentation viewer

## Features

### React Query Benefits
- **Background Refetching**: Automatic data freshness
- **Stale-While-Revalidate**: Show cached data while updating
- **Request Deduplication**: Prevent duplicate requests
- **Loading States**: Built-in loading and error handling
- **Cache Management**: Intelligent cache invalidation
- **Optimistic Updates**: Immediate UI feedback

### Custom Configuration
- **Service-Specific Stale Times**: Different cache durations for different data types
- **Conditional Queries**: Queries that only run when needed (e.g., search with non-empty query)
- **Mutation Success Callbacks**: Automatic cache invalidation after mutations
- **Error Boundaries**: Consistent error handling patterns

## Development

### Setup
```bash
npm install
npm run dev
```

### Dependencies
- `@tanstack/react-query` - State management and caching
- `@tanstack/react-router` - Client-side routing
- `react` + `react-dom` - UI framework
- `typescript` - Type safety

### Project Structure
```
src/
  hooks/
    useApi.ts           # All API hooks and types
  components/
    DocumentManager.tsx # Document CRUD interface
    ApiDemo.tsx        # API demonstration
  routes/
    _authed/
      document/         # Document management page
      api-demo.tsx      # API demo page
```

## API Gateway Integration

### Microservices Routing
The API Gateway routes requests to appropriate microservices:
- `/api/documents/**` → document-service
- `/api/hello/**` → hello-service
- `/api/gateway/**` → gateway management endpoints

### Service Discovery
The gateway provides service discovery through:
- `GET /api/gateway/services` - Lists available services and instances
- `GET /api/{service}/v3/api-docs` - Individual service OpenAPI schemas

### Health Monitoring
System status is monitored through:
- Gateway health endpoint
- Service availability through routing tests
- Document service health via successful API calls

## Live Demo

- **Document Management**: http://localhost:3000/document
- **API Demo**: http://localhost:3000/api-demo
- **Gateway Swagger UI**: http://localhost:8080/swagger-ui.html

## Troubleshooting

### Common Issues

**Services not available**
- Ensure all Docker containers are running: `docker-compose ps`
- Check gateway logs: `docker-compose logs api-gateway`

**API calls failing**
- Verify gateway is accessible: `curl http://localhost:8080/api/gateway/health`
- Check service registration: `curl http://localhost:8080/api/gateway/services`

**TypeScript errors**
- Run type check: `npm run build`
- Ensure all interfaces are properly defined in `useApi.ts`

**React Query cache issues**
- Use React Query DevTools (available in development)
- Check query keys for consistency
- Verify cache invalidation after mutations 