import { describe, it, expect, beforeEach } from 'vitest';
import { LinearObjaxParser } from '../linearParser';

describe('Existing Class Extension', () => {
  let parser: LinearObjaxParser;

  beforeEach(() => {
    parser = new LinearObjaxParser();
  });

  it('adds field to existing class', () => {
    const code = `
Task is a Class
Task has field "title"
Task has field "newField"
`;
    
    const result = parser.parse(code);
    
    expect(result.errors).toEqual([]);
    expect(result.classes).toHaveLength(1);
    
    const taskClass = result.classes[0];
    expect(taskClass.name).toBe('Task');
    expect(taskClass.fields).toHaveLength(2);
    expect(taskClass.fields[0].name).toBe('title');
    expect(taskClass.fields[1].name).toBe('newField');
  });

  it('adds method to existing class', () => {
    const code = `
Task is a Class
Task has field "done" has default false
Task has method "complete" do self.done is true
`;
    
    const result = parser.parse(code);
    
    expect(result.errors).toEqual([]);
    expect(result.classes).toHaveLength(1);
    
    const taskClass = result.classes[0];
    expect(taskClass.name).toBe('Task');
    expect(taskClass.fields).toHaveLength(1);
    expect(taskClass.methods).toHaveLength(1);
    expect(taskClass.methods[0].name).toBe('complete');
  });

  it('creates new class when extending non-existent class', () => {
    const code = `Hoge has field "newField"`;
    
    const result = parser.parse(code);
    
    expect(result.errors).toEqual([]);
    expect(result.classes).toHaveLength(1);
    
    const hogeClass = result.classes[0];
    expect(hogeClass.name).toBe('Hoge');
    expect(hogeClass.fields).toHaveLength(1);
    expect(hogeClass.fields[0].name).toBe('newField');
  });

  it('adds field with default value to new class', () => {
    const code = `Person has field "name" has default "Unknown"`;
    
    const result = parser.parse(code);
    
    expect(result.errors).toEqual([]);
    expect(result.classes).toHaveLength(1);
    
    const personClass = result.classes[0];
    expect(personClass.name).toBe('Person');
    expect(personClass.fields).toHaveLength(1);
    expect(personClass.fields[0].name).toBe('name');
    expect(personClass.fields[0].defaultValue).toBe('Unknown');
  });

  it('handles multiple class extensions', () => {
    const code = `
Task has field "title"
Task has field "done" has default false
User has field "name"
Task has method "complete" do self.done is true
User has method "greet" do self.name is "Hello"
`;
    
    const result = parser.parse(code);
    
    expect(result.errors).toEqual([]);
    expect(result.classes).toHaveLength(2);
    
    const taskClass = result.classes.find(c => c.name === 'Task');
    const userClass = result.classes.find(c => c.name === 'User');
    
    expect(taskClass).toBeDefined();
    expect(taskClass!.fields).toHaveLength(2);
    expect(taskClass!.methods).toHaveLength(1);
    
    expect(userClass).toBeDefined();
    expect(userClass!.fields).toHaveLength(1);
    expect(userClass!.methods).toHaveLength(1);
  });
});