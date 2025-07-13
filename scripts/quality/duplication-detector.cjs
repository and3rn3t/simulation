#!/usr/bin/env node

/**
 * Code Duplication Detection Tool
 *
 * Identifies high-duplication files and specific patterns causing SonarCloud issues
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class DuplicationDetector {
  constructor() {
    this.duplicateFiles = [];
    this.duplicateBlocks = [];
    this.similarFunctions = [];
    this.findings = [];
  }

  /**
   * Scan directory for duplication
   */
  scanDirectory(dir) {
    const files = this.findSourceFiles(dir);

    console.log('🔍 DUPLICATE CODE DETECTION ANALYSIS');
    console.log('='.repeat(50));
    console.log(`📁 Scanning ${files.length} source files...\n`);

    // Step 1: Identify duplicate files
    this.findDuplicateFiles(files);

    // Step 2: Find similar function patterns
    this.findSimilarFunctions(files);

    // Step 3: Detect code block duplicates
    this.findDuplicateBlocks(files);

    // Step 4: Generate recommendations
    this.generateReport();
  }

  /**
   * Find all source files
   */
  findSourceFiles(dir) {
    const files = [];

    const scanDir = currentDir => {
      try {
        const items = fs.readdirSync(currentDir);

        for (const item of items) {
          const fullPath = path.join(currentDir, item);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory() && !this.shouldSkipDirectory(item)) {
            scanDir(fullPath);
          } else if (stat.isFile() && this.shouldAnalyzeFile(item)) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.error(`Error scanning ${currentDir}:`, error.message);
      }
    };

    scanDir(dir);
    return files;
  }

  /**
   * Check if directory should be skipped
   */
  shouldSkipDirectory(dirName) {
    const skipDirs = [
      'node_modules',
      '.git',
      'dist',
      'build',
      'coverage',
      'playwright-report',
      'test-results',
      '.vscode',
    ];
    return skipDirs.includes(dirName);
  }

  /**
   * Check if file should be analyzed
   */
  shouldAnalyzeFile(fileName) {
    return (
      fileName.endsWith('.ts') ||
      fileName.endsWith('.js') ||
      fileName.endsWith('.tsx') ||
      fileName.endsWith('.jsx')
    );
  }

  /**
   * Find files with identical or near-identical content
   */
  findDuplicateFiles(files) {
    const fileHashes = new Map();
    const fileSimilarity = new Map();

    console.log('📋 DUPLICATE FILE ANALYSIS');
    console.log('-'.repeat(30));

    files.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const normalized = this.normalizeContent(content);
        const hash = crypto.createHash('md5').update(normalized).digest('hex');

        if (fileHashes.has(hash)) {
          this.duplicateFiles.push({
            original: fileHashes.get(hash),
            duplicate: filePath,
            similarity: 100,
            type: 'exact',
          });
        } else {
          fileHashes.set(hash, filePath);
        }

        // Check for partial similarity (simulation files)
        this.checkFileSimilarity(filePath, content, fileSimilarity);
      } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
      }
    });

    if (this.duplicateFiles.length > 0) {
      console.log(`\n🚨 Found ${this.duplicateFiles.length} duplicate files:`);
      this.duplicateFiles.forEach((dup, index) => {
        console.log(
          `  ${index + 1}. ${path.basename(dup.original)} ↔️ ${path.basename(dup.duplicate)}`
        );
        console.log(`     Similarity: ${dup.similarity}% (${dup.type})`);
      });
    } else {
      console.log('✅ No exact duplicate files found');
    }
  }

  /**
   * Check similarity between files (especially simulation variants)
   */
  checkFileSimilarity(filePath, content, fileSimilarity) {
    const fileName = path.basename(filePath);

    // Focus on simulation files which are likely duplicated
    if (fileName.includes('simulation')) {
      const lines = content.split('\n').filter(line => line.trim());
      const signature = this.createContentSignature(lines);

      for (const [existingPath, existingSignature] of fileSimilarity.entries()) {
        const similarity = this.calculateSimilarity(signature, existingSignature);

        if (similarity > 70) {
          // 70% similarity threshold
          this.duplicateFiles.push({
            original: existingPath,
            duplicate: filePath,
            similarity,
            type: 'similar',
          });
        }
      }

      fileSimilarity.set(filePath, signature);
    }
  }

  /**
   * Create content signature for similarity comparison
   */
  createContentSignature(lines) {
    return lines
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('//') && !line.startsWith('/*'))
      .join('\n');
  }

  /**
   * Calculate similarity percentage between two signatures
   */
  calculateSimilarity(sig1, sig2) {
    const lines1 = sig1.split('\n');
    const lines2 = sig2.split('\n');

    const intersection = lines1.filter(line => lines2.includes(line));
    const union = [...new Set([...lines1, ...lines2])];

    return Math.round((intersection.length / union.length) * 100);
  }

  /**
   * Normalize content for comparison
   */
  normalizeContent(content) {
    return content
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .trim();
  }

  /**
   * Find similar function patterns
   */
  findSimilarFunctions(files) {
    console.log('\n🔧 SIMILAR FUNCTION ANALYSIS');
    console.log('-'.repeat(30));

    const functionPatterns = new Map();

    files.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const functions = this.extractFunctions(content, filePath);

        functions.forEach(func => {
          const pattern = this.createFunctionPattern(func.body);

          if (functionPatterns.has(pattern)) {
            this.similarFunctions.push({
              pattern,
              functions: [functionPatterns.get(pattern), func],
            });
          } else {
            functionPatterns.set(pattern, func);
          }
        });
      } catch (error) {
        console.error(`Error analyzing functions in ${filePath}:`, error.message);
      }
    });

    if (this.similarFunctions.length > 0) {
      console.log(`\n⚠️ Found ${this.similarFunctions.length} similar function patterns:`);
      this.similarFunctions.slice(0, 5).forEach((similar, index) => {
        const funcs = similar.functions;
        console.log(`  ${index + 1}. Similar functions:`);
        funcs.forEach(func => {
          console.log(`     📄 ${path.basename(func.file)}:${func.line} - ${func.name}()`);
        });
      });

      if (this.similarFunctions.length > 5) {
        console.log(`     ... and ${this.similarFunctions.length - 5} more`);
      }
    } else {
      console.log('✅ No major function duplication detected');
    }
  }

  /**
   * Extract functions from file content
   */
  extractFunctions(content, filePath) {
    const functions = [];
    const functionPatterns = [
      /function\s+(\w+)\s*\([^)]*\)\s*{/g,
      /(\w+)\s*\([^)]*\)\s*{/g, // Method definitions
      /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*{/g, // Arrow functions
    ];

    functionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const functionName = match[1];
        const startIndex = match.index;
        const body = this.extractFunctionBody(content, startIndex);

        if (body && body.length > 50) {
          // Only analyze substantial functions
          functions.push({
            name: functionName,
            file: filePath,
            line: content.substring(0, startIndex).split('\n').length,
            body,
          });
        }
      }
    });

    return functions;
  }

  /**
   * Extract function body
   */
  extractFunctionBody(content, startIndex) {
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
   * Create function pattern for similarity comparison
   */
  createFunctionPattern(functionBody) {
    return functionBody
      .replace(/\s+/g, ' ')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .replace(/\b\w+\d+\b/g, 'VAR') // Replace variables with numbers
      .replace(/"[^"]*"/g, 'STRING') // Replace string literals
      .trim();
  }

  /**
   * Find duplicate code blocks
   */
  findDuplicateBlocks(files) {
    console.log('\n📦 DUPLICATE CODE BLOCK ANALYSIS');
    console.log('-'.repeat(30));

    const blockHashes = new Map();

    files.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const blocks = this.extractCodeBlocks(content, filePath);

        blocks.forEach(block => {
          const hash = crypto.createHash('md5').update(block.normalized).digest('hex');

          if (blockHashes.has(hash)) {
            this.duplicateBlocks.push({
              original: blockHashes.get(hash),
              duplicate: block,
            });
          } else {
            blockHashes.set(hash, block);
          }
        });
      } catch (error) {
        console.error(`Error analyzing blocks in ${filePath}:`, error.message);
      }
    });

    if (this.duplicateBlocks.length > 0) {
      console.log(`\n📋 Found ${this.duplicateBlocks.length} duplicate code blocks:`);
      this.duplicateBlocks.slice(0, 3).forEach((dup, index) => {
        console.log(`  ${index + 1}. Block duplication:`);
        console.log(`     📄 ${path.basename(dup.original.file)}:${dup.original.startLine}`);
        console.log(`     📄 ${path.basename(dup.duplicate.file)}:${dup.duplicate.startLine}`);
        console.log(`     Size: ${dup.original.lines} lines`);
      });

      if (this.duplicateBlocks.length > 3) {
        console.log(`     ... and ${this.duplicateBlocks.length - 3} more blocks`);
      }
    } else {
      console.log('✅ No significant code block duplication detected');
    }
  }

  /**
   * Extract code blocks for analysis
   */
  extractCodeBlocks(content, filePath) {
    const lines = content.split('\n');
    const blocks = [];
    const minBlockSize = 10; // Minimum lines for a block

    for (let i = 0; i <= lines.length - minBlockSize; i++) {
      const blockLines = lines.slice(i, i + minBlockSize);
      const block = blockLines.join('\n');
      const normalized = this.normalizeContent(block);

      if (normalized.length > 100) {
        // Only substantial blocks
        blocks.push({
          file: filePath,
          startLine: i + 1,
          lines: minBlockSize,
          content: block,
          normalized,
        });
      }
    }

    return blocks;
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('\n📊 DUPLICATION ANALYSIS SUMMARY');
    console.log('='.repeat(50));

    const totalIssues =
      this.duplicateFiles.length + this.similarFunctions.length + this.duplicateBlocks.length;

    console.log(`📈 Total duplication issues: ${totalIssues}`);
    console.log(`📄 Duplicate files: ${this.duplicateFiles.length}`);
    console.log(`🔧 Similar functions: ${this.similarFunctions.length}`);
    console.log(`📦 Duplicate blocks: ${this.duplicateBlocks.length}`);

    console.log('\n💡 RECOMMENDATIONS FOR SONARCLOUD IMPROVEMENT:');
    console.log('-'.repeat(50));

    const recommendations = this.generateRecommendations();
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.action}`);
      console.log(`   Priority: ${rec.priority}`);
      console.log(`   Impact: ${rec.impact}`);
      if (rec.files) {
        console.log(`   Files: ${rec.files.join(', ')}`);
      }
      console.log();
    });

    console.log('🎯 IMMEDIATE ACTIONS:');
    console.log('-'.repeat(20));
    if (this.duplicateFiles.length > 0) {
      console.log('• Remove duplicate simulation files (simulation_*.ts)');
      console.log('• Consolidate into single OrganismSimulation class');
    }
    if (this.similarFunctions.length > 0) {
      console.log('• Extract common utility functions');
      console.log('• Create shared service classes');
    }
    if (this.duplicateBlocks.length > 0) {
      console.log('• Refactor repeated code patterns');
      console.log('• Create reusable components');
    }
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    // Duplicate files
    if (this.duplicateFiles.length > 0) {
      const simulationFiles = this.duplicateFiles.filter(
        dup => dup.original.includes('simulation') || dup.duplicate.includes('simulation')
      );

      if (simulationFiles.length > 0) {
        recommendations.push({
          priority: 'HIGH',
          action: 'Consolidate duplicate simulation files',
          impact: 'Major SonarCloud duplication reduction',
          files: simulationFiles.map(f => path.basename(f.duplicate)),
        });
      }
    }

    // Similar functions
    if (this.similarFunctions.length > 5) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Extract common function patterns into utilities',
        impact: 'Reduce function duplication percentage',
      });
    }

    // Duplicate blocks
    if (this.duplicateBlocks.length > 10) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Refactor repeated code blocks',
        impact: 'Improve overall code quality score',
      });
    }

    return recommendations;
  }
}

// Main execution
if (require.main === module) {
  const detector = new DuplicationDetector();
  const srcDir = path.join(process.cwd(), 'src');

  if (!fs.existsSync(srcDir)) {
    console.error('Error: src directory not found. Please run from project root.');
    process.exit(1);
  }

  detector.scanDirectory(srcDir);
}
