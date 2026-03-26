import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DataTable from '../DataTable';

describe('DataTable', () => {
  const mockColumns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false },
  ];

  const mockData = [
    { id: '1', name: 'John Doe', email: 'john@example.com', amount: 100 },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', amount: 200 },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', amount: 150 },
  ];

  it('renders table with correct data', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('renders column headers with sort buttons', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);
    
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('sorts data in ascending order when column header is clicked', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);
    
    const nameHeader = screen.getByText('Name').closest('button');
    expect(nameHeader).toBeInTheDocument();
    
    fireEvent.click(nameHeader!);
    
    const rows = screen.getAllByTestId(/^row-/);
    // After sorting ascending by name: Bob, Jane, John
    expect(rows[0]).toHaveTextContent('Bob Johnson');
    expect(rows[1]).toHaveTextContent('Jane Smith');
    expect(rows[2]).toHaveTextContent('John Doe');
  });

  it('sorts data in descending order when column header is clicked twice', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);
    
    const nameHeader = screen.getByText('Name').closest('button');
    fireEvent.click(nameHeader!); // First click: ascending
    fireEvent.click(nameHeader!); // Second click: descending
    
    const rows = screen.getAllByTestId(/^row-/);
    // After sorting descending by name: John, Jane, Bob
    expect(rows[0]).toHaveTextContent('John Doe');
    expect(rows[1]).toHaveTextContent('Jane Smith');
    expect(rows[2]).toHaveTextContent('Bob Johnson');
  });

  it('resets sorting when column header is clicked three times', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);
    
    const nameHeader = screen.getByText('Name').closest('button');
    fireEvent.click(nameHeader!); // First click: ascending
    fireEvent.click(nameHeader!); // Second click: descending
    fireEvent.click(nameHeader!); // Third click: reset
    
    const rows = screen.getAllByTestId(/^row-/);
    // Back to original order: John, Jane, Bob
    expect(rows[0]).toHaveTextContent('John Doe');
    expect(rows[1]).toHaveTextContent('Jane Smith');
    expect(rows[2]).toHaveTextContent('Bob Johnson');
  });

  it('sorts numeric values correctly', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);
    
    const amountHeader = screen.getByText('Amount').closest('button');
    fireEvent.click(amountHeader!);
    
    const rows = screen.getAllByTestId(/^row-/);
    // Ascending by amount: 100, 150, 200
    expect(rows[0]).toHaveTextContent('100');
    expect(rows[1]).toHaveTextContent('150');
    expect(rows[2]).toHaveTextContent('200');
  });

  it('displays pagination when data exceeds rowsPerPage', () => {
    const largeData = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      amount: i * 10,
    }));
    
    render(<DataTable columns={mockColumns} data={largeData} rowsPerPage={10} />);
    
    expect(screen.getByText(/Showing 1 to 10 of 25 entries/)).toBeInTheDocument();
    expect(screen.getByTestId('button-page-1')).toBeInTheDocument();
    expect(screen.getByTestId('button-page-2')).toBeInTheDocument();
    expect(screen.getByTestId('button-page-3')).toBeInTheDocument();
  });

  it('navigates to next page when next button is clicked', () => {
    const largeData = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      amount: i * 10,
    }));
    
    render(<DataTable columns={mockColumns} data={largeData} rowsPerPage={10} />);
    
    const nextButton = screen.getByTestId('button-next-page');
    fireEvent.click(nextButton);
    
    expect(screen.getByText(/Showing 11 to 20 of 25 entries/)).toBeInTheDocument();
  });

  it('navigates to previous page when prev button is clicked', () => {
    const largeData = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      amount: i * 10,
    }));
    
    render(<DataTable columns={mockColumns} data={largeData} rowsPerPage={10} />);
    
    // Go to page 2
    const nextButton = screen.getByTestId('button-next-page');
    fireEvent.click(nextButton);
    
    // Go back to page 1
    const prevButton = screen.getByTestId('button-prev-page');
    fireEvent.click(prevButton);
    
    expect(screen.getByText(/Showing 1 to 10 of 25 entries/)).toBeInTheDocument();
  });

  it('renders custom cell content with render function', () => {
    const columnsWithRender = [
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (value: string) => <span className="badge">{value.toUpperCase()}</span>,
      },
    ];
    
    const data = [{ status: 'active' }];
    
    render(<DataTable columns={columnsWithRender} data={data} />);
    
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toHaveClass('badge');
  });

  it('does not render pagination when data is less than rowsPerPage', () => {
    render(<DataTable columns={mockColumns} data={mockData} rowsPerPage={10} />);
    
    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
    expect(screen.queryByTestId('button-next-page')).not.toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    const largeData = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      amount: i * 10,
    }));
    
    render(<DataTable columns={mockColumns} data={largeData} rowsPerPage={10} />);
    
    const prevButton = screen.getByTestId('button-prev-page');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    const largeData = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      amount: i * 10,
    }));
    
    render(<DataTable columns={mockColumns} data={largeData} rowsPerPage={10} />);
    
    // Navigate to last page (page 3)
    const page3Button = screen.getByTestId('button-page-3');
    fireEvent.click(page3Button);
    
    const nextButton = screen.getByTestId('button-next-page');
    expect(nextButton).toBeDisabled();
  });

  it('resets to page 1 when data changes', () => {
    const { rerender } = render(<DataTable columns={mockColumns} data={mockData} rowsPerPage={2} />);
    
    // Go to page 2
    const nextButton = screen.getByTestId('button-next-page');
    fireEvent.click(nextButton);
    expect(screen.getByText(/Showing 3 to 3 of 3 entries/)).toBeInTheDocument();
    
    // Update data
    const newData = [
      { id: '4', name: 'New User', email: 'new@example.com', amount: 300 },
    ];
    rerender(<DataTable columns={mockColumns} data={newData} rowsPerPage={2} />);
    
    // Should be back on page 1
    expect(screen.queryByText(/Showing 1 to 1 of 1 entries/)).toBeInTheDocument();
  });
});

