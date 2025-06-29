package de.tum.team_sigma.lecture_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "document-service")
public interface DocumentServiceClient {
    
    @DeleteMapping("/api/documents/lecture/{lectureId}")
    ResponseEntity<Void> deleteDocumentsByLecture(@PathVariable("lectureId") String lectureId);
} 