package de.tum.team_sigma.document_service.repository;

import de.tum.team_sigma.document_service.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    
    Optional<Document> findByName(String name);
    
    List<Document> findByNameContainingIgnoreCase(String name);
    
    List<Document> findByContentType(String contentType);
    
    List<Document> findByLectureId(String lectureId);
    
    @Query("SELECT d FROM Document d LEFT JOIN FETCH d.chunks WHERE d.id = :id")
    Optional<Document> findByIdWithChunks(@Param("id") Long id);
    
    @Query("SELECT d FROM Document d WHERE d.description LIKE %:keyword% OR d.name LIKE %:keyword%")
    List<Document> searchByKeyword(@Param("keyword") String keyword);
} 