import type { 
  ObjaxExecutionResult, 
  ObjaxClassDefinition, 
  ObjaxFieldDefinition,
  ObjaxMethodDefinition,
  ObjaxInstanceDefinition,
  ObjaxMethodCall,
  ObjaxStateOperation,
  ObjaxStateRetrieval,
  ObjaxPageNavigation,
  ObjaxListOperation,
  ObjaxVariableAssignment,
  ObjaxConnection,
  ObjaxMorphOperation,
  ObjaxPrintStatement,
  ObjaxMessageExecution
} from './types'

interface Token {
  type: string
  value: string
}

export class LinearObjaxParser {
  private currentClass: ObjaxClassDefinition | null = null
  private classes: ObjaxClassDefinition[] = []
  private instances: ObjaxInstanceDefinition[] = []
  private methodCalls: ObjaxMethodCall[] = []
  private stateOperations: ObjaxStateOperation[] = []
  private stateRetrievals: ObjaxStateRetrieval[] = []
  private pageNavigations: ObjaxPageNavigation[] = []
  private listOperations: ObjaxListOperation[] = []
  private variableAssignments: ObjaxVariableAssignment[] = []
  private connections: ObjaxConnection[] = []
  private morphOperations: ObjaxMorphOperation[] = []
  private printStatements: ObjaxPrintStatement[] = []
  private messageExecutions: ObjaxMessageExecution[] = []
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
        this.errors.push(`"${line}" の解析エラー: ${error instanceof Error ? error.message : String(error)}`)
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
      methodCalls: this.methodCalls,
      stateOperations: this.stateOperations,
      stateRetrievals: this.stateRetrievals,
      pageNavigations: this.pageNavigations,
      listOperations: this.listOperations,
      variableAssignments: this.variableAssignments,
      connections: this.connections,
      morphOperations: this.morphOperations,
      printStatements: this.printStatements,
      messageExecutions: this.messageExecutions,
      errors: this.errors
    }
  }

  private reset() {
    this.currentClass = null
    this.classes = []
    this.instances = []
    this.methodCalls = []
    this.stateOperations = []
    this.stateRetrievals = []
    this.pageNavigations = []
    this.listOperations = []
    this.variableAssignments = []
    this.connections = []
    this.morphOperations = []
    this.printStatements = []
    this.messageExecutions = []
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
    // Message execution: "message to instanceName \"code\""
    else if (this.isMessageExecution(tokens)) {
      this.handleMessageExecution(tokens)
    }
    // Messaging syntax: "instanceName methodName [params...]"
    else if (this.isMessagingCall(tokens)) {
      this.handleMessagingCall(tokens)
    }
    // State operation: "set state \"stateName\" to value"
    else if (this.isStateOperation(tokens)) {
      this.handleStateOperation(tokens)
    }
    // Page navigation: "go to page \"PageName\""
    else if (this.isPageNavigation(tokens)) {
      this.handlePageNavigation(tokens)
    }
    // List operations: "add item to field of instance"
    else if (this.isListOperation(tokens)) {
      this.handleListOperation(tokens)
    }
    // Connection: "connect sourceInstance to targetInstance"
    else if (this.isConnection(tokens)) {
      this.handleConnection(tokens)
    }
    // Morph operation: "add instanceName to instanceName"
    else if (this.isMorphOperation(tokens)) {
      this.handleMorphOperation(tokens)
    }
    // Print statement: "print message"
    else if (this.isPrintStatement(tokens)) {
      this.handlePrintStatement(tokens)
    }
    // Variable assignment: "varName is value" or processing in method body
    else if (this.isVariableAssignment(tokens)) {
      this.handleVariableAssignment(tokens)
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
    if (value === 'go') return 'GO'
    if (value === 'page') return 'PAGE'
    if (value === 'connect') return 'CONNECT'
    if (value === 'print') return 'PRINT'
    if (value === 'with') return 'WITH'
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
    let defaultValue: any 

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

    // "ClassName has method "methodName" [with "param1" [with "param2"...]] do ..."
    const methodName = this.extractStringValue(tokens[3])
    
    const doIndex = tokens.findIndex(t => t.value === 'do')
    if (doIndex === -1) {
      throw new Error('Method definition missing "do" keyword')
    }

    // Extract parameters between method name and "do"
    const parameters: string[] = []
    let currentIndex = 4
    while (currentIndex < doIndex) {
      if (tokens[currentIndex].value === 'with' && currentIndex + 1 < doIndex) {
        const paramName = this.extractStringValue(tokens[currentIndex + 1])
        parameters.push(paramName)
        currentIndex += 2
      } else {
        currentIndex++
      }
    }

    const bodyTokens = tokens.slice(doIndex + 1)
    const body = bodyTokens.map(t => t.value).join(' ')

    const method: ObjaxMethodDefinition = {
      name: methodName,
      parameters,
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
    // "instanceName is a new ClassName [with propertyValue]"
    const isIndex = tokens.findIndex(t => t.value === 'is')
    const newIndex = tokens.findIndex(t => t.value === 'new')

    if (isIndex === -1 || newIndex === -1 || isIndex === 0 || newIndex >= tokens.length - 1) {
      throw new Error('Invalid instance creation syntax')
    }

    const instanceName = tokens[0].value
    const className = tokens[newIndex + 1].value

    // Extract properties after className
    const properties: Record<string, any> = {}
    let currentIndex = newIndex + 2
    
    while (currentIndex < tokens.length) {
      if (tokens[currentIndex].value === 'with') {
        // Parse keyword arguments: "with key1 value1 and key2 value2 and ..."
        currentIndex++ // Skip 'with'
        
        while (currentIndex < tokens.length - 1) {
          const keyToken = tokens[currentIndex]
          const valueToken = tokens[currentIndex + 1]
          
          if (!keyToken || !valueToken) break
          
          // Extract key (remove quotes if it's a string)
          const key = keyToken.type === 'STRING' ? this.extractStringValue(keyToken) : keyToken.value
          const value = this.parseValue(valueToken)
          
          properties[key] = value
          currentIndex += 2
          
          // Skip 'and' if it exists
          if (currentIndex < tokens.length && tokens[currentIndex].value === 'and') {
            currentIndex++
          } else {
            break // No more keyword arguments
          }
        }
        break
      } else {
        currentIndex++
      }
    }

    const instance: ObjaxInstanceDefinition = {
      name: instanceName,
      className,
      properties
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

  private isMessagingCall(tokens: Token[]): boolean {
    // "instanceName methodName [params...]"
    // Basic pattern: at least 2 tokens, first is IDENTIFIER, second is IDENTIFIER
    // Avoid conflicts with other patterns by excluding keywords
    if (tokens.length < 2) return false
    
    const firstToken = tokens[0]
    const secondToken = tokens[1]
    
    if (firstToken.type !== 'IDENTIFIER') {
      return false
    }
    
    // Allow common method names that might have specific token types
    const allowedMethodTokenTypes = ['IDENTIFIER', 'SET']
    if (!allowedMethodTokenTypes.includes(secondToken.type)) {
      return false
    }
    
    // Exclude other known patterns, but allow "set" as a method name
    const keywords = ['is', 'has', 'define', 'go', 'connect', 'print']
    if (keywords.includes(secondToken.value)) {
      return false
    }
    
    // Special handling for "set" - check if it's a state operation or a method call
    if (secondToken.value === 'set') {
      // If it contains "state" and "to", it's a state operation, not a method call
      const hasState = tokens.some(t => t.value === 'state')
      const hasTo = tokens.some(t => t.value === 'to')
      if (hasState && hasTo) {
        return false // This is "set state ... to ..." pattern
      }
      // Otherwise, it's a method call like "score set 100"
    }
    
    // Special case: "add" as second token should check for list operation pattern
    if (secondToken.value === 'add') {
      // Check if this looks like "add item to field of instance" (list operation)
      const hasToToken = tokens.some(t => t.value === 'to')
      const hasOfToken = tokens.some(t => t.value === 'of')
      if (hasToToken && hasOfToken) {
        return false // This is a list operation, not messaging
      }
    }
    
    return true
  }


  private handleMessagingCall(tokens: Token[]) {
    // "instanceName methodName [param1 [param2 ...]]"
    if (tokens.length < 2) {
      throw new Error('Invalid messaging call syntax')
    }

    const instanceName = tokens[0].value
    const methodName = tokens[1].value

    // Extract parameters after methodName
    const parameters: any[] = []
    
    for (let i = 2; i < tokens.length; i++) {
      const paramValue = this.parseValue(tokens[i])
      parameters.push(paramValue)
    }

    const methodCall: ObjaxMethodCall = {
      methodName,
      instanceName,
      parameters: parameters.length > 0 ? parameters : undefined
    }

    this.methodCalls.push(methodCall)
  }

  private isStateOperation(tokens: Token[]): boolean {
    // "set state \"stateName\" to value"
    return tokens.length >= 5 && 
           tokens[0].value === 'set' && 
           tokens[1].value === 'state' &&
           tokens[3].value === 'to'
  }

  private handleStateOperation(tokens: Token[]) {
    // "set state \"stateName\" to value"
    if (tokens.length < 5) {
      throw new Error('Invalid state operation syntax')
    }

    const stateName = this.extractStringValue(tokens[2])
    const valueToken = tokens[4]
    const value = this.parseValue(valueToken)

    const stateOp: ObjaxStateOperation = {
      stateName,
      value
    }

    this.stateOperations.push(stateOp)
  }

  private isPageNavigation(tokens: Token[]): boolean {
    // "go to page \"PageName\""
    return tokens.length >= 4 && 
           tokens[0].value === 'go' && 
           tokens[1].value === 'to' &&
           tokens[2].value === 'page'
  }

  private handlePageNavigation(tokens: Token[]) {
    // "go to page \"PageName\""
    if (tokens.length < 4) {
      throw new Error('Invalid page navigation syntax')
    }

    const pageName = this.extractStringValue(tokens[3])

    const pageNavigation: ObjaxPageNavigation = {
      pageName
    }

    this.pageNavigations.push(pageNavigation)
  }

  private isListOperation(tokens: Token[]): boolean {
    // "add item to field of instance"
    return tokens.length >= 6 && 
           tokens[0].value === 'add' && 
           tokens[2].value === 'to' &&
           tokens[4].value === 'of'
  }

  private handleListOperation(tokens: Token[]) {
    // "add item to field of instance"
    if (tokens.length < 6) {
      throw new Error('Invalid list operation syntax')
    }

    const item = this.parseValue(tokens[1])
    const listField = this.extractStringValue(tokens[3])
    const targetInstance = tokens[5].value

    const listOp: ObjaxListOperation = {
      operation: 'add',
      item,
      listField,
      targetInstance
    }

    this.listOperations.push(listOp)
  }

  private isConnection(tokens: Token[]): boolean {
    // "connect sourceInstance to targetInstance"
    return tokens.length >= 4 && 
           tokens[0].value === 'connect' && 
           tokens[2].value === 'to'
  }

  private handleConnection(tokens: Token[]) {
    // "connect sourceInstance to targetInstance"
    if (tokens.length < 4) {
      throw new Error('Invalid connection syntax')
    }

    const sourceInstance = tokens[1].value
    const targetInstance = tokens[3].value

    const connection: ObjaxConnection = {
      sourceInstance,
      targetInstance
    }

    this.connections.push(connection)
  }

  private isMorphOperation(tokens: Token[]): boolean {
    // "add instanceName to instanceName"
    return tokens.length === 4 && 
           tokens[0].value === 'add' && 
           tokens[2].value === 'to' &&
           tokens[1].type === 'IDENTIFIER' &&
           tokens[3].type === 'IDENTIFIER'
  }

  private handleMorphOperation(tokens: Token[]) {
    // "add childInstance to parentInstance"
    if (tokens.length !== 4) {
      throw new Error('Invalid morph operation syntax')
    }

    const childInstance = tokens[1].value
    const parentInstance = tokens[3].value

    const morphOp: ObjaxMorphOperation = {
      operation: 'add',
      childInstance,
      parentInstance
    }

    this.morphOperations.push(morphOp)
  }

  private isPrintStatement(tokens: Token[]): boolean {
    // "print message"
    return tokens.length >= 2 && tokens[0].value === 'print'
  }

  private handlePrintStatement(tokens: Token[]) {
    // "print message" or "print \"string message\""
    if (tokens.length < 2) {
      throw new Error('Invalid print statement syntax')
    }

    // Join all tokens after "print" to handle multi-word messages
    const messageTokens = tokens.slice(1)
    let message: string

    if (messageTokens.length === 1 && messageTokens[0].type === 'STRING') {
      // Single quoted string: print "Hello World"
      message = this.extractStringValue(messageTokens[0])
    } else {
      // Multiple tokens or unquoted: print Hello World
      message = messageTokens.map(t => t.value).join(' ')
    }

    const printStatement: ObjaxPrintStatement = {
      message,
      timestamp: new Date().toISOString()
    }

    this.printStatements.push(printStatement)
  }

  private isVariableAssignment(tokens: Token[]): boolean {
    // "varName is value" (not instance creation)
    return tokens.length >= 3 && 
           tokens[1].value === 'is' && 
           !tokens.some(t => t.value === 'new')
  }

  private handleVariableAssignment(tokens: Token[]) {
    // "varName is value"
    if (tokens.length < 3) {
      throw new Error('Invalid variable assignment syntax')
    }

    const variableName = tokens[0].value
    const valueTokens = tokens.slice(2)
    const value = valueTokens.map(t => t.value).join(' ')

    const assignment: ObjaxVariableAssignment = {
      variableName,
      value,
      type: 'primitive'
    }

    this.variableAssignments.push(assignment)
  }

  private isMessageExecution(tokens: Token[]): boolean {
    // "message to instanceName \"code\""
    return tokens.length >= 4 && 
           tokens[0].value === 'message' && 
           tokens[1].value === 'to' &&
           tokens[3].type === 'STRING'
  }

  private handleMessageExecution(tokens: Token[]) {
    // "message to instanceName \"code\""
    if (tokens.length < 4) {
      throw new Error('Invalid message execution syntax')
    }

    const targetInstance = tokens[2].value
    const code = this.extractStringValue(tokens[3])

    const messageExecution: ObjaxMessageExecution = {
      targetInstance,
      code,
      context: 'it'
    }

    this.messageExecutions.push(messageExecution)
  }
}