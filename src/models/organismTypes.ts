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
    description: 'Fast-growing single-celled organisms'
  },
  yeast: {
    name: 'Yeast',
    color: '#FFC107',
    growthRate: 0.4,
    deathRate: 0.05,
    maxAge: 200,
    size: 3,
    description: 'Fungal cells with moderate growth'
  },
  algae: {
    name: 'Algae',
    color: '#2196F3',
    growthRate: 0.2,
    deathRate: 0.02,
    maxAge: 400,
    size: 4,
    description: 'Photosynthetic organisms with slow growth'
  },
  virus: {
    name: 'Virus',
    color: '#F44336',
    growthRate: 1.2,
    deathRate: 0.3,
    maxAge: 50,
    size: 1,
    description: 'Rapidly replicating infectious agents'
  }
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
