#!/usr/bin/env node
/**
 * Code Complexity Audit Script
 *
 * Comprehensive code complexity analysis tool that measures:
 * - Cyclomatic complexity per function
 * - Function length and parameter count
 * - Class size and method distribution
 * - Cognitive complexity patterns
 * - Technical debt indicators
 *
 * Integrates with CI/CD pipeline for automated quality gates.
 */

const fs = require('fs');
const path = require('path');

// Project root directory
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

// Complexity thresholds based on project analysis
const COMPLEXITY_THRESHOLDS = {
  function: {
    simple: { lines: 20, complexity: 5, params: 3 },
    moderate: { lines: 50, complexity: 10, params: 5 },
    complex: { lines: 100, complexity: 15, params: 7 },
    critical: { lines: 200, complexity: 20, params: 10 },
  },
  class: {
    simple: { methods: 10, lines: 200 },
    moderate: { methods: 15, lines: 400 },
    complex: { methods: 25, lines: 600 },
    critical: { methods: 35, lines: 1000 },
  },
};

/**
 * Enhanced logging with colors and timestamps
 */
function log(message, type = 'info') {
  const timestamp = new Date().toISOString().substr(11, 8);
  const typeColors = {
    info: colors.blue,
    success: colors.green,
    warning: colors.yellow,
    error: colors.red,
    critical: colors.magenta,
  };

  const icon = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    critical: '🚨',
  }[type];

  console.log(
    `${colors.bright}[${timestamp}]${colors.reset} ${icon} ${typeColors[type]}${message}${colors.reset}`
  );
}

/**
 * Find source code files
 */
function findSourceFiles(
  directory,
  extensions = ['js', 'mjs', 'cjs', 'ts', 'tsx'],
  excludeDirs = ['node_modules', '.git', 'dist', 'coverage', 'build', 'playwright-report']
) {
  const files = [];

  function traverse(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory() && !excludeDirs.includes(entry.name)) {
          traverse(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).slice(1);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      log(`Error reading directory ${dir}: ${error.message}`, 'warning');
    }
  }

  traverse(directory);
  return files;
}

/**
 * Calculate cyclomatic complexity for a function
 */
function calculateCyclomaticComplexity(functionCode) {
  // Count decision points that increase complexity
  const complexityPatterns = [
    /\bif\s*\(/g, // if statements
    /\belse\s+if\b/g, // else if statements
    /\bwhile\s*\(/g, // while loops
    /\bfor\s*\(/g, // for loops
    /\bswitch\s*\(/g, // switch statements
    /\bcase\s+/g, // case statements
    /\bcatch\s*\(/g, // catch blocks
    /\bdo\s*{/g, // do-while loops
    /\?\s*.*?\s*:/g, // ternary operators
    /&&/g, // logical AND
    /\|\|/g, // logical OR
  ];

  let complexity = 1; // Base complexity

  complexityPatterns.forEach(pattern => {
    const matches = functionCode.match(pattern);
    if (matches) {
      complexity += matches.length;
    }
  });

  return complexity;
}

/**
 * Extract function information from code
 */
function extractFunctions(content, filePath) {
  const functions = [];

  // Patterns to match different function types
  const functionPatterns = [
    // Regular function declarations
    /function\s+(\w+)\s*\(([^)]*)\)\s*{/g,
    // Arrow functions with names
    /(?:const|let|var)\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*{/g,
    // Method definitions
    /(\w+)\s*\([^)]*\)\s*{/g,
    // Async functions
    /async\s+function\s+(\w+)\s*\(([^)]*)\)\s*{/g,
  ];

  functionPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const functionName = match[1] || 'anonymous';
      const params = match[2] ? match[2].split(',').filter(p => p.trim()).length : 0;

      // Find the complete function body
      const startIndex = match.index;
      const functionBody = extractFunctionBody(content, startIndex);

      if (functionBody) {
        const lines = functionBody.split('\n').length;
        const complexity = calculateCyclomaticComplexity(functionBody);

        functions.push({
          name: functionName,
          file: path.relative(PROJECT_ROOT, filePath),
          lines,
          params,
          complexity,
          startLine: content.substring(0, startIndex).split('\n').length,
        });
      }
    }
  });

  return functions;
}

/**
 * Extract complete function body using bracket matching
 */
function extractFunctionBody(content, startIndex) {
  const openBraceIndex = content.indexOf('{', startIndex);
  if (openBraceIndex === -1) return null;

  let braceCount = 0;
  let endIndex = openBraceIndex;

  for (let i = openBraceIndex; i < content.length; i++) {
    if (content[i] === '{') braceCount++;
    if (content[i] === '}') braceCount--;

    if (braceCount === 0) {
      endIndex = i;
      break;
    }
  }

  return content.substring(openBraceIndex, endIndex + 1);
}

/**
 * Extract class information from code
 */
function extractClasses(content, filePath) {
  const classes = [];
  const classPattern = /class\s+(\w+)(?:\s+extends\s+\w+)?\s*{/g;

  let match;
  while ((match = classPattern.exec(content)) !== null) {
    const className = match[1];
    const startIndex = match.index;

    // Find class body
    const classBody = extractFunctionBody(content, startIndex);
    if (classBody) {
      const methods = extractMethodsFromClass(classBody);
      const lines = classBody.split('\n').length;

      classes.push({
        name: className,
        file: path.relative(PROJECT_ROOT, filePath),
        methods: methods.length,
        lines,
        methodDetails: methods,
        startLine: content.substring(0, startIndex).split('\n').length,
      });
    }
  }

  return classes;
}

/**
 * Extract methods from class body
 */
function extractMethodsFromClass(classBody) {
  const methods = [];
  const methodPatterns = [
    /(\w+)\s*\([^)]*\)\s*{/g, // Regular methods
    /async\s+(\w+)\s*\([^)]*\)\s*{/g, // Async methods
    /get\s+(\w+)\s*\(\s*\)\s*{/g, // Getters
    /set\s+(\w+)\s*\([^)]*\)\s*{/g, // Setters
  ];

  methodPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(classBody)) !== null) {
      const methodName = match[1];
      if (methodName !== 'constructor') {
        // Skip constructor for method count
        methods.push({
          name: methodName,
          type: pattern.source.includes('async')
            ? 'async'
            : pattern.source.includes('get')
              ? 'getter'
              : pattern.source.includes('set')
                ? 'setter'
                : 'method',
        });
      }
    }
  });

  return methods;
}

/**
 * Analyze file for complexity metrics
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const functions = extractFunctions(content, filePath);
    const classes = extractClasses(content, filePath);

    return {
      file: path.relative(PROJECT_ROOT, filePath),
      lines: content.split('\n').length,
      functions,
      classes,
    };
  } catch (error) {
    log(`Error analyzing ${filePath}: ${error.message}`, 'warning');
    return null;
  }
}

/**
 * Classify complexity level
 */
function classifyComplexity(type, metrics) {
  const thresholds = COMPLEXITY_THRESHOLDS[type];

  if (type === 'function') {
    if (
      metrics.lines <= thresholds.simple.lines &&
      metrics.complexity <= thresholds.simple.complexity &&
      metrics.params <= thresholds.simple.params
    ) {
      return 'simple';
    } else if (
      metrics.lines <= thresholds.moderate.lines &&
      metrics.complexity <= thresholds.moderate.complexity &&
      metrics.params <= thresholds.moderate.params
    ) {
      return 'moderate';
    } else if (
      metrics.lines <= thresholds.complex.lines &&
      metrics.complexity <= thresholds.complex.complexity &&
      metrics.params <= thresholds.complex.params
    ) {
      return 'complex';
    } else {
      return 'critical';
    }
  } else if (type === 'class') {
    if (metrics.methods <= thresholds.simple.methods && metrics.lines <= thresholds.simple.lines) {
      return 'simple';
    } else if (
      metrics.methods <= thresholds.moderate.methods &&
      metrics.lines <= thresholds.moderate.lines
    ) {
      return 'moderate';
    } else if (
      metrics.methods <= thresholds.complex.methods &&
      metrics.lines <= thresholds.complex.lines
    ) {
      return 'complex';
    } else {
      return 'critical';
    }
  }

  return 'unknown';
}

/**
 * Generate complexity report for all functions
 */
function generateFunctionComplexityReport(allResults) {
  log('\n📊 Analyzing Function Complexity...', 'info');

  const allFunctions = [];
  allResults.forEach(result => {
    if (result && result.functions) {
      allFunctions.push(...result.functions);
    }
  });

  if (allFunctions.length === 0) {
    log('No functions found for analysis', 'warning');
    return {
      functions: [],
      summary: { total: 0, simple: 0, moderate: 0, complex: 0, critical: 0 },
    };
  }

  // Classify functions by complexity
  const complexityBreakdown = {
    simple: [],
    moderate: [],
    complex: [],
    critical: [],
  };

  allFunctions.forEach(func => {
    const level = classifyComplexity('function', func);
    complexityBreakdown[level].push(func);
  });

  // Report results
  const total = allFunctions.length;
  log(`📈 Function Complexity Analysis (${total} functions):`, 'info');
  log(
    `  ✅ Simple: ${complexityBreakdown.simple.length} (${((complexityBreakdown.simple.length / total) * 100).toFixed(1)}%)`,
    'success'
  );
  log(
    `  ⚠️ Moderate: ${complexityBreakdown.moderate.length} (${((complexityBreakdown.moderate.length / total) * 100).toFixed(1)}%)`,
    'warning'
  );
  log(
    `  🔧 Complex: ${complexityBreakdown.complex.length} (${((complexityBreakdown.complex.length / total) * 100).toFixed(1)}%)`,
    'error'
  );
  log(
    `  🚨 Critical: ${complexityBreakdown.critical.length} (${((complexityBreakdown.critical.length / total) * 100).toFixed(1)}%)`,
    'critical'
  );

  // Report critical complexity functions
  if (complexityBreakdown.critical.length > 0) {
    log('\n🚨 Critical Complexity Functions Requiring Immediate Attention:', 'critical');
    complexityBreakdown.critical.forEach(func => {
      log(
        `  ${func.file}:${func.startLine} - ${func.name}() [${func.lines} lines, complexity ${func.complexity}, ${func.params} params]`,
        'error'
      );
    });
  }

  // Report complex functions
  if (complexityBreakdown.complex.length > 0) {
    log('\n🔧 Complex Functions Recommended for Refactoring:', 'warning');
    complexityBreakdown.complex.slice(0, 10).forEach(func => {
      // Show top 10
      log(
        `  ${func.file}:${func.startLine} - ${func.name}() [${func.lines} lines, complexity ${func.complexity}]`,
        'warning'
      );
    });
    if (complexityBreakdown.complex.length > 10) {
      log(`  ... and ${complexityBreakdown.complex.length - 10} more`, 'warning');
    }
  }

  return {
    functions: allFunctions,
    breakdown: complexityBreakdown,
    summary: {
      total,
      simple: complexityBreakdown.simple.length,
      moderate: complexityBreakdown.moderate.length,
      complex: complexityBreakdown.complex.length,
      critical: complexityBreakdown.critical.length,
    },
  };
}

/**
 * Generate complexity report for all classes
 */
function generateClassComplexityReport(allResults) {
  log('\n🏗️ Analyzing Class Complexity...', 'info');

  const allClasses = [];
  allResults.forEach(result => {
    if (result && result.classes) {
      allClasses.push(...result.classes);
    }
  });

  if (allClasses.length === 0) {
    log('No classes found for analysis', 'warning');
    return { classes: [], summary: { total: 0, simple: 0, moderate: 0, complex: 0, critical: 0 } };
  }

  // Classify classes by complexity
  const complexityBreakdown = {
    simple: [],
    moderate: [],
    complex: [],
    critical: [],
  };

  allClasses.forEach(cls => {
    const level = classifyComplexity('class', cls);
    complexityBreakdown[level].push(cls);
  });

  // Report results
  const total = allClasses.length;
  log(`📊 Class Complexity Analysis (${total} classes):`, 'info');
  log(
    `  ✅ Simple: ${complexityBreakdown.simple.length} (${((complexityBreakdown.simple.length / total) * 100).toFixed(1)}%)`,
    'success'
  );
  log(
    `  ⚠️ Moderate: ${complexityBreakdown.moderate.length} (${((complexityBreakdown.moderate.length / total) * 100).toFixed(1)}%)`,
    'warning'
  );
  log(
    `  🔧 Complex: ${complexityBreakdown.complex.length} (${((complexityBreakdown.complex.length / total) * 100).toFixed(1)}%)`,
    'error'
  );
  log(
    `  🚨 Critical: ${complexityBreakdown.critical.length} (${((complexityBreakdown.critical.length / total) * 100).toFixed(1)}%)`,
    'critical'
  );

  // Report critical complexity classes
  if (complexityBreakdown.critical.length > 0) {
    log('\n🚨 Critical Complexity Classes Requiring Restructuring:', 'critical');
    complexityBreakdown.critical.forEach(cls => {
      log(
        `  ${cls.file}:${cls.startLine} - ${cls.name} [${cls.methods} methods, ${cls.lines} lines]`,
        'error'
      );
    });
  }

  return {
    classes: allClasses,
    breakdown: complexityBreakdown,
    summary: {
      total,
      simple: complexityBreakdown.simple.length,
      moderate: complexityBreakdown.moderate.length,
      complex: complexityBreakdown.complex.length,
      critical: complexityBreakdown.critical.length,
    },
  };
}

/**
 * Calculate overall project health score
 */
function calculateHealthScore(functionReport, classReport) {
  const functionScore =
    functionReport.summary.total > 0
      ? ((functionReport.summary.simple + functionReport.summary.moderate * 0.7) /
          functionReport.summary.total) *
        100
      : 100;

  const classScore =
    classReport.summary.total > 0
      ? ((classReport.summary.simple + classReport.summary.moderate * 0.7) /
          classReport.summary.total) *
        100
      : 100;

  // Weight functions more heavily as they're more numerous
  const overallScore = functionScore * 0.7 + classScore * 0.3;

  return {
    overall: overallScore,
    functions: functionScore,
    classes: classScore,
  };
}

/**
 * Generate detailed complexity report
 */
function generateComplexityReport(functionReport, classReport, healthScore) {
  const report = {
    timestamp: new Date().toISOString(),
    thresholds: COMPLEXITY_THRESHOLDS,
    summary: {
      healthScore: Math.round(healthScore.overall * 10) / 10,
      functions: functionReport.summary,
      classes: classReport.summary,
    },
    details: {
      criticalFunctions: functionReport.breakdown.critical.map(f => ({
        name: f.name,
        file: f.file,
        line: f.startLine,
        metrics: { lines: f.lines, complexity: f.complexity, params: f.params },
      })),
      criticalClasses: classReport.breakdown.critical.map(c => ({
        name: c.name,
        file: c.file,
        line: c.startLine,
        metrics: { methods: c.methods, lines: c.lines },
      })),
    },
    recommendations: generateRecommendations(functionReport, classReport),
  };

  const reportPath = path.join(PROJECT_ROOT, 'code-complexity-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  fs.chmodSync(reportPath, 0o644);

  log(`📋 Complexity report saved: ${reportPath}`, 'info');
  return report;
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(functionReport, classReport) {
  const recommendations = [];

  // Function-based recommendations
  if (functionReport.breakdown.critical.length > 0) {
    recommendations.push({
      priority: 'critical',
      type: 'function',
      action: 'Break down critical complexity functions',
      count: functionReport.breakdown.critical.length,
      examples: functionReport.breakdown.critical.slice(0, 3).map(f => `${f.file}:${f.name}()`),
    });
  }

  if (functionReport.breakdown.complex.length > 5) {
    recommendations.push({
      priority: 'high',
      type: 'function',
      action: 'Refactor complex functions using decomposition pattern',
      count: functionReport.breakdown.complex.length,
      target: 'Reduce to under 5 complex functions',
    });
  }

  // Class-based recommendations
  if (classReport.breakdown.critical.length > 0) {
    recommendations.push({
      priority: 'critical',
      type: 'class',
      action: 'Extract responsibilities from oversized classes',
      count: classReport.breakdown.critical.length,
      examples: classReport.breakdown.critical.slice(0, 3).map(c => `${c.file}:${c.name}`),
    });
  }

  // General recommendations
  const functionComplexityRatio =
    functionReport.summary.total > 0
      ? (functionReport.summary.complex + functionReport.summary.critical) /
        functionReport.summary.total
      : 0;

  if (functionComplexityRatio > 0.2) {
    recommendations.push({
      priority: 'medium',
      type: 'architecture',
      action: 'Implement complexity monitoring in CI/CD pipeline',
      reason: `${(functionComplexityRatio * 100).toFixed(1)}% of functions are complex or critical`,
    });
  }

  return recommendations;
}

/**
 * Main complexity audit function
 */
function runComplexityAudit() {
  console.log(`${colors.bright}📊 Code Complexity Audit${colors.reset}`);
  console.log('===============================\n');

  log('🔍 Scanning source files...', 'info');
  const sourceFiles = findSourceFiles(PROJECT_ROOT);
  log(`Found ${sourceFiles.length} source files to analyze`, 'info');

  // Analyze all files
  const results = sourceFiles.map(analyzeFile).filter(Boolean);

  if (results.length === 0) {
    log('❌ No files could be analyzed', 'error');
    return 1;
  }

  // Generate reports
  const functionReport = generateFunctionComplexityReport(results);
  const classReport = generateClassComplexityReport(results);
  const healthScore = calculateHealthScore(functionReport, classReport);

  // Generate detailed report
  generateComplexityReport(functionReport, classReport, healthScore);

  // Final summary
  console.log('\n' + '='.repeat(50));
  console.log(`${colors.bright}📊 COMPLEXITY AUDIT SUMMARY${colors.reset}`);
  console.log('='.repeat(50));

  log(
    `🎯 Overall Health Score: ${healthScore.overall.toFixed(1)}%`,
    healthScore.overall >= 80 ? 'success' : healthScore.overall >= 60 ? 'warning' : 'error'
  );

  log(
    `📈 Function Quality: ${healthScore.functions.toFixed(1)}%`,
    healthScore.functions >= 80 ? 'success' : 'warning'
  );

  log(
    `🏗️ Class Quality: ${healthScore.classes.toFixed(1)}%`,
    healthScore.classes >= 80 ? 'success' : 'warning'
  );

  // CI/CD exit codes
  const criticalIssues = functionReport.summary.critical + classReport.summary.critical;
  const isWarnOnly = process.argv.includes('--warn-only');

  if (isWarnOnly) {
    // In warn-only mode, always exit with 0 but report issues
    if (criticalIssues > 0) {
      log(
        `⚠️ ${criticalIssues} critical complexity issues found - consider refactoring`,
        'warning'
      );
      log('� Running in warn-only mode - build will continue', 'info');
    } else {
      log('✅ No critical complexity issues found', 'success');
    }
    return 0;
  } else {
    // Normal mode - fail build if too many critical issues
    if (criticalIssues > 0) {
      log(
        `�🚨 ${criticalIssues} critical complexity issues found - requires immediate attention`,
        'critical'
      );
      return 1; // Fail CI/CD
    } else if (healthScore.overall < 70) {
      log('⚠️ Code quality below acceptable threshold (70%)', 'warning');
      return 1; // Fail CI/CD
    } else if (healthScore.overall < 80) {
      log('⚠️ Code quality needs improvement but within acceptable range', 'warning');
      return 0; // Pass but warn
    } else {
      log('✅ Code complexity within acceptable limits', 'success');
      return 0; // Pass
    }
  }
}

// Run audit if called directly
if (require.main === module) {
  try {
    const exitCode = runComplexityAudit();
    process.exit(exitCode);
  } catch (error) {
    log(`Complexity audit failed: ${error.message}`, 'critical');
    process.exit(1);
  }
}

module.exports = {
  runComplexityAudit,
  analyzeFile,
  calculateCyclomaticComplexity,
  classifyComplexity,
  COMPLEXITY_THRESHOLDS,
};
