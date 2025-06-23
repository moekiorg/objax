import { describe, test, expect, beforeEach } from 'vitest'
import { LinearObjaxParser } from '../linearParser'
import { ObjaxExecutor } from '../executor'

describe('New Event Syntax', () => {
  let parser: LinearObjaxParser
  let executor: ObjaxExecutor

  beforeEach(() => {
    parser = new LinearObjaxParser()
    executor = new ObjaxExecutor()
  })

  test('should parse block assignment with action block', () => {
    const code = 'onClick is <alert.value becomes "不正です">'
    const result = parser.parse(code)

    expect(result.errors).toEqual([])
    expect(result.blockAssignments).toHaveLength(1)
    expect(result.blockAssignments[0]).toEqual({
      blockName: 'onClick',
      blockBody: 'alert.value becomes "不正です"',
      parameters: undefined
    })
  })

  test('should parse new event listener syntax', () => {
    const code = 'button addAction with event "click" and action onClick'
    const result = parser.parse(code)

    expect(result.errors).toEqual([])
    expect(result.eventListeners).toHaveLength(1)
    expect(result.eventListeners[0]).toEqual({
      instanceName: 'button',
      eventType: 'click',
      action: '@block:onClick'
    })
  })

  test('should handle complete example with block and event', () => {
    const code = `
button is a ButtonMorph
alert is a FieldMorph with value ""
onClick is <alert.value becomes "不正です">
button addAction with event "click" and action onClick
`
    const result = parser.parse(code)

    expect(result.errors).toEqual([])
    expect(result.instances).toHaveLength(2)
    expect(result.blockAssignments).toHaveLength(1)
    expect(result.eventListeners).toHaveLength(1)
    
    // Check instances
    const buttonInstance = result.instances.find(i => i.name === 'button')
    const alertInstance = result.instances.find(i => i.name === 'alert')
    expect(buttonInstance?.className).toBe('ButtonMorph')
    expect(alertInstance?.className).toBe('FieldMorph')
    expect(alertInstance?.properties.value).toBe('')
    
    // Check block assignment
    expect(result.blockAssignments[0].blockName).toBe('onClick')
    expect(result.blockAssignments[0].blockBody).toBe('alert.value becomes "不正です"')
    
    // Check event listener
    expect(result.eventListeners[0].instanceName).toBe('button')
    expect(result.eventListeners[0].eventType).toBe('click')
    expect(result.eventListeners[0].action).toBe('@block:onClick')
  })

  test('should execute event listener with block reference', () => {
    const code = `
button is a ButtonMorph
alert is a FieldMorph with value ""
onClick is <alert.value becomes "不正です">
button addAction with event "click" and action onClick
`
    const result = parser.parse(code)
    const executed = executor.execute(result)

    expect(executed.errors).toEqual([])
    expect(executed.instances).toHaveLength(2)
    
    // Check that the event listener was attached with resolved action
    const buttonInstance = executed.instances.find(i => i.name === 'button')
    expect(buttonInstance?.properties.eventListeners).toHaveLength(1)
    expect(buttonInstance?.properties.eventListeners[0]).toEqual({
      eventType: 'click',
      action: 'alert.value becomes "不正です"'
    })
  })

  test('should validate event types in new syntax', () => {
    const code = 'button addAction with event "hover" and action onClick'
    const result = parser.parse(code)

    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('Invalid event type: hover')
  })

  test('should handle multiple event types', () => {
    const code = `
button1 is a ButtonMorph
button2 is a ButtonMorph
field1 is a FieldMorph
onClick is <print "clicked">
onChange is <print "changed">
button1 addAction with event "click" and action onClick
button2 addAction with event "click" and action onClick
field1 addAction with event "change" and action onChange
`
    const result = parser.parse(code)

    expect(result.errors).toEqual([])
    expect(result.instances).toHaveLength(3)
    expect(result.blockAssignments).toHaveLength(2)
    expect(result.eventListeners).toHaveLength(3)
    
    // Check all event listeners reference the correct blocks
    expect(result.eventListeners.every(el => el.action.startsWith('@block:'))).toBe(true)
    expect(result.eventListeners.filter(el => el.action === '@block:onClick')).toHaveLength(2)
    expect(result.eventListeners.filter(el => el.action === '@block:onChange')).toHaveLength(1)
  })

  test('should handle missing block reference', () => {
    const code = `
button is a ButtonMorph
button addAction with event "click" and action nonExistentBlock
`
    const result = parser.parse(code)
    
    // Should parse successfully but fail during execution
    expect(result.errors).toEqual([])
    expect(result.eventListeners).toHaveLength(1)
    
    // Execution should fail due to missing block
    const executed = executor.execute(result)
    expect(executed.errors).toHaveLength(1)
    expect(executed.errors[0]).toContain('Block "nonExistentBlock" not found')
  })
})