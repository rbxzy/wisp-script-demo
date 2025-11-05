import { transpile } from './transpiler';

console.log('=== Testing Math Functions ===\n');

const test = `
// Random functions
var r1 = random()
var r2 = randrange(100)
var r3 = randrange(10, 50)

// Rounding functions
var a = floor(3.7)
var b = ceil(3.2)
var c = round(3.5)

// Other math
var distance = sqrt(pow(x, 2) + pow(y, 2))
var maximum = max(10, 20, 30)
var minimum = min(5, 3, 8)
var absolute = abs(-42)

// Trig
var angle = atan2(y, x)
var sine = sin(angle)
var cosine = cos(angle)

func calculateDistance(x1, y1, x2, y2)
  var dx = x2 - x1
  var dy = y2 - y1
  return sqrt(pow(dx, 2) + pow(dy, 2))
end

// Using in expressions
if (random() < 0.5)
  print("Heads")
else
  print("Tails")
end

var particleCount = floor(randrange(5, 12))
`;

console.log('Input:');
console.log(test);
console.log('\nOutput:');
console.log(transpile(test));
