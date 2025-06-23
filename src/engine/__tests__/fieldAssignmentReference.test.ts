import { describe, it, expect } from 'vitest'
import { ObjaxEngine } from '../objaxEngine'

describe('Field Assignment with Field References', () => {
  it('should resolve field references in field assignments', () => {
    const engine = new ObjaxEngine()
    const code = `
q1Field is a FieldMorph
q1Field.value is "Hello World"
q1 is a Task
q1.content is q1Field.value
`
    
    const result = engine.execute(code)
    
    expect(result.errors).toHaveLength(0)
    expect(result.instances).toHaveLength(2)
    
    const q1 = result.instances.find(i => i.name === 'q1')
    expect(q1).toBeDefined()
    expect(q1?.properties.content).toBe('Hello World')
    expect(q1?.properties.content).not.toEqual(['Hello World'])
    expect(q1?.properties.content).not.toEqual([{ type: 'field_reference', instanceName: 'q1Field', fieldName: 'value' }])
  })

  it('should handle array field assignments', () => {
    const engine = new ObjaxEngine()
    const code = `
view is a DatabaseMorph
view.columns is [done, title, priority]
`
    
    const result = engine.execute(code)
    
    expect(result.errors).toHaveLength(0)
    const view = result.instances.find(i => i.name === 'view')
    expect(view?.properties.columns).toEqual(['done', 'title', 'priority'])
  })

  it('should handle single value field assignments', () => {
    const engine = new ObjaxEngine()
    const code = `
task is a Task
task.title is "My Task"
`
    
    const result = engine.execute(code)
    
    expect(result.errors).toHaveLength(0)
    const task = result.instances.find(i => i.name === 'task')
    expect(task?.properties.title).toBe('My Task')
    expect(task?.properties.title).not.toEqual(['My Task'])
  })

  it('should error when field reference instance not found', () => {
    const engine = new ObjaxEngine()
    const code = `
q1 is a Task
q1.content is nonExistent.value
`
    
    const result = engine.execute(code)
    
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0]).toContain('Instance "nonExistent" not found')
  })

  it('should handle nested field references', () => {
    const engine = new ObjaxEngine()
    const code = `
field1 is a FieldMorph
field1.value is "Value from field1"
field2 is a FieldMorph
field2.value is field1.value
task is a Task
task.content is field2.value
`
    
    const result = engine.execute(code)
    
    expect(result.errors).toHaveLength(0)
    const task = result.instances.find(i => i.name === 'task')
    expect(task?.properties.content).toBe('Value from field1')
  })
})