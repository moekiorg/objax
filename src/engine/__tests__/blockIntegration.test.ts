import { describe, it, expect } from 'vitest';
import { ObjaxEngine } from '../objaxEngine';
import { convertToClassDefinition, convertToInstanceDefinition } from '../objaxEngine';
import { presetUIClasses } from '../presetClasses';

describe('Block Integration', () => {
  it('should define and execute a block with becomes assignment', () => {
    const engine = new ObjaxEngine();
    
    // First, define a block
    const defineCode = `
      BoxMorph is a Class
      BoxMorph has field "width" has default 100
      
      boxA is a BoxMorph
      grow is <boxA.width becomes boxA.width + 10>
    `;
    
    const presetClasses = presetUIClasses.map(convertToClassDefinition);
    const defineResult = engine.execute(defineCode, presetClasses, []);
    
    expect(defineResult.errors).toHaveLength(0);
    expect(defineResult.blockAssignments).toHaveLength(1);
    expect(defineResult.instances).toHaveLength(1);
    
    // Check initial width
    const initialInstance = defineResult.instances[0];
    expect(initialInstance.name).toBe('boxA');
    expect(initialInstance.properties.width).toBe(100);
    
    // Now execute the block
    const blockResult = engine.executeBlock('grow', defineResult.instances, defineResult.classes);
    
    if (blockResult.errors.length > 0) {
      console.log('Block execution errors:', blockResult.errors);
    }
    expect(blockResult.errors).toHaveLength(0);
    expect(blockResult.instances).toHaveLength(1);
    
    // Check that width was increased
    const updatedInstance = blockResult.instances[0];
    expect(updatedInstance.properties.width).toBe(110); // 100 + 10
  });

  it('should execute block with multiple statements', () => {
    const engine = new ObjaxEngine();
    
    const defineCode = `
      BoxMorph is a Class
      BoxMorph has field "width" has default 100
      BoxMorph has field "height" has default 50
      
      boxA is a BoxMorph
      transform is <boxA.width becomes boxA.width * 2; boxA.height becomes boxA.height + 25>
    `;
    
    const presetClasses = presetUIClasses.map(convertToClassDefinition);
    const defineResult = engine.execute(defineCode, presetClasses, []);
    
    expect(defineResult.errors).toHaveLength(0);
    
    // Execute the transform block
    const blockResult = engine.executeBlock('transform', defineResult.instances, defineResult.classes);
    
    expect(blockResult.errors).toHaveLength(0);
    expect(blockResult.instances).toHaveLength(1);
    
    const updatedInstance = blockResult.instances[0];
    expect(updatedInstance.properties.width).toBe(200); // 100 * 2
    expect(updatedInstance.properties.height).toBe(75); // 50 + 25
  });

  it('should handle complex expressions in blocks', () => {
    const engine = new ObjaxEngine();
    
    const defineCode = `
      BoxMorph is a Class
      BoxMorph has field "width" has default 100
      BoxMorph has field "height" has default 50
      
      box is a BoxMorph
      calc is <box.width becomes box.width * 2 + box.height / 2>
    `;
    
    const presetClasses = presetUIClasses.map(convertToClassDefinition);
    const defineResult = engine.execute(defineCode, presetClasses, []);
    
    expect(defineResult.errors).toHaveLength(0);
    
    // Execute the calc block
    const blockResult = engine.executeBlock('calc', defineResult.instances, defineResult.classes);
    
    expect(blockResult.errors).toHaveLength(0);
    expect(blockResult.instances).toHaveLength(1);
    
    const updatedInstance = blockResult.instances[0];
    // 100 * 2 + 50 / 2 = 200 + 25 = 225
    expect(updatedInstance.properties.width).toBe(225);
  });

  it('should get registered blocks', () => {
    const engine = new ObjaxEngine();
    
    const defineCode = `
      grow is <boxA.width becomes boxA.width + 10>
      shrink is <boxA.width becomes boxA.width - 5>
    `;
    
    const presetClasses = presetUIClasses.map(convertToClassDefinition);
    engine.execute(defineCode, presetClasses, []);
    
    const blocks = engine.getRegisteredBlocks();
    
    expect(blocks.size).toBe(2);
    expect(blocks.get('grow')).toBe('boxA.width becomes boxA.width + 10');
    expect(blocks.get('shrink')).toBe('boxA.width becomes boxA.width - 5');
  });

  it('should error when trying to execute non-existent block', () => {
    const engine = new ObjaxEngine();
    
    expect(() => {
      engine.executeBlock('nonExistentBlock', [], []);
    }).toThrow('Block "nonExistentBlock" not found');
  });
});