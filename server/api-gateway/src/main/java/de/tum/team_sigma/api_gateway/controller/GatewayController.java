package de.tum.team_sigma.api_gateway.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@Tag(name = "Gateway Management", description = "API Gateway information and health endpoints")
public class GatewayController {

    @Autowired
    private DiscoveryClient discoveryClient;

    @GetMapping("/api/gateway/health")
    @Operation(summary = "Gateway health check", description = "Check if the API Gateway is running")
    @ApiResponse(responseCode = "200", description = "Gateway is healthy")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> health = new HashMap<>();
        health.put("service", "API Gateway");
        health.put("status", "UP");
        return ResponseEntity.ok(health);
    }

    @GetMapping("/api/gateway/services")
    @Operation(summary = "List available services", description = "Get a list of all registered microservices")
    @ApiResponse(responseCode = "200", description = "Services retrieved successfully")
    public ResponseEntity<Map<String, Object>> getServices() {
        Map<String, Object> response = new HashMap<>();
        Map<String, List<ServiceInstance>> instances = new HashMap<>();
        
        // Get all registered services
        List<String> services = discoveryClient.getServices();
        for (String service : services) {
            List<ServiceInstance> serviceInstances = discoveryClient.getInstances(service);
            instances.put(service, serviceInstances);
        }
        
        response.put("services", services);
        response.put("instances", instances);
        
        return ResponseEntity.ok(response);
    }
} 