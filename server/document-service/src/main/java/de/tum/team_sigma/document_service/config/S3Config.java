package de.tum.team_sigma.document_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "storage.type", havingValue = "s3")
public class S3Config {

    @Value("${aws.region:${AWS_REGION:us-east-1}}")
    private String awsRegion;

    @Value("${s3.bucket-name:${S3_BUCKET_NAME:documents}}")
    private String bucketName;

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(Region.of(awsRegion))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    @Bean
    public String s3BucketName() {
        return bucketName;
    }
} 