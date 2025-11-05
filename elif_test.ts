import { transpile } from './transpiler';

console.log('=== Testing elif keyword ===\n');

const test = `
var score = 75

if (score >= 90)
  print("A")
elif (score >= 80)
  print("B")
elif (score >= 70)
  print("C")
else
  print("F")
end
`;

console.log('Input:');
console.log(test);
console.log('\nOutput:');
console.log(transpile(test));
