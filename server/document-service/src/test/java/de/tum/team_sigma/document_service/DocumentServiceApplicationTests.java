package de.tum.team_sigma.document_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import de.tum.team_sigma.document_service.storage.ObjectStorageService;
import io.weaviate.client.WeaviateClient;
import dev.langchain4j.model.embedding.EmbeddingModel;

@SpringBootTest
class DocumentServiceApplicationTests {

	// Stub external service clients to avoid network calls during context load
	@MockBean
	private ObjectStorageService storageService;

	@MockBean
	private WeaviateClient weaviateClient;

	@MockBean
	private EmbeddingModel embeddingModel;

	@Test
	void contextLoads() {
	}

}
