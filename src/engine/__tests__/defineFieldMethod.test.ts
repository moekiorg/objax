import { describe, expect, it } from 'vitest'
import { parseObjax } from '../objaxEngine'
import { ObjaxExecutor } from '../executor'

describe('Define Field and Method Syntax', () => {
  it('should parse and execute defineField syntax', () => {
    const code = `
Task is a Class
Task defineField with name "title"
Task defineField with name "done" and default false
myTask is a new Task
    `
    
    const result = parseObjax(code)
    expect(result.errors).toHaveLength(0)
    expect(result.classes).toHaveLength(1)
    expect(result.classes[0].fields).toHaveLength(2)
    expect(result.classes[0].fields[0].name).toBe('title')
    expect(result.classes[0].fields[1].name).toBe('done')
    expect(result.classes[0].fields[1].defaultValue).toBe(false)
    
    // Execute to create instance
    const executor = new ObjaxExecutor()
    const executionResult = executor.execute(result)
    
    expect(executionResult.instances).toHaveLength(1)
    expect(executionResult.instances[0].properties.done).toBe(false)
  })

  it('should parse and execute defineMethod syntax', () => {
    const code = `
Task is a Class
Task defineField with name "title"
Task defineField with name "done" and default false
Task defineMethod "complete" do {self.done is true}
Task defineMethod "setTitle" with "newTitle" do {self.title is newTitle}
myTask is a new Task
myTask complete
myTask setTitle "Test Task"
    `
    
    const result = parseObjax(code)
    expect(result.errors).toHaveLength(0)
    expect(result.classes).toHaveLength(1)
    expect(result.classes[0].methods).toHaveLength(2)
    expect(result.classes[0].methods[0].name).toBe('complete')
    expect(result.classes[0].methods[0].body).toBe('self.done is true')
    expect(result.classes[0].methods[1].name).toBe('setTitle')
    expect(result.classes[0].methods[1].parameters).toEqual(['newTitle'])
    
    // Execute method calls
    const executor = new ObjaxExecutor()
    const executionResult = executor.execute(result)
    
    expect(executionResult.instances).toHaveLength(1)
    expect(executionResult.instances[0].properties.done).toBe(true)
    expect(executionResult.instances[0].properties.title).toBe('Test Task')
  })

  it('should work with mixed syntax (old and new)', () => {
    const code = `
Task is a Class
Task has field "title"
Task defineField with name "done" and default false
Task has method "markIncomplete" do self.done is false
Task defineMethod "complete" do {self.done is true}
myTask is a new Task
myTask complete
    `
    
    const result = parseObjax(code)
    expect(result.errors).toHaveLength(0)
    expect(result.classes).toHaveLength(1)
    expect(result.classes[0].fields).toHaveLength(2)
    expect(result.classes[0].methods).toHaveLength(2)
    
    // Check that both syntaxes were parsed correctly
    const taskClass = result.classes[0]
    expect(taskClass.fields.find(f => f.name === 'title')).toBeDefined()
    expect(taskClass.fields.find(f => f.name === 'done')).toBeDefined()
    expect(taskClass.methods.find(m => m.name === 'markIncomplete')).toBeDefined()
    expect(taskClass.methods.find(m => m.name === 'complete')).toBeDefined()
  })
})