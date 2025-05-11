package de.tum.team_sigma.hello_service.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "Hello!";
    }

    @GetMapping("/hello/{name}")
    public String hello(@PathVariable String name) {
        return "Hello " + name + "!";
    }
}
