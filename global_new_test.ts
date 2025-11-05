import { transpile } from './transpiler';

console.log('=== Testing Updated Global Syntax ===\n');

// Test 1: Global function declaration
console.log('Test 1: Declare global function');
const test1 = `
global func spawnParticles(costumeName, x, y)
  print(costumeName)
end
`;
console.log('Input:');
console.log(test1);
console.log('Output:');
console.log(transpile(test1));
console.log('---\n');

// Test 2: Call global function using "global" prefix
console.log('Test 2: Call global function with global prefix');
const test2 = `
global func spawnParticles(costumeName, x, y)
  print(costumeName)
end

global spawnParticles("Wispy", 0, 0)
`;
console.log('Input:');
console.log(test2);
console.log('Output:');
console.log(transpile(test2));
console.log('---\n');

// Test 3: Global variable declaration and access
console.log('Test 3: Global variable declaration and access');
const test3 = `
global var score = 0

func updateScore()
  global score += 10
  print(global score)
end
`;
console.log('Input:');
console.log(test3);
console.log('Output:');
console.log(transpile(test3));
console.log('---\n');

// Test 4: Global variable access in expressions
console.log('Test 4: Global variable in conditional');
const test4 = `
global var playerHealth = 100

func damage(amount)
  global playerHealth -= amount
  if (global playerHealth <= 0)
    print("Game Over")
  end
end
`;
console.log('Input:');
console.log(test4);
console.log('Output:');
console.log(transpile(test4));
console.log('---\n');

// Test 5: Multiple global declarations and calls
console.log('Test 5: Multiple globals');
const test5 = `
global var lives = 3
global var score = 0

global func addScore(points)
  global score += points
end

global func loseLife()
  global lives -= 1
  if (global lives <= 0)
    print("Game Over")
  end
end

global addScore(100)
global loseLife()
`;
console.log('Input:');
console.log(test5);
console.log('Output:');
console.log(transpile(test5));
console.log('---\n');

// Test 6: Global in for loop
console.log('Test 6: Global in for loop');
const test6 = `
global var enemies = [1, 2, 3]

for (enemy in global enemies)
  print(enemy)
end
`;
console.log('Input:');
console.log(test6);
console.log('Output:');
console.log(transpile(test6));
console.log('---\n');
