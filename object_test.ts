import { transpile } from './transpiler';

console.log('=== Testing Object Literals ===\n');

// Test 1: Simple object
console.log('Test 1: Simple object');
const test1 = `
var point = {x: 10, y: 20}
`;
console.log('Input:', test1);
try {
  console.log('Output:', transpile(test1));
} catch (e) {
  console.log('Error:', e.message);
}
console.log('---\n');

// Test 2: Object with trailing comma
console.log('Test 2: Object with trailing comma');
const test2 = `
var data = {
  vx: 5,
  vy: 10,
  lifespan: 100,
  age: 0,
}
`;
console.log('Input:', test2);
try {
  console.log('Output:', transpile(test2));
} catch (e) {
  console.log('Error:', e.message);
}
console.log('---\n');

// Test 3: Nested object
console.log('Test 3: Function returning object');
const test3 = `
func vector(x, y)
  return {x: x, y: y}
end
`;
console.log('Input:', test3);
try {
  console.log('Output:', transpile(test3));
} catch (e) {
  console.log('Error:', e.message);
}
console.log('---\n');
