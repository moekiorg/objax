import { describe, it, expect } from 'vitest';
import { parseObjaxWithClasses } from '../objaxEngine';
import { presetUIClasses } from '../presetClasses';

describe('Block Execution', () => {
  it('should execute simple block assignment and execution', () => {
    const code = `
      BoxMorph is a Class
      BoxMorph has field "width" has default 100
      
      boxA is a BoxMorph
      grow is <boxA.width becomes boxA.width + 10>
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, []);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockAssignments).toHaveLength(1);
    expect(result.instances).toHaveLength(1);
    
    const instance = result.instances[0];
    expect(instance.name).toBe('boxA');
    expect(instance.properties.width).toBe(100); // Initial width
    
    const blockAssignment = result.blockAssignments[0];
    expect(blockAssignment.blockName).toBe('grow');
    expect(blockAssignment.blockBody).toBe('boxA.width becomes boxA.width + 10');
  });

  it('should execute block with multiple statements', () => {
    const code = `
      BoxMorph is a Class
      BoxMorph has field "width" has default 100
      BoxMorph has field "height" has default 50
      
      boxA is a BoxMorph
      complex is <boxA.width becomes boxA.width + 10; boxA.height becomes boxA.height * 2>
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, []);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockAssignments).toHaveLength(1);
    expect(result.instances).toHaveLength(1);
    
    const blockAssignment = result.blockAssignments[0];
    expect(blockAssignment.blockName).toBe('complex');
    expect(blockAssignment.blockBody).toBe('boxA.width becomes boxA.width + 10; boxA.height becomes boxA.height * 2');
  });

  it('should handle block with field assignments', () => {
    const code = `
      BoxMorph is a Class
      BoxMorph has field "label" has default "Box"
      BoxMorph has field "visible" has default true
      
      box is a BoxMorph
      setup is <box.label is "Hello"; box.visible is false>
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, []);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockAssignments).toHaveLength(1);
    expect(result.instances).toHaveLength(1);
    
    const blockAssignment = result.blockAssignments[0];
    expect(blockAssignment.blockName).toBe('setup');
    expect(blockAssignment.blockBody).toBe('box.label is "Hello"; box.visible is false');
  });

  it('should handle empty block', () => {
    const code = `
      empty is <>
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, []);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockAssignments).toHaveLength(1);
    
    const blockAssignment = result.blockAssignments[0];
    expect(blockAssignment.blockName).toBe('empty');
    expect(blockAssignment.blockBody).toBe('');
  });

  it('should handle multiple block assignments', () => {
    const code = `
      BoxMorph is a Class
      BoxMorph has field "width" has default 100
      
      boxA is a BoxMorph
      grow is <boxA.width becomes boxA.width + 10>
      shrink is <boxA.width becomes boxA.width - 5>
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, []);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockAssignments).toHaveLength(2);
    expect(result.instances).toHaveLength(1);
    
    expect(result.blockAssignments[0].blockName).toBe('grow');
    expect(result.blockAssignments[0].blockBody).toBe('boxA.width becomes boxA.width + 10');
    
    expect(result.blockAssignments[1].blockName).toBe('shrink');
    expect(result.blockAssignments[1].blockBody).toBe('boxA.width becomes boxA.width - 5');
  });

  it('should handle complex expressions in blocks', () => {
    const code = `
      BoxMorph is a Class
      BoxMorph has field "width" has default 100
      BoxMorph has field "height" has default 50
      
      box is a BoxMorph
      calc is <result becomes box.width * 2 + box.height / 3>
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, []);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockAssignments).toHaveLength(1);
    
    const blockAssignment = result.blockAssignments[0];
    expect(blockAssignment.blockName).toBe('calc');
    expect(blockAssignment.blockBody).toBe('result becomes box.width * 2 + box.height / 3');
  });
});