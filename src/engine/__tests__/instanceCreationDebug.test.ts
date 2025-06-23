import { describe, it, expect } from 'vitest';
import { parseObjaxWithClasses } from '../objaxEngine';
import { presetUIClasses } from '../presetClasses';

describe('Instance Creation Debug', () => {
  it('should debug BoxMorph instance creation', () => {
    const code = `box is a BoxMorph`;
    
    const result = parseObjaxWithClasses(code, presetUIClasses, []);
    
    console.log('=== BoxMorph Instance Creation ===');
    console.log('Errors:', result.errors);
    console.log('Instances:', result.instances);
    console.log('Instance properties:', result.instances[0]?.properties);
    console.log('Expected width:', 100);
    console.log('Expected height:', 50);
    
    expect(result.instances).toHaveLength(1);
    expect(result.instances[0].properties.width).toBe(100);
    expect(result.instances[0].properties.height).toBe(50);
  });
});