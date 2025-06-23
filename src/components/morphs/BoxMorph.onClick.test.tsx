import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BoxMorph } from './BoxMorph';
import type { ObjaxInstance } from '../../types';

describe('BoxMorph onClick', () => {
  const mockInstance: ObjaxInstance = {
    id: 'test-box-1',
    name: 'testBox',
    className: 'BoxMorph',
    page: 'TestPage',
    label: 'Click Me',
    x: 100,
    y: 100,
    width: 100,
    height: 50,
    backgroundColor: '#ffffff',
    onClick: 'print "Box clicked!"'
  };

  it('should render BoxMorph with clickable styling when onClick is provided', () => {
    const mockOnClick = vi.fn();
    render(<BoxMorph instance={mockInstance} onClick={mockOnClick} />);
    
    const boxElement = screen.getByText('Click Me');
    expect(boxElement).toBeInTheDocument();
    expect(boxElement).toHaveClass('box-morph');
    
    // Check if cursor style is pointer when onClick is provided
    expect(boxElement).toHaveStyle({ cursor: 'pointer' });
  });

  it('should call onClick handler when clicked', () => {
    const mockOnClick = vi.fn();
    render(<BoxMorph instance={mockInstance} onClick={mockOnClick} />);
    
    const boxElement = screen.getByText('Click Me');
    fireEvent.click(boxElement);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should render BoxMorph with default cursor when no onClick is provided', () => {
    render(<BoxMorph instance={mockInstance} />);
    
    const boxElement = screen.getByText('Click Me');
    expect(boxElement).toBeInTheDocument();
    
    // Check if cursor style is default when onClick is not provided
    expect(boxElement).toHaveStyle({ cursor: 'default' });
  });

  it('should apply custom styling from instance properties', () => {
    const customInstance: ObjaxInstance = {
      ...mockInstance,
      backgroundColor: '#ff0000',
      borderColor: '#00ff00',
      borderRadius: '8px',
      padding: '16px',
      textColor: '#0000ff',
      fontSize: '16px'
    };

    render(<BoxMorph instance={customInstance} />);
    
    const boxElement = screen.getByText('Click Me');
    expect(boxElement).toHaveStyle({
      backgroundColor: '#ff0000',
      borderColor: '#00ff00',
      borderRadius: '8px',
      padding: '16px',
      color: '#0000ff',
      fontSize: '16px'
    });
  });

  it('should display instance name when label is not provided', () => {
    const instanceWithoutLabel: ObjaxInstance = {
      ...mockInstance,
      label: undefined
    };

    render(<BoxMorph instance={instanceWithoutLabel} />);
    
    const boxElement = screen.getByText('testBox');
    expect(boxElement).toBeInTheDocument();
  });
});