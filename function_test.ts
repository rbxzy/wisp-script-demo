import { transpile } from './transpiler';

console.log('=== Testing Function Support ===\n');

const functionTests = [
  `func sum(a, b)
  return a + b
end`,

  `func multiply(x, y)
  var result = x * y
  return result
end`,

  `func greet()
  print(42)
end`,

  `func complex(a, b, c)
  var temp = a + b
  var result = temp * c
  return result
end`,

  // Test with variable declaration and function call
  `func add(a, b)
  return a + b
end

var x = 5
var y = 3
print(add(x, y))`
];

functionTests.forEach((test, index) => {
  console.log(`Function Test ${index + 1}:`);
  console.log('WispScript:');
  console.log(test);
  console.log('\nTranspiled TypeScript:');
  
  try {
    const result = transpile(test);
    console.log(result);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
  
  console.log('\n' + '─'.repeat(60) + '\n');
});