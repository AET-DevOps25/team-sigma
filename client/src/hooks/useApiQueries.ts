import { $api } from "../api/api-client";

// Gateway health check hook
export function useGatewayHealth() {
  return $api.useQuery("get", "/api/gateway/health", {
    // Query options can be added here
    staleTime: 30000, // 30 seconds
  });
}

// Gateway services list hook
export function useGatewayServices() {
  return $api.useQuery("get", "/api/gateway/services", {
    staleTime: 60000, // 1 minute
  });
}

// Service API docs hook
export function useServiceApiDocs(serviceName: string) {
  return $api.useQuery("get", "/api/{service}/v3/api-docs", {
    params: {
      path: { service: serviceName },
    },
    // Only run query if serviceName is provided
    enabled: !!serviceName,
    staleTime: 300000, // 5 minutes
  });
}

// Export the API client for direct access
export { $api }; 