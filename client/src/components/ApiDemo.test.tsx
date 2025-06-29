import { describe, it, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ApiDemo } from './ApiDemo';
import React from 'react';

vi.mock('../hooks/useApi', async () => {
  const original = await vi.importActual<any>('../hooks/useApi');

  return {
    __esModule: true,
    ...original,
    useGatewayHealth: () => ({ data: { service: 'API Gateway', status: 'UP' }, isLoading: false }),
    useServices: () => ({ data: { services: ['hello-service', 'document-service'] }, isLoading: false }),
    useServiceApiDocs: () => ({ data: '{"openapi":"3.0.1"}', isLoading: false }),
    useHello: () => ({ data: 'Hello!', isLoading: false }),
    useDocuments: () => ({ data: [], isLoading: false }),
  };
});

describe('ApiDemo', () => {
  it('renders API Demo header', () => {
    render(<ApiDemo />);
    expect(screen.getByText('🔧 API Demo')).toBeInTheDocument();
  });
}); 