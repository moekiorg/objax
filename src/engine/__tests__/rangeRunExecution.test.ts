import { describe, it, expect, beforeEach } from 'vitest'
import { LinearObjaxParser } from '../linearParser'
import { ObjaxExecutor } from '../executor'
import { ObjaxProject } from '../../types/objax'

describe('Range Run Execution', () => {
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

  it('should execute range run action with size parameter', () => {
    const code = `BoxMorph is a Class
BoxMorph has field "width" has default 50
box is a new BoxMorph
sizes is a Range with start 1 and end 3
grow is a Action with do "box.width becomes {size}"
sizes run grow`

    const parseResult = parser.parse(code)

    const result = executor.execute(parseResult, project.classes)

    // box.width should be set to the last value (3) after range execution
    const boxInstance = result.instances.find(i => i.name === 'box')
    expect(boxInstance).toBeDefined()
    expect(boxInstance?.properties.width).toBe(3)
  })
})