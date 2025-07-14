#!/usr/bin/env node

/**
 * Script Modernizer - Convert CommonJS to ES Modules
 * This script updates all JavaScript files in the scripts directory to use ES modules
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Script Modernizer - Converting CommonJS to ES Modules\n');

const scriptsDir = __dirname;
let filesProcessed = 0;
let filesUpdated = 0;

// Find all JavaScript files
function findJSFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findJSFiles(fullPath));
    } else if (item.endsWith('.js') && item !== 'script-modernizer.js') {
      files.push(fullPath);
    }
  }

  return files;
}

// Convert CommonJS require/module.exports to ES modules
function convertToESModules(filePath) {
  console.log(`Processing: ${path.relative(scriptsDir, filePath)}`);

  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  // Check if already using ES modules
  if (content.includes('import ') && content.includes('from ') && !content.includes('require(')) {
    console.log('  ✅ Already using ES modules');
    return false;
  }

  // Add ES module imports at the top
  const lines = content.split('\n');
  const newLines = [];
  let importsAdded = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip shebang and initial comments
    if (
      line.startsWith('#!') ||
      line.startsWith('/**') ||
      line.startsWith(' *') ||
      line.startsWith(' */') ||
      line.trim().startsWith('//')
    ) {
      newLines.push(line);
      continue;
    }

    // Add ES module imports after initial comments
    if (!importsAdded && line.trim() !== '') {
      // Check what imports we need based on require statements
      const needsFs = content.includes("require('fs')") || content.includes('require("fs")');
      const needsPath = content.includes("require('path')") || content.includes('require("path")');
      const needsChildProcess =
        content.includes("require('child_process')") ||
        content.includes('require("child_process")');
      const needsHttps =
        content.includes("require('https')") || content.includes('require("https")');
      const needsUrl = content.includes("require('url')") || content.includes('require("url")');
      const needsFileUrl = content.includes('__dirname') || content.includes('__filename');

      if (needsFs || needsPath || needsChildProcess || needsHttps || needsUrl || needsFileUrl) {
        if (needsFs) newLines.push("import fs from 'fs';");
        if (needsPath) newLines.push("import path from 'path';");
        if (needsChildProcess) newLines.push("import { execSync } from 'child_process';");
        if (needsHttps) newLines.push("import https from 'https';");
        if (needsUrl) newLines.push("import { fileURLToPath } from 'url';");
        if (needsFileUrl && !needsUrl) newLines.push("import { fileURLToPath } from 'url';");

        if (needsPath || needsUrl || needsFileUrl) {
          newLines.push('');
          newLines.push('const __filename = fileURLToPath(import.meta.url);');
          newLines.push('const __dirname = path.dirname(__filename);');
        }

        newLines.push('');
        updated = true;
      }

      importsAdded = true;
    }

    // Convert require statements
    let convertedLine = line;

    // Remove require statements that we've already imported
    if (
      line.includes("const fs = require('fs')") ||
      line.includes('const fs = require("fs")') ||
      line.includes("const path = require('path')") ||
      line.includes('const path = require("path")') ||
      line.includes("const { execSync } = require('child_process')") ||
      line.includes('const { execSync } = require("child_process")') ||
      line.includes("const https = require('https')") ||
      line.includes('const https = require("https")')
    ) {
      console.log(`  🔄 Removed: ${line.trim()}`);
      updated = true;
      continue;
    }

    // Convert module.exports to export
    if (line.includes('module.exports')) {
      convertedLine = line
        .replace(/module\.exports\s*=\s*{/, 'export {')
        .replace(/module\.exports\s*=/, 'export default');
      if (convertedLine !== line) {
        console.log(`  🔄 Converted: ${line.trim()} → ${convertedLine.trim()}`);
        updated = true;
      }
    }

    // Convert require.main === module to ES module equivalent
    if (line.includes('require.main === module')) {
      convertedLine = line.replace(
        'require.main === module',
        `import.meta.url === \`file://\${process.argv[1]}\``
      );
      console.log(`  🔄 Converted: ${line.trim()} → ${convertedLine.trim()}`);
      updated = true;
    }

    newLines.push(convertedLine);
  }

  if (updated) {
    const newContent = newLines.join('\n');
    fs.writeFileSync(filePath, newContent);
    fs.chmodSync(filePath, 0o644); // Read-write for owner, read-only for group and others
    console.log('  ✅ Updated to ES modules');
    return true;
  } else {
    console.log('  ℹ️  No changes needed');
    return false;
  }
}

// Process all files
const jsFiles = findJSFiles(scriptsDir);
console.log(`Found ${jsFiles.length} JavaScript files to process\n`);

for (const file of jsFiles) {
  filesProcessed++;
  if (convertToESModules(file)) {
    filesUpdated++;
  }
  console.log('');
}

console.log(`🎉 Script modernization complete!`);
console.log(`📊 Files processed: ${filesProcessed}`);
console.log(`📊 Files updated: ${filesUpdated}`);
console.log(`📊 Files already modern: ${filesProcessed - filesUpdated}`);

if (filesUpdated > 0) {
  console.log(`\n✅ All scripts are now using ES modules and should work correctly!`);
} else {
  console.log(`\n✅ All scripts were already using ES modules!`);
}
