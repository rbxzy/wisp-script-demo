# WispScript Transpiler

A simple transpiler that converts WispScript code to TypeScript, built using the principles from "Crafting Interpreters".

## Features

- **Variables**: Declare variables with type inference
- **Math Operations**: Support for `+`, `-`, `*`, `/`
- **Print Function**: Output values to console
- **Expression Evaluation**: Proper operator precedence
- **Type Inference**: Basic TypeScript type annotation
- **Functions**: Define and call functions with parameters
- **Compile-time Evaluation**: Constant expressions are computed at transpile time

## WispScript Syntax

### Variable Declaration
```wisp
var a = 10
var result = 10 + 2 * 3
```

### Print Function
```wisp
print(42)
print(result)
```

### Math Expressions
```wisp
var calc = (10 + 5) * 2 - 8 / 4
var negative = -42
```

### Functions
```wisp
func sum(a, b)
  return a + b
end

func multiply(x, y)
  var result = x * y
  return result
end
```

## TypeScript Output

WispScript `var a = 10 + 2` becomes TypeScript `let a: number = 12;`

WispScript functions:
```wisp
func sum(a, b)
  return a + b
end
```

Become TypeScript:
```typescript
function sum(a: number, b: number) {
  return (a + b);
}
```

## Usage

```typescript
import { transpile } from './transpiler';

const wispCode = `
var x = 5
var y = 3
var sum = x + y
print(sum)
`;

const typeScriptCode = transpile(wispCode);
console.log(typeScriptCode);
```

Output:
```typescript
let x: number = 5;
let y: number = 3;
let sum: number = (x + y);
console.log(sum);
```

## Running the Project

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the demo:
   ```bash
   npm run demo
   ```

3. Run tests:
   ```bash
   npm run test
   ```

## Architecture

The transpiler follows the classic interpreter architecture:

1. **Lexer** (`lexer.ts`) - Tokenizes the source code
2. **Parser** (`parser.ts`) - Builds an Abstract Syntax Tree (AST)
3. **Generator** (`generator.ts`) - Generates TypeScript code from the AST
4. **Transpiler** (`transpiler.ts`) - Orchestrates the pipeline

## Grammar

```
program        → declaration* EOF ;

declaration    → varDecl
               | statement ;

varDecl        → "var" IDENTIFIER ( "=" expression )? ;

statement      → exprStmt
               | printStmt ;

printStmt      → "print" "(" expression ")" ;
exprStmt       → expression ;

expression     → addition ;
addition       → multiplication ( ( "-" | "+" ) multiplication )* ;
multiplication → unary ( ( "/" | "*" ) unary )* ;
unary          → ( "-" ) unary
               | call ;
call           → primary ( "(" arguments? ")" )* ;
primary        → NUMBER | IDENTIFIER | "(" expression ")" ;
```

## File Structure

```
wisp_script/
├── tokens.ts      # Token definitions
├── lexer.ts       # Lexical analyzer
├── ast.ts         # AST node definitions
├── parser.ts      # Recursive descent parser
├── generator.ts   # TypeScript code generator
├── transpiler.ts  # Main transpile function
├── test.ts        # Test cases
├── demo.ts        # Usage examples
├── index.ts       # Main entry point
├── package.json   # Project configuration
└── README.md      # This file
```

## License

MIT