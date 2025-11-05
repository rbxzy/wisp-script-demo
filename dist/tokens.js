export var TokenType;
(function (TokenType) {
    // Literals
    TokenType["NUMBER"] = "NUMBER";
    TokenType["STRING"] = "STRING";
    TokenType["IDENTIFIER"] = "IDENTIFIER";
    TokenType["TRUE"] = "TRUE";
    TokenType["FALSE"] = "FALSE";
    // Keywords
    TokenType["VAR"] = "VAR";
    TokenType["PRINT"] = "PRINT";
    TokenType["FUNC"] = "FUNC";
    TokenType["RETURN"] = "RETURN";
    TokenType["END"] = "END";
    TokenType["IF"] = "IF";
    TokenType["ELSE"] = "ELSE";
    TokenType["ELSEIF"] = "ELSEIF";
    TokenType["AND"] = "AND";
    TokenType["OR"] = "OR";
    TokenType["NOT"] = "NOT";
    // Operators
    TokenType["PLUS"] = "PLUS";
    TokenType["MINUS"] = "MINUS";
    TokenType["MULTIPLY"] = "MULTIPLY";
    TokenType["DIVIDE"] = "DIVIDE";
    // Comparison operators
    TokenType["GREATER"] = "GREATER";
    TokenType["GREATER_EQUAL"] = "GREATER_EQUAL";
    TokenType["LESS"] = "LESS";
    TokenType["LESS_EQUAL"] = "LESS_EQUAL";
    TokenType["EQUAL_EQUAL"] = "EQUAL_EQUAL";
    TokenType["BANG_EQUAL"] = "BANG_EQUAL";
    // Symbols
    TokenType["EQUAL"] = "EQUAL";
    TokenType["PLUS_EQUAL"] = "PLUS_EQUAL";
    TokenType["MINUS_EQUAL"] = "MINUS_EQUAL";
    TokenType["PLUS_PLUS"] = "PLUS_PLUS";
    TokenType["MINUS_MINUS"] = "MINUS_MINUS";
    TokenType["LEFT_PAREN"] = "LEFT_PAREN";
    TokenType["RIGHT_PAREN"] = "RIGHT_PAREN";
    TokenType["LEFT_BRACKET"] = "LEFT_BRACKET";
    TokenType["RIGHT_BRACKET"] = "RIGHT_BRACKET";
    TokenType["LEFT_BRACE"] = "LEFT_BRACE";
    TokenType["RIGHT_BRACE"] = "RIGHT_BRACE";
    TokenType["COMMA"] = "COMMA";
    TokenType["DOT"] = "DOT";
    TokenType["COLON"] = "COLON";
    // End of file
    TokenType["EOF"] = "EOF";
})(TokenType || (TokenType = {}));
export class TokenImpl {
    constructor(type, lexeme, literal, line) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }
    toString() {
        return `${this.type} ${this.lexeme} ${this.literal}`;
    }
}
