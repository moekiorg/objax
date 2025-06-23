import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Inspector } from './Inspector';
import type { ObjaxInstance } from '../types';

// Mock the store
vi.mock('../stores/objaxStore', () => ({
  useObjaxStore: vi.fn(() => ({
    instances: [],
  })),
}));

describe('Inspector Fields Display', () => {
  const mockOnUpdate = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
    mockOnClose.mockClear();
  });

  it('displays built-in value field', () => {
    const instance: ObjaxInstance = {
      id: 'test-1',
      name: 'testInstance',
      className: 'FieldMorph',
      page: 'test',
      value: 'Hello World'
    };

    render(
      <Inspector
        instance={instance}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('インスタンスフィールド')).toBeInTheDocument();
    expect(screen.getByText('値 (value)')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Hello World')).toBeInTheDocument();
  });

  it('displays built-in items field', () => {
    const instance: ObjaxInstance = {
      id: 'test-2',
      name: 'testList',
      className: 'ListMorph',
      page: 'test',
      items: ['item1', 'item2', 'item3']
    };

    render(
      <Inspector
        instance={instance}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('アイテム (items)')).toBeInTheDocument();
    expect(screen.getByDisplayValue('item1, item2, item3')).toBeInTheDocument();
  });

  it('displays custom properties', () => {
    const instance: ObjaxInstance = {
      id: 'test-3',
      name: 'testCustom',
      className: 'Task',
      page: 'test',
      properties: {
        title: 'My Task',
        completed: true,
        priority: 5
      }
    };

    render(
      <Inspector
        instance={instance}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('カスタムプロパティ')).toBeInTheDocument();
    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('My Task')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
    expect(screen.getByDisplayValue('true')).toBeInTheDocument();
    expect(screen.getByText('priority')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
  });

  it('allows editing value field', () => {
    const instance: ObjaxInstance = {
      id: 'test-4',
      name: 'editableValue',
      className: 'FieldMorph',
      page: 'test',
      value: 42
    };

    render(
      <Inspector
        instance={instance}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const valueInput = screen.getByDisplayValue('42');
    fireEvent.change(valueInput, { target: { value: '100' } });

    expect(mockOnUpdate).toHaveBeenCalledWith('test-4', { value: 100 });
  });

  it('allows editing items field', () => {
    const instance: ObjaxInstance = {
      id: 'test-5',
      name: 'editableList',
      className: 'ListMorph',
      page: 'test',
      items: ['a', 'b']
    };

    render(
      <Inspector
        instance={instance}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const itemsInput = screen.getByDisplayValue('a, b');
    fireEvent.change(itemsInput, { target: { value: 'x, y, z' } });

    expect(mockOnUpdate).toHaveBeenCalledWith('test-5', {
      items: ['x', 'y', 'z']
    });
  });

  it('allows editing custom properties', () => {
    const instance: ObjaxInstance = {
      id: 'test-6',
      name: 'editableProps',
      className: 'Task',
      page: 'test',
      properties: {
        status: 'pending'
      }
    };

    render(
      <Inspector
        instance={instance}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const statusInput = screen.getByDisplayValue('pending');
    fireEvent.change(statusInput, { target: { value: 'completed' } });

    expect(mockOnUpdate).toHaveBeenCalledWith('test-6', {
      properties: { status: 'completed' }
    });
  });

  it('allows deleting custom properties', () => {
    const instance: ObjaxInstance = {
      id: 'test-7',
      name: 'deletableProps',
      className: 'Task',
      page: 'test',
      properties: {
        temp: 'delete me',
        keep: 'keep me'
      }
    };

    render(
      <Inspector
        instance={instance}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    // Find delete button for 'temp' property
    const deleteButtons = screen.getAllByText('×');
    fireEvent.click(deleteButtons[0]); // Assuming first button is for 'temp'

    expect(mockOnUpdate).toHaveBeenCalledWith('test-7', {
      properties: { keep: 'keep me' }
    });
  });

  it('allows adding new properties via Enter key', () => {
    const instance: ObjaxInstance = {
      id: 'test-8',
      name: 'addableProps',
      className: 'Task',
      page: 'test',
      properties: {}
    };

    render(
      <Inspector
        instance={instance}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const nameInput = screen.getByPlaceholderText('プロパティ名');
    const valueInput = screen.getByPlaceholderText('値');

    fireEvent.change(nameInput, { target: { value: 'newProp' } });
    fireEvent.change(valueInput, { target: { value: 'newValue' } });
    fireEvent.keyDown(nameInput, { key: 'Enter' });

    expect(mockOnUpdate).toHaveBeenCalledWith('test-8', {
      properties: { newProp: 'newValue' }
    });
  });

  it('auto-converts number and boolean values', () => {
    const instance: ObjaxInstance = {
      id: 'test-9',
      name: 'typeConversion',
      className: 'Task',
      page: 'test',
      properties: {}
    };

    render(
      <Inspector
        instance={instance}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const nameInput = screen.getByPlaceholderText('プロパティ名');
    const valueInput = screen.getByPlaceholderText('値');

    // Test number conversion
    fireEvent.change(nameInput, { target: { value: 'count' } });
    fireEvent.change(valueInput, { target: { value: '42' } });
    fireEvent.keyDown(nameInput, { key: 'Enter' });

    expect(mockOnUpdate).toHaveBeenNthCalledWith(1, 'test-9', {
      properties: { count: 42 }
    });

    // Test boolean conversion - the component will see the previous state
    fireEvent.change(nameInput, { target: { value: 'active' } });
    fireEvent.change(valueInput, { target: { value: 'true' } });
    fireEvent.keyDown(nameInput, { key: 'Enter' });

    expect(mockOnUpdate).toHaveBeenNthCalledWith(2, 'test-9', {
      properties: { active: true } // Only the new property, not the old one
    });
    
    expect(mockOnUpdate).toHaveBeenCalledTimes(2);
  });

  it('shows add property section even with no existing properties', () => {
    const instance: ObjaxInstance = {
      id: 'test-10',
      name: 'noProps',
      className: 'Task',
      page: 'test'
    };

    render(
      <Inspector
        instance={instance}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('新しいプロパティを追加')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('プロパティ名')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('値')).toBeInTheDocument();
  });
});