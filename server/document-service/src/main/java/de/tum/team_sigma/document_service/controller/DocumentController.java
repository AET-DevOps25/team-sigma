package de.tum.team_sigma.document_service.controller;

import de.tum.team_sigma.document_service.dto.DocumentResponse;
import de.tum.team_sigma.document_service.dto.DocumentUploadRequest;
import de.tum.team_sigma.document_service.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
@Tag(name = "Document Management", description = "API for document upload, management, and retrieval")
public class DocumentController {
    
    private static final Logger logger = LoggerFactory.getLogger(DocumentController.class);
    
    @Autowired
    private DocumentService documentService;

    @GetMapping("/")
    @Operation(summary = "Health check", description = "Check if the document service is running")
    @ApiResponse(responseCode = "200", description = "Service is running")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Document Service is running!");
    }
    
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a document", description = "Upload a new document with optional metadata")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Document uploaded successfully",
                    content = @Content(schema = @Schema(implementation = DocumentResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid file or request"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<DocumentResponse> uploadDocument(
            @Parameter(description = "File to upload", required = true)
            @RequestParam("file") MultipartFile file,
            @Parameter(description = "Document name", required = true)
            @RequestParam("name") String name,
            @Parameter(description = "Document description")
            @RequestParam(value = "description", required = false) String description,
            @Parameter(description = "Lecture ID")
            @RequestParam(value = "lectureId", required = false) String lectureId) {
        
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            DocumentUploadRequest request = new DocumentUploadRequest(name, description, lectureId);
            DocumentResponse response = documentService.uploadDocument(file, request);
            
            logger.info("Document uploaded successfully: {}", response.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            logger.error("Failed to upload document", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping
    @Operation(summary = "Get all documents", description = "Retrieve a list of all documents, optionally filtered by organization")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Documents retrieved successfully",
                    content = @Content(schema = @Schema(implementation = DocumentResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<DocumentResponse>> getAllDocuments(
            @Parameter(description = "Lecture ID to filter documents")
            @RequestParam(value = "lectureId", required = false) String lectureId) {
        try {
            List<DocumentResponse> documents;
            if (lectureId != null && !lectureId.trim().isEmpty()) {
                documents = documentService.getDocumentsByLecture(lectureId);
                logger.info("Retrieved {} documents for lecture: {}", documents.size(), lectureId);
            } else {
                documents = documentService.getAllDocuments();
                logger.info("Retrieved {} documents (no lecture filter)", documents.size());
            }
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            logger.error("Failed to get documents", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get document by ID", description = "Retrieve a specific document by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Document found",
                    content = @Content(schema = @Schema(implementation = DocumentResponse.class))),
            @ApiResponse(responseCode = "404", description = "Document not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<DocumentResponse> getDocumentById(
            @Parameter(description = "Document ID", required = true)
            @PathVariable Long id) {
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
    @Operation(summary = "Update document", description = "Update document metadata")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Document updated successfully",
                    content = @Content(schema = @Schema(implementation = DocumentResponse.class))),
            @ApiResponse(responseCode = "404", description = "Document not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<DocumentResponse> updateDocument(
            @Parameter(description = "Document ID", required = true)
            @PathVariable Long id,
            @Parameter(description = "Document update request", required = true)
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
    @Operation(summary = "Delete document", description = "Delete a document by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Document deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Document not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Void> deleteDocument(
            @Parameter(description = "Document ID", required = true)
            @PathVariable Long id) {
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
    @Operation(summary = "Download document", description = "Download a document file by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Document downloaded successfully"),
            @ApiResponse(responseCode = "404", description = "Document not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<InputStreamResource> downloadDocument(
            @Parameter(description = "Document ID", required = true)
            @PathVariable Long id) {
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
    @Operation(summary = "Search documents", description = "Search documents by text query")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Search completed successfully",
                    content = @Content(schema = @Schema(implementation = DocumentResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<DocumentResponse>> searchDocuments(
            @Parameter(description = "Search query", required = true)
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
    @Operation(summary = "Search similar documents", description = "Find similar documents using vector similarity search")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Similar documents found",
                    content = @Content(schema = @Schema(implementation = DocumentResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<DocumentResponse>> searchSimilarDocuments(
            @Parameter(description = "Search query for similarity", required = true)
            @RequestParam("q") String query,
            @Parameter(description = "Maximum number of results")
            @RequestParam(value = "limit", defaultValue = "10") int limit) {
        
        try {
            List<DocumentResponse> documents = documentService.searchSimilarDocuments(query, limit);
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            logger.error("Failed to search similar documents with query: {}", query, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/search/chunks")
    @Operation(summary = "Search similar document chunks", description = "Find similar document chunks with text content for RAG processing")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Similar chunks found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<DocumentService.DocumentChunkResponse>> searchSimilarChunks(
            @Parameter(description = "Search query for similarity", required = true)
            @RequestParam("q") String query,
            @Parameter(description = "Maximum number of results")
            @RequestParam(value = "limit", defaultValue = "5") int limit) {
        
        try {
            List<DocumentService.DocumentChunkResponse> chunks = documentService.searchSimilarChunks(query, limit);
            return ResponseEntity.ok(chunks);
        } catch (Exception e) {
            logger.error("Failed to search similar chunks with query: {}", query, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/content-types")
    @Operation(summary = "Get documents by content type", description = "Filter documents by their content type")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Documents filtered successfully"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<DocumentResponse>> getDocumentsByContentType(
            @Parameter(description = "Content type to filter by", required = true)
            @RequestParam("type") String contentType) {
        
        try {
            // This would require implementing in the service
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Failed to get documents by content type: {}", contentType, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @DeleteMapping("/lecture/{lectureId}")
    @Operation(summary = "Delete all documents for a lecture", description = "Delete all documents associated with a specific lecture")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "All documents deleted successfully"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Void> deleteDocumentsByLecture(
            @Parameter(description = "Lecture ID", required = true)
            @PathVariable String lectureId) {
        try {
            logger.info("Received request to delete all documents for lecture: {}", lectureId);
            documentService.deleteDocumentsByLecture(lectureId);
            logger.info("Successfully deleted all documents for lecture: {}", lectureId);
            return ResponseEntity.noContent().build();
            
        } catch (Exception e) {
            logger.error("Failed to delete documents for lecture: {}", lectureId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/{id}/conversation")
    @Operation(summary = "Add message to conversation", description = "Add a message to the document's conversation")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Message added successfully"),
            @ApiResponse(responseCode = "404", description = "Document not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Map<String, Object>> addMessageToConversation(
            @Parameter(description = "Document ID", required = true)
            @PathVariable Long id,
            @Parameter(description = "Message content", required = true)
            @RequestBody Map<String, Object> messageRequest) {
        
        try {
            String messageType = (String) messageRequest.get("messageType");
            String content = (String) messageRequest.get("content");
            
            if (messageType == null || content == null) {
                return ResponseEntity.badRequest().build();
            }
            
            Map<String, Object> conversation = documentService.addMessageToConversation(id, messageType, content);
            return ResponseEntity.ok(conversation);
        } catch (RuntimeException e) {
            logger.error("Document not found with id: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Failed to add message to conversation for document with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @DeleteMapping("/{id}/conversation")
    @Operation(summary = "Clear document conversation", description = "Clear all messages from the document's conversation")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Conversation cleared successfully"),
            @ApiResponse(responseCode = "404", description = "Document not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Map<String, Object>> clearDocumentConversation(
            @Parameter(description = "Document ID", required = true)
            @PathVariable Long id) {
        
        try {
            Map<String, Object> response = documentService.clearDocumentConversation(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Document not found with id: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Failed to clear conversation for document with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
