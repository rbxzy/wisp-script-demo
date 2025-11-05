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
  
  // Operators
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  MULTIPLY = 'MULTIPLY',
  DIVIDE = 'DIVIDE',
  
  // Symbols
  EQUAL = 'EQUAL',
  PLUS_EQUAL = 'PLUS_EQUAL',
  MINUS_EQUAL = 'MINUS_EQUAL',
  PLUS_PLUS = 'PLUS_PLUS',
  MINUS_MINUS = 'MINUS_MINUS',
  LEFT_PAREN = 'LEFT_PAREN',
  RIGHT_PAREN = 'RIGHT_PAREN',
  COMMA = 'COMMA',
  DOT = 'DOT',
  
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