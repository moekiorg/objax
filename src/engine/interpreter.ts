import { objaxLexer } from './lexer';
import { objaxParser } from './parser';
import type {
  ObjaxClassDefinition,
  ObjaxExecutionResult,
  ObjaxFieldDefinition,
} from './types';

export class ObjaxInterpreter {
  execute(code: string): ObjaxExecutionResult {
    const result: ObjaxExecutionResult = {
      classes: [],
      instances: [],
      errors: [],
    };

    try {
      const lexingResult = objaxLexer.tokenize(code);

      if (lexingResult.errors.length > 0) {
        result.errors.push(...lexingResult.errors.map((e) => e.message));
        return result;
      }

      objaxParser.input = lexingResult.tokens;
      const cst = objaxParser.program();

      if (objaxParser.errors.length > 0) {
        result.errors.push(...objaxParser.errors.map((e) => e.message));
        return result;
      }

      result.classes = this.extractClasses(cst);
    } catch (error) {
      result.errors.push(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }

    return result;
  }

  private extractClasses(cst: any): ObjaxClassDefinition[] {
    const classes: ObjaxClassDefinition[] = [];

    if (cst.children.statement) {
      for (const statement of cst.children.statement) {
        if (statement.children.classDefinition) {
          const classDef = statement.children.classDefinition[0];
          const className = classDef.children.className[0].image;

          const fields: ObjaxFieldDefinition[] = [];

          if (classDef.children.classBody) {
            for (const body of classDef.children.classBody) {
              if (body.children.fieldDeclaration) {
                const fieldDecl = body.children.fieldDeclaration[0];
                const fieldName = fieldDecl.children.fieldName[0].image.slice(
                  1,
                  -1,
                ); // Remove quotes

                fields.push({
                  name: fieldName,
                  defaultValue: undefined, // TODO: Extract default value
                });
              }
            }
          }

          classes.push({
            name: className,
            fields,
            methods: [],
          });
        }
      }
    }

    return classes;
  }
}
