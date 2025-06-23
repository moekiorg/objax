import { describe, it, expect } from 'vitest';
import { LinearObjaxParser } from '../linearParser';

describe('Custom Class Fields in Instances', () => {
  it('should initialize instance with class field defaults', () => {
    const parser = new LinearObjaxParser();
    
    const code = `
Question is a Class
Question defineField with name 'content'
q1 is a Question
`;
    
    const result = parser.parse(code);
    
    console.log('Parse result:', {
      classes: result.classes,
      instances: result.instances,
      errors: result.errors
    });
    
    // Should have created the Question class
    expect(result.classes).toHaveLength(1);
    expect(result.classes[0].name).toBe('Question');
    expect(result.classes[0].fields).toHaveLength(1);
    expect(result.classes[0].fields[0].name).toBe('content');
    
    // Should have created the q1 instance with content field
    expect(result.instances).toHaveLength(1);
    expect(result.instances[0].name).toBe('q1');
    expect(result.instances[0].className).toBe('Question');
    expect(result.instances[0].properties).toHaveProperty('content');
    expect(result.instances[0].properties.content).toBe(''); // Default empty string
  });

  it('should use specified default values for fields', () => {
    const parser = new LinearObjaxParser();
    
    const code = `
Task is a Class
Task defineField with name 'title' and default 'New Task'
Task defineField with name 'completed' and default false
Task defineField with name 'priority' and default 1
myTask is a Task
`;
    
    const result = parser.parse(code);
    
    // Should have created the instance with default values
    expect(result.instances).toHaveLength(1);
    expect(result.instances[0].properties).toEqual({
      title: 'New Task',
      completed: false,
      priority: 1
    });
  });

  it('should override defaults with instance-specific properties', () => {
    const parser = new LinearObjaxParser();
    
    const code = `
User is a Class
User defineField with name 'name' and default 'Anonymous'
User defineField with name 'age' and default 0
user1 is a User with name 'Alice' and age 25
`;
    
    const result = parser.parse(code);
    
    // Should override defaults with provided values
    expect(result.instances).toHaveLength(1);
    expect(result.instances[0].properties).toEqual({
      name: 'Alice',
      age: 25
    });
  });

  it('should work with defineField inside class context', () => {
    const parser = new LinearObjaxParser();
    
    const code = `
Product is a Class
Product defineField with name 'name'
Product defineField with name 'price' and default 0
Product defineField with name 'inStock' and default true

item1 is a Product
`;
    
    const result = parser.parse(code);
    
    // Should have all fields initialized
    expect(result.instances[0].properties).toEqual({
      name: '', // Default for content-like field
      price: 0,
      inStock: true
    });
  });

  it('should handle mixed field definition styles', () => {
    const parser = new LinearObjaxParser();
    
    const code = `
Article is a Class
Article has field 'title'
Article defineField with name 'content'
Article has field 'published' has default false

post1 is a Article
`;
    
    const result = parser.parse(code);
    
    // Should handle both "has field" and "defineField" syntax
    expect(result.classes[0].fields).toHaveLength(3);
    expect(result.instances[0].properties).toEqual({
      title: '',
      content: '',
      published: false
    });
  });

  it('should provide smart defaults based on field names', () => {
    const parser = new LinearObjaxParser();
    
    const code = `
Settings is a Class
Settings defineField with name 'isActive'
Settings defineField with name 'count'
Settings defineField with name 'items'
Settings defineField with name 'description'

config is a Settings
`;
    
    const result = parser.parse(code);
    
    // Should use smart defaults based on field names
    expect(result.instances[0].properties).toEqual({
      isActive: false, // boolean-like name
      count: 0, // number-like name
      items: [], // array-like name
      description: '' // string default
    });
  });
});