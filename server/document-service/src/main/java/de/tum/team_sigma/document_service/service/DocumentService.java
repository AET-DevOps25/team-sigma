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
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.data.embedding.Embedding;
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
    private EmbeddingModel embeddingModel;
    
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
            
            // Create document entity
            Document document = new Document(
                request.getName(),
                file.getOriginalFilename(),
                file.getContentType(),
                file.getSize(),
                minioPath
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
                    // 1. Create embedding vector using LangChain4j
                    Embedding embedding = embeddingModel.embed(chunkText).content();
                    // Weaviate client expects Float[] (boxed) rather than primitive float[].
                    float[] primitiveVector = embedding.vector();
                    Float[] vector = new Float[primitiveVector.length];
                    for (int j = 0; j < primitiveVector.length; j++) {
                        vector[j] = primitiveVector[j];
                    }

                    // 2. Store vector + metadata in Weaviate and retrieve object ID
                    String uuid = UUID.randomUUID().toString();
                    weaviateClient.data().creator()
                        .withClassName("DocumentChunk")
                        .withID(uuid)
                        .withProperties(Map.of(
                            "text", chunkText,
                            "documentId", document.getId(),
                            "chunkIndex", i
                        ))
                        .withVector(vector)
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
            logger.info("Document deleted successfully: {}", document.getName());
            
        } catch (Exception e) {
            logger.error("Failed to delete document: {}", document.getName(), e);
            throw new RuntimeException("Failed to delete document", e);
        }
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
            // 1) Embed the search query to obtain its vector representation
            Embedding embedding = embeddingModel.embed(query).content();
            float[] primitiveVector = embedding.vector();
            Float[] vector = new Float[primitiveVector.length];
            for (int i = 0; i < primitiveVector.length; i++) {
                vector[i] = primitiveVector[i];
            }

            // 2) Build a nearVector GraphQL query against Weaviate for the DocumentChunk class
            io.weaviate.client.v1.graphql.query.argument.NearVectorArgument nearVector =
                    io.weaviate.client.v1.graphql.query.argument.NearVectorArgument.builder()
                            .vector(vector)
                            .build();

            // We only need the documentId back – that is enough to fetch full metadata from Postgres later.
            io.weaviate.client.v1.graphql.query.fields.Field documentIdField =
                    io.weaviate.client.v1.graphql.query.fields.Field.builder()
                            .name("documentId")
                            .build();

            io.weaviate.client.base.Result<io.weaviate.client.v1.graphql.model.GraphQLResponse> result =
                    weaviateClient.graphQL().get()
                            .withClassName("DocumentChunk")
                            .withFields(documentIdField)
                            .withNearVector(nearVector)
                            .withLimit(maxResults)
                            .run();

            if (result.hasErrors()) {
                throw new RuntimeException("Weaviate similarity search failed: " + result.getError());
            }

            Object dataObj = result.getResult().getData();
            if (dataObj == null) {
                return Collections.emptyList();
            }

            // The hierarchy of the GraphQL response is: { Get -> { DocumentChunk -> [ { documentId: X }, ... ] } }
            @SuppressWarnings("unchecked")
            Map<String, Object> dataMap = (Map<String, Object>) dataObj;
            @SuppressWarnings("unchecked")
            Map<String, Object> getMap = (Map<String, Object>) dataMap.get("Get");
            if (getMap == null) {
                return Collections.emptyList();
            }
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> chunkList = (List<Map<String, Object>>) getMap.get("DocumentChunk");
            if (chunkList == null) {
                return Collections.emptyList();
            }

            Set<Long> documentIds = new LinkedHashSet<>();
            for (Map<String, Object> chunk : chunkList) {
                Object docIdObj = chunk.get("documentId");
                if (docIdObj != null) {
                    try {
                        Long docId = Long.valueOf(docIdObj.toString());
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
}
