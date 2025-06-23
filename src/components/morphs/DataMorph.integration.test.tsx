import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CanvasView } from '../CanvasView';
import { useObjaxStore } from '../../stores/objaxStore';
import type { ObjaxInstance } from '../../types';

// Mock the store
vi.mock('../../stores/objaxStore');
const mockStore = {
  instances: [] as ObjaxInstance[],
  addInstance: vi.fn(),
  updateInstance: vi.fn(),
  removeInstance: vi.fn(),
  pages: [{ name: 'TestPage' }],
  classes: [],
  states: [],
  currentPage: 'TestPage',
  setCurrentPage: vi.fn(),
  objaxEngine: {
    parseObjax: vi.fn(),
  },
  undo: vi.fn(),
  canUndo: vi.fn().mockReturnValue(false),
  saveToHistory: vi.fn(),
  getObjaxEngine: vi.fn(),
};

describe('DataMorph Integration', () => {
  beforeEach(() => {
    vi.mocked(useObjaxStore).mockReturnValue(mockStore as any);
    mockStore.instances = [];
  });

  it('should include DataMorph in UI Morphs filter', () => {
    const dataMorphInstance: ObjaxInstance = {
      id: 'test-datamorph-1',
      name: 'testData',
      className: 'DataMorph',
      page: 'TestPage',
      label: 'テストデータ',
      record: {
        name: 'Test Record',
        value: 42
      },
      displayFields: ['name', 'value']
    };

    mockStore.instances = [dataMorphInstance];

    render(<CanvasView pageName="TestPage" />);

    // DataMorph should be visible on canvas since it's included in UI Morphs
    expect(screen.getByText('テストデータ')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Record')).toBeInTheDocument();
    expect(screen.getByDisplayValue('42')).toBeInTheDocument();
  });

  it('should not show DataMorph if isOpen is false', () => {
    const hiddenDataMorphInstance: ObjaxInstance = {
      id: 'test-datamorph-2',
      name: 'hiddenData',
      className: 'DataMorph',
      page: 'TestPage',
      label: 'Hidden Data',
      record: {
        secret: 'Should not show'
      },
      displayFields: ['secret'],
      isOpen: false // Explicitly hidden
    };

    mockStore.instances = [hiddenDataMorphInstance];

    render(<CanvasView pageName="TestPage" />);

    // DataMorph should be hidden when isOpen is false
    expect(screen.queryByText('Hidden Data')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('Should not show')).not.toBeInTheDocument();
  });

  it('should handle DataMorph with empty record', () => {
    const emptyDataMorphInstance: ObjaxInstance = {
      id: 'test-datamorph-3',
      name: 'emptyData',
      className: 'DataMorph',
      page: 'TestPage',
      label: 'Empty Data',
      record: {},
      displayFields: []
    };

    mockStore.instances = [emptyDataMorphInstance];

    render(<CanvasView pageName="TestPage" />);

    // DataMorph should show "No fields to display" message
    expect(screen.getByText('Empty Data')).toBeInTheDocument();
    expect(screen.getByText('No fields to display')).toBeInTheDocument();
  });
});