import { describe, it, expect } from 'vitest';
import { parseObjax } from '../objaxEngine';

describe('Create Method Integration', () => {
  it('should work end-to-end with the full Objax engine', () => {
    const code = `
Person is a Class
Person has field "name"
Person has field "age" has default 25

create with name "Alice"
create with name "Bob" and age 30
Person create with name "Charlie"
    `;

    const result = parseObjax(code);

    expect(result.errors).toHaveLength(0);
    expect(result.classes).toHaveLength(1);
    expect(result.instances).toHaveLength(3);

    // Check the auto-generated instance names
    const instances = result.instances.sort((a, b) => a.name.localeCompare(b.name));
    
    expect(instances[0].name).toBe('person1');
    expect(instances[0].properties.name).toBe('Alice');
    expect(instances[0].properties.age).toBe(25); // Default value
    
    expect(instances[1].name).toBe('person2');
    expect(instances[1].properties.name).toBe('Bob');
    expect(instances[1].properties.age).toBe(30); // Overridden value
    
    expect(instances[2].name).toBe('person3');
    expect(instances[2].properties.name).toBe('Charlie');
    expect(instances[2].properties.age).toBe(25); // Default value
  });

  it('should work with multiple classes', () => {
    const code = `
Person is a Class
Person has field "name"

Task is a Class
Task has field "title"
Task has field "done" has default false

Person create with name "John"
Task create with title "Write tests"
Person create with name "Jane"
Task create with title "Review code" and done true
    `;

    const result = parseObjax(code);

    expect(result.errors).toHaveLength(0);
    expect(result.classes).toHaveLength(2);
    expect(result.instances).toHaveLength(4);

    const persons = result.instances.filter(i => i.className === 'Person');
    const tasks = result.instances.filter(i => i.className === 'Task');

    expect(persons).toHaveLength(2);
    expect(tasks).toHaveLength(2);

    expect(persons[0].name).toBe('person1');
    expect(persons[1].name).toBe('person2');
    expect(tasks[0].name).toBe('task1');
    expect(tasks[1].name).toBe('task2');
  });

  it('should handle complex numbering scenarios', () => {
    const code = `
Item is a Class
Item has field "value"

item1 is a Item
item5 is a Item
create with value "auto1"
create with value "auto2"
    `;

    const result = parseObjax(code);

    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(4);

    const autoCreated = result.instances.filter(i => i.properties.value?.startsWith('auto'));
    expect(autoCreated).toHaveLength(2);
    
    // Should create item6 and item7 (after the highest existing number)
    expect(autoCreated[0].name).toBe('item6');
    expect(autoCreated[1].name).toBe('item7');
  });
});