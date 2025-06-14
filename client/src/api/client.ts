// Type-safe API client configuration
export const API_BASE_URL = 'http://localhost:8080'

// Document upload request type
export interface DocumentUploadRequest {
  name: string
  description?: string
}

// Document response type  
export interface DocumentResponse {
  id: number
  name: string  
  description?: string
  originalFilename: string
  contentType: string
  uploadDate: string
}

// Gateway health response
export interface GatewayHealthResponse {
  status: string
  service: string
}

// Gateway services response
export interface GatewayServicesResponse {
  services: string[]
  instances: Record<string, unknown[]>
}

// Generic fetch wrapper
export async function apiRequest<T = unknown>(
  path: string,
  method: string,
  options?: {
    body?: unknown
    params?: Record<string, string | number>
    query?: Record<string, string | number | boolean | undefined>
    headers?: Record<string, string>
  }
): Promise<T> {
  // Build URL with path parameters
  let url = `${API_BASE_URL}${path}`
  
  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, String(value))
    })
  }

  // Add query parameters
  if (options?.query) {
    const searchParams = new URLSearchParams()
    Object.entries(options.query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })
    url += `?${searchParams.toString()}`
  }

  const response = await fetch(url, {
    method: method.toUpperCase(),
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Specific API functions with full type safety
export const api = {
  // Gateway endpoints
  gateway: {
    health: (): Promise<GatewayHealthResponse> => 
      apiRequest<GatewayHealthResponse>('/api/gateway/health', 'get'),
    services: (): Promise<GatewayServicesResponse> => 
      apiRequest<GatewayServicesResponse>('/api/gateway/services', 'get'),
  },

  // Document endpoints (when available)
  documents: {
    list: (): Promise<DocumentResponse[]> => 
      apiRequest<DocumentResponse[]>('/api/documents', 'get'),
    get: (id: number): Promise<DocumentResponse> => 
      apiRequest<DocumentResponse>('/api/documents/{id}', 'get', { params: { id } }),
    update: (id: number, body: DocumentUploadRequest): Promise<DocumentResponse> => 
      apiRequest<DocumentResponse>('/api/documents/{id}', 'put', { params: { id }, body }),
    delete: (id: number): Promise<void> => 
      apiRequest<void>('/api/documents/{id}', 'delete', { params: { id } }),
    search: (query: string): Promise<DocumentResponse[]> => 
      apiRequest<DocumentResponse[]>('/api/documents/search', 'get', { query: { q: query } }),
    searchSimilar: (query: string, limit?: number): Promise<DocumentResponse[]> => 
      apiRequest<DocumentResponse[]>('/api/documents/search/similar', 'get', { query: { q: query, limit } }),
  },

  // Hello service endpoints
  hello: {
    greeting: (): Promise<string> => 
      apiRequest<string>('/api/hello/', 'get'),
    personalGreeting: (name: string): Promise<string> => 
      apiRequest<string>('/api/hello/{name}', 'get', { params: { name } }),
  },
} as const

export type ApiClient = typeof api 