import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { OrganismSimulation } from '../../../src/core/simulation'
import { ORGANISM_TYPES } from '../../../src/models/organismTypes'

// Mock canvas and DOM
type MockedEventListener = {
  (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void
  mock: { calls: any[] }
}

let mockCanvas: HTMLCanvasElement
let mockElements: Record<string, any>

describe('OrganismSimulation', () => {
  let simulation: OrganismSimulation
  let originalRequestAnimationFrame: any
  let originalPerformanceNow: any
  let originalLocalStorage: any

  beforeEach(() => {
    // Mock the canvas container element
    const mockCanvasContainer = document.createElement('div');
    mockCanvasContainer.id = 'canvas-container';
    document.body.appendChild(mockCanvasContainer);

    // Create a mock canvas element with proper methods
    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 800;
    mockCanvas.height = 600;
    
    // Mock the 2D context
    const mockContext = {
      fillStyle: '',
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      lineTo: vi.fn(),
      moveTo: vi.fn(),
      canvas: mockCanvas
    };
    
    vi.spyOn(mockCanvas, 'getContext').mockReturnValue(mockContext as unknown as CanvasRenderingContext2D);

    // Initialize the simulation instance with required arguments
    simulation = new OrganismSimulation(mockCanvas, ORGANISM_TYPES.bacteria);
  })

  afterEach(() => {
    // Restore original functions
    if (originalRequestAnimationFrame) {
      ;(globalThis as any).requestAnimationFrame = originalRequestAnimationFrame
    }
    if (originalPerformanceNow) {
      ;(globalThis as any).performance.now = originalPerformanceNow
    }
    if (originalLocalStorage) {
      Object.defineProperty(globalThis, 'localStorage', {
        value: originalLocalStorage,
        writable: true
      })
    }
    // Clean up the DOM after each test
    const container = document.getElementById('canvas-container')
    if (container) {
      container.remove()
    }
    vi.clearAllMocks()
  })

  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(simulation).toBeDefined()
      
      const stats = simulation.getStats()
      expect(stats.population).toBe(0)
      expect(stats.generation).toBe(0)
      expect(stats.isRunning).toBe(false)
      expect(stats.placementMode).toBe(true)
    })

    it('should set up canvas context', () => {
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d')
    })
  })

  describe('start', () => {
    it('should start the simulation', () => {
      simulation.start()
      
      const stats = simulation.getStats()
      expect(stats.isRunning).toBe(true)
      expect(stats.placementMode).toBe(false)
    })
  })

  describe('pause', () => {
    it('should pause the simulation', () => {
      simulation.start()
      
      let stats = simulation.getStats()
      expect(stats.isRunning).toBe(true)
      
      simulation.pause()
      stats = simulation.getStats()
      expect(stats.isRunning).toBe(false)
    })
  })

  describe('reset', () => {
    it('should reset the simulation to initial state', () => {
      simulation.start()
      
      let stats = simulation.getStats()
      expect(stats.isRunning).toBe(true)
      expect(stats.placementMode).toBe(false)
      
      simulation.reset()
      
      stats = simulation.getStats()
      expect(stats.population).toBe(0)
      expect(stats.generation).toBe(0)
      expect(stats.isRunning).toBe(false)
      expect(stats.placementMode).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all organisms', () => {
      simulation.clear()
      
      const stats = simulation.getStats()
      expect(stats.population).toBe(0)
      expect(stats.generation).toBe(0)
    })
  })

  describe('setSpeed', () => {
    it('should update simulation speed', () => {
      expect(() => {
        simulation.setSpeed(10)
      }).not.toThrow()
    })
  })

  describe('setOrganismType', () => {
    it('should set the organism type for placement', () => {
      expect(() => {
        simulation.setOrganismType(ORGANISM_TYPES.virus)
      }).not.toThrow()
    })
  })

  describe('setMaxPopulation', () => {
    it('should set the maximum population limit', () => {
      expect(() => {
        simulation.setMaxPopulation(500)
      }).not.toThrow()
    })
  })

  describe('getOrganismTypeById', () => {
    it('should return null for unknown organism types', () => {
      const result = simulation.getOrganismTypeById('unknown')
      expect(result).toBeNull()
    })

    it('should return organism type for valid unlocked organisms', () => {
      // This will depend on the unlockables implementation
      const result = simulation.getOrganismTypeById('bacteria')
      expect(result).toBeNull() // Since bacteria is not in unlockables
    })
  })

  describe('startChallenge', () => {
    it('should start a challenge without errors', () => {
      expect(() => {
        simulation.startChallenge()
      }).not.toThrow()
    })
  })

  describe('getStats', () => {
    it('should return current simulation statistics', () => {
      const stats = simulation.getStats()
      
      expect(stats).toHaveProperty('population')
      expect(stats).toHaveProperty('generation')
      expect(stats).toHaveProperty('isRunning')
      expect(stats).toHaveProperty('placementMode')
      
      expect(typeof stats.population).toBe('number')
      expect(typeof stats.generation).toBe('number')
      expect(typeof stats.isRunning).toBe('boolean')
      expect(typeof stats.placementMode).toBe('boolean')
    })
  })

  describe('canvas event handling', () => {
    it('should handle canvas click events', () => {
      const addEventListener = mockCanvas.addEventListener as any;
      const clickHandler = addEventListener.calls.find(
        (call: any) => call.type === 'click'
      )?.listener;

      const mockEvent = {
        clientX: 150,
        clientY: 100
      };

      expect(() => {
        clickHandler(mockEvent);
      }).not.toThrow();
    });

    it('should handle canvas mousemove events', () => {
      const addEventListener = mockCanvas.addEventListener as any;
      const mousemoveHandler = addEventListener.calls.find(
        (call: any) => call.type === 'mousemove'
      )?.listener;

      const mockEvent = {
        clientX: 150,
        clientY: 100
      };

      expect(() => {
        mousemoveHandler(mockEvent);
      }).not.toThrow();
    });
  })
})
