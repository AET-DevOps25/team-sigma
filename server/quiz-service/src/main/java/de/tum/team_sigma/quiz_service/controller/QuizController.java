package de.tum.team_sigma.quiz_service.controller;

import de.tum.team_sigma.quiz_service.dto.QuizDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/quiz")
@Tag(name = "Quiz Service", description = "Quiz service")
public class QuizController {

    @GetMapping("/")
    @Operation(summary = "Get greeting", description = "Returns a simple greeting message")
    @ApiResponse(responseCode = "200", description = "Greeting returned successfully")
    public String quiz() {
        return "Hello!";
    }

    @GetMapping("/{slideId}")
    @Operation(summary = "Get personalized greeting", description = "Returns a personalized greeting message")
    @ApiResponse(responseCode = "200", description = "Personalized greeting returned successfully")
    public QuizDto quiz(
            @Parameter(description = "Slide ID", required = true)
            @PathVariable String slideId) {
        return new QuizDto(slideId, "Question", "Answer");
    }
}
