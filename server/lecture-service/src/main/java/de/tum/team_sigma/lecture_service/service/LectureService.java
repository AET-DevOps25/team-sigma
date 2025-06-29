package de.tum.team_sigma.lecture_service.service;

import de.tum.team_sigma.lecture_service.dto.LectureRequest;
import de.tum.team_sigma.lecture_service.dto.LectureResponse;
import de.tum.team_sigma.lecture_service.model.Lecture;
import de.tum.team_sigma.lecture_service.repository.LectureRepository;
import de.tum.team_sigma.lecture_service.client.DocumentServiceClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class LectureService {
    
    private static final Logger logger = LoggerFactory.getLogger(LectureService.class);
    
    @Autowired
    private LectureRepository lectureRepository;
    
    @Autowired
    private DocumentServiceClient documentServiceClient;
    
    public LectureResponse createLecture(LectureRequest request) {
        try {
            logger.info("Creating new lecture: {} for user: {}", request.getName(), request.getUserId());
            
            Lecture lecture = new Lecture(request.getName(), request.getUserId());
            lecture = lectureRepository.save(lecture);
            
            logger.info("Lecture created successfully with ID: {}", lecture.getId());
            return new LectureResponse(lecture);
            
        } catch (Exception e) {
            logger.error("Failed to create lecture: {} for user: {}", request.getName(), request.getUserId(), e);
            throw new RuntimeException("Failed to create lecture", e);
        }
    }
    
    @Transactional(readOnly = true)
    public List<LectureResponse> getLecturesByUserId(String userId) {
        logger.info("Fetching lectures for user: {}", userId);
        
        List<Lecture> lectures = lectureRepository.findByCreatedByOrderByCreatedAtDesc(userId);
        
        return lectures.stream()
                .map(LectureResponse::new)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public LectureResponse getLectureById(Long id) {
        Lecture lecture = lectureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lecture not found with id: " + id));
        
        return new LectureResponse(lecture);
    }
    
    public LectureResponse updateLecture(Long id, LectureRequest request) {
        try {
            logger.info("Updating lecture with ID: {}", id);
            
            Lecture lecture = lectureRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Lecture not found with id: " + id));
            
            lecture.setName(request.getName());
            lecture = lectureRepository.save(lecture);
            
            logger.info("Lecture updated successfully: {}", lecture.getName());
            return new LectureResponse(lecture);
            
        } catch (Exception e) {
            logger.error("Failed to update lecture with ID: {}", id, e);
            throw new RuntimeException("Failed to update lecture", e);
        }
    }
    
    public void deleteLecture(Long id) {
        try {
            logger.info("Deleting lecture with ID: {}", id);
            
            Lecture lecture = lectureRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Lecture not found with id: " + id));
            
            deleteAssociatedDocuments(id.toString());            
            lectureRepository.delete(lecture);
            logger.info("Lecture deleted successfully: {}", lecture.getName());
            
        } catch (Exception e) {
            logger.error("Failed to delete lecture with ID: {}", id, e);
            throw new RuntimeException("Failed to delete lecture", e);
        }
    }
    
    private void deleteAssociatedDocuments(String lectureId) {
        try {
            logger.info("Deleting associated documents for lecture: {}", lectureId);
            
            ResponseEntity<Void> response = documentServiceClient.deleteDocumentsByLecture(lectureId);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("Successfully deleted documents for lecture: {}", lectureId);
            } else {
                logger.warn("Document deletion returned status: {} for lecture: {}", 
                    response.getStatusCode(), lectureId);
            }
            
        } catch (Exception e) {
            logger.error("Failed to delete documents for lecture: {}", lectureId, e);
        }
    }

    @Transactional(readOnly = true)
    public List<LectureResponse> getAllLectures() {
        logger.info("Fetching all lectures");
        
        return lectureRepository.findAll().stream()
                .map(LectureResponse::new)
                .collect(Collectors.toList());
    }
} 