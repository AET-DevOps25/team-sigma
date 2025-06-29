import { useState } from 'react';
import {
  useGatewayHealth,
  useServices,
  useServiceApiDocs,
  useHello,
  useDocuments,
} from '../hooks/useApi';

export function ApiDemo() {
  const [selectedService, setSelectedService] = useState<string>('');
  const [helloName, setHelloName] = useState<string>('');

  // Gateway endpoints
  const { data: gatewayHealth, isLoading: healthLoading, error: healthError } = useGatewayHealth();
  const { data: services, isLoading: servicesLoading, error: servicesError } = useServices();
  const { data: apiDocs, isLoading: docsLoading } = useServiceApiDocs(selectedService);

  // Hello service
  const { data: helloMessage, isLoading: helloLoading } = useHello(helloName);

  // Document service (just checking health)
  const { data: documents, isLoading: documentsLoading, error: documentsError } = useDocuments();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔧 API Demo
          </h1>
          <p className="text-xl text-gray-600">
            React Query integration with all microservices
          </p>
        </div>

        {/* Gateway Health */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🏥 Gateway Health Check
          </h2>
          {healthLoading ? (
            <div className="animate-pulse bg-gray-200 h-8 rounded"></div>
          ) : healthError ? (
            <div className="text-red-600">Error: {String(healthError)}</div>
          ) : gatewayHealth ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="font-medium">Service: {gatewayHealth.service}</span>
                <span className="text-green-600">Status: {gatewayHealth.status}</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Services Discovery */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🔍 Service Discovery
          </h2>
          {servicesLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="bg-gray-200 h-4 rounded w-1/3"></div>
              <div className="bg-gray-200 h-8 rounded"></div>
            </div>
          ) : servicesError ? (
            <div className="text-red-600">Error: {String(servicesError)}</div>
          ) : services ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Available Services:</p>
                <div className="flex flex-wrap gap-2">
                  {services.services.map((service) => (
                    <span
                      key={service}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Get API Docs for Service:
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a service...</option>
                  {services.services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>

              {selectedService && (
                <div className="mt-4">
                  <h3 className="font-medium text-gray-700 mb-2">
                    API Documentation for {selectedService}:
                  </h3>
                  {docsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-32 rounded"></div>
                  ) : apiDocs ? (
                    <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-auto max-h-64">
                      {apiDocs}
                    </pre>
                  ) : (
                    <div className="text-gray-500">Failed to load API docs</div>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Hello Service */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            👋 Hello Service
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your name (optional):
              </label>
              <input
                type="text"
                value={helloName}
                onChange={(e) => setHelloName(e.target.value)}
                placeholder="Enter your name..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Response:</h3>
              {helloLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 rounded"></div>
              ) : helloMessage ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">{helloMessage}</p>
                </div>
              ) : (
                <div className="text-gray-500">No response yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Document Service Health */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📄 Document Service Health
          </h2>
          {documentsLoading ? (
            <div className="animate-pulse bg-gray-200 h-8 rounded"></div>
          ) : documentsError ? (
            <div className="text-red-600">Error: {String(documentsError)}</div>
          ) : documents ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="font-medium">Document Service is running</span>
                </div>
                <span className="text-sm text-gray-600">
                  {documents.length} documents available
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {/* React Query Info */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            ⚡ React Query Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Automatic Features</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ Background refetching</li>
                <li>✅ Stale-while-revalidate</li>
                <li>✅ Request deduplication</li>
                <li>✅ Loading and error states</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Custom Configuration</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ Service-specific stale times</li>
                <li>✅ Conditional queries with enabled</li>
                <li>✅ Mutations with cache invalidation</li>
                <li>✅ Consistent error handling</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Architecture Info */}
        <div className="bg-gray-100 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            🏗️ Simplified Architecture
          </h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>Single API Layer:</strong> All endpoints use consistent React Query patterns with standard fetch API
            </p>
            <p>
              <strong>Manual Types:</strong> Simple TypeScript interfaces defined in the hooks file
            </p>
            <p>
              <strong>Gateway Routing:</strong> All microservice calls go through the API Gateway at port 8080
            </p>
            <p>
              <strong>Consistent Caching:</strong> React Query handles all caching, loading states, and background updates
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 