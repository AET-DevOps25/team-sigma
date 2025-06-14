package de.tum.team_sigma.document_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import io.weaviate.client.Config;
import io.weaviate.client.WeaviateClient;

@Configuration
public class WeaviateConfig {

    @Value("${weaviate.url}")
    private String weaviateUrl;

    @Bean
    public WeaviateClient weaviateClient() {
        Config config = new Config(weaviateUrl);
        return new WeaviateClient(config);
    }
} 