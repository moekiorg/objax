import { describe, test, expect, beforeEach } from 'vitest'
import { LinearObjaxParser } from '../linearParser'
import { ObjaxExecutor } from '../executor'

describe('Task Generation Debug', () => {
  let parser: LinearObjaxParser
  let executor: ObjaxExecutor

  beforeEach(() => {
    parser = new LinearObjaxParser()
    executor = new ObjaxExecutor()
  })

  test('should debug task generation issue', () => {
    const code = `
Task is a Class
Task defineField with name 'title' and default ''

TaskList is a Class
itemList is a List
TaskList defineField with name 'items' and default itemList
TaskList defineMethod with name 'add' and do "newTask is a Task with title {title}. {self}.items push newTask"

myList is a new TaskList
myList add with title 'タスク1'
myList add with title 'タスク2'
myList add with title 'タスク3'
`

    console.log('=== Parsing ===')
    const parseResult = parser.parse(code)
    console.log('Parse errors:', parseResult.errors)
    console.log('Classes:', parseResult.classes)
    console.log('Instances:', parseResult.instances)
    console.log('Method calls:', parseResult.methodCalls)

    console.log('=== Execution ===')
    const executionResult = executor.execute(parseResult)
    console.log('Execution errors:', executionResult.errors)
    console.log('Final instances:', executionResult.instances)

    // Check myList items specifically
    const myList = executionResult.instances.find(i => i.name === 'myList')
    console.log('myList instance:', myList)
    console.log('myList items:', myList?.properties?.items)

    expect(parseResult.errors).toHaveLength(0)
    expect(executionResult.errors).toHaveLength(0)
  })
})