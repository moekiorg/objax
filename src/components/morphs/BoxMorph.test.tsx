import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BoxMorph } from './BoxMorph';
import type { ObjaxInstance } from '../../types';

describe('BoxMorph', () => {
  it('should render a box with default styling', () => {
    const mockInstance: ObjaxInstance = {
      id: 'test-box-1',
      name: 'testBox',
      className: 'BoxMorph',
      page: 'testPage',
      label: 'Test Box',
    };
    
    render(<BoxMorph instance={mockInstance} />);
    
    const box = screen.getByText('Test Box');
    expect(box).toBeInTheDocument();
    expect(box).toHaveClass('box-morph');
  });

  it('should apply custom styling from instance properties', () => {
    const mockInstance: ObjaxInstance = {
      id: 'test-box-2',
      name: 'styledBox',
      className: 'BoxMorph',
      page: 'testPage',
      label: 'Styled Box',
      backgroundColor: '#ff0000',
      borderColor: '#0000ff',
      borderWidth: '2px',
      borderRadius: '8px',
      padding: '20px',
      textColor: '#ffffff',
      fontSize: '16px',
      fontWeight: 'bold',
      textAlign: 'center',
    };
    
    render(<BoxMorph instance={mockInstance} />);
    
    const box = screen.getByText('Styled Box');
    expect(box).toBeInTheDocument();
    
    // Check if custom styles are applied
    const computedStyle = window.getComputedStyle(box);
    expect(computedStyle.backgroundColor).toBe('rgb(255, 0, 0)'); // #ff0000
    expect(computedStyle.borderColor).toBe('rgb(0, 0, 255)'); // #0000ff
    expect(computedStyle.borderWidth).toBe('2px');
    expect(computedStyle.borderRadius).toBe('8px');
    expect(computedStyle.padding).toBe('20px');
    expect(computedStyle.color).toBe('rgb(255, 255, 255)'); // #ffffff
    expect(computedStyle.fontSize).toBe('16px');
    expect(computedStyle.fontWeight).toBe('bold');
    expect(computedStyle.textAlign).toBe('center');
  });

  it('should fallback to instance name when label is not provided', () => {
    const mockInstance: ObjaxInstance = {
      id: 'test-box-3',
      name: 'noLabelBox',
      className: 'BoxMorph',
      page: 'testPage',
    };
    
    render(<BoxMorph instance={mockInstance} />);
    
    const box = screen.getByText('noLabelBox');
    expect(box).toBeInTheDocument();
  });

  it('should have minimum dimensions', () => {
    const mockInstance: ObjaxInstance = {
      id: 'test-box-4',
      name: 'minSizeBox',
      className: 'BoxMorph',
      page: 'testPage',
      label: 'Min Size',
    };
    
    render(<BoxMorph instance={mockInstance} />);
    
    const box = screen.getByText('Min Size');
    const computedStyle = window.getComputedStyle(box);
    expect(computedStyle.minWidth).toBe('50px');
    expect(computedStyle.minHeight).toBe('20px');
  });

  it('should handle numeric width/height values by adding px unit', () => {
    const mockInstance: ObjaxInstance = {
      id: 'test-box-5',
      name: 'numericSizeBox',
      className: 'BoxMorph',
      page: 'testPage',
      label: 'Numeric Size',
      width: '500',  // 数値文字列（pxなし）
      height: '300', // 数値文字列（pxなし）
    };
    
    render(<BoxMorph instance={mockInstance} />);
    
    const box = screen.getByText('Numeric Size');
    const computedStyle = window.getComputedStyle(box);
    expect(computedStyle.width).toBe('500px');
    expect(computedStyle.height).toBe('300px');
  });

  it('should handle width/height values with existing units', () => {
    const mockInstance: ObjaxInstance = {
      id: 'test-box-6',
      name: 'unitSizeBox',
      className: 'BoxMorph',
      page: 'testPage',
      label: 'Unit Size',
      width: '50%',   // 既に単位付き
      height: '10em', // 既に単位付き
    };
    
    render(<BoxMorph instance={mockInstance} />);
    
    const box = screen.getByText('Unit Size');
    const computedStyle = window.getComputedStyle(box);
    expect(computedStyle.width).toBe('50%');
    expect(computedStyle.height).toBe('10em');
  });
});