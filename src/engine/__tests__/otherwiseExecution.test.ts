import { describe, test, expect, beforeEach } from 'vitest'
import { LinearObjaxParser } from '../linearParser'
import { ObjaxExecutor } from '../executor'

describe('Otherwise Execution', () => {
  let parser: LinearObjaxParser
  let executor: ObjaxExecutor

  beforeEach(() => {
    parser = new LinearObjaxParser()
    executor = new ObjaxExecutor()
  })

  test('should parse otherwise execution syntax', () => {
    const code = `isInvalid otherwiseDo with action <alert.value becomes "有効です">`
    const result = parser.parse(code)

    expect(result.errors).toHaveLength(0)
    expect(result.conditionalOtherwiseExecutions).toHaveLength(1)

    const conditionalOtherwiseExecution = result.conditionalOtherwiseExecutions[0]
    expect(conditionalOtherwiseExecution.blockName).toBe('isInvalid')
    expect(conditionalOtherwiseExecution.otherwiseAction).toBe('alert.value becomes "有効です"')
  })

  test('should execute otherwise action when condition is false', () => {
    const code = `
password is a FieldMorph with value "Valid"
alert is a FieldMorph with value ""
isInvalid is <password.value equal "Invalid">
isInvalid thenDo with action <alert.value becomes "不正です">
isInvalid otherwiseDo with action <alert.value becomes "有効です">
`
    const parseResult = parser.parse(code)
    expect(parseResult.errors).toHaveLength(0)

    const executionResult = executor.execute(parseResult)
    expect(executionResult.errors).toHaveLength(0)

    // Check that alert.value was updated to "有効です" because condition was false
    const alertInstance = executionResult.instances.find(i => i.name === 'alert')
    expect(alertInstance?.properties.value).toBe('有効です')
  })

  test('should not execute otherwise action when condition is true', () => {
    const code = `
password is a FieldMorph with value "Invalid"
alert is a FieldMorph with value ""
isInvalid is <password.value equal "Invalid">
isInvalid thenDo with action <alert.value becomes "不正です">
isInvalid otherwiseDo with action <alert.value becomes "有効です">
`
    const parseResult = parser.parse(code)
    expect(parseResult.errors).toHaveLength(0)

    const executionResult = executor.execute(parseResult)
    expect(executionResult.errors).toHaveLength(0)

    // Check that alert.value was updated to "不正です" (from thenDo), not "有効です" (from otherwiseDo)
    const alertInstance = executionResult.instances.find(i => i.name === 'alert')
    expect(alertInstance?.properties.value).toBe('不正です')
  })

  test('should handle both thenDo and otherwiseDo together', () => {
    const code = `
score is a FieldMorph with value 75
result is a FieldMorph with value ""
isPassing is <score.value greater 80>
isPassing thenDo with action <result.value becomes "合格">
isPassing otherwiseDo with action <result.value becomes "不合格">
`
    const parseResult = parser.parse(code)
    expect(parseResult.errors).toHaveLength(0)

    const executionResult = executor.execute(parseResult)
    expect(executionResult.errors).toHaveLength(0)

    // Check that result.value was updated to "不合格" because 75 is not greater than 80
    const resultInstance = executionResult.instances.find(i => i.name === 'result')
    expect(resultInstance?.properties.value).toBe('不合格')
  })

  test('should handle numeric comparison with otherwise', () => {
    const code = `
age is a FieldMorph with value 15
status is a FieldMorph with value ""
isAdult is <age.value greater 18>
isAdult thenDo with action <status.value becomes "成人">
isAdult otherwiseDo with action <status.value becomes "未成年">
`
    const parseResult = parser.parse(code)
    expect(parseResult.errors).toHaveLength(0)

    const executionResult = executor.execute(parseResult)
    expect(executionResult.errors).toHaveLength(0)

    // Check that status.value was updated to "未成年" because 15 is not greater than 18
    const statusInstance = executionResult.instances.find(i => i.name === 'status')
    expect(statusInstance?.properties.value).toBe('未成年')
  })

  test('should handle string comparison with otherwise', () => {
    const code = `
level is a FieldMorph with value "beginner"
message is a FieldMorph with value ""
isExpert is <level.value equal "expert">
isExpert thenDo with action <message.value becomes "上級者です">
isExpert otherwiseDo with action <message.value becomes "初心者または中級者です">
`
    const parseResult = parser.parse(code)
    expect(parseResult.errors).toHaveLength(0)

    const executionResult = executor.execute(parseResult)
    expect(executionResult.errors).toHaveLength(0)

    // Check that message.value was updated to the otherwise action because level is not "expert"
    const messageInstance = executionResult.instances.find(i => i.name === 'message')
    expect(messageInstance?.properties.value).toBe('初心者または中級者です')
  })
})