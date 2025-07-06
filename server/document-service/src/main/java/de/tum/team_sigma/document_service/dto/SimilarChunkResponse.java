package de.tum.team_sigma.document_service.dto;

public class SimilarChunkResponse {
    private Long documentId;
    private Integer chunkIndex;
    private String text;

    public SimilarChunkResponse() {}

    public SimilarChunkResponse(Long documentId, Integer chunkIndex, String text) {
        this.documentId = documentId;
        this.chunkIndex = chunkIndex;
        this.text = text;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public Integer getChunkIndex() {
        return chunkIndex;
    }

    public void setChunkIndex(Integer chunkIndex) {
        this.chunkIndex = chunkIndex;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
} 