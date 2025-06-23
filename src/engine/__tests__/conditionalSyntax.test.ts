import { describe, test, expect, beforeEach } from 'vitest'
import { LinearObjaxParser } from '../linearParser'

describe('Conditional Syntax', () => {
  let parser: LinearObjaxParser

  beforeEach(() => {
    parser = new LinearObjaxParser()
  })

  test('should parse conditional block syntax', () => {
    const code = `isInvalid is <password.value equal "Invalid">`
    const result = parser.parse(code)

    expect(result.errors).toHaveLength(0)
    expect(result.conditionalBlocks).toHaveLength(1)

    const conditionalBlock = result.conditionalBlocks[0]
    expect(conditionalBlock.blockName).toBe('isInvalid')
    expect(conditionalBlock.condition.type).toBe('comparison')
    expect(conditionalBlock.condition.operator).toBe('equal')
    expect(conditionalBlock.condition.left.type).toBe('field')
    expect(conditionalBlock.condition.left.instanceName).toBe('password')
    expect(conditionalBlock.condition.left.fieldName).toBe('value')
    expect(conditionalBlock.condition.right.type).toBe('literal')
    expect(conditionalBlock.condition.right.value).toBe('Invalid')
  })

  test('should parse conditional execution syntax', () => {
    const code = `isInvalid thenDo with action <alert.value becomes "不正です">`
    const result = parser.parse(code)

    expect(result.errors).toHaveLength(0)
    expect(result.conditionalExecutions).toHaveLength(1)

    const conditionalExecution = result.conditionalExecutions[0]
    expect(conditionalExecution.blockName).toBe('isInvalid')
    expect(conditionalExecution.action).toBe('alert.value becomes "不正です"')
  })

  test('should parse complete conditional workflow', () => {
    const code = `
password is a FieldMorph with value "Invalid"
alert is a FieldMorph with value ""
isInvalid is <password.value equal "Invalid">
isInvalid thenDo with action <alert.value becomes "不正です">
`
    const result = parser.parse(code)

    expect(result.errors).toHaveLength(0)
    expect(result.instances).toHaveLength(2)
    expect(result.conditionalBlocks).toHaveLength(1)
    expect(result.conditionalExecutions).toHaveLength(1)

    // Verify instances
    const passwordInstance = result.instances.find(i => i.name === 'password')
    const alertInstance = result.instances.find(i => i.name === 'alert')
    expect(passwordInstance?.properties.value).toBe('Invalid')
    expect(alertInstance?.properties.value).toBe('')

    // Verify conditional block
    const conditionalBlock = result.conditionalBlocks[0]
    expect(conditionalBlock.blockName).toBe('isInvalid')

    // Verify conditional execution
    const conditionalExecution = result.conditionalExecutions[0]
    expect(conditionalExecution.blockName).toBe('isInvalid')
    expect(conditionalExecution.action).toBe('alert.value becomes "不正です"')
  })

  test('should handle different comparison operators', () => {
    const testCases = [
      { operator: 'equal', expected: 'equal' },
      { operator: 'not_equal', expected: 'not_equal' },
      { operator: 'greater', expected: 'greater' },
      { operator: 'less', expected: 'less' },
    ]

    testCases.forEach(({ operator, expected }) => {
      const code = `myCondition is <value ${operator} 10>`
      const result = parser.parse(code)

      expect(result.errors).toHaveLength(0)
      expect(result.conditionalBlocks).toHaveLength(1)
      expect(result.conditionalBlocks[0].condition.operator).toBe(expected)
    })
  })

  test('should handle numeric comparisons', () => {
    const code = `ageCheck is <age greater 18>`
    const result = parser.parse(code)

    expect(result.errors).toHaveLength(0)
    expect(result.conditionalBlocks).toHaveLength(1)

    const condition = result.conditionalBlocks[0].condition
    expect(condition.left.type).toBe('literal')
    expect(condition.left.value).toBe('age')
    expect(condition.operator).toBe('greater')
    expect(condition.right.type).toBe('literal')
    expect(condition.right.value).toBe(18)
  })
})