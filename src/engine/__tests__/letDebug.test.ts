import { describe, it, expect } from 'vitest';
import { parseObjaxWithClasses } from '../objaxEngine';
import { presetUIClasses } from '../presetClasses';

describe('Let Assignment Debug', () => {
  it('should debug simple assignment vs expression assignment', () => {
    console.log('=== Simple Assignment (WORKS) ===');
    const code1 = `
      box is a BoxMorph
      let box.width be 500
    `;
    
    const result1 = parseObjaxWithClasses(code1, presetUIClasses, []);
    console.log('Instance properties:', result1.instances[0].properties);
    
    console.log('=== Expression Assignment (FAILS) ===');
    const code2 = `
      box is a BoxMorph
      let box.width be box.width + 50
    `;
    
    try {
      const result2 = parseObjaxWithClasses(code2, presetUIClasses, []);
      console.log('Instance properties:', result2.instances[0].properties);
    } catch (error) {
      console.log('Error:', error.message);
      
      // Let's check the raw parsing result without execution
      console.log('=== Raw Parsing ===');
      const { LinearObjaxParser } = await import('../linearParser');
      const parser = new LinearObjaxParser();
      const parseResult = parser.parse(code2);
      console.log('Parse errors:', parseResult.errors);
      console.log('Instances:', parseResult.instances);
      console.log('Let assignments:', parseResult.letAssignments);
      if (parseResult.instances.length > 0) {
        console.log('Instance properties:', parseResult.instances[0].properties);
      }
    }
  });
});