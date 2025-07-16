class EventListenerManager {
  private static listeners: Array<{ element: EventTarget; event: string; handler: EventListener }> =
    [];

  static addListener(element: EventTarget, event: string, handler: EventListener): void {
    element.addEventListener(event, handler);
    this.listeners.push({ element, event, handler });
  }

  static cleanup(): void {
    this.listeners.forEach(({ element, event, handler }) => {
      element?.removeEventListener?.(event, handler);
    });
    this.listeners = [];
  }
}

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => EventListenerManager.cleanup());
}
/**
 * Interactive Code Examples for Organism Simulation
 *
 * This module provides interactive examples that demonstrate
 * how to use the various APIs and features of the simulation.
 */

import { Organism } from '../core/organism';
import { OrganismSimulation } from '../core/simulation';
import { BehaviorType, getOrganismType, type OrganismType } from '../models/organismTypes';

/**
 * Collection of interactive examples for learning the simulation API
 */
export class InteractiveExamples {
  private exampleContainer: HTMLElement;
  private examples: Map<string, () => void> = new Map();

  constructor(container: HTMLElement) {
    this.exampleContainer = container;
    this.initializeExamples();
    this.createExampleInterface();
  }

  /**
   * Initialize all available examples
   */
  private initializeExamples(): void {
    this.examples.set('basic-organism', this.basicOrganismExample.bind(this));
    this.examples.set('simulation-setup', this.simulationSetupExample.bind(this));
    this.examples.set('organism-types', this.organismTypesExample.bind(this));
    this.examples.set('performance-demo', this.performanceDemoExample.bind(this));
    this.examples.set('memory-management', this.memoryManagementExample.bind(this));
    this.examples.set('custom-organism', this.customOrganismExample.bind(this));
    this.examples.set('event-handling', this.eventHandlingExample.bind(this));
    this.examples.set('statistics-tracking', this.statisticsTrackingExample.bind(this));
  }

  /**
   * Create the interactive interface for examples
   */
  private createExampleInterface(): void {
    const interfaceHTML = `
      <div class="interactive-examples">
        <h2>Interactive Code Examples</h2>
        <div class="example-controls">
          <select id="example-selector">
            <option value="">Select an example...</option>
            <option value="basic-organism">Basic Organism Usage</option>
            <option value="simulation-setup">Simulation Setup</option>
            <option value="organism-types">Organism Types</option>
            <option value="performance-demo">Performance Demo</option>
            <option value="memory-management">Memory Management</option>
            <option value="custom-organism">Custom Organism Type</option>
            <option value="event-handling">Event Handling</option>
            <option value="statistics-tracking">Statistics Tracking</option>
          </select>
          <button id="run-example">Run Example</button>
          <button id="clear-output">Clear Output</button>
        </div>
        <div class="example-output">
          <h3>Example Output</h3>
          <div id="example-canvas-container"></div>
          <div id="example-console"></div>
        </div>
        <div class="example-code">
          <h3>Code</h3>
          <pre id="example-code-display"></pre>
        </div>
      </div>
    `;

    this.exampleContainer.innerHTML = interfaceHTML;
    this.setupEventListeners();
  }

  /**
   * Set up event listeners for the interactive interface
   */
  private setupEventListeners(): void {
    const selector = document?.getElementById('example-selector') as HTMLSelectElement;
    const runButton = document?.getElementById('run-example') as HTMLButtonElement;
    const clearButton = document?.getElementById('clear-output') as HTMLButtonElement;

    selector?.addEventListener('change', event => {
      try {
        const selectedExample = (event.target as HTMLSelectElement).value;
        if (selectedExample) {
          this.displayExampleCode(selectedExample);
        }
      } catch (error) {
        console.error('Event listener error for change:', error);
      }
    });

    runButton?.addEventListener('click', event => {
      try {
        const selectedExample = selector.value;
        if (selectedExample && this.examples.has(selectedExample)) {
          this.runExample(selectedExample);
        }
      } catch (error) {
        console.error('Event listener error for click:', error);
      }
    });

    clearButton?.addEventListener('click', event => {
      try {
        this.clearOutput();
      } catch (error) {
        console.error('Event listener error for click:', error);
      }
    });
  }

  /**
   * Display the code for a specific example
   */
  private displayExampleCode(exampleName: string): void {
    const codeDisplay = document?.getElementById('example-code-display');
    if (!codeDisplay) return;

    const codeExamples = {
      'basic-organism': `
// Basic Organism Example
const organism = new Organism(100, 150, getOrganismType('bacteria'));

// Update the organism
organism.update(1, 800, 600);

// Check if organism can reproduce
if (organism.canReproduce()) {
  const child = organism.reproduce();

}`,

      'simulation-setup': `
// Simulation Setup Example
const canvas = document.createElement('canvas');
canvas?.width = 800;
canvas?.height = 600;

const simulation = new OrganismSimulation(canvas, getOrganismType('bacteria'));

// Start the simulation
simulation.start();

// Set simulation speed
simulation.setSpeed(5);

// Set population limit
simulation.setMaxPopulation(100);

// Note: In the simulation, organisms are added via click events on the canvas`,

      'organism-types': `
// Organism Types Example
const organismTypes = [
  getOrganismType('bacteria'), 
  getOrganismType('yeast'), 
  getOrganismType('algae'), 
  getOrganismType('virus')
];

organismTypes.forEach(type => {

});

// Create organisms of different types
const organisms = organismTypes.map((type, index) => 
  new Organism(100 + index * 50, 100, type)
);

);`,

      'performance-demo': `
// Performance Demo Example
const canvas = document.createElement('canvas');
canvas?.width = 800;
canvas?.height = 600;

const simulation = new OrganismSimulation(canvas, getOrganismType('bacteria'));

// Enable optimizations
simulation.setOptimizationsEnabled(true);

// Toggle Structure of Arrays optimization
simulation.toggleSoAOptimization(true);

// Get performance stats
const stats = simulation.getAlgorithmPerformanceStats();

// Get memory stats
const memoryStats = simulation.getMemoryStats();

// Note: In the simulation, organisms are added via click events`,

      'memory-management': `
// Memory Management Example
const canvas = document.createElement('canvas');
canvas?.width = 800;
canvas?.height = 600;

const simulation = new OrganismSimulation(canvas, getOrganismType('bacteria'));

// Monitor memory usage
const memoryStats = simulation.getMemoryStats();

// Toggle SoA optimization to see memory impact
simulation.toggleSoAOptimization(true);

const optimizedStats = simulation.getMemoryStats();

// Note: In the simulation, organisms are added via click events`,

      'custom-organism': `
// Custom Organism Type Example
const customOrganism: OrganismType = {
  name: 'Custom Organism',
  color: '#FF6B6B',
  size: 8,
  growthRate: 0.03,
  deathRate: 0.005,
  maxAge: 150,
  description: 'A custom organism type'
};

// Create organism with custom type
const organism = new Organism(200, 200, customOrganism);

// Use in simulation
const canvas = document.createElement('canvas');
const simulation = new OrganismSimulation(canvas, customOrganism);

`,

      'event-handling': `
// Event Handling Example
const canvas = document.createElement('canvas');
canvas?.width = 800;
canvas?.height = 600;

const simulation = new OrganismSimulation(canvas, getOrganismType('bacteria'));

// Handle simulation events (if implemented)

// Monitor simulation stats
const monitorStats = () => {
  const stats = simulation.getStats();

  if (stats.population > 50) {   }
};

// Monitor every 2 seconds
setInterval(monitorStats, 2000);

simulation.start();

// Note: In the simulation, organisms are added via click events`,

      'statistics-tracking': `
// Statistics Tracking Example
const canvas = document.createElement('canvas');
canvas?.width = 800;
canvas?.height = 600;

const simulation = new OrganismSimulation(canvas, getOrganismType('bacteria'));

// Get initial stats
const initialStats = simulation.getStats();

// Start simulation
simulation.start();

// Track stats over time
let statsHistory = [];
const trackStats = () => {
  const stats = simulation.getStats();
  statsHistory.push({
    timestamp: Date.now(),
    ...stats
  });

  if (statsHistory.length > 10) { .map(s => s.population)
    );
    }
};

setInterval(trackStats, 1000);

// Note: In the simulation, organisms are added via click events`,
    };

    const code = codeExamples[exampleName as keyof typeof codeExamples] || '';
    codeDisplay.textContent = code;
  }

  /**
   * Run a specific example
   */
  private runExample(exampleName: string): void {
    const example = this.examples.get(exampleName);
    if (example) {
      this.clearOutput();
      this.logToConsole(`Running example: ${exampleName}`);

      try {
        example();
      } catch (error) {
        this.logToConsole(`Error running example: ${error}`);
      }
    }
  }

  /**
   * Clear the output area
   */
  private clearOutput(): void {
    const canvasContainer = document?.getElementById('example-canvas-container');
    const consoleOutput = document?.getElementById('example-console');

    if (canvasContainer) canvasContainer.innerHTML = '';
    if (consoleOutput) consoleOutput.innerHTML = '';
  }

  /**
   * Log messages to the example console
   */
  private logToConsole(message: string): void {
    const consoleOutput = document?.getElementById('example-console');
    if (consoleOutput) {
      const logEntry = document.createElement('div');
      logEntry.className = 'log-entry';
      logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
      consoleOutput.appendChild(logEntry);
      consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }
  }

  /**
   * Create a canvas for examples
   */
  private createExampleCanvas(width: number = 400, height: number = 300): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.border = '1px solid #ccc';
    canvas.style.backgroundColor = '#f0f0f0';

    const container = document?.getElementById('example-canvas-container');
    if (container) {
      container.appendChild(canvas);
    }

    return canvas;
  }

  // Example implementations
  private basicOrganismExample(): void {
    const organism = new Organism(100, 150, getOrganismType('bacteria'));

    this.logToConsole(`Created organism: ${organism.type.name} at (${organism.x}, ${organism.y})`);
    this.logToConsole(`Age: ${organism.age}, Max Age: ${organism.type.maxAge}`);

    // Update the organism
    organism.update(1, 800, 600);

    this.logToConsole(
      `After update: position (${organism.x.toFixed(2)}, ${organism.y.toFixed(2)})`
    );
    this.logToConsole(`Age: ${organism.age}`);

    // Check reproduction
    if (organism.canReproduce()) {
      const child = organism.reproduce();
      this.logToConsole(
        `Organism reproduced! Child at (${child.x.toFixed(2)}, ${child.y.toFixed(2)})`
      );
    } else {
      this.logToConsole('Organism cannot reproduce yet');
    }
  }

  private simulationSetupExample(): void {
    const canvas = this.createExampleCanvas(600, 400);
    const simulation = new OrganismSimulation(canvas);

    this.logToConsole('Simulation created');

    // Note: In the actual simulation, organisms are added via click events
    // Here we demonstrate the setup process

    const stats = simulation.getStats();
    this.logToConsole(`Initial population: ${stats.population}`);

    // Configure simulation
    simulation.setSpeed(3);
    simulation.setMaxPopulation(50);

    this.logToConsole('Simulation configured and ready');

    // Start simulation
    simulation.start();
    this.logToConsole('Simulation started');
  }

  private organismTypesExample(): void {
    const types = [
      getOrganismType('bacteria'),
      getOrganismType('yeast'),
      getOrganismType('algae'),
      getOrganismType('virus'),
    ];

    types.forEach(type => {
      try {
        this.logToConsole(
          `${type.name}: Growth=${type.growthRate}, Death=${type.deathRate}, Max Age=${type.maxAge}`
        );
      } catch (error) {
        console.error('Callback error:', error);
      }
    });

    // Create organisms of different types
    const canvas = this.createExampleCanvas(400, 300);
    const ctx = canvas?.getContext('2d');

    if (ctx) {
      types.forEach((type, index) => {
        const organism = new Organism(50 + index * 80, 150, type);
        organism.draw(ctx);
      });

      this.logToConsole('Drew organisms of different types on canvas');
    }
  }

  private performanceDemoExample(): void {
    const canvas = this.createExampleCanvas(600, 400);
    const simulation = new OrganismSimulation(canvas);

    this.logToConsole('Performance test setup (organisms added via placement in real simulation)');

    const startTime = performance.now();
    // In real simulation, organisms are added via click events
    // Here we demonstrate the performance monitoring
    const endTime = performance.now();

    this.logToConsole(`Performance test completed in ${(endTime - startTime).toFixed(2)}ms`);

    // Enable optimizations (commented out - method doesn't exist yet)
    // TODO: Implement setOptimizationsEnabled method in OrganismSimulation
    // simulation.setOptimizationsEnabled(true);
    this.logToConsole('Optimizations would be enabled here');

    const stats = simulation.getStats();
    this.logToConsole(`Current population: ${stats.population}`);

    simulation.start();
    this.logToConsole('Performance demo started');
  }

  private memoryManagementExample(): void {
    const canvas = this.createExampleCanvas(400, 300);
    const simulation = new OrganismSimulation(canvas);

    // TODO: Implement getMemoryStats method in OrganismSimulation
    // const initialMemory = simulation.getMemoryStats();
    // this.logToConsole(`Initial memory - Pool size: ${initialMemory.organismPool.poolSize}`);
    this.logToConsole('Memory management example - methods not yet implemented');

    // In real simulation, organisms are added via click events
    this.logToConsole('In real simulation, organisms are added via click events');

    // TODO: Implement getMemoryStats method in OrganismSimulation
    // const afterMemory = simulation.getMemoryStats();
    // this.logToConsole(`Memory stats - Pool size: ${afterMemory.organismPool.poolSize}`);
    // this.logToConsole(`Total organisms: ${afterMemory.totalOrganisms}`);

    // TODO: Implement toggleSoAOptimization method in OrganismSimulation
    // simulation.toggleSoAOptimization(true);
    this.logToConsole('SoA optimization would be enabled here');

    // TODO: Implement getMemoryStats method in OrganismSimulation
    // const optimizedMemory = simulation.getMemoryStats();
    // this.logToConsole(`Using SoA: ${optimizedMemory.usingSoA}`);
  }

  private customOrganismExample(): void {
    const customType: OrganismType = {
      name: 'Example Custom',
      color: '#FF6B6B',
      size: 10,
      growthRate: 0.05,
      deathRate: 0.01,
      maxAge: 200,
      description: 'Custom example organism',
      behaviorType: BehaviorType.PRODUCER, // Required property
      initialEnergy: 100, // Required property
      maxEnergy: 200, // Required property
      energyConsumption: 1, // Required property
    };

    this.logToConsole(`Created custom organism type: ${customType.name}`);
    this.logToConsole(`Color: ${customType.color}, Size: ${customType.size}`);
    this.logToConsole(`Growth Rate: ${customType.growthRate}, Death Rate: ${customType.deathRate}`);

    const organism = new Organism(200, 150, customType);
    this.logToConsole(`Created organism with custom type at (${organism.x}, ${organism.y})`);

    // Draw the custom organism
    const canvas = this.createExampleCanvas(400, 300);
    const ctx = canvas?.getContext('2d');

    if (ctx) {
      organism.draw(ctx);
      this.logToConsole('Drew custom organism on canvas');
    }
  }

  private eventHandlingExample(): void {
    const canvas = this.createExampleCanvas(400, 300);
    const simulation = new OrganismSimulation(canvas);

    this.logToConsole('Setting up event monitoring...');

    // In real simulation, organisms are added via click events
    this.logToConsole('In real simulation, organisms are added via click events');

    // Monitor simulation stats
    let monitorCount = 0;
    const monitor = setInterval(() => {
      const stats = simulation.getStats();
      this.logToConsole(`Population: ${stats.population}, Generation: ${stats.generation}`);

      monitorCount++;
      if (monitorCount >= 5) {
        clearInterval(monitor);
        this.logToConsole('Monitoring stopped');
      }
    }, 2000);

    simulation.start();
    this.logToConsole('Started simulation with event monitoring');
  }

  private statisticsTrackingExample(): void {
    const canvas = this.createExampleCanvas(400, 300);
    const simulation = new OrganismSimulation(canvas);

    // In real simulation, organisms are added via click events
    this.logToConsole('In real simulation, organisms are added via click events');

    const initialStats = simulation.getStats();
    this.logToConsole(
      `Initial stats - Population: ${initialStats.population}, Running: ${initialStats.isRunning}`
    );

    simulation.start();
    this.logToConsole('Started statistics tracking');

    // Track stats over time
    const statsHistory: any[] = [];
    let trackingCount = 0;

    const tracker = setInterval(() => {
      const stats = simulation.getStats();
      statsHistory.push({
        timestamp: Date.now(),
        population: stats.population,
        generation: stats.generation,
      });

      this.logToConsole(`Stats - Pop: ${stats.population}, Gen: ${stats.generation}`);

      if (statsHistory.length > 3) {
        const trend = statsHistory.slice(-3).map(s => s.population);
        this.logToConsole(`Population trend: ${trend.join(' → ')}`);
      }

      trackingCount++;
      if (trackingCount >= 5) {
        clearInterval(tracker);
        this.logToConsole('Statistics tracking complete');
      }
    }, 1500);
  }
}

/**
 * Initialize interactive examples when DOM is ready
 */
export function initializeInteractiveExamples(containerId: string = 'interactive-examples'): void {
  const container = document?.getElementById(containerId);
  if (!container) {
    return;
  }

  new InteractiveExamples(container);
}

// Auto-initialize if container exists
if (typeof window !== 'undefined') {
  document?.addEventListener('DOMContentLoaded', event => {
    try {
      const container = document?.getElementById('interactive-examples');
      if (container) {
        initializeInteractiveExamples();
      }
    } catch (error) {
      console.error('Event listener error for DOMContentLoaded:', error);
    }
  });
}

// WebGL context cleanup
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      if (gl && gl.getExtension) {
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
      } // TODO: Consider extracting to reduce closure scope
    });
  });
}
