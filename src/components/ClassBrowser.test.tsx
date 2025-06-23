import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ClassBrowser } from './ClassBrowser';

describe('ClassBrowser', () => {
  it('should render class browser component', () => {
    const mockClasses = [
      {
        name: 'Task',
        fields: [{ name: 'title', defaultValue: undefined }],
        methods: [{ name: 'complete', parameters: [], body: 'set field "done" of myself to true' }]
      }
    ];
    
    render(<ClassBrowser classes={mockClasses} onClassClick={() => {}} />);
    expect(screen.getByText('クラスブラウザ')).toBeInTheDocument();
    expect(screen.getByText('Task')).toBeInTheDocument();
  });

  it('should show message when no classes exist', () => {
    render(<ClassBrowser classes={[]} onClassClick={() => {}} />);
    expect(screen.getByText(/まだクラスが定義されていません/)).toBeInTheDocument();
  });

  it('should call onClassClick when class is clicked', () => {
    const mockOnClassClick = vi.fn();
    const mockClasses = [
      {
        name: 'Task',
        fields: [{ name: 'title', defaultValue: undefined }],
        methods: [{ name: 'complete', parameters: [], body: 'set field "done" of myself to true' }]
      }
    ];
    
    render(<ClassBrowser classes={mockClasses} onClassClick={mockOnClassClick} />);
    
    // Click class name
    fireEvent.click(screen.getByText('Task'));
    
    // Should call onClassClick
    expect(mockOnClassClick).toHaveBeenCalledWith('Task');
  });
});