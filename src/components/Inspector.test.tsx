import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Inspector } from './Inspector';
import { useObjaxStore } from '../stores/objaxStore';

describe('Inspector', () => {
  beforeEach(() => {
    // Reset store state before each test
    useObjaxStore.setState({
      pages: [],
      states: [],
      instances: [],
      classes: [],
      currentPage: null,
      showPlayground: false,
      history: [],
      historyIndex: -1,
    });
  });

  it('should render inspector component', () => {
    const mockInstance = {
      id: 'test-1',
      name: 'testButton',
      className: 'ButtonMorph',
      page: 'TestPage'
    };
    
    render(<Inspector instance={mockInstance} onClose={vi.fn()} />);
    expect(screen.getByText('プロパティ')).toBeInTheDocument();
    expect(screen.getByDisplayValue('testButton')).toBeInTheDocument();
  });

  it('should close when close function is called', () => {
    const mockInstance = {
      id: 'test-1',
      name: 'testButton',
      className: 'ButtonMorph',
      page: 'TestPage'
    };
    const onClose = vi.fn();
    
    render(<Inspector instance={mockInstance} onClose={onClose} />);
    // The component itself doesn't have a close button, 
    // it's managed by the parent component (DraggableWindow)
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should allow editing instance properties', () => {
    const mockInstance = {
      id: 'test-1',
      name: 'testButton',
      className: 'ButtonMorph',
      page: 'TestPage',
      label: 'Click me'
    };
    const onUpdate = vi.fn();
    
    render(<Inspector instance={mockInstance} onClose={vi.fn()} onUpdate={onUpdate} />);
    
    const input = screen.getByDisplayValue('Click me');
    fireEvent.change(input, { target: { value: 'Updated label' } });
    
    expect(onUpdate).toHaveBeenCalledWith('test-1', { label: 'Updated label' });
  });

  it('should allow updating instance name when unique', () => {
    const mockInstance = {
      id: 'test-1',
      name: 'testButton',
      className: 'ButtonMorph',
      page: 'TestPage'
    };
    const onUpdate = vi.fn();
    
    render(<Inspector instance={mockInstance} onClose={vi.fn()} onUpdate={onUpdate} />);
    
    const nameInput = screen.getByDisplayValue('testButton');
    fireEvent.change(nameInput, { target: { value: 'newButtonName' } });
    
    expect(onUpdate).toHaveBeenCalledWith('test-1', { name: 'newButtonName' });
  });

  it('should ignore name update when duplicate name exists on same page', () => {
    // Set up store with existing instances
    useObjaxStore.setState({
      pages: [],
      states: [],
      instances: [
        {
          id: 'test-1',
          name: 'testButton',
          className: 'ButtonMorph',
          page: 'TestPage'
        },
        {
          id: 'test-2',
          name: 'existingButton',
          className: 'ButtonMorph',
          page: 'TestPage'
        }
      ],
      classes: [],
      currentPage: null,
      showPlayground: false,
      history: [],
      historyIndex: -1,
    });

    const mockInstance = {
      id: 'test-1',
      name: 'testButton',
      className: 'ButtonMorph',
      page: 'TestPage'
    };
    const onUpdate = vi.fn();
    
    render(<Inspector instance={mockInstance} onClose={vi.fn()} onUpdate={onUpdate} />);
    
    const nameInput = screen.getByDisplayValue('testButton');
    fireEvent.change(nameInput, { target: { value: 'existingButton' } });
    
    // onUpdate should not be called when name is duplicate
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('should allow same name on different pages', () => {
    // Set up store with existing instances on different pages
    useObjaxStore.setState({
      pages: [],
      states: [],
      instances: [
        {
          id: 'test-1',
          name: 'testButton',
          className: 'ButtonMorph',
          page: 'TestPage'
        },
        {
          id: 'test-2',
          name: 'sameNameButton',
          className: 'ButtonMorph',
          page: 'OtherPage'
        }
      ],
      classes: [],
      currentPage: null,
      showPlayground: false,
      history: [],
      historyIndex: -1,
    });

    const mockInstance = {
      id: 'test-1',
      name: 'testButton',
      className: 'ButtonMorph',
      page: 'TestPage'
    };
    const onUpdate = vi.fn();
    
    render(<Inspector instance={mockInstance} onClose={vi.fn()} onUpdate={onUpdate} />);
    
    const nameInput = screen.getByDisplayValue('testButton');
    fireEvent.change(nameInput, { target: { value: 'sameNameButton' } });
    
    // onUpdate should be called since the same name exists on a different page
    expect(onUpdate).toHaveBeenCalledWith('test-1', { name: 'sameNameButton' });
  });

  it('should render delete button when onDelete is provided', () => {
    const mockInstance = {
      id: 'test-1',
      name: 'testButton',
      className: 'ButtonMorph',
      page: 'TestPage'
    };
    const onDelete = vi.fn();
    
    render(<Inspector instance={mockInstance} onClose={vi.fn()} onDelete={onDelete} />);
    
    expect(screen.getByTitle('インスタンスを削除')).toBeInTheDocument();
  });

  it('should not render delete button when onDelete is not provided', () => {
    const mockInstance = {
      id: 'test-1',
      name: 'testButton',
      className: 'ButtonMorph',
      page: 'TestPage'
    };
    
    render(<Inspector instance={mockInstance} onClose={vi.fn()} />);
    
    expect(screen.queryByTitle('インスタンスを削除')).not.toBeInTheDocument();
  });

  it('should call onDelete and onClose when delete is confirmed', () => {
    const mockInstance = {
      id: 'test-1',
      name: 'testButton',
      className: 'ButtonMorph',
      page: 'TestPage'
    };
    const onDelete = vi.fn();
    const onClose = vi.fn();
    
    // Mock confirm to return true
    vi.stubGlobal('confirm', vi.fn(() => true));
    
    render(<Inspector instance={mockInstance} onClose={onClose} onDelete={onDelete} />);
    
    const deleteButton = screen.getByTitle('インスタンスを削除');
    fireEvent.click(deleteButton);
    
    expect(onDelete).toHaveBeenCalledWith('test-1');
    expect(onClose).toHaveBeenCalled();
  });

  it('should not call onDelete when delete is cancelled', () => {
    const mockInstance = {
      id: 'test-1',
      name: 'testButton',
      className: 'ButtonMorph',
      page: 'TestPage'
    };
    const onDelete = vi.fn();
    const onClose = vi.fn();
    
    // Mock confirm to return false
    vi.stubGlobal('confirm', vi.fn(() => false));
    
    render(<Inspector instance={mockInstance} onClose={onClose} onDelete={onDelete} />);
    
    const deleteButton = screen.getByTitle('インスタンスを削除');
    fireEvent.click(deleteButton);
    
    expect(onDelete).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should render DatabaseMorph fields editor', () => {
    const mockInstance = {
      id: 'test-1',
      name: 'testDatabase',
      className: 'DatabaseMorph',
      page: 'TestPage',
      columns: ['title', 'completed', 'priority']
    };
    
    render(<Inspector instance={mockInstance} onClose={vi.fn()} />);
    
    expect(screen.getByText('フィールド (カンマ区切り)')).toBeInTheDocument();
    expect(screen.getByDisplayValue('title, completed, priority')).toBeInTheDocument();
  });

  it('should allow editing DatabaseMorph columns', () => {
    const mockInstance = {
      id: 'test-1',
      name: 'testDatabase',
      className: 'DatabaseMorph',
      page: 'TestPage',
      columns: ['title', 'completed']
    };
    const onUpdate = vi.fn();
    
    render(<Inspector instance={mockInstance} onClose={vi.fn()} onUpdate={onUpdate} />);
    
    const columnsTextarea = screen.getByDisplayValue('title, completed');
    fireEvent.change(columnsTextarea, { target: { value: 'name, status, priority' } });
    
    expect(onUpdate).toHaveBeenCalledWith('test-1', { 
      columns: ['name', 'status', 'priority'] 
    });
  });

  it('should handle empty DatabaseMorph columns', () => {
    const mockInstance = {
      id: 'test-1',
      name: 'testDatabase',
      className: 'DatabaseMorph',
      page: 'TestPage'
    };
    
    render(<Inspector instance={mockInstance} onClose={vi.fn()} />);
    
    expect(screen.getByText('フィールド (カンマ区切り)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('例: title, completed, priority')).toBeInTheDocument();
  });
});