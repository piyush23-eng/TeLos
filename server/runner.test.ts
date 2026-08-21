import assert from 'node:assert/strict';
import { runCodeSnippet } from './runner';

const result = await runCodeSnippet(`
function solve(nums) {
  return nums.reduce((sum, value) => sum + value, 0);
}
console.log(solve([1, 2, 3]));
`, 'demo');

assert.equal(result.status, 'ok');
assert.match(result.output, /6/);
console.log('runner smoke test OK');
