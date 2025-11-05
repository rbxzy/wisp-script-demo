import { transpile } from './transpiler';

console.log('=== Testing Global Simple Assignment ===\n');

const test = `
global score = 0

func updateScore()
  global score = 100
  global lives = 3
  print(global score)
end

updateScore()
`;

console.log('Input:');
console.log(test);
console.log('\nOutput:');
console.log(transpile(test));
