import { describe, it, expect } from 'vitest';
import { LinearObjaxParser } from '../linearParser';
import { ObjaxExecutor } from '../executor';

describe('Create Method Functionality', () => {
  it('should parse create with name "John" correctly', () => {
    const parser = new LinearObjaxParser();
    const code = `
Person is a Class
Person has field "name"
create with name "John"
    `;

    const result = parser.parse(code);

    expect(result.errors).toHaveLength(0);
    expect(result.classes).toHaveLength(1);
    expect(result.methodCalls).toHaveLength(1);

    const methodCall = result.methodCalls[0];
    expect(methodCall.methodName).toBe('create');
    expect(methodCall.instanceName).toBe('Person'); // Assuming it infers from the last defined class
    expect(methodCall.keywordParameters).toEqual({ name: 'John' });
  });

  it('should create instance with auto-generated name', () => {
    const parser = new LinearObjaxParser();
    const executor = new ObjaxExecutor();
    
    const code = `
Person is a Class
Person has field "name"
create with name "John"
    `;

    const parseResult = parser.parse(code);
    const executionResult = executor.execute(parseResult);

    expect(executionResult.errors).toHaveLength(0);
    expect(executionResult.instances).toHaveLength(1);

    const instance = executionResult.instances[0];
    expect(instance.name).toBe('person1'); // Auto-generated name
    expect(instance.className).toBe('Person');
    expect(instance.properties.name).toBe('John');
  });

  it('should create multiple instances with sequential numbering', () => {
    const parser = new LinearObjaxParser();
    const executor = new ObjaxExecutor();
    
    const code = `
Person is a Class
Person has field "name"
create with name "John"
create with name "Jane"
create with name "Bob"
    `;

    const parseResult = parser.parse(code);
    const executionResult = executor.execute(parseResult);

    expect(executionResult.errors).toHaveLength(0);
    expect(executionResult.instances).toHaveLength(3);

    expect(executionResult.instances[0].name).toBe('person1');
    expect(executionResult.instances[0].properties.name).toBe('John');
    
    expect(executionResult.instances[1].name).toBe('person2');
    expect(executionResult.instances[1].properties.name).toBe('Jane');
    
    expect(executionResult.instances[2].name).toBe('person3');
    expect(executionResult.instances[2].properties.name).toBe('Bob');
  });

  it('should handle numbering with existing instances', () => {
    const parser = new LinearObjaxParser();
    const executor = new ObjaxExecutor();
    
    const code = `
Person is a Class
Person has field "name"
person1 is a Person
person3 is a Person
create with name "John"
    `;

    const parseResult = parser.parse(code);
    const executionResult = executor.execute(parseResult);

    expect(executionResult.errors).toHaveLength(0);
    expect(executionResult.instances).toHaveLength(3);

    // Should use the next available number
    const createdInstance = executionResult.instances.find(i => i.properties.name === 'John');
    expect(createdInstance?.name).toBe('person4');
  });

  it('should specify class name explicitly', () => {
    const parser = new LinearObjaxParser();
    const executor = new ObjaxExecutor();
    
    const code = `
Person is a Class
Person has field "name"
Task is a Class
Task has field "title"
Person create with name "John"
Task create with title "Write tests"
    `;

    const parseResult = parser.parse(code);
    const executionResult = executor.execute(parseResult);

    expect(executionResult.errors).toHaveLength(0);
    expect(executionResult.instances).toHaveLength(2);

    const person = executionResult.instances.find(i => i.className === 'Person');
    const task = executionResult.instances.find(i => i.className === 'Task');

    expect(person?.name).toBe('person1');
    expect(person?.properties.name).toBe('John');
    
    expect(task?.name).toBe('task1');
    expect(task?.properties.title).toBe('Write tests');
  });

  it('should handle multiple properties', () => {
    const parser = new LinearObjaxParser();
    const executor = new ObjaxExecutor();
    
    const code = `
Person is a Class
Person has field "name"
Person has field "age"
Person has field "active" has default true
create with name "John" and age 30
    `;

    const parseResult = parser.parse(code);
    const executionResult = executor.execute(parseResult);

    expect(executionResult.errors).toHaveLength(0);
    expect(executionResult.instances).toHaveLength(1);

    const instance = executionResult.instances[0];
    expect(instance.name).toBe('person1');
    expect(instance.properties.name).toBe('John');
    expect(instance.properties.age).toBe(30);
    expect(instance.properties.active).toBe(true); // Default value
  });
});