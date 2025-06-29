package de.tum.team_sigma.document_service.dto;

import de.tum.team_sigma.document_service.model.Document;
import java.time.LocalDateTime;

public class DocumentResponse {
    
    private Long id;
    private String name;
    private String originalFilename;
    private String contentType;
    private Long fileSize;
    private String description;
    private String organizationId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int chunkCount;
    
    public DocumentResponse() {}
    
    public DocumentResponse(Document document) {
        this.id = document.getId();
        this.name = document.getName();
        this.originalFilename = document.getOriginalFilename();
        this.contentType = document.getContentType();
        this.fileSize = document.getFileSize();
        this.description = document.getDescription();
        this.organizationId = document.getOrganizationId();
        this.createdAt = document.getCreatedAt();
        this.updatedAt = document.getUpdatedAt();
        this.chunkCount = document.getChunks() != null ? document.getChunks().size() : 0;
    }
    
    // Getters and Setters
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
    
    public String getOriginalFilename() {
        return originalFilename;
    }
    
    public void setOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
    }
    
    public String getContentType() {
        return contentType;
    }
    
    public void setContentType(String contentType) {
        this.contentType = contentType;
    }
    
    public Long getFileSize() {
        return fileSize;
    }
    
    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getOrganizationId() {
        return organizationId;
    }
    
    public void setOrganizationId(String organizationId) {
        this.organizationId = organizationId;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public int getChunkCount() {
        return chunkCount;
    }
    
    public void setChunkCount(int chunkCount) {
        this.chunkCount = chunkCount;
    }
} 