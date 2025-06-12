package de.tum.team_sigma.document_service.config;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinioConfig {
    
    private static final Logger logger = LoggerFactory.getLogger(MinioConfig.class);
    
    @Value("${minio.url}")
    private String minioUrl;
    
    @Value("${minio.access-key}")
    private String accessKey;
    
    @Value("${minio.secret-key}")
    private String secretKey;
    
    @Value("${minio.bucket-name}")
    private String bucketName;
    
    @Bean
    public MinioClient minioClient() {
        try {
            MinioClient client = MinioClient.builder()
                    .endpoint(minioUrl)
                    .credentials(accessKey, secretKey)
                    .build();
            
            // Create bucket if it doesn't exist
            createBucketIfNotExists(client);
            
            return client;
        } catch (Exception e) {
            logger.error("Failed to create MinIO client", e);
            throw new RuntimeException("Failed to create MinIO client", e);
        }
    }
    
    private void createBucketIfNotExists(MinioClient client) {
        try {
            boolean exists = client.bucketExists(BucketExistsArgs.builder()
                    .bucket(bucketName)
                    .build());
                    
            if (!exists) {
                client.makeBucket(MakeBucketArgs.builder()
                        .bucket(bucketName)
                        .build());
                logger.info("Created MinIO bucket: {}", bucketName);
            } else {
                logger.info("MinIO bucket already exists: {}", bucketName);
            }
        } catch (Exception e) {
            logger.error("Failed to create/check MinIO bucket", e);
            throw new RuntimeException("Failed to create/check MinIO bucket", e);
        }
    }
    
    @Bean
    public String minioBucketName() {
        return bucketName;
    }
} 