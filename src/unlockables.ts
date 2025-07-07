import type { OrganismType } from './organismTypes';

export interface UnlockableOrganismType extends OrganismType {
  id: string;
  unlockCondition: {
    type: 'achievement' | 'score' | 'population';
    value: string | number;
  };
  unlocked: boolean;
}

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
    unlockCondition: { type: 'achievement', value: 'first-colony' },
    unlocked: false
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
    unlockCondition: { type: 'achievement', value: 'ancient-wisdom' },
    unlocked: false
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
    unlockCondition: { type: 'score', value: 5000 },
    unlocked: false
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
    unlockCondition: { type: 'achievement', value: 'metropolis' },
    unlocked: false
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
    unlockCondition: { type: 'population', value: 1000 },
    unlocked: false
  }
];

export class UnlockableOrganismManager {
  private unlockableOrganisms: UnlockableOrganismType[] = [...UNLOCKABLE_ORGANISMS];

  checkUnlocks(achievements: any[], score: number, maxPopulation: number): UnlockableOrganismType[] {
    const newlyUnlocked: UnlockableOrganismType[] = [];

    for (const organism of this.unlockableOrganisms) {
      if (organism.unlocked) continue;

      let shouldUnlock = false;

      switch (organism.unlockCondition.type) {
        case 'achievement':
          const achievement = achievements.find(a => a.id === organism.unlockCondition.value);
          shouldUnlock = achievement && achievement.unlocked;
          break;
        case 'score':
          shouldUnlock = score >= (organism.unlockCondition.value as number);
          break;
        case 'population':
          shouldUnlock = maxPopulation >= (organism.unlockCondition.value as number);
          break;
      }

      if (shouldUnlock) {
        organism.unlocked = true;
        newlyUnlocked.push(organism);
      }
    }

    if (newlyUnlocked.length > 0) {
      this.updateOrganismSelect();
    }

    return newlyUnlocked;
  }

  getUnlockedOrganisms(): UnlockableOrganismType[] {
    return this.unlockableOrganisms.filter(org => org.unlocked);
  }

  getOrganismById(id: string): UnlockableOrganismType | undefined {
    return this.unlockableOrganisms.find(org => org.id === id);
  }

  private updateOrganismSelect(): void {
    const organismSelect = document.getElementById('organism-select') as HTMLSelectElement;
    if (!organismSelect) return;

    // Add new unlocked organisms to the select
    for (const organism of this.unlockableOrganisms) {
      if (organism.unlocked) {
        const existingOption = organismSelect.querySelector(`option[value="${organism.id}"]`);
        if (!existingOption) {
          const option = document.createElement('option');
          option.value = organism.id;
          option.textContent = `${organism.name} (${organism.description})`;
          organismSelect.appendChild(option);
        }
      }
    }
  }

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
