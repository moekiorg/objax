import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GroupMorph } from './GroupMorph';
import { ButtonMorph } from './ButtonMorph';

describe('GroupMorph', () => {
  it('should render a group with children', () => {
    render(
      <GroupMorph label="Controls">
        <ButtonMorph label="Submit" onClick={() => {}} />
        <ButtonMorph label="Cancel" onClick={() => {}} />
      </GroupMorph>
    );
    
    expect(screen.getByText('Controls')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should apply layout styles based on props', () => {
    render(
      <GroupMorph 
        label="Layout Test"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        gap="16px"
      >
        <ButtonMorph label="Button 1" onClick={() => {}} />
        <ButtonMorph label="Button 2" onClick={() => {}} />
      </GroupMorph>
    );
    
    const content = screen.getByTestId('group-morph-content');
    expect(content).toHaveStyle({
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px'
    });
  });

  it('should render with layout properties for @dnd-kit integration', () => {
    render(
      <GroupMorph 
        label="Layout Group"
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        gap="20px"
        padding="16px"
      >
        <div>Child content</div>
      </GroupMorph>
    );
    
    const content = screen.getByTestId('group-morph-content');
    expect(content).toHaveStyle({
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center', 
      justifyContent: 'center',
      gap: '20px',
      padding: '16px'
    });
  });

  it('should accept drop from New UI Instance', () => {
    const mockOnDrop = vi.fn();
    
    render(
      <GroupMorph 
        label="Drop Zone"
        acceptDrops={true}
        onDrop={mockOnDrop}
      >
        <div>Existing content</div>
      </GroupMorph>
    );
    
    const dropZone = screen.getByTestId('group-morph-drop-zone');
    
    // Simulate drop of new UI instance
    fireEvent.drop(dropZone, {
      dataTransfer: {
        getData: () => JSON.stringify({
          type: 'new-ui-instance',
          className: 'ButtonMorph',
          defaultProps: { label: 'New Button' }
        })
      }
    });
    
    expect(mockOnDrop).toHaveBeenCalledWith({
      type: 'new-ui-instance',
      className: 'ButtonMorph',
      defaultProps: { label: 'New Button' }
    });
  });
});