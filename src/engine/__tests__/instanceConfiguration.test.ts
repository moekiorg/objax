import { LinearObjaxParser } from '../linearParser'
import { ObjaxExecutor } from '../executor'

describe('Instance Configuration', () => {
  let parser: LinearObjaxParser
  let executor: ObjaxExecutor

  beforeEach(() => {
    parser = new LinearObjaxParser()
    executor = new ObjaxExecutor()
  })

  test('should parse instance field configuration', () => {
    const code = `
      view is a DatabaseMorph
      view has field "title"
      view has field "done"
    `
    
    const result = parser.parse(code)
    
    expect(result.instances).toHaveLength(1)
    expect(result.instances[0].name).toBe('view')
    expect(result.instances[0].className).toBe('DatabaseMorph')
    
    expect(result.instanceConfigurations).toHaveLength(2)
    expect(result.instanceConfigurations[0].instanceName).toBe('view')
    expect(result.instanceConfigurations[0].configurationType).toBe('field')
    expect(result.instanceConfigurations[0].value).toBe('title')
    
    expect(result.instanceConfigurations[1].instanceName).toBe('view')
    expect(result.instanceConfigurations[1].configurationType).toBe('field')
    expect(result.instanceConfigurations[1].value).toBe('done')
  })

  test('should execute instance field configuration', () => {
    const code = `
      view is a DatabaseMorph
      view has field "title"
      view has field "done"
    `
    
    const parseResult = parser.parse(code)
    const executionResult = executor.execute(parseResult)
    
    expect(executionResult.instances).toHaveLength(1)
    const instance = executionResult.instances[0]
    
    expect(instance.properties.fields).toEqual(['title', 'done'])
  })

  test('should not add duplicate fields', () => {
    const code = `
      view is a DatabaseMorph
      view has field "title"
      view has field "title"
    `
    
    const parseResult = parser.parse(code)
    const executionResult = executor.execute(parseResult)
    
    const instance = executionResult.instances[0]
    expect(instance.properties.fields).toEqual(['title'])
  })

  test('should handle complex DatabaseMorph configuration', () => {
    const code = `
      TaskList is a Class
      TaskList has field "items"
      
      myTasks is a TaskList
      view is a DatabaseMorph
      view has field "title"
      view has field "done"
      view has field "priority"
    `
    
    const parseResult = parser.parse(code)
    const executionResult = executor.execute(parseResult)
    
    expect(executionResult.classes).toHaveLength(1)
    expect(executionResult.instances).toHaveLength(2)
    
    const databaseMorph = executionResult.instances.find(i => i.className === 'DatabaseMorph')
    expect(databaseMorph?.properties.fields).toEqual(['title', 'done', 'priority'])
  })

  test('should handle instance configuration with existing instances', () => {
    const code = `
      view has field "title"
      view has field "done"
    `
    
    const existingInstances = [{
      name: 'view',
      className: 'DatabaseMorph',
      properties: {}
    }]
    
    const parseResult = parser.parse(code, existingInstances)
    const executionResult = executor.execute({
      ...parseResult,
      instances: existingInstances
    })
    
    const instance = executionResult.instances.find(i => i.name === 'view')
    expect(instance?.properties.fields).toEqual(['title', 'done'])
  })

  test('should error when configuring non-existent instance', () => {
    const code = `
      nonExistentView has field "title"
    `
    
    const parseResult = parser.parse(code)
    const executionResult = executor.execute(parseResult)
    
    expect(executionResult.errors).toHaveLength(1)
    expect(executionResult.errors[0]).toContain('Instance "nonExistentView" not found')
  })
})