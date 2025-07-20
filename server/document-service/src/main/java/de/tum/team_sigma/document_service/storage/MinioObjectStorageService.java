package de.tum.team_sigma.document_service.storage;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.GetObjectArgs;
import io.minio.RemoveObjectArgs;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.InputStream;

@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "minio", matchIfMissing = true)
public class MinioObjectStorageService implements ObjectStorageService {

    private static final Logger logger = LoggerFactory.getLogger(MinioObjectStorageService.class);

    private final MinioClient minioClient;
    private final String bucketName;

    public MinioObjectStorageService(MinioClient minioClient,
                                     @Value("${minio.bucket-name}") String bucketName) {
        this.minioClient = minioClient;
        this.bucketName = bucketName;
    }

    @Override
    public void putObject(String key, InputStream inputStream, long size, String contentType) throws Exception {
        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(key)
                        .stream(inputStream, size, -1)
                        .contentType(contentType)
                        .build());
        logger.info("Stored object in MinIO: {}", key);
    }

    @Override
    public InputStream getObject(String key) throws Exception {
        return minioClient.getObject(
                GetObjectArgs.builder()
                        .bucket(bucketName)
                        .object(key)
                        .build());
    }

    @Override
    public void deleteObject(String key) throws Exception {
        minioClient.removeObject(RemoveObjectArgs.builder()
                .bucket(bucketName)
                .object(key)
                .build());
        logger.info("Deleted object from MinIO: {}", key);
    }
} 