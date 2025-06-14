import { useQuery } from '@tanstack/react-query'
import { typedApi, type TypedApiClient } from '../api/typed-client'
import { api } from '../api/client'

// Query keys for caching
export const queryKeys = {
  gateway: {
    health: ['gateway', 'health'] as const,
    services: ['gateway', 'services'] as const,
  },
  documents: {
    all: ['documents'] as const,
    byId: (id: number) => ['documents', id] as const,
    search: (query: string) => ['documents', 'search', query] as const,
    similar: (query: string, limit?: number) => ['documents', 'similar', query, limit] as const,
  },
  hello: {
    greeting: ['hello', 'greeting'] as const,
    personal: (name: string) => ['hello', 'personal', name] as const,
  },
} as const

// Custom hooks for typed API calls
export function useGatewayHealth() {
  return useQuery({
    queryKey: queryKeys.gateway.health,
    queryFn: () => typedApi.gateway.health(),
    staleTime: 30000, // 30 seconds
  })
}

export function useGatewayServices() {
  return useQuery({
    queryKey: queryKeys.gateway.services,
    queryFn: () => typedApi.gateway.services(),
    staleTime: 60000, // 1 minute
  })
}

export function useServiceApiDocs(serviceName: string) {
  return useQuery({
    queryKey: ['docs', serviceName],
    queryFn: () => typedApi.docs.getServiceDocs(serviceName),
    enabled: !!serviceName,
    staleTime: 300000, // 5 minutes
  })
}

// Hello service hooks
export function useGreeting() {
  return useQuery({
    queryKey: queryKeys.hello.greeting,
    queryFn: () => api.hello.greeting(),
    staleTime: 300000, // 5 minutes
  })
}

export function usePersonalGreeting(name: string) {
  return useQuery({
    queryKey: queryKeys.hello.personal(name),
    queryFn: () => api.hello.personalGreeting(name),
    enabled: !!name,
    staleTime: 300000,
  })
}

// Export the typed API client for direct use
export { typedApi, api }
export type { TypedApiClient } 