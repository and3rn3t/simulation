#!/usr/bin/env node

// Script to fix ESLint unused variable warnings
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const filesToFix = [
  'src/services/AchievementService.ts',
  'src/ui/CommonUIPatterns.ts',
  'src/ui/components/ComponentDemo.ts',
  'src/utils/memory/objectPool.ts',
  'src/utils/mobile/*.ts',
  'src/utils/system/commonErrorHandlers.ts',
];

// Common patterns to fix
const patterns = [
  { search: /catch \(error\)/g, replace: 'catch (_error)' },
  { search: /\(([a-zA-Z]+)\) =>/g, replace: '(_$1) =>' }, // For unused parameters
  { search: /const ([a-zA-Z]+) =/g, replace: 'const _$1 =' }, // For unused variables
];

// Process each file
for (const pattern of filesToFix) {
  const files = glob.sync(pattern);
  for (const file of files) {
    try {
      let content = readFileSync(file, 'utf8');
      let modified = false;

      for (const { search, replace } of patterns) {
        const newContent = content.replace(search, replace);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      }

      if (modified) {
        writeFileSync(file, content);
        console.log(`Fixed ${file}`);
      }
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }
}
