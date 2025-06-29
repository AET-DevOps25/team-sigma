package de.tum.team_sigma.api_gateway.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
public class OpenApiController {

    @Autowired
    private DiscoveryClient discoveryClient;

    private final WebClient webClient = WebClient.builder().build();

    @GetMapping("/api/{service}/v3/api-docs")
    public Mono<ResponseEntity<String>> getServiceApiDocs(@PathVariable String service) {
        String serviceName = service + "-service";
        
        List<ServiceInstance> instances = discoveryClient.getInstances(serviceName);
        
        if (instances.isEmpty()) {
            return Mono.just(ResponseEntity.notFound().build());
        }
        
        ServiceInstance instance = instances.get(0);
        String serviceUrl = instance.getUri().toString();
        
        return webClient.get()
                .uri(serviceUrl + "/v3/api-docs")
                .retrieve()
                .bodyToMono(String.class)
                .map(body -> ResponseEntity.ok()
                        .header("Content-Type", "application/json")
                        .body(body))
                .onErrorReturn(ResponseEntity.notFound().build());
    }
} 