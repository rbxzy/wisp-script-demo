import { transpile } from './transpiler';

const tests = [
  `if (not false)
  print("test")
end`,
  `if (not sprite.hidden)
  print("visible")
end`,
  `var x = 10
if (not x > 5)
  print("test")
end`,
  `if (not (x > 5))
  print("test")
end`,
  `if (key_down("Space") and not sprite.hidden)
  print("test")
end`
];

tests.forEach((code, i) => {
  console.log(`\n=== Test ${i + 1} ===`);
  console.log(code);
  console.log('---');
  try {
    const result = transpile(code);
    console.log('Success:');
    console.log(result);
  } catch (error) {
    console.log('Error:', error.message);
  }
});
