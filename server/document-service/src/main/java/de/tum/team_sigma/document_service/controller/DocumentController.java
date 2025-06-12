package de.tum.team_sigma.document_service.controller;

import de.tum.team_sigma.document_service.dto.DocumentResponse;
import de.tum.team_sigma.document_service.dto.DocumentUploadRequest;
import de.tum.team_sigma.document_service.service.DocumentService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentController {
    
    private static final Logger logger = LoggerFactory.getLogger(DocumentController.class);
    
    @Autowired
    private DocumentService documentService;

    @GetMapping("/")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Document Service is running!");
    }
    
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentResponse> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description) {
        
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            DocumentUploadRequest request = new DocumentUploadRequest(name, description);
            DocumentResponse response = documentService.uploadDocument(file, request);
            
            logger.info("Document uploaded successfully: {}", response.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            logger.error("Failed to upload document", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping
    public ResponseEntity<List<DocumentResponse>> getAllDocuments() {
        try {
            List<DocumentResponse> documents = documentService.getAllDocuments();
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            logger.error("Failed to get all documents", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponse> getDocumentById(@PathVariable Long id) {
        try {
            DocumentResponse document = documentService.getDocumentById(id);
            return ResponseEntity.ok(document);
        } catch (RuntimeException e) {
            logger.error("Document not found with id: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Failed to get document with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<DocumentResponse> updateDocument(
            @PathVariable Long id,
            @Valid @RequestBody DocumentUploadRequest request) {
        
        try {
            DocumentResponse document = documentService.updateDocument(id, request);
            return ResponseEntity.ok(document);
        } catch (RuntimeException e) {
            logger.error("Document not found with id: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Failed to update document with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        try {
            documentService.deleteDocument(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            logger.error("Document not found with id: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Failed to delete document with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}/download")
    public ResponseEntity<InputStreamResource> downloadDocument(@PathVariable Long id) {
        try {
            DocumentResponse document = documentService.getDocumentById(id);
            InputStream inputStream = documentService.downloadDocument(id);
            
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, 
                "attachment; filename=\"" + document.getOriginalFilename() + "\"");
            headers.add(HttpHeaders.CONTENT_TYPE, document.getContentType());
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(new InputStreamResource(inputStream));
                
        } catch (RuntimeException e) {
            logger.error("Document not found with id: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Failed to download document with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<DocumentResponse>> searchDocuments(
            @RequestParam("q") String query) {
        
        try {
            List<DocumentResponse> documents = documentService.searchDocuments(query);
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            logger.error("Failed to search documents with query: {}", query, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/search/similar")
    public ResponseEntity<List<DocumentResponse>> searchSimilarDocuments(
            @RequestParam("q") String query,
            @RequestParam(value = "limit", defaultValue = "10") int limit) {
        
        try {
            List<DocumentResponse> documents = documentService.searchSimilarDocuments(query, limit);
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            logger.error("Failed to search similar documents with query: {}", query, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/content-types")
    public ResponseEntity<List<DocumentResponse>> getDocumentsByContentType(
            @RequestParam("type") String contentType) {
        
        try {
            // This would require implementing in the service
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Failed to get documents by content type: {}", contentType, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
