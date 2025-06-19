import { createToken, Lexer } from 'chevrotain';

export const Define = createToken({ name: 'Define', pattern: /define/ });
export const Has = createToken({ name: 'Has', pattern: /has/ });
export const Field = createToken({ name: 'Field', pattern: /field/ });
export const Method = createToken({ name: 'Method', pattern: /method/ });
export const Default = createToken({ name: 'Default', pattern: /default/ });
export const With = createToken({ name: 'With', pattern: /with/ });
export const Do = createToken({ name: 'Do', pattern: /do/ });
export const Is = createToken({ name: 'Is', pattern: /is/ });
export const A = createToken({ name: 'A', pattern: /a/ });
export const New = createToken({ name: 'New', pattern: /new/ });

export const Identifier = createToken({
  name: 'Identifier',
  pattern: /[a-zA-Z_][a-zA-Z0-9_]*/,
});
export const StringLiteral = createToken({
  name: 'StringLiteral',
  pattern: /"[^"]*"/,
});
export const NumberLiteral = createToken({
  name: 'NumberLiteral',
  pattern: /\d+(\.\d+)?/,
});
export const BooleanLiteral = createToken({
  name: 'BooleanLiteral',
  pattern: /true|false/,
});

export const WhiteSpace = createToken({
  name: 'WhiteSpace',
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});

export const Comment = createToken({
  name: 'Comment',
  pattern: /\/\/[^\n\r]*/,
  group: Lexer.SKIPPED,
});

export const allTokens = [
  WhiteSpace,
  Comment,
  Define,
  Has,
  Field,
  Method,
  Default,
  With,
  Do,
  Is,
  A,
  New,
  BooleanLiteral,
  NumberLiteral,
  StringLiteral,
  Identifier,
];

export const objaxLexer = new Lexer(allTokens);
