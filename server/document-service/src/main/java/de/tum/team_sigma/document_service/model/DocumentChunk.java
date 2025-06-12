package de.tum.team_sigma.document_service.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "document_chunks")
public class DocumentChunk {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;
    
    @NotBlank(message = "Weaviate ID is required")
    @Column(name = "weaviate_id", nullable = false, unique = true)
    private String weavateId;
    
    @NotNull(message = "Chunk index is required")
    @Column(name = "chunk_index", nullable = false)
    private Integer chunkIndex;
    
    @Column(name = "chunk_text", columnDefinition = "TEXT")
    private String chunkText;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    public DocumentChunk() {
        this.createdAt = LocalDateTime.now();
    }
    
    public DocumentChunk(Document document, String weavateId, Integer chunkIndex, String chunkText) {
        this();
        this.document = document;
        this.weavateId = weavateId;
        this.chunkIndex = chunkIndex;
        this.chunkText = chunkText;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Document getDocument() {
        return document;
    }
    
    public void setDocument(Document document) {
        this.document = document;
    }
    
    public String getWeavateId() {
        return weavateId;
    }
    
    public void setWeavateId(String weavateId) {
        this.weavateId = weavateId;
    }
    
    public Integer getChunkIndex() {
        return chunkIndex;
    }
    
    public void setChunkIndex(Integer chunkIndex) {
        this.chunkIndex = chunkIndex;
    }
    
    public String getChunkText() {
        return chunkText;
    }
    
    public void setChunkText(String chunkText) {
        this.chunkText = chunkText;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
} 