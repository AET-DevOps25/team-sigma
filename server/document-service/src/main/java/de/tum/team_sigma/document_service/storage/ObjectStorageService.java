package de.tum.team_sigma.document_service.storage;

import java.io.InputStream;

public interface ObjectStorageService {
    void putObject(String key, InputStream inputStream, long size, String contentType) throws Exception;

    InputStream getObject(String key) throws Exception;

    void deleteObject(String key) throws Exception;
} 