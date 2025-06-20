import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Halo } from './Halo';

describe('Halo', () => {
  const mockTargetRect = new DOMRect(100, 100, 150, 50);
  const mockProps = {
    targetRect: mockTargetRect,
    onDelete: vi.fn(),
    onClose: vi.fn(),
    onInspect: vi.fn(),
    onMessage: vi.fn(),
    onResizeStart: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders halo with correct handles', () => {
    render(<Halo {...mockProps} />);
    
    // Check that all handles are rendered
    expect(screen.getByTitle('削除')).toBeInTheDocument();
    expect(screen.getByTitle('ハローを閉じる')).toBeInTheDocument();
    expect(screen.getByTitle('インスペクト')).toBeInTheDocument();
    expect(screen.getByTitle('メッセージ')).toBeInTheDocument();
    expect(screen.getByTitle('リサイズ')).toBeInTheDocument();
  });

  it('calls onDelete when delete handle is clicked', () => {
    render(<Halo {...mockProps} />);
    
    const deleteHandle = screen.getByTitle('削除');
    fireEvent.click(deleteHandle);
    
    expect(mockProps.onDelete).toHaveBeenCalled();
  });

  it('calls onClose when close handle is clicked', () => {
    render(<Halo {...mockProps} />);
    
    const closeHandle = screen.getByTitle('ハローを閉じる');
    fireEvent.click(closeHandle);
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('calls onInspect when inspect handle is clicked', () => {
    render(<Halo {...mockProps} />);
    
    const inspectHandle = screen.getByTitle('インスペクト');
    fireEvent.click(inspectHandle);
    
    expect(mockProps.onInspect).toHaveBeenCalled();
  });

  it('calls onMessage when message handle is clicked', () => {
    render(<Halo {...mockProps} />);
    
    const messageHandle = screen.getByTitle('メッセージ');
    fireEvent.click(messageHandle);
    
    expect(mockProps.onMessage).toHaveBeenCalled();
  });

  it('calls onResizeStart when resize handle is mouse down', () => {
    render(<Halo {...mockProps} />);
    
    const resizeHandle = screen.getByTitle('リサイズ');
    fireEvent.mouseDown(resizeHandle);
    
    expect(mockProps.onResizeStart).toHaveBeenCalled();
  });

  it('positions halo border correctly based on target rect', () => {
    render(<Halo {...mockProps} />);
    
    const haloBorder = document.querySelector('.halo-border');
    expect(haloBorder).toHaveStyle({
      left: '92px', // 100 - 8 (haloOffset)
      top: '92px',  // 100 - 8 (haloOffset)
      width: '166px', // 150 + 16 (haloOffset * 2)
      height: '66px',  // 50 + 16 (haloOffset * 2)
    });
  });

  it('positions handles correctly around the target rect', () => {
    render(<Halo {...mockProps} />);
    
    // Check handle positions (handles are positioned at corners)
    const deleteHandle = screen.getByTitle('削除');
    const closeHandle = screen.getByTitle('ハローを閉じる');
    const inspectHandle = screen.getByTitle('インスペクト');
    const resizeHandle = screen.getByTitle('リサイズ');
    
    // Verify handles have correct positioning styles
    expect(deleteHandle).toHaveStyle({ position: 'absolute' });
    expect(closeHandle).toHaveStyle({ position: 'absolute' });
    expect(inspectHandle).toHaveStyle({ position: 'absolute' });
    expect(resizeHandle).toHaveStyle({ position: 'absolute' });
  });

  it('has correct handle labels', () => {
    render(<Halo {...mockProps} />);
    
    expect(screen.getByText('D')).toBeInTheDocument(); // Delete
    expect(screen.getByText('C')).toBeInTheDocument(); // Close
    expect(screen.getByText('I')).toBeInTheDocument(); // Inspect
    expect(screen.getByText('M')).toBeInTheDocument(); // Message
    expect(screen.getByText('↗')).toBeInTheDocument(); // Resize
  });

  it('has correct cursor styles for handles', () => {
    render(<Halo {...mockProps} />);
    
    const deleteHandle = screen.getByTitle('削除');
    const closeHandle = screen.getByTitle('ハローを閉じる');
    const inspectHandle = screen.getByTitle('インスペクト');
    const resizeHandle = screen.getByTitle('リサイズ');
    
    expect(deleteHandle).toHaveStyle({ cursor: 'pointer' });
    expect(closeHandle).toHaveStyle({ cursor: 'pointer' });
    expect(inspectHandle).toHaveStyle({ cursor: 'pointer' });
    expect(resizeHandle).toHaveStyle({ cursor: 'nw-resize' });
  });
});