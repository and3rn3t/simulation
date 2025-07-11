#!/usr/bin/env node

/**
 * GitHub Issue Creation Script
 * 
 * This script helps convert roadmap items and TODOs into GitHub issues
 * automatically with proper labels, milestones, and project assignments.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GitHub API configuration (you'll need to add your token)
const GITHUB_CONFIG = {
  owner: 'and3rn3t',
  repo: 'simulation',
  token: process.env.GITHUB_TOKEN, // Set this environment variable
  baseUrl: 'https://api.github.com'
};

// Roadmap feature mapping to GitHub issues
const ROADMAP_FEATURES = {
  // Q3 2025 Features
  'predator-prey-dynamics': {
    title: 'Epic: Predator-Prey Dynamics System',
    quarter: 'Q3 2025',
    area: 'Ecosystem',
    priority: 'High',
    description: 'Implement hunting behaviors, food chains, and ecosystem balance mechanics',
    tasks: [
      'Create BehaviorType enum and interface extensions',
      'Implement hunt() method in Organism class',
      'Add prey detection algorithm using spatial partitioning',
      'Create energy system for organisms',
      'Add visual hunting indicators'
    ]
  },
  
  'genetic-evolution': {
    title: 'Epic: Genetic Evolution System',
    quarter: 'Q3 2025',
    area: 'Ecosystem',
    priority: 'High',
    description: 'Implement trait inheritance, mutation, and natural selection',
    tasks: [
      'Add Genetics class with inheritable traits',
      'Implement basic traits: size, speed, lifespan, reproduction rate',
      'Create trait inheritance algorithm (Mendelian genetics)',
      'Add mutation system with configurable mutation rate',
      'Modify organism rendering to show genetic traits'
    ]
  },
  
  'environmental-factors': {
    title: 'Epic: Environmental Factors System',
    quarter: 'Q3 2025',
    area: 'Ecosystem',
    priority: 'High',
    description: 'Add temperature zones, resource management, and environmental effects',
    tasks: [
      'Create TemperatureZone class with heat map visualization',
      'Implement temperature effects on organism behavior',
      'Add FoodSource class and resource spawning',
      'Create resource competition and depletion mechanics',
      'Add pH and chemical factor systems'
    ]
  },
  
  'enhanced-visualization': {
    title: 'Epic: Enhanced Visualization System',
    quarter: 'Q3 2025',
    area: 'UI/UX',
    priority: 'Medium',
    description: 'Upgrade graphics with sprites, animations, and particle effects',
    tasks: [
      'Create sprite system replacing simple circles',
      'Design unique sprites for each organism type',
      'Implement ParticleSystem class',
      'Add birth, death, and interaction particle effects',
      'Create environmental heat map overlays'
    ]
  },
  
  // Q4 2025 Features
  'educational-content': {
    title: 'Epic: Educational Content Platform',
    quarter: 'Q4 2025',
    area: 'Education',
    priority: 'High',
    description: 'Create interactive tutorials and scientific learning modules',
    tasks: [
      'Create TutorialManager class and framework',
      'Build "Basic Ecosystem" tutorial',
      'Implement scientific accuracy mode',
      'Add data collection and export functionality',
      'Create educational scenario library'
    ]
  },
  
  'save-load-system': {
    title: 'Epic: Save & Load System',
    quarter: 'Q4 2025',
    area: 'Infrastructure',
    priority: 'High',
    description: 'Implement simulation state management and sharing',
    tasks: [
      'Create SimulationState serialization system',
      'Implement save/load to localStorage',
      'Add multiple save slot system',
      'Create JSON export for sharing simulations',
      'Add simulation template system'
    ]
  }
};

// Effort estimation mapping
const EFFORT_ESTIMATES = {
  'Create': 'M',      // Creating new systems
  'Implement': 'L',   // Complex implementation
  'Add': 'S',         // Adding features to existing systems
  'Design': 'S',      // Design work
  'Build': 'M'        // Building components
};

/**
 * Generate GitHub issue content for an epic
 */
function generateEpicIssue(featureKey, feature) {
  const tasks = feature.tasks.map((task, index) => `- [ ] Task ${index + 1}: ${task}`).join('\n');
  
  return {
    title: feature.title,
    body: `## Overview
${feature.description}

## User Stories
- As an educator, I want to demonstrate ${featureKey.replace('-', ' ')} concepts
- As a student, I want to observe realistic ${featureKey.replace('-', ' ')} behavior
- As a researcher, I want to model ${featureKey.replace('-', ' ')} scenarios

## Acceptance Criteria
- [ ] All core functionality implemented and working
- [ ] Performance requirements met (60 FPS with 1000+ organisms)
- [ ] Educational value clearly demonstrated
- [ ] Visual feedback provides clear understanding

## Sub-tasks
${tasks}

## Definition of Done
- [ ] All sub-tasks completed
- [ ] Unit tests written and passing
- [ ] Integration tests validate functionality
- [ ] Documentation updated
- [ ] Performance impact assessed
- [ ] Code review completed

## Related Documentation
- [Product Roadmap](../docs/development/PRODUCT_ROADMAP.md)
- [Immediate TODOs](../docs/development/IMMEDIATE_TODOS.md)

*This issue was auto-generated from the product roadmap.*`,
    labels: ['epic', 'feature', `area:${feature.area.toLowerCase()}`, `priority:${feature.priority.toLowerCase()}`, `quarter:${feature.quarter.replace(' ', '-').toLowerCase()}`],
    milestone: feature.quarter
  };
}

/**
 * Generate GitHub issue content for a task
 */
function generateTaskIssue(taskDescription, parentFeature) {
  const effort = Object.keys(EFFORT_ESTIMATES).find(key => taskDescription.startsWith(key)) || 'M';
  
  return {
    title: `Task: ${taskDescription}`,
    body: `## Description
${taskDescription}

## Technical Requirements
- Follow existing TypeScript architecture patterns
- Maintain performance requirements (60 FPS target)
- Add appropriate error handling and validation
- Follow established coding standards

## Acceptance Criteria
- [ ] Feature works as specified
- [ ] Code follows project standards
- [ ] Tests are written and passing
- [ ] Documentation is updated

## Definition of Done
- [ ] Code implemented and tested
- [ ] Unit tests cover new functionality
- [ ] TypeScript compilation passes
- [ ] Code review completed
- [ ] Documentation updated

## Related Epic
Part of ${parentFeature.title}

*This issue was auto-generated from the immediate TODOs.*`,
    labels: ['task', 'implementation', `area:${parentFeature.area.toLowerCase()}`, `effort:${EFFORT_ESTIMATES[effort] || 'M'}`]
  };
}

/**
 * Main function to generate all issues
 */
function generateAllIssues() {
  const issues = [];
  
  // Generate Epic issues
  Object.entries(ROADMAP_FEATURES).forEach(([key, feature]) => {
    issues.push({
      type: 'epic',
      feature: key,
      ...generateEpicIssue(key, feature)
    });
    
    // Generate task issues for each epic
    feature.tasks.forEach(task => {
      issues.push({
        type: 'task',
        feature: key,
        parent: feature.title,
        ...generateTaskIssue(task, feature)
      });
    });
  });
  
  return issues;
}

/**
 * Output issues to files for manual creation
 */
function outputIssuesForManualCreation() {
  const issues = generateAllIssues();
  const outputDir = path.join(__dirname, '..', 'generated-issues');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  issues.forEach((issue, index) => {
    const filename = `${String(index + 1).padStart(3, '0')}-${issue.type}-${issue.feature}.md`;
    const content = `# ${issue.title}

**Labels:** ${issue.labels.join(', ')}
${issue.milestone ? `**Milestone:** ${issue.milestone}` : ''}

${issue.body}`;
    
    fs.writeFileSync(path.join(outputDir, filename), content);
  });
  
  console.log(`Generated ${issues.length} issue files in ${outputDir}`);
  console.log('\nTo create these issues in GitHub:');
  console.log('1. Go to your repository → Issues → New Issue');
  console.log('2. Copy the content from each generated file');
  console.log('3. Add the specified labels and milestone');
  console.log('4. Create the issue');
}

/**
 * Create GitHub project milestones
 */
function generateMilestones() {
  const milestones = [
    {
      title: 'Q3 2025: Enhanced Ecosystem',
      description: 'Advanced organism behaviors, environmental factors, and enhanced visualization',
      due_on: '2025-09-30T23:59:59Z'
    },
    {
      title: 'Q4 2025: Interactive Learning',
      description: 'Educational content platform and save/load system',
      due_on: '2025-12-31T23:59:59Z'
    },
    {
      title: 'Q1 2026: Social Ecosystem',
      description: 'Multiplayer features and community content creation',
      due_on: '2026-03-31T23:59:59Z'
    },
    {
      title: 'Q2 2026: Research Platform',
      description: 'Advanced analytics and real-world integration',
      due_on: '2026-06-30T23:59:59Z'
    }
  ];
  
  const outputFile = path.join(__dirname, '..', 'generated-milestones.json');
  fs.writeFileSync(outputFile, JSON.stringify(milestones, null, 2));
  
  console.log(`Generated milestones in ${outputFile}`);
  console.log('\nTo create these milestones in GitHub:');
  console.log('1. Go to your repository → Issues → Milestones → New milestone');
  console.log('2. Use the data from the generated JSON file');
}

/**
 * Generate project board configuration
 */
function generateProjectConfig() {
  const projectConfig = {
    name: 'Organism Simulation Roadmap 2025-2026',
    description: 'Track progress on transforming the simulation into a comprehensive biological education platform',
    views: [
      {
        name: 'Roadmap Timeline',
        type: 'roadmap',
        group_by: 'milestone',
        sort_by: 'created_at'
      },
      {
        name: 'Current Sprint',
        type: 'board',
        filter: 'is:open label:"priority:high","priority:critical"',
        columns: ['Backlog', 'In Progress', 'Review', 'Done']
      },
      {
        name: 'By Feature Area',
        type: 'table',
        group_by: 'labels',
        filter: 'is:open',
        fields: ['title', 'assignees', 'labels', 'milestone', 'priority', 'effort']
      }
    ],
    custom_fields: [
      { name: 'Priority', type: 'single_select', options: ['Critical', 'High', 'Medium', 'Low'] },
      { name: 'Effort', type: 'single_select', options: ['XS', 'S', 'M', 'L', 'XL'] },
      { name: 'Feature Area', type: 'single_select', options: ['Ecosystem', 'Education', 'Performance', 'UI/UX', 'Infrastructure'] }
    ]
  };
  
  const outputFile = path.join(__dirname, '..', 'github-project-config.json');
  fs.writeFileSync(outputFile, JSON.stringify(projectConfig, null, 2));
  
  console.log(`Generated project configuration in ${outputFile}`);
}

// Main execution - check if this file is being run directly
const isMainModule = import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || 
                     import.meta.url.includes('generate-github-issues.js');

if (isMainModule) {
  console.log('🚀 Generating GitHub project management files...\n');
  
  outputIssuesForManualCreation();
  console.log('');
  generateMilestones();
  console.log('');
  generateProjectConfig();
  
  console.log('\n✅ All files generated successfully!');
  console.log('\nNext steps:');
  console.log('1. Create milestones in GitHub using generated-milestones.json');
  console.log('2. Create a new GitHub Project using github-project-config.json as reference');
  console.log('3. Create issues using the files in generated-issues/ directory');
  console.log('4. Assign issues to the project and appropriate milestones');
}

export {
  generateAllIssues,
  generateEpicIssue,
  generateTaskIssue,
  ROADMAP_FEATURES
};
