import type { ObjaxExecutionResult, ObjaxClassDefinition, ObjaxInstanceDefinition, ObjaxMethodCall, ObjaxListOperation, ObjaxVariableAssignment, ObjaxPrintStatement, ObjaxConnection, ObjaxMorphOperation, ObjaxMessageExecution } from './types'
import { LinearObjaxParser } from './linearParser'

export class ObjaxExecutor {
  execute(result: ObjaxExecutionResult): ObjaxExecutionResult {
    const instances = [...result.instances]
    const errors = [...result.errors]
    const printStatements = [...result.printStatements]

    // Process instances - no special constructor argument handling needed
    // All properties are now passed as keyword arguments directly

    // Execute method calls
    for (const methodCall of result.methodCalls) {
      try {
        this.executeMethodCall(methodCall, instances, result.classes)
      } catch (error) {
        errors.push(`Error executing method call: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Execute list operations
    for (const listOp of result.listOperations) {
      try {
        this.executeListOperation(listOp, instances)
      } catch (error) {
        errors.push(`Error executing list operation: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Execute connections
    for (const connection of result.connections) {
      try {
        this.executeConnection(connection, instances)
      } catch (error) {
        errors.push(`Error executing connection: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Execute morph operations
    for (const morphOp of result.morphOperations) {
      try {
        this.executeMorphOperation(morphOp, instances)
      } catch (error) {
        errors.push(`Error executing morph operation: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Execute message executions
    for (const messageExecution of result.messageExecutions) {
      try {
        this.executeMessageExecution(messageExecution, instances, result.classes)
      } catch (error) {
        errors.push(`Error executing message: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Print statements are already parsed and included in printStatements
    // No additional execution needed - they will be displayed by the UI

    return {
      ...result,
      instances,
      errors,
      printStatements
    }
  }

  private executeMethodCall(
    methodCall: ObjaxMethodCall,
    instances: ObjaxInstanceDefinition[],
    classes: ObjaxClassDefinition[]
  ) {
    const instance = instances.find(i => i.name === methodCall.instanceName)
    if (!instance) {
      throw new Error(`Instance "${methodCall.instanceName}" not found`)
    }

    // Handle special "open" method
    if (methodCall.methodName === 'open') {
      // Set isOpen property to true for the instance
      instance.properties.isOpen = true
      return
    }

    // Handle special "remove" method
    if (methodCall.methodName === 'remove') {
      // Set isOpen property to false for the instance
      instance.properties.isOpen = false
      return
    }

    // Handle State class special methods
    if (instance.className === 'State') {
      if (methodCall.methodName === 'set' && methodCall.parameters && methodCall.parameters.length > 0) {
        // Set the State's value
        instance.properties.value = methodCall.parameters[0]
        return
      }
      if (methodCall.methodName === 'get') {
        // Return the State's value (for now, just log it)
        console.log(`State "${instance.properties.name || instance.name}" value:`, instance.properties.value)
        return
      }
    }

    const instanceClass = classes.find(c => c.name === instance.className)
    if (!instanceClass) {
      throw new Error(`Class "${instance.className}" not found`)
    }
    
    const method = instanceClass.methods.find(m => m.name === methodCall.methodName)
    if (!method) {
      throw new Error(`Method "${methodCall.methodName}" not found in class "${instance.className}". Available methods: ${instanceClass.methods.map(m => m.name).join(', ')}`)
    }

    // Execute method body - for now, only handle simple field assignments
    this.executeMethodBody(method.body, instance, methodCall.parameters, instances)
  }

  private resolveParameterValue(param: any, instances: ObjaxInstanceDefinition[]): any {
    if (param && typeof param === 'object' && param.type === 'field_reference') {
      // Resolve field reference: field "fieldName" of instanceName
      const targetInstance = instances.find(i => i.name === param.instanceName)
      if (!targetInstance) {
        throw new Error(`Instance "${param.instanceName}" not found for field reference`)
      }
      return targetInstance.properties[param.fieldName]
    }
    return param
  }

  private executeMethodBody(body: string, instance: ObjaxInstanceDefinition, parameters?: any[], instances?: ObjaxInstanceDefinition[]) {
    if (!body) {
      throw new Error(`Method body is undefined or empty`)
    }
    
    if (typeof body !== 'string') {
      throw new Error(`Method body is not a string: ${typeof body}`)
    }
    
    if (body.trim() === '') {
      throw new Error(`Method body is empty`)
    }

    // Handle different method body patterns
    
    // Pattern 1: "set field \"fieldName\" of myself to value"
    const setFieldMatch = body.match(/set field "([^"]+)" of myself to (.+)/)
    if (setFieldMatch) {
      const fieldName = setFieldMatch[1]
      let valueStr = setFieldMatch[2]
      
      // Replace parameter placeholders with actual values
      if (parameters && instances) {
        parameters.forEach((param, index) => {
          const resolvedValue = this.resolveParameterValue(param, instances)
          const paramName = `param${index + 1}` // Could be more sophisticated
          valueStr = valueStr.replace(new RegExp(`\\b${paramName}\\b`, 'g'), typeof resolvedValue === 'string' ? `"${resolvedValue}"` : String(resolvedValue))
        })
        
        // Also handle simple "parameter" keyword
        if (valueStr === 'parameter' && parameters.length > 0) {
          const resolvedValue = this.resolveParameterValue(parameters[0], instances)
          valueStr = typeof resolvedValue === 'string' ? `"${resolvedValue}"` : String(resolvedValue)
        }
      }
      
      let value: any
      if (valueStr === 'true') {
        value = true
      } else if (valueStr === 'false') {
        value = false
      } else if (!isNaN(Number(valueStr))) {
        value = Number(valueStr)
      } else if (valueStr.startsWith('"') && valueStr.endsWith('"')) {
        value = valueStr.slice(1, -1) // Remove quotes
      } else {
        // Check if it's a parameter reference
        if (parameters && parameters.length > 0 && instances) {
          // For now, just use the first parameter
          value = this.resolveParameterValue(parameters[0], instances)
        } else {
          value = valueStr
        }
      }
      
      instance.properties[fieldName] = value
      return
    }

    // Pattern 2: Handle complex method body with multiple statements
    // Split by "and" to handle multiple statements
    const statements = body.split(' and ').map(s => s.trim());
    
    for (const statement of statements) {
      // Handle instance creation: "varName is a new ClassName with param"
      const instanceCreationMatch = statement.match(/(\w+) is a new (\w+) with (\w+)/);
      if (instanceCreationMatch) {
        const [, varName, className, paramName] = instanceCreationMatch;
        const paramValue = parameters && parameters.length > 0 && instances ? this.resolveParameterValue(parameters[0], instances) : paramName;
        
        // For now, we'll store this as a temporary variable in the instance
        // In a more complete implementation, this would create a proper instance
        instance.properties[varName] = {
          className: className,
          properties: { [paramName]: paramValue }
        };
        continue;
      }
      
      // Handle list operations: "add varName to fieldName of myself"
      const addVarToListMatch = statement.match(/add (\w+) to (\w+) of myself/);
      if (addVarToListMatch) {
        const [, varName, fieldName] = addVarToListMatch;
        
        const currentList = instance.properties[fieldName] || [];
        
        // If varName is a temporary variable (created above), use its value
        if (instance.properties[varName]) {
          instance.properties[fieldName] = [...currentList, instance.properties[varName]];
          // Clean up temporary variable
          delete instance.properties[varName];
        } else {
          // Otherwise, use the parameter value
          const valueToAdd = parameters && parameters.length > 0 && instances ? this.resolveParameterValue(parameters[0], instances) : varName;
          instance.properties[fieldName] = [...currentList, valueToAdd];
        }
        continue;
      }
      
      // Handle simple list operations: "add param to \"items\" of myself"
      const addToListMatch = statement.match(/add (\w+) to "([^"]+)" of myself/);
      if (addToListMatch) {
        const [, paramName, fieldName] = addToListMatch;
        const currentList = instance.properties[fieldName] || [];
        const valueToAdd = parameters && parameters.length > 0 && instances ? this.resolveParameterValue(parameters[0], instances) : paramName;
        instance.properties[fieldName] = [...currentList, valueToAdd];
      }
    }
    
    return; // If we processed statements successfully

    // Pattern 3: Simple parameter assignment to field
    if (parameters && parameters.length > 0) {
      // If no specific pattern matches, try to find a field to assign the parameter to
      // This is a fallback for simple cases
      const fieldPattern = body.match(/"([^"]+)"/)
      if (fieldPattern) {
        const fieldName = fieldPattern[1]
        instance.properties[fieldName] = parameters[0]
        return
      }
    }

    throw new Error(`Unsupported method body: ${body}`)
  }

  private executeListOperation(
    listOp: ObjaxListOperation,
    instances: ObjaxInstanceDefinition[]
  ) {
    const instance = instances.find(i => i.name === listOp.targetInstance)
    if (!instance) {
      throw new Error(`Instance "${listOp.targetInstance}" not found`)
    }

    const currentList = instance.properties[listOp.listField] || []
    
    switch (listOp.operation) {
      case 'add':
        instance.properties[listOp.listField] = [...currentList, listOp.item]
        break
      case 'remove':
        instance.properties[listOp.listField] = currentList.filter((item: any) => item !== listOp.item)
        break
      case 'set':
        instance.properties[listOp.listField] = [listOp.item]
        break
      default:
        throw new Error(`Unsupported list operation: ${listOp.operation}`)
    }
  }

  private executeConnection(
    connection: ObjaxConnection,
    instances: ObjaxInstanceDefinition[]
  ) {
    const targetInstance = instances.find(i => i.name === connection.targetInstance)
    if (!targetInstance) {
      throw new Error(`Target instance "${connection.targetInstance}" not found`)
    }

    const sourceInstance = instances.find(i => i.name === connection.sourceInstance)
    if (!sourceInstance) {
      throw new Error(`Source instance "${connection.sourceInstance}" not found`)
    }

    // Check if both instances are on the same page
    const targetPage = targetInstance.properties.page
    const sourcePage = sourceInstance.properties.page
    
    if (targetPage !== sourcePage) {
      throw new Error(`Cannot connect instances from different pages: "${connection.sourceInstance}" (page: ${sourcePage}) to "${connection.targetInstance}" (page: ${targetPage})`)
    }

    // Set the dataSource property on the target instance
    targetInstance.properties.dataSource = connection.sourceInstance
  }

  private executeMorphOperation(
    morphOp: ObjaxMorphOperation,
    instances: ObjaxInstanceDefinition[]
  ) {
    const childInstance = instances.find(i => i.name === morphOp.childInstance)
    if (!childInstance) {
      throw new Error(`Child instance "${morphOp.childInstance}" not found`)
    }

    const parentInstance = instances.find(i => i.name === morphOp.parentInstance)
    if (!parentInstance) {
      throw new Error(`Parent instance "${morphOp.parentInstance}" not found`)
    }

    // Check if both instances are on the same page
    const childPage = childInstance.properties.page
    const parentPage = parentInstance.properties.page
    
    if (childPage !== parentPage) {
      throw new Error(`Cannot add instances from different pages: "${morphOp.childInstance}" (page: ${childPage}) to "${morphOp.parentInstance}" (page: ${parentPage})`)
    }

    if (morphOp.operation === 'add') {
      // Add child to parent's children array
      const currentChildren = parentInstance.properties.children || []
      if (!currentChildren.includes(childInstance.properties.id)) {
        parentInstance.properties.children = [...currentChildren, childInstance.properties.id]
      }
      
      // Set parent reference on child
      childInstance.properties.parentId = parentInstance.properties.id
    }
  }

  private executeMessageExecution(
    messageExecution: ObjaxMessageExecution,
    instances: ObjaxInstanceDefinition[],
    classes: ObjaxClassDefinition[]
  ) {
    const targetInstance = instances.find(i => i.name === messageExecution.targetInstance)
    if (!targetInstance) {
      throw new Error(`Target instance "${messageExecution.targetInstance}" not found`)
    }

    // Parse the code with 'it' context - replace 'it' with the target instance name
    const contextualCode = messageExecution.code.replace(/\bit\b/g, messageExecution.targetInstance)
    
    // Execute the contextual code by creating a sub-parser
    // For now, we'll implement a simple substitution and re-parse approach
    // This is a simplified implementation - in a full system you'd want proper context handling
    
    const parser = new LinearObjaxParser()
    
    try {
      const subResult = parser.parse(contextualCode)
      
      // Execute any method calls from the message context
      for (const methodCall of subResult.methodCalls) {
        this.executeMethodCall(methodCall, instances, classes)
      }
      
      // Execute any state operations from the message context
      for (const stateOp of subResult.stateOperations) {
        // Note: State operations would need access to the global state store
        // For now we'll handle basic field updates
        // This is a simplified implementation
      }
    } catch (error) {
      throw new Error(`Failed to execute message code: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}