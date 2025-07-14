#!/usr/bin/env node

/**
 * GitHub Integration Quick Start
 * This script helps you get started with GitHub project management for the simulation project
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 GitHub Integration Quick Start\n');

// Create output directory
const outputDir = path.join(__dirname, '..', 'github-integration');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`✅ Created output directory: ${outputDir}`);
}

// Generate basic project setup files
generateLabels();
generateMilestones();
generateInitialIssues();
generateProjectConfig();

console.log('\n🎉 GitHub integration files generated successfully!');
console.log('\nNext steps:');
console.log('1. Go to your GitHub repository');
console.log('2. Set up labels using github-integration/labels.json');
console.log('3. Create milestones using github-integration/milestones.json');
console.log('4. Create a new GitHub Project');
console.log('5. Start creating issues from github-integration/issues/');

function generateLabels() {
  const labels = [
    // Priority labels
    {
      name: 'priority:critical',
      color: 'd73a49',
      description: 'Critical priority - immediate attention needed',
    },
    {
      name: 'priority:high',
      color: 'ff6b35',
      description: 'High priority - important feature or fix',
    },
    {
      name: 'priority:medium',
      color: 'fbca04',
      description: 'Medium priority - standard development work',
    },
    { name: 'priority:low', color: '28a745', description: 'Low priority - nice to have' },

    // Feature area labels
    {
      name: 'area:ecosystem',
      color: '1f77b4',
      description: 'Ecosystem and organism simulation features',
    },
    { name: 'area:education', color: 'ff7f0e', description: 'Educational content and tutorials' },
    {
      name: 'area:performance',
      color: '2ca02c',
      description: 'Performance optimization and efficiency',
    },
    { name: 'area:ui', color: 'd62728', description: 'User interface and user experience' },
    {
      name: 'area:infrastructure',
      color: '9467bd',
      description: 'Build, deployment, and infrastructure',
    },

    // Type labels
    { name: 'epic', color: '0052cc', description: 'Large feature spanning multiple issues' },
    { name: 'task', color: '0e8a16', description: 'Specific implementation task' },
    { name: 'bug', color: 'd73a49', description: 'Bug report or issue' },
    { name: 'enhancement', color: '84b6eb', description: 'New feature or improvement' },

    // Effort labels
    { name: 'effort:XS', color: 'f9f9f9', description: '1-2 days of work' },
    { name: 'effort:S', color: 'bfe5bf', description: '3-5 days of work' },
    { name: 'effort:M', color: 'ffeaa7', description: '1-2 weeks of work' },
    { name: 'effort:L', color: 'fab1a0', description: '2-4 weeks of work' },
    { name: 'effort:XL', color: 'fd79a8', description: '1-2 months of work' },
  ];

  const outputFile = path.join(outputDir, 'labels.json');
  fs.writeFileSync(outputFile, JSON.stringify(labels, null, 2));
  fs.chmodSync(outputFile, 0o644); // Read-write for owner, read-only for group and others
  console.log(`✅ Generated labels configuration: ${outputFile}`);
}

function generateMilestones() {
  const milestones = [
    {
      title: 'Q3 2025: Enhanced Ecosystem',
      description: 'Advanced organism behaviors, environmental factors, and enhanced visualization',
      due_on: '2025-09-30',
      state: 'open',
    },
    {
      title: 'Q4 2025: Interactive Learning',
      description: 'Educational content platform and save/load system',
      due_on: '2025-12-31',
      state: 'open',
    },
    {
      title: 'Q1 2026: Social Ecosystem',
      description: 'Multiplayer features and community content creation',
      due_on: '2026-03-31',
      state: 'open',
    },
    {
      title: 'Q2 2026: Research Platform',
      description: 'Advanced analytics and real-world integration',
      due_on: '2026-06-30',
      state: 'open',
    },
  ];

  const outputFile = path.join(outputDir, 'milestones.json');
  fs.writeFileSync(outputFile, JSON.stringify(milestones, null, 2));
  fs.chmodSync(outputFile, 0o644); // Read-write for owner, read-only for group and others
  console.log(`✅ Generated milestones configuration: ${outputFile}`);
}

function generateInitialIssues() {
  const issuesDir = path.join(outputDir, 'issues');
  if (!fs.existsSync(issuesDir)) {
    fs.mkdirSync(issuesDir, { recursive: true });
  }

  // High-priority initial issues to get started
  const initialIssues = [
    {
      title: 'Epic: Predator-Prey Dynamics System',
      labels: ['epic', 'area:ecosystem', 'priority:high', 'effort:XL'],
      milestone: 'Q3 2025: Enhanced Ecosystem',
      body: `## Overview
Implement hunting behaviors, food chains, and ecosystem balance mechanics to create realistic predator-prey relationships.

## User Stories
- As an educator, I want to show predator-prey relationships in the simulation
- As a student, I want to see realistic food chain dynamics
- As a researcher, I want to model population balance

## Acceptance Criteria
- [ ] Carnivorous organisms can hunt herbivores
- [ ] Food chain hierarchy is configurable
- [ ] Population balance is maintained automatically
- [ ] Visual indicators show hunting behavior
- [ ] Energy system supports realistic metabolism

## Tasks
- [ ] Create BehaviorType enum and interface extensions
- [ ] Implement hunt() method in Organism class
- [ ] Add prey detection algorithm using spatial partitioning
- [ ] Create energy system for organisms
- [ ] Add visual hunting indicators

## Definition of Done
- [ ] All sub-tasks completed
- [ ] Unit tests written and passing
- [ ] Integration tests validate ecosystem balance
- [ ] Documentation updated
- [ ] Performance impact assessed`,
    },
    {
      title: 'Task: Create BehaviorType enum and extend OrganismType interface',
      labels: ['task', 'area:ecosystem', 'priority:high', 'effort:S'],
      milestone: 'Q3 2025: Enhanced Ecosystem',
      body: `## Description
Create the foundation for organism behavioral types to support predator-prey mechanics.

## Technical Requirements
- Add \`BehaviorType\` enum with HERBIVORE, CARNIVORE, OMNIVORE
- Extend \`OrganismType\` interface with behavior properties
- Update existing organism types with appropriate behaviors
- Add validation for behavior type assignments

## Acceptance Criteria
- [ ] BehaviorType enum created in appropriate module
- [ ] OrganismType interface includes behaviorType field
- [ ] All existing organisms have assigned behavior types
- [ ] Type safety maintained throughout codebase

## Definition of Done
- [ ] Code implemented and tested
- [ ] Unit tests cover new functionality
- [ ] TypeScript compilation passes
- [ ] Code review completed
- [ ] Documentation updated

## Effort Estimate
3-5 days

## Dependencies
None - foundational work`,
    },
    {
      title: 'Epic: Environmental Factors System',
      labels: ['epic', 'area:ecosystem', 'priority:high', 'effort:L'],
      milestone: 'Q3 2025: Enhanced Ecosystem',
      body: `## Overview
Implement environmental factors that affect organism survival including temperature zones, resource distribution, and seasonal changes.

## User Stories
- As an educator, I want to demonstrate how environment affects organism survival
- As a student, I want to see realistic environmental pressures
- As a researcher, I want to model climate impact on populations

## Acceptance Criteria
- [ ] Temperature zones affect organism survival
- [ ] Resource scarcity creates competition
- [ ] Seasonal changes impact reproduction
- [ ] Environmental gradients are configurable
- [ ] Visual representation of environmental factors

## Tasks
- [ ] Create Environment class with temperature zones
- [ ] Implement resource distribution system
- [ ] Add seasonal variation mechanics
- [ ] Create environmental stress factors
- [ ] Add environmental visualization layer

## Definition of Done
- [ ] All environmental factors implemented
- [ ] Integration with organism lifecycle
- [ ] Performance optimized for large simulations
- [ ] Educational scenarios created
- [ ] Documentation complete`,
    },
  ];

  initialIssues.forEach((issue, index) => {
    const filename = `${String(index + 1).padStart(3, '0')}-${issue.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')}.md`;
    const content = `# ${issue.title}

**Labels:** ${issue.labels.join(', ')}
**Milestone:** ${issue.milestone}

${issue.body}`;

    const filePath = path.join(issuesDir, filename);
    fs.writeFileSync(filePath, content);
    fs.chmodSync(filePath, 0o644); // Read-write for owner, read-only for group and others
  });

  console.log(`✅ Generated ${initialIssues.length} initial issues in ${issuesDir}`);
}

function generateProjectConfig() {
  const projectConfig = {
    name: 'Organism Simulation Roadmap 2025-2026',
    description: 'Project management for the organism simulation game development roadmap',
    template: 'table',
    custom_fields: [
      {
        name: 'Priority',
        data_type: 'single_select',
        options: ['Critical', 'High', 'Medium', 'Low'],
      },
      {
        name: 'Quarter',
        data_type: 'single_select',
        options: ['Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026'],
      },
      {
        name: 'Feature Area',
        data_type: 'single_select',
        options: ['Ecosystem', 'Education', 'Performance', 'UI/UX', 'Infrastructure'],
      },
      {
        name: 'Effort',
        data_type: 'single_select',
        options: ['XS', 'S', 'M', 'L', 'XL'],
      },
    ],
    views: [
      {
        name: 'Roadmap Timeline',
        layout: 'roadmap',
        group_by: 'milestone',
        sort_by: 'created',
      },
      {
        name: 'Current Sprint',
        layout: 'board',
        filter: 'is:open label:"priority:high","priority:critical"',
        columns: ['To do', 'In progress', 'Review', 'Done'],
      },
      {
        name: 'By Feature Area',
        layout: 'table',
        group_by: 'Feature Area',
        fields: ['Title', 'Assignees', 'Labels', 'Priority', 'Effort'],
      },
    ],
  };

  const outputFile = path.join(outputDir, 'project-config.json');
  fs.writeFileSync(outputFile, JSON.stringify(projectConfig, null, 2));
  fs.chmodSync(outputFile, 0o644); // Read-write for owner, read-only for group and others
  console.log(`✅ Generated project configuration: ${outputFile}`);
}
