package de.tum.team_sigma.quiz_service.models;

public record QuizQuestion(String id, String question, String[] options, int correctAnswer, String explanation) {
}
