/**
 * Defines the behavioral characteristics of organisms in the ecosystem
 * @enum BehaviorType
 */
export enum BehaviorType {
  /** Organism feeds on other organisms */
  PREDATOR = 'predator',
  /** Organism can be hunted by predators */
  PREY = 'prey',
  /** Organism feeds on both other organisms and produces energy */
  OMNIVORE = 'omnivore',
  /** Organism produces its own energy (e.g., photosynthesis) */
  PRODUCER = 'producer',
  /** Organism feeds on dead organic matter */
  DECOMPOSER = 'decomposer',
}

/**
 * Defines hunting and feeding preferences for predator organisms
 * @interface HuntingBehavior
 */
export interface HuntingBehavior {
  /** Maximum distance organism can detect prey */
  huntingRange: number;
  /** Speed multiplier when hunting (1.0 = normal speed) */
  huntingSpeed: number;
  /** Types of organisms this predator can hunt */
  preyTypes: readonly OrganismTypeName[];
  /** Energy gained from successful hunt */
  energyGainPerHunt: number;
  /** Success rate of hunting attempts (0.0-1.0) */
  huntingSuccess: number;
}

/**
 * Defines the properties and characteristics of an organism type
 * @interface OrganismType
 */
export interface OrganismType {
  /** Display name of the organism */
  name: string;
  /** Color to render the organism */
  color: string;
  /** Rate at which the organism reproduces */
  growthRate: number;
  /** Rate at which the organism dies */
  deathRate: number;
  /** Maximum age the organism can reach */
  maxAge: number;
  /** Size of the organism when rendered */
  size: number;
  /** Description of the organism */
  description: string;
  /** Behavioral classification of the organism */
  behaviorType: BehaviorType;
  /** Initial energy level when organism is created */
  initialEnergy: number;
  /** Maximum energy the organism can store */
  maxEnergy: number;
  /** Energy consumed per simulation tick */
  energyConsumption: number;
  /** Hunting behavior (only for predators and omnivores) */
  huntingBehavior?: HuntingBehavior;
}

/**
 * Collection of predefined organism types
 * @constant ORGANISM_TYPES
 */
export const ORGANISM_TYPES = {
  bacteria: {
    name: 'Bacteria',
    color: '#4CAF50',
    growthRate: 0.8,
    deathRate: 0.1,
    maxAge: 100,
    size: 2,
    description: 'Fast-growing single-celled organisms',
    behaviorType: BehaviorType.PREY,
    initialEnergy: 50,
    maxEnergy: 100,
    energyConsumption: 1,
  },
  yeast: {
    name: 'Yeast',
    color: '#FFC107',
    growthRate: 0.4,
    deathRate: 0.05,
    maxAge: 200,
    size: 3,
    description: 'Fungal cells with moderate growth',
    behaviorType: BehaviorType.DECOMPOSER,
    initialEnergy: 75,
    maxEnergy: 150,
    energyConsumption: 0.8,
  },
  algae: {
    name: 'Algae',
    color: '#2196F3',
    growthRate: 0.2,
    deathRate: 0.02,
    maxAge: 400,
    size: 4,
    description: 'Photosynthetic organisms with slow growth',
    behaviorType: BehaviorType.PRODUCER,
    initialEnergy: 100,
    maxEnergy: 200,
    energyConsumption: 0.5,
  },
  virus: {
    name: 'Virus',
    color: '#F44336',
    growthRate: 1.2,
    deathRate: 0.3,
    maxAge: 50,
    size: 1,
    description: 'Rapidly replicating infectious agents',
    behaviorType: BehaviorType.PREDATOR,
    initialEnergy: 30,
    maxEnergy: 80,
    energyConsumption: 2,
    huntingBehavior: {
      huntingRange: 20,
      huntingSpeed: 1.5,
      preyTypes: ['bacteria', 'yeast'],
      energyGainPerHunt: 25,
      huntingSuccess: 0.7,
    },
  },
} as const;

// Type-safe accessors for organism types
export type OrganismTypeName = keyof typeof ORGANISM_TYPES;

/**
 * Get an organism type by name with type safety
 */
export function getOrganismType(name: OrganismTypeName): OrganismType {
  return ORGANISM_TYPES[name];
}

/**
 * Get all available organism type names
 */
export function getOrganismTypeNames(): OrganismTypeName[] {
  return Object.keys(ORGANISM_TYPES) as OrganismTypeName[];
}

/**
 * Check if an organism type is a predator
 */
export function isPredator(organismType: OrganismType): boolean {
  return (
    organismType.behaviorType === BehaviorType.PREDATOR ||
    organismType.behaviorType === BehaviorType.OMNIVORE
  );
}

/**
 * Check if an organism type is prey
 */
export function isPrey(organismType: OrganismType): boolean {
  return (
    organismType.behaviorType === BehaviorType.PREY ||
    organismType.behaviorType === BehaviorType.PRODUCER ||
    organismType.behaviorType === BehaviorType.DECOMPOSER
  );
}

/**
 * Check if predator can hunt prey type
 */
export function canHunt(predator: OrganismType, preyTypeName: OrganismTypeName): boolean {
  if (!predator.huntingBehavior) return false;
  return predator.huntingBehavior.preyTypes.includes(preyTypeName);
}

/**
 * Get all predator organism types
 */
export function getPredatorTypes(): OrganismType[] {
  return getOrganismTypeNames()
    .map(name => getOrganismType(name))
    .filter(isPredator);
}

/**
 * Get all prey organism types
 */
export function getPreyTypes(): OrganismType[] {
  return getOrganismTypeNames()
    .map(name => getOrganismType(name))
    .filter(isPrey);
}
