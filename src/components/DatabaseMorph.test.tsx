import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DatabaseMorph } from './DatabaseMorph';
import type { ObjaxInstance } from '../types';

// Mock data
const mockDataInstances: ObjaxInstance[] = [
  {
    id: '1',
    name: 'myTasks',
    className: 'ListMorph',
    page: 'test',
    type: 'ListMorph',
    items: ['Task 1', 'Task 2', 'Task 3']
  }
];

const mockDatabaseInstance: ObjaxInstance = {
  id: '2',
  name: 'myTaskListView',
  className: 'DatabaseMorph',
  page: 'test',
  type: 'DatabaseMorph',
  dataSource: 'myTasks',
  viewMode: 'table',
  columns: ['value'],
  label: 'Task List'
};

describe('DatabaseMorph', () => {
  it('renders with basic props', () => {
    render(
      <DatabaseMorph 
        instance={mockDatabaseInstance}
        dataInstances={mockDataInstances}
      />
    );
    
    expect(screen.getByText('Task List')).toBeInTheDocument();
    expect(screen.getByText('→ myTasks')).toBeInTheDocument();
  });

  it('displays data in table format', () => {
    render(
      <DatabaseMorph 
        instance={mockDatabaseInstance}
        dataInstances={mockDataInstances}
      />
    );
    
    // Check table structure
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('value')).toBeInTheDocument(); // column header
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
  });

  it('displays data in grid format', () => {
    const gridInstance = { ...mockDatabaseInstance, viewMode: 'grid' as const };
    
    render(
      <DatabaseMorph 
        instance={gridInstance}
        dataInstances={mockDataInstances}
      />
    );
    
    // Grid layout should show items
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
  });

  it('shows no data message when dataSource is not found', () => {
    const emptyInstance = { ...mockDatabaseInstance, dataSource: 'nonexistent' };
    
    render(
      <DatabaseMorph 
        instance={emptyInstance}
        dataInstances={mockDataInstances}
      />
    );
    
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  it('shows view mode buttons', () => {
    render(
      <DatabaseMorph 
        instance={mockDatabaseInstance}
        dataInstances={mockDataInstances}
      />
    );
    
    expect(screen.getByText('Table')).toBeInTheDocument();
    expect(screen.getByText('Grid')).toBeInTheDocument();
  });
});