import { LinearObjaxParser } from './linearParser';
import type { ObjaxExecutionResult } from './types';

export class ObjaxEngine {
  private parser: LinearObjaxParser;

  constructor() {
    this.parser = new LinearObjaxParser();
  }

  execute(code: string): ObjaxExecutionResult {
    return this.parser.parse(code);
  }
}
