import { transpile } from './transpiler';

console.log('=== Testing NOT, Lists, and Objects ===\n');

// Test 1: NOT operator
console.log('Test 1: NOT operator');
const test1 = `
var is_alive = true

if (not is_alive)
  print("Game Over")
else
  print("Playing")
end
`;
console.log('Input:');
console.log(test1);
console.log('Output:');
console.log(transpile(test1));
console.log('---\n');

// Test 2: NOT with comparison
console.log('Test 2: NOT with comparison');
const test2 = `
var x = 10

if (not (x > 20))
  print("x is not greater than 20")
end
`;
console.log('Input:');
console.log(test2);
console.log('Output:');
console.log(transpile(test2));
console.log('---\n');

// Test 3: List literals
console.log('Test 3: List literals');
const test3 = `
var numbers = [1, 2, 3, 4, 5]
var names = ["Alice", "Bob", "Charlie"]
var mixed = [1, "two", 3]

print(numbers)
print(names)
`;
console.log('Input:');
console.log(test3);
console.log('Output:');
console.log(transpile(test3));
console.log('---\n');

// Test 4: Object literals
console.log('Test 4: Object literals');
const test4 = `
var player = {x: 100, y: 200, health: 100}
var config = {speed: 5, gravity: 9.8}

print(player)
print(config)
`;
console.log('Input:');
console.log(test4);
console.log('Output:');
console.log(transpile(test4));
console.log('---\n');

// Test 5: Lists with expressions
console.log('Test 5: Lists with expressions');
const test5 = `
var a = 10
var b = 20
var sum = a + b
var list = [a, b, sum, a * 2]

print(list)
`;
console.log('Input:');
console.log(test5);
console.log('Output:');
console.log(transpile(test5));
console.log('---\n');

// Test 6: Objects with expressions
console.log('Test 6: Objects with expressions');
const test6 = `
var x = 50
var y = 100
var sprite = {x: x, y: y, speed: x + y}

print(sprite)
`;
console.log('Input:');
console.log(test6);
console.log('Output:');
console.log(transpile(test6));
console.log('---\n');

// Test 7: Combined NOT with AND/OR
console.log('Test 7: Combined NOT with AND/OR');
const test7 = `
var is_running = true
var score = 50

if (not is_running and score > 0)
  print("Paused with score")
end

if (is_running or not (score == 0))
  print("Active or has score")
end
`;
console.log('Input:');
console.log(test7);
console.log('Output:');
console.log(transpile(test7));
console.log('---\n');

// Test 8: Empty lists and objects
console.log('Test 8: Empty lists and objects');
const test8 = `
var empty_list = []
var empty_obj = {}

print(empty_list)
print(empty_obj)
`;
console.log('Input:');
console.log(test8);
console.log('Output:');
console.log(transpile(test8));
console.log('---\n');
