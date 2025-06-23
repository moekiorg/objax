import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataMorph } from './DataMorph';
import type { ObjaxInstance } from '../../types';

describe('DataMorph', () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  it('renders empty data morph', () => {
    const instance: ObjaxInstance = {
      id: 'test-1',
      name: 'testData',
      className: 'DataMorph',
      page: 'test',
      label: 'テストデータ',
      record: {},
      displayFields: []
    };

    render(<DataMorph instance={instance} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('テストデータ')).toBeInTheDocument();
    expect(screen.getByText('No fields to display')).toBeInTheDocument();
  });

  it('renders data morph with record data', () => {
    const instance: ObjaxInstance = {
      id: 'test-2',
      name: 'userData',
      className: 'DataMorph',
      page: 'test',
      label: 'ユーザーデータ',
      record: {
        name: '田中太郎',
        age: 30,
        active: true
      },
      displayFields: ['name', 'age', 'active']
    };

    render(<DataMorph instance={instance} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('ユーザーデータ')).toBeInTheDocument();
    expect(screen.getByDisplayValue('田中太郎')).toBeInTheDocument();
    expect(screen.getByDisplayValue('30')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('allows editing string fields', () => {
    const instance: ObjaxInstance = {
      id: 'test-3',
      name: 'editableData',
      className: 'DataMorph',
      page: 'test',
      record: {
        title: 'Original Title'
      },
      displayFields: ['title']
    };

    render(<DataMorph instance={instance} onUpdate={mockOnUpdate} />);
    
    const titleInput = screen.getByDisplayValue('Original Title');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    
    expect(mockOnUpdate).toHaveBeenCalledWith({
      record: {
        title: 'New Title'
      }
    });
  });

  it('allows editing number fields', () => {
    const instance: ObjaxInstance = {
      id: 'test-4',
      name: 'numberData',
      className: 'DataMorph',
      page: 'test',
      record: {
        score: 100
      },
      displayFields: ['score']
    };

    render(<DataMorph instance={instance} onUpdate={mockOnUpdate} />);
    
    const scoreInput = screen.getByDisplayValue('100');
    fireEvent.change(scoreInput, { target: { value: '150' } });
    
    expect(mockOnUpdate).toHaveBeenCalledWith({
      record: {
        score: 150
      }
    });
  });

  it('allows editing boolean fields', () => {
    const instance: ObjaxInstance = {
      id: 'test-5',
      name: 'booleanData',
      className: 'DataMorph',
      page: 'test',
      record: {
        enabled: false
      },
      displayFields: ['enabled']
    };

    render(<DataMorph instance={instance} onUpdate={mockOnUpdate} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    
    fireEvent.click(checkbox);
    
    expect(mockOnUpdate).toHaveBeenCalledWith({
      record: {
        enabled: true
      }
    });
  });

  it('displays all fields when displayFields is empty', () => {
    const instance: ObjaxInstance = {
      id: 'test-6',
      name: 'allFieldsData',
      className: 'DataMorph',
      page: 'test',
      record: {
        name: 'Test',
        value: 42,
        active: true
      },
      displayFields: [] // Empty array means show all fields
    };

    render(<DataMorph instance={instance} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
    expect(screen.getByDisplayValue('42')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
});