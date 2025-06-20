import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
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
    
    render(<ClassBrowser classes={mockClasses} />);
    expect(screen.getByText('クラスブラウザ')).toBeInTheDocument();
    expect(screen.getByText('Task')).toBeInTheDocument();
  });

  it('should show message when no classes exist', () => {
    render(<ClassBrowser classes={[]} />);
    expect(screen.getByText(/まだクラスが定義されていません/)).toBeInTheDocument();
  });

  it('should expand class details when clicked', () => {
    const mockClasses = [
      {
        name: 'Task',
        fields: [{ name: 'title', defaultValue: undefined }],
        methods: [{ name: 'complete', parameters: [], body: 'set field "done" of myself to true' }]
      }
    ];
    
    render(<ClassBrowser classes={mockClasses} />);
    
    // Click to expand details
    fireEvent.click(screen.getByText('Task'));
    
    // Should show field and method details
    expect(screen.getByText('フィールド')).toBeInTheDocument();
    expect(screen.getByText('メソッド')).toBeInTheDocument();
    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('complete()')).toBeInTheDocument();
  });
});