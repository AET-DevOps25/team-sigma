package de.tum.team_sigma.lecture_service.dto;

import de.tum.team_sigma.lecture_service.model.Lecture;
import java.time.LocalDateTime;

public class LectureResponse {
    
    private Long id;
    private String name;
    private String createdBy;
    private LocalDateTime createdAt;
    
    public LectureResponse() {
    }
    
    public LectureResponse(Lecture lecture) {
        this.id = lecture.getId();
        this.name = lecture.getName();
        this.createdBy = lecture.getCreatedBy();
        this.createdAt = lecture.getCreatedAt();
    }
    
    public LectureResponse(Long id, String name, String createdBy, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
} 