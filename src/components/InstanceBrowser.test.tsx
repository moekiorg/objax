import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InstanceBrowser } from './InstanceBrowser';

describe('InstanceBrowser', () => {
  beforeEach(() => {
    // Reset any global state if needed
  });

  it('should render instance list for current page', () => {
    const instances = [
      { 
        id: '1', 
        name: 'button1', 
        className: 'ButtonMorph',
        page: 'TestPage',
        label: 'Click Me'
      },
      { 
        id: '2', 
        name: 'field1', 
        className: 'FieldMorph',
        page: 'TestPage',
        value: 'Hello'
      }
    ];

    render(<InstanceBrowser pageName="TestPage" instances={instances} />);
    
    expect(screen.getByText('button1')).toBeInTheDocument();
    expect(screen.getByText('field1')).toBeInTheDocument();
    expect(screen.getByText('ButtonMorph')).toBeInTheDocument();
    expect(screen.getByText('FieldMorph')).toBeInTheDocument();
  });

  it('should show empty message when no instances', () => {
    render(<InstanceBrowser pageName="TestPage" instances={[]} />);
    
    expect(screen.getByText('このページにインスタンスはありません')).toBeInTheDocument();
  });

  it('should filter instances by page', () => {
    const instances = [
      { 
        id: '1', 
        name: 'button1', 
        className: 'ButtonMorph',
        page: 'TestPage',
        label: 'Click Me'
      },
      { 
        id: '2', 
        name: 'button2', 
        className: 'ButtonMorph',
        page: 'OtherPage',
        label: 'Other Button'
      }
    ];

    render(<InstanceBrowser pageName="TestPage" instances={instances} />);
    
    expect(screen.getByText('button1')).toBeInTheDocument();
    expect(screen.queryByText('button2')).not.toBeInTheDocument();
  });

  it('should render inspect and message buttons for each instance', () => {
    const instances = [
      { 
        id: '1', 
        name: 'button1', 
        className: 'ButtonMorph',
        page: 'TestPage',
        label: 'Click Me'
      },
      { 
        id: '2', 
        name: 'field1', 
        className: 'FieldMorph',
        page: 'TestPage',
        value: 'Hello'
      }
    ];

    render(<InstanceBrowser pageName="TestPage" instances={instances} />);
    
    const inspectButtons = screen.getAllByText('Inspect');
    const messageButtons = screen.getAllByText('Message');
    expect(inspectButtons).toHaveLength(2);
    expect(messageButtons).toHaveLength(2);
  });

  it('should call onInspect when inspect button is clicked', () => {
    const mockOnInspect = vi.fn();
    const instances = [
      { 
        id: '1', 
        name: 'button1', 
        className: 'ButtonMorph',
        page: 'TestPage',
        label: 'Click Me'
      }
    ];

    render(<InstanceBrowser pageName="TestPage" instances={instances} onInspect={mockOnInspect} />);
    
    const inspectButton = screen.getByText('Inspect');
    fireEvent.click(inspectButton);
    
    expect(mockOnInspect).toHaveBeenCalledWith(instances[0]);
  });

  it('should not call onInspect when no callback is provided', () => {
    const instances = [
      { 
        id: '1', 
        name: 'button1', 
        className: 'ButtonMorph',
        page: 'TestPage',
        label: 'Click Me'
      }
    ];

    // Should not throw when onInspect is not provided
    render(<InstanceBrowser pageName="TestPage" instances={instances} />);
    
    const inspectButton = screen.getByText('Inspect');
    fireEvent.click(inspectButton);
    
    // Should not crash
    expect(inspectButton).toBeInTheDocument();
  });

  it('should render message button for each instance', () => {
    const instances = [
      { 
        id: '1', 
        name: 'button1', 
        className: 'ButtonMorph',
        page: 'TestPage',
        label: 'Click Me'
      },
      { 
        id: '2', 
        name: 'field1', 
        className: 'FieldMorph',
        page: 'TestPage',
        value: 'Hello'
      }
    ];

    render(<InstanceBrowser pageName="TestPage" instances={instances} />);
    
    const messageButtons = screen.getAllByText('Message');
    expect(messageButtons).toHaveLength(2);
  });

  it('should call onMessage when message button is clicked', () => {
    const mockOnMessage = vi.fn();
    const instances = [
      { 
        id: '1', 
        name: 'button1', 
        className: 'ButtonMorph',
        page: 'TestPage',
        label: 'Click Me'
      }
    ];

    render(<InstanceBrowser pageName="TestPage" instances={instances} onMessage={mockOnMessage} />);
    
    const messageButton = screen.getByText('Message');
    fireEvent.click(messageButton);
    
    expect(mockOnMessage).toHaveBeenCalledWith(instances[0]);
  });
});