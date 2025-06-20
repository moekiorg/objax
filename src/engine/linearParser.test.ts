import { describe, expect, it } from 'vitest'
import { LinearObjaxParser } from './linearParser'

describe('LinearObjaxParser', () => {
  it('should create a simple class definition', () => {
    const parser = new LinearObjaxParser()
    const code = 'define Task\nTask has field "title"'
    
    const result = parser.parse(code)
    expect(result.errors).toHaveLength(0)
    expect(result.classes).toHaveLength(1)
    expect(result.classes[0].name).toBe('Task')
    expect(result.classes[0].fields).toHaveLength(1)
    expect(result.classes[0].fields[0].name).toBe('title')
  })

  it('should create a field with default value', () => {
    const parser = new LinearObjaxParser()
    const code = 'define Task\nTask has field "done" has default false'
    
    const result = parser.parse(code)
    expect(result.errors).toHaveLength(0)
    expect(result.classes).toHaveLength(1)
    expect(result.classes[0].fields).toHaveLength(1)
    expect(result.classes[0].fields[0].name).toBe('done')
    expect(result.classes[0].fields[0].defaultValue).toBe(false)
  })

  it('should create a method definition', () => {
    const parser = new LinearObjaxParser()
    const code = 'define Task\nTask has method "complete" do set field "done" of myself to true'
    
    const result = parser.parse(code)
    expect(result.errors).toHaveLength(0)
    expect(result.classes).toHaveLength(1)
    expect(result.classes[0].methods).toHaveLength(1)
    expect(result.classes[0].methods[0].name).toBe('complete')
    expect(result.classes[0].methods[0].body).toBe('set field "done" of myself to true')
  })

  it('should create a new instance', () => {
    const parser = new LinearObjaxParser()
    const code = 'myTask is a new Task'
    
    const result = parser.parse(code)
    expect(result.errors).toHaveLength(0)
    expect(result.instances).toHaveLength(1)
    expect(result.instances[0].name).toBe('myTask')
    expect(result.instances[0].className).toBe('Task')
  })

  it('should handle complex class with fields, methods and instances', () => {
    const parser = new LinearObjaxParser()
    const code = `define Task
Task has field "title"
Task has field "done" has default false
Task has method "complete" do set field "done" of myself to true
myTask is a new Task`

    const result = parser.parse(code)
    expect(result.errors).toHaveLength(0)
    expect(result.classes).toHaveLength(1)
    expect(result.classes[0].name).toBe('Task')
    expect(result.classes[0].fields).toHaveLength(2)
    expect(result.classes[0].methods).toHaveLength(1)
    expect(result.instances).toHaveLength(1)
    expect(result.instances[0].name).toBe('myTask')
    expect(result.instances[0].className).toBe('Task')
  })

  it('should handle multiple classes and instances', () => {
    const parser = new LinearObjaxParser()
    const code = `define Task
Task has field "title"
define User  
User has field "name"
myTask is a new Task
myUser is a new User`

    const result = parser.parse(code)
    expect(result.errors).toHaveLength(0)
    expect(result.classes).toHaveLength(2)
    expect(result.instances).toHaveLength(2)
    expect(result.classes.map(c => c.name)).toEqual(['Task', 'User'])
    expect(result.instances.map(i => i.name)).toEqual(['myTask', 'myUser'])
  })

  it('should parse method call statements', () => {
    const parser = new LinearObjaxParser()
    const code = `define Task
Task has method "complete" do set field "done" of myself to true
myTask is a new Task
myTask complete`

    const result = parser.parse(code)
    expect(result.errors).toHaveLength(0)
    expect(result.classes).toHaveLength(1)
    expect(result.instances).toHaveLength(1)
    expect(result.methodCalls).toHaveLength(1)

    const methodCall = result.methodCalls[0]
    expect(methodCall.methodName).toBe('complete')
    expect(methodCall.instanceName).toBe('myTask')
  })


  it('should parse messaging syntax with parameters', () => {
    const parser = new LinearObjaxParser()
    const code = `define Task
Task has method "setTitle" with "title" do set field "title" of myself to "title"
myTask is a new Task
myTask setTitle "New Title"`

    const result = parser.parse(code)
    expect(result.errors).toHaveLength(0)
    expect(result.methodCalls).toHaveLength(1)

    const methodCall = result.methodCalls[0]
    expect(methodCall.methodName).toBe('setTitle')
    expect(methodCall.instanceName).toBe('myTask')
    expect(methodCall.parameters).toEqual(['New Title'])
  })

  it('should parse state operations', () => {
    const parser = new LinearObjaxParser()
    const code = `set state "score" to 100`

    const result = parser.parse(code)
    expect(result.errors).toHaveLength(0)
    expect(result.stateOperations).toHaveLength(1)

    const stateOp = result.stateOperations[0]
    expect(stateOp.stateName).toBe('score')
    expect(stateOp.value).toBe(100)
  })

  it('should parse page navigation', () => {
    const parser = new LinearObjaxParser()
    const code = `go to page "HomePage"`

    const result = parser.parse(code)
    expect(result.errors).toHaveLength(0)
    expect(result.pageNavigations).toHaveLength(1)

    const pageNav = result.pageNavigations[0]
    expect(pageNav.pageName).toBe('HomePage')
  })

  it('should parse method with parameters', () => {
    const parser = new LinearObjaxParser()
    const code = 'define TaskList\nTaskList has method "add" with "title" do set field "count" of myself to 1'
    
    const result = parser.parse(code)
    expect(result.errors).toHaveLength(0)
    expect(result.classes).toHaveLength(1)
    expect(result.classes[0].methods).toHaveLength(1)
    
    const method = result.classes[0].methods[0]
    expect(method.name).toBe('add')
    expect(method.parameters).toEqual(['title'])
    expect(method.body).toBe('set field "count" of myself to 1')
  })

  it('should parse instance creation with keyword arguments', () => {
    const parser = new LinearObjaxParser()
    const code = 'newTask is a new Task with title "My Title" and done false'
    
    const result = parser.parse(code)
    expect(result.errors).toHaveLength(0)
    expect(result.instances).toHaveLength(1)
    
    const instance = result.instances[0]
    expect(instance.name).toBe('newTask')
    expect(instance.className).toBe('Task')
    expect(instance.properties.title).toBe('My Title')
    expect(instance.properties.done).toBe(false)
  })

  it('should parse list operations', () => {
    const parser = new LinearObjaxParser()
    const code = 'add "My Task" to "items" of myself'
    
    const result = parser.parse(code)
    expect(result.errors).toHaveLength(0)
    expect(result.listOperations).toHaveLength(1)
    
    const listOp = result.listOperations[0]
    expect(listOp.operation).toBe('add')
    expect(listOp.item).toBe('My Task')
    expect(listOp.listField).toBe('items')
    expect(listOp.targetInstance).toBe('myself')
  })

  it('should parse variable assignments', () => {
    const parser = new LinearObjaxParser()
    const code = 'currentTitle is "Hello World"'
    
    const result = parser.parse(code)
    expect(result.errors).toHaveLength(0)
    expect(result.variableAssignments).toHaveLength(1)
    
    const assignment = result.variableAssignments[0]
    expect(assignment.variableName).toBe('currentTitle')
    expect(assignment.value).toBe('"Hello World"')
    expect(assignment.type).toBe('primitive')
  })

  it('should parse connection statements', () => {
    const parser = new LinearObjaxParser()
    const code = `myTasks is a new TaskList
myTaskListView is a new DatabaseMorph
connect myTasks to myTaskListView`

    const result = parser.parse(code)
    expect(result.errors).toHaveLength(0)
    expect(result.instances).toHaveLength(2)
    expect(result.connections).toHaveLength(1)

    const connection = result.connections[0]
    expect(connection.sourceInstance).toBe('myTasks')
    expect(connection.targetInstance).toBe('myTaskListView')
  })

  it('should parse print statements', () => {
    const parser = new LinearObjaxParser()
    const code = `print "Hello World"
print Debug message
print "Another string"`

    const result = parser.parse(code)
    expect(result.errors).toHaveLength(0)
    expect(result.printStatements).toHaveLength(3)

    const prints = result.printStatements
    expect(prints[0].message).toBe('Hello World')
    expect(prints[1].message).toBe('Debug message')
    expect(prints[2].message).toBe('Another string')
    
    // Check timestamps are set
    expect(prints[0].timestamp).toBeDefined()
    expect(prints[1].timestamp).toBeDefined()
    expect(prints[2].timestamp).toBeDefined()
  })

  it('should parse method calls with parameters', () => {
    const parser = new LinearObjaxParser()
    const code = `myTasks add "タスク"
myObject update "param1" 42`

    const result = parser.parse(code)
    expect(result.errors).toHaveLength(0)
    expect(result.methodCalls).toHaveLength(2)

    const call1 = result.methodCalls[0]
    expect(call1.methodName).toBe('add')
    expect(call1.instanceName).toBe('myTasks')
    expect(call1.parameters).toEqual(['タスク'])

    const call2 = result.methodCalls[1]
    expect(call2.methodName).toBe('update')
    expect(call2.instanceName).toBe('myObject')
    expect(call2.parameters).toEqual(['param1', 42])
  })

  it('should parse the complex TaskList example', () => {
    const parser = new LinearObjaxParser()
    const code = `define TaskList
TaskList has field "items" has default []
TaskList has method "add" with "title" do newTask is a new Task with title and add newTask to "items" of myself

define Task
Task has field "title"

myTaskList is a new TaskList`
    
    const result = parser.parse(code)
    expect(result.errors).toHaveLength(0)
    
    // Check classes
    expect(result.classes).toHaveLength(2)
    const taskListClass = result.classes.find(c => c.name === 'TaskList')
    const taskClass = result.classes.find(c => c.name === 'Task')
    
    expect(taskListClass).toBeDefined()
    expect(taskClass).toBeDefined()
    
    // Check TaskList method with parameter
    expect(taskListClass.methods).toHaveLength(1)
    expect(taskListClass.methods[0].name).toBe('add')
    expect(taskListClass.methods[0].parameters).toEqual(['title'])
    
    // Check instances
    expect(result.instances).toHaveLength(1)
    expect(result.instances[0].name).toBe('myTaskList')
    expect(result.instances[0].className).toBe('TaskList')
  })

  it('should parse State class creation with keyword arguments', () => {
    const parser = new LinearObjaxParser()
    const code = 'score is a new State with name "score" and value 0'
    
    const result = parser.parse(code)
    expect(result.errors).toHaveLength(0)
    expect(result.instances).toHaveLength(1)
    
    const instance = result.instances[0]
    expect(instance.name).toBe('score')
    expect(instance.className).toBe('State')
    expect(instance.properties.name).toBe('score')
    expect(instance.properties.value).toBe(0)
  })

  it('should parse State method calls for set and get', () => {
    const parser = new LinearObjaxParser()
    const code = `score is a new State with name "score"
score set 100
score get`
    
    const result = parser.parse(code)
    expect(result.errors).toHaveLength(0)
    expect(result.instances).toHaveLength(1)
    expect(result.methodCalls).toHaveLength(2)
    
    const setCal = result.methodCalls[0]
    expect(setCal.methodName).toBe('set')
    expect(setCal.instanceName).toBe('score')
    expect(setCal.parameters).toEqual([100])
    
    const getCall = result.methodCalls[1]
    expect(getCall.methodName).toBe('get')
    expect(getCall.instanceName).toBe('score')
    expect(getCall.parameters).toBeUndefined()
  })

  it('should parse instance creation with multiple keyword arguments', () => {
    const parser = new LinearObjaxParser()
    const code = 'person is a new Person with name "John" and age 30 and active true'
    
    const result = parser.parse(code)
    expect(result.errors).toHaveLength(0)
    expect(result.instances).toHaveLength(1)
    
    const instance = result.instances[0]
    expect(instance.name).toBe('person')
    expect(instance.className).toBe('Person')
    expect(instance.properties.name).toBe('John')
    expect(instance.properties.age).toBe(30)
    expect(instance.properties.active).toBe(true)
  })

  it('should parse instance creation with single keyword argument', () => {
    const parser = new LinearObjaxParser()
    const code = 'counter is a new Counter with value 5'
    
    const result = parser.parse(code)
    expect(result.errors).toHaveLength(0)
    expect(result.instances).toHaveLength(1)
    
    const instance = result.instances[0]
    expect(instance.name).toBe('counter')
    expect(instance.className).toBe('Counter')
    expect(instance.properties.value).toBe(5)
  })
})