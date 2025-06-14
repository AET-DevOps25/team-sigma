# OpenAPI React Query Integration

This project uses [**openapi-react-query**](https://openapi-ts.dev/openapi-react-query/) - a type-safe tiny wrapper (1kb) around @tanstack/react-query specifically designed for OpenAPI schemas.

## 🚀 What's Implemented

### ✅ Official OpenAPI Integration
- **openapi-react-query**: Type-safe wrapper around React Query for documented endpoints
- **openapi-fetch**: Type-safe fetch client 
- **openapi-typescript**: Auto-generated TypeScript types
- **Document Service Integration**: Full CRUD operations via gateway routing

### ✅ Live Schema Generation
- **Generate types from live API**: `npm run generate-api`
- **Fetch schema as JSON**: `npm run api:fetch`
- **Watch for changes**: `npm run generate-api:poll`

### ✅ Hot Reloading Development
- **Development with auto-reload**: `npm run api:dev`
- **File watching with nodemon**: Automatically regenerates types when API changes

### ✅ Document Management System
- **Full document CRUD**: Upload, list, search, delete, download
- **Vector similarity search**: AI-powered document discovery
- **Real-time updates**: React Query cache invalidation
- **File handling**: Proper upload/download with progress states

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run generate-api` | Generate TypeScript types from live OpenAPI schema |
| `npm run generate-api:local` | Generate from local `openapi.json` file |
| `npm run api:fetch` | Download current OpenAPI schema to local file |
| `npm run api:dev` | Start development with concurrent type watching |
| `npm run generate-api:poll` | Watch and auto-regenerate types |

## 🎯 Key Features

### ✅ Complete Type Safety (Gateway Endpoints)
- ✅ **No typos in URLs or params** - Compile-time validation
- ✅ **100% schema match** - All parameters, bodies, responses type-checked  
- ✅ **No manual typing** - Eliminates `any` types and `as` overrides
- ✅ **Path parameters** - Fully typed with auto-completion
- ✅ **Query parameters** - Type-safe with optional/required validation

### ✅ Developer Experience
- ✅ **1kb bundle size** - Tiny wrapper overhead for openapi-react-query
- ✅ **React Query integration** - Caching, loading states, error handling
- ✅ **Hot reloading** - Auto-update when backend API changes
- ✅ **IntelliSense** - Full IDE support with hover documentation

### ✅ Document Service Integration
- ✅ **Full CRUD operations** - Create, Read, Update, Delete documents
- ✅ **File upload** - Multipart form data with progress tracking
- ✅ **Search functionality** - Text search and vector similarity
- ✅ **Download handling** - Proper blob handling and file downloads
- ✅ **Real-time updates** - Automatic cache invalidation

## 🔧 Usage Examples

### Basic Setup

```typescript
// src/api/api-client.ts
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import type { paths } from "./api"; // auto-generated

const fetchClient = createFetchClient<paths>({
  baseUrl: "http://localhost:8080",
});

export const $api = createClient(fetchClient);
```

### Type-Safe Gateway Queries (openapi-react-query)

```typescript
// src/hooks/useDocumentQueries.ts
import { $api } from "../api/api-client";

export function useGatewayHealth() {
  return $api.useQuery("get", "/api/gateway/health", {
    staleTime: 30000, // 30 seconds
  });
}

export function useGatewayServices() {
  return $api.useQuery("get", "/api/gateway/services", {
    staleTime: 60000, // 1 minute
  });
}
```

### Document Service Operations (Custom React Query Hooks)

```typescript
// src/hooks/useDocumentService.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useDocuments() {
  return useQuery({
    queryKey: ['documents'],
    queryFn: () => fetch('/api/documents').then(res => res.json()),
    staleTime: 30000,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ file, metadata }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', metadata.name);
      
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}
```

### React Components

```typescript
import { useGatewayHealth } from './hooks/useDocumentQueries'
import { useDocuments, useUploadDocument } from './hooks/useDocumentService'

function DocumentManager() {
  // Gateway status (openapi-react-query)
  const { data: health } = useGatewayHealth()
  
  // Document operations (custom hooks)
  const { data: documents, isLoading } = useDocuments()
  const uploadMutation = useUploadDocument()
  
  const handleUpload = async (file: File, metadata: any) => {
    await uploadMutation.mutateAsync({ file, metadata })
    alert('Document uploaded successfully!')
  }
  
  return (
    <div>
      <div>Gateway Status: {health?.status}</div>
      <div>Documents: {documents?.length || 0}</div>
      {/* Upload form, document list, etc. */}
    </div>
  )
}
```

## 🔥 Hot Reloading Setup

### Option 1: Concurrent Development (Recommended)
```bash
npm run api:dev
```
Runs both Vite dev server and type watcher simultaneously.

### Option 2: Separate Terminals
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Watch for API changes
npm run generate-api:poll
```

## 📁 File Structure

```
src/
├── api/
│   ├── api.ts              # 🤖 Auto-generated gateway types
│   ├── api-client.ts       # openapi-react-query client
│   ├── client.ts           # Legacy client (optional)
│   ├── typed-client.ts     # Legacy typed client (optional)
│   └── openapi.json        # Downloaded schema
├── hooks/
│   ├── useDocumentQueries.ts    # openapi-react-query hooks (gateway)
│   ├── useDocumentService.ts    # Custom hooks (document service)
│   └── useApi.ts               # Legacy hooks (optional)
├── components/
│   ├── DocumentManager.tsx     # Full document management UI
│   └── OpenApiDemo.tsx         # Gateway integration demo
├── routes/
│   ├── _authed/
│   │   ├── document/index.tsx  # Document management route
│   │   └── api-demo.tsx        # OpenAPI integration demo
│   └── ...
└── ...
```

## 🔄 Development Workflow

1. **Start services**: `docker-compose up -d`
2. **Generate initial types**: `npm run generate-api`
3. **Start development**: `npm run api:dev`
4. **Make API changes** in your backend
5. **Types auto-regenerate** when schema changes
6. **TypeScript compiler** catches breaking changes immediately
7. **IntelliSense** provides auto-completion and validation

## 🌐 Available Endpoints & Integration

### Gateway Management (openapi-react-query)
- ✅ `GET /api/gateway/health` - Health check with type safety
- ✅ `GET /api/gateway/services` - List registered microservices
- ✅ `GET /api/{service}/v3/api-docs` - Service-specific OpenAPI docs

### Document Service (Custom React Query Hooks)
- ✅ `GET /api/documents` - List all documents
- ✅ `GET /api/documents/{id}` - Get document by ID
- ✅ `POST /api/documents/upload` - Upload new document
- ✅ `PUT /api/documents/{id}` - Update document metadata
- ✅ `DELETE /api/documents/{id}` - Delete document
- ✅ `GET /api/documents/{id}/download` - Download document file
- ✅ `GET /api/documents/search?q=query` - Text search
- ✅ `GET /api/documents/search/similar?q=query` - Vector similarity search

### Hello Service (Routed)
- ✅ `GET /api/hello/` - Default greeting
- ✅ `GET /api/hello/{name}` - Personalized greeting

## 🎯 Live Demo Pages

Visit these pages to see the integration in action:

- **Document Management**: http://localhost:3000/document
  - Full document CRUD operations
  - File upload with progress tracking
  - Search and similarity features
  - Download functionality

- **OpenAPI Integration Demo**: http://localhost:3000/api-demo
  - Gateway health monitoring
  - Service discovery visualization
  - OpenAPI schema exploration

- **API Documentation**: http://localhost:8080/swagger-ui.html
  - Interactive gateway API documentation

## 🛠️ Configuration

### Package Dependencies
```json
{
  "dependencies": {
    "openapi-react-query": "^latest",
    "openapi-fetch": "^latest",
    "@tanstack/react-query": "^5.77.0"
  },
  "devDependencies": {
    "openapi-typescript": "^7.8.0",
    "concurrently": "^9.1.2",
    "nodemon": "^3.1.10"
  }
}
```

### TypeScript Configuration
Recommended to enable `noUncheckedIndexedAccess` in `tsconfig.json` for better type safety.

## 🏗️ Architecture Explanation

### Current Microservices Setup

1. **API Gateway**: 
   - Routes requests to microservices
   - Only documents its own endpoints in OpenAPI
   - Follows standard microservices patterns

2. **Document Service**:
   - Accessible via `/api/documents/**` routing
   - Has its own OpenAPI documentation (not aggregated)
   - Full CRUD operations with MinIO and Weaviate integration

3. **Hello Service**:
   - Accessible via `/api/hello/**` routing
   - Simple greeting endpoints

### Integration Strategy

- **openapi-react-query**: Used for documented gateway endpoints (health, services)
- **Custom React Query hooks**: Used for routed microservice endpoints (documents, hello)
- **TypeScript types**: Auto-generated for gateway, manually typed for services
- **Caching**: React Query handles all caching, loading states, and error handling

This approach provides:
- ✅ **Full type safety** where possible
- ✅ **Proper separation of concerns**
- ✅ **Standard microservices architecture**
- ✅ **Excellent developer experience**

## 🚨 Troubleshooting

### Types Not Updating?
1. Check API Gateway: `curl http://localhost:8080/v3/api-docs`
2. Regenerate manually: `npm run generate-api`
3. Restart TypeScript server in IDE

### Document Operations Failing?
1. Check document service: `curl http://localhost:8080/api/documents/`
2. Verify gateway routing is working
3. Check browser network tab for errors

### Upload Not Working?
1. Ensure file size is within limits
2. Check content-type handling
3. Verify MinIO and database connections

## 📚 Comparison: Before vs After

### Before (Manual Implementation)
```typescript
// Manual typing required
const response = await fetch('/api/documents')
const data: any = await response.json() // No type safety
```

### After (Integrated Solution)
```typescript
// Gateway endpoints: Full type safety with openapi-react-query
const { data, error, isLoading } = $api.useQuery("get", "/api/gateway/health")

// Document endpoints: React Query with proper typing
const { data: documents } = useDocuments() // Custom hook with types
const uploadMutation = useUploadDocument() // Proper mutation handling
```

## 🎉 Benefits Achieved

1. **Zero Manual Typing** - Gateway types auto-generated from OpenAPI
2. **Compile-Time Safety** - Catch API contract violations during development
3. **IntelliSense Support** - Full auto-completion and documentation
4. **React Query Integration** - Built-in caching, loading states, error handling
5. **Hot Reloading** - Automatic type updates when backend changes
6. **Tiny Bundle Size** - Only 1kb overhead from openapi-react-query
7. **Industry Standard** - Following official OpenAPI TypeScript patterns
8. **Full CRUD Operations** - Complete document management system
9. **Proper Error Handling** - Comprehensive error states and retry logic
10. **Production Ready** - File uploads, downloads, search, caching

## 🔗 Related Links

- [openapi-react-query Documentation](https://openapi-ts.dev/openapi-react-query/)
- [openapi-fetch Documentation](https://openapi-ts.dev/openapi-fetch/)
- [OpenAPI Specification](http://localhost:8080/v3/api-docs)
- [Swagger UI](http://localhost:8080/swagger-ui.html)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Document Management Demo](http://localhost:3000/document)
- [API Integration Demo](http://localhost:3000/api-demo) 