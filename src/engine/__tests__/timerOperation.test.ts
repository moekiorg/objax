import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { LinearObjaxParser } from '../linearParser'
import { ObjaxExecutor } from '../executor'

describe('Timer Operation', () => {
  let parser: LinearObjaxParser
  let executor: ObjaxExecutor

  beforeEach(() => {
    parser = new LinearObjaxParser()
    executor = new ObjaxExecutor()
    // Mock timers
    vi.useFakeTimers()
  })

  afterEach(() => {
    executor.stopAllTimers()
    vi.restoreAllMocks()
  })

  test('should parse timer repeat syntax', () => {
    const code = 'timer repeat with time 1000 and action <box.width becomes box.width + 30>'
    const result = parser.parse(code)

    expect(result.errors).toEqual([])
    expect(result.timerOperations).toHaveLength(1)
    expect(result.timerOperations[0]).toEqual({
      instanceName: 'timer',
      time: 1000,
      action: 'box.width becomes box.width + 30'
    })
  })

  test('should handle timer operation execution', () => {
    const code = `
timer is a Timer
box is a BoxMorph with width 100
timer repeat with time 500 and action <box.width becomes box.width + 10>
`
    const result = parser.parse(code)
    const executed = executor.execute(result)

    expect(executed.errors).toEqual([])
    expect(executed.instances).toHaveLength(2)
    
    // Find timer instance
    const timerInstance = executed.instances.find(i => i.name === 'timer')
    expect(timerInstance).toBeDefined()
    expect(timerInstance?.properties.time).toBe(500)
    expect(timerInstance?.properties.action).toBe('box.width becomes box.width + 10')
    expect(timerInstance?.properties.isRunning).toBe(true)
  })

  test('should validate time value is a number', () => {
    const code = 'timer repeat with time "invalid" and action <print "test">'
    const result = parser.parse(code)

    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('Invalid time value: invalid. Must be a number')
  })

  test('should handle multiple timer operations', () => {
    const code = `
timer1 is a Timer
timer2 is a Timer
timer1 repeat with time 1000 and action <print "timer1">
timer2 repeat with time 2000 and action <print "timer2">
`
    const result = parser.parse(code)
    const executed = executor.execute(result)

    expect(executed.errors).toEqual([])
    expect(executed.timerOperations).toHaveLength(2)
    
    const timer1 = executed.instances.find(i => i.name === 'timer1')
    const timer2 = executed.instances.find(i => i.name === 'timer2')
    
    expect(timer1?.properties.time).toBe(1000)
    expect(timer2?.properties.time).toBe(2000)
  })

  test('should require action block in timer syntax', () => {
    const code = 'timer repeat with time 1000 and action invalid'
    const result = parser.parse(code)

    // The parser may succeed but the action won't be valid - check if timer operation is malformed
    expect(result.timerOperations).toHaveLength(0)
    // Or it should be treated as a messaging call instead of timer operation
    expect(result.methodCalls.length + result.errors.length).toBeGreaterThan(0)
  })

  test('should handle timer with complex action', () => {
    const code = `
counter is a FieldMorph with value 0
timer is a Timer
timer repeat with time 100 and action <counter.value becomes counter.value + 1>
`
    const result = parser.parse(code)
    const executed = executor.execute(result)

    expect(executed.errors).toEqual([])
    
    const timerInstance = executed.instances.find(i => i.name === 'timer')
    expect(timerInstance?.properties.action).toBe('counter.value becomes counter.value + 1')
    expect(timerInstance?.properties.isRunning).toBe(true)
  })
})