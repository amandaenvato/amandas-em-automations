#!/usr/bin/env node

/**
 * Test script to verify the pattern matching logic for large file responses
 * This simulates what an agent would do when encountering the "Large output has been written to:" message
 */

function extractFilePath(message) {
  const pattern = /Large output has been written to:\s+(.+?)\s*\(/;
  const match = message.match(pattern);
  return match ? match[1].trim() : null;
}

// Test cases
const testCases = [
  {
    input: 'Large output has been written to: /Users/jonathanwilliams/.cursor/projects/Users-jonathanwilliams-Development-envato-em-automations/agent-tools/c3ed6411-95cb-4cd8-9aa7-611288fb77dd.txt (55.9 KB, 871 lines)',
    expected: '/Users/jonathanwilliams/.cursor/projects/Users-jonathanwilliams-Development-envato-em-automations/agent-tools/c3ed6411-95cb-4cd8-9aa7-611288fb77dd.txt'
  },
  {
    input: 'Large output has been written to: /tmp/file.txt (10 KB, 100 lines)',
    expected: '/tmp/file.txt'
  },
  {
    input: 'Some other message without the pattern',
    expected: null
  }
];

console.log('Testing pattern matching for large file responses...\n');

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const result = extractFilePath(testCase.input);
  const success = result === testCase.expected;

  if (success) {
    console.log(`✓ Test ${index + 1} passed`);
    passed++;
  } else {
    console.log(`✗ Test ${index + 1} failed`);
    console.log(`  Input: ${testCase.input}`);
    console.log(`  Expected: ${testCase.expected}`);
    console.log(`  Got: ${result}`);
    failed++;
  }
});

console.log(`\nResults: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('\n✓ All tests passed! The pattern matching logic works correctly.');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed. Please review the pattern matching logic.');
  process.exit(1);
}

