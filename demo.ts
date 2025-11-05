import { transpile } from './transpiler';

console.log('🌟 WispScript Transpiler Demo\n');

// Demo examples
const examples = [
  {
    name: 'Simple Variable',
    code: 'var a = 10'
  },
  {
    name: 'Math Expression',
    code: 'var result = 10 + 2 * 3'
  },
  {
    name: 'Print Statement',
    code: 'print(42)'
  },
  {
    name: 'Complete Program',
    code: `var x = 5
var y = 3
var sum = x + y
print(sum)`
  },
  {
    name: 'Complex Expression',
    code: 'var calc = (10 + 5) * 2 - 8 / 4'
  },
  {
    name: 'Simple Function',
    code: `func sum(a, b)
  return a + b
end`
  },
  {
    name: 'Function with Variables',
    code: `func multiply(x, y)
  var result = x * y
  return result
end`
  },
  {
    name: 'Complete Function Example',
    code: `func add(a, b)
  return a + b
end

var x = 5
var y = 3
print(add(x, y))`
  }
];

examples.forEach((example, index) => {
  console.log(`${index + 1}. ${example.name}`);
  console.log('WispScript:');
  console.log(example.code);
  console.log('\nTranspiled TypeScript:');
  
  try {
    const result = transpile(example.code);
    console.log(result);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
  
  console.log('\n' + '─'.repeat(50) + '\n');
});

console.log('✨ Demo completed! Try your own WispScript code by calling transpile()');