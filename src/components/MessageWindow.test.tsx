import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MessageWindow } from './MessageWindow';

describe('MessageWindow', () => {
  it('should render message window for instance', () => {
    const mockOnClose = vi.fn();
    const mockOnSend = vi.fn();
    
    render(
      <MessageWindow
        targetInstance="myTask"
        onClose={mockOnClose}
        onSend={mockOnSend}
      />
    );
    
    expect(screen.getByText('Send Message to myTask')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter objax code/i)).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should send message when Send button clicked', () => {
    const mockOnClose = vi.fn();
    const mockOnSend = vi.fn();
    
    render(
      <MessageWindow
        targetInstance="myTask"
        onClose={mockOnClose}
        onSend={mockOnSend}
      />
    );
    
    const textarea = screen.getByPlaceholderText(/enter objax code/i);
    const sendButton = screen.getByText('Send');
    
    fireEvent.change(textarea, { target: { value: "set field 'title' of self to 'Hello'" } });
    fireEvent.click(sendButton);
    
    expect(mockOnSend).toHaveBeenCalledWith("set field 'title' of self to 'Hello'");
  });

  it('should close window when Cancel button clicked', () => {
    const mockOnClose = vi.fn();
    const mockOnSend = vi.fn();
    
    render(
      <MessageWindow
        targetInstance="myTask"
        onClose={mockOnClose}
        onSend={mockOnSend}
      />
    );
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });
});