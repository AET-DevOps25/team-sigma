package de.tum.team_sigma.genai_service.controllers;

import org.springframework.web.bind.annotation.RestController;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.Part;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
public class GenaiServiceController {
    private final Client client = Client.builder().apiKey(System.getenv("GOOGLE_API_KEY")).build();

    @GetMapping("/api/genai/chat/{message}")
    public String root(@PathVariable String message) {
        var response = client.models.generateContent("gemini-2.5-flash", Content.fromParts(
                Part.fromText(message)), null);
        return response.candidates().get().get(0).content().get().text();
    }
}
