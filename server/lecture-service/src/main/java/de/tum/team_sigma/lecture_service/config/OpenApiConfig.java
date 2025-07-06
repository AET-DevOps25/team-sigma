package de.tum.team_sigma.lecture_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${server.port:8083}")
    private String serverPort;

    @Bean
    public OpenAPI lectureServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Lecture Service API")
                        .description("API for managing lectures and related operations")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Team Sigma")
                                .email("team-sigma@tum.de"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:" + serverPort)
                                .description("Development Server"),
                        new Server()
                                .url("http://lecture-service:" + serverPort)
                                .description("Docker Server")
                ));
    }
} 