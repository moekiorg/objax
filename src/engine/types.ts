export interface ObjaxExecutionResult {
  classes: ObjaxClassDefinition[];
  instances: ObjaxInstanceDefinition[];
  methodCalls: ObjaxMethodCall[];
  stateOperations: ObjaxStateOperation[];
  stateRetrievals: ObjaxStateRetrieval[];
  pageNavigations: ObjaxPageNavigation[];
  listOperations: ObjaxListOperation[];
  variableAssignments: ObjaxVariableAssignment[];
  fieldAssignments: ObjaxFieldAssignment[];
  connections: ObjaxConnection[];
  morphOperations: ObjaxMorphOperation[];
  printStatements: ObjaxPrintStatement[];
  messageExecutions: ObjaxMessageExecution[];
  instanceConfigurations: ObjaxInstanceConfiguration[];
  eventListeners: ObjaxEventListener[];
  blockAssignments: ObjaxBlockAssignment[];
  blockCalls: ObjaxBlockCall[];
  becomesAssignments: ObjaxBecomesAssignment[];
  timerOperations: ObjaxTimerOperation[];
  conditionalBlocks: ObjaxConditionalBlock[];
  conditionalExecutions: ObjaxConditionalExecution[];
  conditionalOtherwiseExecutions: ObjaxConditionalOtherwiseExecution[];
  errors: string[];
}

export interface ObjaxClassDefinition {
  name: string;
  fields: ObjaxFieldDefinition[];
  methods: ObjaxMethodDefinition[];
}

export interface ObjaxFieldDefinition {
  name: string;
  defaultValue?: any;
}

export interface ObjaxMethodDefinition {
  name: string;
  parameters: string[];
  body: string;
  block?: ObjaxBlock;
}

export interface ObjaxInstanceDefinition {
  name: string;
  className: string;
  properties: Record<string, any>;
}

export interface ObjaxMethodCall {
  methodName: string;
  instanceName: string;
  keywordParameters?: Record<string, any>;
  parameters?: any[];
}

export interface ObjaxStateOperation {
  stateName: string;
  value: any;
}

export interface ObjaxStateRetrieval {
  stateName: string;
}

export interface ObjaxPageNavigation {
  pageName: string;
}

export interface ObjaxListOperation {
  operation: 'add' | 'remove' | 'set';
  item: string | number | boolean;
  listField: string;
  targetInstance: string;
}

export interface ObjaxVariableAssignment {
  variableName: string;
  value: any;
  type: 'instance' | 'primitive';
}

export interface ObjaxFieldAssignment {
  instanceName: string;
  fieldName: string;
  values: any[];
  expression?: ObjaxExpression;
}

export interface ObjaxConnection {
  sourceInstance: string;
  targetInstance: string;
}

export interface ObjaxMorphOperation {
  operation: 'add' | 'remove';
  childInstance: string;
  parentInstance: string;
}

export interface ObjaxPrintStatement {
  message: string;
  timestamp?: string;
}

export interface ObjaxMessageExecution {
  targetInstance: string;
  code: string;
  context: 'it'; // itコンテキストでの実行
}

export interface ObjaxInstanceConfiguration {
  instanceName: string;
  configurationType: 'field' | 'dataSource' | 'viewMode';
  value: string | string[];
}

export interface ObjaxEventListener {
  instanceName: string;
  eventType: 'click' | 'change' | 'input' | 'submit';
  action: string;
}

export interface ObjaxBlockAssignment {
  blockName: string;
  blockBody: string;
  parameters?: string[];
}

export interface ObjaxBlockCall {
  blockName: string;
  arguments?: Record<string, any>;
}

export interface ObjaxBlock {
  statements: string[];
}

export interface ObjaxExpression {
  type: 'binary' | 'field' | 'literal' | 'variable' | 'comparison';
  operator?: '+' | '-' | '*' | '/' | 'equal' | 'not_equal' | 'greater' | 'less' | 'greater_equal' | 'less_equal';
  left?: ObjaxExpression;
  right?: ObjaxExpression;
  instanceName?: string;
  fieldName?: string;
  value?: any;
  variableName?: string;
}

export interface ObjaxBecomesAssignment {
  target: {
    type: 'field' | 'variable';
    instanceName?: string;
    fieldName?: string;
    variableName?: string;
  };
  expression: ObjaxExpression;
}


export interface ObjaxTimerOperation {
  instanceName: string;
  time: number;
  action: string;
}

export interface ObjaxConditionalBlock {
  blockName: string;
  condition: ObjaxCondition;
}

export interface ObjaxConditionalExecution {
  blockName: string;
  action: string;
}

export interface ObjaxConditionalOtherwiseExecution {
  blockName: string;
  otherwiseAction: string;
}

export interface ObjaxCondition {
  type: 'comparison';
  left: ObjaxExpression;
  operator: 'equal' | 'not_equal' | 'greater' | 'less' | 'greater_equal' | 'less_equal';
  right: ObjaxExpression;
}
