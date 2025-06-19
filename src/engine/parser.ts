import { CstParser } from 'chevrotain';
import {
  allTokens,
  Default,
  Define,
  Do,
  False,
  Field,
  Has,
  Identifier,
  Method,
  Myself,
  Of,
  SetKeyword,
  StringLiteral,
  To,
  True,
} from './lexer';

export class ObjaxParser extends CstParser {
  constructor() {
    super(allTokens);
    this.performSelfAnalysis();
  }

  program = this.RULE('program', () => {
    this.MANY(() => {
      this.SUBRULE(this.statement);
    });
  });

  statement = this.RULE('statement', () => {
    this.OR([{ ALT: () => this.SUBRULE(this.classDefinition) }]);
  });

  classDefinition = this.RULE('classDefinition', () => {
    this.CONSUME(Define);
    this.CONSUME(Identifier, { LABEL: 'className' });
    this.MANY(() => {
      this.SUBRULE(this.classBody);
    });
  });

  classBody = this.RULE('classBody', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.fieldDeclaration) },
      { ALT: () => this.SUBRULE(this.methodDeclaration) },
    ]);
  });

  fieldDeclaration = this.RULE('fieldDeclaration', () => {
    this.CONSUME(Identifier, { LABEL: 'className' });
    this.CONSUME(Has);
    this.CONSUME(Field);
    this.CONSUME(StringLiteral, { LABEL: 'fieldName' });
    this.OPTION(() => {
      this.CONSUME2(Has, { LABEL: 'hasDefault' });
      this.CONSUME(Default);
      this.SUBRULE(this.literal, { LABEL: 'defaultValue' });
    });
  });

  methodDeclaration = this.RULE('methodDeclaration', () => {
    this.CONSUME(Identifier, { LABEL: 'className' });
    this.CONSUME(Has);
    this.CONSUME(Method);
    this.CONSUME(StringLiteral, { LABEL: 'methodName' });
    this.CONSUME(Do);
    this.SUBRULE(this.methodBody, { LABEL: 'body' });
  });

  methodBody = this.RULE('methodBody', () => {
    this.SUBRULE(this.methodStatement);
  });

  methodStatement = this.RULE('methodStatement', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.setStatement) },
      // Add more statement types as needed
    ]);
  });

  setStatement = this.RULE('setStatement', () => {
    this.CONSUME(SetKeyword);
    this.CONSUME(Field);
    this.CONSUME(StringLiteral, { LABEL: 'fieldName' });
    this.CONSUME(Of);
    this.CONSUME(Myself);
    this.CONSUME(To);
    this.SUBRULE(this.literal, { LABEL: 'value' });
  });

  literal = this.RULE('literal', () => {
    this.OR([
      { ALT: () => this.CONSUME(StringLiteral) },
      { ALT: () => this.CONSUME(True) },
      { ALT: () => this.CONSUME(False) },
      // Add more literal types as needed
    ]);
  });
}

export const objaxParser = new ObjaxParser();
