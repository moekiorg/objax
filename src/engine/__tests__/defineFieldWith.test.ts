import { describe, it, expect } from 'vitest'
import { LinearObjaxParser } from '../linearParser'

describe('DefineField with Name Syntax', () => {
  it('should parse defineField with name and default', () => {
    const parser = new LinearObjaxParser()
    const code = `Task is a Class
Task defineField with name "done" and default false`
    
    const result = parser.parse(code)
    
    expect(result.classes).toHaveLength(1)
    expect(result.classes[0].name).toBe('Task')
    expect(result.classes[0].fields).toHaveLength(1)
    expect(result.classes[0].fields[0].name).toBe('done')
    expect(result.classes[0].fields[0].defaultValue).toBe(false)
  })

  it('should parse defineField with name only (no default)', () => {
    const parser = new LinearObjaxParser()
    const code = `Task is a Class
Task defineField with name "title"`
    
    const result = parser.parse(code)
    
    expect(result.classes).toHaveLength(1)
    expect(result.classes[0].fields).toHaveLength(1)
    expect(result.classes[0].fields[0].name).toBe('title')
    expect(result.classes[0].fields[0].defaultValue).toBeUndefined()
  })

  it('should parse multiple defineField statements', () => {
    const parser = new LinearObjaxParser()
    const code = `Task is a Class
Task defineField with name "done" and default false
Task defineField with name "title" and default "New task"`
    
    const result = parser.parse(code)
    
    expect(result.classes).toHaveLength(1)
    expect(result.classes[0].fields).toHaveLength(2)
    
    expect(result.classes[0].fields[0].name).toBe('done')
    expect(result.classes[0].fields[0].defaultValue).toBe(false)
    
    expect(result.classes[0].fields[1].name).toBe('title')
    expect(result.classes[0].fields[1].defaultValue).toBe('New task')
  })
})