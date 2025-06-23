import { describe, it, expect, beforeEach } from 'vitest';
import { useObjaxStore } from '../objaxStore';
import type { ObjaxInstance } from '../../types';

describe('ObjaxStore - Undo Functionality', () => {
  beforeEach(() => {
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

  it('should save state to history when adding an instance', () => {
    const store = useObjaxStore.getState();
    const testInstance: ObjaxInstance = {
      id: 'test-1',
      name: 'testButton',
      className: 'ButtonMorph',
      page: 'TestPage',
      type: 'ButtonMorph',
      label: 'Test Button'
    };

    // Add first instance
    store.addInstance(testInstance);
    
    const state = useObjaxStore.getState();
    expect(state.instances).toHaveLength(1);
    expect(state.history).toHaveLength(1);
    expect(state.historyIndex).toBe(0);
    expect(state.history[0].instances).toHaveLength(0); // Previous state was empty
  });

  it('should undo instance addition', () => {
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
    expect(useObjaxStore.getState().instances).toHaveLength(1);
    
    // Undo
    store.undo();
    
    const state = useObjaxStore.getState();
    expect(state.instances).toHaveLength(0);
    expect(state.historyIndex).toBe(-1);
  });

  it('should save state to history when removing an instance', () => {
    const store = useObjaxStore.getState();
    const testInstance: ObjaxInstance = {
      id: 'test-1',
      name: 'testButton',
      className: 'ButtonMorph',
      page: 'TestPage',
      type: 'ButtonMorph',
      label: 'Test Button'
    };

    // Manually add instance without history
    useObjaxStore.setState({ instances: [testInstance] });
    
    // Remove instance (this should save history)
    store.removeInstance('test-1');
    
    const state = useObjaxStore.getState();
    expect(state.instances).toHaveLength(0);
    expect(state.history).toHaveLength(1);
    expect(state.history[0].instances).toHaveLength(1); // Previous state had 1 instance
  });

  it('should undo instance removal', () => {
    const store = useObjaxStore.getState();
    const testInstance: ObjaxInstance = {
      id: 'test-1',
      name: 'testButton',
      className: 'ButtonMorph',
      page: 'TestPage',
      type: 'ButtonMorph',
      label: 'Test Button'
    };

    // Manually add instance without history
    useObjaxStore.setState({ instances: [testInstance] });
    
    // Remove instance
    store.removeInstance('test-1');
    expect(useObjaxStore.getState().instances).toHaveLength(0);
    
    // Undo
    store.undo();
    
    const state = useObjaxStore.getState();
    expect(state.instances).toHaveLength(1);
    expect(state.instances[0].id).toBe('test-1');
  });

  it('should save state to history when updating an instance', () => {
    const store = useObjaxStore.getState();
    const testInstance: ObjaxInstance = {
      id: 'test-1',
      name: 'testButton',
      className: 'ButtonMorph',
      page: 'TestPage',
      type: 'ButtonMorph',
      label: 'Original Label'
    };

    // Manually add instance without history
    useObjaxStore.setState({ instances: [testInstance] });
    
    // Update instance (this should save history)
    store.updateInstance('test-1', { label: 'Updated Label' });
    
    const state = useObjaxStore.getState();
    expect(state.instances[0].label).toBe('Updated Label');
    expect(state.history).toHaveLength(1);
    expect(state.history[0].instances[0].label).toBe('Original Label');
  });

  it('should undo instance update', () => {
    const store = useObjaxStore.getState();
    const testInstance: ObjaxInstance = {
      id: 'test-1',
      name: 'testButton',
      className: 'ButtonMorph',
      page: 'TestPage',
      type: 'ButtonMorph',
      label: 'Original Label'
    };

    // Manually add instance without history
    useObjaxStore.setState({ instances: [testInstance] });
    
    // Update instance
    store.updateInstance('test-1', { label: 'Updated Label' });
    expect(useObjaxStore.getState().instances[0].label).toBe('Updated Label');
    
    // Undo
    store.undo();
    
    const state = useObjaxStore.getState();
    expect(state.instances[0].label).toBe('Original Label');
  });

  it('should handle multiple operations and undo correctly', () => {
    const store = useObjaxStore.getState();
    
    const instance1: ObjaxInstance = {
      id: 'test-1',
      name: 'button1',
      className: 'ButtonMorph',
      page: 'TestPage',
      type: 'ButtonMorph',
      label: 'Button 1'
    };
    
    const instance2: ObjaxInstance = {
      id: 'test-2',
      name: 'button2',
      className: 'ButtonMorph',
      page: 'TestPage',
      type: 'ButtonMorph',
      label: 'Button 2'
    };

    // Add first instance
    store.addInstance(instance1);
    expect(useObjaxStore.getState().instances).toHaveLength(1);
    
    // Add second instance
    store.addInstance(instance2);
    expect(useObjaxStore.getState().instances).toHaveLength(2);
    
    // Update first instance
    store.updateInstance('test-1', { label: 'Updated Button 1' });
    expect(useObjaxStore.getState().instances.find(i => i.id === 'test-1')?.label).toBe('Updated Button 1');
    
    // Remove second instance
    store.removeInstance('test-2');
    expect(useObjaxStore.getState().instances).toHaveLength(1);
    
    // Now undo step by step
    store.undo(); // Should restore instance2
    expect(useObjaxStore.getState().instances).toHaveLength(2);
    
    store.undo(); // Should undo the update to instance1
    expect(useObjaxStore.getState().instances.find(i => i.id === 'test-1')?.label).toBe('Button 1');
    
    store.undo(); // Should remove instance2
    expect(useObjaxStore.getState().instances).toHaveLength(1);
    
    store.undo(); // Should remove instance1
    expect(useObjaxStore.getState().instances).toHaveLength(0);
  });

  it('should not undo when there is no history', () => {
    const store = useObjaxStore.getState();
    
    expect(store.canUndo()).toBe(false);
    
    // Try to undo - should not change anything
    store.undo();
    
    const state = useObjaxStore.getState();
    expect(state.instances).toHaveLength(0);
    expect(state.historyIndex).toBe(-1);
  });

  it('should return correct canUndo status', () => {
    const store = useObjaxStore.getState();
    
    // Initially should not be able to undo
    expect(store.canUndo()).toBe(false);
    
    // Add an instance
    const testInstance: ObjaxInstance = {
      id: 'test-1',
      name: 'testButton',
      className: 'ButtonMorph',
      page: 'TestPage',
      type: 'ButtonMorph',
      label: 'Test Button'
    };
    
    store.addInstance(testInstance);
    
    // Now should be able to undo
    expect(store.canUndo()).toBe(true);
    
    // Undo
    store.undo();
    
    // Should not be able to undo anymore
    expect(store.canUndo()).toBe(false);
  });

  it('should truncate future history when new operation is performed after undo', () => {
    const store = useObjaxStore.getState();
    
    const instance1: ObjaxInstance = {
      id: 'test-1',
      name: 'button1',
      className: 'ButtonMorph',
      page: 'TestPage',
      type: 'ButtonMorph',
      label: 'Button 1'
    };
    
    const instance2: ObjaxInstance = {
      id: 'test-2',
      name: 'button2',
      className: 'ButtonMorph',
      page: 'TestPage',
      type: 'ButtonMorph',
      label: 'Button 2'
    };

    // Add two instances
    store.addInstance(instance1);
    store.addInstance(instance2);
    expect(useObjaxStore.getState().history).toHaveLength(2);
    
    // Undo once
    store.undo();
    expect(useObjaxStore.getState().instances).toHaveLength(1);
    expect(useObjaxStore.getState().historyIndex).toBe(0);
    
    // Add a new instance - this should truncate the future history
    const instance3: ObjaxInstance = {
      id: 'test-3',
      name: 'button3',
      className: 'ButtonMorph',
      page: 'TestPage',
      type: 'ButtonMorph',
      label: 'Button 3'
    };
    
    store.addInstance(instance3);
    
    const state = useObjaxStore.getState();
    expect(state.instances).toHaveLength(2); // instance1 and instance3
    expect(state.history).toHaveLength(2); // Should have truncated at historyIndex + 1
    expect(state.historyIndex).toBe(1);
    
    // Should not be able to get back to the original instance2
    store.undo();
    expect(useObjaxStore.getState().instances).toHaveLength(1);
    expect(useObjaxStore.getState().instances[0].id).toBe('test-1');
  });
});