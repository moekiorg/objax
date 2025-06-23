import { convertToClassDefinition, convertToInstanceDefinition } from '../engine/objaxEngine';
import { useObjaxStore } from '../stores/objaxStore';

export function executeEventAction(
  action: string,
  instanceName: string,
  store: ReturnType<typeof useObjaxStore>
) {
  try {
    // Get the persistent engine instance from store
    const engine = store.getObjaxEngine();
    
    // Convert store data to engine format
    const classDefinitions = store.classes.map(convertToClassDefinition);
    const instanceDefinitions = store.instances.map(convertToInstanceDefinition);
    
    console.log(`Initial instances for action: ${instanceDefinitions.length} instances`);
    
    // Initialize actualAction
    let actualAction = action;
    
    // EMERGENCY: If we have too many instances, something is very wrong
    if (instanceDefinitions.length > 100) {
      console.error(`CRITICAL: Too many instances (${instanceDefinitions.length})! This indicates a serious data corruption issue.`);
      console.error('Instance names:', instanceDefinitions.map((i) => i.name));
      
      // Emergency: Only process instances from the current page to avoid massive data corruption
      const currentPageInstances = store.instances.filter((i) => i.page === store.currentPage);
      console.log(`Filtering to current page (${store.currentPage}) instances only: ${currentPageInstances.length}`);
      
      const filteredInstanceDefinitions = currentPageInstances.map((i) => convertToInstanceDefinition(i));
      
      // Execute with filtered instances instead
      const result = engine.execute(actualAction, classDefinitions, filteredInstanceDefinitions);
      console.log('Emergency filtered execution result:', {
        instanceCount: result.instances?.length || 0,
        errorCount: result.errors?.length || 0
      });
      
      return result.errors || [];
    }
    
    // Check if this is a block reference
    if (action.startsWith('@block:')) {
      const blockName = action.replace('@block:', '');
      const registeredBlocks = engine.getRegisteredBlocks();
      const blockBody = registeredBlocks.get(blockName);
      
      if (!blockBody) {
        throw new Error(`Block "${blockName}" not found for event listener`);
      }
      
      actualAction = blockBody;
    }
    // If not a block reference, use the action directly (for onClick properties)
    
    console.log('Executing action:', actualAction);
    
    // Execute the action using the engine with existing context
    const result = engine.execute(actualAction, classDefinitions, instanceDefinitions);
    
    console.log('Event execution result:', {
      instanceCount: result.instances?.length || 0,
      errorCount: result.errors?.length || 0,
      becomesCount: result.becomesAssignments?.length || 0,
      conditionalExecutions: result.conditionalExecutions?.length || 0,
      conditionalOtherwiseExecutions: result.conditionalOtherwiseExecutions?.length || 0
    });
    
    // Check for changes by comparing specific instances that might have been affected
    const changedInstances: Array<{name: string, changes: Record<string, any>}> = [];
    if (result.instances) {
      instanceDefinitions.forEach((initial) => {
        const final = result.instances.find((r) => r.name === initial.name);
        if (final) {
          // Compare each property to find actual changes
          const changes: Record<string, any> = {};
          let hasChanges = false;
          
          Object.keys(final.properties).forEach((key: string) => {
            const initialValue = initial.properties[key];
            const finalValue = final.properties[key];
            
            if (JSON.stringify(initialValue) !== JSON.stringify(finalValue)) {
              console.log(`Change detected in ${initial.name}.${key}: "${initialValue}" -> "${finalValue}"`);
              changes[key as keyof typeof changes] = finalValue;
              hasChanges = true;
            }
          });
          
          if (hasChanges) {
            changedInstances.push({
              name: initial.name,
              changes: changes
            });
          }
        }
      });
    }
    
    console.log('Detected property changes:', changedInstances);
    console.log('Conditional executions count:', result.conditionalExecutions?.length || 0);
    console.log('Conditional otherwise executions count:', result.conditionalOtherwiseExecutions?.length || 0);
    
    // Handle page navigations
    if (result.pageNavigations && result.pageNavigations.length > 0) {
      const lastNavigation = result.pageNavigations[result.pageNavigations.length - 1];
      store.setCurrentPage(lastNavigation.pageName);
    }
    
    // Handle state operations
    if (result.stateOperations) {
      result.stateOperations.forEach(stateOp => {
        store.updateStateValue(stateOp.stateName, stateOp.value);
      });
    }
    
    // Handle becomes assignments manually to avoid the freeze
    if (result.becomesAssignments && result.becomesAssignments.length > 0) {
      console.log('Becomes assignment detected - handling manually to prevent freeze');
      
      result.becomesAssignments.forEach(becomesAssignment => {
        if (becomesAssignment.target.type === 'field') {
          const instanceName = becomesAssignment.target.instanceName;
          const fieldName = becomesAssignment.target.fieldName;
          const value = becomesAssignment.expression.value; // For literal expressions
          
          console.log(`Manual becomes: ${instanceName}.${fieldName} = ${value}`);
          
          // Find the instance in the store and update it
          const existing = store.instances.find((i: any) => i.name === instanceName);
          if (existing) {
            console.log(`Updating ${instanceName}.${fieldName} from "${existing[fieldName]}" to "${value}"`);
            store.updateInstance(existing.id, { [fieldName]: value });
          } else {
            console.warn(`Instance "${instanceName}" not found for becomes assignment`);
          }
        }
      });
      
      return result.errors || [];
    }
    
    // Apply changes specifically for instances mentioned in conditional executions
    // This is a targeted fix to handle conditional execution results
    const conditionalExecutionFound = (result.conditionalExecutions?.length || 0) > 0 || (result.conditionalOtherwiseExecutions?.length || 0) > 0;
    
    console.log('Conditional execution found:', conditionalExecutionFound, 'Changed instances:', changedInstances.length);
    
    if (conditionalExecutionFound) {
      console.log(`Conditional execution detected. Processing...`);
      
      if (changedInstances.length > 0) {
        console.log(`Applying changes to ${changedInstances.length} instances`);
        
        // Only update instances that actually changed and have meaningful changes
        const significantChanges = changedInstances.filter(({changes}) => {
          // Only apply changes to specific fields like 'value', not structural properties
          return Object.keys(changes).some(key => ['value', 'items', 'label'].includes(key));
        });
        
        console.log(`Filtering to ${significantChanges.length} instances with significant changes`);
        
        significantChanges.forEach(({ name, changes }) => {
          const existing = store.instances.find(i => i.name === name);
          if (existing) {
            console.log(`Updating ${name} with conditional execution changes:`, changes);
            store.updateInstance(existing.id, changes);
          }
        });
      } else {
        // No changes detected, but conditional execution happened
        // This could mean the engine updated instances internally but didn't reflect in the result
        console.log('Conditional execution happened but no changes detected. This may indicate an engine issue.');
        console.log('Trying to force refresh instances from the final result...');
        
        // Force update instances that appear in conditional executions
        if (result.instances) {
          result.instances.forEach((finalInstance: any) => {
            const storeInstance = store.instances.find((i: any) => i.name === finalInstance.name);
            if (storeInstance) {
              // Force update the value property specifically
              if (finalInstance.properties.value !== undefined && 
                  finalInstance.properties.value !== storeInstance.value) {
                console.log(`Force updating ${finalInstance.name}.value: "${storeInstance.value}" -> "${finalInstance.properties.value}"`);
                store.updateInstance(storeInstance.id, { value: finalInstance.properties.value });
              }
            }
          });
        }
      }
    } else {
      console.log(`No conditional execution detected. Skipping updates.`);
    }
    
    // Add any truly new instances
    if (result.instances) {
      const newInstances = result.instances.filter((instance: any) => {
        return !store.instances.some((existing: any) => existing.name === instance.name);
      });
      
      if (newInstances.length > 0) {
        console.log(`Adding ${newInstances.length} new instances:`, newInstances.map((i: any) => i.name));
        newInstances.forEach((instance: any) => {
          store.addInstance({
            name: instance.name,
            className: instance.className,
            page: store.currentPage,
            ...instance.properties
          });
        });
      }
    }
    
    // Handle print statements
    if (result.printStatements && result.printStatements.length > 0) {
      result.printStatements.forEach((stmt: any) => {
        console.log(`[${instanceName}]`, stmt.message);
      });
    }
    
    // Return any errors
    return result.errors;
  } catch (error) {
    console.error('Error executing event action:', error);
    return [error instanceof Error ? error.message : String(error)];
  }
}