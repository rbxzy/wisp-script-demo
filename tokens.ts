export enum TokenType {
  // Literals
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  IDENTIFIER = 'IDENTIFIER',
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  
  // Keywords
  VAR = 'VAR',
  PRINT = 'PRINT',
  FUNC = 'FUNC',
  RETURN = 'RETURN',
  END = 'END',
  IF = 'IF',
  ELSE = 'ELSE',
  ELIF = 'ELIF',
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',
  FOR = 'FOR',
  WHILE = 'WHILE',
  IN = 'IN',
  GLOBAL = 'GLOBAL',
  
  // Operators
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  MULTIPLY = 'MULTIPLY',
  DIVIDE = 'DIVIDE',
  
  // Comparison operators
  GREATER = 'GREATER',
  GREATER_EQUAL = 'GREATER_EQUAL',
  LESS = 'LESS',
  LESS_EQUAL = 'LESS_EQUAL',
  EQUAL_EQUAL = 'EQUAL_EQUAL',
  BANG_EQUAL = 'BANG_EQUAL',
  
  // Symbols
  EQUAL = 'EQUAL',
  PLUS_EQUAL = 'PLUS_EQUAL',
  MINUS_EQUAL = 'MINUS_EQUAL',
  PLUS_PLUS = 'PLUS_PLUS',
  MINUS_MINUS = 'MINUS_MINUS',
  LEFT_PAREN = 'LEFT_PAREN',
  RIGHT_PAREN = 'RIGHT_PAREN',
  LEFT_BRACKET = 'LEFT_BRACKET',
  RIGHT_BRACKET = 'RIGHT_BRACKET',
  LEFT_BRACE = 'LEFT_BRACE',
  RIGHT_BRACE = 'RIGHT_BRACE',
  COMMA = 'COMMA',
  DOT = 'DOT',
  COLON = 'COLON',
  SEMICOLON = 'SEMICOLON',
  
  // End of file
  EOF = 'EOF'
}

export interface Token {
  type: TokenType;
  lexeme: string;
  literal: any;
  line: number;
}

export class TokenImpl implements Token {
  constructor(
    public type: TokenType,
    public lexeme: string,
    public literal: any,
    public line: number
  ) {}

  toString(): string {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }
}