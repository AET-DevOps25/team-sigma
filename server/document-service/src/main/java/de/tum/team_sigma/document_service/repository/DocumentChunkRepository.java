package de.tum.team_sigma.document_service.repository;

import de.tum.team_sigma.document_service.model.DocumentChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, Long> {
    
    List<DocumentChunk> findByDocumentIdOrderByChunkIndex(Long documentId);
    
    Optional<DocumentChunk> findByWeavateId(String weavateId);
    
    void deleteByDocumentId(Long documentId);
    
    long countByDocumentId(Long documentId);
} 