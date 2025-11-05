import { Token, TokenImpl, TokenType } from './tokens';

export class Lexer {
  private source: string;
  private tokens: Token[] = [];
  private start = 0;
  private current = 0;
  private line = 1;

  private keywords = new Map<string, TokenType>([
    ['var', TokenType.VAR],
    ['print', TokenType.PRINT],
    ['func', TokenType.FUNC],
    ['return', TokenType.RETURN],
    ['end', TokenType.END],
    ['if', TokenType.IF],
    ['else', TokenType.ELSE],
    ['elif', TokenType.ELIF],
    ['and', TokenType.AND],
    ['or', TokenType.OR],
    ['not', TokenType.NOT],
    ['for', TokenType.FOR],
    ['while', TokenType.WHILE],
    ['in', TokenType.IN],
    ['global', TokenType.GLOBAL],
    ['true', TokenType.TRUE],
    ['false', TokenType.FALSE]
  ]);

  constructor(source: string) {
    this.source = source;
  }

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new TokenImpl(TokenType.EOF, '', null, this.line));
    return this.tokens;
  }

  private scanToken(): void {
    const c = this.advance();

    switch (c) {
      case ' ':
      case '\r':
      case '\t':
        // Ignore whitespace
        break;
      case '\n':
        this.line++;
        break;
      case '+':
        if (this.peek() === '+') {
          this.advance();
          this.addToken(TokenType.PLUS_PLUS);
        } else if (this.peek() === '=') {
          this.advance();
          this.addToken(TokenType.PLUS_EQUAL);
        } else {
          this.addToken(TokenType.PLUS);
        }
        break;
      case '-':
        if (this.peek() === '-') {
          this.advance();
          this.addToken(TokenType.MINUS_MINUS);
        } else if (this.peek() === '=') {
          this.advance();
          this.addToken(TokenType.MINUS_EQUAL);
        } else {
          this.addToken(TokenType.MINUS);
        }
        break;
      case '*':
        this.addToken(TokenType.MULTIPLY);
        break;
      case '/':
        if (this.peek() === '/') {
          // Single-line comment
          while (this.peek() !== '\n' && !this.isAtEnd()) {
            this.advance();
          }
        } else if (this.peek() === '*') {
          // Multi-line comment
          this.advance(); // consume *
          while (!this.isAtEnd()) {
            if (this.peek() === '*' && this.peekNext() === '/') {
              this.advance(); // consume *
              this.advance(); // consume /
              break;
            }
            if (this.peek() === '\n') this.line++;
            this.advance();
          }
        } else {
          this.addToken(TokenType.DIVIDE);
        }
        break;
      case '=':
        if (this.peek() === '=') {
          this.advance();
          this.addToken(TokenType.EQUAL_EQUAL);
        } else {
          this.addToken(TokenType.EQUAL);
        }
        break;
      case '>':
        if (this.peek() === '=') {
          this.advance();
          this.addToken(TokenType.GREATER_EQUAL);
        } else {
          this.addToken(TokenType.GREATER);
        }
        break;
      case '<':
        if (this.peek() === '=') {
          this.advance();
          this.addToken(TokenType.LESS_EQUAL);
        } else {
          this.addToken(TokenType.LESS);
        }
        break;
      case '!':
        if (this.peek() === '=') {
          this.advance();
          this.addToken(TokenType.BANG_EQUAL);
        } else {
          throw new Error(`Unexpected character: ${c} at line ${this.line}`);
        }
        break;
      case '(':
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ')':
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      case '[':
        this.addToken(TokenType.LEFT_BRACKET);
        break;
      case ']':
        this.addToken(TokenType.RIGHT_BRACKET);
        break;
      case '{':
        this.addToken(TokenType.LEFT_BRACE);
        break;
      case '}':
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      case ',':
        this.addToken(TokenType.COMMA);
        break;
      case '.':
        this.addToken(TokenType.DOT);
        break;
      case ':':
        this.addToken(TokenType.COLON);
        break;
      case ';':
        this.addToken(TokenType.SEMICOLON);
        break;
      case '"':
        this.string('"');
        break;
      case "'":
        this.string("'");
        break;
      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          throw new Error(`Unexpected character: ${c} at line ${this.line}`);
        }
        break;
    }
  }

  private identifier(): void {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }

    const text = this.source.substring(this.start, this.current);
    const type = this.keywords.get(text) || TokenType.IDENTIFIER;
    this.addToken(type);
  }

  private string(quote: string): void {
    while (this.peek() !== quote && !this.isAtEnd()) {
      if (this.peek() === '\n') this.line++;
      this.advance();
    }

    if (this.isAtEnd()) {
      throw new Error(`Unterminated string at line ${this.line}`);
    }

    // Consume closing quote
    this.advance();

    // Get string value without quotes
    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);
  }

  private number(): void {
    while (this.isDigit(this.peek())) {
      this.advance();
    }

    // Look for a fractional part
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      // Consume the "."
      this.advance();

      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    const value = parseFloat(this.source.substring(this.start, this.current));
    this.addToken(TokenType.NUMBER, value);
  }

  private isDigit(c: string): boolean {
    return c >= '0' && c <= '9';
  }

  private isAlpha(c: string): boolean {
    return (c >= 'a' && c <= 'z') ||
           (c >= 'A' && c <= 'Z') ||
           c === '_';
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.source.charAt(this.current);
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) return '\0';
    return this.source.charAt(this.current + 1);
  }

  private advance(): string {
    return this.source.charAt(this.current++);
  }

  private addToken(type: TokenType, literal: any = null): void {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(new TokenImpl(type, text, literal, this.line));
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }
}