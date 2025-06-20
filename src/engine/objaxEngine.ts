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
    const parseResult = this.parser.parse(code);
    
    // Merge existing classes and instances with newly parsed ones
    const mergedResult = {
      ...parseResult,
      classes: [...existingClasses, ...parseResult.classes],
      instances: [...existingInstances, ...parseResult.instances]
    };
    
    return this.executor.execute(mergedResult);
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
  return {
    name: objaxInstance.name,
    className: objaxInstance.className,
    properties: {
      ...objaxInstance,
      // Include all the UI properties as part of the instance properties
      label: objaxInstance.label,
      value: objaxInstance.value,
      items: objaxInstance.items,
      children: objaxInstance.children,
      dataSource: objaxInstance.dataSource,
      viewMode: objaxInstance.viewMode,
      columns: objaxInstance.columns
    }
  };
}

// Convenience function that accepts ObjaxClass and ObjaxInstance arrays
export function parseObjaxWithClasses(code: string, existingClasses: ObjaxClass[] = [], existingInstances: ObjaxInstance[] = []): ObjaxExecutionResult {
  const classDefinitions = existingClasses.map(convertToClassDefinition);
  const instanceDefinitions = existingInstances.map(convertToInstanceDefinition);
  return parseObjax(code, classDefinitions, instanceDefinitions);
}
