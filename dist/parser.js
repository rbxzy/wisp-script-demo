import { TokenType } from './tokens';
import { Binary, Unary, Literal, Variable, Call, Get, Assign, Set, Logical, Var, Expression, Print, Function, Return, If } from './ast';
export class Parser {
    constructor(tokens) {
        this.current = 0;
        this.tokens = tokens;
    }
    parse() {
        const statements = [];
        while (!this.isAtEnd()) {
            const stmt = this.declaration();
            if (stmt)
                statements.push(stmt);
        }
        return statements;
    }
    declaration() {
        try {
            if (this.match(TokenType.FUNC))
                return this.functionDeclaration();
            if (this.match(TokenType.VAR))
                return this.varDeclaration();
            return this.statement();
        }
        catch (error) {
            this.synchronize();
            throw error;
        }
    }
    functionDeclaration() {
        const name = this.consume(TokenType.IDENTIFIER, "Expect function name.");
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after function name.");
        const parameters = [];
        if (!this.check(TokenType.RIGHT_PAREN)) {
            do {
                parameters.push(this.consume(TokenType.IDENTIFIER, "Expect parameter name."));
            } while (this.match(TokenType.COMMA));
        }
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after parameters.");
        // Parse function body until 'end'
        const body = [];
        while (!this.check(TokenType.END) && !this.isAtEnd()) {
            const stmt = this.declaration();
            if (stmt)
                body.push(stmt);
        }
        this.consume(TokenType.END, "Expect 'end' after function body.");
        return new Function(name, parameters, body);
    }
    varDeclaration() {
        const name = this.consume(TokenType.IDENTIFIER, "Expect variable name.");
        const initializer = this.match(TokenType.EQUAL)
            ? this.expression()
            : new Literal(null);
        return new Var(name, initializer);
    }
    statement() {
        if (this.match(TokenType.PRINT))
            return this.printStatement();
        if (this.match(TokenType.RETURN))
            return this.returnStatement();
        if (this.match(TokenType.IF))
            return this.ifStatement();
        return this.expressionStatement();
    }
    printStatement() {
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'print'.");
        const value = this.expression();
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after value.");
        return new Print(value);
    }
    returnStatement() {
        const keyword = this.previous();
        let value = null;
        if (!this.check(TokenType.END)) {
            value = this.expression();
        }
        return new Return(keyword, value);
    }
    ifStatement() {
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'if'.");
        const condition = this.expression();
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after if condition.");
        // Parse then branch
        const thenBranch = [];
        while (!this.check(TokenType.ELSEIF) && !this.check(TokenType.ELSE) && !this.check(TokenType.END) && !this.isAtEnd()) {
            const stmt = this.declaration();
            if (stmt)
                thenBranch.push(stmt);
        }
        // Parse elseif branches
        const elseifBranches = [];
        while (this.match(TokenType.ELSEIF)) {
            this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'elseif'.");
            const elseifCondition = this.expression();
            this.consume(TokenType.RIGHT_PAREN, "Expect ')' after elseif condition.");
            const elseifBody = [];
            while (!this.check(TokenType.ELSEIF) && !this.check(TokenType.ELSE) && !this.check(TokenType.END) && !this.isAtEnd()) {
                const stmt = this.declaration();
                if (stmt)
                    elseifBody.push(stmt);
            }
            elseifBranches.push({ condition: elseifCondition, body: elseifBody });
        }
        // Parse else branch
        let elseBranch = null;
        if (this.match(TokenType.ELSE)) {
            elseBranch = [];
            while (!this.check(TokenType.END) && !this.isAtEnd()) {
                const stmt = this.declaration();
                if (stmt)
                    elseBranch.push(stmt);
            }
        }
        this.consume(TokenType.END, "Expect 'end' after if statement.");
        return new If(condition, thenBranch, elseifBranches, elseBranch);
    }
    expressionStatement() {
        const expr = this.expression();
        return new Expression(expr);
    }
    expression() {
        return this.assignment();
    }
    assignment() {
        const expr = this.logicalOr();
        if (this.match(TokenType.EQUAL)) {
            const value = this.assignment();
            if (expr instanceof Variable) {
                return new Assign(expr.name, value);
            }
            else if (expr instanceof Get) {
                return new Set(expr.object, expr.name, value);
            }
            throw new Error('Invalid assignment target.');
        }
        else if (this.match(TokenType.PLUS_EQUAL)) {
            const value = this.assignment();
            if (expr instanceof Variable) {
                return new Assign(expr.name, new Binary(expr, { type: TokenType.PLUS, lexeme: '+', literal: null, line: 0 }, value));
            }
            else if (expr instanceof Get) {
                return new Set(expr.object, expr.name, new Binary(expr, { type: TokenType.PLUS, lexeme: '+', literal: null, line: 0 }, value));
            }
            throw new Error('Invalid assignment target.');
        }
        else if (this.match(TokenType.MINUS_EQUAL)) {
            const value = this.assignment();
            if (expr instanceof Variable) {
                return new Assign(expr.name, new Binary(expr, { type: TokenType.MINUS, lexeme: '-', literal: null, line: 0 }, value));
            }
            else if (expr instanceof Get) {
                return new Set(expr.object, expr.name, new Binary(expr, { type: TokenType.MINUS, lexeme: '-', literal: null, line: 0 }, value));
            }
            throw new Error('Invalid assignment target.');
        }
        return expr;
    }
    logicalOr() {
        let expr = this.logicalAnd();
        while (this.match(TokenType.OR)) {
            const operator = this.previous();
            const right = this.logicalAnd();
            expr = new Logical(expr, operator, right);
        }
        return expr;
    }
    logicalAnd() {
        let expr = this.comparison();
        while (this.match(TokenType.AND)) {
            const operator = this.previous();
            const right = this.comparison();
            expr = new Logical(expr, operator, right);
        }
        return expr;
    }
    comparison() {
        let expr = this.addition();
        while (this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL, TokenType.EQUAL_EQUAL, TokenType.BANG_EQUAL)) {
            const operator = this.previous();
            const right = this.addition();
            expr = new Binary(expr, operator, right);
        }
        return expr;
    }
    addition() {
        let expr = this.multiplication();
        while (this.match(TokenType.MINUS, TokenType.PLUS)) {
            const operator = this.previous();
            const right = this.multiplication();
            expr = new Binary(expr, operator, right);
        }
        return expr;
    }
    multiplication() {
        let expr = this.unary();
        while (this.match(TokenType.DIVIDE, TokenType.MULTIPLY)) {
            const operator = this.previous();
            const right = this.unary();
            expr = new Binary(expr, operator, right);
        }
        return expr;
    }
    unary() {
        if (this.match(TokenType.MINUS, TokenType.NOT)) {
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
    postfix() {
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
    call() {
        let expr = this.primary();
        while (true) {
            if (this.match(TokenType.LEFT_PAREN)) {
                expr = this.finishCall(expr);
            }
            else if (this.match(TokenType.DOT)) {
                const name = this.consume(TokenType.IDENTIFIER, "Expect property name after '.'.");
                expr = new Get(expr, name);
            }
            else {
                break;
            }
        }
        return expr;
    }
    finishCall(callee) {
        const args = [];
        if (!this.check(TokenType.RIGHT_PAREN)) {
            do {
                args.push(this.expression());
            } while (this.match(TokenType.COMMA));
        }
        const paren = this.consume(TokenType.RIGHT_PAREN, "Expect ')' after arguments.");
        return new Call(callee, paren, args);
    }
    primary() {
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
        if (this.match(TokenType.LEFT_BRACKET)) {
            return this.listLiteral();
        }
        if (this.match(TokenType.LEFT_BRACE)) {
            return this.objectLiteral();
        }
        throw new Error(`Unexpected token: ${this.peek().lexeme}`);
    }
    listLiteral() {
        const elements = [];
        if (!this.check(TokenType.RIGHT_BRACKET)) {
            do {
                elements.push(this.expression());
            } while (this.match(TokenType.COMMA));
        }
        this.consume(TokenType.RIGHT_BRACKET, "Expect ']' after list elements.");
        return new Literal(elements);
    }
    objectLiteral() {
        const properties = new Map();
        if (!this.check(TokenType.RIGHT_BRACE)) {
            do {
                const key = this.consume(TokenType.IDENTIFIER, "Expect property name.");
                this.consume(TokenType.COLON, "Expect ':' after property name.");
                const value = this.expression();
                properties.set(key.lexeme, value);
            } while (this.match(TokenType.COMMA));
        }
        this.consume(TokenType.RIGHT_BRACE, "Expect '}' after object properties.");
        return new Literal(properties);
    }
    match(...types) {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }
    check(type) {
        if (this.isAtEnd())
            return false;
        return this.peek().type === type;
    }
    advance() {
        if (!this.isAtEnd())
            this.current++;
        return this.previous();
    }
    isAtEnd() {
        return this.peek().type === TokenType.EOF;
    }
    peek() {
        return this.tokens[this.current];
    }
    previous() {
        return this.tokens[this.current - 1];
    }
    consume(type, message) {
        if (this.check(type))
            return this.advance();
        throw new Error(`${message} Got ${this.peek().lexeme}`);
    }
    synchronize() {
        this.advance();
        while (!this.isAtEnd()) {
            if (this.previous().type === TokenType.EOF)
                return;
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
