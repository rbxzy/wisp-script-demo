import { transpile } from './transpiler';

console.log('=== Testing Global Functions and Variables ===\n');

// Test 1: Global function declaration
console.log('Test 1: Global function declaration');
const test1 = `
global func spawnParticles(costumeName, x, y)
  print(costumeName)
  print(x)
  print(y)
end
`;
console.log('Input:');
console.log(test1);
console.log('Output:');
console.log(transpile(test1));
console.log('---\n');

// Test 2: Calling global function
console.log('Test 2: Calling global function');
const test2 = `
global func spawnParticles(costumeName, x, y)
  print(costumeName)
end

globals.spawnParticles("Wispy", 0, 0)
`;
console.log('Input:');
console.log(test2);
console.log('Output:');
console.log(transpile(test2));
console.log('---\n');

// Test 3: Global variable
console.log('Test 3: Global variable');
const test3 = `
global var score = 0

func updateScore()
  globals.score += 10
  print(globals.score)
end
`;
console.log('Input:');
console.log(test3);
console.log('Output:');
console.log(transpile(test3));
console.log('---\n');

// Test 4: Multiple global functions
console.log('Test 4: Multiple global functions');
const test4 = `
global func init()
  print("Game initialized")
end

global func cleanup()
  print("Game cleanup")
end

globals.init()
globals.cleanup()
`;
console.log('Input:');
console.log(test4);
console.log('Output:');
console.log(transpile(test4));
console.log('---\n');

// Test 5: Accessing globals in different contexts
console.log('Test 5: Using globals with property access');
const test5 = `
global var playerHealth = 100

func damage(amount)
  globals.playerHealth -= amount
  if (globals.playerHealth <= 0)
    print("Game Over")
  end
end

damage(50)
`;
console.log('Input:');
console.log(test5);
console.log('Output:');
console.log(transpile(test5));
console.log('---\n');

// Test 6: Regular functions vs global functions
console.log('Test 6: Mix of regular and global functions');
const test6 = `
func localHelper()
  print("Local function")
end

global func globalHelper()
  print("Global function")
end

localHelper()
globals.globalHelper()
`;
console.log('Input:');
console.log(test6);
console.log('Output:');
console.log(transpile(test6));
console.log('---\n');
