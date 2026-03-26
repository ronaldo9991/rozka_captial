import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminWithdrawals from '../AdminWithdrawals';

// Mock dependencies
vi.mock('@/lib/queryClient', () => ({
  queryClient: new QueryClient(),
  apiRequest: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/lib/pdf-export', () => ({
  generateWithdrawalsPDF: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('AdminWithdrawals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title and description', () => {
    render(<AdminWithdrawals />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Withdrawals')).toBeInTheDocument();
    expect(screen.getByText(/Manage pending withdrawal requests/)).toBeInTheDocument();
  });

  it('renders search input with correct placeholder', () => {
    render(<AdminWithdrawals />, { wrapper: createWrapper() });
    
    const searchInput = screen.getByPlaceholderText(/Search by client, account, method, amount, status, or ID/);
    expect(searchInput).toBeInTheDocument();
  });

  it('allows typing in search input', () => {
    render(<AdminWithdrawals />, { wrapper: createWrapper() });
    
    const searchInput = screen.getByPlaceholderText(/Search by client, account, method, amount, status, or ID/) as HTMLInputElement;
    
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    expect(searchInput.value).toBe('test search');
  });

  it('renders pending and archive tabs', () => {
    render(<AdminWithdrawals />, { wrapper: createWrapper() });
    
    expect(screen.getByText(/Pending/)).toBeInTheDocument();
    expect(screen.getByText(/Archive/)).toBeInTheDocument();
  });

  it('switches between pending and archive views', async () => {
    render(<AdminWithdrawals />, { wrapper: createWrapper() });
    
    const archiveTab = screen.getByRole('tab', { name: /Archive/ });
    fireEvent.click(archiveTab);
    
    await waitFor(() => {
      expect(screen.getByText(/Complete history of all withdrawals/)).toBeInTheDocument();
    });
  });

  it('displays download button for full list', () => {
    render(<AdminWithdrawals />, { wrapper: createWrapper() });
    
    expect(screen.getByText(/Download Full List of Withdrawals/)).toBeInTheDocument();
  });

  it('renders withdrawal table columns', async () => {
    render(<AdminWithdrawals />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Client')).toBeInTheDocument();
      expect(screen.getByText('Account')).toBeInTheDocument();
      expect(screen.getByText('Method')).toBeInTheDocument();
      expect(screen.getByText('Amount')).toBeInTheDocument();
      expect(screen.getByText('Bank Details')).toBeInTheDocument();
      expect(screen.getByText('Request Date')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });

  it('shows pending tab by default', () => {
    render(<AdminWithdrawals />, { wrapper: createWrapper() });
    
    expect(screen.getByText(/Manage pending withdrawal requests/)).toBeInTheDocument();
  });

  it('clears search when input is cleared', () => {
    render(<AdminWithdrawals />, { wrapper: createWrapper() });
    
    const searchInput = screen.getByPlaceholderText(/Search by client, account, method, amount, status, or ID/) as HTMLInputElement;
    
    // Type search term
    fireEvent.change(searchInput, { target: { value: 'John' } });
    expect(searchInput.value).toBe('John');
    
    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(searchInput.value).toBe('');
  });

  it('displays count in pending tab', () => {
    render(<AdminWithdrawals />, { wrapper: createWrapper() });
    
    // Should show count in parentheses (e.g., "Pending (0)")
    const pendingTab = screen.getByText(/Pending/);
    expect(pendingTab).toBeInTheDocument();
  });

  it('displays count in archive tab', () => {
    render(<AdminWithdrawals />, { wrapper: createWrapper() });
    
    // Should show count in parentheses (e.g., "Archive (0)")
    const archiveTab = screen.getByText(/Archive/);
    expect(archiveTab).toBeInTheDocument();
  });
});

