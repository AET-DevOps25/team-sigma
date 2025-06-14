package de.tum.team_sigma.api_gateway.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gateway")
@Tag(name = "Gateway Management", description = "API Gateway information and health endpoints")
public class GatewayController {

    @Autowired
    private DiscoveryClient discoveryClient;

    @GetMapping("/health")
    @Operation(summary = "Gateway health check", description = "Check if the API Gateway is running")
    @ApiResponse(responseCode = "200", description = "Gateway is healthy")
    public Map<String, String> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "API Gateway");
        return response;
    }

    @GetMapping("/services")
    @Operation(summary = "List available services", description = "Get a list of all registered microservices")
    @ApiResponse(responseCode = "200", description = "Services retrieved successfully")
    public Map<String, Object> getServices() {
        Map<String, Object> response = new HashMap<>();
        List<String> services = discoveryClient.getServices();
        response.put("services", services);
        
        Map<String, List<ServiceInstance>> serviceInstances = new HashMap<>();
        for (String service : services) {
            serviceInstances.put(service, discoveryClient.getInstances(service));
        }
        response.put("instances", serviceInstances);
        
        return response;
    }
} 