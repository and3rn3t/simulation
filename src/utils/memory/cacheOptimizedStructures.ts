import { Organism } from '../../core/organism';
import type { OrganismType } from '../../models/organismTypes';

/**
 * Structure of Arrays (SoA) for organisms to improve cache locality
 * Instead of Array of Structures (AoS), we use separate arrays for each property
 * This improves performance when processing large numbers of organisms
 */
export class OrganismSoA {
  // Position data
  public x!: Float32Array;
  public y!: Float32Array;

  // State data
  public age!: Float32Array;
  public reproduced!: Uint8Array; // Boolean as byte array

  // Type indices (reference to organism types)
  public typeIndex!: Uint16Array;

  // Capacity and current size
  private capacity: number;
  private size: number = 0;

  // Type lookup
  private organismTypes: OrganismType[] = [];
  private typeIndexMap: Map<OrganismType, number> = new Map();

  constructor(initialCapacity: number = 1000) {
    this.capacity = initialCapacity;
    this.allocateArrays();
  }

  /**
   * Allocate all arrays with current capacity
   */
  private allocateArrays(): void {
    this.x = new Float32Array(this.capacity);
    this.y = new Float32Array(this.capacity);
    this.age = new Float32Array(this.capacity);
    this.reproduced = new Uint8Array(this.capacity);
    this.typeIndex = new Uint16Array(this.capacity);
  }

  /**
   * Resize arrays when capacity is exceeded
   */
  private resize(): void {
    const newCapacity = this.capacity * 2;

    // Create new arrays
    const newX = new Float32Array(newCapacity);
    const newY = new Float32Array(newCapacity);
    const newAge = new Float32Array(newCapacity);
    const newReproduced = new Uint8Array(newCapacity);
    const newTypeIndex = new Uint16Array(newCapacity);

    // Copy existing data
    newX.set(this.x);
    newY.set(this.y);
    newAge.set(this.age);
    newReproduced.set(this.reproduced);
    newTypeIndex.set(this.typeIndex);

    // Replace arrays
    this.x = newX;
    this.y = newY;
    this.age = newAge;
    this.reproduced = newReproduced;
    this.typeIndex = newTypeIndex;

    this.capacity = newCapacity;
  }

  /**
   * Register an organism type and return its index
   */
  registerOrganismType(type: OrganismType): number {
    if (this.typeIndexMap.has(type)) {
      return this.typeIndexMap.get(type)!;
    }

    const index = this.organismTypes.length;
    this.organismTypes.push(type);
    this.typeIndexMap.set(type, index);

    return index;
  }

  /**
   * Add an organism to the SoA
   */
  addOrganism(
    x: number,
    y: number,
    age: number,
    type: OrganismType,
    reproduced: boolean = false
  ): number {
    if (this.size >= this.capacity) {
      this.resize();
    }

    const index = this.size;
    const typeIdx = this.registerOrganismType(type);

    this.x[index] = x;
    this.y[index] = y;
    this.age[index] = age;
    this.typeIndex[index] = typeIdx;
    this.reproduced[index] = reproduced ? 1 : 0;

    this.size++;
    return index;
  }

  /**
   * Remove an organism by swapping with the last element
   */
  removeOrganism(index: number): void {
    if (index < 0 || index >= this.size) {
      return;
    }

    // Swap with last element
    const lastIndex = this.size - 1;
    if (index !== lastIndex) {
      const lastX = this.x[lastIndex];
      const lastY = this.y[lastIndex];
      const lastAge = this.age[lastIndex];
      const lastTypeIndex = this.typeIndex[lastIndex];
      const lastReproduced = this.reproduced[lastIndex];

      if (lastX !== undefined) this.x[index] = lastX;
      if (lastY !== undefined) this.y[index] = lastY;
      if (lastAge !== undefined) this.age[index] = lastAge;
      if (lastTypeIndex !== undefined) this.typeIndex[index] = lastTypeIndex;
      if (lastReproduced !== undefined) this.reproduced[index] = lastReproduced;
    }

    this.size--;
  }

  /**
   * Update organism position
   */
  updatePosition(index: number, deltaX: number, deltaY: number): void {
    if (index >= 0 && index < this.size) {
      const currentX = this.x[index];
      const currentY = this.y[index];
      if (currentX !== undefined) this.x[index] = currentX + deltaX;
      if (currentY !== undefined) this.y[index] = currentY + deltaY;
    }
  }

  /**
   * Update organism age
   */
  updateAge(index: number, deltaTime: number): void {
    if (index >= 0 && index < this.size) {
      const currentAge = this.age[index];
      if (currentAge !== undefined) this.age[index] = currentAge + deltaTime;
    }
  }

  /**
   * Mark organism as reproduced
   */
  markReproduced(index: number): void {
    if (index >= 0 && index < this.size) {
      this.reproduced[index] = 1;
    }
  }

  /**
   * Get organism type by index
   */
  getOrganismType(index: number): OrganismType | null {
    if (index < 0 || index >= this.size) {
      return null;
    }

    const typeIdx = this.typeIndex[index];
    if (typeIdx === undefined || typeIdx < 0 || typeIdx >= this.organismTypes.length) {
      return null;
    }
    return this.organismTypes[typeIdx] || null;
  }

  /**
   * Check if organism can reproduce
   */
  canReproduce(index: number): boolean {
    if (index < 0 || index >= this.size) {
      return false;
    }

    const type = this.getOrganismType(index);
    if (!type) {
      return false;
    }

    return (
      this.age[index] > 20 && this.reproduced[index] === 0 && Math.random() < type.growthRate * 0.01
    );
  }

  /**
   * Check if organism should die
   */
  shouldDie(index: number): boolean {
    if (index < 0 || index >= this.size) {
      return false;
    }

    const type = this.getOrganismType(index);
    if (!type) {
      return true; // If we can't determine type, consider it dead
    }

    return this.age[index] > type.maxAge || Math.random() < type.deathRate * 0.001;
  }

  /**
   * Get organism data as plain object
   */
  getOrganism(index: number): Organism | null {
    if (index < 0 || index >= this.size) {
      return null;
    }

    const type = this.getOrganismType(index);
    if (!type) {
      return null;
    }

    const x = this.x[index];
    const y = this.y[index];
    if (x === undefined || y === undefined) {
      return null;
    }

    const organism = new Organism(x, y, type);
    organism.age = this.age[index];
    organism.reproduced = this.reproduced[index] === 1;

    return organism;
  }

  /**
   * Convert from regular organism array to SoA
   */
  fromOrganismArray(organisms: Organism[]): void {
    this.clear();

    // Ensure capacity
    if (organisms.length > this.capacity) {
      this.capacity = organisms.length * 2;
      this.allocateArrays();
    }

    for (const organism of organisms) {
      this.addOrganism(organism.x, organism.y, organism.age, organism.type, organism.reproduced);
    }
  }

  /**
   * Convert SoA back to regular organism array
   */
  toOrganismArray(): Organism[] {
    const organisms: Organism[] = [];

    for (let i = 0; i < this.size; i++) {
      const organism = this.getOrganism(i);
      if (organism) {
        organisms.push(organism);
      }
    }

    return organisms;
  }

  /**
   * Clear all organisms
   */
  clear(): void {
    this.size = 0;
  }

  /**
   * Get current size
   */
  getSize(): number {
    return this.size;
  }

  /**
   * Get capacity
   */
  getCapacity(): number {
    return this.capacity;
  }

  /**
   * Get memory usage in bytes
   */
  getMemoryUsage(): number {
    const arrayMemory =
      this.capacity *
      (4 + // x (Float32)
        4 + // y (Float32)
        4 + // age (Float32)
        1 + // reproduced (Uint8)
        2); // typeIndex (Uint16)

    const typeMemory = this.organismTypes.length * 100; // Rough estimate per type

    return arrayMemory + typeMemory;
  }

  /**
   * Compact arrays to remove unused capacity
   */
  compact(): void {
    if (this.size < this.capacity / 2) {
      const newCapacity = Math.max(this.size * 2, 100);

      const newX = new Float32Array(newCapacity);
      const newY = new Float32Array(newCapacity);
      const newAge = new Float32Array(newCapacity);
      const newReproduced = new Uint8Array(newCapacity);
      const newTypeIndex = new Uint16Array(newCapacity);

      // Copy only used data
      newX.set(this.x.subarray(0, this.size));
      newY.set(this.y.subarray(0, this.size));
      newAge.set(this.age.subarray(0, this.size));
      newReproduced.set(this.reproduced.subarray(0, this.size));
      newTypeIndex.set(this.typeIndex.subarray(0, this.size));

      this.x = newX;
      this.y = newY;
      this.age = newAge;
      this.reproduced = newReproduced;
      this.typeIndex = newTypeIndex;

      this.capacity = newCapacity;
    }
  }

  /**
   * Batch update all organisms
   * This provides better cache locality than updating one organism at a time
   */
  batchUpdate(
    deltaTime: number,
    canvasWidth: number,
    canvasHeight: number
  ): {
    reproductionIndices: number[];
    deathIndices: number[];
  } {
    const reproductionIndices: number[] = [];
    const deathIndices: number[] = [];

    // Age update (vectorized)
    for (let i = 0; i < this.size; i++) {
      this.age[i] += deltaTime;
    }

    // Movement update (vectorized)
    for (let i = 0; i < this.size; i++) {
      this.x[i] += (Math.random() - 0.5) * 2;
      this.y[i] += (Math.random() - 0.5) * 2;
    }

    // Bounds checking (vectorized)
    for (let i = 0; i < this.size; i++) {
      const type = this.getOrganismType(i);
      if (type) {
        const size = type.size;
        const currentX = this.x[i];
        const currentY = this.y[i];

        if (currentX !== undefined && currentY !== undefined) {
          this.x[i] = Math.max(size, Math.min(canvasWidth - size, currentX));
          this.y[i] = Math.max(size, Math.min(canvasHeight - size, currentY));
        }
      }
    }

    // Reproduction and death checks
    for (let i = 0; i < this.size; i++) {
      if (this.canReproduce(i)) {
        reproductionIndices.push(i);
      }

      if (this.shouldDie(i)) {
        deathIndices.push(i);
      }
    }

    return { reproductionIndices, deathIndices };
  }

  /**
   * Get statistics about the SoA
   */
  getStats(): {
    size: number;
    capacity: number;
    memoryUsage: number;
    utilizationRatio: number;
    typeCount: number;
  } {
    return {
      size: this.size,
      capacity: this.capacity,
      memoryUsage: this.getMemoryUsage(),
      utilizationRatio: this.size / this.capacity,
      typeCount: this.organismTypes.length,
    };
  }
}
