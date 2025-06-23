import { describe, expect, it } from 'vitest'
import { ObjaxExecutor } from './executor'
import type { ObjaxClassDefinition, ObjaxInstanceDefinition, ObjaxMethodCall, ObjaxBlockAssignment, ObjaxMorphOperation } from './types'

describe('ObjaxExecutor', () => {
  it('should execute List add method', () => {
    const executor = new ObjaxExecutor()
    
    const listClass: ObjaxClassDefinition = {
      name: 'List',
      fields: [
        { name: 'items', defaultValue: [] }
      ],
      methods: [
        { name: 'add', parameters: ['item'], body: 'self.items is self.items + [item]' },
        { name: 'remove', parameters: ['item'], body: 'self.items is self.items - [item]' }
      ]
    }
    
    const listInstance: ObjaxInstanceDefinition = {
      name: 'myList',
      className: 'List',
      properties: { items: [] }
    }
    
    const addCall: ObjaxMethodCall = {
      methodName: 'add',
      instanceName: 'myList',
      parameters: ['apple']
    }
    
    const result = executor.execute({
      classes: [listClass],
      instances: [listInstance],
      methodCalls: [addCall],
      stateOperations: [],
      stateRetrievals: [],
      pageNavigations: [],
      listOperations: [],
      variableAssignments: [],
      fieldAssignments: [],
      connections: [],
      morphOperations: [],
      printStatements: [],
      messageExecutions: [],
      instanceConfigurations: [],
      eventListeners: [],
      blockAssignments: [],
      blockCalls: [],
      becomesAssignments: [],
      timerOperations: [],
      conditionalBlocks: [],
      conditionalExecutions: [],
      conditionalOtherwiseExecutions: [],
      errors: []
    })
    
    expect(result.instances[0].properties.items).toEqual(['apple'])
  })

  it('should execute List remove method', () => {
    const executor = new ObjaxExecutor()
    
    const listClass: ObjaxClassDefinition = {
      name: 'List',
      fields: [
        { name: 'items', defaultValue: [] }
      ],
      methods: [
        { name: 'add', parameters: ['item'], body: 'self.items is self.items + [item]' },
        { name: 'remove', parameters: ['item'], body: 'self.items is self.items - [item]' }
      ]
    }
    
    const listInstance: ObjaxInstanceDefinition = {
      name: 'myList',
      className: 'List',
      properties: { items: ['apple', 'banana', 'cherry'] }
    }
    
    const removeCall: ObjaxMethodCall = {
      methodName: 'remove',
      instanceName: 'myList',
      parameters: ['banana']
    }
    
    const result = executor.execute({
      classes: [listClass],
      instances: [listInstance],
      methodCalls: [removeCall],
      stateOperations: [],
      stateRetrievals: [],
      pageNavigations: [],
      listOperations: [],
      variableAssignments: [],
      fieldAssignments: [],
      connections: [],
      morphOperations: [],
      printStatements: [],
      messageExecutions: [],
      instanceConfigurations: [],
      eventListeners: [],
      blockAssignments: [],
      blockCalls: [],
      becomesAssignments: [],
      timerOperations: [],
      conditionalBlocks: [],
      conditionalExecutions: [],
      conditionalOtherwiseExecutions: [],
      errors: []
    })
    
    expect(result.instances[0].properties.items).toEqual(['apple', 'cherry'])
  })

  it('should execute a simple method call', () => {
    const executor = new ObjaxExecutor()
    
    const taskClass: ObjaxClassDefinition = {
      name: 'Task',
      fields: [
        { name: 'done', defaultValue: false }
      ],
      methods: [
        { name: 'complete', parameters: [], body: 'self.done is true' }
      ]
    }
    
    const taskInstance: ObjaxInstanceDefinition = {
      name: 'myTask',
      className: 'Task',
      properties: { done: false }
    }
    
    const methodCall: ObjaxMethodCall = {
      methodName: 'complete',
      instanceName: 'myTask'
    }
    
    const result = executor.execute({
      classes: [taskClass],
      instances: [taskInstance],
      methodCalls: [methodCall],
      stateOperations: [],
      stateRetrievals: [],
      pageNavigations: [],
      listOperations: [],
      variableAssignments: [],
      fieldAssignments: [],
      connections: [],
      morphOperations: [],
      printStatements: [],
      messageExecutions: [],
      instanceConfigurations: [],
      eventListeners: [],
      blockAssignments: [],
      blockCalls: [],
      becomesAssignments: [],
      timerOperations: [],
      conditionalBlocks: [],
      conditionalExecutions: [],
      conditionalOtherwiseExecutions: [],
      errors: []
    })
    
    expect(result.errors).toHaveLength(0)
    expect(result.instances[0].properties.done).toBe(true)
  })

  it('should preserve print statements in execution result', () => {
    const executor = new ObjaxExecutor()
    
    const printStatements = [
      { message: 'Hello World', timestamp: '2023-01-01T00:00:00.000Z' },
      { message: 'Debug info', timestamp: '2023-01-01T00:00:01.000Z' }
    ]
    
    const result = executor.execute({
      classes: [],
      instances: [],
      methodCalls: [],
      stateOperations: [],
      stateRetrievals: [],
      pageNavigations: [],
      listOperations: [],
      variableAssignments: [],
      connections: [],
      morphOperations: [],
      printStatements,
      messageExecutions: [],
      instanceConfigurations: [],
      errors: []
    })
    
    expect(result.errors).toHaveLength(0)
    expect(result.printStatements).toHaveLength(2)
    expect(result.printStatements[0].message).toBe('Hello World')
    expect(result.printStatements[1].message).toBe('Debug info')
  })

  it('should execute FieldMorph add method with keyword parameter', () => {
    const executor = new ObjaxExecutor()
    
    const fieldClass: ObjaxClassDefinition = {
      name: 'FieldMorph',
      fields: [
        { name: 'label', defaultValue: 'フィールド' },
        { name: 'value', defaultValue: '' }
      ],
      methods: [
        { name: 'add', parameters: [], body: 'self.value is text' }
      ]
    }
    
    const fieldInstance: ObjaxInstanceDefinition = {
      name: 'title',
      className: 'FieldMorph',
      properties: { label: 'タイトル', value: '' }
    }
    
    const methodCall: ObjaxMethodCall = {
      methodName: 'add',
      instanceName: 'title',
      keywordParameters: { text: 'Hello World' }
    }
    
    const result = executor.execute({
      classes: [fieldClass],
      instances: [fieldInstance],
      methodCalls: [methodCall],
      stateOperations: [],
      stateRetrievals: [],
      pageNavigations: [],
      listOperations: [],
      variableAssignments: [],
      fieldAssignments: [],
      connections: [],
      morphOperations: [],
      printStatements: [],
      messageExecutions: [],
      instanceConfigurations: [],
      eventListeners: [],
      blockAssignments: [],
      blockCalls: [],
      becomesAssignments: [],
      timerOperations: [],
      conditionalBlocks: [],
      conditionalExecutions: [],
      conditionalOtherwiseExecutions: [],
      errors: []
    })
    
    expect(result.errors).toHaveLength(0)
    expect(result.instances[0].properties.value).toBe('Hello World')
  })

  it('should handle block assignments', () => {
    const executor = new ObjaxExecutor()
    
    const result = executor.execute({
      classes: [],
      instances: [],
      methodCalls: [],
      stateOperations: [],
      stateRetrievals: [],
      pageNavigations: [],
      listOperations: [],
      variableAssignments: [],
      fieldAssignments: [],
      connections: [],
      morphOperations: [],
      printStatements: [],
      messageExecutions: [],
      instanceConfigurations: [],
      eventListeners: [],
      blockAssignments: [
        { blockName: 'grow', blockBody: 'self.size is self.size + 1' }
      ],
      errors: []
    })
    
    expect(result.errors).toHaveLength(0)
  })

  it('should handle Timer repeat method', () => {
    const executor = new ObjaxExecutor()
    
    const timerInstance: ObjaxInstanceDefinition = {
      name: 'timer',
      className: 'Timer',
      properties: {}
    }
    
    const methodCall: ObjaxMethodCall = {
      methodName: 'repeat',
      instanceName: 'timer',
      keywordParameters: { time: '1 second', action: 'grow' }
    }
    
    const result = executor.execute({
      classes: [],
      instances: [timerInstance],
      methodCalls: [methodCall],
      stateOperations: [],
      stateRetrievals: [],
      pageNavigations: [],
      listOperations: [],
      variableAssignments: [],
      fieldAssignments: [],
      connections: [],
      morphOperations: [],
      printStatements: [],
      messageExecutions: [],
      instanceConfigurations: [],
      eventListeners: [],
      blockAssignments: [
        { blockName: 'grow', blockBody: 'print "Growing"' }
      ],
      errors: []
    })
    
    expect(result.errors).toHaveLength(0)
  })

  it('should handle doAll method', () => {
    const executor = new ObjaxExecutor()
    
    const seedClass: ObjaxClassDefinition = {
      name: 'Seed',
      fields: [
        { name: 'size', defaultValue: 1 }
      ],
      methods: []
    }
    
    const seedInstance1: ObjaxInstanceDefinition = {
      name: 'seed1',
      className: 'Seed',
      properties: { size: 1 }
    }
    
    const seedInstance2: ObjaxInstanceDefinition = {
      name: 'seed2',
      className: 'Seed',
      properties: { size: 2 }
    }
    
    const methodCall: ObjaxMethodCall = {
      methodName: 'doAll',
      instanceName: 'Seed',
      keywordParameters: { action: 'grow' }
    }
    
    const result = executor.execute({
      classes: [seedClass],
      instances: [seedInstance1, seedInstance2],
      methodCalls: [methodCall],
      stateOperations: [],
      stateRetrievals: [],
      pageNavigations: [],
      listOperations: [],
      variableAssignments: [],
      fieldAssignments: [],
      connections: [],
      morphOperations: [],
      printStatements: [],
      messageExecutions: [],
      instanceConfigurations: [],
      eventListeners: [],
      blockAssignments: [
        { blockName: 'grow', blockBody: 'print "Growing seed"' }
      ],
      errors: []
    })
    
    expect(result.errors).toHaveLength(0)
  })

  it('should handle complete Timer, doAll and block integration', () => {
    const executor = new ObjaxExecutor()
    
    // Create class for seeds
    const seedClass: ObjaxClassDefinition = {
      name: 'Seed',
      fields: [
        { name: 'size', defaultValue: 1 }
      ],
      methods: []
    }
    
    // Create Timer class
    const timerClass: ObjaxClassDefinition = {
      name: 'Timer',
      fields: [],
      methods: []
    }
    
    // Create instances
    const seedInstance1: ObjaxInstanceDefinition = {
      name: 'seed1',
      className: 'Seed',
      properties: { size: 1 }
    }
    
    const seedInstance2: ObjaxInstanceDefinition = {
      name: 'seed2', 
      className: 'Seed',
      properties: { size: 2 }
    }
    
    const timerInstance: ObjaxInstanceDefinition = {
      name: 'timer',
      className: 'Timer',
      properties: {}
    }
    
    // Create method calls
    const timerRepeatCall: ObjaxMethodCall = {
      methodName: 'repeat',
      instanceName: 'timer',
      keywordParameters: { time: '1 second', action: 'allGrow' }
    }
    
    // Test the complete integration
    const result = executor.execute({
      classes: [seedClass, timerClass],
      instances: [seedInstance1, seedInstance2, timerInstance],
      methodCalls: [timerRepeatCall],
      stateOperations: [],
      stateRetrievals: [],
      pageNavigations: [],
      listOperations: [],
      variableAssignments: [],
      fieldAssignments: [],
      connections: [],
      morphOperations: [],
      printStatements: [],
      messageExecutions: [],
      instanceConfigurations: [],
      eventListeners: [],
      blockAssignments: [
        { blockName: 'grow', blockBody: 'self.size is self.size + 1' },
        { blockName: 'allGrow', blockBody: 'Seed doAll with action "grow"' }
      ],
      errors: []
    })
    
    expect(result.errors).toHaveLength(0)
    // The timer should be set up without errors
    // The actual timer execution would happen asynchronously
  })

  it('should handle morph add operation - add child to parent', () => {
    const executor = new ObjaxExecutor()

    const groupInstance: ObjaxInstanceDefinition = {
      name: 'myGroup',
      className: 'GroupMorph',
      properties: { children: [], page: 'test' }
    }

    const buttonInstance: ObjaxInstanceDefinition = {
      name: 'myButton',
      className: 'ButtonMorph',
      properties: { label: 'Click me', page: 'test' }
    }

    const morphOperation: ObjaxMorphOperation = {
      operation: 'add',
      parentInstance: 'myGroup',
      childInstance: 'myButton'
    }

    const result = executor.execute({
      classes: [],
      instances: [groupInstance, buttonInstance],
      methodCalls: [],
      stateOperations: [],
      stateRetrievals: [],
      pageNavigations: [],
      listOperations: [],
      variableAssignments: [],
      fieldAssignments: [],
      connections: [],
      morphOperations: [morphOperation],
      printStatements: [],
      messageExecutions: [],
      instanceConfigurations: [],
      eventListeners: [],
      blockAssignments: [],
      blockCalls: [],
      becomesAssignments: [],
      timerOperations: [],
      conditionalBlocks: [],
      conditionalExecutions: [],
      conditionalOtherwiseExecutions: [],
      errors: []
    })

    expect(result.errors).toHaveLength(0)
    
    // Check that the button was added to the group's children
    const updatedGroup = result.instances.find(i => i.name === 'myGroup')
    expect(updatedGroup?.properties.children).toHaveLength(1)
    expect(updatedGroup?.properties.children[0].name).toBe('myButton')
    
    // Check that the child has parent reference
    const updatedButton = result.instances.find(i => i.name === 'myButton')
    expect(updatedButton?.properties.parentId).toBe(updatedGroup?.properties.id)
  })
})