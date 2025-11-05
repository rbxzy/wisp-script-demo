import { Token, TokenType } from './tokens';
import { 
  Expr, Stmt, Binary, Unary, Literal, Variable, Call, Get, Assign, Set, Logical,
  Var, Expression, Print, Function, Return, If, While, For, ForIn
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
      // Check if this is a global declaration (global func or global var)
      if (this.check(TokenType.GLOBAL)) {
        const checkpoint = this.current;
        this.advance(); // consume 'global'
        
        if (this.check(TokenType.FUNC)) {
          this.advance(); // consume 'func'
          return this.functionDeclaration(true);
        }
        
        if (this.check(TokenType.VAR)) {
          this.advance(); // consume 'var'
          return this.varDeclaration(true);
        }
        
        // Not a global declaration, reset and continue
        this.current = checkpoint;
      }
      
      if (this.match(TokenType.FUNC)) return this.functionDeclaration(false);
      if (this.match(TokenType.VAR)) return this.varDeclaration(false);
      return this.statement();
    } catch (error) {
      this.synchronize();
      throw error;
    }
  }

  private functionDeclaration(isGlobal: boolean = false): Stmt {
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
    
    const func = new Function(name, parameters, body);
    // Mark as global by storing it in a property (we'll add this to the AST)
    (func as any).isGlobal = isGlobal;
    return func;
  }

  private varDeclaration(isGlobal: boolean = false): Stmt {
    const name = this.consume(TokenType.IDENTIFIER, "Expect variable name.");
    
    const initializer = this.match(TokenType.EQUAL) 
      ? this.expression() 
      : new Literal(null);

    const varStmt = new Var(name, initializer);
    // Mark as global
    (varStmt as any).isGlobal = isGlobal;
    return varStmt;
  }

  private statement(): Stmt {
    if (this.match(TokenType.PRINT)) return this.printStatement();
    if (this.match(TokenType.RETURN)) return this.returnStatement();
    if (this.match(TokenType.IF)) return this.ifStatement();
    if (this.match(TokenType.WHILE)) return this.whileStatement();
    if (this.match(TokenType.FOR)) return this.forStatement();
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

  private ifStatement(): Stmt {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'if'.");
    const condition = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after if condition.");

    // Parse then branch
    const thenBranch: Stmt[] = [];
    while (!this.check(TokenType.ELIF) && !this.check(TokenType.ELSE) && !this.check(TokenType.END) && !this.isAtEnd()) {
      const stmt = this.declaration();
      if (stmt) thenBranch.push(stmt);
    }

    // Parse elif branches
    const elseifBranches: { condition: Expr; body: Stmt[] }[] = [];
    while (this.match(TokenType.ELIF)) {
      this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'elif'.");
      const elseifCondition = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after elif condition.");
      
      const elseifBody: Stmt[] = [];
      while (!this.check(TokenType.ELIF) && !this.check(TokenType.ELSE) && !this.check(TokenType.END) && !this.isAtEnd()) {
        const stmt = this.declaration();
        if (stmt) elseifBody.push(stmt);
      }
      elseifBranches.push({ condition: elseifCondition, body: elseifBody });
    }

    // Parse else branch
    let elseBranch: Stmt[] | null = null;
    if (this.match(TokenType.ELSE)) {
      elseBranch = [];
      while (!this.check(TokenType.END) && !this.isAtEnd()) {
        const stmt = this.declaration();
        if (stmt) elseBranch.push(stmt);
      }
    }

    this.consume(TokenType.END, "Expect 'end' after if statement.");
    return new If(condition, thenBranch, elseifBranches, elseBranch);
  }

  private whileStatement(): Stmt {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'while'.");
    const condition = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after while condition.");

    const body: Stmt[] = [];
    while (!this.check(TokenType.END) && !this.isAtEnd()) {
      const stmt = this.declaration();
      if (stmt) body.push(stmt);
    }

    this.consume(TokenType.END, "Expect 'end' after while body.");
    return new While(condition, body);
  }

  private forStatement(): Stmt {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'for'.");

    // Check if this is a for-in loop by looking ahead
    // for (i, item in items) or for (item in items)
    const checkpoint = this.current;
    const firstToken = this.advance();
    
    // Check if next is comma (index, item pattern) or IN
    if (this.check(TokenType.COMMA)) {
      // for (i, item in items)
      this.advance(); // consume comma
      const itemVar = this.consume(TokenType.IDENTIFIER, "Expect item variable name.");
      this.consume(TokenType.IN, "Expect 'in' after variables.");
      const iterable = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after for-in.");
      
      const body: Stmt[] = [];
      while (!this.check(TokenType.END) && !this.isAtEnd()) {
        const stmt = this.declaration();
        if (stmt) body.push(stmt);
      }
      
      this.consume(TokenType.END, "Expect 'end' after for body.");
      return new ForIn(firstToken, itemVar, iterable, body);
    } else if (this.check(TokenType.IN)) {
      // for (item in items) - no index
      this.advance(); // consume 'in'
      const iterable = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after for-in.");
      
      const body: Stmt[] = [];
      while (!this.check(TokenType.END) && !this.isAtEnd()) {
        const stmt = this.declaration();
        if (stmt) body.push(stmt);
      }
      
      this.consume(TokenType.END, "Expect 'end' after for body.");
      // Use dummy token for index since we don't need it
      const dummyIndex = { type: TokenType.IDENTIFIER, lexeme: '_', literal: null, line: 0 } as Token;
      return new ForIn(dummyIndex, firstToken, iterable, body);
    }
    
    // Otherwise, it's a C-style for loop, reset and parse normally
    this.current = checkpoint;

    // Parse initializer
    let initializer: Stmt | null = null;
    if (!this.check(TokenType.SEMICOLON)) {
      if (this.match(TokenType.VAR)) {
        initializer = this.varDeclaration();
      } else {
        initializer = this.expressionStatement();
      }
    }
    this.consume(TokenType.SEMICOLON, "Expect ';' after for loop initializer.");

    // Parse condition
    let condition: Expr | null = null;
    if (!this.check(TokenType.SEMICOLON)) {
      condition = this.expression();
    }
    this.consume(TokenType.SEMICOLON, "Expect ';' after for loop condition.");

    // Parse increment
    let increment: Expr | null = null;
    if (!this.check(TokenType.RIGHT_PAREN)) {
      increment = this.expression();
    }
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after for clauses.");

    // Parse body
    const body: Stmt[] = [];
    while (!this.check(TokenType.END) && !this.isAtEnd()) {
      const stmt = this.declaration();
      if (stmt) body.push(stmt);
    }

    this.consume(TokenType.END, "Expect 'end' after for body.");
    return new For(initializer, condition, increment, body);
  }

  private expressionStatement(): Stmt {
    // Check if this is a global assignment: global name = value
    if (this.check(TokenType.GLOBAL)) {
      const checkpoint = this.current;
      this.advance(); // consume 'global'
      
      if (this.check(TokenType.IDENTIFIER)) {
        const name = this.advance();
        
        if (this.match(TokenType.EQUAL)) {
          // It's a global assignment: global name = value
          const value = this.expression();
          const globalsVar = new Variable({ type: TokenType.IDENTIFIER, lexeme: 'globals', literal: null, line: name.line });
          const setExpr = new Set(globalsVar, name, value);
          return new Expression(setExpr);
        } else if (this.match(TokenType.PLUS_EQUAL)) {
          // global name += value
          const value = this.expression();
          const globalsVar = new Variable({ type: TokenType.IDENTIFIER, lexeme: 'globals', literal: null, line: name.line });
          const getExpr = new Get(globalsVar, name);
          const addExpr = new Binary(getExpr, { type: TokenType.PLUS, lexeme: '+', literal: null, line: name.line }, value);
          const setExpr = new Set(globalsVar, name, addExpr);
          return new Expression(setExpr);
        } else if (this.match(TokenType.MINUS_EQUAL)) {
          // global name -= value
          const value = this.expression();
          const globalsVar = new Variable({ type: TokenType.IDENTIFIER, lexeme: 'globals', literal: null, line: name.line });
          const getExpr = new Get(globalsVar, name);
          const subExpr = new Binary(getExpr, { type: TokenType.MINUS, lexeme: '-', literal: null, line: name.line }, value);
          const setExpr = new Set(globalsVar, name, subExpr);
          return new Expression(setExpr);
        }
      }
      
      // Not a global assignment, reset and parse normally
      this.current = checkpoint;
    }
    
    const expr = this.expression();
    return new Expression(expr);
  }

  private expression(): Expr {
    return this.assignment();
  }

  private assignment(): Expr {
    const expr = this.logicalOr();

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

  private logicalOr(): Expr {
    let expr = this.logicalAnd();

    while (this.match(TokenType.OR)) {
      const operator = this.previous();
      const right = this.logicalAnd();
      expr = new Logical(expr, operator, right);
    }

    return expr;
  }

  private logicalAnd(): Expr {
    let expr = this.logicalNot();

    while (this.match(TokenType.AND)) {
      const operator = this.previous();
      const right = this.logicalNot();
      expr = new Logical(expr, operator, right);
    }

    return expr;
  }

  private logicalNot(): Expr {
    if (this.match(TokenType.NOT)) {
      const operator = this.previous();
      const right = this.logicalNot();
      return new Unary(operator, right);
    }

    return this.comparison();
  }

  private comparison(): Expr {
    let expr = this.addition();

    while (this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL, TokenType.EQUAL_EQUAL, TokenType.BANG_EQUAL)) {
      const operator = this.previous();
      const right = this.addition();
      expr = new Binary(expr, operator, right);
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

    if (this.match(TokenType.GLOBAL)) {
      // global as access prefix: global varName or global funcName()
      const name = this.consume(TokenType.IDENTIFIER, "Expect identifier after 'global'.");
      // Create a Get expression to represent globals.name
      const globalsVar = new Variable({ type: TokenType.IDENTIFIER, lexeme: 'globals', literal: null, line: name.line });
      return new Get(globalsVar, name);
    }

    if (this.match(TokenType.IDENTIFIER)) {
      return new Variable(this.previous());
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return expr;
    }

    if (this.match(TokenType.LEFT_BRACKET)) {
      return this.listLiteral();
    }

    if (this.match(TokenType.LEFT_BRACE)) {
      return this.objectLiteral();
    }

    throw new Error(`Unexpected token: ${this.peek().lexeme}`);
  }

  private listLiteral(): Expr {
    const elements: Expr[] = [];

    if (!this.check(TokenType.RIGHT_BRACKET)) {
      do {
        elements.push(this.expression());
      } while (this.match(TokenType.COMMA));
    }

    this.consume(TokenType.RIGHT_BRACKET, "Expect ']' after list elements.");
    return new Literal(elements);
  }

  private objectLiteral(): Expr {
    const properties: Map<string, Expr> = new Map();

    if (!this.check(TokenType.RIGHT_BRACE)) {
      do {
        // Check for trailing comma
        if (this.check(TokenType.RIGHT_BRACE)) break;
        
        const key = this.consume(TokenType.IDENTIFIER, "Expect property name.");
        this.consume(TokenType.COLON, "Expect ':' after property name.");
        const value = this.expression();
        properties.set(key.lexeme, value);
      } while (this.match(TokenType.COMMA));
    }

    this.consume(TokenType.RIGHT_BRACE, "Expect '}' after object properties.");
    return new Literal(properties);
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