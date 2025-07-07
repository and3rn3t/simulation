export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: GameStats) => boolean;
  points: number;
  unlocked: boolean;
}

export interface GameStats {
  population: number;
  generation: number;
  totalBirths: number;
  totalDeaths: number;
  maxPopulation: number;
  timeElapsed: number;
  averageAge: number;
  oldestAge: number;
  score: number;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  target: number;
  type: 'population' | 'survival' | 'growth' | 'age';
  reward: number;
  timeLimit?: number;
  completed: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-colony',
    name: 'First Colony',
    description: 'Reach 100 organisms',
    icon: '🏘️',
    condition: (stats) => stats.population >= 100,
    points: 100,
    unlocked: false
  },
  {
    id: 'metropolis',
    name: 'Metropolis',
    description: 'Reach 500 organisms',
    icon: '🏙️',
    condition: (stats) => stats.population >= 500,
    points: 500,
    unlocked: false
  },
  {
    id: 'ancient-wisdom',
    name: 'Ancient Wisdom',
    description: 'Have an organism live to age 200',
    icon: '🧙',
    condition: (stats) => stats.oldestAge >= 200,
    points: 200,
    unlocked: false
  },
  {
    id: 'baby-boom',
    name: 'Baby Boom',
    description: 'Achieve 1000 total births',
    icon: '👶',
    condition: (stats) => stats.totalBirths >= 1000,
    points: 300,
    unlocked: false
  },
  {
    id: 'population-boom',
    name: 'Population Boom',
    description: 'Reach max population (1000+)',
    icon: '💥',
    condition: (stats) => stats.population >= 1000,
    points: 1000,
    unlocked: false
  },
  {
    id: 'survivor',
    name: 'Survivor',
    description: 'Keep a population alive for 5 minutes',
    icon: '⏰',
    condition: (stats) => stats.timeElapsed >= 300 && stats.population > 0,
    points: 400,
    unlocked: false
  },
  {
    id: 'balanced-ecosystem',
    name: 'Balanced Ecosystem',
    description: 'Maintain population between 200-300 for 1 minute',
    icon: '⚖️',
    condition: (stats) => stats.population >= 200 && stats.population <= 300,
    points: 600,
    unlocked: false
  }
];

export const CHALLENGES: Challenge[] = [
  {
    id: 'rapid-growth',
    name: 'Rapid Growth',
    description: 'Reach 200 organisms in under 60 seconds',
    target: 200,
    type: 'population',
    reward: 500,
    timeLimit: 60,
    completed: false
  },
  {
    id: 'longevity-master',
    name: 'Longevity Master',
    description: 'Keep average age above 100 for 2 minutes',
    target: 100,
    type: 'age',
    reward: 400,
    timeLimit: 120,
    completed: false
  },
  {
    id: 'growth-spurt',
    name: 'Growth Spurt',
    description: 'Achieve 50 generations',
    target: 50,
    type: 'growth',
    reward: 300,
    completed: false
  }
];
