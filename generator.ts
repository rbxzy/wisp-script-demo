import { TokenType } from './tokens';
import {
  Expr, Stmt, ExprVisitor, StmtVisitor,
  Binary, Unary, Literal, Variable, Call, Get, Assign, Set, Logical,
  Var, Expression, Print, Function, Return, If, While, For, ForIn
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
      case TokenType.GREATER:
        return `(${left} > ${right})`;
      case TokenType.GREATER_EQUAL:
        return `(${left} >= ${right})`;
      case TokenType.LESS:
        return `(${left} < ${right})`;
      case TokenType.LESS_EQUAL:
        return `(${left} <= ${right})`;
      case TokenType.EQUAL_EQUAL:
        return `(${left} === ${right})`;
      case TokenType.BANG_EQUAL:
        return `(${left} !== ${right})`;
      default:
        throw new Error(`Unknown binary operator: ${expr.operator.lexeme}`);
    }
  }

  visitUnaryExpr(expr: Unary): string {
    const right = expr.right.accept(this);
    
    switch (expr.operator.type) {
      case TokenType.MINUS:
        return `(-${right})`;
      case TokenType.NOT:
        return `(!${right})`;
      default:
        throw new Error(`Unknown unary operator: ${expr.operator.lexeme}`);
    }
  }

  visitLiteralExpr(expr: Literal): string {
    if (expr.value === null) return 'null';
    if (typeof expr.value === 'number') return expr.value.toString();
    if (typeof expr.value === 'string') return `"${expr.value}"`;
    if (typeof expr.value === 'boolean') return expr.value.toString();
    
    // Handle arrays (lists)
    if (Array.isArray(expr.value)) {
      const elements = expr.value.map(elem => {
        if (elem instanceof Literal || elem instanceof Variable || elem instanceof Binary || elem instanceof Call || elem instanceof Get) {
          return elem.accept(this);
        }
        return String(elem);
      });
      return `[${elements.join(', ')}]`;
    }
    
    // Handle objects (Map)
    if (expr.value instanceof Map) {
      const properties: string[] = [];
      expr.value.forEach((value, key) => {
        let valueStr: string;
        // Check if value is an Expr (has accept method)
        if (value && typeof value === 'object' && 'accept' in value && typeof value.accept === 'function') {
          valueStr = value.accept(this);
        } else {
          valueStr = String(value);
        }
        properties.push(`${key}: ${valueStr}`);
      });
      return `{${properties.join(', ')}}`;
    }
    
    return expr.value.toString();
  }

  visitVariableExpr(expr: Variable): string {
    return expr.name.lexeme;
  }

  visitCallExpr(expr: Call): string {
    const callee = expr.callee.accept(this);
    
    // Special handling for key_down and key_up
    if (callee === 'key_down' || callee === 'key_up') {
      // Transform key_down("UpArrow") -> Keyboard.keyDown(Key.UpArrow)
      const functionName = callee === 'key_down' ? 'keyDown' : 'keyUp';
      
      if (expr.args.length > 0 && expr.args[0] instanceof Literal && typeof expr.args[0].value === 'string') {
        const keyName = expr.args[0].value;
        return `Keyboard.${functionName}(Key.${keyName})`;
      }
      
      // If not a string literal, fall back to normal handling
      const args = expr.args.map(arg => arg.accept(this)).join(', ');
      return `Keyboard.${functionName}(${args})`;
    }
    
    // Math function mappings
    const mathFunctions: { [key: string]: string } = {
      'random': 'Math.random',
      'floor': 'Math.floor',
      'ceil': 'Math.ceil',
      'round': 'Math.round',
      'abs': 'Math.abs',
      'pow': 'Math.pow',
      'sqrt': 'Math.sqrt',
      'min': 'Math.min',
      'max': 'Math.max',
      'sin': 'Math.sin',
      'cos': 'Math.cos',
      'tan': 'Math.tan',
      'atan2': 'Math.atan2',
    };
    
    if (callee in mathFunctions) {
      const args = expr.args.map(arg => arg.accept(this)).join(', ');
      return `${mathFunctions[callee]}(${args})`;
    }
    
    // Special handling for randrange(min, max) -> Math.random() * (max - min) + min
    if (callee === 'randrange') {
      if (expr.args.length === 2) {
        const min = expr.args[0].accept(this);
        const max = expr.args[1].accept(this);
        return `(Math.random() * (${max} - ${min}) + ${min})`;
      } else if (expr.args.length === 1) {
        // randrange(max) -> Math.random() * max
        const max = expr.args[0].accept(this);
        return `(Math.random() * ${max})`;
      }
    }
    
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

  visitLogicalExpr(expr: Logical): string {
    const left = expr.left.accept(this);
    const right = expr.right.accept(this);
    
    switch (expr.operator.type) {
      case TokenType.AND:
        return `(${left} && ${right})`;
      case TokenType.OR:
        return `(${left} || ${right})`;
      default:
        throw new Error(`Unknown logical operator: ${expr.operator.lexeme}`);
    }
  }

  // Statement visitors
  visitVarStmt(stmt: Var): string {
    const name = stmt.name.lexeme;
    const initializer = stmt.initializer.accept(this);
    const isGlobal = (stmt as any).isGlobal;
    
    if (isGlobal) {
      return `globals.${name} = ${initializer};`;
    }
    
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
    const isGlobal = (stmt as any).isGlobal;
    
    // Check if this is a global function
    if (isGlobal) {
      return `globals.${name} = function (${params}) {\n${body}\n}`;
    }
    
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
    
    // Try to evaluate the expression at compile time (only for simple numeric expressions)
    const evaluatedValue = this.evaluateExpression(stmt.value);
    
    let expression: string;
    // Only use evaluated value if it's a number (not objects, arrays, etc.)
    if (typeof evaluatedValue === 'number') {
      expression = evaluatedValue.toString();
    } else {
      expression = stmt.value.accept(this);
    }
    
    return `return ${expression};`;
  }

  visitIfStmt(stmt: If): string {
    const condition = stmt.condition.accept(this);
    const thenBranch = stmt.thenBranch.map(s => {
      const result = s.accept(this);
      return `  ${result}`;
    }).join('\n');

    let result = `if (${condition}) {\n${thenBranch}\n}`;

    // Handle elseif branches
    for (const elseifBranch of stmt.elseifBranches) {
      const elseifCondition = elseifBranch.condition.accept(this);
      const elseifBody = elseifBranch.body.map(s => {
        const stmtResult = s.accept(this);
        return `  ${stmtResult}`;
      }).join('\n');
      result += ` else if (${elseifCondition}) {\n${elseifBody}\n}`;
    }

    // Handle else branch
    if (stmt.elseBranch) {
      const elseBranch = stmt.elseBranch.map(s => {
        const stmtResult = s.accept(this);
        return `  ${stmtResult}`;
      }).join('\n');
      result += ` else {\n${elseBranch}\n}`;
    }

    return result;
  }

  visitWhileStmt(stmt: While): string {
    const condition = stmt.condition.accept(this);
    const body = stmt.body.map(s => {
      const result = s.accept(this);
      return `  ${result}`;
    }).join('\n');

    return `while (${condition}) {\n${body}\n}`;
  }

  visitForStmt(stmt: For): string {
    let initPart = '';
    if (stmt.initializer) {
      initPart = stmt.initializer.accept(this);
      // Remove trailing semicolon if it's a statement
      if (initPart.endsWith(';')) {
        initPart = initPart.slice(0, -1);
      }
    }

    const condPart = stmt.condition ? stmt.condition.accept(this) : '';
    const incrPart = stmt.increment ? stmt.increment.accept(this) : '';

    const body = stmt.body.map(s => {
      const result = s.accept(this);
      return `  ${result}`;
    }).join('\n');

    return `for (${initPart}; ${condPart}; ${incrPart}) {\n${body}\n}`;
  }

  visitForInStmt(stmt: ForIn): string {
    const indexVar = stmt.indexVar.lexeme;
    const itemVar = stmt.itemVar.lexeme;
    const iterable = stmt.iterable.accept(this);

    const body = stmt.body.map(s => {
      const result = s.accept(this);
      return `  ${result}`;
    }).join('\n');

    // If index is '_' (dummy), we don't need it
    if (indexVar === '_') {
      return `for (const ${itemVar} of ${iterable}) {\n${body}\n}`;
    }

    // Otherwise, use forEach to get both index and item
    return `${iterable}.forEach((${itemVar}, ${indexVar}) => {\n${body}\n})`;
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