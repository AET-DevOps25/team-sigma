import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = 'http://localhost:8080';

// Types for document service (since not in OpenAPI schema)
export interface Document {
  id: number;
  name: string;
  description?: string;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  uploadDate: string;
  minioObjectName: string;
  weaviateId?: string;
}

export interface DocumentUploadRequest {
  name: string;
  description?: string;
}

// Document service API functions
const documentApi = {
  // Get all documents
  getAll: async (): Promise<Document[]> => {
    const response = await fetch(`${API_BASE}/api/documents`);
    if (!response.ok) throw new Error('Failed to fetch documents');
    return response.json();
  },

  // Get document by ID
  getById: async (id: number): Promise<Document> => {
    const response = await fetch(`${API_BASE}/api/documents/${id}`);
    if (!response.ok) throw new Error('Failed to fetch document');
    return response.json();
  },

  // Upload document
  upload: async (file: File, metadata: DocumentUploadRequest): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', metadata.name);
    if (metadata.description) {
      formData.append('description', metadata.description);
    }

    const response = await fetch(`${API_BASE}/api/documents/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Failed to upload document');
    return response.json();
  },

  // Search documents
  search: async (query: string): Promise<Document[]> => {
    const response = await fetch(`${API_BASE}/api/documents/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search documents');
    return response.json();
  },

  // Search similar documents
  searchSimilar: async (query: string, limit = 10): Promise<Document[]> => {
    const response = await fetch(
      `${API_BASE}/api/documents/search/similar?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    if (!response.ok) throw new Error('Failed to search similar documents');
    return response.json();
  },

  // Update document
  update: async (id: number, metadata: DocumentUploadRequest): Promise<Document> => {
    const response = await fetch(`${API_BASE}/api/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) throw new Error('Failed to update document');
    return response.json();
  },

  // Delete document
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/api/documents/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete document');
  },

  // Download document
  download: async (id: number): Promise<Blob> => {
    const response = await fetch(`${API_BASE}/api/documents/${id}/download`);
    if (!response.ok) throw new Error('Failed to download document');
    return response.blob();
  },
};

// React Query hooks
export function useDocuments() {
  return useQuery({
    queryKey: ['documents'],
    queryFn: documentApi.getAll,
    staleTime: 30000, // 30 seconds
  });
}

export function useDocument(id: number | undefined) {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: () => documentApi.getById(id!),
    enabled: !!id,
    staleTime: 300000, // 5 minutes
  });
}

export function useDocumentSearch(query: string) {
  return useQuery({
    queryKey: ['documents', 'search', query],
    queryFn: () => documentApi.search(query),
    enabled: !!query.trim(),
    staleTime: 30000, // 30 seconds
  });
}

export function useSimilarDocuments(query: string, limit = 10) {
  return useQuery({
    queryKey: ['documents', 'similar', query, limit],
    queryFn: () => documentApi.searchSimilar(query, limit),
    enabled: !!query.trim(),
    staleTime: 30000, // 30 seconds
  });
}

// Mutation hooks
export function useUploadDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, metadata }: { file: File; metadata: DocumentUploadRequest }) =>
      documentApi.upload(file, metadata),
    onSuccess: () => {
      // Invalidate and refetch documents
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, metadata }: { id: number; metadata: DocumentUploadRequest }) =>
      documentApi.update(id, metadata),
    onSuccess: (_, variables) => {
      // Invalidate specific document and all documents
      queryClient.invalidateQueries({ queryKey: ['documents', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => documentApi.delete(id),
    onSuccess: () => {
      // Invalidate and refetch documents
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

// Custom hook for file download
export function useDocumentDownload() {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadDocument = useCallback(async (id: number, filename: string) => {
    setIsDownloading(true);
    try {
      const blob = await documentApi.download(id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return { downloadDocument, isDownloading };
} 