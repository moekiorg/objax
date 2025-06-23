import { describe, it, expect } from 'vitest'
import { ObjaxEngine } from '../objaxEngine'

describe('Field References', () => {
  it('should parse field references in method parameters', () => {
    const engine = new ObjaxEngine()
    const code = `Task is a Class
Task defineField with name 'title' and default ''
itemsList is a List
TaskList is a Class
TaskList defineField with name 'items' and default itemsList
TaskList defineMethod with name 'add' and do "newTask is a Task with title {title}. {self}.items push newTask"

field is a new FieldMorph
myList is a new TaskList
myList add with title field.value`
    
    const result = engine.execute(code)
    
    expect(result.errors).toHaveLength(0)
    expect(result.methodCalls).toHaveLength(1)
    
    const methodCall = result.methodCalls[0]
    expect(methodCall.methodName).toBe('add')
    expect(methodCall.instanceName).toBe('myList')
    expect(methodCall.keywordParameters).toBeDefined()
    expect(methodCall.keywordParameters?.title).toEqual({
      type: 'field_reference',
      instanceName: 'field',
      fieldName: 'value'
    })
  })

  it('should resolve field references during execution', () => {
    const engine = new ObjaxEngine()
    const code = `Task is a Class
Task defineField with name 'title' and default ''
itemsList is a List
TaskList is a Class
TaskList defineField with name 'items' and default itemsList
TaskList defineMethod with name 'add' and do "newTask is a Task with title {title}. {self}.items push newTask"

field is a new FieldMorph
field.value is 'Learn Objax from Field'
myList is a new TaskList
myList add with title field.value`
    
    const result = engine.execute(code)
    
    expect(result.errors).toHaveLength(0)
    expect(result.instances).toHaveLength(4) // itemsList + field + myList + newTask
    
    const newTask = result.instances.find(i => i.className === 'Task')
    expect(newTask).toBeDefined()
    expect(newTask?.properties.title).toBe('Learn Objax from Field')
  })

  it('should handle multiple field references', () => {
    const engine = new ObjaxEngine()
    const code = `Task is a Class
Task defineField with name 'title' and default ''
Task defineField with name 'description' and default ''
itemsList is a List
TaskList is a Class
TaskList defineField with name 'items' and default itemsList
TaskList defineMethod with name 'addTask' and do "newTask is a Task with title {title} and description {description}. {self}.items push newTask"

titleField is a new FieldMorph
titleField.value is 'My Title'
descField is a new FieldMorph
descField.value is 'My Description'
myList is a new TaskList
myList addTask with title titleField.value and description descField.value`
    
    const result = engine.execute(code)
    
    expect(result.errors).toHaveLength(0)
    
    const newTask = result.instances.find(i => i.className === 'Task')
    expect(newTask).toBeDefined()
    expect(newTask?.properties.title).toBe('My Title')
    expect(newTask?.properties.description).toBe('My Description')
  })

  it('should handle errors for non-existent instances', () => {
    const engine = new ObjaxEngine()
    const code = `Task is a Class
Task defineField with name 'title' and default ''
itemsList is a List
TaskList is a Class
TaskList defineField with name 'items' and default itemsList
TaskList defineMethod with name 'add' and do "newTask is a Task with title {title}. {self}.items push newTask"

myList is a new TaskList
myList add with title nonExistentField.value`
    
    const result = engine.execute(code)
    
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0]).toContain('Instance "nonExistentField" not found')
  })
})