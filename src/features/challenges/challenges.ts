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
    completed: false,
  },
  {
    id: 'longevity-master',
    name: 'Longevity Master',
    description: 'Keep average age above 100 for 2 minutes',
    target: 100,
    type: 'age',
    reward: 400,
    timeLimit: 120,
    completed: false,
  },
  {
    id: 'growth-spurt',
    name: 'Growth Spurt',
    description: 'Achieve 50 generations',
    target: 50,
    type: 'growth',
    reward: 300,
    completed: false,
  },
];
