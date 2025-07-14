import { describe, expect, it } from 'vitest';
import {
  BehaviorType,
  ORGANISM_TYPES,
  canHunt,
  getPredatorTypes,
  getPreyTypes,
  isPredator,
  isPrey,
} from '../../../src/models/organismTypes';

describe('BehaviorType System', () => {
  it('should correctly identify predators', () => {
    const virus = ORGANISM_TYPES.virus;
    expect(isPredator(virus)).toBe(true);

    const bacteria = ORGANISM_TYPES.bacteria;
    expect(isPredator(bacteria)).toBe(false);
  });

  it('should correctly identify prey', () => {
    const bacteria = ORGANISM_TYPES.bacteria;
    expect(isPrey(bacteria)).toBe(true);

    const algae = ORGANISM_TYPES.algae;
    expect(isPrey(algae)).toBe(true);

    const virus = ORGANISM_TYPES.virus;
    expect(isPrey(virus)).toBe(false);
  });

  it('should correctly determine hunting relationships', () => {
    const virus = ORGANISM_TYPES.virus;

    expect(canHunt(virus, 'bacteria')).toBe(true);
    expect(canHunt(virus, 'yeast')).toBe(true);
    expect(canHunt(virus, 'algae')).toBe(false);
  });

  it('should have proper ecosystem balance', () => {
    // Virus should be predator with hunting behavior
    const virus = ORGANISM_TYPES.virus;
    expect(virus.behaviorType).toBe(BehaviorType.PREDATOR);
    expect(virus.huntingBehavior).toBeDefined();
    expect(virus.huntingBehavior?.preyTypes).toContain('bacteria');

    // Bacteria should be prey
    const bacteria = ORGANISM_TYPES.bacteria;
    expect(bacteria.behaviorType).toBe(BehaviorType.PREY);
    expect(bacteria.huntingBehavior).toBeUndefined();

    // Algae should be producer
    const algae = ORGANISM_TYPES.algae;
    expect(algae.behaviorType).toBe(BehaviorType.PRODUCER);

    // Yeast should be decomposer
    const yeast = ORGANISM_TYPES.yeast;
    expect(yeast.behaviorType).toBe(BehaviorType.DECOMPOSER);
  });

  it('should get correct predator and prey lists', () => {
    const predators = getPredatorTypes();
    const prey = getPreyTypes();

    expect(predators).toHaveLength(1);
    expect(predators[0].name).toBe('Virus');

    expect(prey).toHaveLength(3);
    expect(prey.map(p => p.name)).toContain('Bacteria');
    expect(prey.map(p => p.name)).toContain('Algae');
    expect(prey.map(p => p.name)).toContain('Yeast');
  });

  it('should have proper energy systems', () => {
    Object.values(ORGANISM_TYPES).forEach(organism => {
      expect(organism.initialEnergy).toBeGreaterThan(0);
      expect(organism.maxEnergy).toBeGreaterThanOrEqual(organism.initialEnergy);
      expect(organism.energyConsumption).toBeGreaterThan(0);
    });
  });
});
