package de.tum.team_sigma.document_service.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DocumentController {

    @GetMapping("/")
    public String document() {
        return "Document Service is running!";
    }

    @GetMapping("/{id}")
    public String document(@PathVariable String id) {
        return "Document " + id + " retrieved!";
    }
}
