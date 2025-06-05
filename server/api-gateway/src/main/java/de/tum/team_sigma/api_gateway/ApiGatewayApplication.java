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

    private RouterFunction<ServerResponse> buildMicroserviceRoute(String serviceName) {
        return route(serviceName + "-service")
                .route(path("/api/" + serviceName + "/**"), http())
                .before(stripPrefix(2))
                .filter(lb(serviceName + "-service"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> helloServiceRouteConfig() {
        return buildMicroserviceRoute("hello");
    }

    @Bean
    public RouterFunction<ServerResponse> documentServiceRouteConfig() {
        return buildMicroserviceRoute("document");
    }
}
