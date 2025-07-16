#!/usr/bin/env node

/**
 * Simple Bundle Analysis Test
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

console.log('🚀 Starting simple bundle analysis...\n');

const distPath = join(process.cwd(), 'dist');

if (!existsSync(distPath)) {
  console.error('❌ Dist directory not found');
  process.exit(1);
}

let totalSize = 0;
const files = [];

function analyzeDirectory(dirPath, relativePath = '') {
  const dirFiles = readdirSync(dirPath);

  dirFiles.forEach(file => {
    const fullPath = join(dirPath, file);
    const relativeFilePath = join(relativePath, file);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      analyzeDirectory(fullPath, relativeFilePath);
    } else {
      const size = stats.size;
      totalSize += size;

      files.push({
        path: relativeFilePath,
        size: size,
        sizeFormatted: formatSize(size),
        extension: extname(file).toLowerCase(),
      });
    }
  });
}

function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// Analyze the bundle
analyzeDirectory(distPath);

// Sort files by size
files.sort((a, b) => b.size - a.size);

console.log('📊 Bundle Analysis Results:');
console.log(`   Total Size: ${formatSize(totalSize)}`);
console.log(`   Files: ${files.length}`);
console.log('\n📦 Largest Files:');

files.slice(0, 10).forEach((file, index) => {
  console.log(`   ${index + 1}. ${file.path} - ${file.sizeFormatted}`);
});

// Budget check
const budgetMB = 3; // 3MB budget
const budgetBytes = budgetMB * 1024 * 1024;

console.log(`\n💰 Budget Status:`);
if (totalSize <= budgetBytes) {
  console.log(`   ✅ Within budget (${((totalSize / budgetBytes) * 100).toFixed(1)}%)`);
} else {
  console.log(`   ❌ Over budget (${((totalSize / budgetBytes) * 100).toFixed(1)}%)`);
  console.log(`   Excess: ${formatSize(totalSize - budgetBytes)}`);
}

// Create simple report
const report = {
  timestamp: new Date().toISOString(),
  totalSize: totalSize,
  totalSizeFormatted: formatSize(totalSize),
  fileCount: files.length,
  budgetStatus: totalSize <= budgetBytes ? 'pass' : 'fail',
  budgetPercentage: Math.round((totalSize / budgetBytes) * 100),
  largestFiles: files.slice(0, 5),
};

writeFileSync('simple-bundle-report.json', JSON.stringify(report, null, 2));

console.log('\n✅ Simple bundle analysis completed!');
console.log('📄 Report saved to: simple-bundle-report.json');
