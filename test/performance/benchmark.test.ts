import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Import the classes we want to benchmark
import { Organism } from '../../src/core/organism';
import { ORGANISM_TYPES } from '../../src/models/organismTypes';

describe('Performance Benchmarks', () => {
  let organisms: Organism[] = [];

  beforeEach(() => {
    organisms = [];
  });

  afterEach(() => {
    organisms.length = 0;
  });

  it('should create 1000 organisms within performance threshold', () => {
    const startTime = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      const organism = new Organism(
        Math.random() * 800, // x
        Math.random() * 600, // y
        ORGANISM_TYPES.bacteria // type
      );
      organisms.push(organism);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`Created 1000 organisms in ${duration.toFixed(2)}ms`);
    
    // Should create 1000 organisms in under 100ms
    expect(duration).toBeLessThan(100);
    expect(organisms.length).toBe(1000);
  });

  it('should update 1000 organisms within performance threshold', () => {
    // Create organisms first
    for (let i = 0; i < 1000; i++) {
      organisms.push(new Organism(
        Math.random() * 800,
        Math.random() * 600,
        ORGANISM_TYPES.bacteria
      ));
    }

    const startTime = performance.now();
    
    // Update all organisms
    organisms.forEach(organism => {
      organism.update(1/60, 800, 600); // deltaTime, canvasWidth, canvasHeight
    });
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`Updated 1000 organisms in ${duration.toFixed(2)}ms`);
    
    // Should update 1000 organisms in under 16ms (60 FPS target)
    expect(duration).toBeLessThan(16);
  });

  it('should handle memory allocation efficiently', () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Create and destroy organisms multiple times
    for (let cycle = 0; cycle < 10; cycle++) {
      const cycleOrganisms: Organism[] = [];
      
      // Create 100 organisms
      for (let i = 0; i < 100; i++) {
        cycleOrganisms.push(new Organism(
          Math.random() * 800,
          Math.random() * 600,
          ORGANISM_TYPES.bacteria
        ));
      }
      
      // Update them a few times
      for (let update = 0; update < 10; update++) {
        cycleOrganisms.forEach(organism => {
          organism.update(1/60, 800, 600);
        });
      }
      
      // Clear the array (simulating cleanup)
      cycleOrganisms.length = 0;
    }
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    
    // Memory increase should be reasonable (less than 10MB)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });

  it('should simulate frame rate performance', async () => {
    // Create a moderate number of organisms
    for (let i = 0; i < 500; i++) {
      organisms.push(new Organism(
        Math.random() * 800,
        Math.random() * 600,
        ORGANISM_TYPES.bacteria
      ));
    }

    const frameCount = 60; // Simulate 1 second at 60 FPS
    const frameTimes: number[] = [];
    
    for (let frame = 0; frame < frameCount; frame++) {
      const frameStart = performance.now();
      
      // Simulate a frame update
      organisms.forEach(organism => {
        organism.update(1/60, 800, 600);
      });
      
      // Simulate rendering (mock canvas operations)
      organisms.forEach(() => {
        // Mock canvas operations
        const mockOps = Math.random() * 10;
        for (let i = 0; i < mockOps; i++) {
          // Simulate some computational work
          Math.sin(Math.random());
        }
      });
      
      const frameEnd = performance.now();
      const frameTime = frameEnd - frameStart;
      frameTimes.push(frameTime);
    }
    
    const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    const maxFrameTime = Math.max(...frameTimes);
    const fps = 1000 / avgFrameTime;
    
    console.log(`Average frame time: ${avgFrameTime.toFixed(2)}ms`);
    console.log(`Max frame time: ${maxFrameTime.toFixed(2)}ms`);
    console.log(`Average FPS: ${fps.toFixed(1)}`);
    
    // Should maintain at least 30 FPS average
    expect(fps).toBeGreaterThan(30);
    
    // No frame should exceed 33ms (30 FPS minimum)
    expect(maxFrameTime).toBeLessThan(33);
  });

  it('should handle large population growth efficiently', () => {
    // Start with a few organisms
    for (let i = 0; i < 10; i++) {
      organisms.push(new Organism(
        Math.random() * 800,
        Math.random() * 600,
        ORGANISM_TYPES.bacteria
      ));
    }

    const startTime = performance.now();
    let updateCount = 0;
    
    // Simulate population growth over time
    while (organisms.length < 1000 && updateCount < 1000) {
      const newOrganisms: Organism[] = [];
      
      organisms.forEach(organism => {
        organism.update(1/60, 800, 600);
        
        // Simulate reproduction (simplified)
        if (Math.random() < 0.01) { // 1% chance per frame
          newOrganisms.push(new Organism(
            organism.x + (Math.random() - 0.5) * 20,
            organism.y + (Math.random() - 0.5) * 20,
            ORGANISM_TYPES.bacteria
          ));
        }
      });
      
      organisms.push(...newOrganisms);
      updateCount++;
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`Population grew to ${organisms.length} in ${duration.toFixed(2)}ms over ${updateCount} updates`);
    
    // Should handle population growth efficiently
    expect(duration).toBeLessThan(1000); // Under 1 second
    expect(organisms.length).toBeGreaterThan(100);
  });

  it('should benchmark array operations', () => {
    const testData: Array<{id: number, x: number, y: number, value: number}> = [];
    
    for (let i = 0; i < 10000; i++) {
      testData.push({
        id: i,
        x: Math.random() * 800,
        y: Math.random() * 600,
        value: Math.random()
      });
    }

    // Test forEach performance
    const forEachStart = performance.now();
    testData.forEach(item => {
      item.value = Math.sin(item.value);
    });
    const forEachTime = performance.now() - forEachStart;

    // Test for loop performance
    const forLoopStart = performance.now();
    for (let i = 0; i < testData.length; i++) {
      testData[i].value = Math.cos(testData[i].value);
    }
    const forLoopTime = performance.now() - forLoopStart;

    // Test filter performance
    const filterStart = performance.now();
    const filtered = testData.filter(item => item.value > 0);
    const filterTime = performance.now() - filterStart;

    console.log(`forEach: ${forEachTime.toFixed(2)}ms`);
    console.log(`for loop: ${forLoopTime.toFixed(2)}ms`);
    console.log(`filter: ${filterTime.toFixed(2)}ms`);

    // All operations should complete in reasonable time
    expect(forEachTime).toBeLessThan(50);
    expect(forLoopTime).toBeLessThan(50);
    expect(filterTime).toBeLessThan(50);
    expect(filtered.length).toBeGreaterThan(0);
  });

  it('should benchmark object creation patterns', () => {
    const iterations = 10000;
    
    // Test object literal creation
    const literalStart = performance.now();
    const literalObjects: Array<{x: number, y: number, size: number, active: boolean}> = [];
    for (let i = 0; i < iterations; i++) {
      literalObjects.push({
        x: i,
        y: i * 2,
        size: 5,
        active: true
      });
    }
    const literalTime = performance.now() - literalStart;

    // Test class instantiation
    class TestObject {
      constructor(public x: number, public y: number, public size: number, public active: boolean) {}
    }
    
    const classStart = performance.now();
    const classObjects: TestObject[] = [];
    for (let i = 0; i < iterations; i++) {
      classObjects.push(new TestObject(i, i * 2, 5, true));
    }
    const classTime = performance.now() - classStart;

    console.log(`Object literal creation: ${literalTime.toFixed(2)}ms`);
    console.log(`Class instantiation: ${classTime.toFixed(2)}ms`);

    // Both should be reasonably fast
    expect(literalTime).toBeLessThan(100);
    expect(classTime).toBeLessThan(100);
    expect(literalObjects.length).toBe(iterations);
    expect(classObjects.length).toBe(iterations);
  });
});
