import { describe, it, expect, beforeEach } from 'vitest'
import { LinearObjaxParser } from '../linearParser'
import { ObjaxExecutor } from '../executor'
import { ObjaxProject } from '../../types/objax'

describe('Judgement Execution', () => {
  let project: ObjaxProject
  let parser: LinearObjaxParser
  let executor: ObjaxExecutor

  beforeEach(() => {
    project = {
      pages: [{ name: 'TestPage' }],
      states: [],
      instances: [],
      classes: [],
      currentPage: 'TestPage',
      showPlayground: false
    }
    parser = new LinearObjaxParser()
    executor = new ObjaxExecutor()
  })

  it('should execute thenDo when judgement condition is true', () => {
    const code = `Task is a Class
Task has field "state" has default "todo"
task is a new Task
task.state becomes "done"
isDone is a Judgement with boolean "task.state equal 'done'"
delete is a Action with do "task.state becomes 'deleted'"
isDone thenDo with action delete`

    const parseResult = parser.parse(code)
    const result = executor.execute(parseResult, project.classes)

    console.log('Final result errors:', result.errors)
    console.log('Final task instance:', result.instances.find(i => i.name === 'task'))

    // task.state should be set to "deleted" because condition was true
    const taskInstance = result.instances.find(i => i.name === 'task')
    expect(taskInstance).toBeDefined()
    expect(taskInstance?.properties.state).toBe('deleted')
  })

  it('should execute otherwiseDo when judgement condition is false', () => {
    const code = `Task is a Class
Task has field "state" has default "todo"
task is a new Task
isDone is a Judgement with boolean "task.state equal 'done'"
show is a Action with do "task.state becomes 'visible'"
isDone otherwiseDo with action show`

    const parseResult = parser.parse(code)
    const result = executor.execute(parseResult, project.classes)

    // task.state should be set to "visible" because condition was false
    const taskInstance = result.instances.find(i => i.name === 'task')
    expect(taskInstance).toBeDefined()
    expect(taskInstance?.properties.state).toBe('visible')
  })
})