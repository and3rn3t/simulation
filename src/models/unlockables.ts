import { ifPattern } from '../utils/UltimatePatternConsolidator';
import { BehaviorType, type OrganismType } from './organismTypes';

/**
 * Represents an organism type that can be unlocked through gameplay
 * @interface UnlockableOrganismType
 * @extends OrganismType
 */
export interface UnlockableOrganismType extends OrganismType {
  /** Unique identifier for the organism */
  id: string;
  /** Conditions required to unlock this organism */
  unlockCondition: {
    /** Type of unlock condition */
    type: 'achievement' | 'score' | 'population';
    /** Value required to meet the condition */
    value: string | number;
  };
  /** Whether this organism has been unlocked */
  unlocked: boolean;
}

/**
 * Array of unlockable organism types with their properties and unlock conditions
 * @constant UNLOCKABLE_ORGANISMS
 */
export const UNLOCKABLE_ORGANISMS: UnlockableOrganismType[] = [
  {
    id: 'super-bacteria',
    name: 'Super Bacteria',
    description: 'Enhanced bacteria with superior growth rates',
    color: '#00FF00',
    size: 3,
    maxAge: 180,
    growthRate: 0.8,
    deathRate: 0.005,
    behaviorType: BehaviorType.PREY,
    initialEnergy: 75,
    maxEnergy: 150,
    energyConsumption: 1.2,
    unlockCondition: { type: 'achievement', value: 'first-colony' },
    unlocked: false,
  },
  {
    id: 'crystal-organism',
    name: 'Crystal Organism',
    description: 'Mysterious crystalline life form with extreme longevity',
    color: '#FF00FF',
    size: 4,
    maxAge: 500,
    growthRate: 0.3,
    deathRate: 0.001,
    behaviorType: BehaviorType.PREY,
    initialEnergy: 100,
    maxEnergy: 200,
    energyConsumption: 0.8,
    unlockCondition: { type: 'achievement', value: 'ancient-wisdom' },
    unlocked: false,
  },
  {
    id: 'nano-virus',
    name: 'Nano Virus',
    description: 'Microscopic virus with rapid replication',
    color: '#FF4444',
    size: 2,
    maxAge: 80,
    growthRate: 1.2,
    deathRate: 0.02,
    behaviorType: BehaviorType.PREY,
    initialEnergy: 50,
    maxEnergy: 100,
    energyConsumption: 1.5,
    unlockCondition: { type: 'score', value: 5000 },
    unlocked: false,
  },
  {
    id: 'meta-organism',
    name: 'Meta Organism',
    description: 'Advanced organism that adapts to its environment',
    color: '#FFD700',
    size: 5,
    maxAge: 300,
    growthRate: 0.6,
    deathRate: 0.003,
    behaviorType: BehaviorType.PREY,
    initialEnergy: 90,
    maxEnergy: 180,
    energyConsumption: 1.0,
    unlockCondition: { type: 'achievement', value: 'metropolis' },
    unlocked: false,
  },
  {
    id: 'quantum-cell',
    name: 'Quantum Cell',
    description: 'Exotic organism that exists in multiple states',
    color: '#00FFFF',
    size: 3,
    maxAge: 400,
    growthRate: 0.4,
    deathRate: 0.002,
    behaviorType: BehaviorType.PREY,
    initialEnergy: 80,
    maxEnergy: 160,
    energyConsumption: 1.1,
    unlockCondition: { type: 'population', value: 1000 },
    unlocked: false,
  },
];

/**
 * Manages unlockable organisms, checking unlock conditions and updating the UI
 * @class UnlockableOrganismManager
 */
export class UnlockableOrganismManager {
  /** Array of unlockable organisms with their current state */
  private unlockableOrganisms: UnlockableOrganismType[] = [...UNLOCKABLE_ORGANISMS];

  /**
   * Checks all unlock conditions and returns newly unlocked organisms
   * @param achievements - Array of achievement objects
   * @param score - Current player score
   * @param maxPopulation - Maximum population reached
   * @returns Array of newly unlocked organisms
   */
  checkUnlocks(
    achievements: any[],
    _score: number,
    _maxPopulation: number
  ): UnlockableOrganismType[] {
    const newlyUnlocked: UnlockableOrganismType[] = [];

    for (const organism of this.unlockableOrganisms) {
      if (organism.unlocked) continue;

      const shouldUnlock = false;

      switch (organism.unlockCondition.type) {
        case 'achievement': {
          const _achievement = achievements.find(a => a.id === organism.unlockCondition.value);
          /* TODO: Implement achievement unlock logic */
          /* assignment: shouldUnlock = achievement && achievement.unlocked */
          break;
        }
        case 'score':
          /* assignment: shouldUnlock = score >= (organism.unlockCondition.value as number) */
          break;
        case 'population':
          /* assignment: shouldUnlock = maxPopulation >= (organism.unlockCondition.value as number) */
          break;
      }

      if (shouldUnlock) { organism.unlocked = true;
        newlyUnlocked.push(organism);
       }
    }

    if (newlyUnlocked.length > 0) { this.updateOrganismSelect();
     }

    return newlyUnlocked;
  }

  /**
   * Returns all currently unlocked organisms
   * @returns Array of unlocked organisms
   */
  getUnlockedOrganisms(): UnlockableOrganismType[] {
    return this.unlockableOrganisms.filter(org => org.unlocked);
  }

  /**
   * Finds an organism by its ID
   * @param id - The organism ID to search for
   * @returns The organism if found, undefined otherwise
   */
  getOrganismById(id: string): UnlockableOrganismType | undefined {
    return this.unlockableOrganisms.find(org => org.id === id);
  }

  /**
   * Updates the organism selection dropdown with newly unlocked organisms
   * @private
   */
  private updateOrganismSelect(): void {
    const organismSelect = document?.getElementById('organism-select') as HTMLSelectElement;
    if (!organismSelect) return;

    // Add new unlocked organisms to the select
    for (const organism of this.unlockableOrganisms) {
      ifPattern(organism.unlocked, () => {
        const existingOption = organismSelect?.querySelector(`option[value="${organism.id}"]`);
        if (!existingOption) {
          const option = document.createElement('option');
          option.value = organism.id;
          option.textContent = `${organism.name} (${organism.description})`;
          organismSelect.appendChild(option);
        }
      });
    }
  }

  /**
   * Displays a notification popup when an organism is unlocked
   * @param organism - The organism that was unlocked
   */
  showUnlockNotification(organism: UnlockableOrganismType): void {
    const notification = document.createElement('div');
    notification.className = 'unlock-notification';
    notification.innerHTML = `
      <div class="unlock-content">
        <span class="unlock-icon">🔓</span>
        <div class="unlock-text">
          <div class="unlock-title">New Organism Unlocked!</div>
          <div class="unlock-name">${organism.name}</div>
          <div class="unlock-desc">${organism.description}</div>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);

    // Remove after 5 seconds
    setTimeout(() => {
      notification.classList.add('hide');
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 5000);
  }
}
