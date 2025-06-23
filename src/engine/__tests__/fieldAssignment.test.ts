import { describe, it, expect, beforeEach } from 'vitest'
import { LinearObjaxParser } from '../linearParser'
import { ObjaxExecutor } from '../executor'

describe('Field Assignment', () => {
  let parser: LinearObjaxParser
  let executor: ObjaxExecutor

  beforeEach(() => {
    parser = new LinearObjaxParser()
    executor = new ObjaxExecutor()
  })

  it('should parse field assignment with square bracket array', () => {
    const code = `
view is a DatabaseMorph
view.columns is [done, title, priority]
`
    const result = parser.parse(code)
    
    expect(result.fieldAssignments).toHaveLength(1)
    expect(result.fieldAssignments[0].instanceName).toBe('view')
    expect(result.fieldAssignments[0].fieldName).toBe('columns')
    expect(result.fieldAssignments[0].values).toEqual(['done', 'title', 'priority'])
  })

  it('should parse field assignment with single value', () => {
    const code = `
view is a DatabaseMorph
view.dataSource is "myTasks"
`
    const result = parser.parse(code)
    
    expect(result.fieldAssignments).toHaveLength(1)
    expect(result.fieldAssignments[0].instanceName).toBe('view')
    expect(result.fieldAssignments[0].fieldName).toBe('dataSource')
    expect(result.fieldAssignments[0].values).toEqual(['myTasks'])
  })

  it('should execute field assignment and update instance properties', () => {
    const code = `
view is a DatabaseMorph
view.columns is [done, title, priority]
`
    const parseResult = parser.parse(code)
    const executionResult = executor.execute(parseResult)
    
    expect(executionResult.instances).toHaveLength(1)
    const instance = executionResult.instances[0]
    expect(instance.name).toBe('view')
    expect(instance.properties.columns).toEqual(['done', 'title', 'priority'])
  })

  it('should handle multiple field assignments', () => {
    const code = `
view is a DatabaseMorph
view.columns is [done, title]
view.viewMode is table
`
    const parseResult = parser.parse(code)
    const executionResult = executor.execute(parseResult)
    
    expect(executionResult.instances).toHaveLength(1)
    const instance = executionResult.instances[0]
    expect(instance.properties.columns).toEqual(['done', 'title'])
    expect(instance.properties.viewMode).toEqual(['table'])
  })

  it('should error when instance not found', () => {
    const code = `nonexistent.columns is [done, title]`
    const parseResult = parser.parse(code)
    const executionResult = executor.execute(parseResult)
    
    expect(executionResult.errors).toContain('Error executing field assignment: Instance "nonexistent" not found')
  })

  it('should handle empty array', () => {
    const code = `
view is a DatabaseMorph
view.columns is []
`
    const parseResult = parser.parse(code)
    const executionResult = executor.execute(parseResult)
    
    expect(executionResult.instances).toHaveLength(1)
    const instance = executionResult.instances[0]
    expect(instance.properties.columns).toEqual([])
  })

  it('should handle mixed value types in array', () => {
    const code = `
view is a DatabaseMorph
view.data is [taro, "会議は明日です", 123, true]
`
    const parseResult = parser.parse(code)
    const executionResult = executor.execute(parseResult)
    
    expect(executionResult.instances).toHaveLength(1)
    const instance = executionResult.instances[0]
    expect(instance.properties.data).toEqual(['taro', '会議は明日です', 123, true])
  })
})