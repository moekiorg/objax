import { describe, it, expect } from 'vitest'
import { LinearObjaxParser } from '../linearParser'

describe('Judgement and If Statement Classes', () => {
  describe('Judgement class creation', () => {
    it('should parse judgement creation with boolean condition', () => {
      const parser = new LinearObjaxParser()
      const code = 'isDone is a Judgement with boolean "task.state equal \'done\'"'
      
      const result = parser.parse(code)
      
      expect(result.instances).toHaveLength(1)
      expect(result.instances[0].name).toBe('isDone')
      expect(result.instances[0].className).toBe('Judgement') 
      expect(result.instances[0].properties.boolean).toBe("task.state equal 'done'")
    })
  })

  describe('thenDo and otherwiseDo syntax', () => {
    it('should parse thenDo with action parameter', () => {
      const parser = new LinearObjaxParser()
      const code = `isDone is a Judgement with boolean "task.state equal 'done'"
delete is a Action with do "task delete"
isDone thenDo with action delete`
      
      const result = parser.parse(code)
      
      expect(result.instances).toHaveLength(2)
      expect(result.methodCalls).toHaveLength(1)
      expect(result.methodCalls[0].instanceName).toBe('isDone')
      expect(result.methodCalls[0].methodName).toBe('thenDo')
      expect(result.methodCalls[0].keywordParameters?.action).toBe('delete')
    })

    it('should parse otherwiseDo with action parameter', () => {
      const parser = new LinearObjaxParser()
      const code = `isDone is a Judgement with boolean "task.state equal 'done'"
show is a Action with do "task show"
isDone otherwiseDo with action show`
      
      const result = parser.parse(code)
      
      expect(result.instances).toHaveLength(2)
      expect(result.methodCalls).toHaveLength(1)
      expect(result.methodCalls[0].instanceName).toBe('isDone')
      expect(result.methodCalls[0].methodName).toBe('otherwiseDo')
      expect(result.methodCalls[0].keywordParameters?.action).toBe('show')
    })
  })
})