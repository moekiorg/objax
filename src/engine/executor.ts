import type { ObjaxExecutionResult, ObjaxClassDefinition, ObjaxInstanceDefinition, ObjaxMethodCall, ObjaxListOperation, ObjaxVariableAssignment, ObjaxFieldAssignment, ObjaxPrintStatement, ObjaxConnection, ObjaxMorphOperation, ObjaxMessageExecution, ObjaxInstanceConfiguration, ObjaxEventListener, ObjaxBlockAssignment, ObjaxBlockCall, ObjaxBecomesAssignment, ObjaxExpression, ObjaxTimerOperation, ObjaxConditionalExecution, ObjaxConditionalOtherwiseExecution, ObjaxCondition } from './types'
import { LinearObjaxParser } from './linearParser'

export class ObjaxExecutor {
  private pageNavigations: any[] = []
  private blockRegistry: Map<string, string> = new Map()
  private blockParameters: Map<string, string[]> = new Map()
  private conditionalBlockRegistry: Map<string, ObjaxCondition> = new Map()
  private timers: Map<string, number> = new Map()
  
  execute(result: ObjaxExecutionResult, allClasses: ObjaxClassDefinition[] = []): ObjaxExecutionResult {
    const instances = [...result.instances]
    const errors = [...result.errors]
    const printStatements = [...result.printStatements]
    this.pageNavigations = [...result.pageNavigations]

    // Process instances - apply default values from class definitions
    // Combine parsed classes with passed allClasses (including presets)
    const combinedClasses = [...result.classes, ...allClasses]
    for (const instance of instances) {
      try {
        // Generate ID if not present
        if (!instance.properties.id) {
          instance.properties.id = `${instance.name}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
        }
        this.applyDefaultValues(instance, combinedClasses)
      } catch (error) {
        errors.push(`Error applying default values to instance "${instance.name}": ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Process block assignments
    for (const blockAssignment of result.blockAssignments || []) {
      try {
        this.blockRegistry.set(blockAssignment.blockName, blockAssignment.blockBody)
        if (blockAssignment.parameters) {
          this.blockParameters.set(blockAssignment.blockName, blockAssignment.parameters)
        }
      } catch (error) {
        errors.push(`Error processing block assignment: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Process conditional blocks
    for (const conditionalBlock of result.conditionalBlocks || []) {
      try {
        this.conditionalBlockRegistry.set(conditionalBlock.blockName, conditionalBlock.condition)
      } catch (error) {
        errors.push(`Error processing conditional block: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Execute conditional executions
    for (const conditionalExecution of result.conditionalExecutions || []) {
      try {
        this.executeConditionalExecution(conditionalExecution, instances, allClasses)
      } catch (error) {
        errors.push(`Error executing conditional execution: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Execute conditional otherwise executions
    for (const conditionalOtherwiseExecution of result.conditionalOtherwiseExecutions || []) {
      try {
        this.executeConditionalOtherwiseExecution(conditionalOtherwiseExecution, instances, allClasses)
      } catch (error) {
        errors.push(`Error executing conditional otherwise execution: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Execute becomes assignments FIRST (before method calls)
    for (const becomesAssignment of result.becomesAssignments || []) {
      try {
        this.executeBecomesAssignment(becomesAssignment, instances)
      } catch (error) {
        errors.push(`Error executing becomes assignment: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Execute field assignments BEFORE method calls (so field values are available)
    for (const fieldAssignment of result.fieldAssignments || []) {
      try {
        this.executeFieldAssignment(fieldAssignment, instances)
      } catch (error) {
        errors.push(`Error executing field assignment: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Execute method calls
    for (const methodCall of result.methodCalls) {
      try {
        this.executeMethodCall(methodCall, instances, result.classes)
      } catch (error) {
        errors.push(`Error executing method call: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Execute list operations
    for (const listOp of result.listOperations || []) {
      try {
        this.executeListOperation(listOp, instances)
      } catch (error) {
        errors.push(`Error executing list operation: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Execute connections
    for (const connection of result.connections || []) {
      try {
        this.executeConnection(connection, instances)
      } catch (error) {
        errors.push(`Error executing connection: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Execute morph operations
    for (const morphOp of result.morphOperations || []) {
      try {
        this.executeMorphOperation(morphOp, instances)
      } catch (error) {
        errors.push(`Error executing morph operation: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Execute message executions
    for (const messageExecution of result.messageExecutions || []) {
      try {
        this.executeMessageExecution(messageExecution, instances, result.classes)
      } catch (error) {
        errors.push(`Error executing message: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Execute block calls
    for (const blockCall of result.blockCalls || []) {
      try {
        const blockResult = this.executeBlockWithArguments(blockCall.blockName, instances, allClasses, blockCall.arguments)
        // Merge the block execution results back into current instances
        instances.splice(0, instances.length, ...blockResult.instances)
        errors.push(...blockResult.errors)
      } catch (error) {
        errors.push(`Error executing block call: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Execute instance configurations
    for (const config of result.instanceConfigurations || []) {
      try {
        this.executeInstanceConfiguration(config, instances)
      } catch (error) {
        errors.push(`Error executing instance configuration: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Event listeners are attached to instances, no execution needed here
    // They will be processed by the UI components
    for (const eventListener of result.eventListeners || []) {
      try {
        this.attachEventListener(eventListener, instances)
      } catch (error) {
        errors.push(`Error attaching event listener: ${error instanceof Error ? error.message : String(error)}`)
      }
    }


    // Execute timer operations
    for (const timerOperation of result.timerOperations || []) {
      try {
        this.executeTimerOperation(timerOperation, instances)
      } catch (error) {
        errors.push(`Error executing timer operation: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Print statements are already parsed and included in printStatements
    // No additional execution needed - they will be displayed by the UI

    return {
      ...result,
      instances,
      errors,
      printStatements,
      pageNavigations: this.pageNavigations
    }
  }

  private executeMethodCall(
    methodCall: ObjaxMethodCall,
    instances: ObjaxInstanceDefinition[],
    classes: ObjaxClassDefinition[]
  ) {
    // Handle special "create" method
    if (methodCall.methodName === 'create') {
      this.executeCreateMethod(methodCall, instances, classes)
      return
    }
    
    // Handle doAll method for class-level operations (before instance lookup)
    if (methodCall.methodName === 'doAll') {
      if (methodCall.keywordParameters && methodCall.keywordParameters.action) {
        const actionName = methodCall.keywordParameters.action
        const className = methodCall.instanceName // When called on a class
        
        // Find all instances of the specified class
        const classInstances = instances.filter(inst => inst.className === className)
        
        // Execute the action block on each instance
        const blockBody = this.blockRegistry.get(actionName)
        if (blockBody) {
          for (const instance of classInstances) {
            try {
              // Replace "self" with the instance name in the block body
              const instanceSpecificBody = blockBody.replace(/\bself\b/g, instance.name)
              
              // Parse and execute the modified block body
              const parser = new LinearObjaxParser()
              const blockResult = parser.parse(instanceSpecificBody, instances)
              this.execute(blockResult)
            } catch (error) {
              console.error(`Error executing doAll action ${actionName} on ${instance.name}:`, error)
            }
          }
        }
        return
      }
    }

    let instance = instances.find(i => i.name === methodCall.instanceName)
    
    // Auto-create world instance if it doesn't exist and methodName is goto
    if (!instance && methodCall.instanceName === 'world' && methodCall.methodName === 'goto') {
      const worldInstance: ObjaxInstanceDefinition = {
        name: 'world',
        className: 'World',
        properties: { currentPage: '' }
      }
      instances.push(worldInstance)
      instance = worldInstance
    }
    
    if (!instance) {
      throw new Error(`Instance "${methodCall.instanceName}" not found`)
    }

    // Handle special "open" method
    if (methodCall.methodName === 'open') {
      // Set isOpen property to true for the instance
      instance.properties.isOpen = true
      return
    }

    // Handle Range "run" method
    if (instance.className === 'Range' && methodCall.methodName === 'run') {
      this.executeRangeRun(instance, methodCall, instances)
      return
    }

    // Handle Judgement "thenDo" and "otherwiseDo" methods
    if (instance.className === 'Judgement') {
      if (methodCall.methodName === 'thenDo') {
        this.executeJudgementThenDo(instance, methodCall, instances)
        return
      } else if (methodCall.methodName === 'otherwiseDo') {
        this.executeJudgementOtherwiseDo(instance, methodCall, instances)
        return
      }
    }

    // Handle special "remove" method
    if (methodCall.methodName === 'remove') {
      // Set isOpen property to false for the instance
      instance.properties.isOpen = false
      return
    }

    // Handle List class special methods
    if (instance.className === 'List') {
      if (methodCall.methodName === 'push' && methodCall.parameters && methodCall.parameters.length > 0) {
        // Add item to the list
        if (!Array.isArray(instance.properties.items)) {
          instance.properties.items = [];
        }
        instance.properties.items.push(methodCall.parameters[0]);
        return;
      }
      if (methodCall.methodName === 'size') {
        // Return the size of the list
        return Array.isArray(instance.properties.items) ? instance.properties.items.length : 0;
      }
    }

    // Handle State class special methods
    if (instance.className === 'State') {
      if (methodCall.methodName === 'set' && methodCall.parameters && methodCall.parameters.length > 0) {
        // Set the State's value
        instance.properties.value = methodCall.parameters?.[0]
        return
      }
      if (methodCall.methodName === 'get') {
        // Return the State's value (for now, just log it)
        return
      }
    }

    // Handle World class goto method
    if (instance.className === 'World' && methodCall.methodName === 'goto') {
      if (methodCall.keywordParameters && methodCall.keywordParameters.page) {
        // Set the current page
        instance.properties.currentPage = methodCall.keywordParameters.page
        // Trigger page navigation (add to pageNavigations array)
        const pageNavigation = {
          pageName: methodCall.keywordParameters.page
        }
        this.pageNavigations.push(pageNavigation)
        return
      }
    }

    // Handle Timer class repeat method
    if (instance.className === 'Timer' && methodCall.methodName === 'repeat') {
      if (methodCall.keywordParameters && methodCall.keywordParameters.time && methodCall.keywordParameters.action) {
        const timeValue = methodCall.keywordParameters.time
        const actionName = methodCall.keywordParameters.action
        
        // Parse time (for now, assume "X second" format)
        let intervalMs = 1000 // default 1 second
        if (typeof timeValue === 'string') {
          const timeMatch = timeValue.match(/(\d+)\s*(second|seconds|ms|milliseconds)/)
          if (timeMatch) {
            const amount = parseInt(timeMatch[1])
            const unit = timeMatch[2]
            if (unit.startsWith('second')) {
              intervalMs = amount * 1000
            } else if (unit.startsWith('ms') || unit.startsWith('millisecond')) {
              intervalMs = amount
            }
          }
        }

        // Clear any existing timer for this instance
        const timerId = `${methodCall.instanceName}_timer`
        if (this.timers.has(timerId)) {
          clearInterval(this.timers.get(timerId)!)
        }

        // Execute the action block
        const executeAction = () => {
          const blockBody = this.blockRegistry.get(actionName)
          if (blockBody) {
            try {
              // Parse and execute the block body
              const parser = new LinearObjaxParser()
              const blockResult = parser.parse(blockBody, instances)
              this.execute(blockResult)
            } catch (error) {
              console.error(`Error executing timer action ${actionName}:`, error)
            }
          }
        }

        // Start the timer
        const timer = setInterval(executeAction, intervalMs)
        this.timers.set(timerId, timer)
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

    // Execute method body with keyword parameters and positional parameters
    this.executeMethodBody(method.body, instance, methodCall.keywordParameters, instances, methodCall.parameters)
  }

  private resolveParameterValue(param: any, instances: ObjaxInstanceDefinition[]): any {
    if (param && typeof param === 'object' && param.type === 'field_reference') {
      // Resolve field reference: field "fieldName" of instanceName
      const targetInstance = instances.find(i => i.name === param.instanceName)
      if (!targetInstance) {
        throw new Error(`Instance "${param.instanceName}" not found for field reference`)
      }
      const fieldValue = targetInstance.properties[param.fieldName]
      
      // If the field value is an array with a single element, return the element
      // This handles the case where field assignments create single-element arrays
      if (Array.isArray(fieldValue) && fieldValue.length === 1) {
        return fieldValue[0]
      }
      
      return fieldValue
    }
    return param
  }

  private executeMethodBody(body: string, instance: ObjaxInstanceDefinition, keywordParameters?: Record<string, any>, instances?: ObjaxInstanceDefinition[], positionalParameters?: any[]) {
    
    if (!body) {
      throw new Error(`Method body is undefined or empty`)
    }
    
    if (typeof body !== 'string') {
      throw new Error(`Method body is not a string: ${typeof body}`)
    }
    
    if (body.trim() === '') {
      throw new Error(`Method body is empty`)
    }

    // First, process variable expansion {variable} before executing
    let processedBody = this.expandVariables(body, instance, keywordParameters, instances, positionalParameters);
    
    // Split by dots, but preserve instance.field patterns
    const statements = this.smartSplitStatements(processedBody);
    
    // Generate unique names for instances created in method execution
    let createdInstanceName = '';
    let originalInstanceName = '';
    
    for (const statement of statements) {
      // If this is an instance creation statement, generate unique name
      if (statement.includes(' is a ') && statement.includes(' with ')) {
        const instanceCreationMatch = statement.match(/(\w+)\s+is\s+a\s+(\w+)/);
        if (instanceCreationMatch) {
          originalInstanceName = instanceCreationMatch[1];
          createdInstanceName = `${originalInstanceName}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
          
          // Replace the instance name in this statement
          const modifiedStatement = statement.replace(new RegExp(`\\b${originalInstanceName}\\b`, 'g'), createdInstanceName);
          this.executeStatement(modifiedStatement, instance, keywordParameters, instances, positionalParameters);
        } else {
          this.executeStatement(statement, instance, keywordParameters, instances, positionalParameters);
        }
      } else if (statement.includes(' push ') && originalInstanceName && createdInstanceName) {
        // Replace the original instance name with the created unique name in push statements
        const modifiedStatement = statement.replace(new RegExp(`\\b${originalInstanceName}\\b`, 'g'), createdInstanceName);
        this.executeStatement(modifiedStatement, instance, keywordParameters, instances, positionalParameters);
      } else {
        this.executeStatement(statement, instance, keywordParameters, instances, positionalParameters);
      }
    }
  }

  private expandVariables(body: string, instance: ObjaxInstanceDefinition, keywordParameters?: Record<string, any>, instances?: ObjaxInstanceDefinition[], positionalParameters?: any[]): string {
    let expanded = body;
    
    // Replace {self} with instance name
    expanded = expanded.replace(/\{self\}/g, instance.name);
    
    // Replace {parameter} with first positional parameter if available
    if (positionalParameters && positionalParameters.length > 0) {
      expanded = expanded.replace(/\{parameter\}/g, String(positionalParameters[0]));
    }
    
    // Replace {title} and other variable patterns with parameter values
    if (keywordParameters) {
      for (const [key, value] of Object.entries(keywordParameters)) {
        const pattern = new RegExp(`\\{${key}\\}`, 'g');
        // Resolve field references before converting to string
        const resolvedValue = this.resolveParameterValue(value, instances || []);
        // Quote string values to preserve token boundaries
        const stringValue = String(resolvedValue);
        const quotedValue = `'${stringValue}'`;
        expanded = expanded.replace(pattern, quotedValue);
      }
    }
    
    return expanded;
  }

  private smartSplitStatements(body: string): string[] {
    // Split by dots, but be smart about instance.field patterns
    const statements: string[] = [];
    let currentStatement = '';
    let i = 0;
    
    while (i < body.length) {
      const char = body[i];
      
      if (char === '.') {
        // Look ahead to see if this is instance.field or statement separator
        const nextPart = body.substring(i + 1).trim();
        
        // If next part starts with identifier (like "items push"), it's instance.field
        if (/^[a-zA-Z_][a-zA-Z0-9_]*\s+\w+/.test(nextPart)) {
          currentStatement += char; // Keep the dot
        } else {
          // This is a statement separator
          if (currentStatement.trim()) {
            statements.push(currentStatement.trim());
          }
          currentStatement = '';
        }
      } else {
        currentStatement += char;
      }
      
      i++;
    }
    
    // Add the last statement
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }
    
    return statements;
  }

  private executeStatement(statement: string, instance: ObjaxInstanceDefinition, keywordParameters?: Record<string, any>, instances?: ObjaxInstanceDefinition[], positionalParameters?: any[]) {
    // For complex statements like instance creation, use the parser
    if (statement.includes(' is a ') && statement.includes(' with ')) {
      const parser = new LinearObjaxParser();
      const result = parser.parse(statement, instances);
      
      // Add the newly created instances to our instance list
      for (const newInstance of result.instances) {
        instances?.push(newInstance);
      }
      return;
    }
    // Handle push operation: instance.field push item or instance.field.push item
    const pushMatch = statement.match(/(\w+)\.(\w+)(?:\.push|\s+push)\s+(\w+)/);
    if (pushMatch) {
      const instanceName = pushMatch[1];
      const fieldName = pushMatch[2];
      const itemName = pushMatch[3];
      
      const item = instances?.find(i => i.name === itemName);
      const targetInstance = instances?.find(i => i.name === instanceName);
        
      if (targetInstance && item) {
        // Auto-create array if field doesn't exist or is not an array
        if (!targetInstance.properties[fieldName] || !Array.isArray(targetInstance.properties[fieldName])) {
          targetInstance.properties[fieldName] = [];
        }
        targetInstance.properties[fieldName].push(item);
      }
      return;
    }

    // Handle direct List push (fallback)
    const directListPushMatch = statement.match(/(\w+)\.push\s+(\w+)/);
    if (directListPushMatch) {
      const listInstanceName = directListPushMatch[1];
      const itemName = directListPushMatch[2];
      
      const item = instances?.find(i => i.name === itemName);
      const listInstance = instances?.find(i => i.name === listInstanceName);
        
      if (listInstance && item && listInstance.className === 'List') {
        if (!Array.isArray(listInstance.properties.items)) {
          listInstance.properties.items = [];
        }
        listInstance.properties.items.push(item);
      }
      return;
    }

    // Handle instance creation: newTask is a Task with title {title}
    const instanceCreationMatch = statement.match(/(\w+) is a (\w+)(?: with (.+))?/);
    if (instanceCreationMatch) {
      const newInstanceName = instanceCreationMatch[1];
      const className = instanceCreationMatch[2];
      const withClause = instanceCreationMatch[3];
      
      // Parse the "with" clause if present
      const properties: Record<string, any> = {};
      if (withClause) {
        // The with clause is already processed and should be "title Learn Objax"
        // First word is field name, rest is value
        const parts = withClause.trim().split(/\s+/);
        if (parts.length >= 2) {
          const fieldName = parts[0];
          const fieldValue = parts.slice(1).join(' ');
          properties[fieldName] = fieldValue;
        }
      }
      
      // Create new instance
      const newInstance: ObjaxInstanceDefinition = {
        name: newInstanceName,
        className: className,
        properties: properties,
        page: instance.page,
        isOpen: false
      };
      
      if (instances) {
        instances.push(newInstance);
      }
      return;
    }

    // Handle self field assignments: self.fieldName is value
    const selfFieldMatch = statement.match(/self\.(\w+) is (.+)/);
    if (selfFieldMatch) {
      const fieldName = selfFieldMatch[1];
      const value = this.parseValue(selfFieldMatch[2]);
      instance.properties[fieldName] = value;
      return;
    }

    // Fall back to original parsing if no specific pattern matches
    this.executeOriginalStatement(statement, instance, keywordParameters, instances, positionalParameters);
  }

  private parseValue(valueStr: string): any {
    // Handle simple values
    if (valueStr === 'true') return true;
    if (valueStr === 'false') return false;
    if (valueStr === 'null') return null;
    if (valueStr.startsWith('"') && valueStr.endsWith('"')) {
      return valueStr.slice(1, -1); // Remove quotes
    }
    if (/^\d+$/.test(valueStr)) {
      return parseInt(valueStr);
    }
    if (/^\d+\.\d+$/.test(valueStr)) {
      return parseFloat(valueStr);
    }
    return valueStr; // Return as string if no specific type
  }

  private executeOriginalStatement(body: string, instance: ObjaxInstanceDefinition, keywordParameters?: Record<string, any>, instances?: ObjaxInstanceDefinition[], positionalParameters?: any[]) {
    // Handle different method body patterns
    
    // Pattern 1: Multiple self field assignments separated by "and"
    const multipleAssignments = body.includes(' and self.')
    if (multipleAssignments) {
      const assignments = body.split(' and ').map(s => s.trim())
      
      for (const assignment of assignments) {
        const selfFieldMatch = assignment.match(/self\.(\w+) is (.+)/)
        if (selfFieldMatch) {
          const fieldName = selfFieldMatch[1]
          const paramName = selfFieldMatch[2]
          
          // Get the actual value from keyword parameters, positional parameters, or literal values
          let value: any
          if (keywordParameters && keywordParameters[paramName]) {
            value = this.resolveParameterValue(keywordParameters[paramName], instances || [])
          } else if (paramName === 'parameter' && positionalParameters && positionalParameters.length > 0) {
            // Special handling for 'parameter' keyword - use first positional parameter
            value = positionalParameters[0]
          } else if (paramName === 'true') {
            value = true
          } else if (paramName === 'false') {
            value = false
          } else if (!isNaN(Number(paramName))) {
            value = Number(paramName)
          } else if (paramName.startsWith('"') && paramName.endsWith('"')) {
            value = paramName.slice(1, -1) // Remove quotes
          } else {
            value = paramName
          }
          
          instance.properties[fieldName] = value
        }
      }
      return
    }
    
    // Pattern 2: Single "self.fieldName is value"
    const selfFieldMatch = body.match(/self\.(\w+) is (.+)/)
    if (selfFieldMatch) {
      const fieldName = selfFieldMatch[1]
      const paramName = selfFieldMatch[2]
      
      // Get the actual value from keyword parameters, positional parameters, or literal values
      let value: any
      if (keywordParameters && keywordParameters[paramName]) {
        value = this.resolveParameterValue(keywordParameters[paramName], instances || [])
      } else if (paramName === 'parameter' && positionalParameters && positionalParameters.length > 0) {
        // Special handling for 'parameter' keyword - use first positional parameter
        value = positionalParameters[0]
      } else if (paramName === 'true') {
        value = true
      } else if (paramName === 'false') {
        value = false
      } else if (!isNaN(Number(paramName))) {
        value = Number(paramName)
      } else if (paramName.startsWith('"') && paramName.endsWith('"')) {
        value = paramName.slice(1, -1) // Remove quotes
      } else {
        value = paramName
      }
      
      instance.properties[fieldName] = value
      return
    }

    // Pattern 3: Handle complex method body with multiple statements
    // Split by "and" to handle multiple statements
    const statements = body.split(' and ').map(s => s.trim());
    
    for (const statement of statements) {
      // Handle instance creation: "varName is a ClassName with param"
      const instanceCreationMatch = statement.match(/(\w+) is a (\w+) with (\w+)/);
      if (instanceCreationMatch) {
        const [, varName, className, paramName] = instanceCreationMatch;
        const paramValue = keywordParameters && keywordParameters[paramName] && instances ? this.resolveParameterValue(keywordParameters[paramName], instances) : paramName;
        
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
          const valueToAdd = positionalParameters && positionalParameters.length > 0 && instances ? this.resolveParameterValue(positionalParameters[0], instances) : varName;
          instance.properties[fieldName] = [...currentList, valueToAdd];
        }
        continue;
      }
      
      // Handle simple list operations: "add param to \"items\" of myself"
      const addToListMatch = statement.match(/add (\w+) to "([^"]+)" of myself/);
      if (addToListMatch) {
        const [, paramName, fieldName] = addToListMatch;
        const currentList = instance.properties[fieldName] || [];
        const valueToAdd = positionalParameters && positionalParameters.length > 0 && instances ? this.resolveParameterValue(positionalParameters[0], instances) : paramName;
        instance.properties[fieldName] = [...currentList, valueToAdd];
      }
    }
    
    return; // If we processed statements successfully

    // Pattern 4: Simple keyword parameter assignment to field
    if (keywordParameters && Object.keys(keywordParameters || {}).length > 0) {
      // Store all keyword parameters as properties
      Object.entries(keywordParameters || {}).forEach(([key, value]) => {
        const resolvedValue = instances ? this.resolveParameterValue(value, instances) : value
        instance.properties[key] = resolvedValue
      })
      return
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
      // Add child instance to parent's children array
      const currentChildren = parentInstance.properties.children || []
      
      // Check if child is already in the array (compare by name to avoid duplicates)
      const alreadyAdded = currentChildren.some((child: any) => 
        child && typeof child === 'object' && child.name === childInstance.name
      )
      
      if (!alreadyAdded) {
        parentInstance.properties.children = [...currentChildren, childInstance]
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
      
      // Execute any field assignments from the message context
      for (const fieldAssignment of subResult.fieldAssignments) {
        this.executeFieldAssignment(fieldAssignment, instances)
      }
      
      // Execute any let assignments from the message context
      for (const becomesAssignment of subResult.becomesAssignments) {
        this.executeBecomesAssignment(becomesAssignment, instances)
      }
      
      // Execute any state operations from the message context
      for (const _stateOp of subResult.stateOperations) {
        // Note: State operations would need access to the global state store
        // For now we'll handle basic field updates
        // This is a simplified implementation
      }
    } catch (error) {
      throw new Error(`Failed to execute message code: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private executeInstanceConfiguration(
    config: ObjaxInstanceConfiguration,
    instances: ObjaxInstanceDefinition[]
  ) {
    const instance = instances.find(i => i.name === config.instanceName)
    if (!instance) {
      throw new Error(`Instance "${config.instanceName}" not found`)
    }

    switch (config.configurationType) {
      case 'field':
        // Add field to fields array for display
        const currentFields = instance.properties.fields || []
        const fieldName = config.value as string
        if (!currentFields.includes(fieldName)) {
          instance.properties.fields = [...currentFields, fieldName]
        }
        break
      case 'dataSource':
        instance.properties.dataSource = config.value
        break
      case 'viewMode':
        instance.properties.viewMode = config.value
        break
      default:
        throw new Error(`Unknown configuration type: ${config.configurationType}`)
    }
  }

  private executeFieldAssignment(
    fieldAssignment: ObjaxFieldAssignment,
    instances: ObjaxInstanceDefinition[]
  ) {
    const instance = instances.find(i => i.name === fieldAssignment.instanceName)
    if (!instance) {
      throw new Error(`Instance "${fieldAssignment.instanceName}" not found`)
    }

    // Set the field value on the instance
    instance.properties[fieldAssignment.fieldName] = fieldAssignment.values
  }

  private attachEventListener(
    eventListener: ObjaxEventListener,
    instances: ObjaxInstanceDefinition[]
  ) {
    const instance = instances.find(i => i.name === eventListener.instanceName)
    if (!instance) {
      throw new Error(`Instance "${eventListener.instanceName}" not found`)
    }

    // Initialize eventListeners array if it doesn't exist
    if (!instance.properties.eventListeners) {
      instance.properties.eventListeners = []
    }

    // Resolve block reference if needed
    let resolvedAction = eventListener.action
    if (eventListener.action.startsWith('@block:')) {
      const blockName = eventListener.action.replace('@block:', '')
      const blockBody = this.blockRegistry.get(blockName)
      if (blockBody) {
        resolvedAction = blockBody
      } else {
        throw new Error(`Block "${blockName}" not found for event listener`)
      }
    }

    // Add the event listener to the instance
    instance.properties.eventListeners.push({
      eventType: eventListener.eventType,
      action: resolvedAction
    })
  }

  private executeCreateMethod(
    methodCall: ObjaxMethodCall,
    instances: ObjaxInstanceDefinition[],
    classes: ObjaxClassDefinition[]
  ) {
    const className = methodCall.instanceName
    
    // Check if the class exists
    const classDefinition = classes.find(c => c.name === className)
    if (!classDefinition) {
      throw new Error(`Class "${className}" not found`)
    }
    
    // Generate auto-numbered instance name
    const instanceName = this.generateInstanceName(className, instances)
    
    // Create properties with default values from class definition
    const properties: Record<string, any> = {}
    
    // Set default values for fields
    for (const field of classDefinition.fields) {
      if (field.defaultValue !== undefined) {
        properties[field.name] = field.defaultValue
      }
    }
    
    // Override with provided keyword parameters
    if (methodCall.keywordParameters) {
      Object.assign(properties, methodCall.keywordParameters)
    }
    
    // Create the new instance
    const newInstance: ObjaxInstanceDefinition = {
      name: instanceName,
      className: className,
      properties
    }
    
    instances.push(newInstance)
  }

  private generateInstanceName(className: string, instances: ObjaxInstanceDefinition[]): string {
    // Convert class name to lowercase for instance name prefix
    const prefix = className.toLowerCase()
    
    // Find existing instances with this prefix
    const existingNumbers = instances
      .filter(instance => instance.name.startsWith(prefix))
      .map(instance => {
        const match = instance.name.match(new RegExp(`^${prefix}(\\d+)$`))
        return match ? parseInt(match[1], 10) : 0
      })
      .filter(num => num > 0)
    
    // Find the highest existing number and add 1
    let nextNumber = 1
    if (existingNumbers.length > 0) {
      nextNumber = Math.max(...existingNumbers) + 1
    }
    
    return `${prefix}${nextNumber}`
  }

  private executeBecomesAssignment(becomesAssignment: ObjaxBecomesAssignment, instances: ObjaxInstanceDefinition[]) {
    // Evaluate the expression
    const value = this.evaluateExpression(becomesAssignment.expression, instances)

    // Assign to target
    if (becomesAssignment.target.type === 'field') {
      // Field assignment: "let box.width be expression"
      const instanceName = becomesAssignment.target.instanceName!
      const fieldName = becomesAssignment.target.fieldName!
      
      const instance = instances.find(i => i.name === instanceName)
      if (!instance) {
        throw new Error(`Instance "${instanceName}" not found`)
      }

      instance.properties[fieldName] = value
    } else {
      // Variable assignment: "let variableName be expression"
      // For now, we'll store it in a global variables registry
      // This could be extended in the future
      const variableName = becomesAssignment.target.variableName!
      // TODO: Implement variable storage if needed
      console.log(`Variable assignment: ${variableName} = ${value}`)
    }
  }

  private evaluateExpression(expression: ObjaxExpression, instances: ObjaxInstanceDefinition[]): any {
    switch (expression.type) {
      case 'literal':
        return expression.value

      case 'field':
        // Field access: "box.width"
        const instanceName = expression.instanceName!
        const fieldName = expression.fieldName!
        
        const instance = instances.find(i => i.name === instanceName)
        if (!instance) {
          throw new Error(`Instance "${instanceName}" not found`)
        }

        const value = instance.properties[fieldName]
        if (!(fieldName in instance.properties)) {
          throw new Error(`Field "${fieldName}" not found on instance "${instanceName}"`)
        }

        return value

      case 'variable':
        // Variable access: implement if needed
        throw new Error('Variable access not yet implemented')

      case 'binary':
        // Binary operation: "left operator right"
        const left = this.evaluateExpression(expression.left!, instances)
        const right = this.evaluateExpression(expression.right!, instances)

        switch (expression.operator) {
          case '+':
            return left + right
          case '-':
            return left - right
          case '*':
            return left * right
          case '/':
            if (right === 0) {
              throw new Error('Division by zero')
            }
            return left / right
          default:
            throw new Error(`Unsupported operator: ${expression.operator}`)
        }

      default:
        throw new Error(`Unsupported expression type: ${expression.type}`)
    }
  }

  private applyDefaultValues(instance: ObjaxInstanceDefinition, classes: ObjaxClassDefinition[]) {
    // Find the class definition for this instance
    const classDefinition = classes.find(cls => cls.name === instance.className)
    
    if (!classDefinition) {
      // If no class definition found, this might be a preset class
      // We'll need to handle this case at a higher level
      return
    }

    // Apply default values for fields that don't have a value set
    for (const field of classDefinition.fields) {
      if (field.defaultValue !== undefined && !(field.name in instance.properties)) {
        instance.properties[field.name] = field.defaultValue
      }
    }
  }

  // Execute a block by name (without arguments)
  executeBlock(blockName: string, instances: ObjaxInstanceDefinition[], allClasses: ObjaxClassDefinition[] = []): ObjaxExecutionResult {
    return this.executeBlockWithArguments(blockName, instances, allClasses, undefined)
  }

  // Execute a block by name with arguments
  executeBlockWithArguments(blockName: string, instances: ObjaxInstanceDefinition[], allClasses: ObjaxClassDefinition[] = [], blockArguments?: Record<string, any>): ObjaxExecutionResult {
    const blockBody = this.blockRegistry.get(blockName)
    if (!blockBody) {
      throw new Error(`Block "${blockName}" not found`)
    }

    // Get block parameters
    const blockParams = this.blockParameters.get(blockName) || []
    
    // Substitute parameters with arguments in block body
    let processedBlockBody = blockBody
    if (blockArguments && blockParams.length > 0) {
      for (const param of blockParams) {
        if (blockArguments[param] !== undefined) {
          // Replace parameter name with its value in the block body
          const paramValue = blockArguments[param]
          // Use word boundaries but handle string values with proper quoting
          const escapedParam = param.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          let valueString: string
          if (typeof paramValue === 'string') {
            valueString = `"${paramValue}"`  // Add quotes for string values
          } else {
            valueString = String(paramValue)
          }
          processedBlockBody = processedBlockBody.replace(new RegExp(`\\b${escapedParam}\\b`, 'g'), valueString)
        }
      }
    }

    // Split multiple statements by semicolon and execute each
    const statements = processedBlockBody.split(';').map(s => s.trim()).filter(s => s.length > 0)
    
    let currentInstances = [...instances]
    const allErrors: string[] = []
    const allResults: any[] = []
    
    for (const statement of statements) {
      // Parse and execute each statement
      const parser = new LinearObjaxParser()
      const parseResult = parser.parse(statement, currentInstances)
      
      // Merge with existing instances
      const mergedResult = {
        ...parseResult,
        instances: [...currentInstances, ...parseResult.instances]
      }
      
      // Execute the statement
      const execResult = this.execute(mergedResult, allClasses)
      
      // Update current instances for next statement
      currentInstances = execResult.instances
      allErrors.push(...execResult.errors)
      allResults.push(execResult)
    }
    
    // Return the final result
    return {
      classes: allResults[allResults.length - 1]?.classes || [],
      instances: currentInstances,
      methodCalls: allResults.flatMap(r => r.methodCalls || []),
      stateOperations: allResults.flatMap(r => r.stateOperations || []),
      stateRetrievals: allResults.flatMap(r => r.stateRetrievals || []),
      pageNavigations: allResults.flatMap(r => r.pageNavigations || []),
      listOperations: allResults.flatMap(r => r.listOperations || []),
      variableAssignments: allResults.flatMap(r => r.variableAssignments || []),
      fieldAssignments: allResults.flatMap(r => r.fieldAssignments || []),
      connections: allResults.flatMap(r => r.connections || []),
      morphOperations: allResults.flatMap(r => r.morphOperations || []),
      printStatements: allResults.flatMap(r => r.printStatements || []),
      messageExecutions: allResults.flatMap(r => r.messageExecutions || []),
      instanceConfigurations: allResults.flatMap(r => r.instanceConfigurations || []),
      eventListeners: allResults.flatMap(r => r.eventListeners || []),
      blockAssignments: allResults.flatMap(r => r.blockAssignments || []),
      blockCalls: allResults.flatMap(r => r.blockCalls || []),
      becomesAssignments: allResults.flatMap(r => r.becomesAssignments || []),
      timerOperations: allResults.flatMap(r => r.timerOperations || []),
      conditionalBlocks: allResults.flatMap(r => r.conditionalBlocks || []),
      conditionalExecutions: allResults.flatMap(r => r.conditionalExecutions || []),
      conditionalOtherwiseExecutions: allResults.flatMap(r => r.conditionalOtherwiseExecutions || []),
      errors: allErrors
    }
  }

  // Get all registered blocks
  getRegisteredBlocks(): Map<string, string> {
    return new Map(this.blockRegistry)
  }


  private executeTimerOperation(
    timerOperation: ObjaxTimerOperation,
    instances: ObjaxInstanceDefinition[]
  ) {
    const instance = instances.find(i => i.name === timerOperation.instanceName)
    if (!instance) {
      throw new Error(`Instance "${timerOperation.instanceName}" not found`)
    }

    // Set timer properties on the instance
    instance.properties.time = timerOperation.time
    instance.properties.action = timerOperation.action
    instance.properties.isRunning = true

    // Clear any existing timer for this instance
    const timerId = `${timerOperation.instanceName}_timer`
    if (this.timers.has(timerId)) {
      clearInterval(this.timers.get(timerId)!)
      this.timers.delete(timerId)
    }

    // Execute the action repeatedly
    const executeTimerAction = () => {
      try {
        // Parse and execute the action code
        const parser = new LinearObjaxParser()
        const actionResult = parser.parse(timerOperation.action, instances)
        this.execute(actionResult)
      } catch (error) {
        console.error(`Error executing timer action for ${timerOperation.instanceName}:`, error)
      }
    }

    // Start the timer
    const timer = setInterval(executeTimerAction, timerOperation.time)
    this.timers.set(timerId, timer)
    
    // Store the interval ID on the instance for cleanup
    instance.properties.intervalId = timer as any
  }

  // Method to stop a timer
  stopTimer(instanceName: string) {
    const timerId = `${instanceName}_timer`
    if (this.timers.has(timerId)) {
      clearInterval(this.timers.get(timerId)!)
      this.timers.delete(timerId)
    }
  }

  // Method to stop all timers (useful for cleanup)
  stopAllTimers() {
    for (const [_timerId, timer] of this.timers) {
      clearInterval(timer)
    }
    this.timers.clear()
  }

  private executeConditionalExecution(conditionalExecution: ObjaxConditionalExecution, instances: ObjaxInstanceDefinition[], allClasses: ObjaxClassDefinition[]) {
    // Get the condition for this block
    const condition = this.conditionalBlockRegistry.get(conditionalExecution.blockName)
    if (!condition) {
      throw new Error(`Conditional block "${conditionalExecution.blockName}" not found`)
    }

    // Evaluate the condition
    const conditionResult = this.evaluateCondition(condition, instances)
    
    // If condition is true, execute the action
    if (conditionResult) {
      console.log(`Condition ${conditionalExecution.blockName} is true, executing action: ${conditionalExecution.action}`)
      
      // Parse and execute the action
      const parser = new LinearObjaxParser()
      const actionResult = parser.parse(conditionalExecution.action, instances)
      
      // Execute becomes assignments directly on the current instances array
      for (const becomesAssignment of actionResult.becomesAssignments || []) {
        try {
          this.executeBecomesAssignment(becomesAssignment, instances)
        } catch (error) {
          console.error(`Error executing becomes assignment in conditional: ${error instanceof Error ? error.message : String(error)}`)
        }
      }
      
      // Execute other operations if needed
      for (const methodCall of actionResult.methodCalls || []) {
        try {
          this.executeMethodCall(methodCall, instances, allClasses)
        } catch (error) {
          console.error(`Error executing method call in conditional: ${error instanceof Error ? error.message : String(error)}`)
        }
      }
    } else {
      console.log(`Condition ${conditionalExecution.blockName} is false, skipping action`)
    }
  }

  private executeConditionalOtherwiseExecution(conditionalOtherwiseExecution: ObjaxConditionalOtherwiseExecution, instances: ObjaxInstanceDefinition[], allClasses: ObjaxClassDefinition[]) {
    // Get the condition for this block
    const condition = this.conditionalBlockRegistry.get(conditionalOtherwiseExecution.blockName)
    if (!condition) {
      throw new Error(`Conditional block "${conditionalOtherwiseExecution.blockName}" not found`)
    }

    // Evaluate the condition
    const conditionResult = this.evaluateCondition(condition, instances)
    
    // If condition is FALSE, execute the otherwise action
    if (!conditionResult) {
      console.log(`Condition ${conditionalOtherwiseExecution.blockName} is false, executing otherwise action: ${conditionalOtherwiseExecution.otherwiseAction}`)
      
      // Parse and execute the action
      const parser = new LinearObjaxParser()
      const actionResult = parser.parse(conditionalOtherwiseExecution.otherwiseAction, instances)
      
      // Execute becomes assignments directly on the current instances array
      for (const becomesAssignment of actionResult.becomesAssignments || []) {
        try {
          this.executeBecomesAssignment(becomesAssignment, instances)
        } catch (error) {
          console.error(`Error executing becomes assignment in conditional otherwise: ${error instanceof Error ? error.message : String(error)}`)
        }
      }
      
      // Execute other operations if needed
      for (const methodCall of actionResult.methodCalls || []) {
        try {
          this.executeMethodCall(methodCall, instances, allClasses)
        } catch (error) {
          console.error(`Error executing method call in conditional otherwise: ${error instanceof Error ? error.message : String(error)}`)
        }
      }
    } else {
      console.log(`Condition ${conditionalOtherwiseExecution.blockName} is true, skipping otherwise action`)
    }
  }

  private evaluateCondition(condition: ObjaxCondition, instances: ObjaxInstanceDefinition[]): boolean {
    if (condition.type === 'comparison') {
      const leftValue = this.evaluateExpression(condition.left, instances)
      const rightValue = this.evaluateExpression(condition.right, instances)
      
      switch (condition.operator) {
        case 'equal':
          return leftValue === rightValue
        case 'not_equal':
          return leftValue !== rightValue
        case 'greater':
          return leftValue > rightValue
        case 'less':
          return leftValue < rightValue
        case 'greater_equal':
          return leftValue >= rightValue
        case 'less_equal':
          return leftValue <= rightValue
        default:
          throw new Error(`Unknown comparison operator: ${condition.operator}`)
      }
    }
    
    throw new Error(`Unknown condition type: ${condition.type}`)
  }

  private executeRangeRun(
    rangeInstance: ObjaxInstanceDefinition,
    methodCall: ObjaxMethodCall,
    instances: ObjaxInstanceDefinition[]
  ) {
    // Get the range start and end values
    const start = rangeInstance.properties.start as number
    const end = rangeInstance.properties.end as number
    
    if (typeof start !== 'number' || typeof end !== 'number') {
      throw new Error('Range start and end must be numbers')
    }

    // Find the action instance
    const actionName = methodCall.parameters?.[0]
    if (!actionName) {
      throw new Error('Range run requires an action parameter')
    }

    const actionInstance = instances.find(i => i.name === actionName)
    if (!actionInstance || actionInstance.className !== 'Action') {
      throw new Error(`Action instance "${actionName}" not found`)
    }

    // Get the action's do block
    const actionBody = actionInstance.properties.do as string
    if (!actionBody) {
      throw new Error(`Action "${actionName}" has no do block`)
    }

    // Execute the action for each value in the range
    for (let size = start; size <= end; size++) {
      // Replace {size} placeholder with actual size value
      // Handle both {size} and __CODEBLOCK_N__ patterns
      let processedBody = actionBody.replace(/\{size\}/g, size.toString())
      processedBody = processedBody.replace(/__CODEBLOCK_\d+__/g, size.toString())
      
      try {
        // Parse and execute the processed action body
        const parser = new LinearObjaxParser()
        const actionResult = parser.parse(processedBody, instances)
        
        // Execute becomes assignments
        for (const becomesAssignment of actionResult.becomesAssignments || []) {
          this.executeBecomesAssignment(becomesAssignment, instances)
        }
        
        // Execute other operations if needed
        for (const methodCall of actionResult.methodCalls || []) {
          this.executeMethodCall(methodCall, instances, [])
        }
      } catch (error) {
        throw new Error(`Error executing range action at size ${size}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }

  private executeJudgementThenDo(
    judgementInstance: ObjaxInstanceDefinition,
    methodCall: ObjaxMethodCall,
    instances: ObjaxInstanceDefinition[]
  ) {
    // Evaluate the judgement condition
    const conditionResult = this.evaluateJudgementCondition(judgementInstance, instances)
    
    // If condition is true, execute the action
    if (conditionResult) {
      this.executeJudgementAction(methodCall, instances)
    }
  }

  private executeJudgementOtherwiseDo(
    judgementInstance: ObjaxInstanceDefinition,
    methodCall: ObjaxMethodCall,
    instances: ObjaxInstanceDefinition[]
  ) {
    // Evaluate the judgement condition
    const conditionResult = this.evaluateJudgementCondition(judgementInstance, instances)
    
    // If condition is false, execute the action
    if (!conditionResult) {
      this.executeJudgementAction(methodCall, instances)
    }
  }

  private evaluateJudgementCondition(
    judgementInstance: ObjaxInstanceDefinition,
    instances: ObjaxInstanceDefinition[]
  ): boolean {
    const conditionString = judgementInstance.properties.boolean as string
    if (!conditionString) {
      throw new Error(`Judgement "${judgementInstance.name}" has no boolean condition`)
    }

    // Parse condition string "task.state equal 'done'"
    const tokens = conditionString.split(' ')
    if (tokens.length < 3) {
      throw new Error(`Invalid condition format: ${conditionString}`)
    }

    // Extract field reference (e.g., "task.state")
    const fieldRef = tokens[0]
    const operator = tokens[1]
    const expectedValue = tokens.slice(2).join(' ').replace(/['"]/g, '') // Remove quotes

    // Parse field reference
    const [instanceName, fieldName] = fieldRef.split('.')
    if (!instanceName || !fieldName) {
      throw new Error(`Invalid field reference: ${fieldRef}`)
    }

    // Find the instance
    const targetInstance = instances.find(i => i.name === instanceName)
    if (!targetInstance) {
      throw new Error(`Instance "${instanceName}" not found`)
    }

    // Get the actual value
    const actualValue = targetInstance.properties[fieldName]

    // Evaluate condition
    switch (operator) {
      case 'equal':
        return actualValue === expectedValue
      case 'not_equal':
        return actualValue !== expectedValue
      case 'greater':
        return actualValue > expectedValue
      case 'less':
        return actualValue < expectedValue
      default:
        throw new Error(`Unknown operator: ${operator}`)
    }
  }

  private executeJudgementAction(
    methodCall: ObjaxMethodCall,
    instances: ObjaxInstanceDefinition[]
  ) {
    const actionName = methodCall.keywordParameters?.action
    if (!actionName) {
      throw new Error('Judgement method requires action parameter')
    }

    // Find the action instance
    const actionInstance = instances.find(i => i.name === actionName)
    if (!actionInstance || actionInstance.className !== 'Action') {
      throw new Error(`Action instance "${actionName}" not found`)
    }

    // Get the action's do block
    const actionBody = actionInstance.properties.do as string
    if (!actionBody) {
      throw new Error(`Action "${actionName}" has no do block`)
    }

    try {
      // Parse and execute the action body
      const parser = new LinearObjaxParser()
      const actionResult = parser.parse(actionBody, instances)
      
      // Execute becomes assignments
      for (const becomesAssignment of actionResult.becomesAssignments || []) {
        this.executeBecomesAssignment(becomesAssignment, instances)
      }
      
      // Execute other operations if needed
      for (const methodCall of actionResult.methodCalls || []) {
        this.executeMethodCall(methodCall, instances, [])
      }
    } catch (error) {
      throw new Error(`Error executing judgement action: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}