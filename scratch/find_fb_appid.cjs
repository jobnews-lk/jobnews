const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.git' || file === 'dist') continue;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath);
    } else if (file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.json')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes('fb:app_id') || content.includes('app_id') || content.includes('966843648900000')) {
        console.log('FOUND MATCH IN:', fullPath);
      }
    }
  }
}

searchDir(path.join(__dirname, '..'));
