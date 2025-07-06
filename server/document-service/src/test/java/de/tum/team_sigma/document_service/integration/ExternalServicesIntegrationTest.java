package de.tum.team_sigma.document_service.integration;

import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.model.embedding.EmbeddingModel;
import io.minio.*;
import io.minio.errors.ErrorResponseException;
import io.weaviate.client.WeaviateClient;
import io.weaviate.client.base.Result;
import io.weaviate.client.v1.data.model.WeaviateObject;
import io.weaviate.client.v1.schema.model.Property;
import io.weaviate.client.v1.schema.model.WeaviateClass;
import io.swagger.v3.oas.models.OpenAPI;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.BeforeAll;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.containers.MinIOContainer;
import org.testcontainers.weaviate.WeaviateContainer;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@Disabled("External services (MinIO, Weaviate, OpenAI) are not available during regular CI builds.")
@ActiveProfiles("test")
class ExternalServicesIntegrationTest {

    @Autowired
    private EmbeddingModel embeddingModel;

    @Autowired
    private OpenAPI openAPI;

    /* ----------------- Embedding ----------------- */
    @Test
    void embeddingModelShouldReturnVector() {
        Embedding embedding = embeddingModel.embed("Hello vector world").content();
        assertNotNull(embedding, "Embedding should not be null");
        assertTrue(embedding.vector().length > 0, "Vector should contain values");
        
        // Test that different texts produce different vectors
        Embedding embedding2 = embeddingModel.embed("Different text").content();
        assertNotEquals(embedding.vector()[0], embedding2.vector()[0], "Different texts should produce different vectors");
    }

    /* ----------------- OpenAPI ----------------- */
    @Test
    void openApiBeanShouldBeConfigured() {
        assertNotNull(openAPI, "OpenAPI bean should be present");
        assertEquals("Document Service API", openAPI.getInfo().getTitle());
        assertNotNull(openAPI.getInfo().getVersion(), "Version should be set");
        assertNotNull(openAPI.getInfo().getDescription(), "Description should be set");
    }

    /* ----------------- Configuration Tests ----------------- */
    @Test
    void embeddingModelShouldProduceConsistentVectorSizes() {
        // Test that all embeddings have the same vector size
        Embedding embedding1 = embeddingModel.embed("First test text").content();
        Embedding embedding2 = embeddingModel.embed("Second test text").content();
        Embedding embedding3 = embeddingModel.embed("Third test text").content();
        
        assertEquals(embedding1.vector().length, embedding2.vector().length, 
                    "All embeddings should have the same vector size");
        assertEquals(embedding2.vector().length, embedding3.vector().length, 
                    "All embeddings should have the same vector size");
        
        // Verify vector size is reasonable (typical embedding models produce 384 or 768 dimensions)
        assertTrue(embedding1.vector().length >= 100, "Vector should have reasonable size");
    }
} 