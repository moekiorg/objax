import { describe, it, expect } from 'vitest';

describe('Class Message It Syntax', () => {
  const replaceItWithClassName = (message: string, className: string): string => {
    return message.replace(/\bit\b/gi, className);
  };

  it('replaces "it" with class name', () => {
    const message = 'it has field "newField"';
    const result = replaceItWithClassName(message, 'Task');
    expect(result).toBe('Task has field "newField"');
  });

  it('replaces multiple "it" occurrences', () => {
    const message = 'it has field "title" and it has method "complete"';
    const result = replaceItWithClassName(message, 'Task');
    expect(result).toBe('Task has field "title" and Task has method "complete"');
  });

  it('does not replace "it" within words', () => {
    const message = 'it has field "title" with value "submit"';
    const result = replaceItWithClassName(message, 'Task');
    expect(result).toBe('Task has field "title" with value "submit"');
  });

  it('handles complex messages', () => {
    const message = 'it has field "done" has default false\nit has method "complete" do self.done is true';
    const result = replaceItWithClassName(message, 'Task');
    expect(result).toBe('Task has field "done" has default false\nTask has method "complete" do self.done is true');
  });

  it('handles capitalized "It"', () => {
    const message = 'It has field "newField"';
    const result = replaceItWithClassName(message, 'Task');
    expect(result).toBe('Task has field "newField"');
  });

  it('preserves other text unchanged', () => {
    const message = 'Task has field "title" and it should be string';
    const result = replaceItWithClassName(message, 'User');
    expect(result).toBe('Task has field "title" and User should be string');
  });
});