/**
 * Catch Block Optimizer
 * Consolidates repetitive catch blocks in simulation.ts
 */
const fs = require('fs');
const path = require('path');

const SIMULATION_FILE = path.join(process.cwd(), 'src/core/simulation.ts');

// Standard catch block patterns to replace
const CATCH_PATTERNS = [
  {
    search:
      /} catch \(error\) \{\s*ErrorHandler\.getInstance\(\)\.handleError\(\s*error instanceof Error \? error : new [A-Z][a-zA-Z]*Error\([^)]+\),\s*ErrorSeverity\.MEDIUM,\s*'([^']+)'\s*\);\s*}/g,
    replace: (match, context) => `} catch (error) { handleSimulationError(error, '${context}'); }`,
  },
  {
    search:
      /} catch \(error\) \{\s*ErrorHandler\.getInstance\(\)\.handleError\(\s*error instanceof Error \? error : new [A-Z][a-zA-Z]*Error\([^)]+\),\s*ErrorSeverity\.HIGH,\s*'([^']+)'\s*\);\s*}/g,
    replace: (match, context) =>
      `} catch (error) { handleSimulationError(error, '${context}', 'HIGH'); }`,
  },
];

// Helper function pattern to add
const HELPER_FUNCTION = `
// Helper function for consistent error handling
private handleSimulationError(error: unknown, context: string, severity: 'HIGH' | 'MEDIUM' = 'MEDIUM'): void {
  ErrorHandler.getInstance().handleError(
    error instanceof Error ? error : new SimulationError(\`Error in \${context}\`),
    severity === 'HIGH' ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
    context
  );
}`;

function optimizeCatchBlocks() {
  console.log('🔧 Optimizing catch blocks in simulation.ts...');

  if (!fs.existsSync(SIMULATION_FILE)) {
    console.log('❌ simulation.ts not found');
    return;
  }

  let content = fs.readFileSync(SIMULATION_FILE, 'utf8');
  let replacements = 0;

  // Replace catch block patterns
  CATCH_PATTERNS.forEach(pattern => {
    const matches = [...content.matchAll(pattern.search)];
    matches.forEach(match => {
      const replacement = pattern.replace(match[0], match[1]);
      content = content.replace(match[0], replacement);
      replacements++;
    });
  });

  // Add helper function before the last closing brace if we made replacements
  if (replacements > 0) {
    // Check if helper function already exists
    if (!content.includes('handleSimulationError')) {
      const lastBraceIndex = content.lastIndexOf('}');
      content =
        content.slice(0, lastBraceIndex) + HELPER_FUNCTION + '\n' + content.slice(lastBraceIndex);
    }

    fs.writeFileSync(SIMULATION_FILE, content);
    console.log(`✅ Optimized ${replacements} catch blocks`);
  } else {
    console.log('ℹ️ No standard catch blocks found to optimize');
  }
}

// Simple approach: just count and report current catch blocks
function analyzeCatchBlocks() {
  console.log('🔍 Analyzing catch blocks in simulation.ts...');

  const content = fs.readFileSync(SIMULATION_FILE, 'utf8');
  const catchBlocks = content.match(/} catch \([^)]+\) \{[^}]*}/g) || [];

  console.log(`📊 Found ${catchBlocks.length} catch blocks`);

  // Group by pattern
  const patterns = {};
  catchBlocks.forEach((block, index) => {
    const normalized = block
      .replace(/error instanceof Error \? error : new \w+Error\([^)]+\)/, 'ERROR_INSTANCE')
      .replace(/'[^']+'/g, "'CONTEXT'")
      .replace(/ErrorSeverity\.\w+/g, 'SEVERITY');

    if (!patterns[normalized]) {
      patterns[normalized] = [];
    }
    patterns[normalized].push(index + 1);
  });

  console.log('\n📋 Catch block patterns:');
  Object.entries(patterns).forEach(([pattern, lines]) => {
    if (lines.length > 1) {
      console.log(`🔄 Pattern (${lines.length} instances): lines ${lines.join(', ')}`);
      console.log(`   ${pattern.substring(0, 80)}...`);
    }
  });

  return catchBlocks.length;
}

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--analyze') || args.includes('-a')) {
    analyzeCatchBlocks();
  } else if (args.includes('--optimize') || args.includes('-o')) {
    optimizeCatchBlocks();
  } else {
    console.log('📖 Usage:');
    console.log('  node catch-block-optimizer.cjs --analyze   # Analyze patterns');
    console.log('  node catch-block-optimizer.cjs --optimize  # Apply optimizations');
  }
}

module.exports = { analyzeCatchBlocks, optimizeCatchBlocks };
