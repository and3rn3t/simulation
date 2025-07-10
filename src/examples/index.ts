/**
 * Examples module exports
 * 
 * This module provides access to interactive code examples
 * and documentation for the Organism Simulation project.
 */

export { InteractiveExamples, initializeInteractiveExamples } from './interactive-examples';

// Export types for examples
export type { OrganismType } from '../models/organismTypes';
export type { GameStats } from '../types/gameTypes';

// Re-export commonly used organisms for examples
export { ORGANISM_TYPES } from '../models/organismTypes';

// Re-export core classes for examples
export { Organism } from '../core/organism';
export { OrganismSimulation } from '../core/simulation';
