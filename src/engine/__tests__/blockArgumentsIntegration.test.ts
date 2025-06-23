import { describe, it, expect } from 'vitest';
import { parseObjaxWithClasses } from '../objaxEngine';
import { presetUIClasses } from '../presetClasses';

describe('Block Arguments Integration', () => {
  it('should define and execute block with single parameter', () => {
    const code = `
      BoxMorph is a Class
      BoxMorph has field "width" has default 100
      
      boxA is a BoxMorph
      grow is <boxA.width becomes boxA.width + amount> with amount
      grow call with amount 15
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, []);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockAssignments).toHaveLength(1);
    expect(result.blockCalls).toHaveLength(1);
    expect(result.instances).toHaveLength(1);
    
    const instance = result.instances[0];
    expect(instance.name).toBe('boxA');
    expect(instance.properties.width).toBe(115); // 100 + 15
  });

  it('should execute block with multiple parameters', () => {
    const code = `
      BoxMorph is a Class
      BoxMorph has field "width" has default 100
      BoxMorph has field "height" has default 50
      
      boxA is a BoxMorph
      transform is <boxA.width becomes boxA.width + x; boxA.height becomes boxA.height + y> with x and y
      transform call with x 20 and y 30
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, []);
    
    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(1);
    
    const instance = result.instances[0];
    expect(instance.properties.width).toBe(120); // 100 + 20
    expect(instance.properties.height).toBe(80); // 50 + 30
  });

  it('should execute same block with different arguments', () => {
    const code = `
      BoxMorph is a Class
      BoxMorph has field "width" has default 100
      
      boxA is a BoxMorph
      adjust is <boxA.width becomes boxA.width + delta> with delta
      adjust call with delta 10
      adjust call with delta 5
      adjust call with delta -3
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, []);
    
    expect(result.errors).toHaveLength(0);
    expect(result.blockCalls).toHaveLength(3);
    expect(result.instances).toHaveLength(1);
    
    const instance = result.instances[0];
    expect(instance.properties.width).toBe(112); // 100 + 10 + 5 - 3
  });

  it('should handle string parameters', () => {
    const code = `
      BoxMorph is a Class
      BoxMorph has field "label" has default "Default"
      
      box is a BoxMorph
      setLabel is <box.label becomes text> with text
      setLabel call with text "Hello World"
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, []);
    
    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(1);
    
    const instance = result.instances[0];
    expect(instance.properties.label).toBe("Hello World");
  });

  it('should handle boolean parameters', () => {
    const code = `
      BoxMorph is a Class
      BoxMorph has field "visible" has default true
      BoxMorph has field "enabled" has default true
      
      box is a BoxMorph
      toggle is <box.visible becomes vis; box.enabled becomes ena> with vis and ena
      toggle call with vis false and ena true
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, []);
    
    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(1);
    
    const instance = result.instances[0];
    expect(instance.properties.visible).toBe(false);
    expect(instance.properties.enabled).toBe(true);
  });

  it('should handle complex expressions with parameters', () => {
    const code = `
      BoxMorph is a Class
      BoxMorph has field "width" has default 100
      BoxMorph has field "height" has default 50
      
      box is a BoxMorph
      calculate is <box.width becomes box.width * multiplier + offset> with multiplier and offset
      calculate call with multiplier 2 and offset 25
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, []);
    
    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(1);
    
    const instance = result.instances[0];
    expect(instance.properties.width).toBe(225); // 100 * 2 + 25
  });

  it('should work with existing instances', () => {
    const existingInstances = [{
      name: 'myBox',
      className: 'BoxMorph',
      properties: {
        width: 200,
        height: 100,
        label: 'My Box'
      }
    }];

    const code = `
      scale is <myBox.width becomes myBox.width * factor; myBox.height becomes myBox.height * factor> with factor
      scale call with factor 1.5
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, existingInstances);
    
    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(1);
    
    const instance = result.instances[0];
    expect(instance.name).toBe('myBox');
    expect(instance.properties.width).toBe(300); // 200 * 1.5
    expect(instance.properties.height).toBe(150); // 100 * 1.5
  });

  it('should handle mixed parameter types in one call', () => {
    const code = `
      BoxMorph is a Class
      BoxMorph has field "width" has default 100
      BoxMorph has field "label" has default "Box"
      BoxMorph has field "visible" has default true
      
      box is a BoxMorph
      setup is <box.width becomes size; box.label becomes name; box.visible becomes show> with size and name and show
      setup call with size 150 and name "Custom Box" and show false
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, []);
    
    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(1);
    
    const instance = result.instances[0];
    expect(instance.properties.width).toBe(150);
    expect(instance.properties.label).toBe("Custom Box");
    expect(instance.properties.visible).toBe(false);
  });

  it('should execute block without parameters (backward compatibility)', () => {
    const code = `
      BoxMorph is a Class
      BoxMorph has field "width" has default 100
      
      boxA is a BoxMorph
      simple is <boxA.width becomes boxA.width + 10>
      simple call
    `;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, []);
    
    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(1);
    
    const instance = result.instances[0];
    expect(instance.properties.width).toBe(110); // 100 + 10
  });
});