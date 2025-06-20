import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ListMorph } from './ListMorph';

describe('ListMorph', () => {
  it('should render a list with items', () => {
    const mockItems = ['Item 1', 'Item 2', 'Item 3'];
    const mockOnItemClick = vi.fn();
    
    render(
      <ListMorph 
        label="Todo List" 
        items={mockItems}
        onItemClick={mockOnItemClick}
      />
    );
    
    expect(screen.getByText('Todo List')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });
});