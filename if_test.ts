import { transpile } from './transpiler';

console.log('=== Testing If Statements ===\n');

// Test 1: Simple if statement
console.log('Test 1: Simple if statement');
const test1 = `
var x = 10
if (x > 5)
  print(x)
end
`;
console.log('Input:');
console.log(test1);
console.log('Output:');
console.log(transpile(test1));
console.log('---\n');

// Test 2: If with multiple conditions using AND
console.log('Test 2: If with AND condition');
const test2 = `
var sprite_x = 500
var player_health = 100

if (sprite_x > 400 and player_health > 0)
  print(sprite_x)
  print(player_health)
end
`;
console.log('Input:');
console.log(test2);
console.log('Output:');
console.log(transpile(test2));
console.log('---\n');

// Test 3: If with multiple conditions using OR
console.log('Test 3: If with OR condition');
const test3 = `
var score = 100
var lives = 0

if (score > 50 or lives > 0)
  print(score)
end
`;
console.log('Input:');
console.log(test3);
console.log('Output:');
console.log(transpile(test3));
console.log('---\n');

// Test 4: If-else statement
console.log('Test 4: If-else statement');
const test4 = `
var health = 50

if (health > 0)
  print(health)
else
  print(0)
end
`;
console.log('Input:');
console.log(test4);
console.log('Output:');
console.log(transpile(test4));
console.log('---\n');

// Test 5: If-elseif-else statement
console.log('Test 5: If-elseif-else statement');
const test5 = `
var score = 75

if (score >= 90)
  print("A")
elseif (score >= 80)
  print("B")
elseif (score >= 70)
  print("C")
else
  print("F")
end
`;
console.log('Input:');
console.log(test5);
console.log('Output:');
console.log(transpile(test5));
console.log('---\n');

// Test 6: Complex condition
console.log('Test 6: Complex condition with AND/OR');
const test6 = `
var x = 100
var y = 200
var z = 50

if ((x > 50 and y > 150) or z < 100)
  print(x)
  var result = x + y
  print(result)
end
`;
console.log('Input:');
console.log(test6);
console.log('Output:');
console.log(transpile(test6));
console.log('---\n');

// Test 7: Comparison operators
console.log('Test 7: All comparison operators');
const test7 = `
var a = 10
var b = 20

if (a == 10)
  print("equal")
end

if (a != b)
  print("not equal")
end

if (a < b)
  print("less than")
end

if (b >= 20)
  print("greater or equal")
end
`;
console.log('Input:');
console.log(test7);
console.log('Output:');
console.log(transpile(test7));
console.log('---\n');
