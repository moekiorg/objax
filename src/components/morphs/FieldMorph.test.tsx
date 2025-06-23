import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FieldMorph } from './FieldMorph';

describe('FieldMorph', () => {
  it('should render a text input field', () => {
    const mockOnChange = vi.fn();
    
    render(
      <FieldMorph 
        label="Name" 
        value=""
        onChange={mockOnChange}
        type="text"
      />
    );
    
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
    
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('should render readonly text when editable is false', () => {
    const mockOnChange = vi.fn();
    
    render(
      <FieldMorph 
        label="Read Only Field" 
        value="read only value"
        onChange={mockOnChange}
        type="text"
        editable={false}
      />
    );
    
    expect(screen.getByText("read only value")).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('should render readonly boolean text when editable is false', () => {
    const mockOnChange = vi.fn();
    
    render(
      <FieldMorph 
        label="Read Only Boolean" 
        value={true}
        onChange={mockOnChange}
        type="boolean"
        editable={false}
      />
    );
    
    expect(screen.getByText("true")).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('should render readonly false boolean text when editable is false', () => {
    const mockOnChange = vi.fn();
    
    render(
      <FieldMorph 
        label="Read Only Boolean False" 
        value={false}
        onChange={mockOnChange}
        type="boolean"
        editable={false}
      />
    );
    
    expect(screen.getByText("false")).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});