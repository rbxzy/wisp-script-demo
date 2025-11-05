import { Lexer } from './lexer';
import { Parser } from './parser';
import { TypeScriptGenerator } from './generator';
/**
 * Transpiles WispScript source code to TypeScript
 * @param source The WispScript source code
 * @returns The generated TypeScript code
 */
export function transpile(source) {
    try {
        // Lexical analysis
        const lexer = new Lexer(source);
        const tokens = lexer.scanTokens();
        // Parsing
        const parser = new Parser(tokens);
        const statements = parser.parse();
        // Code generation
        const generator = new TypeScriptGenerator();
        const result = generator.generate(statements);
        return result;
    }
    catch (error) {
        throw new Error(`Transpilation failed: ${error instanceof Error ? error.message : error}`);
    }
}
// Re-export the main function for convenience
export { transpile as default };
