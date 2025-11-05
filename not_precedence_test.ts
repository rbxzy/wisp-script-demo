import { transpile } from './transpiler';

console.log('=== Testing NOT Operator Precedence ===\n');

// Test 1: NOT with comparison
console.log('Test 1: not sprite.x > 500');
const test1 = `
if (not sprite.x > 500)
  print("test")
end
`;
console.log('Input:');
console.log(test1);
console.log('Output:');
console.log(transpile(test1));
console.log('Expected: (!(sprite.x > 500))');
console.log('---\n');

// Test 2: NOT with parentheses (correct usage)
console.log('Test 2: not (sprite.x > 500)');
const test2 = `
if (not (sprite.x > 500))
  print("test")
end
`;
console.log('Input:');
console.log(test2);
console.log('Output:');
console.log(transpile(test2));
console.log('---\n');

// Test 3: NOT with variable
console.log('Test 3: not is_alive');
const test3 = `
if (not is_alive)
  print("test")
end
`;
console.log('Input:');
console.log(test3);
console.log('Output:');
console.log(transpile(test3));
console.log('---\n');
