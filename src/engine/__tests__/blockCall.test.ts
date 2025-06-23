import { describe, it, expect } from 'vitest';
import { LinearObjaxParser } from '../linearParser';

describe('Block Call Syntax', () => {
  it('should parse simple block call', () => {
    const code = `
      grow call
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockCalls).toHaveLength(1);
    
    const blockCall = result.blockCalls[0];
    expect(blockCall.blockName).toBe('grow');
  });

  it('should parse multiple block calls', () => {
    const code = `
      grow call
      shrink call
      transform call
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockCalls).toHaveLength(3);
    
    expect(result.blockCalls[0].blockName).toBe('grow');
    expect(result.blockCalls[1].blockName).toBe('shrink');
    expect(result.blockCalls[2].blockName).toBe('transform');
  });

  it('should parse block definition and call in same code', () => {
    const code = `
      grow is <boxA.width becomes boxA.width + 10>
      grow call
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockAssignments).toHaveLength(1);
    expect(result.blockCalls).toHaveLength(1);
    
    const blockAssignment = result.blockAssignments[0];
    expect(blockAssignment.blockName).toBe('grow');
    expect(blockAssignment.blockBody).toBe('boxA.width becomes boxA.width + 10');
    
    const blockCall = result.blockCalls[0];
    expect(blockCall.blockName).toBe('grow');
  });

  it('should handle invalid block call syntax', () => {
    const code = `
      grow call extra
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Invalid block call syntax');
  });

  it('should distinguish between block calls and method calls', () => {
    const code = `
      grow call
      instance methodName
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockCalls).toHaveLength(1);
    expect(result.methodCalls).toHaveLength(1);
    
    expect(result.blockCalls[0].blockName).toBe('grow');
    expect(result.methodCalls[0].instanceName).toBe('instance');
    expect(result.methodCalls[0].methodName).toBe('methodName');
  });

  it('should handle multiple blocks with different call patterns', () => {
    const code = `
      action1 is <box.width becomes 100>
      action2 is <box.height becomes 200>
      
      action1 call
      action2 call
      action1 call
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockAssignments).toHaveLength(2);
    expect(result.blockCalls).toHaveLength(3);
    
    expect(result.blockCalls[0].blockName).toBe('action1');
    expect(result.blockCalls[1].blockName).toBe('action2');
    expect(result.blockCalls[2].blockName).toBe('action1');
  });
});