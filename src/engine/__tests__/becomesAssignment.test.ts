import { describe, it, expect } from 'vitest';
import { LinearObjaxParser } from '../linearParser';

describe('Becomes Assignment', () => {
  it('should parse simple becomes assignment', () => {
    const code = `
      BoxMorph is a Class
      BoxMorph has field "width" has default 100
      box is a BoxMorph
      box.width becomes 500
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.becomesAssignments).toHaveLength(1);
    
    const becomesAssignment = result.becomesAssignments[0];
    expect(becomesAssignment.target.type).toBe('field');
    expect(becomesAssignment.target.instanceName).toBe('box');
    expect(becomesAssignment.target.fieldName).toBe('width');
    expect(becomesAssignment.expression.type).toBe('literal');
    expect(becomesAssignment.expression.value).toBe(500);
  });

  it('should parse becomes assignment with arithmetic expression', () => {
    const code = `
      BoxMorph is a Class
      BoxMorph has field "width" has default 100
      box is a BoxMorph
      box.width becomes box.width + 1
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.becomesAssignments).toHaveLength(1);
    
    const becomesAssignment = result.becomesAssignments[0];
    expect(becomesAssignment.target.type).toBe('field');
    expect(becomesAssignment.target.instanceName).toBe('box');
    expect(becomesAssignment.target.fieldName).toBe('width');
    
    // Check expression (binary operation)
    expect(becomesAssignment.expression.type).toBe('binary');
    expect(becomesAssignment.expression.operator).toBe('+');
    
    // Check left side (field access)
    expect(becomesAssignment.expression.left?.type).toBe('field');
    expect(becomesAssignment.expression.left?.instanceName).toBe('box');
    expect(becomesAssignment.expression.left?.fieldName).toBe('width');
    
    // Check right side (literal)
    expect(becomesAssignment.expression.right?.type).toBe('literal');
    expect(becomesAssignment.expression.right?.value).toBe(1);
  });

  it('should parse becomes assignment with multiplication', () => {
    const code = `
      BoxMorph is a Class
      BoxMorph has field "width" has default 100
      box is a BoxMorph
      box.width becomes box.width * 2
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.becomesAssignments).toHaveLength(1);
    
    const becomesAssignment = result.becomesAssignments[0];
    expect(becomesAssignment.expression.type).toBe('binary');
    expect(becomesAssignment.expression.operator).toBe('*');
    expect(becomesAssignment.expression.right?.value).toBe(2);
  });

  it('should parse becomes assignment with complex expression', () => {
    const code = `
      BoxMorph is a Class
      BoxMorph has field "width" has default 100
      BoxMorph has field "height" has default 50
      box is a BoxMorph
      box.width becomes box.height + 10 * 3
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.becomesAssignments).toHaveLength(1);
    
    const becomesAssignment = result.becomesAssignments[0];
    expect(becomesAssignment.expression.type).toBe('binary');
    
    // Should prioritize * over +, so structure should be: box.height + (10 * 3)
    expect(becomesAssignment.expression.operator).toBe('+');
    expect(becomesAssignment.expression.left?.type).toBe('field');
    expect(becomesAssignment.expression.right?.type).toBe('binary');
    expect(becomesAssignment.expression.right?.operator).toBe('*');
  });

  it('should parse variable assignment', () => {
    const code = `
      myVariable becomes 42
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.becomesAssignments).toHaveLength(1);
    
    const becomesAssignment = result.becomesAssignments[0];
    expect(becomesAssignment.target.type).toBe('variable');
    expect(becomesAssignment.target.variableName).toBe('myVariable');
    expect(becomesAssignment.expression.type).toBe('literal');
    expect(becomesAssignment.expression.value).toBe(42);
  });

  it('should handle division', () => {
    const code = `
      BoxMorph is a Class
      BoxMorph has field "width" has default 100
      box is a BoxMorph
      box.width becomes box.width / 2
    `;
    
    const parser = new LinearObjaxParser();
    const result = parser.parse(code);
    
    expect(result.errors).toHaveLength(0);
    expect(result.becomesAssignments).toHaveLength(1);
    
    const becomesAssignment = result.becomesAssignments[0];
    expect(becomesAssignment.expression.type).toBe('binary');
    expect(becomesAssignment.expression.operator).toBe('/');
    expect(becomesAssignment.expression.right?.value).toBe(2);
  });
});