/**
 * Represents an achievement that can be unlocked
 * @interface Achievement
 */
export interface Achievement {
  /** Unique identifier for the achievement */
  id: string;
  /** Display name of the achievement */
  name: string;
  /** Description of what needs to be done */
  description: string;
  /** Icon to display */
  icon: string;
  /** Function to check if the achievement is unlocked */
  condition: (stats: GameStats) => boolean;
  /** Points awarded for unlocking */
  points: number;
  /** Whether the achievement has been unlocked */
  unlocked: boolean;
}

/**
 * Game statistics used for tracking progress
 * @interface GameStats
 */
export interface GameStats {
  /** Current population count */
  population: number;
  /** Current generation number */
  generation: number;
  /** Total organisms born */
  totalBirths: number;
  /** Total organisms died */
  totalDeaths: number;
  /** Maximum population ever reached */
  maxPopulation: number;
  /** Total time elapsed in seconds */
  timeElapsed: number;
  /** Average age of current organisms */
  averageAge: number;
  /** Age of the oldest organism */
  oldestAge: number;
  /** Current score */
  score: number;
}

/**
 * Represents a challenge that can be completed
 * @interface Challenge
 */
export interface Challenge {
  /** Unique identifier for the challenge */
  id: string;
  /** Display name of the challenge */
  name: string;
  /** Description of the challenge */
  description: string;
  /** Target value to reach */
  target: number;
  /** Type of challenge */
  type: 'population' | 'survival' | 'growth' | 'age';
  /** Points awarded for completion */
  reward: number;
  /** Time limit in seconds (optional) */
  timeLimit?: number;
  /** Whether the challenge has been completed */
  completed: boolean;
}

/**
 * Array of available achievements
 * @constant ACHIEVEMENTS
 */

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

/**
 * Array of available challenges
 * @constant CHALLENGES
 */
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
