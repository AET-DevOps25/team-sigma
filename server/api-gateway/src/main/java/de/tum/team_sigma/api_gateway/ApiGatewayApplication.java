package de.tum.team_sigma.api_gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.*;
import static org.springframework.cloud.gateway.server.mvc.predicate.GatewayRequestPredicates.*;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.*;
import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.*;
import static org.springframework.cloud.gateway.server.mvc.filter.LoadBalancerFilterFunctions.*;

@SpringBootApplication
public class ApiGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }

    @Bean
    public RouterFunction<ServerResponse> helloServiceRouteConfig() {
        return route("hello-service")
                .route(path("/api/hello/**"), http())
                .before(stripPrefix(2))
                .filter(lb("hello-service"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> documentServiceRouteConfig() {
        return route("document-service")
                .route(path("/api/document/**"), http())
                .before(stripPrefix(2))
                .filter(lb("document-service"))
                .build();
    }
}
