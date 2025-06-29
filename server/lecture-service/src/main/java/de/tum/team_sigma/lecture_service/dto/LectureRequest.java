package de.tum.team_sigma.lecture_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class LectureRequest {
    
    @NotBlank(message = "Lecture name is required")
    @Size(max = 100, message = "Lecture name must not exceed 100 characters")
    private String name;
    
    @NotBlank(message = "User ID is required")
    private String userId;
    
    public LectureRequest() {
    }
    
    public LectureRequest(String name, String userId) {
        this.name = name;
        this.userId = userId;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
} 