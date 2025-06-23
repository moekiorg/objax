import { describe, it, expect } from 'vitest'
import { LinearObjaxParser } from '../linearParser'
import { ObjaxExecutor } from '../executor'

describe('Event Listener Execution', () => {
  it('should attach event listeners to instances', () => {
    const parser = new LinearObjaxParser()
    const executor = new ObjaxExecutor()
    
    const code = `
ButtonMorph is a Class
myButton is a new ButtonMorph
myButton addAction with when click action <world goto with page "demo">
`
    const parseResult = parser.parse(code)
    const executionResult = executor.execute(parseResult)
    
    expect(executionResult.errors).toHaveLength(0)
    
    const button = executionResult.instances.find(i => i.name === 'myButton')
    expect(button).toBeDefined()
    expect(button?.properties.eventListeners).toBeDefined()
    expect(button?.properties.eventListeners).toHaveLength(1)
    expect(button?.properties.eventListeners[0]).toEqual({
      eventType: 'click',
      action: 'world goto with page "demo"'
    })
  })

  it('should attach multiple event listeners to the same instance', () => {
    const parser = new LinearObjaxParser()
    const executor = new ObjaxExecutor()
    
    const code = `
FieldMorph is a Class
myField is a new FieldMorph
myField addAction with when change action <print "Field changed">
myField addAction with when input action <self.value is "Updated">
`
    const parseResult = parser.parse(code)
    const executionResult = executor.execute(parseResult)
    
    expect(executionResult.errors).toHaveLength(0)
    
    const field = executionResult.instances.find(i => i.name === 'myField')
    expect(field?.properties.eventListeners).toHaveLength(2)
    expect(field?.properties.eventListeners[0]).toEqual({
      eventType: 'change',
      action: 'print "Field changed"'
    })
    expect(field?.properties.eventListeners[1]).toEqual({
      eventType: 'input',
      action: 'self.value is "Updated"'
    })
  })

  it('should handle errors for non-existent instances', () => {
    const parser = new LinearObjaxParser()
    const executor = new ObjaxExecutor()
    
    const code = `
nonExistentButton addAction with when click action <print "Clicked">
`
    const parseResult = parser.parse(code)
    const executionResult = executor.execute(parseResult)
    
    expect(executionResult.errors).toHaveLength(1)
    expect(executionResult.errors[0]).toContain('Instance "nonExistentButton" not found')
  })
})