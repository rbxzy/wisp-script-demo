import { transpile } from './transpiler';

console.log('=== Testing For and While Loops ===\n');

// Test 1: Simple for loop with var declaration
console.log('Test 1: For loop with var declaration');
const test1 = `
for (var i = 0; i < 10; i++)
  print(i)
end
`;
console.log('Input:');
console.log(test1);
console.log('Output:');
console.log(transpile(test1));
console.log('---\n');

// Test 2: For loop with existing variable
console.log('Test 2: For loop with existing variable');
const test2 = `
var i = 0
for (i = 0; i < 5; i++)
  print(i)
end
`;
console.log('Input:');
console.log(test2);
console.log('Output:');
console.log(transpile(test2));
console.log('---\n');

// Test 3: For loop with increment
console.log('Test 3: For loop with i += 2');
const test3 = `
for (var i = 0; i < 10; i += 2)
  print(i)
end
`;
console.log('Input:');
console.log(test3);
console.log('Output:');
console.log(transpile(test3));
console.log('---\n');

// Test 4: Simple while loop
console.log('Test 4: Simple while loop');
const test4 = `
var count = 0
while (count < 5)
  print(count)
  count++
end
`;
console.log('Input:');
console.log(test4);
console.log('Output:');
console.log(transpile(test4));
console.log('---\n');

// Test 5: While with complex condition
console.log('Test 5: While with complex condition');
const test5 = `
var x = 10
var y = 20
while (x < y and x > 0)
  print(x)
  x += 1
end
`;
console.log('Input:');
console.log(test5);
console.log('Output:');
console.log(transpile(test5));
console.log('---\n');

// Test 6: For loop iterating over range
console.log('Test 6: For loop with array access');
const test6 = `
var items = [1, 2, 3, 4, 5]
for (var i = 0; i < 5; i++)
  print(items)
end
`;
console.log('Input:');
console.log(test6);
console.log('Output:');
console.log(transpile(test6));
console.log('---\n');

// Test 7: Nested loops
console.log('Test 7: Nested for loops');
const test7 = `
for (var i = 0; i < 3; i++)
  for (var j = 0; j < 3; j++)
    print(i)
    print(j)
  end
end
`;
console.log('Input:');
console.log(test7);
console.log('Output:');
console.log(transpile(test7));
console.log('---\n');

// Test 8: While with keyboard input
console.log('Test 8: While with keyboard');
const test8 = `
var running = true
while (running)
  if (key_down("Escape"))
    running = false
  end
  
  if (key_down("Space"))
    print("Jump")
  end
end
`;
console.log('Input:');
console.log(test8);
console.log('Output:');
console.log(transpile(test8));
console.log('---\n');

// Test 9: For loop with empty parts
console.log('Test 9: For loop with empty condition (infinite)');
const test9 = `
for (var i = 0; ; i++)
  if (i > 5)
    print("break")
  end
end
`;
console.log('Input:');
console.log(test9);
console.log('Output:');
console.log(transpile(test9));
console.log('---\n');
