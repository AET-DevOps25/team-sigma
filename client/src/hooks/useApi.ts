import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  lectureId?: string;
  createdAt: string;
  updatedAt?: string;
  chunkCount: number;
  conversation?: ConversationMessage[];
}

export interface DocumentUploadRequest {
  name: string;
  description?: string;
  lectureId: string;
}

export interface ChatRequest {
  message: string;
  document_id: string;
}

export interface ChatResponse {
  response: string;
  document?: Document;
}

export interface ConversationMessage {
  messageIndex: number;
  messageType: "AI" | "HUMAN";
  content: string;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface SummaryRequest {
  document_id: string;
}

export interface SummaryResponse {
  document_id: string;
  summary: string;
}

export interface Lecture {
  id: number;
  name: string;
  createdBy: string;
  createdAt: string;
}

export interface LectureRequest {
  name: string;
  userId: string;
}

// API functions
const api = {
  // Gateway endpoints
  getGatewayHealth: async (): Promise<GatewayHealth> => {
    const response = await fetch(`/api/gateway/health`);
    if (!response.ok) throw new Error("Failed to fetch gateway health");
    return response.json();
  },

  getServices: async (): Promise<ServicesResponse> => {
    const response = await fetch(`/api/gateway/services`);
    if (!response.ok) throw new Error("Failed to fetch services");
    return response.json();
  },

  getServiceApiDocs: async (serviceName: string): Promise<string> => {
    const response = await fetch(`/api/${serviceName}/v3/api-docs`);
    if (!response.ok) throw new Error("Failed to fetch service API docs");
    return response.text();
  },

  // Document service endpoints
  getDocuments: async (lectureId?: string): Promise<Document[]> => {
    const url = lectureId
      ? `/api/documents?lectureId=${encodeURIComponent(lectureId)}`
      : `/api/documents`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch documents");
    return response.json();
  },

  getDocument: async (id: number): Promise<Document> => {
    const response = await fetch(`/api/documents/${id}`);
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
    formData.append("lectureId", metadata.lectureId);

    if (metadata.description) {
      formData.append("description", metadata.description);
    }

    const response = await fetch(`/api/documents/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to upload document");
    return response.json();
  },

  searchDocuments: async (query: string): Promise<Document[]> => {
    const response = await fetch(
      `/api/documents/search?q=${encodeURIComponent(query)}`
    );
    if (!response.ok) throw new Error("Failed to search documents");
    return response.json();
  },

  searchSimilarDocuments: async (
    query: string,
    limit = 10
  ): Promise<Document[]> => {
    const response = await fetch(
      `/api/documents/search/similar?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    if (!response.ok) throw new Error("Failed to search similar documents");
    return response.json();
  },

  updateDocument: async (
    id: number,
    metadata: DocumentUploadRequest
  ): Promise<Document> => {
    const response = await fetch(`/api/documents/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) throw new Error("Failed to update document");
    return response.json();
  },

  deleteDocument: async (id: number): Promise<void> => {
    const response = await fetch(`/api/documents/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete document");
  },

  downloadDocument: async (id: number): Promise<Blob> => {
    const response = await fetch(`/api/documents/${id}/download`);
    if (!response.ok) throw new Error("Failed to download document");
    return response.blob();
  },

  getDocumentPdfUrl: (id: number): string => {
    return `/api/documents/${id}/download`;
  },

  clearDocumentConversation: async (id: number): Promise<void> => {
    const response = await fetch(`/api/documents/${id}/conversation`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to clear conversation");
  },

  // Chat service endpoints
  sendChatMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await fetch(`/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error("Failed to send chat message");
    return response.json();
  },

  getChatHealth: async (): Promise<{ status: string; service: string }> => {
    const response = await fetch(`/api/chat/health`);
    if (!response.ok) throw new Error("Failed to fetch chat service health");
    return response.json();
  },

  // Quiz service endpoints
  getQuizQuestions: async (documentId: string): Promise<QuizQuestion[]> => {
    const response = await fetch(`/api/quiz/${documentId}`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to fetch quiz questions");
    return response.json();
  },

  // Summary service endpoints
  generateSummary: async (
    request: SummaryRequest
  ): Promise<SummaryResponse> => {
    const response = await fetch(`/api/summary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error("Failed to generate summary");
    return response.json();
  },

  getSummaryHealth: async (): Promise<{ status: string; service: string }> => {
    const response = await fetch(`/api/summary/health`);
    if (!response.ok) throw new Error("Failed to fetch summary service health");
    return response.json();
  },

  // Lecture service endpoints
  getLectures: async (): Promise<Lecture[]> => {
    const response = await fetch(`/api/lectures`);
    if (!response.ok) throw new Error("Failed to fetch lectures");
    return response.json();
  },

  getLecturesByUser: async (userId: string): Promise<Lecture[]> => {
    const response = await fetch(
      `/api/lectures/user/${encodeURIComponent(userId)}`
    );
    if (!response.ok) throw new Error("Failed to fetch user lectures");
    return response.json();
  },

  getLecture: async (id: number): Promise<Lecture> => {
    const response = await fetch(`/api/lectures/${id}`);
    if (!response.ok) throw new Error("Failed to fetch lecture");
    return response.json();
  },

  createLecture: async (request: LectureRequest): Promise<Lecture> => {
    const response = await fetch(`/api/lectures`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error("Failed to create lecture");
    return response.json();
  },

  updateLecture: async (
    id: number,
    request: LectureRequest
  ): Promise<Lecture> => {
    const response = await fetch(`/api/lectures/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error("Failed to update lecture");
    return response.json();
  },

  deleteLecture: async (id: number): Promise<void> => {
    const response = await fetch(`/api/lectures/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete lecture");
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
export function useDocuments(lectureId?: string) {
  return useQuery({
    queryKey: ["documents", lectureId],
    queryFn: () => api.getDocuments(lectureId),
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

export function useClearDocumentConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.clearDocumentConversation(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        ["documents", id],
        (oldData: Document | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            conversation: [],
          };
        }
      );
    },
  });
}

// Chat service hooks
export function useChatMessage() {
  return useMutation({
    mutationFn: (request: ChatRequest) => api.sendChatMessage(request),
  });
}

export function useChatHealth() {
  return useQuery({
    queryKey: ["chat", "health"],
    queryFn: api.getChatHealth,
    refetchInterval: 3000, // Check every 3 seconds
    retry: 3,
    staleTime: 0, // Always consider stale so it refetches
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
export function useQuizQuestions(documentId: string | undefined) {
  return useQuery({
    queryKey: ["quiz", documentId],
    queryFn: () => api.getQuizQuestions(documentId!),
    enabled: !!documentId,
    staleTime: 300000, // 5 minutes
  });
}

// Summary hooks
export function useGenerateSummary() {
  return useMutation({
    mutationFn: (request: SummaryRequest) => api.generateSummary(request),
  });
}

export function useSummaryHealth() {
  return useQuery({
    queryKey: ["summary", "health"],
    queryFn: api.getSummaryHealth,
    refetchInterval: 3000, // Check every 3 seconds
    retry: 3,
    staleTime: 0, // Always consider stale so it refetches
  });
}

// Lecture hooks
export function useLectures() {
  return useQuery({
    queryKey: ["lectures"],
    queryFn: api.getLectures,
    staleTime: 30000, // 30 seconds
  });
}

export function useLecturesByUser(userId: string | undefined) {
  return useQuery({
    queryKey: ["lectures", "user", userId],
    queryFn: () => api.getLecturesByUser(userId!),
    enabled: !!userId,
    staleTime: 30000, // 30 seconds
  });
}

export function useLecture(id: number | undefined) {
  return useQuery({
    queryKey: ["lectures", id],
    queryFn: () => api.getLecture(id!),
    enabled: !!id,
    staleTime: 300000, // 5 minutes
  });
}

// Lecture mutations
export function useCreateLecture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: LectureRequest) => api.createLecture(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
      queryClient.invalidateQueries({
        queryKey: ["lectures", "user", variables.userId],
      });
    },
  });
}

export function useUpdateLecture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: LectureRequest }) =>
      api.updateLecture(id, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lectures", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
      queryClient.invalidateQueries({
        queryKey: ["lectures", "user", variables.request.userId],
      });
    },
  });
}

export function useDeleteLecture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deleteLecture(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
      queryClient.invalidateQueries({ queryKey: ["lectures", "user"] });
    },
  });
}

// Export helper function for getting PDF URLs
export const getDocumentPdfUrl = api.getDocumentPdfUrl;
