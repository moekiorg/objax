import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Playground } from './Playground';

describe('Playground', () => {
  beforeEach(() => {
    // Reset any global state if needed
  });

  it('should render playground interface', () => {
    render(<Playground />);
    
    expect(screen.getByText('Objax Playground')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter Objax code/)).toBeInTheDocument();
    expect(screen.getByText('Run')).toBeInTheDocument();
  });

  it('should execute valid Objax code', async () => {
    render(<Playground />);
    
    const textarea = screen.getByPlaceholderText(/Enter Objax code/);
    const runButton = screen.getByText('Run');
    
    fireEvent.change(textarea, {
      target: { value: 'Task is a Class\nTask has field "title"\nmyTask is a Task' }
    });
    
    fireEvent.click(runButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Executed successfully/)).toBeInTheDocument();
      expect(screen.getByText(/New Classes: 7/)).toBeInTheDocument();
      expect(screen.getByText(/Instances: 1/)).toBeInTheDocument();
    });
  });

  it('should show error for invalid code', async () => {
    render(<Playground />);
    
    const textarea = screen.getByPlaceholderText(/Enter Objax code/);
    const runButton = screen.getByText('Run');
    
    fireEvent.change(textarea, {
      target: { value: 'invalid objax code' }
    });
    
    fireEvent.click(runButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Error executing method call: Instance "invalid" not found/)).toBeInTheDocument();
    });
  });
});