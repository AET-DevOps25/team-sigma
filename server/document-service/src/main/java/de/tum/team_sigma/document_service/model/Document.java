package de.tum.team_sigma.document_service.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

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
    
    @Column(name = "lecture_id")
    private String lectureId;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DocumentChunk> chunks;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "conversation", columnDefinition = "jsonb")
    private List<ConversationMessage> conversation = new ArrayList<>();
    
    public static class ConversationMessage {
        @JsonProperty("messageIndex")
        private Integer messageIndex;
        
        @JsonProperty("messageType")
        private MessageType messageType;
        
        @JsonProperty("content")
        private String content;
        
        @JsonProperty("createdAt")
        private LocalDateTime createdAt;
        
        public enum MessageType {
            AI, HUMAN
        }
        
        public ConversationMessage() {
            this.createdAt = LocalDateTime.now();
        }
        
        public ConversationMessage(Integer messageIndex, MessageType messageType, String content) {
            this();
            this.messageIndex = messageIndex;
            this.messageType = messageType;
            this.content = content;
        }
        
        // Getters and Setters
        public Integer getMessageIndex() {
            return messageIndex;
        }
        
        public void setMessageIndex(Integer messageIndex) {
            this.messageIndex = messageIndex;
        }
        
        public MessageType getMessageType() {
            return messageType;
        }
        
        public void setMessageType(MessageType messageType) {
            this.messageType = messageType;
        }
        
        public String getContent() {
            return content;
        }
        
        public void setContent(String content) {
            this.content = content;
        }
        
        public LocalDateTime getCreatedAt() {
            return createdAt;
        }
        
        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }
    }
    
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
    
    public Document(String name, String originalFilename, String contentType, Long fileSize, String minioPath, String lectureId) {
        this();
        this.name = name;
        this.originalFilename = originalFilename;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.minioPath = minioPath;
        this.lectureId = lectureId;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Helper methods for conversation management
    public void addMessage(ConversationMessage.MessageType messageType, String content) {
        Integer nextIndex = conversation.size();
        ConversationMessage message = new ConversationMessage(nextIndex, messageType, content);
        conversation.add(message);
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
    
    public String getLectureId() {
        return lectureId;
    }
    
    public void setLectureId(String lectureId) {
        this.lectureId = lectureId;
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
    
    public List<ConversationMessage> getConversation() {
        return conversation;
    }
    
    public void setConversation(List<ConversationMessage> conversation) {
        this.conversation = conversation;
    }
} 