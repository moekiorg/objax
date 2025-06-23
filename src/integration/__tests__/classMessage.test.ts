import { describe, it, expect } from 'vitest';
import { parseObjaxWithClasses } from '../../engine/objaxEngine';

describe('Class Message Integration', () => {
  it('processes it syntax and adds field to class', () => {
    const existingClasses = [
      {
        name: 'Task',
        code: 'Task is a Class',
        fields: [
          { name: 'title', default: '' }
        ],
        methods: []
      }
    ];

    // Simulate the it replacement that happens in CanvasView
    const message = 'it has field "done" has default false';
    const processedMessage = message.replace(/\bit\b/gi, 'Task');
    
    const result = parseObjaxWithClasses(processedMessage, existingClasses, []);
    
    expect(result.errors).toEqual([]);
    expect(result.classes.length).toBeGreaterThan(0);
    
    const taskClass = result.classes.find(c => c.name === 'Task');
    expect(taskClass).toBeDefined();
    // The new field 'done' should be added to the class
    const doneField = taskClass!.fields.find(f => f.name === 'done');
    expect(doneField).toBeDefined();
    expect(doneField!.defaultValue).toBe(false);
  });

  it('creates new class when using it with non-existent class', () => {
    const message = 'it has field "name"';
    const processedMessage = message.replace(/\bit\b/gi, 'Person');
    
    const result = parseObjaxWithClasses(processedMessage, [], []);
    
    expect(result.errors).toEqual([]);
    expect(result.classes).toHaveLength(1);
    
    const personClass = result.classes[0];
    expect(personClass.name).toBe('Person');
    expect(personClass.fields).toHaveLength(1);
    expect(personClass.fields[0].name).toBe('name');
  });

  it('adds method using it syntax', () => {
    const message = 'it has method "greet" do self.name is "Hello"';
    const processedMessage = message.replace(/\bit\b/gi, 'User');
    
    const result = parseObjaxWithClasses(processedMessage, [], []);
    
    expect(result.errors).toEqual([]);
    expect(result.classes).toHaveLength(1);
    
    const userClass = result.classes[0];
    expect(userClass.name).toBe('User');
    expect(userClass.methods).toHaveLength(1);
    expect(userClass.methods[0].name).toBe('greet');
    expect(userClass.methods[0].body).toBe('self.name is "Hello"');
  });
});