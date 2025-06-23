import { describe, test, expect, beforeEach } from 'vitest'
import { LinearObjaxParser } from '../linearParser'
import { ObjaxExecutor } from '../executor'

describe('Conditional Execution', () => {
  let parser: LinearObjaxParser
  let executor: ObjaxExecutor

  beforeEach(() => {
    parser = new LinearObjaxParser()
    executor = new ObjaxExecutor()
  })

  test('should execute conditional action when condition is true', () => {
    const code = `
password is a FieldMorph with value "Invalid"
alert is a FieldMorph with value ""
isInvalid is <password.value equal "Invalid">
isInvalid thenDo with action <alert.value becomes "不正です">
`
    const parseResult = parser.parse(code)
    expect(parseResult.errors).toHaveLength(0)

    const executionResult = executor.execute(parseResult)
    expect(executionResult.errors).toHaveLength(0)

    // Check that alert.value was updated to "不正です"
    const alertInstance = executionResult.instances.find(i => i.name === 'alert')
    expect(alertInstance?.properties.value).toBe('不正です')
  })

  test('should not execute conditional action when condition is false', () => {
    const code = `
password is a FieldMorph with value "Valid"
alert is a FieldMorph with value ""
isInvalid is <password.value equal "Invalid">
isInvalid thenDo with action <alert.value becomes "不正です">
`
    const parseResult = parser.parse(code)
    expect(parseResult.errors).toHaveLength(0)

    const executionResult = executor.execute(parseResult)
    expect(executionResult.errors).toHaveLength(0)

    // Check that alert.value remains empty because condition was false
    const alertInstance = executionResult.instances.find(i => i.name === 'alert')
    expect(alertInstance?.properties.value).toBe('')
  })

  test('should handle numeric comparisons correctly', () => {
    const code = `
age is a FieldMorph with value 25
result is a FieldMorph with value ""
isAdult is <age.value greater 18>
isAdult thenDo with action <result.value becomes "Adult">
`
    const parseResult = parser.parse(code)
    expect(parseResult.errors).toHaveLength(0)

    const executionResult = executor.execute(parseResult)
    expect(executionResult.errors).toHaveLength(0)

    // Check that result.value was updated because 25 > 18
    const resultInstance = executionResult.instances.find(i => i.name === 'result')
    expect(resultInstance?.properties.value).toBe('Adult')
  })

  test('should handle multiple conditional executions', () => {
    const code = `
score is a FieldMorph with value 85
grade is a FieldMorph with value ""
isA is <score.value greater 90>
isB is <score.value greater 80>
isA thenDo with action <grade.value becomes "A">
isB thenDo with action <grade.value becomes "B">
`
    const parseResult = parser.parse(code)
    expect(parseResult.errors).toHaveLength(0)

    const executionResult = executor.execute(parseResult)
    expect(executionResult.errors).toHaveLength(0)

    // Check that only the B condition was executed (85 > 80 but not > 90)
    const gradeInstance = executionResult.instances.find(i => i.name === 'grade')
    expect(gradeInstance?.properties.value).toBe('B')
  })

  test('should handle string equality comparison', () => {
    const code = `
status is a FieldMorph with value "error"
message is a FieldMorph with value ""
isError is <status.value equal "error">
isError thenDo with action <message.value becomes "An error occurred">
`
    const parseResult = parser.parse(code)
    expect(parseResult.errors).toHaveLength(0)

    const executionResult = executor.execute(parseResult)
    expect(executionResult.errors).toHaveLength(0)

    // Check that message was updated
    const messageInstance = executionResult.instances.find(i => i.name === 'message')
    expect(messageInstance?.properties.value).toBe('An error occurred')
  })

  test('should handle direct conditional execution with "thenDo with action" syntax', () => {
    const code = `
input is a FieldMorph with value "valid"
alert is a FieldMorph with value ""
"input.value equal 'valid'" thenDo with action "alert.value becomes 'OK!'"
`
    const parseResult = parser.parse(code)
    expect(parseResult.errors).toHaveLength(0)

    const executionResult = executor.execute(parseResult)
    expect(executionResult.errors).toHaveLength(0)

    // Check that alert.value was updated to "OK!"
    const alertInstance = executionResult.instances.find(i => i.name === 'alert')
    expect(alertInstance?.properties.value).toBe('OK!')
  })

  test('should not execute conditional action when direct condition is false', () => {
    const code = `
input is a FieldMorph with value "invalid"
alert is a FieldMorph with value ""
"input.value equal 'valid'" thenDo with action "alert.value becomes 'OK!'"
`
    const parseResult = parser.parse(code)
    expect(parseResult.errors).toHaveLength(0)

    const executionResult = executor.execute(parseResult)
    expect(executionResult.errors).toHaveLength(0)

    // Check that alert.value remains empty because condition was false
    const alertInstance = executionResult.instances.find(i => i.name === 'alert')
    expect(alertInstance?.properties.value).toBe('')
  })
})