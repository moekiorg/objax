import { describe, it, expect } from 'vitest';
import { LinearObjaxParser } from '../linearParser';

describe('Field Inheritance in Instance Creation', () => {
  it('should inherit fields with default values from class definition', () => {
    const parser = new LinearObjaxParser();
    
    const code = `Task is a Class
Task has field 'title'
Task has field 'done' has default false
Task has field 'priority' has default 1
myTask is a Task`;

    const result = parser.parse(code);
    
    console.log('Class definition:', result.classes[0]);
    console.log('Instance properties:', result.instances[0].properties);
    console.log('Errors:', result.errors);
    
    expect(result.errors).toHaveLength(0);
    expect(result.classes).toHaveLength(1);
    expect(result.instances).toHaveLength(1);
    
    // Check class fields
    expect(result.classes[0].fields).toHaveLength(3);
    expect(result.classes[0].fields[0].name).toBe('title');
    expect(result.classes[0].fields[1].name).toBe('done');
    expect(result.classes[0].fields[1].defaultValue).toBe(false);
    expect(result.classes[0].fields[2].name).toBe('priority');
    expect(result.classes[0].fields[2].defaultValue).toBe(1);
    
    // Check instance properties - this is the key test
    expect(result.instances[0].properties).toHaveProperty('title');
    expect(result.instances[0].properties).toHaveProperty('done');
    expect(result.instances[0].properties).toHaveProperty('priority');
    
    expect(result.instances[0].properties.title).toBe(''); // Default string
    expect(result.instances[0].properties.done).toBe(false);
    expect(result.instances[0].properties.priority).toBe(1);
  });

  it('should inherit fields without default values using smart defaults', () => {
    const parser = new LinearObjaxParser();
    
    const code = `User is a Class
User has field 'name'
User has field 'isActive'
User has field 'count'
User has field 'items'
john is a User`;

    const result = parser.parse(code);
    
    console.log('User instance properties:', result.instances[0].properties);
    
    expect(result.errors).toHaveLength(0);
    expect(result.instances[0].properties).toEqual({
      name: '', // String default
      isActive: false, // Boolean-like name
      count: 0, // Number-like name
      items: [] // Array-like name
    });
  });

  it('should allow instance properties to override class defaults', () => {
    const parser = new LinearObjaxParser();
    
    const code = `Task is a Class
Task has field 'title' has default 'New Task'
Task has field 'done' has default false
task1 is a Task with title 'Custom Title' and done true`;

    const result = parser.parse(code);
    
    console.log('Task with custom properties:', result.instances[0].properties);
    
    expect(result.errors).toHaveLength(0);
    expect(result.instances[0].properties).toEqual({
      title: "Custom Title", // Overridden
      done: true // Overridden
    });
  });

  it('should handle mixed inheritance and overrides', () => {
    const parser = new LinearObjaxParser();
    
    const code = `Product is a Class
Product has field 'name'
Product has field 'price' has default 0
Product has field 'inStock' has default true
Product has field 'category' has default 'general'
apple is a Product with name 'Apple' and price 1.50`;

    const result = parser.parse(code);
    
    console.log('Product with mixed properties:', result.instances[0].properties);
    
    expect(result.errors).toHaveLength(0);
    expect(result.instances[0].properties).toEqual({
      name: "Apple", // Overridden
      price: 1.50, // Overridden
      inStock: true, // Inherited from class default
      category: "general" // Inherited from class default
    });
  });
});