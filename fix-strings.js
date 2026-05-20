const fs = require('fs');
const path = require('path');

const sectionsDir = path.join(__dirname, 'packages', 'server', 'src', 'engine', 'sections');
const files = fs.readdirSync(sectionsDir).filter(f => f.endsWith('.ts') && !f.includes('BaseSection') && f !== 'index.ts');

for (const file of files) {
  const filePath = path.join(sectionsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Find adjacent single-quoted strings and insert + between them
  // Pattern: line ending with ' followed by optional whitespace, then line starting with '
  const lines = content.split('\n');
  const newLines = [];
  for (let i = 0; i < lines.length; i++) {
    newLines.push(lines[i]);

    // Check if this line ends with a single-quoted string (within a function call)
    // and the next line starts with a single-quoted string at similar indentation
    if (i + 1 < lines.length) {
      const thisLine = lines[i];
      const nextLine = lines[i + 1];

      // Both lines should be single-quoted string continuations
      const thisTrimmed = thisLine.trimEnd();
      const nextTrimmedTrimmed = nextLine.trimStart();

      if (thisTrimmed.endsWith("'") && nextTrimmedTrimmed.startsWith("'") &&
          !thisTrimmed.endsWith("\\'") && !thisTrimmed.endsWith("+'") &&
          thisTrimmed.includes("'") && nextTrimmedTrimmed.includes("'")) {
        // Add + to the end of this line
        newLines[newLines.length - 1] = thisTrimmed + ' +';
      }
    }
  }

  const newContent = newLines.join('\n');
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`Fixed: ${file}`);
  } else {
    console.log(`No changes: ${file}`);
  }
}
console.log('Done');
