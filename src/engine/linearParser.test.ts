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
})