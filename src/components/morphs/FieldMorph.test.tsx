import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FieldMorph } from './FieldMorph';

describe('FieldMorph', () => {
  it('should render a text input field with label', () => {
    const mockOnChange = vi.fn();
    
    render(
      <FieldMorph 
        label="Name" 
        value=""
        onChange={mockOnChange}
        type="text"
      />
    );
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should render a number input field', () => {
    const mockOnChange = vi.fn();
    
    render(
      <FieldMorph 
        label="Age" 
        value={25}
        onChange={mockOnChange}
        type="number"
      />
    );
    
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  it('should render a checkbox for boolean input', () => {
    const mockOnChange = vi.fn();
    
    render(
      <FieldMorph 
        label="Active" 
        value={true}
        onChange={mockOnChange}
        type="boolean"
      />
    );
    
    expect(screen.getByLabelText(/active/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
});