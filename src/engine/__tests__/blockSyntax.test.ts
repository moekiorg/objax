import { describe, it, expect } from 'vitest';
import { LinearObjaxParser } from '../linearParser';

describe('Block Syntax', () => {
  it('should parse simple block assignment', () => {
    const code = `
      grow is <boxA.width becomes boxA.width + 10>
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockAssignments).toHaveLength(1);
    
    const blockAssignment = result.blockAssignments[0];
    expect(blockAssignment.blockName).toBe('grow');
    expect(blockAssignment.blockBody).toBe('boxA.width becomes boxA.width + 10');
  });

  it('should parse block with multiple statements', () => {
    const code = `
      complex is <boxA.width becomes boxA.width + 10; boxA.height becomes boxA.height * 2>
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockAssignments).toHaveLength(1);
    
    const blockAssignment = result.blockAssignments[0];
    expect(blockAssignment.blockName).toBe('complex');
    expect(blockAssignment.blockBody).toBe('boxA.width becomes boxA.width + 10; boxA.height becomes boxA.height * 2');
  });

  it('should parse multiple block assignments', () => {
    const code = `
      grow is <boxA.width becomes boxA.width + 10>
      shrink is <boxA.width becomes boxA.width - 5>
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockAssignments).toHaveLength(2);
    
    expect(result.blockAssignments[0].blockName).toBe('grow');
    expect(result.blockAssignments[0].blockBody).toBe('boxA.width becomes boxA.width + 10');
    
    expect(result.blockAssignments[1].blockName).toBe('shrink');
    expect(result.blockAssignments[1].blockBody).toBe('boxA.width becomes boxA.width - 5');
  });

  it('should handle empty block', () => {
    const code = `
      empty is <>
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockAssignments).toHaveLength(1);
    
    const blockAssignment = result.blockAssignments[0];
    expect(blockAssignment.blockName).toBe('empty');
    expect(blockAssignment.blockBody).toBe('');
  });

  it('should handle block with field assignments', () => {
    const code = `
      setup is <box.label is "Hello"; box.visible is true>
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockAssignments).toHaveLength(1);
    
    const blockAssignment = result.blockAssignments[0];
    expect(blockAssignment.blockName).toBe('setup');
    expect(blockAssignment.blockBody).toBe('box.label is "Hello"; box.visible is true');
  });

  it('should handle nested expressions in block', () => {
    const code = `
      calc is <result becomes box.width * 2 + box.height / 3>
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockAssignments).toHaveLength(1);
    
    const blockAssignment = result.blockAssignments[0];
    expect(blockAssignment.blockName).toBe('calc');
    expect(blockAssignment.blockBody).toBe('result becomes box.width * 2 + box.height / 3');
  });
});