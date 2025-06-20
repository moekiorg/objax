export interface ObjaxExecutionResult {
  classes: ObjaxClassDefinition[];
  instances: ObjaxInstanceDefinition[];
  methodCalls: ObjaxMethodCall[];
  stateOperations: ObjaxStateOperation[];
  stateRetrievals: ObjaxStateRetrieval[];
  pageNavigations: ObjaxPageNavigation[];
  listOperations: ObjaxListOperation[];
  variableAssignments: ObjaxVariableAssignment[];
  connections: ObjaxConnection[];
  morphOperations: ObjaxMorphOperation[];
  printStatements: ObjaxPrintStatement[];
  messageExecutions: ObjaxMessageExecution[];
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
}

export interface ObjaxInstanceDefinition {
  name: string;
  className: string;
  properties: Record<string, any>;
}

export interface ObjaxMethodCall {
  methodName: string;
  instanceName: string;
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
  context: 'self'; // selfコンテキストでの実行
}
