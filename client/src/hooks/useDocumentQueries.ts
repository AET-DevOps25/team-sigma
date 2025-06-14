import { $api } from "../api/api-client";

// Gateway queries - these are the only endpoints in our current OpenAPI schema
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

export function useServiceApiDocs(serviceName: string) {
  return $api.useQuery("get", "/api/{service}/v3/api-docs", {
    params: {
      path: { service: serviceName },
    },
    enabled: !!serviceName,
    staleTime: 300000, // 5 minutes
  });
}

// Raw fetch functions for services not in OpenAPI schema
// These bypass type safety but demonstrate API Gateway routing

interface ApiResponse<T> {
  data?: T;
  error?: unknown;
}

export async function fetchDocuments(): Promise<ApiResponse<unknown>> {
  try {
    const response = await fetch("http://localhost:8080/api/documents");
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error };
  }
}

export async function fetchDocument(id: number): Promise<ApiResponse<unknown>> {
  try {
    const response = await fetch(`http://localhost:8080/api/documents/${id}`);
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error };
  }
}

export async function fetchHello(name?: string): Promise<ApiResponse<unknown>> {
  try {
    const url = name ? `/api/hello/${name}` : "/api/hello/";
    const response = await fetch(`http://localhost:8080${url}`);
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error };
  }
} 