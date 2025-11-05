import { TokenType } from './tokens';
import { Binary, Unary, Literal, Variable, Call, Get } from './ast';
function toCamelCase(str) {
    // Convert the entire string to lowercase first for consistency
    let processedStr = str.toLowerCase();
    // Split the string by spaces, hyphens, or underscores to get individual words
    const words = processedStr.split(/[\s_-]+/);
    // Map over the words to capitalize the first letter of each word (except the first)
    const camelCaseWords = words.map((word, index) => {
        if (index === 0) {
            // The first word remains in its lowercase form
            return word;
        }
        else {
            // Capitalize the first letter and concatenate with the rest of the word
            return word.charAt(0).toUpperCase() + word.slice(1);
        }
    });
    // Join the processed words back into a single string
    return camelCaseWords.join('');
}
export class TypeScriptGenerator {
    generate(statements) {
        const result = statements.map(stmt => stmt.accept(this)).join('\n');
        return result;
    }
    // Expression evaluator for compile-time constant folding
    evaluateExpression(expr) {
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
    visitBinaryExpr(expr) {
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
    visitUnaryExpr(expr) {
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
    visitLiteralExpr(expr) {
        if (expr.value === null)
            return 'null';
        if (typeof expr.value === 'number')
            return expr.value.toString();
        if (typeof expr.value === 'string')
            return `"${expr.value}"`;
        if (typeof expr.value === 'boolean')
            return expr.value.toString();
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
            const properties = [];
            expr.value.forEach((value, key) => {
                let valueStr;
                if (value instanceof Literal || value instanceof Variable || value instanceof Binary || value instanceof Call || value instanceof Get) {
                    valueStr = value.accept(this);
                }
                else {
                    valueStr = String(value);
                }
                properties.push(`${key}: ${valueStr}`);
            });
            return `{${properties.join(', ')}}`;
        }
        return expr.value.toString();
    }
    visitVariableExpr(expr) {
        return expr.name.lexeme;
    }
    visitCallExpr(expr) {
        const callee = expr.callee.accept(this);
        const args = expr.args.map(arg => arg.accept(this)).join(', ');
        return `${callee}(${args})`;
    }
    visitGetExpr(expr) {
        const object = expr.object.accept(this);
        return `${object}.${expr.name.lexeme}`;
    }
    visitAssignExpr(expr) {
        const value = expr.value.accept(this);
        return `${expr.name.lexeme} = ${value}`;
    }
    visitSetExpr(expr) {
        const object = expr.object.accept(this);
        const value = expr.value.accept(this);
        return `${object}.${expr.name.lexeme} = ${value}`;
    }
    visitLogicalExpr(expr) {
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
    visitVarStmt(stmt) {
        const name = stmt.name.lexeme;
        const initializer = stmt.initializer.accept(this);
        return `let ${name}: any = ${initializer};`;
    }
    visitExpressionStmt(stmt) {
        return stmt.expression.accept(this) + ';';
    }
    visitPrintStmt(stmt) {
        const expression = stmt.expression.accept(this);
        return `console.log(${expression});`;
    }
    visitFunctionStmt(stmt) {
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
    visitReturnStmt(stmt) {
        if (stmt.value === null) {
            return 'return;';
        }
        // Try to evaluate the expression at compile time
        const evaluatedValue = this.evaluateExpression(stmt.value);
        let expression;
        if (evaluatedValue !== null && evaluatedValue !== undefined) {
            expression = evaluatedValue.toString();
        }
        else {
            expression = stmt.value.accept(this);
        }
        return `return ${expression};`;
    }
    visitIfStmt(stmt) {
        const condition = stmt.condition.accept(this);
        const thenBranch = stmt.thenBranch.map(s => {
            const result = s.accept(this);
            return `  ${result}`;
        }).join('\n');
        let result = `if ${condition} {\n${thenBranch}\n}`;
        // Handle elseif branches
        for (const elseifBranch of stmt.elseifBranches) {
            const elseifCondition = elseifBranch.condition.accept(this);
            const elseifBody = elseifBranch.body.map(s => {
                const stmtResult = s.accept(this);
                return `  ${stmtResult}`;
            }).join('\n');
            result += ` else if ${elseifCondition} {\n${elseifBody}\n}`;
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
    // Helper method to determine if an expression is numeric
    isNumericExpression(expr) {
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
