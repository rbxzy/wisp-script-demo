import { transpile } from './transpiler';

function runTest(name: string, wispCode: string, expectedOutput?: string) {
  console.log(`\n=== ${name} ===`);
  console.log('WispScript:');
  console.log(wispCode);
  
  try {
    const result = transpile(wispCode);
    console.log('TypeScript:');
    console.log(result);
    
    if (expectedOutput && result.trim() !== expectedOutput.trim()) {
      console.log('❌ FAILED - Expected:');
      console.log(expectedOutput);
    } else if (expectedOutput) {
      console.log('✅ PASSED');
    }
  } catch (error) {
    console.log('❌ ERROR:', error);
  }
}

// Test cases
function runAllTests() {
  console.log('🧪 Running WispScript Transpiler Tests\n');

  // Test 1: Simple variable declaration
  runTest(
    'Simple Variable Declaration',
    'var a = 10',
    'let a: number = 10;'
  );

  // Test 2: Variable with expression
  runTest(
    'Variable with Expression',
    'var result = 10 + 2',
    'let result: number = (10 + 2);'
  );

  // Test 3: Complex expression
  runTest(
    'Complex Expression',
    'var calc = 5 * 3 + 2',
    'let calc: number = ((5 * 3) + 2);'
  );

  // Test 4: Print statement
  runTest(
    'Print Statement',
    'print(42)',
    'console.log(42);'
  );

  // Test 5: Print variable
  runTest(
    'Print Variable',
    'var x = 15\nprint(x)',
    'let x: number = 15;\nconsole.log(x);'
  );

  // Test 6: Multiple statements
  runTest(
    'Multiple Statements',
    'var a = 10\nvar b = 20\nvar sum = a + b\nprint(sum)',
    'let a: number = 10;\nlet b: number = 20;\nlet sum: number = (a + b);\nconsole.log(sum);'
  );

  // Test 7: Parenthesized expression
  runTest(
    'Parenthesized Expression',
    'var result = (10 + 5) * 2',
    'let result: number = (((10 + 5)) * 2);'
  );

  // Test 8: Unary minus
  runTest(
    'Unary Minus',
    'var negative = -42',
    'let negative: number = (-42);'
  );

  // Test 9: Division
  runTest(
    'Division',
    'var half = 10 / 2',
    'let half: number = (10 / 2);'
  );

  // Test 10: Mixed operations
  runTest(
    'Mixed Operations',
    'var complex = 10 + 5 * 2 - 3',
    'let complex: number = ((10 + (5 * 2)) - 3);'
  );

  console.log('\n🎉 All tests completed!');
}

// Run the tests
runAllTests();

// Export for use in other files
export { runTest, runAllTests };