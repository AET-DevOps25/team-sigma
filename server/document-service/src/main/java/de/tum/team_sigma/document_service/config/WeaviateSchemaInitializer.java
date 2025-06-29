package de.tum.team_sigma.document_service.config;

import io.weaviate.client.WeaviateClient;
import io.weaviate.client.base.Result;
import io.weaviate.client.v1.schema.model.Property;
import io.weaviate.client.v1.schema.model.WeaviateClass;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Ensures that the "DocumentChunk" class (vector index + properties) exists in Weaviate.
 * If the class is missing, it will be created automatically during application startup.
 */
@Component
public class WeaviateSchemaInitializer implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(WeaviateSchemaInitializer.class);

    private final WeaviateClient weaviateClient;

    @Autowired
    public WeaviateSchemaInitializer(WeaviateClient weaviateClient) {
        this.weaviateClient = weaviateClient;
    }

    @Override
    public void run(ApplicationArguments args) {
        final String className = "DocumentChunk";
        try {
            // Check if the class already exists
            Result<WeaviateClass> existing = weaviateClient.schema()
                    .classGetter()
                    .withClassName(className)
                    .run();

            if (!existing.hasErrors() && existing.getResult() != null) {
                logger.info("Weaviate class '{}' already exists. Skipping creation.", className);
                return;
            }
        } catch (Exception e) {
            // An exception likely means the class does not exist; we'll attempt creation
            logger.info("Weaviate class '{}' not found – will attempt to create it.", className);
        }

        try {
            WeaviateClass clazz = WeaviateClass.builder()
                    .className(className)
                    .vectorizer("none")
                    .properties(List.of(
                            Property.builder().name("text").dataType(List.of("text")).build(),
                            Property.builder().name("documentId").dataType(List.of("int")).build(),
                            Property.builder().name("chunkIndex").dataType(List.of("int")).build()
                    ))
                    .build();

            weaviateClient.schema().classCreator().withClass(clazz).run();
            logger.info("Weaviate class '{}' created successfully.", className);
        } catch (Exception e) {
            logger.error("Failed to create Weaviate class '{}': {}", className, e.getMessage(), e);
        }
    }
} 