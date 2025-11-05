import { Token } from './tokens';

// Base classes for expressions and statements
export abstract class Expr {
  abstract accept<R>(visitor: ExprVisitor<R>): R;
}

export abstract class Stmt {
  abstract accept<R>(visitor: StmtVisitor<R>): R;
}

// Visitor interfaces
export interface ExprVisitor<R> {
  visitBinaryExpr(expr: Binary): R;
  visitUnaryExpr(expr: Unary): R;
  visitLiteralExpr(expr: Literal): R;
  visitVariableExpr(expr: Variable): R;
  visitCallExpr(expr: Call): R;
  visitGetExpr(expr: Get): R;
  visitAssignExpr(expr: Assign): R;
  visitSetExpr(expr: Set): R;
  visitLogicalExpr(expr: Logical): R;
}

export interface StmtVisitor<R> {
  visitVarStmt(stmt: Var): R;
  visitExpressionStmt(stmt: Expression): R;
  visitPrintStmt(stmt: Print): R;
  visitFunctionStmt(stmt: Function): R;
  visitReturnStmt(stmt: Return): R;
  visitIfStmt(stmt: If): R;
  visitWhileStmt(stmt: While): R;
  visitForStmt(stmt: For): R;
  visitForInStmt(stmt: ForIn): R;
}

// Expression classes
export class Binary extends Expr {
  constructor(
    public left: Expr,
    public operator: Token,
    public right: Expr
  ) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitBinaryExpr(this);
  }
}

export class Unary extends Expr {
  constructor(
    public operator: Token,
    public right: Expr
  ) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitUnaryExpr(this);
  }
}

export class Literal extends Expr {
  constructor(public value: any) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitLiteralExpr(this);
  }
}

export class Variable implements Expr {
  constructor(public name: Token) {}
  
  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitVariableExpr(this);
  }
}

export class Get implements Expr {
  constructor(public object: Expr, public name: Token) {}
  
  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitGetExpr(this);
  }
}

export class Assign implements Expr {
  constructor(public name: Token, public value: Expr) {}
  
  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitAssignExpr(this);
  }
}

export class Set implements Expr {
  constructor(public object: Expr, public name: Token, public value: Expr) {}
  
  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitSetExpr(this);
  }
}

export class Call extends Expr {
  constructor(
    public callee: Expr,
    public paren: Token,
    public args: Expr[]
  ) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitCallExpr(this);
  }
}

export class Logical extends Expr {
  constructor(
    public left: Expr,
    public operator: Token,
    public right: Expr
  ) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitLogicalExpr(this);
  }
}

// Statement classes
export class Var extends Stmt {
  constructor(
    public name: Token,
    public initializer: Expr
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitVarStmt(this);
  }
}

export class Expression extends Stmt {
  constructor(public expression: Expr) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitExpressionStmt(this);
  }
}

export class Print extends Stmt {
  constructor(public expression: Expr) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitPrintStmt(this);
  }
}

export class Function extends Stmt {
  constructor(
    public name: Token,
    public params: Token[],
    public body: Stmt[]
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitFunctionStmt(this);
  }
}

export class Return extends Stmt {
  constructor(public keyword: Token, public value: Expr | null) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitReturnStmt(this);
  }
}

export class If extends Stmt {
  constructor(
    public condition: Expr,
    public thenBranch: Stmt[],
    public elseifBranches: { condition: Expr; body: Stmt[] }[],
    public elseBranch: Stmt[] | null
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitIfStmt(this);
  }
}

export class While extends Stmt {
  constructor(
    public condition: Expr,
    public body: Stmt[]
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitWhileStmt(this);
  }
}

export class For extends Stmt {
  constructor(
    public initializer: Stmt | null,
    public condition: Expr | null,
    public increment: Expr | null,
    public body: Stmt[]
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitForStmt(this);
  }
}

export class ForIn extends Stmt {
  constructor(
    public indexVar: Token,
    public itemVar: Token,
    public iterable: Expr,
    public body: Stmt[]
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitForInStmt(this);
  }
}
