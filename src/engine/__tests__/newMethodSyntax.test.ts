import { describe, it, expect } from 'vitest'
import { ObjaxEngine } from '../objaxEngine'

describe('New Method Syntax', () => {
  it('should parse defineMethod with name and do syntax', () => {
    const engine = new ObjaxEngine()
    const code = `Task is a Class
Task defineField with name 'title' and default ''
itemsList is a List
TaskList is a Class
TaskList defineField with name 'items' and default itemsList
TaskList defineMethod with name 'add' and do "newTask is a Task with title {title}. {self}.items push newTask"`
    
    const result = engine.execute(code)
    
    expect(result.classes).toHaveLength(2) // Task + TaskList
    const taskListClass = result.classes.find(c => c.name === 'TaskList')
    expect(taskListClass).toBeDefined()
    expect(taskListClass?.methods).toHaveLength(1)
    expect(taskListClass?.methods[0].name).toBe('add')
    expect(taskListClass?.methods[0].body).toBe('newTask is a Task with title {title}. {self}.items push newTask')
  })

  it('should execute method with variable expansion and dot separation', () => {
    const engine = new ObjaxEngine()
    const code = `Task is a Class
Task defineField with name 'title' and default ''
itemsList is a List
TaskList is a Class
TaskList defineField with name 'items' and default itemsList
TaskList defineMethod with name 'add' and do "newTask is a Task with title {title}. {self}.items push newTask"

myList is a new TaskList
myList add with title 'Learn Objax'`
    
    const result = engine.execute(code)
    
    expect(result.instances).toHaveLength(3) // itemsList + myList + newTask
    const myList = result.instances.find(i => i.name === 'myList')
    expect(myList).toBeDefined()
    
    // Check that items array was auto-created and contains the task
    expect(myList?.properties.items).toBeDefined()
    expect(Array.isArray(myList?.properties.items)).toBe(true)
    expect(myList?.properties.items).toHaveLength(1)
    
    const newTask = result.instances.find(i => i.name === 'newTask')
    expect(newTask).toBeDefined()
    expect(newTask?.className).toBe('Task')
    expect(newTask?.properties.title).toBe('Learn Objax')
  })

  it('should handle multiple method calls', () => {
    const engine = new ObjaxEngine()
    const code = `Task is a Class
Task defineField with name 'title' and default ''
itemsList is a List
TaskList is a Class
TaskList defineField with name 'items' and default itemsList
TaskList defineMethod with name 'add' and do "newTask is a Task with title {title}. {self}.items push newTask"

myList is a new TaskList
myList add with title 'First Task'
myList add with title 'Second Task'`
    
    const result = engine.execute(code)
    
    const myList = result.instances.find(i => i.name === 'myList')
    expect(myList?.properties.items).toBeDefined()
    expect(Array.isArray(myList?.properties.items)).toBe(true)
    expect(myList?.properties.items).toHaveLength(2)
    
    const firstTask = result.instances.find(i => i.properties.title === 'First Task')
    const secondTask = result.instances.find(i => i.properties.title === 'Second Task')
    expect(firstTask).toBeDefined()
    expect(secondTask).toBeDefined()
  })
})