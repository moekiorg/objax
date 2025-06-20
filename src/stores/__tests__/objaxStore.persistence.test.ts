import { describe, it, expect, beforeEach } from 'vitest';
import { useObjaxStore } from '../objaxStore';
import type { ObjaxInstance } from '../../types';

describe('ObjaxStore - Persistence', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    
    // Reset store state before each test
    useObjaxStore.setState({
      pages: [],
      states: [],
      instances: [],
      classes: [],
      currentPage: null,
      showPlayground: false,
      history: [],
      historyIndex: -1,
    });
  });

  it('should persist instances but not history', () => {
    const store = useObjaxStore.getState();
    
    const testInstance: ObjaxInstance = {
      id: 'test-1',
      name: 'testButton',
      className: 'ButtonMorph',
      page: 'TestPage',
      type: 'ButtonMorph',
      label: 'Test Button'
    };

    // Add instance (this will create history)
    store.addInstance(testInstance);
    
    const stateAfterAdd = useObjaxStore.getState();
    expect(stateAfterAdd.instances).toHaveLength(1);
    expect(stateAfterAdd.history).toHaveLength(1);
    expect(stateAfterAdd.historyIndex).toBe(0);

    // Simulate page reload by getting persisted state
    const persistedKeys = Object.keys(localStorage);
    expect(persistedKeys.length).toBeGreaterThan(0);
    
    // Check what's actually stored in localStorage
    const storedData = JSON.parse(localStorage.getItem('objax-store') || '{}');
    
    // Should include instances
    expect(storedData.state.instances).toHaveLength(1);
    expect(storedData.state.instances[0].id).toBe('test-1');
    
    // Should NOT include history or historyIndex
    expect(storedData.state.history).toBeUndefined();
    expect(storedData.state.historyIndex).toBeUndefined();
  });

  it('should restore instances correctly after page reload simulation', () => {
    const store = useObjaxStore.getState();
    
    const testInstance: ObjaxInstance = {
      id: 'test-1',
      name: 'testButton',
      className: 'ButtonMorph',
      page: 'TestPage',
      type: 'ButtonMorph',
      label: 'Test Button'
    };

    // Add instance
    store.addInstance(testInstance);
    
    // Simulate page reload by creating a new store instance with persisted data
    const persistedData = JSON.parse(localStorage.getItem('objax-store') || '{}');
    
    // Reset store with fresh initial state
    useObjaxStore.setState({
      pages: [],
      states: [],
      instances: [],
      classes: [],
      currentPage: null,
      showPlayground: false,
      history: [],
      historyIndex: -1,
    });
    
    // Apply persisted state (simulating what Zustand persist does)
    useObjaxStore.setState({
      ...persistedData.state,
      // Ensure history starts fresh
      history: [],
      historyIndex: -1,
    });
    
    const restoredState = useObjaxStore.getState();
    
    // Instance should be restored
    expect(restoredState.instances).toHaveLength(1);
    expect(restoredState.instances[0].id).toBe('test-1');
    
    // History should be fresh
    expect(restoredState.history).toHaveLength(0);
    expect(restoredState.historyIndex).toBe(-1);
    
    // Should be able to undo (should return false)
    expect(store.canUndo()).toBe(false);
  });

  it('should handle adding instances after page reload', () => {
    const store = useObjaxStore.getState();
    
    // Add first instance
    const instance1: ObjaxInstance = {
      id: 'test-1',
      name: 'button1',
      className: 'ButtonMorph',
      page: 'TestPage',
      type: 'ButtonMorph',
      label: 'Button 1'
    };
    
    store.addInstance(instance1);
    
    // Simulate page reload
    const persistedData = JSON.parse(localStorage.getItem('objax-store') || '{}');
    useObjaxStore.setState({
      ...persistedData.state,
      history: [],
      historyIndex: -1,
    });
    
    // Add second instance after reload
    const instance2: ObjaxInstance = {
      id: 'test-2',
      name: 'button2',
      className: 'ButtonMorph',
      page: 'TestPage',
      type: 'ButtonMorph',
      label: 'Button 2'
    };
    
    const newStore = useObjaxStore.getState();
    newStore.addInstance(instance2);
    
    const finalState = useObjaxStore.getState();
    
    // Should have both instances
    expect(finalState.instances).toHaveLength(2);
    expect(finalState.instances.find(i => i.id === 'test-1')).toBeDefined();
    expect(finalState.instances.find(i => i.id === 'test-2')).toBeDefined();
    
    // Should have history for the second addition
    expect(finalState.history).toHaveLength(1);
    expect(finalState.historyIndex).toBe(0);
    
    // Should be able to undo the second addition
    expect(newStore.canUndo()).toBe(true);
    
    newStore.undo();
    const undoneState = useObjaxStore.getState();
    
    // Should only have the first instance after undo
    expect(undoneState.instances).toHaveLength(1);
    expect(undoneState.instances[0].id).toBe('test-1');
  });
});