import { transpile } from './transpiler';

console.log('=== Testing Compile-time Evaluation ===\n');

const tests = [
  'var a = 10 + 2',
  'var result = (5 + 3) * 2 - 1', 
  'var c = a + b',
  'print(10 * 3)',
  'var negative = -42',
  'var division = 20 / 4'
];

tests.forEach((test, index) => {
  console.log(`Test ${index + 1}: ${test}`);
  console.log('Output:', transpile(test));
  console.log('');
});