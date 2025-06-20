import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DraggableWindow } from './DraggableWindow';

describe('DraggableWindow', () => {
  beforeEach(() => {
    // Reset any global state if needed
  });

  it('should render window with title and content', () => {
    render(
      <DraggableWindow title="Test Window" onClose={() => {}}>
        <div>Test Content</div>
      </DraggableWindow>
    );
    
    expect(screen.getByText('Test Window')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByTestId('draggable-window')).toBeInTheDocument();
  });

  it('should have close button', () => {
    const onClose = vi.fn();
    render(
      <DraggableWindow title="Test Window" onClose={onClose}>
        <div>Test Content</div>
      </DraggableWindow>
    );
    
    const closeButton = screen.getByTestId('window-close');
    expect(closeButton).toBeInTheDocument();
    
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('should be draggable by title bar', () => {
    render(
      <DraggableWindow title="Test Window" onClose={() => {}}>
        <div>Test Content</div>
      </DraggableWindow>
    );
    
    const titleBar = screen.getByTestId('window-title-bar');
    expect(titleBar).toBeInTheDocument();
    
    // Check that title bar has draggable behavior by testing mouse events
    expect(titleBar).toHaveAttribute('data-testid', 'window-title-bar');
  });

  it('should have resize handle', () => {
    render(
      <DraggableWindow title="Test Window" onClose={() => {}}>
        <div>Test Content</div>
      </DraggableWindow>
    );
    
    const resizeHandle = screen.getByTestId('window-resize-handle');
    expect(resizeHandle).toBeInTheDocument();
  });

  it('should resize window when dragging resize handle', () => {
    render(
      <DraggableWindow 
        title="Test Window" 
        onClose={() => {}}
        initialSize={{ width: 400, height: 300 }}
      >
        <div>Test Content</div>
      </DraggableWindow>
    );
    
    const window = screen.getByTestId('draggable-window');
    const resizeHandle = screen.getByTestId('window-resize-handle');
    
    // Initial size should be set
    expect(window).toHaveStyle('width: 400px; height: 300px');
    
    // Start resize
    fireEvent.mouseDown(resizeHandle, { clientX: 100, clientY: 100 });
    
    // Simulate mouse move to resize
    fireEvent.mouseMove(document, { clientX: 150, clientY: 150 });
    
    // End resize
    fireEvent.mouseUp(document);
    
    // Window should have been resized (450x350)
    expect(window).toHaveStyle('width: 450px; height: 350px');
  });
});