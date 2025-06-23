import { describe, it, expect } from 'vitest';
import { parseObjaxWithClasses } from '../objaxEngine';
import { presetUIClasses } from '../presetClasses';

describe('Existing Instance Debug', () => {
  it('should debug existing instance becomes assignment', () => {
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

    console.log('=== Existing Instance Input ===');
    console.log('Input width:', existingInstances[0].properties.width);

    const code = `myBox.width becomes myBox.width + 100`;
    
    console.log('=== Code to Execute ===');
    console.log(code);
    
    const result = parseObjaxWithClasses(code, presetUIClasses, existingInstances);
    
    console.log('=== Result ===');
    console.log('Errors:', result.errors);
    console.log('Instance count:', result.instances.length);
    console.log('Instance properties:', result.instances[0]?.properties);
    console.log('Final width:', result.instances[0]?.properties.width);
    
    expect(result.errors).toHaveLength(0);
    expect(result.instances).toHaveLength(1);
    expect(result.instances[0].properties.width).toBe(300);
  });
});