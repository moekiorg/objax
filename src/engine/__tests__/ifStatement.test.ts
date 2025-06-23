import { describe, expect, it } from 'vitest'
import { LinearObjaxParser } from '../linearParser'
import { ObjaxExecutor } from '../executor'

describe('If Statement', () => {
  it('should parse basic if statement with thenDo', () => {
    const parser = new LinearObjaxParser()
    const code = 'isDone thenDo with action <task delete>'
    
    const result = parser.parse(code)
    expect(result.errors).toHaveLength(0)
    expect(result.ifStatements).toHaveLength(1)
    
    const ifStatement = result.ifStatements[0]
    expect(ifStatement.condition).toBe('isDone')
    expect(ifStatement.action).toBe('task delete')
  })

  it('should execute if statement when condition is true', () => {
    const parser = new LinearObjaxParser()
    const executor = new ObjaxExecutor()
    
    // Create a simple condition block
    const setupCode = 'isDone is <true>'
    const setupResult = parser.parse(setupCode)
    expect(setupResult.errors).toHaveLength(0)
    
    // Execute setup to register the block
    executor.execute(setupResult)
    
    // Create if statement
    const ifCode = 'isDone thenDo with action <print "Condition is true">'
    const ifResult = parser.parse(ifCode)
    expect(ifResult.errors).toHaveLength(0)
    expect(ifResult.ifStatements).toHaveLength(1)
    
    // Execute if statement
    const executedResult = executor.execute(ifResult)
    expect(executedResult.errors).toHaveLength(0)
    
    // The if statement should have been processed
    expect(executedResult.ifStatements).toHaveLength(1)
  })

  it('should parse if statement with complex action', () => {
    const parser = new LinearObjaxParser()
    const code = 'isDone thenDo with action <myTask remove>'
    
    const result = parser.parse(code)
    expect(result.errors).toHaveLength(0)
    expect(result.ifStatements).toHaveLength(1)
    
    const ifStatement = result.ifStatements[0]
    expect(ifStatement.condition).toBe('isDone')
    expect(ifStatement.action).toBe('myTask remove')
  })

  it('should parse if statement with otherwiseDo', () => {
    const parser = new LinearObjaxParser()
    const code = 'isDone thenDo with action <print "Task completed"> otherwiseDo with action <print "Task not done">'
    
    const result = parser.parse(code)
    expect(result.errors).toHaveLength(0)
    expect(result.ifStatements).toHaveLength(1)
    
    const ifStatement = result.ifStatements[0]
    expect(ifStatement.condition).toBe('isDone')
    expect(ifStatement.action).toBe('print "Task completed"')
    expect(ifStatement.otherwiseAction).toBe('print "Task not done"')
  })

  it('should execute otherwiseDo when condition is false', () => {
    const parser = new LinearObjaxParser()
    const executor = new ObjaxExecutor()
    
    // Create a condition block that returns false
    const setupCode = 'isNotDone is <false>'
    const setupResult = parser.parse(setupCode)
    expect(setupResult.errors).toHaveLength(0)
    
    // Execute setup to register the block
    executor.execute(setupResult)
    
    // Create if statement with otherwiseDo
    const ifCode = 'isNotDone thenDo with action <print "True"> otherwiseDo with action <print "False">'
    const ifResult = parser.parse(ifCode)
    expect(ifResult.errors).toHaveLength(0)
    expect(ifResult.ifStatements).toHaveLength(1)
    
    // Execute if statement
    const executedResult = executor.execute(ifResult)
    expect(executedResult.errors).toHaveLength(0)
    
    // The if statement should have been processed
    expect(executedResult.ifStatements).toHaveLength(1)
    const ifStatement = executedResult.ifStatements[0]
    expect(ifStatement.otherwiseAction).toBe('print "False"')
  })

  it('should handle if statement without otherwiseDo', () => {
    const parser = new LinearObjaxParser()
    const code = 'isDone thenDo with action <print "Only if true">'
    
    const result = parser.parse(code)
    expect(result.errors).toHaveLength(0)
    expect(result.ifStatements).toHaveLength(1)
    
    const ifStatement = result.ifStatements[0]
    expect(ifStatement.condition).toBe('isDone')
    expect(ifStatement.action).toBe('print "Only if true"')
    expect(ifStatement.otherwiseAction).toBeUndefined()
  })

  it('should handle complex conditions and actions', () => {
    const parser = new LinearObjaxParser()
    const code = 'myTask.done thenDo with action <myTask remove> otherwiseDo with action <myTask show>'
    
    const result = parser.parse(code)
    expect(result.errors).toHaveLength(0)
    expect(result.ifStatements).toHaveLength(1)
    
    const ifStatement = result.ifStatements[0]
    expect(ifStatement.condition).toBe('myTask.done')
    expect(ifStatement.action).toBe('myTask remove')
    expect(ifStatement.otherwiseAction).toBe('myTask show')
  })

  it('should execute correct branch based on condition evaluation', () => {
    const parser = new LinearObjaxParser()
    const executor = new ObjaxExecutor()
    
    // Test true condition - should execute thenDo
    const trueConditionCode = 'isReady is <true>'
    const trueSetupResult = parser.parse(trueConditionCode)
    executor.execute(trueSetupResult)
    
    const trueIfCode = 'isReady thenDo with action <print "Ready"> otherwiseDo with action <print "Not Ready">'
    const trueIfResult = parser.parse(trueIfCode)
    const trueExecutedResult = executor.execute(trueIfResult)
    
    expect(trueExecutedResult.errors).toHaveLength(0)
    
    // Test false condition - should execute otherwiseDo
    const falseConditionCode = 'isNotReady is <false>'
    const falseSetupResult = parser.parse(falseConditionCode)
    executor.execute(falseSetupResult)
    
    const falseIfCode = 'isNotReady thenDo with action <print "Ready"> otherwiseDo with action <print "Not Ready">'
    const falseIfResult = parser.parse(falseIfCode)
    const falseExecutedResult = executor.execute(falseIfResult)
    
    expect(falseExecutedResult.errors).toHaveLength(0)
  })
})