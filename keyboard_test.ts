import { transpile } from './transpiler';

console.log('=== Testing key_down and key_up ===\n');

// Test 1: key_down in if statement
console.log('Test 1: key_down in if statement');
const test1 = `
if (key_down("UpArrow"))
  sprite.y -= 10
end
`;
console.log('Input:');
console.log(test1);
console.log('Output:');
console.log(transpile(test1));
console.log('---\n');

// Test 2: Multiple key checks
console.log('Test 2: Multiple key checks');
const test2 = `
if (key_down("UpArrow"))
  sprite.y -= 10
end

if (key_down("DownArrow"))
  sprite.y += 10
end

if (key_down("LeftArrow"))
  sprite.x -= 10
end

if (key_down("RightArrow"))
  sprite.x += 10
end
`;
console.log('Input:');
console.log(test2);
console.log('Output:');
console.log(transpile(test2));
console.log('---\n');

// Test 3: key_up
console.log('Test 3: key_up');
const test3 = `
if (key_up("Space"))
  sprite.jump()
end
`;
console.log('Input:');
console.log(test3);
console.log('Output:');
console.log(transpile(test3));
console.log('---\n');

// Test 4: Combined with logical operators
console.log('Test 4: Combined with AND');
const test4 = `
if (key_down("Shift") and key_down("W"))
  sprite.speed = 20
end
`;
console.log('Input:');
console.log(test4);
console.log('Output:');
console.log(transpile(test4));
console.log('---\n');

// Test 5: In function
console.log('Test 5: In function');
const test5 = `
func handleInput()
  if (key_down("A"))
    sprite.x -= 5
  elseif (key_down("D"))
    sprite.x += 5
  end
  
  if (key_down("W"))
    sprite.y -= 5
  elseif (key_down("S"))
    sprite.y += 5
  end
end
`;
console.log('Input:');
console.log(test5);
console.log('Output:');
console.log(transpile(test5));
console.log('---\n');

// Test 6: Various keys
console.log('Test 6: Various keys');
const test6 = `
if (key_down("Enter"))
  print("Enter pressed")
end

if (key_down("Escape"))
  print("Escape pressed")
end

if (key_down("Space"))
  print("Space pressed")
end
`;
console.log('Input:');
console.log(test6);
console.log('Output:');
console.log(transpile(test6));
console.log('---\n');
