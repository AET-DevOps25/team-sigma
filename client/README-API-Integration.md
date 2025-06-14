# OpenAPI TypeScript Integration

This project now includes full OpenAPI integration with automatic TypeScript type generation from your API Gateway.

## 🚀 What's Implemented

### ✅ Live Schema Generation
- **Generate types from live API**: `npm run generate-api`
- **Fetch schema as JSON**: `npm run api:fetch`
- **Watch for changes**: `npm run generate-api:poll`

### ✅ Hot Reloading Development
- **Development with auto-reload**: `npm run api:dev`
- **File watching with nodemon**: Automatically regenerates types when API changes

### ✅ Type-Safe API Client
- **Fully typed client**: `src/api/typed-client.ts`
- **Fallback client**: `src/api/client.ts` 
- **React hooks**: `src/hooks/useApi.ts`

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run generate-api` | Generate TypeScript types from live OpenAPI schema |
| `npm run generate-api:local` | Generate from local `openapi.json` file |
| `npm run api:fetch` | Download current OpenAPI schema to local file |
| `npm run api:dev` | Start development with concurrent type watching |
| `npm run generate-api:poll` | Watch and auto-regenerate types |

## 🔧 Usage Examples

### Basic API Calls

```typescript
import { typedApi } from './api/typed-client'

// Fully typed API calls
const health = await typedApi.gateway.health()
const services = await typedApi.gateway.services()
```

### React Hooks with React Query

```typescript
import { useGatewayHealth, useGatewayServices } from './hooks/useApi'

function MyComponent() {
  const { data: health, isLoading } = useGatewayHealth()
  const { data: services } = useGatewayServices()
  
  return (
    <div>
      {health && <div>Status: {health.status}</div>}
      {services && services.services.map(service => 
        <span key={service}>{service}</span>
      )}
    </div>
  )
}
```

### Manual Type Generation

```bash
# Generate types from live API Gateway
npm run generate-api

# Or from local file
npm run generate-api:local
```

## 🔥 Hot Reloading Setup

### Option 1: Concurrent Development
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
│   ├── api.ts              # 🤖 Auto-generated types
│   ├── client.ts           # Basic API client
│   └── typed-client.ts     # Fully typed client
├── hooks/
│   └── useApi.ts          # React Query hooks
└── components/
    └── [your components]   # Use the hooks here
```

## 🎯 Type Safety Features

### ✅ Compile-Time Safety
- Request/response types automatically validated
- Path parameters type-checked
- Query parameters type-safe

### ✅ IDE Support
- Full IntelliSense in VS Code
- Auto-completion for API endpoints
- Hover documentation from OpenAPI specs

### ✅ Runtime Validation
- Automatic error handling
- Type-safe response parsing
- Request body validation

## 🔄 Development Workflow

1. **Start services**: `docker-compose up -d`
2. **Generate initial types**: `npm run generate-api`
3. **Start development**: `npm run api:dev`
4. **Make API changes** in your backend
5. **Types auto-regenerate** when schema changes
6. **TypeScript compiler** catches breaking changes immediately

## 🌐 Available Endpoints

Currently integrated endpoints from your API Gateway:

### Gateway Management
- `GET /api/gateway/health` - Health check
- `GET /api/gateway/services` - List registered services

### OpenAPI Proxy  
- `GET /api/{service}/v3/api-docs` - Service-specific OpenAPI docs

### Future: Document Service
- Document upload, search, and management (when service is available)

### Future: Hello Service
- Greeting endpoints (when service is available)

## 🛠️ Configuration

### Nodemon Config (`nodemon.config.json`)
Watches Java files in the API Gateway and regenerates types when changes are detected.

### Package.json Scripts
Enhanced with multiple OpenAPI generation strategies for different development needs.

## 🚨 Troubleshooting

### Types Not Updating?
1. Check if API Gateway is running: `curl http://localhost:8080/v3/api-docs`
2. Manually regenerate: `npm run generate-api`
3. Restart TypeScript server in your IDE

### Build Errors?
1. Ensure generated `api.ts` exists
2. Check OpenAPI schema is valid
3. Verify all imports are correct

### Hot Reloading Not Working?
1. Check nodemon is watching correct files
2. Verify API Gateway is accessible
3. Look for errors in terminal output

## 📚 Next Steps

1. **Add Document Service Integration** when available
2. **Create UI Components** using the typed hooks
3. **Add Mutation Hooks** for POST/PUT/DELETE operations
4. **Error Handling** with proper TypeScript error types
5. **Authentication** integration when implemented

## 🔗 Related Links

- [OpenAPI Specification](http://localhost:8080/v3/api-docs)
- [Swagger UI](http://localhost:8080/swagger-ui.html)
- [openapi-typescript Documentation](https://github.com/drwpow/openapi-typescript)
- [React Query Documentation](https://tanstack.com/query/latest) 