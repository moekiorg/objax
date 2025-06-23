import { LinearObjaxParser } from './linearParser';
import { ObjaxExecutor } from './executor';
import type { ObjaxExecutionResult, ObjaxClassDefinition, ObjaxInstanceDefinition } from './types';
import type { ObjaxClass, ObjaxInstance } from '../types';

export class ObjaxEngine {
  private parser: LinearObjaxParser;
  private executor: ObjaxExecutor;

  constructor() {
    this.parser = new LinearObjaxParser();
    this.executor = new ObjaxExecutor();
  }

  execute(code: string, existingClasses: ObjaxClassDefinition[] = [], existingInstances: ObjaxInstanceDefinition[] = []): ObjaxExecutionResult {
    console.log('ObjaxEngine: Executing code with', existingClasses.length, 'existing classes');
    const parseResult = this.parser.parse(code, existingInstances);
    console.log('ObjaxEngine: Parse result classes:', parseResult.classes.length);
    console.log('ObjaxEngine: Parse result class names:', parseResult.classes.map(c => c.name));
    
    // Merge classes, handling duplicates by combining fields and methods
    const mergedClasses = this.mergeClasses(existingClasses, parseResult.classes);
    console.log('ObjaxEngine: Merged classes:', mergedClasses.length);
    console.log('ObjaxEngine: Merged class names:', mergedClasses.map(c => c.name));
    
    const mergedResult = {
      ...parseResult,
      classes: mergedClasses,
      instances: [...existingInstances, ...parseResult.instances]
    };
    
    return this.executor.execute(mergedResult, existingClasses);
  }

  // Execute a block by name
  executeBlock(blockName: string, instances: ObjaxInstanceDefinition[] = [], allClasses: ObjaxClassDefinition[] = []): ObjaxExecutionResult {
    return this.executor.executeBlock(blockName, instances, allClasses);
  }

  // Get all registered blocks
  getRegisteredBlocks(): Map<string, string> {
    return this.executor.getRegisteredBlocks();
  }

  private mergeClasses(existing: ObjaxClassDefinition[], parsed: ObjaxClassDefinition[]): ObjaxClassDefinition[] {
    const classMap = new Map<string, ObjaxClassDefinition>();
    
    // Add existing classes to map
    for (const cls of existing) {
      classMap.set(cls.name, { ...cls });
    }
    
    // Merge or add parsed classes
    for (const cls of parsed) {
      const existingClass = classMap.get(cls.name);
      if (existingClass) {
        // Merge fields (avoid duplicates)
        const existingFieldNames = new Set(existingClass.fields.map(f => f.name));
        const newFields = cls.fields.filter(f => !existingFieldNames.has(f.name));
        
        // Merge methods (avoid duplicates)
        const existingMethodNames = new Set(existingClass.methods.map(m => m.name));
        const newMethods = cls.methods.filter(m => !existingMethodNames.has(m.name));
        
        classMap.set(cls.name, {
          ...existingClass,
          fields: [...existingClass.fields, ...newFields],
          methods: [...existingClass.methods, ...newMethods]
        });
      } else {
        classMap.set(cls.name, { ...cls });
      }
    }
    
    return Array.from(classMap.values());
  }
}

// Convenience function for direct usage
export function parseObjax(code: string, existingClasses: ObjaxClassDefinition[] = [], existingInstances: ObjaxInstanceDefinition[] = []): ObjaxExecutionResult {
  const engine = new ObjaxEngine();
  const result = engine.execute(code, existingClasses, existingInstances);
  
  // If there are any errors, throw an exception
  if (result.errors.length > 0) {
    throw new Error(result.errors[0]);
  }
  
  return result;
}

// Convert ObjaxClass to ObjaxClassDefinition
export function convertToClassDefinition(objaxClass: ObjaxClass): ObjaxClassDefinition {
  const result = {
    name: objaxClass.name,
    fields: objaxClass.fields.map(field => ({
      name: field.name,
      defaultValue: field.default
    })),
    methods: objaxClass.methods.map(method => {
      // Handle both old format (code) and new format (body)
      const methodBody = (method as any).body || method.code || '';
      return {
        name: method.name,
        parameters: [], // Legacy methods don't have parameters
        body: methodBody
      };
    })
  };
  
  return result;
}

// Convert ObjaxInstance to ObjaxInstanceDefinition
export function convertToInstanceDefinition(objaxInstance: ObjaxInstance): ObjaxInstanceDefinition {
  // If properties exist, use them directly; otherwise, extract from objaxInstance
  const properties = objaxInstance.properties || {
    // Include all the UI properties as part of the instance properties
    label: objaxInstance.label,
    value: objaxInstance.value,
    items: objaxInstance.items,
    children: objaxInstance.children,
    dataSource: objaxInstance.dataSource,
    viewMode: objaxInstance.viewMode,
    columns: objaxInstance.columns,
    width: objaxInstance.width,
    height: objaxInstance.height,
    backgroundColor: objaxInstance.backgroundColor,
    borderColor: objaxInstance.borderColor,
    borderWidth: objaxInstance.borderWidth,
    borderRadius: objaxInstance.borderRadius,
    padding: objaxInstance.padding,
    margin: objaxInstance.margin,
    textColor: objaxInstance.textColor,
    fontSize: objaxInstance.fontSize,
    fontWeight: objaxInstance.fontWeight,
    textAlign: objaxInstance.textAlign,
    display: objaxInstance.display,
    position: objaxInstance.position,
    opacity: objaxInstance.opacity,
    boxShadow: objaxInstance.boxShadow,
  };

  return {
    name: objaxInstance.name,
    className: objaxInstance.className,
    properties
  };
}

// Convenience function that accepts ObjaxClass and ObjaxInstance arrays
export function parseObjaxWithClasses(code: string, existingClasses: ObjaxClass[] = [], existingInstances: ObjaxInstance[] = []): ObjaxExecutionResult {
  const classDefinitions = existingClasses.map(convertToClassDefinition);
  const instanceDefinitions = existingInstances.map(convertToInstanceDefinition);
  return parseObjax(code, classDefinitions, instanceDefinitions);
}
