import { transpile } from './transpiler';

console.log('=== Testing For-In Loops ===\n');

// Test 1: for-in with index and item
console.log('Test 1: for (i, item in items)');
const test1 = `
var items = [10, 20, 30, 40, 50]

for (i, item in items)
  print(i)
  print(item)
end
`;
console.log('Input:');
console.log(test1);
console.log('Output:');
console.log(transpile(test1));
console.log('---\n');

// Test 2: for-in with just item
console.log('Test 2: for (item in items)');
const test2 = `
var names = ["Alice", "Bob", "Charlie"]

for (name in names)
  print(name)
end
`;
console.log('Input:');
console.log(test2);
console.log('Output:');
console.log(transpile(test2));
console.log('---\n');

// Test 3: for-in with array literal
console.log('Test 3: for-in with array literal');
const test3 = `
for (i, num in [1, 2, 3, 4, 5])
  print(num)
end
`;
console.log('Input:');
console.log(test3);
console.log('Output:');
console.log(transpile(test3));
console.log('---\n');

// Test 4: C-style for loop still works
console.log('Test 4: C-style for loop (should still work)');
const test4 = `
for (var i = 0; i < 5; i++)
  print(i)
end
`;
console.log('Input:');
console.log(test4);
console.log('Output:');
console.log(transpile(test4));
console.log('---\n');

// Test 5: Nested for-in loops
console.log('Test 5: Nested for-in loops');
const test5 = `
var matrix = [[1, 2], [3, 4], [5, 6]]

for (row in matrix)
  for (cell in row)
    print(cell)
  end
end
`;
console.log('Input:');
console.log(test5);
console.log('Output:');
console.log(transpile(test5));
console.log('---\n');

// Test 6: for-in with index for accessing other arrays
console.log('Test 6: for-in with index accessing parallel array');
const test6 = `
var names = ["Alice", "Bob", "Charlie"]
var ages = [25, 30, 35]

for (i, name in names)
  print(name)
  print(ages)
end
`;
console.log('Input:');
console.log(test6);
console.log('Output:');
console.log(transpile(test6));
console.log('---\n');
