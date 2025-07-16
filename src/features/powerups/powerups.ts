/**
 * Represents a power-up that can be purchased and activated
 * @interface PowerUp
 */
export interface PowerUp {
  /** Unique identifier for the power-up */
  id: string;
  /** Display name of the power-up */
  name: string;
  /** Description of what the power-up does */
  description: string;
  /** Cost in points to purchase */
  cost: number;
  /** Duration in seconds (0 = permanent) */
  duration: number; // in seconds
  /** The effect this power-up applies */
  effect: PowerUpEffect;
  /** Whether the power-up is currently active */
  active: boolean;
  /** Timestamp when the power-up expires */
  endTime: number;
}

/**
 * Represents the effect of a power-up
 * @interface PowerUpEffect
 */
export interface PowerUpEffect {
  /** Type of effect */
  type: 'growth' | 'longevity' | 'population';
  /** Multiplier for the effect */
  multiplier: number;
}

/**
 * Array of available power-ups
 * @constant POWERUPS
 */

export const POWERUPS: PowerUp[] = [
  {
    id: 'growth',
    name: 'Growth Boost',
    description: 'Doubles reproduction rate for 30 seconds',
    cost: 500,
    duration: 30,
    effect: { type: 'growth', multiplier: 2 },
    active: false,
    endTime: 0,
  },
  {
    id: 'longevity',
    name: 'Longevity',
    description: 'Halves death rate for 60 seconds',
    cost: 300,
    duration: 60,
    effect: { type: 'longevity', multiplier: 0.5 },
    active: false,
    endTime: 0,
  },
  {
    id: 'population',
    name: 'Population Boom',
    description: 'Instantly spawns 50 organisms',
    cost: 800,
    duration: 0, // instant effect
    effect: { type: 'population', multiplier: 50 },
    active: false,
    endTime: 0,
  },
];

/**
 * Manages power-ups, their purchase, activation, and effects
 * @class PowerUpManager
 */
export class PowerUpManager {
  /** Array of power-ups with their current state */
  private powerups: PowerUp[] = [...POWERUPS];
  /** Current player score */
  private score: number = 0;

  /**
   * Updates the current score and refreshes power-up button states
   * @param newScore - The new score value
   */
  updateScore(newScore: number): void {
    this.score = newScore;
    this.updatePowerUpButtons();
  }

  /**
   * Checks if the player can afford a specific power-up
   * @param powerUpId - The ID of the power-up to check
   * @returns True if the player can afford it, false otherwise
   */
  canAfford(powerUpId: string): boolean {
    const powerUp = this.powerups.find(p => p.id === powerUpId);
    return powerUp ? this.score >= powerUp.cost : false;
  }

  /**
   * Attempts to buy a power-up
   * @param powerUpId - The ID of the power-up to buy
   * @returns The purchased power-up if successful, null otherwise
   */
  buyPowerUp(powerUpId: string): PowerUp | null {
    const powerUp = this.powerups.find(p => p.id === powerUpId);
    if (!powerUp || !this.canAfford(powerUpId)) {
      return null;
    }

    if (powerUp.duration > 0) {
      powerUp.active = true;
      powerUp.endTime = Date.now() + powerUp.duration * 1000;
    }

    this.score -= powerUp.cost;
    this.updatePowerUpButtons();
    return powerUp;
  }

  /**
   * Updates power-up states and deactivates expired ones
   */
  updatePowerUps(): void {
    const now = Date.now();
    for (const powerUp of this.powerups) {
      if (powerUp.active && now > powerUp.endTime) {
        powerUp.active = false;
        powerUp.endTime = 0;
      }
    }
    this.updatePowerUpButtons();
  }

  /**
   * Returns all currently active power-ups
   * @returns Array of active power-ups
   */
  getActivePowerUps(): PowerUp[] {
    return this.powerups.filter(p => p.active);
  }

  /**
   * Updates the power-up button states in the UI
   * @private
   */
  private updatePowerUpButtons(): void {
    for (const powerUp of this.powerups) {
      const button = document?.querySelector(`[data-powerup="${powerUp.id}"]`) as HTMLButtonElement;
      if (button) {
        button.disabled = !this.canAfford(powerUp.id) || powerUp.active;
        button.textContent = powerUp.active ? 'Active' : 'Buy';

        const item = button.closest('.powerup-item');
        if (item) {
          item.classList.toggle('powerup-active', powerUp.active);
        }
      }
    }
  }
}
