// Script to help identify common text node errors
const fs = require('fs');
const path = require('path');

function findTextNodeErrors(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findTextNodeErrors(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for common patterns that cause text node errors
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        // Look for stray periods or text
        if (line.includes('&&') && line.includes('.') && !line.includes('<Text')) {
          console.log(`Potential issue in ${filePath}:${index + 1}`);
          console.log(`Line: ${line.trim()}`);
        }
        
        // Look for text that might not be wrapped
        if (line.includes('>') && !line.includes('<Text') && !line.includes('</') && !line.includes('/>')) {
          const afterBracket = line.split('>')[1];
          if (afterBracket && afterBracket.trim() && !afterBracket.includes('<')) {
            console.log(`Potential unwrapped text in ${filePath}:${index + 1}`);
            console.log(`Line: ${line.trim()}`);
          }
        }
      });
    }
  });
}

// Run the check
console.log('Checking for text node errors...');
findTextNodeErrors('./app');
findTextNodeErrors('./components');