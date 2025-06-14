import type { operations } from './api'

// Type-safe API client configuration
export const API_BASE_URL = 'http://localhost:8080'

// Helper types for extracting response and request types
type ExtractResponseType<T extends keyof operations> = 
  operations[T] extends { responses: { 200: { content: { "*/*": infer R } } } }
    ? R
    : never

type ExtractPathParams<T extends keyof operations> = 
  operations[T] extends { parameters: { path: infer P } }
    ? P
    : never

type ExtractQueryParams<T extends keyof operations> = 
  operations[T] extends { parameters: { query: infer Q } }
    ? Q
    : never

// Generic fetch wrapper with full type safety
export async function typedApiRequest<TOperation extends keyof operations>(
  path: string,
  method: string,
  options?: {
    body?: unknown
    params?: ExtractPathParams<TOperation>
    query?: ExtractQueryParams<TOperation>
    headers?: Record<string, string>
  }
): Promise<ExtractResponseType<TOperation>> {
  // Build URL with path parameters
  let url = `${API_BASE_URL}${path}`
  
  if (options?.params) {
    Object.entries(options.params as Record<string, string | number>).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, String(value))
    })
  }

  // Add query parameters
  if (options?.query) {
    const searchParams = new URLSearchParams()
    Object.entries(options.query as Record<string, string | number | boolean>).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })
    if (searchParams.toString()) {
      url += `?${searchParams.toString()}`
    }
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

// Fully typed API client using generated types
export const typedApi = {
  gateway: {
    health: (): Promise<ExtractResponseType<'health'>> =>
      typedApiRequest<'health'>('/api/gateway/health', 'get'),
    
    services: (): Promise<ExtractResponseType<'getServices'>> => 
      typedApiRequest<'getServices'>('/api/gateway/services', 'get'),
  },

  // OpenAPI docs proxy
  docs: {
    getServiceDocs: (service: string): Promise<ExtractResponseType<'getServiceApiDocs'>> =>
      typedApiRequest<'getServiceApiDocs'>('/api/{service}/v3/api-docs', 'get', { 
        params: { service } as ExtractPathParams<'getServiceApiDocs'>
      }),
  },
} as const

export type TypedApiClient = typeof typedApi 