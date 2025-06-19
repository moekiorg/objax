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
});
