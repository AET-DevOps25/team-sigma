package de.tum.team_sigma.document_service.integration;

import io.minio.*;
import io.minio.errors.ErrorResponseException;
import io.weaviate.client.WeaviateClient;
import io.weaviate.client.base.Result;
import io.weaviate.client.v1.data.model.WeaviateObject;
import io.weaviate.client.v1.schema.model.Property;
import io.weaviate.client.v1.schema.model.WeaviateClass;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Disabled;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MinIOContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.weaviate.WeaviateContainer;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests that require real MinIO and Weaviate containers.
 * These tests are disabled by default due to longer startup times.
 * Enable with @EnabledIf or remove @Disabled to run.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
@Disabled("Enable manually when testing with real containers")
class ContainerIntegrationTest {

    private static final String TEST_BUCKET = "testbucket";

    @Container
    static final MinIOContainer MINIO = new MinIOContainer("minio/minio:RELEASE.2023-09-04T19-57-37Z");

    @Container
    static final WeaviateContainer WEAVIATE = new WeaviateContainer("cr.weaviate.io/semitechnologies/weaviate:1.25.5");

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("minio.url", MINIO::getS3URL);
        registry.add("minio.access-key", MINIO::getUserName);
        registry.add("minio.secret-key", MINIO::getPassword);
        registry.add("minio.bucket-name", () -> TEST_BUCKET);
        registry.add("weaviate.url", () -> WEAVIATE.getHost() + ":" + WEAVIATE.getMappedPort(8080));
    }

    @Autowired
    private MinioClient minioClient;

    @Autowired
    private WeaviateClient weaviateClient;

    @BeforeAll
    void setUp() throws Exception {
        // Create test bucket in MinIO
        boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(TEST_BUCKET).build());
        if (!found) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(TEST_BUCKET).build());
        }
    }

    /* ----------------- MinIO Integration Tests ----------------- */
    @Test
    void minioShouldPutAndRemoveObject() throws Exception {
        String objectKey = "integration/hello.txt";
        byte[] data = "Hello, MinIO!".getBytes(StandardCharsets.UTF_8);

        // Upload object
        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(TEST_BUCKET)
                        .object(objectKey)
                        .stream(new ByteArrayInputStream(data), data.length, -1)
                        .contentType("text/plain")
                        .build()
        );

        // Verify exists
        StatObjectResponse stat = minioClient.statObject(
                StatObjectArgs.builder().bucket(TEST_BUCKET).object(objectKey).build()
        );
        assertNotNull(stat);
        assertEquals(data.length, stat.size());

        // Download and verify content
        try (var inputStream = minioClient.getObject(
                GetObjectArgs.builder().bucket(TEST_BUCKET).object(objectKey).build())) {
            String content = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
            assertEquals("Hello, MinIO!", content);
        }

        // Delete object
        minioClient.removeObject(
                RemoveObjectArgs.builder().bucket(TEST_BUCKET).object(objectKey).build()
        );

        // Expect deletion
        assertThrows(ErrorResponseException.class, () ->
                minioClient.statObject(
                        StatObjectArgs.builder().bucket(TEST_BUCKET).object(objectKey).build()
                ));
    }

    /* ----------------- Weaviate Integration Tests ----------------- */
    @Test
    void weaviateShouldInsertAndDeleteObject() {
        String className = "TestEntity";
        String id = UUID.randomUUID().toString();

        // Ensure class exists (idempotent)
        try {
            WeaviateClass clazz = WeaviateClass.builder()
                    .className(className)
                    .vectorizer("none")
                    .properties(java.util.List.of(
                            Property.builder()
                                    .name("text")
                                    .dataType(java.util.List.of("text"))
                                    .build()
                    ))
                    .build();
            weaviateClient.schema().classCreator().withClass(clazz).run();
        } catch (Exception ignored) {
            // class may already exist; ignore
        }

        Float[] vector = new Float[]{0.1f, 0.2f, 0.3f, 0.4f, 0.5f};

        // Insert object
        Result<WeaviateObject> createResult = weaviateClient.data().creator()
                .withClassName(className)
                .withID(id)
                .withVector(vector)
                .withProperties(Map.of("text", "hello world"))
                .run();
        assertFalse(createResult.hasErrors(), "Object creation should succeed: " + createResult.getError());

        // Retrieve object
        Result<java.util.List<WeaviateObject>> getResult = weaviateClient.data().objectsGetter()
                .withID(id)
                .run();
        assertFalse(getResult.hasErrors(), "Object retrieval should succeed: " + getResult.getError());
        assertEquals(1, getResult.getResult().size(), "Should retrieve exactly one object");

        // Verify the retrieved object
        WeaviateObject retrievedObject = getResult.getResult().get(0);
        assertEquals(id, retrievedObject.getId());
        assertEquals("hello world", retrievedObject.getProperties().get("text"));

        // Delete object
        Result<Boolean> deleteResult = weaviateClient.data().deleter()
                .withID(id)
                .withClassName(className)
                .run();
        assertFalse(deleteResult.hasErrors(), "Deletion should succeed: " + deleteResult.getError());
        assertTrue(deleteResult.getResult(), "Deletion result should be true");

        // Confirm deletion (should return empty list)
        Result<java.util.List<WeaviateObject>> afterDelete = weaviateClient.data().objectsGetter()
                .withID(id)
                .run();
        assertTrue(afterDelete.getResult() == null || afterDelete.getResult().isEmpty(), 
                  "Object should no longer exist");
    }
} 