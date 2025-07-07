import { useState } from 'react';
import {
  useGatewayHealth,
  useServices,
  useServiceApiDocs,
  useDocuments,
} from '../hooks/useApi';

export function ApiDemo() {
  const [selectedService, setSelectedService] = useState<string>('');

  // Gateway endpoints
  const { data: gatewayHealth, isLoading: healthLoading, error: healthError } = useGatewayHealth();
  const { data: services, isLoading: servicesLoading, error: servicesError } = useServices();
  const { data: apiDocs, isLoading: docsLoading } = useServiceApiDocs(selectedService);


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
      </div>
    </div>
  );
} 