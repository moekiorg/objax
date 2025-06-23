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
  fields: ['value'],
  label: 'Task List'
};

const mockDatabaseInstanceNoFields: ObjaxInstance = {
  id: '3',
  name: 'emptyView',
  className: 'DatabaseMorph',
  page: 'test',
  type: 'DatabaseMorph',
  dataSource: 'myTasks',
  viewMode: 'table',
  label: 'Empty View'
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
    
    expect(screen.getByText('表示するデータがありません')).toBeInTheDocument();
  });

  it('shows only view mode buttons when no fields are set', () => {
    render(
      <DatabaseMorph 
        instance={mockDatabaseInstanceNoFields}
        dataInstances={mockDataInstances}
      />
    );
    
    // View mode buttons should be visible
    expect(screen.getByText('テーブル')).toBeInTheDocument();
    expect(screen.getByText('グリッド')).toBeInTheDocument();
    
    // No table or grid content should be displayed
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByText('表示するデータがありません')).not.toBeInTheDocument();
  });

  it('shows only view mode buttons in grid mode when no fields are set', () => {
    const gridInstance = { ...mockDatabaseInstanceNoFields, viewMode: 'grid' as const };
    
    render(
      <DatabaseMorph 
        instance={gridInstance}
        dataInstances={mockDataInstances}
      />
    );
    
    // View mode buttons should be visible
    expect(screen.getByText('テーブル')).toBeInTheDocument();
    expect(screen.getByText('グリッド')).toBeInTheDocument();
    
    // No grid content should be displayed
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByText('表示するデータがありません')).not.toBeInTheDocument();
  });

  it('shows view mode buttons', () => {
    render(
      <DatabaseMorph 
        instance={mockDatabaseInstance}
        dataInstances={mockDataInstances}
      />
    );
    
    expect(screen.getByText('テーブル')).toBeInTheDocument();
    expect(screen.getByText('グリッド')).toBeInTheDocument();
  });
});