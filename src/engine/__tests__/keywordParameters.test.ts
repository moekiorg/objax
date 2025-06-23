import { describe, it, expect, beforeEach } from 'vitest'
import { LinearObjaxParser } from '../linearParser'
import { ObjaxExecutor } from '../executor'

describe('Keyword Parameters', () => {
  let parser: LinearObjaxParser
  let executor: ObjaxExecutor

  beforeEach(() => {
    parser = new LinearObjaxParser()
    executor = new ObjaxExecutor()
  })

  it('should parse method call with single keyword parameter', () => {
    const code = `
Task is a Class
Task has field "due"
myTask is a Task
myTask done with due "2025-05-01"
`
    const result = parser.parse(code)
    
    expect(result.errors).toHaveLength(0)
    expect(result.methodCalls).toHaveLength(1)
    expect(result.methodCalls[0].instanceName).toBe('myTask')
    expect(result.methodCalls[0].methodName).toBe('done')
    expect(result.methodCalls[0].keywordParameters).toEqual({
      due: '2025-05-01'
    })
  })

  it('should parse method call with multiple keyword parameters', () => {
    const code = `
Task is a Class
myTask is a Task
myTask update with title "Buy groceries" and priority 5 and due "2025-05-01"
`
    const result = parser.parse(code)
    
    expect(result.errors).toHaveLength(0)
    expect(result.methodCalls).toHaveLength(1)
    expect(result.methodCalls[0].keywordParameters).toEqual({
      title: 'Buy groceries',
      priority: 5,
      due: '2025-05-01'
    })
  })

  it('should parse method call without parameters', () => {
    const code = `
Task is a Class
myTask is a Task
myTask complete
`
    const result = parser.parse(code)
    
    expect(result.errors).toHaveLength(0)
    expect(result.methodCalls).toHaveLength(1)
    expect(result.methodCalls[0].keywordParameters).toBeUndefined()
  })

  it('should execute method with keyword parameters', () => {
    const code = `
Task is a Class
Task has field "title"
Task has field "due"
Task has method "setDetails" do self.title is title and self.due is due
myTask is a Task
myTask setDetails with title "Buy groceries" and due "2025-05-01"
`
    const parseResult = parser.parse(code)
    const executionResult = executor.execute(parseResult)
    
    expect(executionResult.errors).toHaveLength(0)
    expect(executionResult.instances).toHaveLength(1)
    const instance = executionResult.instances[0]
    expect(instance.properties.title).toBe('Buy groceries')
    expect(instance.properties.due).toBe('2025-05-01')
  })

  it('should handle boolean and number keyword parameters', () => {
    const code = `
Task is a Class
myTask is a Task
myTask configure with done true and priority 3
`
    const result = parser.parse(code)
    
    expect(result.errors).toHaveLength(0)
    expect(result.methodCalls[0].keywordParameters).toEqual({
      done: true,
      priority: 3
    })
  })

  it('should handle quoted string keys', () => {
    const code = `
Task is a Class
myTask is a Task
myTask configure with "task-id" 123 and "is-urgent" true
`
    const result = parser.parse(code)
    
    expect(result.errors).toHaveLength(0)
    expect(result.methodCalls[0].keywordParameters).toEqual({
      'task-id': 123,
      'is-urgent': true
    })
  })
})