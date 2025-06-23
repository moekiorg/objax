import { describe, it, expect } from 'vitest'
import { LinearObjaxParser } from '../linearParser'

describe('Range and Action Classes', () => {
  describe('Range class creation', () => {
    it('should parse range creation with start and end', () => {
      const parser = new LinearObjaxParser()
      const code = 'sizes is a Range with start 1 and end 10'
      
      const result = parser.parse(code)
      
      expect(result.instances).toHaveLength(1)
      expect(result.instances[0].name).toBe('sizes')
      expect(result.instances[0].className).toBe('Range') 
      expect(result.instances[0].properties.start).toBe(1)
      expect(result.instances[0].properties.end).toBe(10)
    })
  })

  describe('Action block creation', () => {
    it('should parse action block with do statement', () => {
      const parser = new LinearObjaxParser()
      const code = 'grow is a Action with do "box.width becomes {size}"'
      
      const result = parser.parse(code)
      
      expect(result.instances).toHaveLength(1)
      expect(result.instances[0].name).toBe('grow')
      expect(result.instances[0].className).toBe('Action')
      // コードブロック処理を確認
      expect(result.instances[0].properties.do).toBeDefined()
    })
  })

  describe('Range run Action execution', () => {
    it('should parse range run action syntax', () => {
      const parser = new LinearObjaxParser()
      const code = `sizes is a Range with start 1 and end 10
grow is a Action with do "box.width becomes {size}"
sizes run grow`
      
      const result = parser.parse(code)
      
      // Should have instances for range and action
      expect(result.instances).toHaveLength(2)
      
      // Should have a range run operation
      expect(result.methodCalls).toHaveLength(1)
      expect(result.methodCalls[0].instanceName).toBe('sizes')
      expect(result.methodCalls[0].methodName).toBe('run')
    })
  })
})