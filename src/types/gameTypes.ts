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
