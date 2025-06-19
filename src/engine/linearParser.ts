import type { 
  ObjaxExecutionResult, 
  ObjaxClassDefinition, 
  ObjaxFieldDefinition,
  ObjaxMethodDefinition,
  ObjaxInstanceDefinition 
} from './types'

interface Token {
  type: string
  value: string
}

export class LinearObjaxParser {
  private currentClass: ObjaxClassDefinition | null = null
  private classes: ObjaxClassDefinition[] = []
  private instances: ObjaxInstanceDefinition[] = []
  private errors: string[] = []

  parse(code: string): ObjaxExecutionResult {
    this.reset()
    
    const lines = code.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)

    for (const line of lines) {
      try {
        this.parseLine(line)
      } catch (error) {
        this.errors.push(`Error parsing "${line}": ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Close any open class definition
    if (this.currentClass) {
      this.classes.push(this.currentClass)
      this.currentClass = null
    }

    return {
      classes: this.classes,
      instances: this.instances,
      errors: this.errors
    }
  }

  private reset() {
    this.currentClass = null
    this.classes = []
    this.instances = []
    this.errors = []
  }

  private parseLine(line: string) {
    const tokens = this.tokenize(line)
    
    if (tokens.length === 0) return

    // Class definition: "define ClassName"
    if (tokens[0].value === 'define') {
      this.handleClassDefinition(tokens)
    }
    // Class member: "ClassName has field/method ..."
    else if (this.currentClass && tokens.length > 2 && tokens[1].value === 'has') {
      this.handleClassMember(tokens)
    }
    // Instance creation: "instanceName is a new ClassName"
    else if (this.isInstanceCreation(tokens)) {
      this.handleInstanceCreation(tokens)
    }
    // Unknown pattern - might be next statement, close current class
    else if (this.currentClass) {
      this.classes.push(this.currentClass)
      this.currentClass = null
      // Try parsing again as top-level statement
      this.parseLine(line)
    }
    else {
      throw new Error(`Unknown statement pattern: ${line}`)
    }
  }

  private tokenize(line: string): Token[] {
    const tokens: Token[] = []
    const regex = /"[^"]*"|[^\s]+/g
    let match

    while ((match = regex.exec(line)) !== null) {
      const value = match[0]
      tokens.push({
        type: this.getTokenType(value),
        value: value
      })
    }

    return tokens
  }

  private getTokenType(value: string): string {
    if (value === 'define') return 'DEFINE'
    if (value === 'has') return 'HAS'
    if (value === 'field') return 'FIELD'
    if (value === 'method') return 'METHOD'
    if (value === 'default') return 'DEFAULT'
    if (value === 'do') return 'DO'
    if (value === 'is') return 'IS'
    if (value === 'a') return 'A'
    if (value === 'new') return 'NEW'
    if (value === 'set') return 'SET'
    if (value === 'of') return 'OF'
    if (value === 'myself') return 'MYSELF'
    if (value === 'to') return 'TO'
    if (value === 'true') return 'TRUE'
    if (value === 'false') return 'FALSE'
    if (value.startsWith('"') && value.endsWith('"')) return 'STRING'
    if (/^\d+(\.\d+)?$/.test(value)) return 'NUMBER'
    return 'IDENTIFIER'
  }

  private handleClassDefinition(tokens: Token[]) {
    if (tokens.length < 2) {
      throw new Error('Class definition requires class name')
    }

    // Close previous class if exists
    if (this.currentClass) {
      this.classes.push(this.currentClass)
    }

    this.currentClass = {
      name: tokens[1].value,
      fields: [],
      methods: []
    }
  }

  private handleClassMember(tokens: Token[]) {
    if (!this.currentClass) {
      throw new Error('Class member definition outside class')
    }

    const className = tokens[0].value
    if (className !== this.currentClass.name) {
      throw new Error(`Expected class name "${this.currentClass.name}", got "${className}"`)
    }

    if (tokens[2]?.value === 'field') {
      this.handleFieldDefinition(tokens)
    } else if (tokens[2]?.value === 'method') {
      this.handleMethodDefinition(tokens)
    } else {
      throw new Error(`Unknown class member type: ${tokens[2]?.value}`)
    }
  }

  private handleFieldDefinition(tokens: Token[]) {
    if (!this.currentClass) return

    // "ClassName has field "fieldName" [has default value]"
    const fieldName = this.extractStringValue(tokens[3])
    let defaultValue: any = undefined

    // Check for default value
    const hasIndex = tokens.findIndex((t, i) => i > 3 && t.value === 'has')
    if (hasIndex !== -1 && tokens[hasIndex + 1]?.value === 'default') {
      const defaultToken = tokens[hasIndex + 2]
      if (defaultToken) {
        defaultValue = this.parseValue(defaultToken)
      }
    }

    const field: ObjaxFieldDefinition = {
      name: fieldName,
      defaultValue
    }

    this.currentClass.fields.push(field)
  }

  private handleMethodDefinition(tokens: Token[]) {
    if (!this.currentClass) return

    // "ClassName has method "methodName" do ..."
    const methodName = this.extractStringValue(tokens[3])
    
    const doIndex = tokens.findIndex(t => t.value === 'do')
    if (doIndex === -1) {
      throw new Error('Method definition missing "do" keyword')
    }

    const bodyTokens = tokens.slice(doIndex + 1)
    const body = bodyTokens.map(t => t.value).join(' ')

    const method: ObjaxMethodDefinition = {
      name: methodName,
      parameters: [],
      body
    }

    this.currentClass.methods.push(method)
  }

  private isInstanceCreation(tokens: Token[]): boolean {
    return tokens.some(t => t.value === 'is') && 
           tokens.some(t => t.value === 'a') && 
           tokens.some(t => t.value === 'new')
  }

  private handleInstanceCreation(tokens: Token[]) {
    // "instanceName is a new ClassName"
    const isIndex = tokens.findIndex(t => t.value === 'is')
    const newIndex = tokens.findIndex(t => t.value === 'new')

    if (isIndex === -1 || newIndex === -1 || isIndex === 0 || newIndex >= tokens.length - 1) {
      throw new Error('Invalid instance creation syntax')
    }

    const instanceName = tokens[0].value
    const className = tokens[newIndex + 1].value

    const instance: ObjaxInstanceDefinition = {
      name: instanceName,
      className,
      properties: {}
    }

    this.instances.push(instance)
  }

  private extractStringValue(token: Token): string {
    if (token.type !== 'STRING') {
      throw new Error(`Expected string, got ${token.value}`)
    }
    return token.value.slice(1, -1) // Remove quotes
  }

  private parseValue(token: Token): any {
    switch (token.type) {
      case 'STRING':
        return token.value.slice(1, -1)
      case 'TRUE':
        return true
      case 'FALSE':
        return false
      case 'NUMBER':
        return parseFloat(token.value)
      default:
        return token.value
    }
  }
}