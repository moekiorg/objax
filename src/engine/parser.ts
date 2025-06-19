import { CstParser } from 'chevrotain';
import {
  allTokens,
  Default,
  Define,
  Field,
  Has,
  Identifier,
  StringLiteral,
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
    this.OR([{ ALT: () => this.SUBRULE(this.fieldDeclaration) }]);
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

  literal = this.RULE('literal', () => {
    this.OR([
      { ALT: () => this.CONSUME(StringLiteral) },
      // Add more literal types as needed
    ]);
  });
}

export const objaxParser = new ObjaxParser();
