import type { GameStats } from '../../types/gameTypes';

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
 * Array of available achievements
 * @constant ACHIEVEMENTS
 */
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-colony',
    name: 'First Colony',
    description: 'Reach 100 organisms',
    icon: '🏘️',
    condition: stats => stats.population >= 100,
    points: 100,
    unlocked: false,
  },
  {
    id: 'metropolis',
    name: 'Metropolis',
    description: 'Reach 500 organisms',
    icon: '🏙️',
    condition: stats => stats.population >= 500,
    points: 500,
    unlocked: false,
  },
  {
    id: 'ancient-wisdom',
    name: 'Ancient Wisdom',
    description: 'Have an organism live to age 200',
    icon: '🧙',
    condition: stats => stats.oldestAge >= 200,
    points: 200,
    unlocked: false,
  },
  {
    id: 'baby-boom',
    name: 'Baby Boom',
    description: 'Achieve 1000 total births',
    icon: '👶',
    condition: stats => stats.totalBirths >= 1000,
    points: 300,
    unlocked: false,
  },
  {
    id: 'population-boom',
    name: 'Population Boom',
    description: 'Reach max population (1000+)',
    icon: '💥',
    condition: stats => stats.population >= 1000,
    points: 1000,
    unlocked: false,
  },
  {
    id: 'survivor',
    name: 'Survivor',
    description: 'Keep a population alive for 5 minutes',
    icon: '⏰',
    condition: stats => stats.timeElapsed >= 300 && stats.population > 0,
    points: 400,
    unlocked: false,
  },
  {
    id: 'balanced-ecosystem',
    name: 'Balanced Ecosystem',
    description: 'Maintain population between 200-300 for 1 minute',
    icon: '⚖️',
    condition: stats => stats.population >= 200 && stats.population <= 300,
    points: 600,
    unlocked: false,
  },
];
