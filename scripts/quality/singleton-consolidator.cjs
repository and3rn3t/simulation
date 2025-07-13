/**
 * Singleton Pattern Consolidator
 * Consolidates duplicate getInstance() methods into a base singleton class
 */
const fs = require('fs');
const path = require('path');

// Create a base singleton class
const BASE_SINGLETON_CONTENT = `/**
 * Base Singleton class to reduce getInstance() duplication
 */
export abstract class BaseSingleton {
  private static instances: Map<string, any> = new Map();

  protected static getInstance<T extends BaseSingleton>(
    this: new () => T,
    className: string
  ): T {
    if (!BaseSingleton.instances.has(className)) {
      BaseSingleton.instances.set(className, new this());
    }
    return BaseSingleton.instances.get(className) as T;
  }

  protected constructor() {
    // Protected constructor to prevent direct instantiation
  }

  /**
   * Reset all singleton instances (useful for testing)
   */
  public static resetInstances(): void {
    BaseSingleton.instances.clear();
  }
}
`;

// Files that contain singleton getInstance patterns
const SINGLETON_FILES = [
  'src/dev/debugMode.ts',
  'src/dev/developerConsole.ts',
  'src/dev/performanceProfiler.ts',
  'src/utils/system/errorHandler.ts',
  'src/utils/system/logger.ts',
  'src/utils/performance/PerformanceManager.ts',
  'src/utils/performance/FPSMonitor.ts',
  'src/utils/performance/MemoryTracker.ts',
];

function createBaseSingleton() {
  const filePath = path.join(process.cwd(), 'src/utils/system/BaseSingleton.ts');

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, BASE_SINGLETON_CONTENT);
    console.log('✅ Created BaseSingleton.ts');
    return true;
  }

  console.log('ℹ️  BaseSingleton.ts already exists');
  return false;
}

function consolidateSingleton(filePath) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // Check if file already uses BaseSingleton
  if (content.includes('extends BaseSingleton')) {
    console.log(`ℹ️  ${filePath} already uses BaseSingleton`);
    return false;
  }

  // Extract class name
  const classMatch = content.match(/export\s+class\s+(\w+)/);
  if (!classMatch) {
    console.log(`⚠️  No class found in ${filePath}`);
    return false;
  }

  const className = classMatch[1];

  // Check if it has getInstance pattern
  const getInstanceRegex = /static\s+getInstance\(\)\s*:\s*\w+\s*\{[^}]*\}/;
  const getInstanceMatch = content.match(getInstanceRegex);

  if (!getInstanceMatch) {
    console.log(`ℹ️  No getInstance method found in ${filePath}`);
    return false;
  }

  // Add import for BaseSingleton
  if (!content.includes('import { BaseSingleton }')) {
    const importMatch = content.match(/^(import[^;]*;\s*)*/m);
    const insertIndex = importMatch ? importMatch[0].length : 0;
    content =
      content.slice(0, insertIndex) +
      `import { BaseSingleton } from './BaseSingleton.js';\n` +
      content.slice(insertIndex);
    modified = true;
  }

  // Replace class declaration to extend BaseSingleton
  content = content.replace(
    /export\s+class\s+(\w+)\s*\{/,
    `export class $1 extends BaseSingleton {`
  );
  modified = true;

  // Replace getInstance method
  const newGetInstance = `  static getInstance(): ${className} {
    return super.getInstance(${className}, '${className}');
  }`;

  content = content.replace(getInstanceRegex, newGetInstance);
  modified = true;

  // Remove private static instance if it exists
  content = content.replace(/private\s+static\s+instance\s*:\s*\w+\s*;\s*\n?/g, '');

  // Make constructor protected
  content = content.replace(/private\s+constructor\s*\(\)/g, 'protected constructor()');

  if (modified) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Consolidated singleton in ${filePath}`);
    return true;
  }

  return false;
}

function consolidateAllSingletons() {
  console.log('🔧 Consolidating singleton patterns...\n');

  // Create base singleton class
  const baseSingletonCreated = createBaseSingleton();

  let consolidatedCount = 0;

  // Process each singleton file
  SINGLETON_FILES.forEach(filePath => {
    if (consolidateSingleton(filePath)) {
      consolidatedCount++;
    }
  });

  console.log(`\n📊 Consolidation Summary:`);
  console.log(`   Base singleton created: ${baseSingletonCreated ? 'Yes' : 'No'}`);
  console.log(`   Files processed: ${SINGLETON_FILES.length}`);
  console.log(`   Files consolidated: ${consolidatedCount}`);

  return consolidatedCount;
}

// Analysis function to find singleton patterns
function findSingletonPatterns() {
  console.log('🔍 Finding singleton patterns...\n');

  const srcDir = path.join(process.cwd(), 'src');
  const files = getAllTsFiles(srcDir);
  const singletonFiles = [];

  files.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);

    // Look for getInstance patterns
    if (content.match(/static\s+getInstance\(\)/)) {
      const classMatch = content.match(/export\s+class\s+(\w+)/);
      const className = classMatch ? classMatch[1] : 'Unknown';

      singletonFiles.push({
        file: relativePath,
        class: className,
        hasPrivateInstance: content.includes('private static instance'),
        alreadyExtendsBase: content.includes('extends BaseSingleton'),
      });
    }
  });

  console.log(`📋 Found ${singletonFiles.length} singleton classes:`);
  singletonFiles.forEach((info, index) => {
    const status = info.alreadyExtendsBase ? '✅ Already consolidated' : '🔄 Can be consolidated';
    console.log(`${index + 1}. ${info.class} (${info.file}) - ${status}`);
  });

  return singletonFiles;
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

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--find') || args.includes('-f')) {
    findSingletonPatterns();
  } else if (args.includes('--consolidate') || args.includes('-c')) {
    consolidateAllSingletons();
  } else {
    console.log('📖 Usage:');
    console.log('  node singleton-consolidator.cjs --find        # Find singleton patterns');
    console.log('  node singleton-consolidator.cjs --consolidate # Consolidate singletons');
  }
}

module.exports = { findSingletonPatterns, consolidateAllSingletons };
