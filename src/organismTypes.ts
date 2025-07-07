export interface OrganismType {
  name: string;
  color: string;
  growthRate: number;
  deathRate: number;
  maxAge: number;
  size: number;
  description: string;
}

export const ORGANISM_TYPES: Record<string, OrganismType> = {
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
};
