package de.tum.team_sigma.document_service.dto;

import jakarta.validation.constraints.NotBlank;

public class DocumentUploadRequest {
    
    @NotBlank(message = "Document name is required")
    private String name;
    
    private String description;
    
    public DocumentUploadRequest() {}
    
    public DocumentUploadRequest(String name, String description) {
        this.name = name;
        this.description = description;
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
} 