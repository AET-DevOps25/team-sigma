import { useGatewayHealth, useGatewayServices, useServiceApiDocs } from '../hooks/useDocumentQueries'

export function OpenApiDemo() {
  // Type-safe queries using openapi-react-query
  const { data: health, error: healthError, isLoading: healthLoading } = useGatewayHealth()
  const { data: services, error: servicesError, isLoading: servicesLoading } = useGatewayServices()
  const { data: helloServiceDocs, isLoading: docsLoading } = useServiceApiDocs("hello")

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 OpenAPI React Query Integration
          </h1>
          <p className="text-xl text-gray-600">
            Type-safe API queries with automatic TypeScript generation
          </p>
        </div>

        {/* Gateway Health Status */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            🏥 Gateway Health
          </h2>
          {healthLoading ? (
            <div className="animate-pulse flex items-center space-x-4">
              <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
              <div className="h-4 bg-gray-300 rounded w-24"></div>
            </div>
          ) : healthError ? (
            <div className="text-red-600 p-4 bg-red-50 rounded-lg">
              ❌ Error: {String(healthError)}
            </div>
          ) : health ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></span>
                <span className="font-medium text-green-700">
                  Status: {health && typeof health === 'object' && 'status' in health ? String(health.status) : 'UP'}
                </span>
              </div>
              <span className="text-gray-600">
                Service: {health && typeof health === 'object' && 'service' in health ? String(health.service) : 'API Gateway'}
              </span>
            </div>
          ) : null}
        </div>

        {/* Registered Services */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            🔧 Registered Services
          </h2>
          {servicesLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-300 rounded w-32"></div>
              <div className="flex space-x-2">
                <div className="h-8 bg-gray-300 rounded-full w-24"></div>
                <div className="h-8 bg-gray-300 rounded-full w-32"></div>
                <div className="h-8 bg-gray-300 rounded-full w-28"></div>
              </div>
            </div>
          ) : servicesError ? (
            <div className="text-red-600 p-4 bg-red-50 rounded-lg">
              ❌ Error loading services: {String(servicesError)}
            </div>
          ) : services ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Available Services:</h3>
                <div className="flex flex-wrap gap-2">
                  {services && 
                    typeof services === 'object' && 
                    'services' in services && 
                    Array.isArray(services.services) && 
                    services.services.map((service: unknown, index: number) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {String(service)}
                      </span>
                    ))
                  }
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Service Discovery Data:</h3>
                <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                  {JSON.stringify(services, null, 2)}
                </pre>
              </div>
            </div>
          ) : null}
        </div>

        {/* API Documentation */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            📚 Hello Service API Docs
          </h2>
          {docsLoading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-48 mb-2"></div>
              <div className="h-20 bg-gray-300 rounded"></div>
            </div>
          ) : helloServiceDocs ? (
            <div className="space-y-4">
              <p className="text-green-600 font-medium">
                ✅ Successfully fetched Hello Service OpenAPI documentation
              </p>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto max-h-48">
                {typeof helloServiceDocs === 'string' 
                  ? helloServiceDocs 
                  : JSON.stringify(helloServiceDocs, null, 2)
                }
              </pre>
            </div>
          ) : (
            <p className="text-gray-500">No documentation available</p>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            ⚡ OpenAPI React Query Features
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-green-500 text-xl">✅</span>
                <div>
                  <p className="font-medium">Type Safety</p>
                  <p className="text-sm text-gray-600">No typos in URLs or params</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-500 text-xl">✅</span>
                <div>
                  <p className="font-medium">Auto-generated Types</p>
                  <p className="text-sm text-gray-600">100% match your OpenAPI schema</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-500 text-xl">✅</span>
                <div>
                  <p className="font-medium">No Manual Typing</p>
                  <p className="text-sm text-gray-600">Eliminates `any` and `as` overrides</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-green-500 text-xl">✅</span>
                <div>
                  <p className="font-medium">React Query Integration</p>
                  <p className="text-sm text-gray-600">Caching, loading states, errors</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-500 text-xl">✅</span>
                <div>
                  <p className="font-medium">Tiny Bundle Size</p>
                  <p className="text-sm text-gray-600">Only 1kb wrapper overhead</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-500 text-xl">✅</span>
                <div>
                  <p className="font-medium">Hot Reloading</p>
                  <p className="text-sm text-gray-600">Auto-update when API changes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Implementation Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            📝 Implementation Note
          </h2>
          <p className="text-yellow-700 text-sm">
            Currently only Gateway management endpoints are included in the OpenAPI schema. 
            Document and Hello service endpoints are routed but not documented. 
            For full type safety on all services, consider aggregating their schemas into the gateway's OpenAPI documentation.
          </p>
        </div>

        {/* Links */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">🔗 API Documentation</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="http://localhost:8080/swagger-ui.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <span className="text-2xl">📖</span>
              <div>
                <p className="font-medium text-blue-900">Swagger UI</p>
                <p className="text-sm text-blue-700">Interactive API Documentation</p>
              </div>
            </a>
            <a
              href="http://localhost:8080/v3/api-docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <span className="text-2xl">📄</span>
              <div>
                <p className="font-medium text-green-900">OpenAPI Schema</p>
                <p className="text-sm text-green-700">Raw JSON Schema</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 