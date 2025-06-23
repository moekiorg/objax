import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataMorph } from './DataMorph';
import type { ObjaxInstance } from '../../types';

describe('DataMorph Instance Reference', () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  it('displays data from referenced instance', () => {
    const referencedInstance: ObjaxInstance = {
      id: 'user-instance',
      name: 'userData',
      className: 'User',
      page: 'test',
      label: 'User Profile',
      value: 'John Doe',
      properties: {
        age: 30,
        email: 'john@example.com'
      }
    };

    const dataMorphInstance: ObjaxInstance = {
      id: 'datamorph-1',
      name: 'userView',
      className: 'DataMorph',
      page: 'test',
      label: 'User View',
      dataSource: 'userData',
      displayFields: ['name', 'label', 'value', 'age']
    };

    render(
      <DataMorph
        instance={dataMorphInstance}
        dataInstances={[referencedInstance]}
        onUpdate={mockOnUpdate}
      />
    );

    // Should display data from referenced instance
    expect(screen.getByText('User View')).toBeInTheDocument();
    expect(screen.getByText('→ userData')).toBeInTheDocument(); // Data source indicator
    expect(screen.getByDisplayValue('userData')).toBeInTheDocument(); // name field
    expect(screen.getByDisplayValue('User Profile')).toBeInTheDocument(); // label field
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument(); // value field
    expect(screen.getByDisplayValue('30')).toBeInTheDocument(); // age from properties
  });

  it('makes fields read-only when using instance reference', () => {
    const referencedInstance: ObjaxInstance = {
      id: 'task-instance',
      name: 'myTask',
      className: 'Task',
      page: 'test',
      properties: {
        title: 'Complete project',
        completed: false
      }
    };

    const dataMorphInstance: ObjaxInstance = {
      id: 'datamorph-2',
      name: 'taskView',
      className: 'DataMorph',
      page: 'test',
      dataSource: 'myTask',
      displayFields: ['title', 'completed']
    };

    render(
      <DataMorph
        instance={dataMorphInstance}
        dataInstances={[referencedInstance]}
        onUpdate={mockOnUpdate}
      />
    );

    // Text input should be read-only
    const titleInput = screen.getByDisplayValue('Complete project');
    expect(titleInput).toHaveAttribute('readOnly');
    expect(titleInput).toHaveClass('bg-gray-100', 'cursor-not-allowed');

    // Checkbox should be disabled
    const completedCheckbox = screen.getByRole('checkbox');
    expect(completedCheckbox).toBeDisabled();
    expect(completedCheckbox).toHaveClass('bg-gray-100', 'cursor-not-allowed');

    // Editing should not trigger onUpdate
    fireEvent.change(titleInput, { target: { value: 'New title' } });
    fireEvent.click(completedCheckbox);
    
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it('falls back to direct record when dataSource not found', () => {
    const dataMorphInstance: ObjaxInstance = {
      id: 'datamorph-3',
      name: 'fallbackView',
      className: 'DataMorph',
      page: 'test',
      dataSource: 'nonExistentInstance',
      record: {
        fallback: 'This is fallback data'
      },
      displayFields: ['fallback']
    };

    render(
      <DataMorph
        instance={dataMorphInstance}
        dataInstances={[]} // Empty instances array
        onUpdate={mockOnUpdate}
      />
    );

    // Should display fallback record data
    expect(screen.getByDisplayValue('This is fallback data')).toBeInTheDocument();
    
    // Should still be editable since no valid dataSource reference
    const input = screen.getByDisplayValue('This is fallback data');
    expect(input).not.toHaveAttribute('readOnly');
    expect(input).not.toHaveClass('bg-gray-100');
  });

  it('shows all fields when displayFields is empty for referenced instance', () => {
    const referencedInstance: ObjaxInstance = {
      id: 'product-instance',
      name: 'product1',
      className: 'Product',
      page: 'test',
      label: 'Laptop',
      value: 999,
      properties: {
        category: 'Electronics',
        inStock: true,
        description: 'High-performance laptop'
      }
    };

    const dataMorphInstance: ObjaxInstance = {
      id: 'datamorph-4',
      name: 'productView',
      className: 'DataMorph',
      page: 'test',
      dataSource: 'product1',
      displayFields: [] // Empty - should show all fields
    };

    render(
      <DataMorph
        instance={dataMorphInstance}
        dataInstances={[referencedInstance]}
        onUpdate={mockOnUpdate}
      />
    );

    // Should display all available fields from referenced instance
    expect(screen.getByDisplayValue('product1')).toBeInTheDocument(); // name
    expect(screen.getByDisplayValue('Product')).toBeInTheDocument(); // className
    expect(screen.getByDisplayValue('Laptop')).toBeInTheDocument(); // label
    expect(screen.getByDisplayValue('999')).toBeInTheDocument(); // value
    expect(screen.getByDisplayValue('Electronics')).toBeInTheDocument(); // category
    expect(screen.getByRole('checkbox')).toBeChecked(); // inStock
    expect(screen.getByDisplayValue('High-performance laptop')).toBeInTheDocument(); // description
  });

  it('works without dataInstances prop (backward compatibility)', () => {
    const dataMorphInstance: ObjaxInstance = {
      id: 'datamorph-5',
      name: 'directView',
      className: 'DataMorph',
      page: 'test',
      record: {
        direct: 'Direct data'
      },
      displayFields: ['direct']
    };

    render(
      <DataMorph
        instance={dataMorphInstance}
        // No dataInstances prop
        onUpdate={mockOnUpdate}
      />
    );

    // Should work with direct record data
    expect(screen.getByDisplayValue('Direct data')).toBeInTheDocument();
    
    // Should be editable
    const input = screen.getByDisplayValue('Direct data');
    fireEvent.change(input, { target: { value: 'Modified data' } });
    
    expect(mockOnUpdate).toHaveBeenCalledWith({
      record: { direct: 'Modified data' }
    });
  });
});