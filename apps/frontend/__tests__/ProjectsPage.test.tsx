import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ProjectsPage from '../pages/projects/index';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Supabase client with chained select and order returning a sample project
jest.mock('../lib/supabaseClient', () => {
  const sampleProjects = [
    {
      id: '1',
      name: 'Test Hotel',
      status: 'Draft',
      created_at: '2025-01-01T00:00:00Z',
      hotel_base_models: { data: { floorMix: [{ floorIndex: 1, roomsByType: { 'Standard King': 2 } }] } }
    }
  ];
  const mockFrom = jest.fn().mockReturnValue({
    select: () => ({
      order: () => Promise.resolve({ data: sampleProjects, error: null })
    })
  });
  return { supabase: { from: mockFrom } };
});

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('ProjectsPage', () => {
  it('renders loading state then project card', async () => {
    render(<ProjectsPage />, { wrapper: createWrapper() });
    expect(screen.getByText(/Loading projects/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/Test Hotel/i)).toBeInTheDocument());
    expect(screen.getByText(/Draft/i)).toBeInTheDocument();
    expect(screen.getByText(/2 Keys/i)).toBeInTheDocument();
  });

  it('renders empty state when no projects', async () => {
    // Override mock to return empty array
    const { supabase } = require('../lib/supabaseClient');
    supabase.from.mockReturnValue({
      select: () => ({ order: () => Promise.resolve({ data: [], error: null }) })
    });
    render(<ProjectsPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText(/No projects found/i)).toBeInTheDocument());
  });
}); 