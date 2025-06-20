import { describe, it, expect } from 'vitest';
import { LinearObjaxParser } from './linearParser';

describe('Message Execution', () => {
  it('should parse message to instance', () => {
    const code = `
      define Task
      Task has field "title"
      myTask is a new Task
      message to myTask "set field 'title' of self to 'Hello'"
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.messageExecutions).toHaveLength(1);
    expect(result.messageExecutions[0].targetInstance).toBe('myTask');
    expect(result.messageExecutions[0].code).toBe("set field 'title' of self to 'Hello'");
    expect(result.messageExecutions[0].context).toBe('self');
  });

  it('should execute message with self context', () => {
    const code = `
      define Task
      Task has field "title"
      Task has method "setTitle" do set field "title" of myself to "Updated"
      myTask is a new Task
      message to myTask "call 'setTitle' on self"
    `;
    
    const parser = new LinearObjaxParser();
    const parseResult = parser.parse(code);
    
    expect(parseResult.errors).toHaveLength(0);
    expect(parseResult.messageExecutions).toHaveLength(1);
    
    // This would be tested with the full engine integration
    // For now we just verify parsing
  });

  it('should handle multiple message executions', () => {
    const code = `
      define Task
      Task has field "title"
      myTask is a new Task
      otherTask is a new Task
      message to myTask "set field 'title' of self to 'First'"
      message to otherTask "set field 'title' of self to 'Second'"
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.messageExecutions).toHaveLength(2);
    expect(result.messageExecutions[0].targetInstance).toBe('myTask');
    expect(result.messageExecutions[1].targetInstance).toBe('otherTask');
  });
});