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
  ObjaxFieldAssignment,
  ObjaxConnection,
  ObjaxMorphOperation,
  ObjaxPrintStatement,
  ObjaxMessageExecution,
  ObjaxInstanceConfiguration,
  ObjaxEventListener,
  ObjaxBlockAssignment,
  ObjaxBecomesAssignment,
  ObjaxBlockCall,
  ObjaxExpression,
  ObjaxTimerOperation,
  ObjaxConditionalBlock,
  ObjaxConditionalExecution,
  ObjaxConditionalOtherwiseExecution,
  ObjaxCondition,
} from './types';

interface Token {
  type: string;
  value: string;
}

export class LinearObjaxParser {
  private currentClass: ObjaxClassDefinition | null = null;
  private classes: ObjaxClassDefinition[] = [];
  private instances: ObjaxInstanceDefinition[] = [];
  private methodCalls: ObjaxMethodCall[] = [];
  private stateOperations: ObjaxStateOperation[] = [];
  private stateRetrievals: ObjaxStateRetrieval[] = [];
  private pageNavigations: ObjaxPageNavigation[] = [];
  private listOperations: ObjaxListOperation[] = [];
  private variableAssignments: ObjaxVariableAssignment[] = [];
  private fieldAssignments: ObjaxFieldAssignment[] = [];
  private connections: ObjaxConnection[] = [];
  private morphOperations: ObjaxMorphOperation[] = [];
  private printStatements: ObjaxPrintStatement[] = [];
  private messageExecutions: ObjaxMessageExecution[] = [];
  private instanceConfigurations: ObjaxInstanceConfiguration[] = [];
  private eventListeners: ObjaxEventListener[] = [];
  private blockAssignments: ObjaxBlockAssignment[] = [];
  private blockCalls: ObjaxBlockCall[] = [];
  private becomesAssignments: ObjaxBecomesAssignment[] = [];
  private timerOperations: ObjaxTimerOperation[] = [];
  private conditionalBlocks: ObjaxConditionalBlock[] = [];
  private conditionalExecutions: ObjaxConditionalExecution[] = [];
  private conditionalOtherwiseExecutions: ObjaxConditionalOtherwiseExecution[] =
    [];
  private errors: string[] = [];

  parse(
    code: string,
    existingInstances?: ObjaxInstanceDefinition[],
  ): ObjaxExecutionResult {
    this.reset();

    // Add existing instances to the parser's instance list for reference
    if (existingInstances) {
      this.instances.push(...existingInstances);
    }

    const lines = code
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .filter((line) => !line.startsWith('//')); // Filter out comment lines

    for (const line of lines) {
      try {
        this.parseLine(line);
      } catch (error) {
        this.errors.push(
          `Parse error in "${line}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    // Close any open class definition
    if (this.currentClass) {
      this.classes.push(this.currentClass);
      this.currentClass = null;
    }

    // Filter out existing instances from the result to avoid duplicates
    const newInstances = existingInstances
      ? this.instances.filter(
          (instance) =>
            !existingInstances.some(
              (existing) => existing.name === instance.name,
            ),
        )
      : this.instances;

    return {
      classes: this.classes,
      instances: newInstances,
      methodCalls: this.methodCalls,
      stateOperations: this.stateOperations,
      stateRetrievals: this.stateRetrievals,
      pageNavigations: this.pageNavigations,
      listOperations: this.listOperations,
      variableAssignments: this.variableAssignments,
      fieldAssignments: this.fieldAssignments,
      connections: this.connections,
      morphOperations: this.morphOperations,
      printStatements: this.printStatements,
      messageExecutions: this.messageExecutions,
      instanceConfigurations: this.instanceConfigurations,
      eventListeners: this.eventListeners,
      blockAssignments: this.blockAssignments,
      blockCalls: this.blockCalls,
      becomesAssignments: this.becomesAssignments,
      timerOperations: this.timerOperations,
      conditionalBlocks: this.conditionalBlocks,
      conditionalExecutions: this.conditionalExecutions,
      conditionalOtherwiseExecutions: this.conditionalOtherwiseExecutions,
      errors: this.errors,
    };
  }

  private reset() {
    this.currentClass = null;
    this.classes = [];
    this.instances = [];
    this.methodCalls = [];
    this.stateOperations = [];
    this.stateRetrievals = [];
    this.pageNavigations = [];
    this.listOperations = [];
    this.variableAssignments = [];
    this.fieldAssignments = [];
    this.connections = [];
    this.morphOperations = [];
    this.printStatements = [];
    this.messageExecutions = [];
    this.instanceConfigurations = [];
    this.eventListeners = [];
    this.blockAssignments = [];
    this.blockCalls = [];
    this.becomesAssignments = [];
    this.timerOperations = [];
    this.conditionalBlocks = [];
    this.conditionalExecutions = [];
    this.conditionalOtherwiseExecutions = [];
    this.errors = [];
  }

  private parseLine(line: string) {
    // Remove inline comments (but not inside string literals)
    const cleanLine = this.removeInlineComments(line);

    if (cleanLine.length === 0) return;

    const tokens = this.tokenize(cleanLine);

    if (tokens.length === 0) return;

    // Class definition: "ClassName is a Class" or "define ClassName"
    if (this.isClassDefinition(tokens)) {
      this.handleClassDefinition(tokens);
    }
    // Class member: "ClassName has field/method ..." or "ClassName defineField/defineMethod ..."
    else if (
      this.currentClass &&
      tokens.length > 2 &&
      (tokens[1].value === 'has' ||
        tokens[1].value === 'defineField' ||
        tokens[1].value === 'defineMethod')
    ) {
      this.handleClassMember(tokens);
    }
    // Create method: "create with ..."
    else if (this.isCreateMethod(tokens)) {
      this.handleCreateMethod(tokens);
    }
    // Instance creation: "instanceName is a ClassName"
    else if (this.isInstanceCreation(tokens)) {
      this.handleInstanceCreation(tokens);
    }
    // Instance configuration: "instanceName has field \"fieldName\""
    else if (this.isInstanceConfiguration(tokens)) {
      this.handleInstanceConfiguration(tokens);
    }
    // Existing class extension: "ExistingClassName has field/method ..."
    else if (this.isExistingClassExtension(tokens)) {
      this.handleExistingClassExtension(tokens);
    }
    // Non-existent instance configuration: try to catch and error
    else if (this.isAttemptedInstanceConfiguration(tokens)) {
      const instanceName = tokens[0].value;
      this.errors.push(
        `Instance "${instanceName}" not found for configuration`,
      );
    }
    // Message execution: "message to instanceName \"code\""
    else if (this.isMessageExecution(tokens)) {
      this.handleMessageExecution(tokens);
    }
    // Event listener (old syntax): "instanceName addAction with when eventType action <action>"
    else if (this.isEventListener(tokens)) {
      this.handleEventListener(tokens);
    }
    // Event listener (new syntax): "instanceName addAction with event \"eventType\" and action blockName"
    else if (this.isNewEventListener(tokens)) {
      console.log(
        'New event listener detected:',
        tokens.map((t) => t.value).join(' '),
      );
      this.handleNewEventListener(tokens);
    }
    // Timer operation: "instanceName repeat with time 1000 and action <action>"
    else if (this.isTimerOperation(tokens)) {
      this.handleTimerOperation(tokens);
    }
    // Becomes assignment: "target becomes expression"
    else if (this.isBecomesAssignment(tokens)) {
      this.handleBecomesAssignment(tokens);
    }
    // Block call: "blockName call"
    else if (this.isBlockCall(tokens)) {
      this.handleBlockCall(tokens);
    }
    // Conditional execution: "blockName thenDo with action <action>"
    else if (this.isConditionalExecution(tokens)) {
      this.handleConditionalExecution(tokens);
    }
    // Conditional otherwise execution: "blockName otherwiseDo with action <action>"
    else if (this.isConditionalOtherwiseExecution(tokens)) {
      this.handleConditionalOtherwiseExecution(tokens);
    }
    // Messaging syntax: "instanceName methodName [params...]"
    else if (this.isMessagingCall(tokens)) {
      this.handleMessagingCall(tokens);
    }
    // List operations: "add item to field of instance"
    else if (this.isListOperation(tokens)) {
      this.handleListOperation(tokens);
    }
    // Include with child: "parentInstance include with child childInstance"
    else if (this.isIncludeOperation(tokens)) {
      this.handleIncludeOperation(tokens);
    }
    // Print statement: "print message"
    else if (this.isPrintStatement(tokens)) {
      this.handlePrintStatement(tokens);
    }
    // Field assignment: "instanceName.fieldName is value1, value2, ..." (check before variable assignment)
    else if (this.isFieldAssignment(tokens)) {
      this.handleFieldAssignment(tokens);
    }
    // Conditional block: "blockName is <condition>" (check before block assignment)
    else if (this.isConditionalBlock(tokens)) {
      this.handleConditionalBlock(tokens);
    }
    // Block assignment: "blockName is (block body)" (check before variable assignment)
    else if (this.isBlockAssignment(tokens)) {
      this.handleBlockAssignment(tokens);
    }
    // Variable assignment: "varName is value" or processing in method body
    else if (this.isVariableAssignment(tokens)) {
      this.handleVariableAssignment(tokens);
    }
    // Unknown pattern - might be next statement, close current class
    else if (this.currentClass) {
      this.classes.push(this.currentClass);
      this.currentClass = null;
      // Try parsing again as top-level statement
      this.parseLine(line);
    } else {
      throw new Error(`Unknown statement pattern: ${line}`);
    }
  }

  private tokenize(line: string): Token[] {
    const tokens: Token[] = [];

    // First, extract action blocks <...>
    const actionBlockRegex = /<[^>]*>/g;
    const actionBlocks: string[] = [];
    let processedLine = line;

    let actionMatch;
    while ((actionMatch = actionBlockRegex.exec(line)) !== null) {
      const actionContent = actionMatch[0];
      const placeholder = `__ACTIONBLOCK_${actionBlocks.length}__`;
      actionBlocks.push(actionContent);
      processedLine = processedLine.replace(actionContent, placeholder);
    }

    // Second, extract code blocks {...}
    const codeBlockRegex = /{[^}]*}/g;
    const codeBlocks: string[] = [];

    let codeMatch;
    while ((codeMatch = codeBlockRegex.exec(processedLine)) !== null) {
      const codeContent = codeMatch[0];
      const placeholder = `__CODEBLOCK_${codeBlocks.length}__`;
      codeBlocks.push(codeContent);
      processedLine = processedLine.replace(codeContent, placeholder);
    }

    // Third, extract square bracket arrays [...]
    const squareArrayRegex = /\[[^\]]*\]/g;
    const squareArrays: string[] = [];

    let squareMatch;
    while ((squareMatch = squareArrayRegex.exec(processedLine)) !== null) {
      const arrayContent = squareMatch[0];
      const placeholder = `__SQUAREARRAY_${squareArrays.length}__`;
      squareArrays.push(arrayContent);
      processedLine = processedLine.replace(arrayContent, placeholder);
    }

    // Fourth, extract block syntax (...)
    const blockRegex = /\([^)]*\)/g;
    const blocks: string[] = [];

    let blockMatch;
    while ((blockMatch = blockRegex.exec(processedLine)) !== null) {
      const blockContent = blockMatch[0];
      const placeholder = `__BLOCK_${blocks.length}__`;
      blocks.push(blockContent);
      processedLine = processedLine.replace(blockContent, placeholder);
    }

    // Now tokenize the processed line
    const regex = /"[^"]*"|[^\s]+/g;
    let match;

    while ((match = regex.exec(processedLine)) !== null) {
      let value = match[0];

      // Replace action block placeholders back with actual content
      if (value.startsWith('__ACTIONBLOCK_') && value.endsWith('__')) {
        const actionIndex = parseInt(
          value.replace('__ACTIONBLOCK_', '').replace('__', ''),
        );
        value = actionBlocks[actionIndex];
      }

      // Replace code block placeholders back with actual content
      if (value.startsWith('__CODEBLOCK_') && value.endsWith('__')) {
        const codeIndex = parseInt(
          value.replace('__CODEBLOCK_', '').replace('__', ''),
        );
        value = codeBlocks[codeIndex];
      }

      // Replace square array placeholders back with actual array content
      if (value.startsWith('__SQUAREARRAY_') && value.endsWith('__')) {
        const arrayIndex = parseInt(
          value.replace('__SQUAREARRAY_', '').replace('__', ''),
        );
        value = squareArrays[arrayIndex];
      }

      // Replace block placeholders back with actual block content
      if (value.startsWith('__BLOCK_') && value.endsWith('__')) {
        const blockIndex = parseInt(
          value.replace('__BLOCK_', '').replace('__', ''),
        );
        value = blocks[blockIndex];
      }

      tokens.push({
        type: this.getTokenType(value),
        value: value,
      });
    }

    return tokens;
  }

  private getTokenType(value: string): string {
    if (value === 'has') return 'HAS';
    if (value === 'field') return 'FIELD';
    if (value === 'method') return 'METHOD';
    if (value === 'default') return 'DEFAULT';
    if (value === 'do') return 'DO';
    if (value === 'is') return 'IS';
    if (value === 'a') return 'A';
    if (value === 'new') return 'NEW';
    if (value === 'self') return 'SELF';
    if (value === 'Class') return 'CLASS';
    if (value === 'of') return 'OF';
    if (value === 'myself') return 'MYSELF';
    if (value === 'to') return 'TO';
    if (value === 'include') return 'INCLUDE';
    if (value === 'child') return 'CHILD';
    if (value === 'print') return 'PRINT';
    if (value === 'with') return 'WITH';
    if (value === 'when') return 'WHEN';
    if (value === 'action') return 'ACTION';
    if (value === 'addAction') return 'ADDACTION';
    if (value === 'create') return 'CREATE';
    if (value === 'doAll') return 'DOALL';
    if (value === 'repeat') return 'REPEAT';
    if (value === 'time') return 'TIME';
    if (value === 'thenDo') return 'THENDO';
    if (value === 'otherwiseDo') return 'OTHERWISEDO';
    if (value === 'become') return 'BECOME';
    if (value === 'becomes') return 'BECOMES';
    if (value === 'event') return 'EVENT';
    if (value === 'equal') return 'EQUAL';
    if (value === 'defineField') return 'DEFINEFIELD';
    if (value === 'defineMethod') return 'DEFINEMETHOD';
    if (value === 'true') return 'TRUE';
    if (value === 'false') return 'FALSE';
    if (value.startsWith('"') && value.endsWith('"')) return 'STRING';
    if (value.startsWith('[') && value.endsWith(']')) return 'ARRAY';
    if (value.startsWith('<') && value.endsWith('>')) return 'ACTIONBLOCK';
    if (value.startsWith('(') && value.endsWith(')')) return 'BLOCK';
    if (value.startsWith('{') && value.endsWith('}')) return 'CODEBLOCK';
    if (/^\d+(\.\d+)?$/.test(value)) return 'NUMBER';
    return 'IDENTIFIER';
  }

  private isExistingClassExtension(tokens: Token[]): boolean {
    // "ClassName has field/method ..." or "ClassName defineField/defineMethod ..." when no current class context
    // Class names typically start with uppercase, instance names with lowercase
    const firstToken = tokens[0].value;
    const startsWithUppercase =
      firstToken.charAt(0) === firstToken.charAt(0).toUpperCase();

    return (
      !this.currentClass &&
      tokens.length > 2 &&
      ((tokens[1].value === 'has' &&
        (tokens[2].value === 'field' || tokens[2].value === 'method')) ||
        tokens[1].value === 'defineField' ||
        tokens[1].value === 'defineMethod') &&
      startsWithUppercase
    );
  }

  private handleExistingClassExtension(tokens: Token[]) {
    const className = tokens[0].value;

    // Find existing class or create new one
    let existingClass = this.classes.find((c) => c.name === className);

    if (!existingClass) {
      // Create new class if it doesn't exist
      existingClass = {
        name: className,
        fields: [],
        methods: [],
      };
      this.classes.push(existingClass);
    }

    // Temporarily set as current class for member handling
    const previousClass = this.currentClass;
    this.currentClass = existingClass;

    try {
      this.handleClassMember(tokens);
    } finally {
      // Restore previous class context
      this.currentClass = previousClass;

      // Update the class in our list
      const classIndex = this.classes.findIndex((c) => c.name === className);
      if (classIndex !== -1) {
        this.classes[classIndex] = existingClass;
      }
    }
  }

  private isClassDefinition(tokens: Token[]): boolean {
    // "ClassName is a Class"
    return (
      tokens.length >= 4 &&
      tokens[1].value === 'is' &&
      tokens[2].value === 'a' &&
      tokens[3].value === 'Class'
    );
  }

  private handleClassDefinition(tokens: Token[]) {
    // Handle "ClassName is a Class" syntax
    if (
      tokens.length < 4 ||
      tokens[1].value !== 'is' ||
      tokens[2].value !== 'a' ||
      tokens[3].value !== 'Class'
    ) {
      throw new Error(
        'Invalid class definition syntax. Use: ClassName is a Class',
      );
    }

    const className = tokens[0].value;

    // Close previous class if exists
    if (this.currentClass) {
      this.classes.push(this.currentClass);
    }

    this.currentClass = {
      name: className,
      fields: [],
      methods: [],
    };
  }

  private handleClassMember(tokens: Token[]) {
    if (!this.currentClass) {
      throw new Error('Class member definition outside class');
    }

    const className = tokens[0].value;
    if (className !== this.currentClass.name) {
      throw new Error(
        `Expected class name "${this.currentClass.name}", got "${className}"`,
      );
    }

    // Handle new syntax: "ClassName defineField/defineMethod ..."
    if (tokens[1]?.value === 'defineField') {
      this.handleDefineFieldSyntax(tokens);
    } else if (tokens[1]?.value === 'defineMethod') {
      this.handleDefineMethodSyntax(tokens);
    }
    // Handle old syntax: "ClassName has field/method ..."
    else if (tokens[2]?.value === 'field') {
      this.handleFieldDefinition(tokens);
    } else if (tokens[2]?.value === 'method') {
      this.handleMethodDefinition(tokens);
    } else {
      throw new Error(`Unknown class member type: ${tokens[2]?.value}`);
    }
  }

  private handleFieldDefinition(tokens: Token[]) {
    if (!this.currentClass) return;

    // "ClassName has field "fieldName" [has default value]"
    const fieldName = this.extractStringValue(tokens[3]);
    let defaultValue: any;

    // Check for default value
    const hasIndex = tokens.findIndex((t, i) => i > 3 && t.value === 'has');
    if (hasIndex !== -1 && tokens[hasIndex + 1]?.value === 'default') {
      const defaultToken = tokens[hasIndex + 2];
      if (defaultToken) {
        defaultValue = this.parseValue(defaultToken);
      }
    }

    const field: ObjaxFieldDefinition = {
      name: fieldName,
      defaultValue,
    };

    this.currentClass.fields.push(field);
  }

  private handleMethodDefinition(tokens: Token[]) {
    if (!this.currentClass) return;

    // "ClassName has method "methodName" [with "param1" [with "param2"...]] do ..."
    const methodName = this.extractStringValue(tokens[3]);

    const doIndex = tokens.findIndex((t) => t.value === 'do');
    if (doIndex === -1) {
      throw new Error('Method definition missing "do" keyword');
    }

    // Extract parameters between method name and "do"
    const parameters: string[] = [];
    let currentIndex = 4;
    while (currentIndex < doIndex) {
      if (tokens[currentIndex].value === 'with' && currentIndex + 1 < doIndex) {
        const paramName = this.extractStringValue(tokens[currentIndex + 1]);
        parameters.push(paramName);
        currentIndex += 2;
      } else {
        currentIndex++;
      }
    }

    const bodyTokens = tokens.slice(doIndex + 1);
    const body = bodyTokens.map((t) => t.value).join(' ');

    const method: ObjaxMethodDefinition = {
      name: methodName,
      parameters,
      body,
    };

    this.currentClass.methods.push(method);
  }

  private handleDefineFieldSyntax(tokens: Token[]) {
    if (!this.currentClass) return;

    // "ClassName defineField "fieldName" [has default value]"
    const fieldName = this.extractStringValue(tokens[2]);
    let defaultValue: any;

    // Check for default value
    const hasIndex = tokens.findIndex((t, i) => i > 2 && t.value === 'has');
    if (hasIndex !== -1 && tokens[hasIndex + 1]?.value === 'default') {
      const defaultToken = tokens[hasIndex + 2];
      if (defaultToken) {
        defaultValue = this.parseValue(defaultToken);
      }
    }

    const field: ObjaxFieldDefinition = {
      name: fieldName,
      defaultValue,
    };

    this.currentClass.fields.push(field);
  }

  private handleDefineMethodSyntax(tokens: Token[]) {
    if (!this.currentClass) return;

    // "ClassName defineMethod "methodName" [with "param1" [with "param2"...]] do {code}"
    const methodName = this.extractStringValue(tokens[2]);

    const doIndex = tokens.findIndex((t) => t.value === 'do');
    if (doIndex === -1) {
      throw new Error('Method definition missing "do" keyword');
    }

    // Extract parameters between method name and "do"
    const parameters: string[] = [];
    let currentIndex = 3;
    while (currentIndex < doIndex) {
      if (tokens[currentIndex].value === 'with' && currentIndex + 1 < doIndex) {
        const paramName = this.extractStringValue(tokens[currentIndex + 1]);
        parameters.push(paramName);
        currentIndex += 2;
      } else {
        currentIndex++;
      }
    }

    // The body should be a code block {}
    const bodyToken = tokens[doIndex + 1];
    if (!bodyToken || bodyToken.type !== 'CODEBLOCK') {
      throw new Error('Method body must be a code block enclosed in {}');
    }

    // Extract body content (remove braces)
    const body = bodyToken.value.slice(1, -1).trim();

    const method: ObjaxMethodDefinition = {
      name: methodName,
      parameters,
      body,
    };

    this.currentClass.methods.push(method);
  }

  private isInstanceCreation(tokens: Token[]): boolean {
    // Check for "instanceName is a ClassName" pattern
    // But exclude "ClassName is a Class" pattern
    const hasIs = tokens.some((t) => t.value === 'is');
    const hasA = tokens.some((t) => t.value === 'a');
    const hasClass = tokens.some((t) => t.value === 'Class');

    return hasIs && hasA && !hasClass;
  }

  private handleInstanceCreation(tokens: Token[]) {
    // Close any open class definition before creating instances
    if (this.currentClass) {
      this.classes.push(this.currentClass);
      this.currentClass = null;
    }

    // "instanceName is a ClassName [with propertyValue]"
    const isIndex = tokens.findIndex((t) => t.value === 'is');
    const aIndex = tokens.findIndex((t) => t.value === 'a');

    if (
      isIndex === -1 ||
      aIndex === -1 ||
      isIndex === 0 ||
      aIndex >= tokens.length - 1
    ) {
      throw new Error('Invalid instance creation syntax');
    }

    const instanceName = tokens[0].value;

    // Check if there's a "new" keyword
    let className: string;
    let currentIndex: number;

    if (tokens[aIndex + 1]?.value === 'new') {
      className = tokens[aIndex + 2].value;
      currentIndex = aIndex + 3;
    } else {
      className = tokens[aIndex + 1].value;
      currentIndex = aIndex + 2;
    }

    // Extract properties after className
    const properties: Record<string, any> = {};

    while (currentIndex < tokens.length) {
      if (tokens[currentIndex].value === 'with') {
        // Parse keyword arguments: "with key1 value1 and key2 value2 and ..."
        currentIndex++; // Skip 'with'

        while (currentIndex < tokens.length - 1) {
          const keyToken = tokens[currentIndex];
          const valueToken = tokens[currentIndex + 1];

          if (!keyToken || !valueToken) break;

          // Extract key (remove quotes if it's a string)
          const key =
            keyToken.type === 'STRING'
              ? this.extractStringValue(keyToken)
              : keyToken.value;
          const value = this.parseValue(valueToken);

          properties[key] = value;
          currentIndex += 2;

          // Skip 'and' if it exists
          if (
            currentIndex < tokens.length &&
            tokens[currentIndex].value === 'and'
          ) {
            currentIndex++;
          } else {
            break; // No more keyword arguments
          }
        }
        break;
      } else {
        currentIndex++;
      }
    }

    const instance: ObjaxInstanceDefinition = {
      name: instanceName,
      className,
      properties,
    };

    this.instances.push(instance);
  }

  private isInstanceConfiguration(tokens: Token[]): boolean {
    // "instanceName has field \"fieldName\""
    if (
      !(
        !this.currentClass &&
        tokens.length >= 4 &&
        tokens[1].value === 'has' &&
        tokens[2].value === 'field' &&
        tokens[3].type === 'STRING'
      )
    ) {
      return false;
    }

    // Check if the first token is an existing instance name
    const instanceName = tokens[0].value;
    return this.instances.some((instance) => instance.name === instanceName);
  }

  private isAttemptedInstanceConfiguration(tokens: Token[]): boolean {
    // "instanceName has field \"fieldName\"" - same pattern but instance doesn't exist
    // Instance names typically start with lowercase
    const firstToken = tokens[0].value;
    const startsWithLowercase =
      firstToken.charAt(0) === firstToken.charAt(0).toLowerCase();

    return (
      !this.currentClass &&
      tokens.length >= 4 &&
      tokens[1].value === 'has' &&
      tokens[2].value === 'field' &&
      tokens[3].type === 'STRING' &&
      startsWithLowercase
    );
  }

  private handleInstanceConfiguration(tokens: Token[]) {
    // "instanceName has field \"fieldName\""
    const instanceName = tokens[0].value;
    const fieldName = this.extractStringValue(tokens[3]);

    const configuration: ObjaxInstanceConfiguration = {
      instanceName,
      configurationType: 'field',
      value: fieldName,
    };

    this.instanceConfigurations.push(configuration);
  }

  private extractStringValue(token: Token): string {
    if (token.type !== 'STRING') {
      throw new Error(`Expected string, got ${token.value}`);
    }
    return token.value.slice(1, -1); // Remove quotes
  }

  private parseValue(token: Token): any {
    switch (token.type) {
      case 'STRING':
        return token.value.slice(1, -1);
      case 'TRUE':
        return true;
      case 'FALSE':
        return false;
      case 'NUMBER':
        return parseFloat(token.value);
      default:
        return token.value;
    }
  }

  private isMessagingCall(tokens: Token[]): boolean {
    // "instanceName methodName [params...]"
    // Basic pattern: at least 2 tokens, first is IDENTIFIER, second is IDENTIFIER
    // Avoid conflicts with other patterns by excluding keywords
    if (tokens.length < 2) return false;

    const firstToken = tokens[0];
    const secondToken = tokens[1];

    if (firstToken.type !== 'IDENTIFIER') {
      return false;
    }

    // Allow common method names that might have specific token types
    const allowedMethodTokenTypes = ['IDENTIFIER', 'REPEAT', 'DOALL'];
    if (!allowedMethodTokenTypes.includes(secondToken.type)) {
      return false;
    }

    // Exclude other known patterns
    const keywords = ['is', 'has', 'define', 'go', 'include', 'print'];
    if (keywords.includes(secondToken.value)) {
      return false;
    }

    // Special case: "add" as second token should check for list operation pattern
    if (secondToken.value === 'add') {
      // Check if this looks like "add item to field of instance" (list operation)
      const hasToToken = tokens.some((t) => t.value === 'to');
      const hasOfToken = tokens.some((t) => t.value === 'of');
      if (hasToToken && hasOfToken) {
        return false; // This is a list operation, not messaging
      }
    }

    return true;
  }

  private handleMessagingCall(tokens: Token[]) {
    // "instanceName methodName [with key1 value1 [and key2 value2 ...]]"
    if (tokens.length < 2) {
      throw new Error('Invalid messaging call syntax');
    }

    const instanceName = tokens[0].value;
    const methodName = tokens[1].value;

    // Extract parameters after methodName
    const keywordParameters: Record<string, any> = {};
    const parameters: any[] = [];
    let currentIndex = 2;

    // Check if there are keyword arguments (with keyword)
    if (currentIndex < tokens.length && tokens[currentIndex].value === 'with') {
      currentIndex++; // Skip 'with'

      while (currentIndex < tokens.length - 1) {
        const keyToken = tokens[currentIndex];
        const valueToken = tokens[currentIndex + 1];

        if (!keyToken || !valueToken) break;

        // Extract key (remove quotes if it's a string)
        const key =
          keyToken.type === 'STRING'
            ? this.extractStringValue(keyToken)
            : keyToken.value;
        const value = this.parseValue(valueToken);

        keywordParameters[key] = value;
        currentIndex += 2;

        // Skip 'and' if it exists
        if (
          currentIndex < tokens.length &&
          tokens[currentIndex].value === 'and'
        ) {
          currentIndex++;
        } else {
          break; // No more keyword arguments
        }
      }
    } else {
      // Handle positional parameters (without 'with' keyword)
      while (currentIndex < tokens.length) {
        const paramToken = tokens[currentIndex];
        const value = this.parseValue(paramToken);
        parameters.push(value);
        currentIndex++;
      }
    }

    const methodCall: ObjaxMethodCall = {
      methodName,
      instanceName,
      keywordParameters:
        Object.keys(keywordParameters).length > 0
          ? keywordParameters
          : undefined,
      parameters: parameters.length > 0 ? parameters : undefined,
    };

    this.methodCalls.push(methodCall);
  }

  private isListOperation(tokens: Token[]): boolean {
    // "add item to field of instance"
    return (
      tokens.length >= 6 &&
      tokens[0].value === 'add' &&
      tokens[2].value === 'to' &&
      tokens[4].value === 'of'
    );
  }

  private handleListOperation(tokens: Token[]) {
    // "add item to field of instance"
    if (tokens.length < 6) {
      throw new Error('Invalid list operation syntax');
    }

    const item = this.parseValue(tokens[1]);
    const listField = this.extractStringValue(tokens[3]);
    const targetInstance = tokens[5].value;

    const listOp: ObjaxListOperation = {
      operation: 'add',
      item,
      listField,
      targetInstance,
    };

    this.listOperations.push(listOp);
  }

  private isIncludeOperation(tokens: Token[]): boolean {
    // "parentInstance include with child childInstance"
    return (
      tokens.length >= 5 &&
      tokens[1].value === 'include' &&
      tokens[2].value === 'with' &&
      tokens[3].value === 'child'
    );
  }

  private handleIncludeOperation(tokens: Token[]) {
    // "parentInstance include with child childInstance"
    if (tokens.length < 5) {
      throw new Error('Invalid include operation syntax');
    }

    const parentInstance = tokens[0].value;
    const childInstance = tokens[4].value;

    const morphOp: ObjaxMorphOperation = {
      operation: 'add',
      childInstance,
      parentInstance,
    };

    this.morphOperations.push(morphOp);
  }

  private isPrintStatement(tokens: Token[]): boolean {
    // "print message"
    return tokens.length >= 2 && tokens[0].value === 'print';
  }

  private handlePrintStatement(tokens: Token[]) {
    // "print message" or "print \"string message\""
    if (tokens.length < 2) {
      throw new Error('Invalid print statement syntax');
    }

    // Join all tokens after "print" to handle multi-word messages
    const messageTokens = tokens.slice(1);
    let message: string;

    if (messageTokens.length === 1 && messageTokens[0].type === 'STRING') {
      // Single quoted string: print "Hello World"
      message = this.extractStringValue(messageTokens[0]);
    } else {
      // Multiple tokens or unquoted: print Hello World
      message = messageTokens.map((t) => t.value).join(' ');
    }

    const printStatement: ObjaxPrintStatement = {
      message,
      timestamp: new Date().toISOString(),
    };

    this.printStatements.push(printStatement);
  }

  private isVariableAssignment(tokens: Token[]): boolean {
    // "varName is value" (not instance creation)
    return (
      tokens.length >= 3 &&
      tokens[1].value === 'is' &&
      !tokens.some((t) => t.value === 'new')
    );
  }

  private handleVariableAssignment(tokens: Token[]) {
    // "varName is value"
    if (tokens.length < 3) {
      throw new Error('Invalid variable assignment syntax');
    }

    const variableName = tokens[0].value;
    const valueTokens = tokens.slice(2);
    const value = valueTokens.map((t) => t.value).join(' ');

    const assignment: ObjaxVariableAssignment = {
      variableName,
      value,
      type: 'primitive',
    };

    this.variableAssignments.push(assignment);
  }

  private isMessageExecution(tokens: Token[]): boolean {
    // "message to instanceName \"code\""
    return (
      tokens.length >= 4 &&
      tokens[0].value === 'message' &&
      tokens[1].value === 'to' &&
      tokens[3].type === 'STRING'
    );
  }

  private handleMessageExecution(tokens: Token[]) {
    // "message to instanceName \"code\""
    if (tokens.length < 4) {
      throw new Error('Invalid message execution syntax');
    }

    const targetInstance = tokens[2].value;
    const code = this.extractStringValue(tokens[3]);

    const messageExecution: ObjaxMessageExecution = {
      targetInstance,
      code,
      context: 'it',
    };

    this.messageExecutions.push(messageExecution);
  }

  private isFieldAssignment(tokens: Token[]): boolean {
    // "instanceName.fieldName is value1, value2, ..."
    if (tokens.length < 3) return false;

    const firstToken = tokens[0].value;
    // Check if first token contains a dot (instanceName.fieldName)
    if (!firstToken.includes('.')) return false;

    // Check for "is" keyword
    return tokens[1].value === 'is';
  }

  private handleFieldAssignment(tokens: Token[]) {
    // "instanceName.fieldName is [value1, value2, value3]"
    const dotNotation = tokens[0].value;
    const dotIndex = dotNotation.indexOf('.');

    if (dotIndex === -1) {
      throw new Error('Invalid field assignment syntax: missing dot notation');
    }

    const instanceName = dotNotation.substring(0, dotIndex);
    const fieldName = dotNotation.substring(dotIndex + 1);

    // Get the value (should be a single token after "is")
    if (tokens.length < 3) {
      throw new Error('Invalid field assignment syntax: missing value');
    }

    const valueToken = tokens[2];
    let values: any[];

    if (valueToken.type === 'ARRAY') {
      // Parse square bracket array [value1, value2, ...]
      const arrayContent = valueToken.value.slice(1, -1); // Remove [ and ]
      if (arrayContent.trim() === '') {
        values = [];
      } else {
        // Split by comma and parse each value
        const items = arrayContent
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
        values = items.map((item) => {
          // Create a temporary token to parse the value
          const tempToken: Token = {
            type: this.getTokenType(item),
            value: item,
          };
          return this.parseValue(tempToken);
        });
      }
    } else {
      // Single value
      values = [this.parseValue(valueToken)];
    }

    const fieldAssignment: ObjaxFieldAssignment = {
      instanceName,
      fieldName,
      values,
    };

    this.fieldAssignments.push(fieldAssignment);
  }

  private removeInlineComments(line: string): string {
    let inString = false;
    let result = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
        inString = !inString;
        result += char;
      } else if (!inString && char === '/' && nextChar === '/') {
        // Found comment outside string, stop here
        break;
      } else {
        result += char;
      }
    }

    return result.trim();
  }

  private isEventListener(tokens: Token[]): boolean {
    // "instanceName addAction with when eventType action <action>"
    return (
      tokens.length >= 7 &&
      tokens[1].value === 'addAction' &&
      tokens[2].value === 'with' &&
      tokens[3].value === 'when' &&
      tokens[5].value === 'action' &&
      tokens[6].type === 'ACTIONBLOCK'
    );
  }

  private isNewEventListener(tokens: Token[]): boolean {
    // "instanceName addAction with event \"eventType\" and action blockName"
    const result =
      tokens.length >= 8 &&
      tokens[1].value === 'addAction' &&
      tokens[2].value === 'with' &&
      tokens[3].value === 'event' &&
      tokens[4].type === 'STRING' &&
      tokens[5].value === 'and' &&
      tokens[6].value === 'action' &&
      tokens[7].type === 'IDENTIFIER';

    if (tokens.length >= 2 && tokens[1].value === 'addAction') {
      console.log('Checking isNewEventListener:', {
        line: tokens.map((t) => t.value).join(' '),
        length: tokens.length,
        tokens: tokens.map((t) => ({ value: t.value, type: t.type })),
        result,
      });
    }

    return result;
  }

  private handleEventListener(tokens: Token[]) {
    // "instanceName addAction with when eventType action <action>"
    if (tokens.length < 7) {
      throw new Error('Invalid event listener syntax');
    }

    const instanceName = tokens[0].value;
    const eventType = tokens[4].value;
    const actionBlock = tokens[6].value;

    // Extract action from action block <...>
    const action = actionBlock.slice(1, -1).trim();

    // Validate event type
    const validEventTypes = ['click', 'change', 'input', 'submit'];
    if (!validEventTypes.includes(eventType)) {
      throw new Error(
        `Invalid event type: ${eventType}. Must be one of: ${validEventTypes.join(', ')}`,
      );
    }

    const eventListener: ObjaxEventListener = {
      instanceName,
      eventType: eventType as 'click' | 'change' | 'input' | 'submit',
      action,
    };

    this.eventListeners.push(eventListener);
  }

  private handleNewEventListener(tokens: Token[]) {
    // "instanceName addAction with event \"eventType\" and action blockName"
    console.log(
      'handleNewEventListener called with tokens:',
      tokens.map((t) => t.value),
    );

    if (tokens.length < 8) {
      throw new Error('Invalid new event listener syntax');
    }

    const instanceName = tokens[0].value;
    const eventType = this.extractStringValue(tokens[4]);
    const blockName = tokens[7].value;

    console.log('Parsed event listener:', {
      instanceName,
      eventType,
      blockName,
    });

    // Validate event type
    const validEventTypes = ['click', 'change', 'input', 'submit'];
    if (!validEventTypes.includes(eventType)) {
      throw new Error(
        `Invalid event type: ${eventType}. Must be one of: ${validEventTypes.join(', ')}`,
      );
    }

    // The action will be resolved from the block name during execution
    const eventListener: ObjaxEventListener = {
      instanceName,
      eventType: eventType as 'click' | 'change' | 'input' | 'submit',
      action: `@block:${blockName}`, // Mark as block reference
    };

    console.log('Adding event listener:', eventListener);
    this.eventListeners.push(eventListener);
  }

  private isCreateMethod(tokens: Token[]): boolean {
    // "create with ..." or "ClassName create with ..."
    if (
      tokens.length >= 3 &&
      tokens[0].value === 'create' &&
      tokens[1].value === 'with'
    ) {
      return true;
    }
    // Check for "ClassName create with ..." pattern
    if (
      tokens.length >= 4 &&
      tokens[1].value === 'create' &&
      tokens[2].value === 'with'
    ) {
      return true;
    }
    return false;
  }

  private handleCreateMethod(tokens: Token[]) {
    let className: string | null = null;
    let startIndex = 0;

    // Check if class name is specified
    if (tokens[0].value !== 'create') {
      className = tokens[0].value;
      startIndex = 1;
    }

    // Validate syntax
    if (
      tokens[startIndex].value !== 'create' ||
      tokens[startIndex + 1].value !== 'with'
    ) {
      throw new Error('Invalid create syntax');
    }

    // If no class name specified, try to use the last defined class
    if (!className) {
      if (this.currentClass) {
        className = this.currentClass.name;
      } else if (this.classes.length > 0) {
        className = this.classes[this.classes.length - 1].name;
      } else {
        throw new Error(
          'No class specified for create method and no class defined',
        );
      }
    }

    // Extract keyword parameters
    const keywordParameters: Record<string, any> = {};
    let currentIndex = startIndex + 2; // Skip 'create' and 'with'

    while (currentIndex < tokens.length - 1) {
      const keyToken = tokens[currentIndex];
      const valueToken = tokens[currentIndex + 1];

      if (!keyToken || !valueToken) break;

      // Extract key (remove quotes if it's a string)
      const key =
        keyToken.type === 'STRING'
          ? this.extractStringValue(keyToken)
          : keyToken.value;
      const value = this.parseValue(valueToken);

      keywordParameters[key] = value;
      currentIndex += 2;

      // Skip 'and' if it exists
      if (
        currentIndex < tokens.length &&
        tokens[currentIndex].value === 'and'
      ) {
        currentIndex++;
      } else {
        break; // No more keyword arguments
      }
    }

    // Add as a special method call that will be handled by executor
    const methodCall: ObjaxMethodCall = {
      methodName: 'create',
      instanceName: className,
      keywordParameters:
        Object.keys(keywordParameters).length > 0
          ? keywordParameters
          : undefined,
    };

    this.methodCalls.push(methodCall);
  }

  private isBlockAssignment(tokens: Token[]): boolean {
    // "blockName is <block body>" or "blockName is (block body)" or "blockName is {block body}"
    return (
      tokens.length >= 3 &&
      tokens[1].value === 'is' &&
      (tokens[2].type === 'ACTIONBLOCK' ||
        tokens[2].type === 'BLOCK' ||
        tokens[2].type === 'CODEBLOCK')
    );
  }

  private handleBlockAssignment(tokens: Token[]) {
    // "blockName is <block body>" or "blockName is (block body)" or "blockName is {block body}"
    if (tokens.length < 3) {
      throw new Error('Invalid block assignment syntax');
    }

    const blockName = tokens[0].value;
    const blockValue = tokens[2].value;

    // Extract block body (remove delimiters: <>, (), or {})
    const blockBody = blockValue.slice(1, -1).trim();

    // Parse parameters if 'with' keyword is present
    let parameters: string[] | undefined = undefined;
    if (tokens.length > 3 && tokens[3].value === 'with') {
      parameters = [];
      for (let i = 4; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.value !== 'and') {
          parameters.push(token.value);
        }
      }
    }

    const blockAssignment: ObjaxBlockAssignment = {
      blockName,
      blockBody,
      parameters,
    };

    this.blockAssignments.push(blockAssignment);
  }

  private isBecomesAssignment(tokens: Token[]): boolean {
    // "target becomes expression"
    return tokens.length >= 3 && tokens[1].value === 'becomes';
  }

  private handleBecomesAssignment(tokens: Token[]) {
    // "target becomes expression"
    if (tokens.length < 3) {
      throw new Error('Invalid becomes assignment syntax');
    }

    // Parse target (can be instance.field or variableName)
    const targetToken = tokens[0];
    let target: ObjaxBecomesAssignment['target'];

    if (targetToken.value.includes('.')) {
      // Field assignment: "box.width becomes expression"
      const [instanceName, fieldName] = targetToken.value.split('.');
      target = {
        type: 'field',
        instanceName,
        fieldName,
      };
    } else {
      // Variable assignment: "variableName becomes expression"
      target = {
        type: 'variable',
        variableName: targetToken.value,
      };
    }

    // Parse expression (everything after "becomes")
    const expressionTokens = tokens.slice(2);
    const expression = this.parseExpression(expressionTokens);

    const becomesAssignment: ObjaxBecomesAssignment = {
      target,
      expression,
    };

    this.becomesAssignments.push(becomesAssignment);
  }

  private parseExpression(tokens: Token[]): ObjaxExpression {
    if (tokens.length === 1) {
      // Single token: literal, field access, or variable
      const token = tokens[0];

      if (token.value.includes('.')) {
        // Field access: "box.width"
        const [instanceName, fieldName] = token.value.split('.');
        return {
          type: 'field',
          instanceName,
          fieldName,
        };
      }

      // Check if it's a number
      const numValue = Number(token.value);
      if (!isNaN(numValue)) {
        return {
          type: 'literal',
          value: numValue,
        };
      }

      // Check if it's a string (quoted)
      if (token.type === 'STRING') {
        return {
          type: 'literal',
          value: this.extractStringValue(token),
        };
      }

      // Otherwise it's a variable
      return {
        type: 'variable',
        variableName: token.value,
      };
    }

    // Multi-token: binary expression
    // Find operator (+ - have lower precedence than * /)
    let operatorIndex = -1;

    // First pass: find + or - (lower precedence, so process last)
    for (let i = tokens.length - 2; i >= 1; i--) {
      if (tokens[i].value === '+' || tokens[i].value === '-') {
        operatorIndex = i;
        break;
      }
    }

    // Second pass: find * or / (higher precedence) if no + or - found
    if (operatorIndex === -1) {
      for (let i = tokens.length - 2; i >= 1; i--) {
        if (tokens[i].value === '*' || tokens[i].value === '/') {
          operatorIndex = i;
          break;
        }
      }
    }

    if (operatorIndex === -1) {
      throw new Error('Invalid expression: no operator found');
    }

    const leftTokens = tokens.slice(0, operatorIndex);
    const operator = tokens[operatorIndex].value as '+' | '-' | '*' | '/';
    const rightTokens = tokens.slice(operatorIndex + 1);

    return {
      type: 'binary',
      operator,
      left: this.parseExpression(leftTokens),
      right: this.parseExpression(rightTokens),
    };
  }

  private isBlockCall(tokens: Token[]): boolean {
    // "blockName call" or "blockName call with param1 value1 and param2 value2"
    if (tokens.length >= 2 && tokens[1].value === 'call') {
      return true;
    }
    return false;
  }

  private handleBlockCall(tokens: Token[]) {
    // "blockName call" or "blockName call with param1 value1 and param2 value2"
    if (tokens.length < 2) {
      throw new Error('Invalid block call syntax');
    }

    const blockName = tokens[0].value;
    let blockArguments: Record<string, any> | undefined = undefined;

    // Parse arguments if 'with' keyword is present
    if (tokens.length > 2 && tokens[2].value === 'with') {
      blockArguments = {};
      let i = 3;
      while (i < tokens.length) {
        if (i + 1 < tokens.length && tokens[i + 1].value !== 'and') {
          const paramName = tokens[i].value;
          const paramValue = this.parseValue(tokens[i + 1]);
          blockArguments[paramName] = paramValue;
          i += 2;
        } else {
          i++;
        }
        // Skip 'and' tokens
        if (i < tokens.length && tokens[i].value === 'and') {
          i++;
        }
      }
    }

    const blockCall: ObjaxBlockCall = {
      blockName,
      arguments: blockArguments,
    };

    this.blockCalls.push(blockCall);
  }

  private isTimerOperation(tokens: Token[]): boolean {
    // "instanceName repeat with time 1000 and action <action>"
    return (
      tokens.length >= 7 &&
      tokens[1].value === 'repeat' &&
      tokens[2].value === 'with' &&
      tokens[3].value === 'time' &&
      tokens[5].value === 'and' &&
      tokens[6].value === 'action' &&
      tokens[7].type === 'ACTIONBLOCK'
    );
  }

  private handleTimerOperation(tokens: Token[]) {
    // "instanceName repeat with time 1000 and action <action>"
    if (tokens.length < 8) {
      throw new Error('Invalid timer operation syntax');
    }

    const instanceName = tokens[0].value;
    const timeValue = this.parseValue(tokens[4]);
    const actionBlock = tokens[7].value;

    // Extract action from action block <...>
    const action = actionBlock.slice(1, -1).trim();

    // Validate time value is a number
    if (typeof timeValue !== 'number') {
      throw new Error(`Invalid time value: ${timeValue}. Must be a number`);
    }

    const timerOperation: ObjaxTimerOperation = {
      instanceName,
      time: timeValue,
      action,
    };

    this.timerOperations.push(timerOperation);
  }

  private isConditionalBlock(tokens: Token[]): boolean {
    // "blockName is <field.value equal \"value\">"
    if (
      tokens.length >= 3 &&
      tokens[1].value === 'is' &&
      tokens[2].type === 'ACTIONBLOCK'
    ) {
      return true;
    }
    return false;
  }

  private handleConditionalBlock(tokens: Token[]) {
    const blockName = tokens[0].value;
    const conditionBlock = tokens[2].value; // <field.value equal "value">

    // Remove < and > from condition block
    const conditionString = conditionBlock.slice(1, -1); // field.value equal "value"

    const condition = this.parseCondition(conditionString);

    const conditionalBlock: ObjaxConditionalBlock = {
      blockName,
      condition,
    };

    this.conditionalBlocks.push(conditionalBlock);
  }

  private isConditionalExecution(tokens: Token[]): boolean {
    // "blockName thenDo with action <action>"
    if (
      tokens.length >= 5 &&
      tokens[1].value === 'thenDo' &&
      tokens[2].value === 'with' &&
      tokens[3].value === 'action' &&
      tokens[4].type === 'ACTIONBLOCK'
    ) {
      return true;
    }
    return false;
  }

  private handleConditionalExecution(tokens: Token[]) {
    const blockName = tokens[0].value;
    const actionBlock = tokens[4].value; // <action>

    // Remove < and > from action block
    const action = actionBlock.slice(1, -1);

    const conditionalExecution: ObjaxConditionalExecution = {
      blockName,
      action,
    };

    this.conditionalExecutions.push(conditionalExecution);
  }

  private isConditionalOtherwiseExecution(tokens: Token[]): boolean {
    // "blockName otherwiseDo with action <action>"
    if (
      tokens.length >= 5 &&
      tokens[1].value === 'otherwiseDo' &&
      tokens[2].value === 'with' &&
      tokens[3].value === 'action' &&
      tokens[4].type === 'ACTIONBLOCK'
    ) {
      return true;
    }
    return false;
  }

  private handleConditionalOtherwiseExecution(tokens: Token[]) {
    const blockName = tokens[0].value;
    const actionBlock = tokens[4].value; // <action>

    // Remove < and > from action block
    const otherwiseAction = actionBlock.slice(1, -1);

    const conditionalOtherwiseExecution: ObjaxConditionalOtherwiseExecution = {
      blockName,
      otherwiseAction,
    };

    this.conditionalOtherwiseExecutions.push(conditionalOtherwiseExecution);
  }

  private parseCondition(conditionString: string): ObjaxCondition {
    // Parse "field.value equal \"value\""
    const tokens = this.tokenize(conditionString);

    if (tokens.length >= 3) {
      let left: ObjaxExpression;
      let operator: string;
      let right: ObjaxExpression;

      // Handle field access: "instance.field"
      if (tokens[0].value.includes('.')) {
        const parts = tokens[0].value.split('.');
        left = {
          type: 'field',
          instanceName: parts[0],
          fieldName: parts[1],
        };
      } else {
        left = {
          type: 'literal',
          value: tokens[0].value,
        };
      }

      operator = tokens[1].value; // equal, not_equal, etc.

      // Handle right side (usually a string or number)
      if (tokens[2].type === 'STRING') {
        right = {
          type: 'literal',
          value: tokens[2].value.slice(1, -1), // Remove quotes
        };
      } else if (tokens[2].type === 'NUMBER') {
        right = {
          type: 'literal',
          value: parseFloat(tokens[2].value),
        };
      } else {
        right = {
          type: 'literal',
          value: tokens[2].value,
        };
      }

      return {
        type: 'comparison',
        left,
        operator: operator as
          | 'equal'
          | 'not_equal'
          | 'greater'
          | 'less'
          | 'greater_equal'
          | 'less_equal',
        right,
      };
    }

    throw new Error(`Invalid condition syntax: ${conditionString}`);
  }
}
