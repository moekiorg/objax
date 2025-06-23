import { describe, it, expect } from 'vitest'
import { parseObjax } from '../../engine/objaxEngine'

describe('Event Listener Integration', () => {
  it('should handle button click with page navigation', () => {
    const code = `
ButtonMorph is a Class
myButton is a new ButtonMorph with label "Go to Demo"
myButton addAction with when click action <world goto with page "demo">
`
    const result = parseObjax(code)
    
    expect(result.errors).toHaveLength(0)
    expect(result.instances).toHaveLength(1)
    
    const button = result.instances[0]
    expect(button.name).toBe('myButton')
    expect(button.properties.label).toBe('Go to Demo')
    expect(button.properties.eventListeners).toHaveLength(1)
    expect(button.properties.eventListeners[0]).toEqual({
      eventType: 'click',
      action: 'world goto with page "demo"'
    })
  })

  it('should handle complex event listeners with method calls', () => {
    const code = `
Counter is a Class
Counter has field "value" has default 0
Counter has method "increment" do self.value is self.value + 1

myCounter is a new Counter
incrementButton is a new ButtonMorph with label "+"
incrementButton addAction with when click action <myCounter increment>
`
    const result = parseObjax(code)
    
    expect(result.errors).toHaveLength(0)
    expect(result.classes).toHaveLength(1)
    expect(result.instances).toHaveLength(2)
    
    const button = result.instances.find(i => i.name === 'incrementButton')
    expect(button).toBeDefined()
    expect(button?.properties.eventListeners).toHaveLength(1)
    expect(button?.properties.eventListeners[0]).toEqual({
      eventType: 'click',
      action: 'myCounter increment'
    })
  })

  it('should handle multiple event listeners on field morph', () => {
    const code = `
FieldMorph is a Class
State is a Class

formField is a new FieldMorph with label "Email"
emailState is a new State

formField addAction with when change action <emailState set with value self.value>
formField addAction with when input action <print "Typing...">
`
    const result = parseObjax(code)
    
    expect(result.errors).toHaveLength(0)
    
    const field = result.instances.find(i => i.name === 'formField')
    expect(field).toBeDefined()
    expect(field?.properties.eventListeners).toHaveLength(2)
    expect(field?.properties.eventListeners[0].eventType).toBe('change')
    expect(field?.properties.eventListeners[1].eventType).toBe('input')
  })
})