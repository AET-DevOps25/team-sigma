import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = "http://localhost:5173";

// Types
export interface GatewayHealth {
  service: string;
  status: string;
}

export interface ServiceInstance {
  scheme: string;
  host: string;
  port: number;
  instanceId: string;
  uri: string;
  serviceId: string;
  metadata: Record<string, string>;
  secure: boolean;
}

export interface ServicesResponse {
  services: string[];
  instances: Record<string, ServiceInstance[]>;
}

export interface Document {
  id: number;
  name: string;
  description?: string;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  organizationId?: string;
  createdAt: string;
  updatedAt?: string;
  chunkCount: number;
}

export interface DocumentUploadRequest {
  name: string;
  description?: string;
  organizationId?: string;
}

export interface ChatRequest {
  message: string;
  document_id: string;
}

export interface ChatResponse {
  response: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// API functions
const api = {
  // Gateway endpoints
  getGatewayHealth: async (): Promise<GatewayHealth> => {
    const response = await fetch(`${API_BASE}/api/gateway/health`);
    if (!response.ok) throw new Error("Failed to fetch gateway health");
    return response.json();
  },

  getServices: async (): Promise<ServicesResponse> => {
    const response = await fetch(`${API_BASE}/api/gateway/services`);
    if (!response.ok) throw new Error("Failed to fetch services");
    return response.json();
  },

  getServiceApiDocs: async (serviceName: string): Promise<string> => {
    const response = await fetch(`${API_BASE}/api/${serviceName}/v3/api-docs`);
    if (!response.ok) throw new Error("Failed to fetch service API docs");
    return response.text();
  },

  // Document service endpoints
  getDocuments: async (organizationId?: string): Promise<Document[]> => {
    const url = organizationId
      ? `${API_BASE}/api/documents?organizationId=${encodeURIComponent(organizationId)}`
      : `${API_BASE}/api/documents`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch documents");
    return response.json();
  },

  getDocument: async (id: number): Promise<Document> => {
    const response = await fetch(`${API_BASE}/api/documents/${id}`);
    if (!response.ok) throw new Error("Failed to fetch document");
    return response.json();
  },

  uploadDocument: async (
    file: File,
    metadata: DocumentUploadRequest
  ): Promise<Document> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", metadata.name);
    if (metadata.description) {
      formData.append("description", metadata.description);
    }
    if (metadata.organizationId) {
      formData.append("organizationId", metadata.organizationId);
    }

    const response = await fetch(`${API_BASE}/api/documents/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to upload document");
    return response.json();
  },

  searchDocuments: async (query: string): Promise<Document[]> => {
    const response = await fetch(
      `${API_BASE}/api/documents/search?q=${encodeURIComponent(query)}`
    );
    if (!response.ok) throw new Error("Failed to search documents");
    return response.json();
  },

  searchSimilarDocuments: async (
    query: string,
    limit = 10
  ): Promise<Document[]> => {
    const response = await fetch(
      `${API_BASE}/api/documents/search/similar?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    if (!response.ok) throw new Error("Failed to search similar documents");
    return response.json();
  },

  updateDocument: async (
    id: number,
    metadata: DocumentUploadRequest
  ): Promise<Document> => {
    const response = await fetch(`${API_BASE}/api/documents/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) throw new Error("Failed to update document");
    return response.json();
  },

  deleteDocument: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/api/documents/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete document");
  },

  downloadDocument: async (id: number): Promise<Blob> => {
    const response = await fetch(`${API_BASE}/api/documents/${id}/download`);
    if (!response.ok) throw new Error("Failed to download document");
    return response.blob();
  },

  getDocumentPdfUrl: (id: number): string => {
    return `${API_BASE}/api/documents/${id}/download`;
  },

  // Chat service endpoints
  sendChatMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to send chat message');
    return response.json();
  },

  // Hello service endpoints
  getHello: async (name?: string): Promise<string> => {
    const url = name
      ? `${API_BASE}/api/hello/${name}`
      : `${API_BASE}/api/hello/`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch hello");
    return response.text();
  },

  // Quiz service endpoints
  getQuizQuestions: async (slideId: string): Promise<QuizQuestion[]> => {
    const response = await fetch(`${API_BASE}/api/quiz/${slideId}`);
    if (!response.ok) throw new Error("Failed to fetch quiz questions");
    return response.json();
  },
};

// Gateway hooks
export function useGatewayHealth() {
  return useQuery({
    queryKey: ["gateway", "health"],
    queryFn: api.getGatewayHealth,
    staleTime: 30000, // 30 seconds
  });
}

export function useServices() {
  return useQuery({
    queryKey: ["gateway", "services"],
    queryFn: api.getServices,
    staleTime: 60000, // 1 minute
  });
}

export function useServiceApiDocs(serviceName: string) {
  return useQuery({
    queryKey: ["gateway", "api-docs", serviceName],
    queryFn: () => api.getServiceApiDocs(serviceName),
    enabled: !!serviceName,
    staleTime: 300000, // 5 minutes
  });
}

// Document hooks
export function useDocuments(organizationId?: string) {
  return useQuery({
    queryKey: ["documents", organizationId],
    queryFn: () => api.getDocuments(organizationId),
    staleTime: 30000, // 30 seconds
  });
}

export function useDocument(id: number | undefined) {
  return useQuery({
    queryKey: ["documents", id],
    queryFn: () => api.getDocument(id!),
    enabled: !!id,
    staleTime: 300000, // 5 minutes
  });
}

export function useDocumentSearch(query: string) {
  return useQuery({
    queryKey: ["documents", "search", query],
    queryFn: () => api.searchDocuments(query),
    enabled: !!query.trim(),
    staleTime: 30000, // 30 seconds
  });
}

export function useSimilarDocuments(query: string, limit = 10) {
  return useQuery({
    queryKey: ["documents", "similar", query, limit],
    queryFn: () => api.searchSimilarDocuments(query, limit),
    enabled: !!query.trim(),
    staleTime: 30000, // 30 seconds
  });
}

// Document mutations
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      metadata,
    }: {
      file: File;
      metadata: DocumentUploadRequest;
    }) => api.uploadDocument(file, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      metadata,
    }: {
      id: number;
      metadata: DocumentUploadRequest;
    }) => api.updateDocument(id, metadata),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

// Chat service hooks
export function useChatMessage() {
  return useMutation({
    mutationFn: (request: ChatRequest) => api.sendChatMessage(request),
  });
}

// Hello service hooks
export function useHello(name?: string) {
  return useQuery({
    queryKey: ["hello", name],
    queryFn: () => api.getHello(name),
    staleTime: 60000, // 1 minute
  });
}

// Custom hook for file download
export function useDocumentDownload() {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadDocument = useCallback(async (id: number, filename: string) => {
    setIsDownloading(true);
    try {
      const blob = await api.downloadDocument(id);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      throw error;
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return { downloadDocument, isDownloading };
}

// Quiz hooks
export function useQuizQuestions(slideId: string | undefined) {
  return useQuery({
    queryKey: ["quiz", slideId],
    queryFn: () => api.getQuizQuestions(slideId!),
    enabled: !!slideId,
    staleTime: 300000, // 5 minutes
  });
}

// Export helper function for getting PDF URLs
export const getDocumentPdfUrl = api.getDocumentPdfUrl;
