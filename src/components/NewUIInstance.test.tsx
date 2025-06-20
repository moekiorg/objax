import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NewUIInstance } from './NewUIInstance';

describe('NewUIInstance', () => {
  beforeEach(() => {
    // Reset any global state if needed
  });

  it('should render UI morphs list', () => {
    render(<NewUIInstance />);
    
    expect(screen.getByText('ButtonMorph')).toBeInTheDocument();
    expect(screen.getByText('FieldMorph')).toBeInTheDocument();
    expect(screen.getByText('ListMorph')).toBeInTheDocument();
    expect(screen.getByText('GroupMorph')).toBeInTheDocument();
  });

  it('should show drag instructions', () => {
    render(<NewUIInstance />);
    
    expect(screen.getByText(/キャンバスにドラッグ/i)).toBeInTheDocument();
  });

  it('should make UI morphs draggable', () => {
    render(<NewUIInstance />);
    
    const buttonMorph = screen.getByTestId('ui-morph-ButtonMorph');
    expect(buttonMorph).toHaveAttribute('draggable', 'true');
  });
});