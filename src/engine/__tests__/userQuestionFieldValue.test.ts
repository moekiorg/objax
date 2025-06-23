import { describe, it, expect } from 'vitest'
import { ObjaxEngine } from '../objaxEngine'

describe('User Question: field.value syntax', () => {
  it('should support myList add with title field.value syntax', () => {
    const engine = new ObjaxEngine()
    const code = `Task is a Class
Task defineField with name 'title' and default ''
itemsList is a List
TaskList is a Class
TaskList defineField with name 'items' and default itemsList
TaskList defineMethod with name 'add' and do "newTask is a Task with title {title}. {self}.items push newTask"

field is a new FieldMorph
field.value is 'Learn Objax'
myList is a new TaskList
myList add with title field.value`
    
    const result = engine.execute(code)
    
    // Should execute without errors
    expect(result.errors).toHaveLength(0)
    
    // Should create the task with the field value
    const newTask = result.instances.find(i => i.className === 'Task')
    expect(newTask).toBeDefined()
    expect(newTask?.properties.title).toBe('Learn Objax')
    
    // Should add the task to the list
    const myList = result.instances.find(i => i.name === 'myList')
    expect(myList).toBeDefined()
    expect(Array.isArray(myList?.properties.items)).toBe(true)
    expect(myList?.properties.items).toHaveLength(1)
  })
})