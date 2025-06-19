import { objaxLexer } from './lexer';
import { objaxParser } from './parser';
import type {
  ObjaxClassDefinition,
  ObjaxExecutionResult,
  ObjaxFieldDefinition,
  ObjaxMethodDefinition,
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
          const methods: ObjaxMethodDefinition[] = [];

          if (classDef.children.classBody) {
            for (const body of classDef.children.classBody) {
              if (body.children.fieldDeclaration) {
                const fieldDecl = body.children.fieldDeclaration[0];
                const fieldName = fieldDecl.children.fieldName[0].image.slice(
                  1,
                  -1,
                ); // Remove quotes

                let defaultValue: any = undefined;
                
                if (fieldDecl.children.defaultValue) {
                  const defaultValueNode = fieldDecl.children.defaultValue[0];
                  if (defaultValueNode.children.StringLiteral) {
                    defaultValue = defaultValueNode.children.StringLiteral[0].image.slice(1, -1);
                  } else if (defaultValueNode.children.True) {
                    defaultValue = true;
                  } else if (defaultValueNode.children.False) {
                    defaultValue = false;
                  }
                }

                fields.push({
                  name: fieldName,
                  defaultValue,
                });
              } else if (body.children.methodDeclaration) {
                const methodDecl = body.children.methodDeclaration[0];
                const methodName = methodDecl.children.methodName[0].image.slice(1, -1); // Remove quotes
                
                // Extract method body tokens as string
                let methodBody = '';
                if (methodDecl.children.body && methodDecl.children.body[0].children) {
                  const bodyTokens: string[] = [];
                  
                  const extractTokensFromNode = (node: any) => {
                    if (node && node.children) {
                      for (const [key, value] of Object.entries(node.children)) {
                        if (Array.isArray(value)) {
                          for (const item of value) {
                            if (item.image) {
                              bodyTokens.push(item.image);
                            } else {
                              extractTokensFromNode(item);
                            }
                          }
                        }
                      }
                    }
                  };
                  
                  extractTokensFromNode(methodDecl.children.body[0]);
                  methodBody = bodyTokens.join(' ');
                }

                methods.push({
                  name: methodName,
                  parameters: [],
                  body: methodBody,
                });
              }
            }
          }

          classes.push({
            name: className,
            fields,
            methods,
          });
        }
      }
    }

    return classes;
  }
}
