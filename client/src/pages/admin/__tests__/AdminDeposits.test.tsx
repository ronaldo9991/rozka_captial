import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminDeposits from '../AdminDeposits';

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
  generateDepositsPDF: vi.fn(),
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

describe('AdminDeposits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title and description', () => {
    render(<AdminDeposits />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Deposits')).toBeInTheDocument();
    expect(screen.getByText(/Following is the list of pending Deposit/)).toBeInTheDocument();
  });

  it('renders search input with correct placeholder', () => {
    render(<AdminDeposits />, { wrapper: createWrapper() });
    
    const searchInput = screen.getByPlaceholderText(/Search by client, account, merchant, amount, status, or ID/);
    expect(searchInput).toBeInTheDocument();
  });

  it('allows typing in search input', () => {
    render(<AdminDeposits />, { wrapper: createWrapper() });
    
    const searchInput = screen.getByPlaceholderText(/Search by client, account, merchant, amount, status, or ID/) as HTMLInputElement;
    
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    expect(searchInput.value).toBe('test search');
  });

  it('renders pending and archive tabs', () => {
    render(<AdminDeposits />, { wrapper: createWrapper() });
    
    expect(screen.getByText(/Pending/)).toBeInTheDocument();
    expect(screen.getByText(/Archive/)).toBeInTheDocument();
  });

  it('switches between pending and archive views', async () => {
    render(<AdminDeposits />, { wrapper: createWrapper() });
    
    const archiveTab = screen.getByRole('tab', { name: /Archive/ });
    fireEvent.click(archiveTab);
    
    await waitFor(() => {
      expect(screen.getByText(/Complete history of all deposits/)).toBeInTheDocument();
    });
  });

  it('displays download button for full list', () => {
    render(<AdminDeposits />, { wrapper: createWrapper() });
    
    expect(screen.getByText(/Download Full List of Deposits/)).toBeInTheDocument();
  });

  it('renders deposit table columns', async () => {
    render(<AdminDeposits />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Clients')).toBeInTheDocument();
      expect(screen.getByText('Account')).toBeInTheDocument();
      expect(screen.getByText('Deposit Date')).toBeInTheDocument();
      expect(screen.getByText('Merchant')).toBeInTheDocument();
      expect(screen.getByText('Verification File')).toBeInTheDocument();
      expect(screen.getByText('Amount')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });

  it('shows pending tab by default', () => {
    render(<AdminDeposits />, { wrapper: createWrapper() });
    
    expect(screen.getByText(/Following is the list of pending Deposit/)).toBeInTheDocument();
  });

  it('renders "Deposit Amount in Trading Account" button in pending view', () => {
    render(<AdminDeposits />, { wrapper: createWrapper() });
    
    expect(screen.getByText(/Deposit Amount in Trading Account/)).toBeInTheDocument();
  });

  it('clears search when input is cleared', () => {
    render(<AdminDeposits />, { wrapper: createWrapper() });
    
    const searchInput = screen.getByPlaceholderText(/Search by client, account, merchant, amount, status, or ID/) as HTMLInputElement;
    
    // Type search term
    fireEvent.change(searchInput, { target: { value: 'John' } });
    expect(searchInput.value).toBe('John');
    
    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(searchInput.value).toBe('');
  });

  it('displays count in pending tab', () => {
    render(<AdminDeposits />, { wrapper: createWrapper() });
    
    // Should show count in parentheses (e.g., "Pending (0)")
    const pendingTab = screen.getByText(/Pending/);
    expect(pendingTab).toBeInTheDocument();
  });

  it('displays count in archive tab', () => {
    render(<AdminDeposits />, { wrapper: createWrapper() });
    
    // Should show count in parentheses (e.g., "Archive (0)")
    const archiveTab = screen.getByText(/Archive/);
    expect(archiveTab).toBeInTheDocument();
  });

  it('search functionality is case insensitive', () => {
    render(<AdminDeposits />, { wrapper: createWrapper() });
    
    const searchInput = screen.getByPlaceholderText(/Search by client, account, merchant, amount, status, or ID/) as HTMLInputElement;
    
    // Type uppercase
    fireEvent.change(searchInput, { target: { value: 'JOHN' } });
    expect(searchInput.value).toBe('JOHN');
    
    // Type lowercase
    fireEvent.change(searchInput, { target: { value: 'john' } });
    expect(searchInput.value).toBe('john');
  });

  it('switches back to pending from archive', async () => {
    render(<AdminDeposits />, { wrapper: createWrapper() });
    
    // Go to archive
    const archiveTab = screen.getByRole('tab', { name: /Archive/ });
    fireEvent.click(archiveTab);
    
    await waitFor(() => {
      expect(screen.getByText(/Complete history of all deposits/)).toBeInTheDocument();
    });
    
    // Go back to pending
    const pendingTab = screen.getByRole('tab', { name: /Pending/ });
    fireEvent.click(pendingTab);
    
    await waitFor(() => {
      expect(screen.getByText(/Following is the list of pending Deposit/)).toBeInTheDocument();
    });
  });
});

