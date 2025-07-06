package de.tum.team_sigma.document_service.service;

import de.tum.team_sigma.document_service.dto.DocumentResponse;
import de.tum.team_sigma.document_service.dto.DocumentUploadRequest;
import de.tum.team_sigma.document_service.model.Document;
import de.tum.team_sigma.document_service.model.DocumentChunk;
import de.tum.team_sigma.document_service.repository.DocumentChunkRepository;
import de.tum.team_sigma.document_service.repository.DocumentRepository;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.weaviate.client.WeaviateClient;
import io.weaviate.client.v1.graphql.query.argument.NearTextArgument;
import org.apache.tika.Tika;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.stream.Collectors;

import java.io.InputStream;
import java.util.*;

@Service
@Transactional
public class DocumentService {
    
    private static final Logger logger = LoggerFactory.getLogger(DocumentService.class);
    
    @Autowired
    private DocumentRepository documentRepository;
    
    @Autowired
    private DocumentChunkRepository documentChunkRepository;
    
    @Autowired
    private MinioClient minioClient;
    
    @Autowired
    private WeaviateClient weaviateClient;
    
    @Value("${minio.bucket-name}")
    private String bucketName;
    
    private final Tika tika = new Tika();
    
    public DocumentResponse uploadDocument(MultipartFile file, DocumentUploadRequest request) {
        try {
            logger.info("Starting document upload: {}", request.getName());
            
            // Generate unique file path for MinIO
            String minioPath = generateMinioPath(file.getOriginalFilename());
            
            // Store file in MinIO
            storeFileInMinio(file, minioPath);
            
            // Extract text content using Tika
            String extractedText = tika.parseToString(file.getInputStream());
            logger.info("Extracted text: {}", extractedText);
            
            // Create document entity
            Document document = new Document(
                request.getName(),
                file.getOriginalFilename(),
                file.getContentType(),
                file.getSize(),
                minioPath,
                request.getLectureId()
            );
            document.setDescription(request.getDescription());
            
            // Save document to database
            document = documentRepository.save(document);
            logger.info("Document saved to database with ID: {}", document.getId());
            
            // Create simple chunks for the document (basic text splitting)
            createDocumentChunks(document, extractedText);
            
            // Reload document with chunks to get accurate count
            document = documentRepository.findByIdWithChunks(document.getId())
                    .orElseThrow(() -> new RuntimeException("Document not found after processing"));
            
            logger.info("Document upload completed successfully: {}", document.getName());
            return new DocumentResponse(document);
            
        } catch (Exception e) {
            logger.error("Failed to upload document: {}", request.getName(), e);
            throw new RuntimeException("Failed to upload document", e);
        }
    }
    
    private void createDocumentChunks(Document document, String extractedText) {
        try {
            logger.info("Creating chunks for document: {}", document.getName());
            
            // Simple text chunking (split by sentences/paragraphs)
            String[] chunks = extractedText.split("(?<=\\.)\\s+");
            List<DocumentChunk> documentChunks = new ArrayList<>();
            
            for (int i = 0; i < chunks.length; i++) {
                String chunkText = chunks[i].trim();
                if (!chunkText.isEmpty()) {
                    // Store text + metadata in Weaviate; vector will be generated automatically by the module
                    String uuid = UUID.randomUUID().toString();
                    weaviateClient.data().creator()
                        .withClassName("DocumentChunk")
                        .withID(uuid)
                        .withProperties(Map.of(
                            "text", chunkText,
                            "documentId", document.getId(),
                            "chunkIndex", i
                        ))
                        .run();

                    DocumentChunk chunk = new DocumentChunk(
                        document,
                        uuid,
                        i,
                        chunkText
                    );
                    documentChunks.add(chunk);
                }
            }
            
            documentChunkRepository.saveAll(documentChunks);
            logger.info("Saved {} chunks to database", documentChunks.size());
            
        } catch (Exception e) {
            logger.error("Failed to create document chunks", e);
            throw new RuntimeException("Failed to process document", e);
        }
    }
    
    private void storeFileInMinio(MultipartFile file, String minioPath) {
        try {
            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(minioPath)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build()
            );
            logger.info("File stored in MinIO: {}", minioPath);
        } catch (Exception e) {
            logger.error("Failed to store file in MinIO: {}", minioPath, e);
            throw new RuntimeException("Failed to store file in MinIO", e);
        }
    }
    
    private String generateMinioPath(String originalFilename) {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        return "documents/" + timestamp + "_" + uuid + "_" + originalFilename;
    }
    
    @Transactional(readOnly = true)
    public List<DocumentResponse> getAllDocuments() {
        return documentRepository.findAll().stream()
            .map(DocumentResponse::new)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<DocumentResponse> getDocumentsByLecture(String lectureId) {
        logger.info("Fetching documents for lecture: {}", lectureId);
        return documentRepository.findByLectureId(lectureId).stream()
            .map(DocumentResponse::new)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public DocumentResponse getDocumentById(Long id) {
        Document document = documentRepository.findByIdWithChunks(id)
            .orElseThrow(() -> new RuntimeException("Document not found with id: " + id));
        return new DocumentResponse(document);
    }
    
    @Transactional(readOnly = true)
    public List<DocumentResponse> searchDocuments(String keyword) {
        return documentRepository.searchByKeyword(keyword).stream()
            .map(DocumentResponse::new)
            .collect(Collectors.toList());
    }
    
    public DocumentResponse updateDocument(Long id, DocumentUploadRequest request) {
        Document document = documentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Document not found with id: " + id));
        
        document.setName(request.getName());
        document.setDescription(request.getDescription());
        
        document = documentRepository.save(document);
        logger.info("Document updated: {}", document.getName());
        
        return new DocumentResponse(document);
    }
    
    public void deleteDocument(Long id) {
        Document document = documentRepository.findByIdWithChunks(id)
            .orElseThrow(() -> new RuntimeException("Document not found with id: " + id));
        
        try {
            deleteDocumentAndCleanup(document);
            logger.info("Document deleted successfully: {}", document.getName());
            
        } catch (Exception e) {
            logger.error("Failed to delete document: {}", document.getName(), e);
            throw new RuntimeException("Failed to delete document", e);
        }
    }

    public void deleteDocumentsByLecture(String lectureId) {
        try {
            logger.info("Deleting all documents for lecture: {}", lectureId);
            
            List<Document> documents = documentRepository.findByLectureId(lectureId);
            logger.info("Found {} documents to delete for lecture: {}", documents.size(), lectureId);
            
            for (Document document : documents) {
                try {
                    deleteDocumentAndCleanup(document);
                    logger.info("Deleted document: {} for lecture: {}", document.getName(), lectureId);
                } catch (Exception e) {
                    logger.error("Failed to delete document: {} for lecture: {}", document.getName(), lectureId, e);
                    // Continue with other documents even if one fails
                }
            }
            
            logger.info("Completed deletion of documents for lecture: {}", lectureId);
            
        } catch (Exception e) {
            logger.error("Failed to delete documents for lecture: {}", lectureId, e);
            throw new RuntimeException("Failed to delete documents for lecture", e);
        }
    }

    private void deleteDocumentAndCleanup(Document document) throws Exception {
        // Delete chunks from Weaviate
        for (DocumentChunk chunk : document.getChunks()) {
            try {
                weaviateClient.data().deleter()
                    .withClassName("DocumentChunk")
                    .withID(chunk.getWeaviateId())
                    .run();
            } catch (Exception e) {
                logger.warn("Failed to delete chunk from Weaviate: {}", chunk.getWeaviateId(), e);
            }
        }
        
        // Delete file from MinIO
        minioClient.removeObject(
            RemoveObjectArgs.builder()
                .bucket(bucketName)
                .object(document.getMinioPath())
                .build()
        );
        logger.info("Deleted file from MinIO: {}", document.getMinioPath());
        
        // Delete document from database (cascades to chunks)
        documentRepository.delete(document);
    }
    
    @Transactional(readOnly = true)
    public InputStream downloadDocument(Long id) {
        try {
            Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found with id: " + id));
            
            return minioClient.getObject(
                GetObjectArgs.builder()
                    .bucket(bucketName)
                    .object(document.getMinioPath())
                    .build()
            );
        } catch (Exception e) {
            logger.error("Failed to download document with id: {}", id, e);
            throw new RuntimeException("Failed to download document", e);
        }
    }
    
    @Transactional(readOnly = true)
    public List<DocumentResponse> searchSimilarDocuments(String query, int maxResults) {
        try {
            logger.info("Starting similarity search for query: '{}', maxResults: {}", query, maxResults);
            
            // Build a nearText GraphQL query against Weaviate – it will embed the query internally
            NearTextArgument nearText = NearTextArgument.builder()
                    .concepts(new String[]{query})
                    .build();

            // We only need the documentId back – that is enough to fetch full metadata from Postgres later.
            io.weaviate.client.v1.graphql.query.fields.Field documentIdField =
                    io.weaviate.client.v1.graphql.query.fields.Field.builder()
                            .name("documentId")
                            .build();

            logger.info("Executing Weaviate GraphQL query for DocumentChunk class with limit: {}", maxResults);
            
            io.weaviate.client.base.Result<io.weaviate.client.v1.graphql.model.GraphQLResponse> result =
                    weaviateClient.graphQL().get()
                            .withClassName("DocumentChunk")
                            .withFields(documentIdField)
                            .withNearText(nearText)
                            .withLimit(maxResults)
                            .run();

            if (result.hasErrors()) {
                logger.error("Weaviate query returned errors: {}", result.getError());
                throw new RuntimeException("Weaviate similarity search failed: " + result.getError());
            }

            Object dataObj = result.getResult().getData();
            logger.info("Weaviate query result data: {}", dataObj);
            
            if (dataObj == null) {
                logger.warn("Weaviate query returned null data");
                return Collections.emptyList();
            }

            // The hierarchy of the GraphQL response is: { Get -> { DocumentChunk -> [ { documentId: X }, ... ] } }
            @SuppressWarnings("unchecked")
            Map<String, Object> dataMap = (Map<String, Object>) dataObj;
            logger.info("Data map keys: {}", dataMap.keySet());
            
            @SuppressWarnings("unchecked")
            Map<String, Object> getMap = (Map<String, Object>) dataMap.get("Get");
            if (getMap == null) {
                logger.warn("Get map is null in response");
                return Collections.emptyList();
            }
            logger.info("Get map keys: {}", getMap.keySet());
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> chunkList = (List<Map<String, Object>>) getMap.get("DocumentChunk");
            if (chunkList == null) {
                logger.warn("DocumentChunk list is null in Get map");
                return Collections.emptyList();
            }
            logger.info("Found {} DocumentChunk results", chunkList.size());

            Set<Long> documentIds = new LinkedHashSet<>();
            for (Map<String, Object> chunk : chunkList) {
                Object docIdObj = chunk.get("documentId");
                if (docIdObj != null) {
                    try {
                        Long docId = Math.round(Double.valueOf(docIdObj.toString()));
                        documentIds.add(docId);
                    } catch (NumberFormatException ignored) {
                        // Skip malformed id values
                    }
                }
            }

            return documentIds.stream()
                    .map(id -> {
                        try {
                            return getDocumentById(id);
                        } catch (Exception e) {
                            logger.warn("Document id {} referenced in Weaviate but not found in DB", id);
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            logger.error("Failed to perform vector similarity search for query: {}", query, e);
            throw new RuntimeException("Failed to search similar documents", e);
        }
    }
    
    // TODO: maybe refactor this later since it's duplicated code from searchSimilarDocuments
    @Transactional(readOnly = true)
    public List<DocumentChunkResponse> searchSimilarChunks(String query, int maxResults) {
        try {
            logger.info("Starting similarity search for chunks with query: '{}', maxResults: {}", query, maxResults);            
            NearTextArgument nearText = NearTextArgument.builder()
                    .concepts(new String[]{query})
                    .build();

            io.weaviate.client.v1.graphql.query.fields.Field textField =
                    io.weaviate.client.v1.graphql.query.fields.Field.builder()
                            .name("text")
                            .build();
            
            io.weaviate.client.v1.graphql.query.fields.Field documentIdField =
                    io.weaviate.client.v1.graphql.query.fields.Field.builder()
                            .name("documentId")
                            .build();
            
            io.weaviate.client.v1.graphql.query.fields.Field chunkIndexField =
                    io.weaviate.client.v1.graphql.query.fields.Field.builder()
                            .name("chunkIndex")
                            .build();

            logger.info("Executing Weaviate GraphQL query for chunks with text content");
            
            io.weaviate.client.base.Result<io.weaviate.client.v1.graphql.model.GraphQLResponse> result =
                    weaviateClient.graphQL().get()
                            .withClassName("DocumentChunk")
                            .withFields(textField, documentIdField, chunkIndexField)
                            .withNearText(nearText)
                            .withLimit(maxResults)
                            .run();

            if (result.hasErrors()) {
                logger.error("Weaviate query returned errors: {}", result.getError());
                throw new RuntimeException("Weaviate similarity search failed: " + result.getError());
            }

            Object dataObj = result.getResult().getData();
            if (dataObj == null) {
                logger.warn("Weaviate query returned null data");
                return Collections.emptyList();
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> dataMap = (Map<String, Object>) dataObj;
            
            @SuppressWarnings("unchecked")
            Map<String, Object> getMap = (Map<String, Object>) dataMap.get("Get");
            if (getMap == null) {
                logger.warn("Get map is null in response");
                return Collections.emptyList();
            }
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> chunkList = (List<Map<String, Object>>) getMap.get("DocumentChunk");
            if (chunkList == null) {
                logger.warn("DocumentChunk list is null in Get map");
                return Collections.emptyList();
            }
            logger.info("Found {} DocumentChunk results with text content", chunkList.size());

            List<DocumentChunkResponse> chunks = new ArrayList<>();
            for (Map<String, Object> chunk : chunkList) {
                try {
                    String text = (String) chunk.get("text");
                    Long documentId = Math.round(Double.valueOf(chunk.get("documentId").toString()));
                    Integer chunkIndex = (int) Math.round(Double.valueOf(chunk.get("chunkIndex").toString()));                    
                    Document document = documentRepository.findById(documentId).orElse(null);
                    if (document != null && text != null) {
                        chunks.add(new DocumentChunkResponse(
                            text,
                            document.getId(),
                            document.getName(),
                            document.getOriginalFilename(),
                            chunkIndex
                        ));
                    }
                } catch (Exception e) {
                    logger.warn("Failed to process chunk from Weaviate response", e);
                }
            }

            logger.info("Returning {} chunks for RAG processing", chunks.size());
            return chunks;

        } catch (Exception e) {
            logger.error("Failed to perform vector similarity search for chunks: {}", query, e);
            throw new RuntimeException("Failed to search similar chunks", e);
        }
    }
    
    public Map<String, Object> addMessageToConversation(Long id, String messageType, String content) {
        Document document = documentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Document not found with id: " + id));
        
        Document.ConversationMessage.MessageType type;
        try {
            type = Document.ConversationMessage.MessageType.valueOf(messageType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid message type: " + messageType);
        }
        
        document.addMessage(type, content);
        document = documentRepository.save(document);
        
        Map<String, Object> response = new HashMap<>();
        response.put("documentId", id);
        response.put("conversation", document.getConversation());
        return response;
    }
    
    public Map<String, Object> clearDocumentConversation(Long id) {
        Document document = documentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Document not found with id: " + id));
        
        document.getConversation().clear();
        document = documentRepository.save(document);
        
        Map<String, Object> response = new HashMap<>();
        response.put("documentId", id);
        response.put("conversation", document.getConversation());
        response.put("message", "Conversation cleared successfully");
        return response;
    }
    
    public static class DocumentChunkResponse {
        private String text;
        private Long documentId;
        private String documentName;
        private String originalFilename;
        private Integer chunkIndex;
        
        public DocumentChunkResponse(String text, Long documentId, String documentName, String originalFilename, Integer chunkIndex) {
            this.text = text;
            this.documentId = documentId;
            this.documentName = documentName;
            this.originalFilename = originalFilename;
            this.chunkIndex = chunkIndex;
        }
        
        public String getText() { return text; }
        public Long getDocumentId() { return documentId; }
        public String getDocumentName() { return documentName; }
        public String getOriginalFilename() { return originalFilename; }
        public Integer getChunkIndex() { return chunkIndex; }
    }
}
