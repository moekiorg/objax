import { describe, test, expect, beforeEach } from 'vitest'
import { useObjaxStore } from '../../stores/objaxStore'
import { executeEventAction } from '../../utils/executeEventAction'
import { convertToClassDefinition, convertToInstanceDefinition } from '../objaxEngine'

describe('Event Action Integration', () => {
  let store: ReturnType<typeof useObjaxStore>

  beforeEach(() => {
    // Reset store
    store = useObjaxStore.getState()
    // Clear all data
    store.instances.length = 0
    store.classes.length = 0
  })

  test('should execute event action with block reference', async () => {
    // Setup: Create instances
    store.addInstance({
      id: 'btn1',
      name: 'button',
      className: 'ButtonMorph',
      page: 'TestPage',
      label: 'Test Button'
    })

    store.addInstance({
      id: 'alert1', 
      name: 'alert',
      className: 'FieldMorph',
      page: 'TestPage',
      value: '',
      label: 'Alert Field'
    })

    // Get the engine and define the block first
    const engine = store.getObjaxEngine()
    
    // Use the same conversion as executeEventAction
    const classDefinitions = store.classes.map(convertToClassDefinition)
    const instanceDefinitions = store.instances.map(convertToInstanceDefinition)

    // Define the block
    engine.execute('onClick is <alert.value becomes "不正です">', classDefinitions, instanceDefinitions)

    // Now execute the event action that references the block
    const errors = executeEventAction('@block:onClick', 'button', store)

    // Check that the action executed successfully
    expect(errors).toEqual([])

    // Check that the alert field was updated
    const updatedAlert = store.instances.find(i => i.name === 'alert')
    expect(updatedAlert?.value).toBe('不正です')
  })

  test('should handle missing block gracefully', () => {
    // Setup: Create instance
    store.addInstance({
      id: 'btn1',
      name: 'button', 
      className: 'ButtonMorph',
      page: 'TestPage',
      label: 'Test Button'
    })

    // Try to execute non-existent block
    const errors = executeEventAction('@block:nonExistentBlock', 'button', store)

    // Should have an error about missing block
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('Block "nonExistentBlock" not found')
  })

  test('should execute direct action code without block', () => {
    // Setup: Create instances
    store.addInstance({
      id: 'alert1',
      name: 'alert',
      className: 'FieldMorph', 
      page: 'TestPage',
      value: '',
      label: 'Alert Field'
    })

    // Execute direct action code
    const errors = executeEventAction('alert.value becomes "直接実行"', 'button', store)

    // Check that the action executed successfully
    expect(errors).toEqual([])

    // Check that the alert field was updated
    const updatedAlert = store.instances.find(i => i.name === 'alert')
    expect(updatedAlert?.value).toBe('直接実行')
  })

  test('should maintain block registry across multiple executions', () => {
    // Setup: Create instances
    store.addInstance({
      id: 'counter1',
      name: 'counter',
      className: 'FieldMorph',
      page: 'TestPage', 
      value: 0,
      label: 'Counter'
    })

    const engine = store.getObjaxEngine()
    const classDefinitions = store.classes.map(cls => ({
      name: cls.name,
      fields: cls.fields.map(f => ({ name: f.name, defaultValue: f.default })),
      methods: cls.methods.map(m => ({ name: m.name, parameters: [], body: m.code || '' }))
    }))
    const instanceDefinitions = store.instances.map(inst => ({
      name: inst.name,
      className: inst.className,
      properties: inst
    }))

    // Define increment block
    engine.execute('increment is <counter.value becomes counter.value + 1>', classDefinitions, instanceDefinitions)

    // Execute the increment action multiple times
    executeEventAction('@block:increment', 'button', store)
    executeEventAction('@block:increment', 'button', store) 
    executeEventAction('@block:increment', 'button', store)

    // Check that counter was incremented 3 times
    const updatedCounter = store.instances.find(i => i.name === 'counter')
    expect(updatedCounter?.value).toBe(3)
  })
})