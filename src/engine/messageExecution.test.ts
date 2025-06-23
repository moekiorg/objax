import { describe, it, expect } from 'vitest';
import { LinearObjaxParser } from './linearParser';

describe('Message Execution', () => {
  it('should parse message to instance', () => {
    const code = `
      Task is a Class
      Task has field "title"
      myTask is a Task
      message to myTask "set field 'title' of it to 'Hello'"
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.messageExecutions).toHaveLength(1);
    expect(result.messageExecutions[0].targetInstance).toBe('myTask');
    expect(result.messageExecutions[0].code).toBe("set field 'title' of it to 'Hello'");
    expect(result.messageExecutions[0].context).toBe('it');
  });

  it('should execute message with it context', () => {
    const code = `
      Task is a Class
      Task has field "title"
      Task has method "setTitle" do self.title is "Updated"
      myTask is a Task
      message to myTask "it setTitle"
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
      Task is a Class
      Task has field "title"
      myTask is a Task
      otherTask is a Task
      message to myTask "it.title is 'First'"
      message to otherTask "it.title is 'Second'"
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.messageExecutions).toHaveLength(2);
    expect(result.messageExecutions[0].targetInstance).toBe('myTask');
    expect(result.messageExecutions[1].targetInstance).toBe('otherTask');
  });
});