/**
 * Advanced Duplication Reducer
 * Targets specific patterns for maximum duplication reduction
 */
const fs = require('fs');
const path = require('path');

// Advanced duplicate detection patterns
const DUPLICATION_PATTERNS = {
  // Import patterns that can be consolidated
  imports: [
    /import\s+{\s*(\w+)\s*}\s+from\s+['"][^'"]+['"]/g,
    /import\s+\*\s+as\s+(\w+)\s+from\s+['"][^'"]+['"]/g,
  ],

  // Error handling patterns
  errorHandling: [
    /try\s*\{[^}]*\}\s*catch\s*\([^)]*\)\s*\{[^}]*ErrorHandler[^}]*\}/g,
    /if\s*\([^)]*error[^)]*\)\s*\{[^}]*throw[^}]*\}/g,
  ],

  // Console.log patterns (development artifacts)
  debugCode: [
    /console\.(log|debug|info|warn|error)\([^)]*\);?\s*/g,
    /\/\/\s*TODO[^\n]*\n?/g,
    /\/\/\s*FIXME[^\n]*\n?/g,
    /\/\/\s*DEBUG[^\n]*\n?/g,
  ],

  // Type definitions that might be duplicated
  typeDefinitions: [/interface\s+\w+\s*\{[^}]*\}/g, /type\s+\w+\s*=\s*[^;]+;/g],
};

function findDuplicateBlocks() {
  console.log('🔍 Advanced duplicate block analysis...');

  const srcDir = path.join(process.cwd(), 'src');
  const files = getAllTsFiles(srcDir);

  const blockMap = new Map();
  let totalBlocks = 0;
  let duplicateBlocks = 0;

  files.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(srcDir, filePath);

    // Extract code blocks (functions, methods, classes)
    const blocks = extractCodeBlocks(content);

    blocks.forEach((block, index) => {
      totalBlocks++;
      const normalized = normalizeCode(block);
      const hash = simpleHash(normalized);

      if (!blockMap.has(hash)) {
        blockMap.set(hash, []);
      }

      blockMap.get(hash).push({
        file: relativePath,
        lineNumber: findLineNumber(content, block),
        content: block,
      });
    });
  });

  // Find duplicates
  const duplicates = [];
  blockMap.forEach((instances, hash) => {
    if (instances.length > 1) {
      duplicateBlocks += instances.length;
      duplicates.push({
        hash,
        count: instances.length,
        instances,
        size: instances[0].content.length,
      });
    }
  });

  // Sort by impact (count * size)
  duplicates.sort((a, b) => b.count * b.size - a.count * a.size);

  console.log(`📊 Analysis Results:`);
  console.log(`   Total blocks: ${totalBlocks}`);
  console.log(`   Duplicate blocks: ${duplicateBlocks}`);
  console.log(`   Unique duplicates: ${duplicates.length}`);
  console.log(`   Duplication rate: ${((duplicateBlocks / totalBlocks) * 100).toFixed(1)}%`);

  // Show top duplicates
  console.log(`\n🔄 Top duplicates by impact:`);
  duplicates.slice(0, 10).forEach((dup, index) => {
    console.log(`${index + 1}. ${dup.count} instances, ${dup.size} chars each`);
    console.log(`   Impact: ${dup.count * dup.size} chars`);
    console.log(`   Files: ${dup.instances.map(i => `${i.file}:${i.lineNumber}`).join(', ')}`);
    console.log(`   Preview: ${dup.instances[0].content.substring(0, 80).replace(/\n/g, ' ')}...`);
    console.log('');
  });

  return duplicates;
}

function extractCodeBlocks(content) {
  const blocks = [];

  // Extract functions
  const functionRegex =
    /((?:async\s+)?(?:function\s+)?\w+\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})/g;
  let match;
  while ((match = functionRegex.exec(content)) !== null) {
    blocks.push(match[1]);
  }

  // Extract methods
  const methodRegex =
    /((?:public|private|protected)?\s*(?:async\s+)?\w+\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})/g;
  while ((match = methodRegex.exec(content)) !== null) {
    blocks.push(match[1]);
  }

  // Extract try-catch blocks
  const tryCatchRegex =
    /(try\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\s*catch\s*\([^)]*\)\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})/g;
  while ((match = tryCatchRegex.exec(content)) !== null) {
    blocks.push(match[1]);
  }

  return blocks;
}

function normalizeCode(code) {
  return code
    .replace(/\s+/g, ' ')
    .replace(/\/\/[^\n]*\n/g, '')
    .replace(/\/\*[^*]*\*\//g, '')
    .replace(/["'][^"']*["']/g, 'STRING')
    .replace(/\b\d+\b/g, 'NUMBER')
    .replace(/\b\w+(?:\.\w+)*\b/g, 'IDENTIFIER')
    .trim();
}

function findLineNumber(content, block) {
  const lines = content.split('\n');
  const blockStart = block.substring(0, 30);

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(blockStart.split(' ')[0])) {
      return i + 1;
    }
  }
  return 1;
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}

function getAllTsFiles(dir) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile() && item.endsWith('.ts') && !item.endsWith('.d.ts')) {
        files.push(fullPath);
      }
    });
  }

  traverse(dir);
  return files;
}

// Quick cleanup functions
function removeTrivialBlocks() {
  console.log('🧹 Removing trivial duplicated blocks...');

  const srcDir = path.join(process.cwd(), 'src');
  const files = getAllTsFiles(srcDir);
  let removedCount = 0;

  files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remove empty console.log statements
    const newContent = content.replace(/console\.log\(\s*['"]['"]\s*\);\s*\n?/g, '');
    if (newContent !== content) {
      content = newContent;
      modified = true;
      removedCount++;
    }

    // Remove TODO comments that are duplicated
    const todoRegex = /\/\/\s*TODO:\s*implement\s*\n?/g;
    const updatedContent = content.replace(todoRegex, '');
    if (updatedContent !== content) {
      content = updatedContent;
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
    }
  });

  console.log(`✅ Removed ${removedCount} trivial duplicate blocks`);
  return removedCount;
}

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--analyze') || args.includes('-a')) {
    findDuplicateBlocks();
  } else if (args.includes('--cleanup') || args.includes('-c')) {
    removeTrivialBlocks();
  } else if (args.includes('--all')) {
    console.log('🚀 Running complete duplication reduction...\n');
    removeTrivialBlocks();
    console.log('\n');
    findDuplicateBlocks();
  } else {
    console.log('📖 Usage:');
    console.log('  node advanced-duplication-reducer.cjs --analyze  # Analyze duplicate blocks');
    console.log('  node advanced-duplication-reducer.cjs --cleanup  # Remove trivial duplicates');
    console.log('  node advanced-duplication-reducer.cjs --all      # Run full analysis');
  }
}

module.exports = { findDuplicateBlocks, removeTrivialBlocks };
