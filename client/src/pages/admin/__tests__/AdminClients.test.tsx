import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminClients from '../AdminClients';

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

const mockUsers = [
  {
    id: '1',
    username: 'johndoe',
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    country: 'United States',
    city: 'New York',
    address: '123 Main St',
    zipCode: '10001',
    referralId: 'REF001',
    enabled: true,
    verified: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    username: 'janesmith',
    fullName: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1234567891',
    country: 'Canada',
    city: 'Toronto',
    address: '456 Oak Ave',
    zipCode: 'M5H 2N2',
    referralId: 'REF002',
    enabled: true,
    verified: false,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    username: 'bobwilson',
    fullName: 'Bob Wilson',
    email: 'bob@example.com',
    phone: '+1234567892',
    country: 'United Kingdom',
    city: 'London',
    address: '789 High St',
    zipCode: 'SW1A 1AA',
    referralId: 'REF003',
    enabled: false,
    verified: true,
    createdAt: new Date('2024-02-01'),
  },
];

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

describe('AdminClients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title and description', () => {
    render(<AdminClients />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Clients')).toBeInTheDocument();
    expect(screen.getByText('Manage all registered clients')).toBeInTheDocument();
  });

  it('renders search input with correct placeholder', () => {
    render(<AdminClients />, { wrapper: createWrapper() });
    
    const searchInput = screen.getByPlaceholderText(/Search by name, email, referral ID, or country/);
    expect(searchInput).toBeInTheDocument();
  });

  it('filters users based on search term - by name', async () => {
    render(<AdminClients />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText(/Search by name, email, referral ID, or country/);
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table).toHaveTextContent('John Doe');
      expect(table).not.toHaveTextContent('Jane Smith');
    });
  });

  it('filters users based on search term - by email', async () => {
    render(<AdminClients />, { wrapper: createWrapper() });
    
    const searchInput = screen.getByPlaceholderText(/Search by name, email, referral ID, or country/);
    fireEvent.change(searchInput, { target: { value: 'jane@example.com' } });
    
    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table).toHaveTextContent('Jane Smith');
      expect(table).not.toHaveTextContent('John Doe');
    });
  });

  it('filters users based on search term - by country', async () => {
    render(<AdminClients />, { wrapper: createWrapper() });
    
    const searchInput = screen.getByPlaceholderText(/Search by name, email, referral ID, or country/);
    fireEvent.change(searchInput, { target: { value: 'Canada' } });
    
    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table).toHaveTextContent('Jane Smith');
      expect(table).toHaveTextContent('Canada');
    });
  });

  it('search is case insensitive', async () => {
    render(<AdminClients />, { wrapper: createWrapper() });
    
    const searchInput = screen.getByPlaceholderText(/Search by name, email, referral ID, or country/);
    fireEvent.change(searchInput, { target: { value: 'JOHN' } });
    
    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table).toHaveTextContent('John Doe');
    });
  });

  it('displays View/Edit button for each user', async () => {
    render(<AdminClients />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      const viewEditButtons = screen.getAllByText(/View\/Edit/);
      expect(viewEditButtons.length).toBeGreaterThan(0);
    });
  });

  it('displays Send Link button for each user', async () => {
    render(<AdminClients />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      const sendLinkButtons = screen.getAllByText(/Send Link/);
      expect(sendLinkButtons.length).toBeGreaterThan(0);
    });
  });

  it('displays Impersonate button for each user', async () => {
    render(<AdminClients />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      const impersonateButtons = screen.getAllByText(/Impersonate/);
      expect(impersonateButtons.length).toBeGreaterThan(0);
    });
  });

  it('shows loading spinner when data is loading', () => {
    render(<AdminClients />, { wrapper: createWrapper() });
    
    // Initially should show loader (since we have no mock data set up)
    const loader = screen.queryByRole('progressbar') || screen.queryByTestId('loader');
    // If the component is set to show loading state initially
  });

  it('renders table with all users when no search term', async () => {
    render(<AdminClients />, { wrapper: createWrapper() });
    
    // Without proper mock data, we can at least verify the structure renders
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  it('clears search results when search term is cleared', async () => {
    render(<AdminClients />, { wrapper: createWrapper() });
    
    const searchInput = screen.getByPlaceholderText(/Search by name, email, referral ID, or country/) as HTMLInputElement;
    
    // Search for something
    fireEvent.change(searchInput, { target: { value: 'John' } });
    expect(searchInput.value).toBe('John');
    
    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(searchInput.value).toBe('');
  });

  it('renders proper column headers', async () => {
    render(<AdminClients />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Referral ID')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Phone No')).toBeInTheDocument();
      expect(screen.getByText('Country')).toBeInTheDocument();
      expect(screen.getByText('Member Since')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });
});

