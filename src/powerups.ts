export interface PowerUp {
  id: string;
  name: string;
  description: string;
  cost: number;
  duration: number; // in seconds
  effect: PowerUpEffect;
  active: boolean;
  endTime: number;
}

export interface PowerUpEffect {
  type: 'growth' | 'longevity' | 'population';
  multiplier: number;
}

export const POWERUPS: PowerUp[] = [
  {
    id: 'growth',
    name: 'Growth Boost',
    description: 'Doubles reproduction rate for 30 seconds',
    cost: 500,
    duration: 30,
    effect: { type: 'growth', multiplier: 2 },
    active: false,
    endTime: 0
  },
  {
    id: 'longevity',
    name: 'Longevity',
    description: 'Halves death rate for 60 seconds',
    cost: 300,
    duration: 60,
    effect: { type: 'longevity', multiplier: 0.5 },
    active: false,
    endTime: 0
  },
  {
    id: 'population',
    name: 'Population Boom',
    description: 'Instantly spawns 50 organisms',
    cost: 800,
    duration: 0, // instant effect
    effect: { type: 'population', multiplier: 50 },
    active: false,
    endTime: 0
  }
];

export class PowerUpManager {
  private powerups: PowerUp[] = [...POWERUPS];
  private score: number = 0;

  updateScore(newScore: number): void {
    this.score = newScore;
    this.updatePowerUpButtons();
  }

  canAfford(powerUpId: string): boolean {
    const powerUp = this.powerups.find(p => p.id === powerUpId);
    return powerUp ? this.score >= powerUp.cost : false;
  }

  buyPowerUp(powerUpId: string): PowerUp | null {
    const powerUp = this.powerups.find(p => p.id === powerUpId);
    if (!powerUp || !this.canAfford(powerUpId)) {
      return null;
    }

    if (powerUp.duration > 0) {
      powerUp.active = true;
      powerUp.endTime = Date.now() + (powerUp.duration * 1000);
    }

    this.score -= powerUp.cost;
    this.updatePowerUpButtons();
    return powerUp;
  }

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

  getActivePowerUps(): PowerUp[] {
    return this.powerups.filter(p => p.active);
  }

  private updatePowerUpButtons(): void {
    for (const powerUp of this.powerups) {
      const button = document.querySelector(`[data-powerup="${powerUp.id}"]`) as HTMLButtonElement;
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
