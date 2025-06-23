import { describe, test, expect } from 'vitest'
import { LinearObjaxParser } from '../linearParser'

describe('Conditional Debug', () => {
  test('should debug conditional block parsing', () => {
    const parser = new LinearObjaxParser()
    const code = `isInvalid is <password.value equal "Invalid">`
    
    console.log('Parsing code:', code)
    const result = parser.parse(code)
    
    console.log('Parse result:', {
      errors: result.errors,
      conditionalBlocks: result.conditionalBlocks,
      blockAssignments: result.blockAssignments,
      allKeys: Object.keys(result)
    })
    
    // Let's see what the parser thinks this is
    console.log('Full result:', JSON.stringify(result, null, 2))
  })

  test('should debug conditional execution parsing', () => {
    const parser = new LinearObjaxParser()
    const code = `isInvalid thenDo with action <alert.value becomes "不正です">`
    
    console.log('Parsing thenDo code:', code)
    
    // Let's check tokenization
    const tokens = (parser as any).tokenize(code)
    console.log('Tokens:', tokens)
    
    const result = parser.parse(code)
    
    console.log('ThenDo parse result:', {
      errors: result.errors,
      conditionalExecutions: result.conditionalExecutions,
      allKeys: Object.keys(result)
    })
  })
})