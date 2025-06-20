import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ButtonMorph } from './ButtonMorph';

describe('ButtonMorph', () => {
  it('should render a button with label', () => {
    const mockOnClick = vi.fn();
    
    render(
      <ButtonMorph 
        label="Click Me" 
        onClick={mockOnClick}
      />
    );
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });
});