package de.tum.team_sigma.hello_service.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/")
    public String hello() {
        return "Hello!";
    }

    @GetMapping("/{name}")
    public String hello(@PathVariable String name) {
        return "Hello " + name + "!";
    }
}
