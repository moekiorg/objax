import { describe, it, expect } from 'vitest';
import { LinearObjaxParser } from '../linearParser';
import { ObjaxExecutor } from '../executor';

describe('Remove Method Functionality', () => {
  it('should parse instanceName remove correctly', () => {
    const parser = new LinearObjaxParser();
    const code = `
Task is a Class
Task has field "title"
myTask is a Task
myTask remove
    `;

    const result = parser.parse(code);

    expect(result.errors).toHaveLength(0);
    expect(result.classes).toHaveLength(1);
    expect(result.instances).toHaveLength(1);
    expect(result.methodCalls).toHaveLength(1);

    const methodCall = result.methodCalls[0];
    expect(methodCall.methodName).toBe('remove');
    expect(methodCall.instanceName).toBe('myTask');
  });

  it('should execute remove method and set isOpen to false', () => {
    const parser = new LinearObjaxParser();
    const executor = new ObjaxExecutor();
    
    const code = `
Task is a Class
Task has field "title"
myTask is a Task
myTask open
myTask remove
    `;

    const parseResult = parser.parse(code);
    const executionResult = executor.execute(parseResult);

    expect(executionResult.errors).toHaveLength(0);
    expect(executionResult.instances).toHaveLength(1);

    const instance = executionResult.instances[0];
    expect(instance.name).toBe('myTask');
    expect(instance.properties.isOpen).toBe(false);
  });

  it('should handle remove on non-existent instance', () => {
    const parser = new LinearObjaxParser();
    const executor = new ObjaxExecutor();
    
    const code = `
nonExistentTask remove
    `;

    const parseResult = parser.parse(code);
    const executionResult = executor.execute(parseResult);

    expect(executionResult.errors).toHaveLength(1);
    expect(executionResult.errors[0]).toContain('Instance "nonExistentTask" not found');
  });

  it('should allow removing multiple instances', () => {
    const parser = new LinearObjaxParser();
    const executor = new ObjaxExecutor();
    
    const code = `
Task is a Class
Task has field "title"
task1 is a Task
task2 is a Task
task3 is a Task
task1 open
task2 open
task3 open
task1 remove
task3 remove
    `;

    const parseResult = parser.parse(code);
    const executionResult = executor.execute(parseResult);

    expect(executionResult.errors).toHaveLength(0);
    expect(executionResult.instances).toHaveLength(3);

    const task1 = executionResult.instances.find(i => i.name === 'task1');
    const task2 = executionResult.instances.find(i => i.name === 'task2');
    const task3 = executionResult.instances.find(i => i.name === 'task3');

    expect(task1?.properties.isOpen).toBe(false);
    expect(task2?.properties.isOpen).toBe(true);
    expect(task3?.properties.isOpen).toBe(false);
  });

  it('should work with UI Morphs and custom classes', () => {
    const parser = new LinearObjaxParser();
    const executor = new ObjaxExecutor();
    
    const code = `
TaskList is a Class
TaskList has field "items"
myButton is a ButtonMorph
myTaskList is a TaskList
myTaskList open
myTaskList remove
    `;

    const parseResult = parser.parse(code);
    const executionResult = executor.execute(parseResult);

    expect(executionResult.errors).toHaveLength(0);
    expect(executionResult.instances).toHaveLength(2);

    const buttonInstance = executionResult.instances.find(i => i.name === 'myButton');
    const taskListInstance = executionResult.instances.find(i => i.name === 'myTaskList');

    // ButtonMorph should not have isOpen set (not removed)
    expect(buttonInstance?.properties.isOpen).toBeUndefined();
    // TaskList should have isOpen set to false after remove
    expect(taskListInstance?.properties.isOpen).toBe(false);
  });

  it('should allow UI Morphs to be removed from canvas', () => {
    const parser = new LinearObjaxParser();
    const executor = new ObjaxExecutor();
    
    const code = `
myButton is a ButtonMorph
myField is a FieldMorph
myList is a ListMorph
myButton remove
myList remove
    `;

    const parseResult = parser.parse(code);
    const executionResult = executor.execute(parseResult);

    expect(executionResult.errors).toHaveLength(0);
    expect(executionResult.instances).toHaveLength(3);

    const buttonInstance = executionResult.instances.find(i => i.name === 'myButton');
    const fieldInstance = executionResult.instances.find(i => i.name === 'myField');
    const listInstance = executionResult.instances.find(i => i.name === 'myList');

    // UI Morphs should have isOpen set to false after remove
    expect(buttonInstance?.properties.isOpen).toBe(false);
    expect(fieldInstance?.properties.isOpen).toBeUndefined(); // Not removed, so no isOpen set
    expect(listInstance?.properties.isOpen).toBe(false);
  });

  it('should allow remove on instance that was never opened', () => {
    const parser = new LinearObjaxParser();
    const executor = new ObjaxExecutor();
    
    const code = `
Task is a Class
Task has field "title"
myTask is a Task
myTask remove
    `;

    const parseResult = parser.parse(code);
    const executionResult = executor.execute(parseResult);

    expect(executionResult.errors).toHaveLength(0);
    expect(executionResult.instances).toHaveLength(1);

    const instance = executionResult.instances[0];
    expect(instance.name).toBe('myTask');
    expect(instance.properties.isOpen).toBe(false);
  });
});