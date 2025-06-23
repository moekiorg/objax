import { describe, it, expect } from 'vitest'
import { LinearObjaxParser } from '../linearParser'

describe('Event Listener Syntax', () => {
  it('should parse button click event with page navigation action', () => {
    const parser = new LinearObjaxParser()
    const code = `
ButtonMorph is a Class
myButton is a new ButtonMorph
myButton addAction with when click action <world goto with page "demo">
`
    const result = parser.parse(code)
    
    expect(result.errors).toHaveLength(0)
    expect(result.classes).toHaveLength(1)
    expect(result.instances).toHaveLength(1)
    
    // Check for event listener
    expect(result.eventListeners).toBeDefined()
    expect(result.eventListeners).toHaveLength(1)
    expect(result.eventListeners[0]).toEqual({
      instanceName: 'myButton',
      eventType: 'click',
      action: 'world goto with page "demo"'
    })
  })

  it('should parse multiple event listeners', () => {
    const parser = new LinearObjaxParser()
    const code = `
ButtonMorph is a Class
FieldMorph is a Class
myButton is a new ButtonMorph
myField is a new FieldMorph
myButton addAction with when click action <print "Button clicked">
myField addAction with when change action <self.value is "Changed">
`
    const result = parser.parse(code)
    
    expect(result.errors).toHaveLength(0)
    expect(result.eventListeners).toHaveLength(2)
    expect(result.eventListeners[0]).toEqual({
      instanceName: 'myButton',
      eventType: 'click',
      action: 'print "Button clicked"'
    })
    expect(result.eventListeners[1]).toEqual({
      instanceName: 'myField',
      eventType: 'change',
      action: 'self.value is "Changed"'
    })
  })

  it('should handle complex actions in event listeners', () => {
    const parser = new LinearObjaxParser()
    const code = `
ButtonMorph is a Class
myButton is a new ButtonMorph
myButton addAction with when click action <myCounter increment with amount 1 and notify true>
`
    const result = parser.parse(code)
    
    expect(result.errors).toHaveLength(0)
    expect(result.eventListeners).toHaveLength(1)
    expect(result.eventListeners[0]).toEqual({
      instanceName: 'myButton',
      eventType: 'click',
      action: 'myCounter increment with amount 1 and notify true'
    })
  })

  it('should validate event types', () => {
    const parser = new LinearObjaxParser()
    const code = `
ButtonMorph is a Class
myButton is a new ButtonMorph
myButton addAction with when hover action <print "Hovered">
`
    const result = parser.parse(code)
    
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('Invalid event type: hover')
  })

  it('should handle event listeners with method calls', () => {
    const parser = new LinearObjaxParser()
    const code = `
Task is a Class
Task has method "complete" do self.done is true
myTask is a new Task
completeButton is a new ButtonMorph
completeButton addAction with when click action <myTask complete>
`
    const result = parser.parse(code)
    
    expect(result.errors).toHaveLength(0)
    expect(result.eventListeners).toHaveLength(1)
    expect(result.eventListeners[0]).toEqual({
      instanceName: 'completeButton',
      eventType: 'click',
      action: 'myTask complete'
    })
  })
})