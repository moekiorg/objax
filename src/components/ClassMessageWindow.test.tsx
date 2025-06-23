import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ClassMessageWindow } from './ClassMessageWindow';

describe('ClassMessageWindow', () => {
  const mockOnSend = vi.fn();

  it('renders class message window with class name', () => {
    render(
      <ClassMessageWindow 
        className="Task" 
        onSend={mockOnSend} 
      />
    );

    expect(screen.getByText('Task へのメッセージ')).toBeDefined();
    expect(screen.getByText('テンプレート:')).toBeDefined();
    expect(screen.getByText('送信')).toBeDefined();
  });

  it('shows template buttons with it syntax', () => {
    render(
      <ClassMessageWindow 
        className="Task" 
        onSend={mockOnSend} 
      />
    );

    expect(screen.getByText('フィールド追加')).toBeDefined();
    expect(screen.getByText('デフォルト値付きフィールド')).toBeDefined();
    expect(screen.getByText('メソッド追加')).toBeDefined();
    
    // Check placeholder text contains 'it' syntax
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.placeholder).toContain('it has field');
  });

  it('has message input area', () => {
    render(
      <ClassMessageWindow 
        className="Task" 
        onSend={mockOnSend} 
      />
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDefined();
    expect(screen.getByText('Cmd/Ctrl + Enter で送信')).toBeDefined();
  });
});