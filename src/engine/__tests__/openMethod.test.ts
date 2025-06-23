import { describe, it, expect } from 'vitest';
import { LinearObjaxParser } from '../linearParser';
import { ObjaxExecutor } from '../executor';

describe('Open Method Functionality', () => {
  it('should parse myTask open correctly', () => {
    const parser = new LinearObjaxParser();
    const code = `
Task is a Class
Task has field "title"
myTask is a Task
myTask open
    `;

    const result = parser.parse(code);

    expect(result.errors).toHaveLength(0);
    expect(result.classes).toHaveLength(1);
    expect(result.instances).toHaveLength(1);
    expect(result.methodCalls).toHaveLength(1);

    const methodCall = result.methodCalls[0];
    expect(methodCall.methodName).toBe('open');
    expect(methodCall.instanceName).toBe('myTask');
  });

  it('should execute open method and set isOpen property', () => {
    const parser = new LinearObjaxParser();
    const executor = new ObjaxExecutor();
    
    const code = `
Task is a Class
Task has field "title"
myTask is a Task
myTask open
    `;

    const parseResult = parser.parse(code);
    const executionResult = executor.execute(parseResult);

    expect(executionResult.errors).toHaveLength(0);
    expect(executionResult.instances).toHaveLength(1);

    const instance = executionResult.instances[0];
    expect(instance.name).toBe('myTask');
    expect(instance.properties.isOpen).toBe(true);
  });

  it('should handle multiple instances with open', () => {
    const parser = new LinearObjaxParser();
    const executor = new ObjaxExecutor();
    
    const code = `
Task is a Class
Task has field "title"
task1 is a Task
task2 is a Task
task1 open
    `;

    const parseResult = parser.parse(code);
    const executionResult = executor.execute(parseResult);

    expect(executionResult.errors).toHaveLength(0);
    expect(executionResult.instances).toHaveLength(2);

    const openInstance = executionResult.instances.find(i => i.name === 'task1');
    const closedInstance = executionResult.instances.find(i => i.name === 'task2');

    expect(openInstance?.properties.isOpen).toBe(true);
    expect(closedInstance?.properties.isOpen).toBeUndefined();
  });

  it('should handle open method on non-existent instance', () => {
    const parser = new LinearObjaxParser();
    const executor = new ObjaxExecutor();
    
    const code = `
nonExistentTask open
    `;

    const parseResult = parser.parse(code);
    const executionResult = executor.execute(parseResult);

    expect(executionResult.errors).toHaveLength(1);
    expect(executionResult.errors[0]).toContain('Instance "nonExistentTask" not found');
  });

  it('should allow opening multiple instances', () => {
    const parser = new LinearObjaxParser();
    const executor = new ObjaxExecutor();
    
    const code = `
Task is a Class
Task has field "title"
task1 is a Task
task2 is a Task
task3 is a Task
task1 open
task3 open
    `;

    const parseResult = parser.parse(code);
    const executionResult = executor.execute(parseResult);

    expect(executionResult.errors).toHaveLength(0);
    expect(executionResult.instances).toHaveLength(3);

    const task1 = executionResult.instances.find(i => i.name === 'task1');
    const task2 = executionResult.instances.find(i => i.name === 'task2');
    const task3 = executionResult.instances.find(i => i.name === 'task3');

    expect(task1?.properties.isOpen).toBe(true);
    expect(task2?.properties.isOpen).toBeUndefined();
    expect(task3?.properties.isOpen).toBe(true);
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
    `;

    const parseResult = parser.parse(code);
    const executionResult = executor.execute(parseResult);

    expect(executionResult.errors).toHaveLength(0);
    expect(executionResult.instances).toHaveLength(2);

    const buttonInstance = executionResult.instances.find(i => i.name === 'myButton');
    const taskListInstance = executionResult.instances.find(i => i.name === 'myTaskList');

    // ButtonMorph should not have isOpen set (not explicitly opened)
    expect(buttonInstance?.properties.isOpen).toBeUndefined();
    // TaskList should have isOpen set to true
    expect(taskListInstance?.properties.isOpen).toBe(true);
  });
});