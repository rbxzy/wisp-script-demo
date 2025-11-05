import { Token, TokenType } from './tokens';
import { 
  Expr, Stmt, Binary, Unary, Literal, Variable, Call, Get, Assign, Set,
  Var, Expression, Print, Function, Return
} from './ast';

export class Parser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): Stmt[] {
    const statements: Stmt[] = [];
    while (!this.isAtEnd()) {
      const stmt = this.declaration();
      if (stmt) statements.push(stmt);
    }
    return statements;
  }

  private declaration(): Stmt | null {
    try {
      if (this.match(TokenType.FUNC)) return this.functionDeclaration();
      if (this.match(TokenType.VAR)) return this.varDeclaration();
      return this.statement();
    } catch (error) {
      this.synchronize();
      throw error;
    }
  }

  private functionDeclaration(): Stmt {
    const name = this.consume(TokenType.IDENTIFIER, "Expect function name.");
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after function name.");
    
    const parameters: Token[] = [];
    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        parameters.push(this.consume(TokenType.IDENTIFIER, "Expect parameter name."));
      } while (this.match(TokenType.COMMA));
    }
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after parameters.");
    
    // Parse function body until 'end'
    const body: Stmt[] = [];
    while (!this.check(TokenType.END) && !this.isAtEnd()) {
      const stmt = this.declaration();
      if (stmt) body.push(stmt);
    }
    this.consume(TokenType.END, "Expect 'end' after function body.");
    
    return new Function(name, parameters, body);
  }

  private varDeclaration(): Stmt {
    const name = this.consume(TokenType.IDENTIFIER, "Expect variable name.");
    
    const initializer = this.match(TokenType.EQUAL) 
      ? this.expression() 
      : new Literal(null);

    return new Var(name, initializer);
  }

  private statement(): Stmt {
    if (this.match(TokenType.PRINT)) return this.printStatement();
    if (this.match(TokenType.RETURN)) return this.returnStatement();
    return this.expressionStatement();
  }

  private printStatement(): Stmt {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'print'.");
    const value = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after value.");
    return new Print(value);
  }

  private returnStatement(): Stmt {
    const keyword = this.previous();
    let value: Expr | null = null;
    if (!this.check(TokenType.END)) {
      value = this.expression();
    }
    return new Return(keyword, value);
  }

  private expressionStatement(): Stmt {
    const expr = this.expression();
    return new Expression(expr);
  }

  private expression(): Expr {
    return this.assignment();
  }

  private assignment(): Expr {
    const expr = this.addition();

    if (this.match(TokenType.EQUAL)) {
      const value = this.assignment();

      if (expr instanceof Variable) {
        return new Assign(expr.name, value);
      } else if (expr instanceof Get) {
        return new Set(expr.object, expr.name, value);
      }

      throw new Error('Invalid assignment target.');
    } else if (this.match(TokenType.PLUS_EQUAL)) {
      const value = this.assignment();
      
      if (expr instanceof Variable) {
        return new Assign(expr.name, new Binary(expr, { type: TokenType.PLUS, lexeme: '+', literal: null, line: 0 }, value));
      } else if (expr instanceof Get) {
        return new Set(expr.object, expr.name, new Binary(expr, { type: TokenType.PLUS, lexeme: '+', literal: null, line: 0 }, value));
      }

      throw new Error('Invalid assignment target.');
    } else if (this.match(TokenType.MINUS_EQUAL)) {
      const value = this.assignment();
      
      if (expr instanceof Variable) {
        return new Assign(expr.name, new Binary(expr, { type: TokenType.MINUS, lexeme: '-', literal: null, line: 0 }, value));
      } else if (expr instanceof Get) {
        return new Set(expr.object, expr.name, new Binary(expr, { type: TokenType.MINUS, lexeme: '-', literal: null, line: 0 }, value));
      }

      throw new Error('Invalid assignment target.');
    }

    return expr;
  }

  private addition(): Expr {
    let expr = this.multiplication();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.multiplication();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private multiplication(): Expr {
    let expr = this.unary();

    while (this.match(TokenType.DIVIDE, TokenType.MULTIPLY)) {
      const operator = this.previous();
      const right = this.unary();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private unary(): Expr {
    if (this.match(TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return new Unary(operator, right);
    }

    if (this.match(TokenType.PLUS_PLUS)) {
      const right = this.unary();
      if (right instanceof Variable) {
        return new Assign(right.name, new Binary(right, { type: TokenType.PLUS, lexeme: '+', literal: null, line: 0 }, new Literal(1)));
      }
      throw new Error('Invalid increment target.');
    }

    if (this.match(TokenType.MINUS_MINUS)) {
      const right = this.unary();
      if (right instanceof Variable) {
        return new Assign(right.name, new Binary(right, { type: TokenType.MINUS, lexeme: '-', literal: null, line: 0 }, new Literal(1)));
      }
      throw new Error('Invalid decrement target.');
    }

    return this.postfix();
  }

  private postfix(): Expr {
    let expr = this.call();

    if (this.match(TokenType.PLUS_PLUS)) {
      if (expr instanceof Variable) {
        return new Assign(expr.name, new Binary(expr, { type: TokenType.PLUS, lexeme: '+', literal: null, line: 0 }, new Literal(1)));
      }
      throw new Error('Invalid increment target.');
    }

    if (this.match(TokenType.MINUS_MINUS)) {
      if (expr instanceof Variable) {
        return new Assign(expr.name, new Binary(expr, { type: TokenType.MINUS, lexeme: '-', literal: null, line: 0 }, new Literal(1)));
      }
      throw new Error('Invalid decrement target.');
    }

    return expr;
  }

  private call(): Expr {
    let expr = this.primary();

    while (true) {
      if (this.match(TokenType.LEFT_PAREN)) {
        expr = this.finishCall(expr);
      } else if (this.match(TokenType.DOT)) {
        const name = this.consume(TokenType.IDENTIFIER, "Expect property name after '.'.");
        expr = new Get(expr, name);
      } else {
        break;
      }
    }

    return expr;
  }

  private finishCall(callee: Expr): Expr {
    const args: Expr[] = [];

    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        args.push(this.expression());
      } while (this.match(TokenType.COMMA));
    }

    const paren = this.consume(TokenType.RIGHT_PAREN, "Expect ')' after arguments.");
    return new Call(callee, paren, args);
  }

  private primary(): Expr {
    if (this.match(TokenType.NUMBER)) {
      return new Literal(this.previous().literal);
    }

    if (this.match(TokenType.STRING)) {
      return new Literal(this.previous().literal);
    }

    if (this.match(TokenType.TRUE)) {
      return new Literal(true);
    }

    if (this.match(TokenType.FALSE)) {
      return new Literal(false);
    }

    if (this.match(TokenType.IDENTIFIER)) {
      return new Variable(this.previous());
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return expr;
    }

    throw new Error(`Unexpected token: ${this.peek().lexeme}`);
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw new Error(`${message} Got ${this.peek().lexeme}`);
  }

  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.EOF) return;

      switch (this.peek().type) {
        case TokenType.VAR:
        case TokenType.PRINT:
        case TokenType.FUNC:
        case TokenType.RETURN:
          return;
      }

      this.advance();
    }
  }
}