import { describe, it, expect } from 'vitest';
import { LinearObjaxParser } from '../linearParser';

describe('Block Arguments', () => {
  it('should parse block definition with single parameter', () => {
    const code = `
      grow is <boxA.width becomes boxA.width + amount> with amount
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockAssignments).toHaveLength(1);
    
    const blockAssignment = result.blockAssignments[0];
    expect(blockAssignment.blockName).toBe('grow');
    expect(blockAssignment.blockBody).toBe('boxA.width becomes boxA.width + amount');
    expect(blockAssignment.parameters).toEqual(['amount']);
  });

  it('should parse block definition with multiple parameters', () => {
    const code = `
      transform is <boxA.width becomes boxA.width + x; boxA.height becomes boxA.height + y> with x and y
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockAssignments).toHaveLength(1);
    
    const blockAssignment = result.blockAssignments[0];
    expect(blockAssignment.blockName).toBe('transform');
    expect(blockAssignment.blockBody).toBe('boxA.width becomes boxA.width + x; boxA.height becomes boxA.height + y');
    expect(blockAssignment.parameters).toEqual(['x', 'y']);
  });

  it('should parse block definition with three parameters', () => {
    const code = `
      complex is <x + y * z> with x and y and z
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockAssignments).toHaveLength(1);
    
    const blockAssignment = result.blockAssignments[0];
    expect(blockAssignment.parameters).toEqual(['x', 'y', 'z']);
  });

  it('should parse block call with single argument', () => {
    const code = `
      grow call with amount 15
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockCalls).toHaveLength(1);
    
    const blockCall = result.blockCalls[0];
    expect(blockCall.blockName).toBe('grow');
    expect(blockCall.arguments).toEqual({ amount: 15 });
  });

  it('should parse block call with multiple arguments', () => {
    const code = `
      transform call with x 10 and y 20
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockCalls).toHaveLength(1);
    
    const blockCall = result.blockCalls[0];
    expect(blockCall.blockName).toBe('transform');
    expect(blockCall.arguments).toEqual({ x: 10, y: 20 });
  });

  it('should parse block call with string arguments', () => {
    const code = `
      setText call with message "Hello World"
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockCalls).toHaveLength(1);
    
    const blockCall = result.blockCalls[0];
    expect(blockCall.blockName).toBe('setText');
    expect(blockCall.arguments).toEqual({ message: "Hello World" });
  });

  it('should parse block call with boolean arguments', () => {
    const code = `
      toggle call with visible true and enabled false
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockCalls).toHaveLength(1);
    
    const blockCall = result.blockCalls[0];
    expect(blockCall.blockName).toBe('toggle');
    expect(blockCall.arguments).toEqual({ visible: true, enabled: false });
  });

  it('should parse block call with mixed argument types', () => {
    const code = `
      setup call with count 5 and label "Test" and active true
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockCalls).toHaveLength(1);
    
    const blockCall = result.blockCalls[0];
    expect(blockCall.blockName).toBe('setup');
    expect(blockCall.arguments).toEqual({ 
      count: 5, 
      label: "Test", 
      active: true 
    });
  });

  it('should handle block call without arguments', () => {
    const code = `
      simple call
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockCalls).toHaveLength(1);
    
    const blockCall = result.blockCalls[0];
    expect(blockCall.blockName).toBe('simple');
    expect(blockCall.arguments).toBeUndefined();
  });

  it('should handle block definition without parameters', () => {
    const code = `
      simple is <boxA.width becomes 100>
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockAssignments).toHaveLength(1);
    
    const blockAssignment = result.blockAssignments[0];
    expect(blockAssignment.blockName).toBe('simple');
    expect(blockAssignment.parameters).toBeUndefined();
  });
});