export interface ObjaxExecutionResult {
  classes: ObjaxClassDefinition[];
  instances: ObjaxInstanceDefinition[];
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
