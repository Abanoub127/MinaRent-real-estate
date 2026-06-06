const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('./app', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content
      .replace(/\/ui\/Button/g, '/ui/button')
      .replace(/\/ui\/Card/g, '/ui/card')
      .replace(/\/ui\/Input/g, '/ui/input')
      .replace(/\/ui\/Badge/g, '/ui/badge');
    
    // Also handle relative imports like './Button' inside app/components/ui
    if (filePath.includes('components\\\\ui') || filePath.includes('components/ui')) {
      newContent = newContent.replace(/from '\.\/Button'/g, "from './button'");
      newContent = newContent.replace(/from "\.\/Button"/g, 'from "./button"');
      newContent = newContent.replace(/from '\.\/Input'/g, "from './input'");
      newContent = newContent.replace(/from "\.\/Input"/g, 'from "./input"');
    }

    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Fixed:', filePath);
    }
  }
});
