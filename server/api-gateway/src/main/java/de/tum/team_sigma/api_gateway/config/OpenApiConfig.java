package de.tum.team_sigma.api_gateway.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI apiGatewayOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Team Sigma API Gateway")
                        .description("Unified API Gateway with aggregated microservice endpoints")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Team Sigma")
                                .email("team-sigma@tum.de"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Development Server"),
                        new Server().url("http://api-gateway:8080").description("Docker Server")
                ))
                .tags(List.of(
                        new Tag().name("Gateway Management").description("API Gateway information and health endpoints"),
                        new Tag().name("Document Management").description("Document upload, management, and retrieval"),
                        new Tag().name("Hello Service").description("Simple greeting service endpoints")
                ));
    }
} 