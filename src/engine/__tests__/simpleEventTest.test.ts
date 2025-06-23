import { describe, test, expect, beforeEach } from 'vitest'
import { useObjaxStore } from '../../stores/objaxStore'
import { executeEventAction } from '../../utils/executeEventAction'
import { convertToClassDefinition, convertToInstanceDefinition } from '../objaxEngine'

describe('Simple Event Test', () => {
  beforeEach(() => {
    // Clear store data
    const store = useObjaxStore.getState()
    store.instances.length = 0
    store.classes.length = 0
  })

  test('should execute simple becomes assignment', () => {
    const store = useObjaxStore.getState()
    
    // Create a simple field instance
    store.addInstance({
      id: 'field1',
      name: 'myField',
      className: 'FieldMorph',
      page: 'TestPage',
      value: 'initial',
      label: 'Test Field'
    })

    console.log('Before execution:', store.instances.map(i => ({ name: i.name, value: i.value })))

    // Execute simple becomes assignment
    const errors = executeEventAction('myField.value becomes "changed"', 'test', store)

    console.log('After execution:', store.instances.map(i => ({ name: i.name, value: i.value })))
    console.log('Errors:', errors)

    expect(errors).toEqual([])
    
    const updatedField = store.instances.find(i => i.name === 'myField')
    expect(updatedField?.value).toBe('changed')
  })

  test('should define and execute block', () => {
    const store = useObjaxStore.getState()
    
    // Create a field instance  
    store.addInstance({
      id: 'field1',
      name: 'testField',
      className: 'FieldMorph', 
      page: 'TestPage',
      value: 'start',
      label: 'Test Field'
    })

    // Get engine and define block
    const engine = store.getObjaxEngine()
    const classDefinitions = store.classes.map(convertToClassDefinition)
    const instanceDefinitions = store.instances.map(convertToInstanceDefinition)

    console.log('Defining block with instances:', instanceDefinitions.map(i => ({ name: i.name, value: i.properties.value })))

    // Define the block
    const defineResult = engine.execute('testBlock is <testField.value becomes "blocked">', classDefinitions, instanceDefinitions)
    console.log('Block definition result:', defineResult.errors)

    // Check block was registered
    const blocks = engine.getRegisteredBlocks()
    console.log('Registered blocks:', Array.from(blocks.keys()))

    // Execute the block
    const errors = executeEventAction('@block:testBlock', 'test', store)
    console.log('Block execution errors:', errors)

    const updatedField = store.instances.find(i => i.name === 'testField')
    console.log('Updated field value:', updatedField?.value)
    
    expect(errors).toEqual([])
    expect(updatedField?.value).toBe('blocked')
  })
})