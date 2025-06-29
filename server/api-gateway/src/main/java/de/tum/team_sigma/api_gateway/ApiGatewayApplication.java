package de.tum.team_sigma.api_gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.*;
import static org.springframework.cloud.gateway.server.mvc.predicate.GatewayRequestPredicates.*;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.*;
import static org.springframework.cloud.gateway.server.mvc.filter.LoadBalancerFilterFunctions.*;

@SpringBootApplication
public class ApiGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }

    @Bean
    public RouterFunction<ServerResponse> documentServiceRouteConfig() {
        return route("document-service")
                .route(path("/api/documents/**"), http())
                .filter(lb("document-service"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> quizServiceRouteConfig() {
        return route("quiz-service")
                .route(path("/api/quiz/**"), http())
                .filter(lb("quiz-service"))
                .build();
    }
}
