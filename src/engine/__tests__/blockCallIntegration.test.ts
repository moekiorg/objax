import { describe, it, expect } from 'vitest';
import { parseObjaxWithClasses } from '../objaxEngine';
import { presetUIClasses } from '../presetClasses';

describe('Block Call Integration', () => {
  it('should define block and execute via call', () => {
    const code = `
      BoxMorph is a Class
      BoxMorph has field "width" has default 100
      
      boxA is a BoxMorph
      grow is <boxA.width becomes boxA.width + 10>
      grow call
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, []);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockAssignments).toHaveLength(1);
    expect(result.blockCalls).toHaveLength(1);
    expect(result.instances).toHaveLength(1);
    
    const instance = result.instances[0];
    expect(instance.name).toBe('boxA');
    expect(instance.properties.width).toBe(110); // 100 + 10
  });

  it('should execute multiple block calls', () => {
    const code = `
      BoxMorph is a Class
      BoxMorph has field "width" has default 100
      
      boxA is a BoxMorph
      grow is <boxA.width becomes boxA.width + 10>
      grow call
      grow call
      grow call
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, []);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockCalls).toHaveLength(3);
    expect(result.instances).toHaveLength(1);
    
    const instance = result.instances[0];
    expect(instance.name).toBe('boxA');
    expect(instance.properties.width).toBe(130); // 100 + 10 + 10 + 10
  });

  it('should execute block with multiple statements', () => {
    const code = `
      BoxMorph is a Class
      BoxMorph has field "width" has default 100
      BoxMorph has field "height" has default 50
      
      boxA is a BoxMorph
      transform is <boxA.width becomes boxA.width * 2; boxA.height becomes boxA.height + 25>
      transform call
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, []);
    
    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(1);
    
    const instance = result.instances[0];
    expect(instance.properties.width).toBe(200); // 100 * 2
    expect(instance.properties.height).toBe(75); // 50 + 25
  });

  it('should execute different blocks', () => {
    const code = `
      BoxMorph is a Class
      BoxMorph has field "width" has default 100
      
      boxA is a BoxMorph
      grow is <boxA.width becomes boxA.width + 10>
      shrink is <boxA.width becomes boxA.width - 5>
      
      grow call
      shrink call
      grow call
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, []);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockAssignments).toHaveLength(2);
    expect(result.blockCalls).toHaveLength(3);
    expect(result.instances).toHaveLength(1);
    
    const instance = result.instances[0];
    expect(instance.properties.width).toBe(115); // 100 + 10 - 5 + 10
  });

  it('should handle complex expressions in block calls', () => {
    const code = `
      BoxMorph is a Class
      BoxMorph has field "width" has default 100
      BoxMorph has field "height" has default 50
      
      box is a BoxMorph
      calc is <box.width becomes box.width * 2 + box.height / 2>
      calc call
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, []);
    
    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(1);
    
    const instance = result.instances[0];
    // 100 * 2 + 50 / 2 = 200 + 25 = 225
    expect(instance.properties.width).toBe(225);
  });

  it('should work with existing instances', () => {
    const existingInstances = [{
      name: 'myBox',
      className: 'BoxMorph',
      properties: {
        width: 150,
        height: 75,
        label: 'My Box'
      }
    }];

    const code = `
      double is <myBox.width becomes myBox.width * 2>
      double call
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, existingInstances);
    
    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(1);
    
    const instance = result.instances[0];
    expect(instance.name).toBe('myBox');
    expect(instance.properties.width).toBe(300); // 150 * 2
  });

  it('should error when calling non-existent block', () => {
    const code = `
      BoxMorph is a Class
      boxA is a BoxMorph
      nonExistentBlock call
    `;
    
    expect(() => {
      parseObjaxWithClasses(code, presetUIClasses, []);
    }).toThrow('Block "nonExistentBlock" not found');
  });
});