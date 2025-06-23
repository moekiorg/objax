import { describe, it, expect } from 'vitest';
import { parseObjaxWithClasses } from '../objaxEngine';
import { presetUIClasses } from '../presetClasses';

describe('Becomes Assignment Integration', () => {
  it('should execute simple becomes assignment', () => {
    const code = `
      box is a BoxMorph
      box.width becomes 500
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, []);
    
    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(1);
    
    const instance = result.instances[0];
    expect(instance.name).toBe('box');
    expect(instance.className).toBe('BoxMorph');
    expect(instance.properties.width).toBe(500);
  });

  it('should execute becomes assignment with arithmetic expression', () => {
    const code = `
      box is a BoxMorph
      box.width becomes box.width + 50
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, []);
    
    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(1);
    
    const instance = result.instances[0];
    expect(instance.name).toBe('box');
    expect(instance.className).toBe('BoxMorph');
    // Default width is 100px, + 50 = 150
    expect(instance.properties.width).toBe(150);
  });

  it('should execute becomes assignment with multiplication', () => {
    const code = `
      box is a BoxMorph
      box.width becomes box.width * 2
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, []);
    
    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(1);
    
    const instance = result.instances[0];
    // Default width is 100px, * 2 = 200
    expect(instance.properties.width).toBe(200);
  });

  it('should execute becomes assignment with complex expression', () => {
    const code = `
      box is a BoxMorph
      box.width becomes box.height + 10 * 3
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, []);
    
    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(1);
    
    const instance = result.instances[0];
    // Default height is 50px, 10 * 3 = 30, 50 + 30 = 80
    expect(instance.properties.width).toBe(80);
  });

  it('should work with existing instances', () => {
    const existingInstances = [{
      id: 'myBox_1',
      name: 'myBox',
      className: 'BoxMorph',
      page: 'test',
      properties: {
        width: 200,
        height: 100,
        label: 'My Box'
      }
    }];

    const code = `
      myBox.width becomes myBox.width + 100
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, existingInstances);
    
    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(1);
    
    const instance = result.instances[0];
    expect(instance.name).toBe('myBox');
    expect(instance.properties.width).toBe(300); // 200 + 100
  });

  it('should handle division', () => {
    const code = `
      box is a BoxMorph
      box.width becomes box.width / 2
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, []);
    
    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(1);
    
    const instance = result.instances[0];
    // Default width is 100px, / 2 = 50
    expect(instance.properties.width).toBe(50);
  });

  it('should handle multiple becomes assignments', () => {
    const code = `
      box is a BoxMorph
      box.width becomes 300
      box.height becomes box.height * 2
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, []);
    
    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(1);
    
    const instance = result.instances[0];
    expect(instance.properties.width).toBe(300);
    expect(instance.properties.height).toBe(100); // 50 * 2
  });

  it('should handle subtraction', () => {
    const code = `
      box is a BoxMorph
      box.width becomes box.width - 25
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, []);
    
    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(1);
    
    const instance = result.instances[0];
    // Default width is 100px, - 25 = 75
    expect(instance.properties.width).toBe(75);
  });
});