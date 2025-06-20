import { describe, expect, it } from 'vitest'
import { ObjaxExecutor } from './executor'
import type { ObjaxClassDefinition, ObjaxInstanceDefinition, ObjaxMethodCall } from './types'

describe('ObjaxExecutor', () => {
  it('should execute a simple method call', () => {
    const executor = new ObjaxExecutor()
    
    const taskClass: ObjaxClassDefinition = {
      name: 'Task',
      fields: [
        { name: 'done', defaultValue: false }
      ],
      methods: [
        { name: 'complete', parameters: [], body: 'set field "done" of myself to true' }
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
      pageNavigations: [],
      listOperations: [],
      variableAssignments: [],
      connections: [],
      morphOperations: [],
      printStatements: [],
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
      pageNavigations: [],
      listOperations: [],
      variableAssignments: [],
      connections: [],
      morphOperations: [],
      printStatements,
      errors: []
    })
    
    expect(result.errors).toHaveLength(0)
    expect(result.printStatements).toHaveLength(2)
    expect(result.printStatements[0].message).toBe('Hello World')
    expect(result.printStatements[1].message).toBe('Debug info')
  })

  it('should execute FieldMorph add method with parameter', () => {
    const executor = new ObjaxExecutor()
    
    const fieldClass: ObjaxClassDefinition = {
      name: 'FieldMorph',
      fields: [
        { name: 'label', defaultValue: 'フィールド' },
        { name: 'value', defaultValue: '' }
      ],
      methods: [
        { name: 'add', parameters: [], body: 'set field "value" of myself to parameter' }
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
      parameters: ['Hello World']
    }
    
    const result = executor.execute({
      classes: [fieldClass],
      instances: [fieldInstance],
      methodCalls: [methodCall],
      stateOperations: [],
      pageNavigations: [],
      listOperations: [],
      variableAssignments: [],
      connections: [],
      morphOperations: [],
      printStatements: [],
      errors: []
    })
    
    expect(result.errors).toHaveLength(0)
    expect(result.instances[0].properties.value).toBe('Hello World')
  })
})