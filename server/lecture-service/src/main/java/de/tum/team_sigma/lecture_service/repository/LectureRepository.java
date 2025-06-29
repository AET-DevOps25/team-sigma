package de.tum.team_sigma.lecture_service.repository;

import de.tum.team_sigma.lecture_service.model.Lecture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LectureRepository extends JpaRepository<Lecture, Long> {
    
    List<Lecture> findByCreatedByOrderByCreatedAtDesc(String createdBy);
    
    @Query("SELECT l FROM Lecture l WHERE LOWER(l.name) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY l.createdAt DESC")
    List<Lecture> findByNameContainingIgnoreCase(@Param("keyword") String keyword);
    
    @Query("SELECT l FROM Lecture l WHERE l.createdBy = :userId AND LOWER(l.name) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY l.createdAt DESC")
    List<Lecture> findByCreatedByAndNameContainingIgnoreCase(@Param("userId") String userId, @Param("keyword") String keyword);
} 