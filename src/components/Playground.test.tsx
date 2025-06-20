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
      target: { value: 'define Task\nTask has field "title"\nmyTask is a new Task' }
    });
    
    fireEvent.click(runButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Executed successfully/)).toBeInTheDocument();
      expect(screen.getByText(/Classes: 1/)).toBeInTheDocument();
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
      expect(screen.getByText(/Unknown statement/)).toBeInTheDocument();
    });
  });
});