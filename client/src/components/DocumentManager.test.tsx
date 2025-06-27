import { describe, it, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DocumentManager } from './DocumentManager';
import React from 'react';

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
  };
});

describe('DocumentManager', () => {
  it('renders main header and system status', () => {
    render(<DocumentManager />);

    // Main heading
    expect(screen.getByText('📄 Document Management System')).toBeInTheDocument();

    // Gateway status should show Connected (mock value)
    expect(screen.getByText(/Gateway:/)).toHaveTextContent('Gateway: UP');
  });
}); 