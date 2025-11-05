// Base classes for expressions and statements
export class Expr {
}
export class Stmt {
}
// Expression classes
export class Binary extends Expr {
    constructor(left, operator, right) {
        super();
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
    accept(visitor) {
        return visitor.visitBinaryExpr(this);
    }
}
export class Unary extends Expr {
    constructor(operator, right) {
        super();
        this.operator = operator;
        this.right = right;
    }
    accept(visitor) {
        return visitor.visitUnaryExpr(this);
    }
}
export class Literal extends Expr {
    constructor(value) {
        super();
        this.value = value;
    }
    accept(visitor) {
        return visitor.visitLiteralExpr(this);
    }
}
export class Variable {
    constructor(name) {
        this.name = name;
    }
    accept(visitor) {
        return visitor.visitVariableExpr(this);
    }
}
export class Get {
    constructor(object, name) {
        this.object = object;
        this.name = name;
    }
    accept(visitor) {
        return visitor.visitGetExpr(this);
    }
}
export class Assign {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
    accept(visitor) {
        return visitor.visitAssignExpr(this);
    }
}
export class Set {
    constructor(object, name, value) {
        this.object = object;
        this.name = name;
        this.value = value;
    }
    accept(visitor) {
        return visitor.visitSetExpr(this);
    }
}
export class Call extends Expr {
    constructor(callee, paren, args) {
        super();
        this.callee = callee;
        this.paren = paren;
        this.args = args;
    }
    accept(visitor) {
        return visitor.visitCallExpr(this);
    }
}
export class Logical extends Expr {
    constructor(left, operator, right) {
        super();
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
    accept(visitor) {
        return visitor.visitLogicalExpr(this);
    }
}
// Statement classes
export class Var extends Stmt {
    constructor(name, initializer) {
        super();
        this.name = name;
        this.initializer = initializer;
    }
    accept(visitor) {
        return visitor.visitVarStmt(this);
    }
}
export class Expression extends Stmt {
    constructor(expression) {
        super();
        this.expression = expression;
    }
    accept(visitor) {
        return visitor.visitExpressionStmt(this);
    }
}
export class Print extends Stmt {
    constructor(expression) {
        super();
        this.expression = expression;
    }
    accept(visitor) {
        return visitor.visitPrintStmt(this);
    }
}
export class Function extends Stmt {
    constructor(name, params, body) {
        super();
        this.name = name;
        this.params = params;
        this.body = body;
    }
    accept(visitor) {
        return visitor.visitFunctionStmt(this);
    }
}
export class Return extends Stmt {
    constructor(keyword, value) {
        super();
        this.keyword = keyword;
        this.value = value;
    }
    accept(visitor) {
        return visitor.visitReturnStmt(this);
    }
}
export class If extends Stmt {
    constructor(condition, thenBranch, elseifBranches, elseBranch) {
        super();
        this.condition = condition;
        this.thenBranch = thenBranch;
        this.elseifBranches = elseifBranches;
        this.elseBranch = elseBranch;
    }
    accept(visitor) {
        return visitor.visitIfStmt(this);
    }
}
