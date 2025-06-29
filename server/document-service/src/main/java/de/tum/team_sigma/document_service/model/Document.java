package de.tum.team_sigma.document_service.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "documents")
public class Document {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Document name is required")
    @Column(name = "name", nullable = false)
    private String name;
    
    @NotBlank(message = "Original filename is required")
    @Column(name = "original_filename", nullable = false)
    private String originalFilename;
    
    @NotBlank(message = "Content type is required")
    @Column(name = "content_type", nullable = false)
    private String contentType;
    
    @NotNull(message = "File size is required")
    @Column(name = "file_size", nullable = false)
    private Long fileSize;
    
    @NotBlank(message = "MinIO path is required")
    @Column(name = "minio_path", nullable = false)
    private String minioPath;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "organization_id")
    private String organizationId;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DocumentChunk> chunks;
    
    public Document() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Document(String name, String originalFilename, String contentType, Long fileSize, String minioPath) {
        this();
        this.name = name;
        this.originalFilename = originalFilename;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.minioPath = minioPath;
    }
    
    public Document(String name, String originalFilename, String contentType, Long fileSize, String minioPath, String organizationId) {
        this();
        this.name = name;
        this.originalFilename = originalFilename;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.minioPath = minioPath;
        this.organizationId = organizationId;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
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
    
    public String getMinioPath() {
        return minioPath;
    }
    
    public void setMinioPath(String minioPath) {
        this.minioPath = minioPath;
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
    
    public List<DocumentChunk> getChunks() {
        return chunks;
    }
    
    public void setChunks(List<DocumentChunk> chunks) {
        this.chunks = chunks;
    }
} 