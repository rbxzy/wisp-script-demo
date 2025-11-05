import { TokenType } from './tokens';
import {
  Expr, Stmt, ExprVisitor, StmtVisitor,
  Binary, Unary, Literal, Variable, Call, Get, Assign, Set,
  Var, Expression, Print, Function, Return
} from './ast';

function toCamelCase(str: string) {
  // Convert the entire string to lowercase first for consistency
  let processedStr = str.toLowerCase();

  // Split the string by spaces, hyphens, or underscores to get individual words
  const words = processedStr.split(/[\s_-]+/);

  // Map over the words to capitalize the first letter of each word (except the first)
  const camelCaseWords = words.map((word, index) => {
    if (index === 0) {
      // The first word remains in its lowercase form
      return word;
    } else {
      // Capitalize the first letter and concatenate with the rest of the word
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
  });

  // Join the processed words back into a single string
  return camelCaseWords.join('');
}

export class TypeScriptGenerator implements ExprVisitor<string>, StmtVisitor<string> {
  generate(statements: Stmt[]): string {
    const result = statements.map(stmt => stmt.accept(this)).join('\n');
    return result;
  }

  // Expression evaluator for compile-time constant folding
  private evaluateExpression(expr: Expr): any {
    if (expr instanceof Literal) {
      return expr.value;
    }

    if (expr instanceof Binary) {
      const left = this.evaluateExpression(expr.left);
      const right = this.evaluateExpression(expr.right);

      // Only evaluate if both sides are numbers
      if (typeof left === 'number' && typeof right === 'number') {
        switch (expr.operator.type) {
          case TokenType.PLUS:
            return left + right;
          case TokenType.MINUS:
            return left - right;
          case TokenType.MULTIPLY:
            return left * right;
          case TokenType.DIVIDE:
            return left / right;
        }
      }
      return null; // Can't evaluate
    }

    if (expr instanceof Unary) {
      const right = this.evaluateExpression(expr.right);
      if (typeof right === 'number' && expr.operator.type === TokenType.MINUS) {
        return -right;
      }
      return null; // Can't evaluate
    }

    return null; // Can't evaluate (variables, calls, etc.)
  }

  // Expression visitors
  visitBinaryExpr(expr: Binary): string {
    const left = expr.left.accept(this);
    const right = expr.right.accept(this);
    
    switch (expr.operator.type) {
      case TokenType.PLUS:
        return `(${left} + ${right})`;
      case TokenType.MINUS:
        return `(${left} - ${right})`;
      case TokenType.MULTIPLY:
        return `(${left} * ${right})`;
      case TokenType.DIVIDE:
        return `(${left} / ${right})`;
      default:
        throw new Error(`Unknown binary operator: ${expr.operator.lexeme}`);
    }
  }

  visitUnaryExpr(expr: Unary): string {
    const right = expr.right.accept(this);
    
    switch (expr.operator.type) {
      case TokenType.MINUS:
        return `(-${right})`;
      default:
        throw new Error(`Unknown unary operator: ${expr.operator.lexeme}`);
    }
  }

  visitLiteralExpr(expr: Literal): string {
    if (expr.value === null) return 'null';
    if (typeof expr.value === 'number') return expr.value.toString();
    if (typeof expr.value === 'string') return `"${expr.value}"`;
    if (typeof expr.value === 'boolean') return expr.value.toString();
    return expr.value.toString();
  }

  visitVariableExpr(expr: Variable): string {
    return expr.name.lexeme;
  }

  visitCallExpr(expr: Call): string {
    const callee = expr.callee.accept(this);
    const args = expr.args.map(arg => arg.accept(this)).join(', ');
    return `${callee}(${args})`;
  }

  visitGetExpr(expr: Get): string {
    const object = expr.object.accept(this);
    return `${object}.${expr.name.lexeme}`;
  }

  visitAssignExpr(expr: Assign): string {
    const value = expr.value.accept(this);
    return `${expr.name.lexeme} = ${value}`;
  }

  visitSetExpr(expr: Set): string {
    const object = expr.object.accept(this);
    const value = expr.value.accept(this);
    return `${object}.${expr.name.lexeme} = ${value}`;
  }

  // Statement visitors
  visitVarStmt(stmt: Var): string {
    const name = stmt.name.lexeme;
    const initializer = stmt.initializer.accept(this);
    return `let ${name}: any = ${initializer};`;
  }

  visitExpressionStmt(stmt: Expression): string {
    return stmt.expression.accept(this) + ';';
  }

  visitPrintStmt(stmt: Print): string {
    const expression = stmt.expression.accept(this);
    return `console.log(${expression});`;
  }

  visitFunctionStmt(stmt: Function): string {
    const name = stmt.name.lexeme;
    const params = stmt.params.map(param => `${param.lexeme}: any`).join(', ');
    const body = stmt.body.map(s => {
      const result = s.accept(this);
      return `  ${result}`;
    }).join('\n');
    
    // Check if this is a special function name
    if (name === '_forever' || name === '_on_collision' || name === '_on_clone_start') {
      const functionName = toCamelCase(name.substring(1)); // Remove leading underscore

      return `${functionName}((${params}) => {\n${body}\n})`;
    }
    
    return `function ${name}(${params}) {\n${body}\n}`;
  }

  visitReturnStmt(stmt: Return): string {
    if (stmt.value === null) {
      return 'return;';
    }
    
    // Try to evaluate the expression at compile time
    const evaluatedValue = this.evaluateExpression(stmt.value);
    
    let expression: string;
    if (evaluatedValue !== null && evaluatedValue !== undefined) {
      expression = evaluatedValue.toString();
    } else {
      expression = stmt.value.accept(this);
    }
    
    return `return ${expression};`;
  }

  // Helper method to determine if an expression is numeric
  private isNumericExpression(expr: Expr): boolean {
    if (expr instanceof Literal) {
      return typeof expr.value === 'number';
    }
    
    if (expr instanceof Binary) {
      const isArithmetic = [
        TokenType.PLUS, TokenType.MINUS, 
        TokenType.MULTIPLY, TokenType.DIVIDE
      ].includes(expr.operator.type);
      
      // For arithmetic operations, assume result is numeric
      return isArithmetic;
    }
    
    if (expr instanceof Unary) {
      return expr.operator.type === TokenType.MINUS && 
             this.isNumericExpression(expr.right);
    }
    
    // For variables in arithmetic context, assume numeric
    if (expr instanceof Variable) {
      return true; // Basic assumption for math context
    }
    
    return false;
  }
}