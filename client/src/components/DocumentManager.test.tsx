import { describe, it, vi, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DocumentManager } from './DocumentManager';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock all custom hooks used in DocumentManager so the component can render in isolation
vi.mock('../hooks/useApi', async () => {
  const original = await vi.importActual<any>('../hooks/useApi');
  return {
    __esModule: true,
    ...original,
    useGatewayHealth: () => ({ data: { status: 'UP' } }),
    useDocuments: () => ({ data: [], isLoading: false, error: null }),
    useDocumentSearch: () => ({ data: [], isLoading: false }),
    useSimilarDocuments: () => ({ data: [], isLoading: false }),
    useUploadDocument: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useDeleteDocument: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useDocumentDownload: () => ({ downloadDocument: vi.fn(), isDownloading: false }),
    useUpdateDocument: () => ({ mutateAsync: vi.fn(), isPending: false }),
  };
});

describe('DocumentManager', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  it('renders main header and system status', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <DocumentManager />
      </QueryClientProvider>
    );

    // Main heading
    expect(screen.getByText('📄 Document Management System')).toBeInTheDocument();

    // Gateway status should show Connected (mock value)
    expect(screen.getByText(/Gateway:/)).toHaveTextContent('Gateway: UP');
  });
}); 