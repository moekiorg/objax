import { ObjaxInterpreter } from './interpreter';
import type { ObjaxExecutionResult } from './types';

export class ObjaxEngine {
  private interpreter: ObjaxInterpreter;

  constructor() {
    this.interpreter = new ObjaxInterpreter();
  }

  execute(code: string): ObjaxExecutionResult {
    return this.interpreter.execute(code);
  }
}
