package de.tum.team_sigma.lecture_service.controller;

import de.tum.team_sigma.lecture_service.dto.LectureRequest;
import de.tum.team_sigma.lecture_service.dto.LectureResponse;
import de.tum.team_sigma.lecture_service.service.LectureService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lectures")
@CrossOrigin(origins = "*")
public class LectureController {
    
    private static final Logger logger = LoggerFactory.getLogger(LectureController.class);
    
    @Autowired
    private LectureService lectureService;

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Lecture Service is running");
    }
    
    @PostMapping
    public ResponseEntity<LectureResponse> createLecture(@Valid @RequestBody LectureRequest request) {
        try {
            LectureResponse response = lectureService.createLecture(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            logger.error("Error creating lecture", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LectureResponse>> getLecturesByUserId(@PathVariable String userId) {
        try {
            List<LectureResponse> lectures = lectureService.getLecturesByUserId(userId);
            return ResponseEntity.ok(lectures);
        } catch (Exception e) {
            logger.error("Error fetching lectures for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
 
    @GetMapping("/{id}")
    public ResponseEntity<LectureResponse> getLectureById(@PathVariable Long id) {
        try {
            LectureResponse lecture = lectureService.getLectureById(id);
            return ResponseEntity.ok(lecture);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            logger.error("Error fetching lecture with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<LectureResponse> updateLecture(@PathVariable Long id, @Valid @RequestBody LectureRequest request) {
        try {
            LectureResponse response = lectureService.updateLecture(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            logger.error("Error updating lecture with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLecture(@PathVariable Long id) {
        try {
            lectureService.deleteLecture(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            logger.error("Error deleting lecture with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<LectureResponse>> getAllLectures() {
        try {
            List<LectureResponse> lectures = lectureService.getAllLectures();
            return ResponseEntity.ok(lectures);
        } catch (Exception e) {
            logger.error("Error fetching all lectures", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
} 