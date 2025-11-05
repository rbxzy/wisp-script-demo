import { transpile } from './transpiler';

// Example: Transpiling WispScript code from a single string
// This is how you'll integrate it with CodeMirror

const wispScriptCode = `func sum(a,b)
	return a + b
end

var x = 10
var y = 5
var result = sum(x, y)
print(result)

var calculation = 2 + 3 * 4
print(calculation)`;

console.log('🌟 Single String Transpilation Example\n');
console.log('WispScript Input:');
console.log(wispScriptCode);
console.log('\n' + '─'.repeat(50) + '\n');
console.log('TypeScript Output:');
console.log(transpile(wispScriptCode));

console.log('\n' + '─'.repeat(50));
console.log('\n✅ Ready for CodeMirror integration!');
console.log('Simply call transpile(editorContent) to convert WispScript to TypeScript');