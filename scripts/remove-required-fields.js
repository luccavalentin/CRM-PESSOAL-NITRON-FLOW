/**
 * Script para remover todos os campos required dos formulários
 * Execute: node scripts/remove-required-fields.js
 */

const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, '../app');

function removeRequiredFromFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remove required attribute
    content = content.replace(/\s+required\s+/g, ' ');
    content = content.replace(/\s+required>/g, '>');
    content = content.replace(/required\s+/g, '');
    
    // Remove asterisco dos labels
    content = content.replace(/(<label[^>]*>)([^*]+)\s*\*\s*(<\/label>)/g, '$1$2$3');
    content = content.replace(/(label[^>]*>)([^*]+)\s*\*\s*(<\/label>)/g, '$1$2$3');
    
    if (content !== fs.readFileSync(filePath, 'utf8')) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Atualizado: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Erro ao processar ${filePath}:`, error.message);
    return false;
  }
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

console.log('Removendo campos required de todos os arquivos...\n');
const files = walkDir(appDir);
let count = 0;

files.forEach(file => {
  if (removeRequiredFromFile(file)) {
    count++;
  }
});

console.log(`\n✓ ${count} arquivos atualizados!`);


