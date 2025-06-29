package de.tum.team_sigma.hello_service.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hello")
@Tag(name = "Hello Service", description = "Simple greeting service")
public class HelloController {

    @GetMapping("/")
    @Operation(summary = "Get greeting", description = "Returns a simple greeting message")
    @ApiResponse(responseCode = "200", description = "Greeting returned successfully")
    public String hello() {
        return "Hello!";
    }

    @GetMapping("/{name}")
    @Operation(summary = "Get personalized greeting", description = "Returns a personalized greeting message")
    @ApiResponse(responseCode = "200", description = "Personalized greeting returned successfully")
    public String hello(
            @Parameter(description = "Name for personalized greeting", required = true)
            @PathVariable String name) {
        return "Hello " + name + "!!";
    }
}
