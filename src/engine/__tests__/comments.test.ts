import { describe, it, expect, beforeEach } from 'vitest'
import { LinearObjaxParser } from '../linearParser'

describe('Comments', () => {
  let parser: LinearObjaxParser

  beforeEach(() => {
    parser = new LinearObjaxParser()
  })

  it('should ignore full-line comments', () => {
    const code = `
// This is a comment
Task is a Class
// Another comment
Task has field "title"
`
    const result = parser.parse(code)
    
    expect(result.errors).toHaveLength(0)
    expect(result.classes).toHaveLength(1)
    expect(result.classes[0].name).toBe('Task')
    expect(result.classes[0].fields).toHaveLength(1)
  })

  it('should ignore inline comments', () => {
    const code = `
Task is a Class // This defines a Task class
Task has field "title" // This adds a title field
myTask is a Task // This creates an instance
`
    const result = parser.parse(code)
    
    expect(result.errors).toHaveLength(0)
    expect(result.classes).toHaveLength(1)
    expect(result.instances).toHaveLength(1)
    expect(result.classes[0].name).toBe('Task')
    expect(result.instances[0].name).toBe('myTask')
  })

  it('should handle comments with special characters', () => {
    const code = `
Task is a Class // Comment with symbols: @#$%^&*()
Task has field "done" has default false // Boolean default value
`
    const result = parser.parse(code)
    
    expect(result.errors).toHaveLength(0)
    expect(result.classes).toHaveLength(1)
    expect(result.classes[0].fields).toHaveLength(1)
    expect(result.classes[0].fields[0].defaultValue).toBe(false)
  })

  it('should handle empty lines with comments', () => {
    const code = `
Task is a Class

// Empty line above
Task has field "title"

// Empty line above and below

myTask is a Task
`
    const result = parser.parse(code)
    
    expect(result.errors).toHaveLength(0)
    expect(result.classes).toHaveLength(1)
    expect(result.instances).toHaveLength(1)
  })

  it('should not break on double slashes in string literals', () => {
    const code = `
Task is a Class
Task has field "url" has default "https://example.com"
myTask is a Task
myTask.url is "https://api.example.com/tasks" // URL with protocol
`
    const result = parser.parse(code)
    
    expect(result.errors).toHaveLength(0)
    expect(result.classes).toHaveLength(1)
    expect(result.instances).toHaveLength(1)
    expect(result.fieldAssignments).toHaveLength(1)
    expect(result.fieldAssignments[0].values).toEqual(['https://api.example.com/tasks'])
  })
})