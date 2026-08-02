const fs = require('fs');
let content = fs.readFileSync('scripts/seed-new-lessons.js', 'utf8');

// Fix single-quoted strings containing apostrophes by converting them to template literals
// Pattern: content: '<p>...apostrophe...',
// Replace with: content: `<p>...apostrophe...`,
let fixed = 0;
const lines = content.split('\n');
const result = lines.map((line, i) => {
  // Find lines with content: '...' that contain apostrophe issues
  // The issue is single-quoted strings with Turkish apostrophes inside
  const match = line.match(/^(\s*content: )'(.*)'(,?\s*)$/);
  if (match) {
    const inner = match[2];
    // Check if inner content would cause issues (contains unescaped single quotes)
    if (inner.includes("'")) {
      fixed++;
      console.log(`Line ${i+1}: Fixed apostrophe issue`);
      // Use backtick template literal instead
      return `${match[1]}\`${inner}\`${match[3]}`;
    }
  }
  return line;
});

fs.writeFileSync('scripts/seed-new-lessons.js', result.join('\n'));
console.log(`\nFixed ${fixed} lines.`);
