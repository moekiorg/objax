import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Inspector } from '../Inspector';
import type { ObjaxInstance } from '../../types';

// Mock the store
vi.mock('../../stores/objaxStore', () => ({
  useObjaxStore: vi.fn(() => ({
    instances: [],
  })),
}));

describe('DataMorph Inspector', () => {
  const mockOnUpdate = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
    mockOnClose.mockClear();
  });

  it('renders DataMorph inspector fields', () => {
    const dataMorphInstance: ObjaxInstance = {
      id: 'test-datamorph-1',
      name: 'testData',
      className: 'DataMorph',
      page: 'TestPage',
      label: 'Test Data',
      dataSource: 'userData',
      displayFields: ['name', 'age']
    };

    render(
      <Inspector
        instance={dataMorphInstance}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    // Check for DataMorph specific fields
    expect(screen.getByText('データソース')).toBeInTheDocument();
    expect(screen.getByDisplayValue('userData')).toBeInTheDocument();
    
    expect(screen.getByText('表示フィールド (カンマ区切り)')).toBeInTheDocument();
    expect(screen.getByDisplayValue('name, age')).toBeInTheDocument();
    
    // Check for help text
    expect(screen.getByText('参照するインスタンスの名前を入力してください')).toBeInTheDocument();
    expect(screen.getByText('空の場合はレコードの全フィールドが表示されます')).toBeInTheDocument();
  });

  it('allows editing dataSource', () => {
    const dataMorphInstance: ObjaxInstance = {
      id: 'test-datamorph-2',
      name: 'testData2',
      className: 'DataMorph',
      page: 'TestPage',
      dataSource: 'oldSource'
    };

    render(
      <Inspector
        instance={dataMorphInstance}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const dataSourceInput = screen.getByDisplayValue('oldSource');
    fireEvent.change(dataSourceInput, { target: { value: 'newSource' } });

    expect(mockOnUpdate).toHaveBeenCalledWith('test-datamorph-2', {
      dataSource: 'newSource'
    });
  });

  it('allows editing displayFields', () => {
    const dataMorphInstance: ObjaxInstance = {
      id: 'test-datamorph-3',
      name: 'testData3',
      className: 'DataMorph',
      page: 'TestPage',
      displayFields: ['title', 'status']
    };

    render(
      <Inspector
        instance={dataMorphInstance}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const displayFieldsInput = screen.getByDisplayValue('title, status');
    fireEvent.change(displayFieldsInput, { target: { value: 'name, age, email' } });

    expect(mockOnUpdate).toHaveBeenCalledWith('test-datamorph-3', {
      displayFields: ['name', 'age', 'email']
    });
  });

  it('handles empty displayFields correctly', () => {
    const dataMorphInstance: ObjaxInstance = {
      id: 'test-datamorph-4',
      name: 'testData4',
      className: 'DataMorph',
      page: 'TestPage',
      displayFields: []
    };

    render(
      <Inspector
        instance={dataMorphInstance}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    // Should show empty string for empty array
    const displayFieldsInput = screen.getByPlaceholderText(/例: name, age, active/);
    expect(displayFieldsInput).toHaveValue('');
  });

  it('includes common morph properties', () => {
    const dataMorphInstance: ObjaxInstance = {
      id: 'test-datamorph-5',
      name: 'testData5',
      className: 'DataMorph',
      page: 'TestPage',
      label: 'My Data View'
    };

    render(
      <Inspector
        instance={dataMorphInstance}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    // Should have common morph properties like label
    expect(screen.getByText('ラベル')).toBeInTheDocument();
    expect(screen.getByDisplayValue('My Data View')).toBeInTheDocument();
  });

  it('trims whitespace from displayFields input', () => {
    const dataMorphInstance: ObjaxInstance = {
      id: 'test-datamorph-6',
      name: 'testData6',
      className: 'DataMorph',
      page: 'TestPage',
      displayFields: []
    };

    render(
      <Inspector
        instance={dataMorphInstance}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const displayFieldsInput = screen.getByPlaceholderText(/例: name, age, active/);
    fireEvent.change(displayFieldsInput, { target: { value: ' name , age ,  email ' } });

    expect(mockOnUpdate).toHaveBeenCalledWith('test-datamorph-6', {
      displayFields: ['name', 'age', 'email']
    });
  });
});