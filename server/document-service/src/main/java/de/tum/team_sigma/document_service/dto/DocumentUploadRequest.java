package de.tum.team_sigma.document_service.dto;

import jakarta.validation.constraints.NotBlank;

public class DocumentUploadRequest {
    
    @NotBlank(message = "Document name is required")
    private String name;
    
    private String description;
    
    private String lectureId;
    
    public DocumentUploadRequest() {}
    
    public DocumentUploadRequest(String name, String description) {
        this.name = name;
        this.description = description;
    }
    
    public DocumentUploadRequest(String name, String description, String lectureId) {
        this.name = name;
        this.description = description;
        this.lectureId = lectureId;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
        public String getLectureId() {
        return lectureId;
    }

    public void setLectureId(String lectureId) {
        this.lectureId = lectureId;
    }
} 