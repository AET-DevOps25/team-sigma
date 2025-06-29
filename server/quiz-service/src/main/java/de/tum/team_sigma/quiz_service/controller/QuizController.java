package de.tum.team_sigma.quiz_service.controller;

import de.tum.team_sigma.quiz_service.models.QuizQuestion;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.ArrayList;
import java.util.List;

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
    public List<QuizQuestion> quiz(
            @Parameter(description = "Slide ID", required = true) @PathVariable String slideId) {
        List<QuizQuestion> questions = new ArrayList<>();
        questions.add(new QuizQuestion("1", "Question", new String[] { "Answer1", "Answer2", "Answer3", "Answer4" },
                0, "Explanation"));
        questions.add(new QuizQuestion("2", "Question", new String[] { "Answer1", "Answer2", "Answer3", "Answer4" },
                0, "Explanation"));
        questions.add(new QuizQuestion("3", "Question", new String[] { "Answer1", "Answer2", "Answer3", "Answer4" },
                0, "Explanation"));
        questions.add(new QuizQuestion("4", "Question", new String[] { "Answer1", "Answer2", "Answer3", "Answer4" },
                0, "Explanation"));
        questions.add(new QuizQuestion("5", "Question", new String[] { "Answer1", "Answer2", "Answer3", "Answer4" },
                0, "Explanation"));
        questions.add(new QuizQuestion("6", "Question", new String[] { "Answer1", "Answer2", "Answer3", "Answer4" },
                0, "Explanation"));
        questions.add(new QuizQuestion("7", "Question", new String[] { "Answer1", "Answer2", "Answer3", "Answer4" },
                0, "Explanation"));
        return questions;
    }
}
