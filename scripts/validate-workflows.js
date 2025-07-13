#!/usr/bin/env node
/**
 * CI/CD Workflow Validation Script
 * Validates GitHub Actions workflow configuration and provides optimization recommendations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic import for yaml since it may not be installed
let yaml;
try {
  yaml = await import('js-yaml');
} catch (error) {
  console.log('📦 js-yaml not found, using basic YAML parsing...');
}

class WorkflowValidator {
  constructor() {
    this.workflowDir = '.github/workflows';
    this.issues = [];
    this.recommendations = [];
    this.metrics = {
      totalWorkflows: 0,
      totalJobs: 0,
      totalSteps: 0,
      duplicateSteps: 0,
      optimizationOpportunities: 0,
    };
  }

  validateWorkflows() {
    console.log('🔍 Validating CI/CD Workflows...\n');

    if (!fs.existsSync(this.workflowDir)) {
      this.addIssue('CRITICAL', 'Workflow directory not found', this.workflowDir);
      return this.generateReport();
    }

    const workflowFiles = fs
      .readdirSync(this.workflowDir)
      .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'));

    if (workflowFiles.length === 0) {
      this.addIssue('WARNING', 'No workflow files found', this.workflowDir);
      return this.generateReport();
    }

    this.metrics.totalWorkflows = workflowFiles.length;

    // Analyze each workflow
    const workflows = [];
    for (const file of workflowFiles) {
      const filePath = path.join(this.workflowDir, file);
      const workflow = this.analyzeWorkflow(filePath);
      if (workflow) {
        workflows.push(workflow);
      }
    }

    // Cross-workflow analysis
    this.analyzeWorkflowInteractions(workflows);
    this.checkForOptimizations(workflows);

    return this.generateReport();
  }

  analyzeWorkflow(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let workflow;

      if (yaml) {
        workflow = yaml.load(content);
      } else {
        // Basic YAML parsing fallback
        console.log('⚠️ Using basic YAML parsing - install js-yaml for full validation');
        try {
          workflow = JSON.parse(content);
        } catch {
          // Skip complex YAML parsing without js-yaml
          console.log(`⚠️ Skipping complex YAML file: ${fileName}`);
          return null;
        }
      }
      const fileName = path.basename(filePath);

      console.log(`📄 Analyzing ${fileName}...`);

      // Basic validation
      this.validateWorkflowStructure(workflow, fileName);

      // Job analysis
      if (workflow.jobs) {
        const jobCount = Object.keys(workflow.jobs).length;
        this.metrics.totalJobs += jobCount;

        for (const [jobName, job] of Object.entries(workflow.jobs)) {
          this.analyzeJob(jobName, job, fileName);
        }
      }

      return {
        fileName,
        workflow,
        jobs: workflow.jobs || {},
      };
    } catch (error) {
      this.addIssue('ERROR', `Failed to parse workflow: ${error.message}`, filePath);
      return null;
    }
  }

  validateWorkflowStructure(workflow, fileName) {
    // Check required fields
    if (!workflow.name) {
      this.addIssue('WARNING', 'Workflow missing name', fileName);
    }

    if (!workflow.on) {
      this.addIssue('ERROR', 'Workflow missing trigger configuration', fileName);
    }

    if (!workflow.jobs) {
      this.addIssue('ERROR', 'Workflow missing jobs', fileName);
    }

    // Check for best practices
    if (workflow.on && !workflow.concurrency) {
      this.addRecommendation(
        'Consider adding concurrency control to prevent resource conflicts',
        fileName
      );
    }

    if (!workflow.env) {
      this.addRecommendation('Consider using workflow-level environment variables', fileName);
    }
  }

  analyzeJob(jobName, job, fileName) {
    if (!job.steps) {
      this.addIssue('WARNING', `Job '${jobName}' has no steps`, fileName);
      return;
    }

    const stepCount = job.steps.length;
    this.metrics.totalSteps += stepCount;

    // Check for common issues
    if (!job['runs-on']) {
      this.addIssue('ERROR', `Job '${jobName}' missing runs-on`, fileName);
    }

    if (!job.timeout && stepCount > 10) {
      this.addRecommendation(`Consider adding timeout to job '${jobName}'`, fileName);
    }

    // Analyze steps
    for (const [index, step] of job.steps.entries()) {
      this.analyzeStep(step, index, jobName, fileName);
    }
  }

  analyzeStep(step, index, jobName, fileName) {
    if (!step.name && !step.uses) {
      this.addIssue('WARNING', `Step ${index + 1} in job '${jobName}' missing name`, fileName);
    }

    // Check for outdated actions
    if (step.uses) {
      this.checkActionVersion(step.uses, jobName, fileName);
    }

    // Check for common patterns
    if (step.run && step.run.includes('npm ci')) {
      if (!step.name?.includes('cache') && !jobName.includes('cache')) {
        this.addRecommendation(
          `Consider adding npm cache for performance in job '${jobName}'`,
          fileName
        );
      }
    }
  }

  checkActionVersion(actionRef, jobName, fileName) {
    // Check for commonly outdated actions
    const actionUpdates = {
      'actions/checkout@v3': 'actions/checkout@v4',
      'actions/setup-node@v3': 'actions/setup-node@v4',
      'actions/cache@v3': 'actions/cache@v4',
      'docker/build-push-action@v4': 'docker/build-push-action@v5',
    };

    for (const [old, newer] of Object.entries(actionUpdates)) {
      if (actionRef.includes(old)) {
        this.addRecommendation(`Update ${old} to ${newer} in job '${jobName}'`, fileName);
      }
    }
  }

  analyzeWorkflowInteractions(workflows) {
    // Check for duplicate job patterns
    const jobPatterns = new Map();

    for (const { fileName, jobs } of workflows) {
      for (const [jobName, job] of Object.entries(jobs)) {
        const pattern = this.createJobPattern(job);

        if (jobPatterns.has(pattern)) {
          jobPatterns.get(pattern).push({ fileName, jobName });
          this.metrics.duplicateSteps++;
        } else {
          jobPatterns.set(pattern, [{ fileName, jobName }]);
        }
      }
    }

    // Report duplicates
    for (const [, instances] of jobPatterns) {
      if (instances.length > 1) {
        const files = instances.map(i => `${i.fileName}:${i.jobName}`).join(', ');
        this.addRecommendation(`Duplicate job pattern found: ${files}`, 'MULTIPLE');
      }
    }
  }

  createJobPattern(job) {
    // Create a simple pattern based on key steps
    const steps = job.steps || [];
    const keySteps = steps.map(step => {
      if (step.uses) return step.uses.split('@')[0]; // Remove version
      if (step.run) return step.run.split(' ')[0]; // First command
      return 'unknown';
    });
    return keySteps.join('|');
  }

  checkForOptimizations(workflows) {
    // Check if we have multiple workflows that could be consolidated
    if (workflows.length > 3) {
      this.metrics.optimizationOpportunities++;
      this.addRecommendation(
        `Consider consolidating ${workflows.length} workflows into fewer files for easier maintenance`,
        'OPTIMIZATION'
      );
    }

    // Check for missing caching
    let hasCaching = false;
    for (const { workflow } of workflows) {
      if (this.workflowHasCaching(workflow)) {
        hasCaching = true;
        break;
      }
    }

    if (!hasCaching) {
      this.metrics.optimizationOpportunities++;
      this.addRecommendation(
        'No caching detected - consider adding cache steps for better performance',
        'OPTIMIZATION'
      );
    }

    // Check for matrix strategies
    let hasMatrix = false;
    for (const { workflow } of workflows) {
      if (this.workflowHasMatrix(workflow)) {
        hasMatrix = true;
        break;
      }
    }

    if (!hasMatrix && workflows.length > 1) {
      this.metrics.optimizationOpportunities++;
      this.addRecommendation(
        'Consider using matrix strategies for parallel execution',
        'OPTIMIZATION'
      );
    }
  }

  workflowHasCaching(workflow) {
    if (!workflow.jobs) return false;

    for (const job of Object.values(workflow.jobs)) {
      if (!job.steps) continue;

      for (const step of job.steps) {
        if (step.uses && step.uses.includes('actions/cache')) {
          return true;
        }
      }
    }
    return false;
  }

  workflowHasMatrix(workflow) {
    if (!workflow.jobs) return false;

    for (const job of Object.values(workflow.jobs)) {
      if (job.strategy && job.strategy.matrix) {
        return true;
      }
    }
    return false;
  }

  addIssue(severity, message, location) {
    this.issues.push({ severity, message, location });
  }

  addRecommendation(message, location) {
    this.recommendations.push({ message, location });
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 CI/CD WORKFLOW VALIDATION REPORT');
    console.log('='.repeat(60));

    // Metrics
    console.log('\n📈 Metrics:');
    console.log(`  Total Workflows: ${this.metrics.totalWorkflows}`);
    console.log(`  Total Jobs: ${this.metrics.totalJobs}`);
    console.log(`  Total Steps: ${this.metrics.totalSteps}`);

    if (this.metrics.duplicateSteps > 0) {
      console.log(`  🔄 Duplicate Patterns: ${this.metrics.duplicateSteps}`);
    }

    if (this.metrics.optimizationOpportunities > 0) {
      console.log(`  ⚡ Optimization Opportunities: ${this.metrics.optimizationOpportunities}`);
    }

    // Issues
    if (this.issues.length > 0) {
      console.log('\n❌ Issues Found:');
      for (const issue of this.issues) {
        const emoji =
          issue.severity === 'CRITICAL' ? '🚨' : issue.severity === 'ERROR' ? '❌' : '⚠️';
        console.log(`  ${emoji} [${issue.severity}] ${issue.message} (${issue.location})`);
      }
    } else {
      console.log('\n✅ No issues found!');
    }

    // Recommendations
    if (this.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      for (const rec of this.recommendations) {
        console.log(`  🔧 ${rec.message} (${rec.location})`);
      }
    }

    // Overall Assessment
    console.log('\n🎯 Overall Assessment:');
    const criticalIssues = this.issues.filter(i => i.severity === 'CRITICAL').length;
    const errors = this.issues.filter(i => i.severity === 'ERROR').length;

    if (criticalIssues > 0) {
      console.log('  🚨 CRITICAL ISSUES FOUND - Immediate action required');
    } else if (errors > 0) {
      console.log('  ⚠️ ERRORS FOUND - Workflow may not function correctly');
    } else if (this.recommendations.length > 5) {
      console.log('  🔧 OPTIMIZATION RECOMMENDED - Consider workflow consolidation');
    } else {
      console.log('  ✅ WORKFLOW HEALTH GOOD - Minor optimizations possible');
    }

    console.log('\n');
    return {
      metrics: this.metrics,
      issues: this.issues,
      recommendations: this.recommendations,
      status:
        criticalIssues > 0
          ? 'CRITICAL'
          : errors > 0
            ? 'ERROR'
            : this.recommendations.length > 5
              ? 'OPTIMIZE'
              : 'GOOD',
    };
  }
}

// Execute validation
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new WorkflowValidator();
  const result = validator.validateWorkflows();

  // Exit with appropriate code
  process.exit(result.status === 'CRITICAL' ? 1 : 0);
}
