import { describe, expect, it } from 'vitest';
import { ObjaxEngine } from './objaxEngine';

describe('ObjaxEngine', () => {
  it('should create a simple class definition', () => {
    const engine = new ObjaxEngine();
    const code = 'define Task\nTask has field "title"';

    const result = engine.execute(code);
    expect(result.classes).toHaveLength(1);
    expect(result.classes[0].name).toBe('Task');
    expect(result.classes[0].fields).toHaveLength(1);
    expect(result.classes[0].fields[0].name).toBe('title');
  });

  it('should create a field with default value', () => {
    const engine = new ObjaxEngine();
    const code = 'define Task\nTask has field "done" has default false';

    const result = engine.execute(code);
    expect(result.classes).toHaveLength(1);
    expect(result.classes[0].fields).toHaveLength(1);
    expect(result.classes[0].fields[0].name).toBe('done');
    expect(result.classes[0].fields[0].defaultValue).toBe(false);
  });

  it('should create a method definition', () => {
    const engine = new ObjaxEngine();
    const code = 'define Task\nTask has method "complete" do set field "done" of myself to true';

    const result = engine.execute(code);
    expect(result.classes).toHaveLength(1);
    expect(result.classes[0].methods).toHaveLength(1);
    expect(result.classes[0].methods[0].name).toBe('complete');
    expect(result.classes[0].methods[0].body).toBe('set field "done" of myself to true');
  });

  it('should create a new instance', () => {
    const engine = new ObjaxEngine();
    const code = 'myTask is a new Task';

    const result = engine.execute(code);
    expect(result.instances).toHaveLength(1);
    expect(result.instances[0].name).toBe('myTask');
    expect(result.instances[0].className).toBe('Task');
  });

  it('should handle complex class with fields, methods and instances', () => {
    const engine = new ObjaxEngine();
    const code = `define Task
Task has field "title"
Task has field "done" has default false
Task has method "complete" do set field "done" of myself to true
myTask is a new Task`;

    const result = engine.execute(code);
    expect(result.errors).toHaveLength(0);
    expect(result.classes).toHaveLength(1);
    expect(result.classes[0].name).toBe('Task');
    expect(result.classes[0].fields).toHaveLength(2);
    expect(result.classes[0].methods).toHaveLength(1);
    expect(result.instances).toHaveLength(1);
    expect(result.instances[0].name).toBe('myTask');
    expect(result.instances[0].className).toBe('Task');
  });
});
