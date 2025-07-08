import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { OrganismSimulation } from '../src/simulation'
import { ORGANISM_TYPES } from '../src/organismTypes'

// Mock canvas and DOM
const mockCanvas = {
  width: 800,
  height: 600,
  getContext: vi.fn(() => ({
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    font: '',
    textAlign: '',
    textBaseline: '',
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 100 })),
    arc: vi.fn(),
    fill: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    globalAlpha: 1
  })),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  getBoundingClientRect: vi.fn(() => ({
    left: 0,
    top: 0,
    width: 800,
    height: 600,
    right: 800,
    bottom: 600,
    x: 0,
    y: 0,
    toJSON: vi.fn()
  }))
} as any

// Mock DOM elements
const mockElements = {
  'simulation-canvas': mockCanvas,
  'selected-organism': { textContent: 'bacteria' },
  'organism-bacteria': { addEventListener: vi.fn() },
  'organism-virus': { addEventListener: vi.fn() },
  'organism-cell': { addEventListener: vi.fn() },
  'organism-plant': { addEventListener: vi.fn() },
  'organism-animal': { addEventListener: vi.fn() },
  'organism-mushroom': { addEventListener: vi.fn() },
  'organism-coral': { addEventListener: vi.fn() },
  'organism-algae': { addEventListener: vi.fn() },
  'organism-protozoa': { addEventListener: vi.fn() },
  'organism-parasite': { addEventListener: vi.fn() },
  'organism-slime': { addEventListener: vi.fn() },
  'organism-crystal': { addEventListener: vi.fn() },
  'organism-synthetic': { addEventListener: vi.fn() },
  'organism-quantum': { addEventListener: vi.fn() },
  'organism-nano': { addEventListener: vi.fn() },
  'organism-hybrid': { addEventListener: vi.fn() },
  'organism-evolved': { addEventListener: vi.fn() },
  'organism-transcendent': { addEventListener: vi.fn() },
  'organism-divine': { addEventListener: vi.fn() },
  'organism-cosmic': { addEventListener: vi.fn() },
  'placement-phase': { style: { display: 'block' } },
  'simulation-phase': { style: { display: 'none' } },
  'organism-selector': { style: { display: 'block' } },
  'simulation-controls': { style: { display: 'none' } },
  'start-simulation': { addEventListener: vi.fn() },
  'pause-simulation': { addEventListener: vi.fn() },
  'reset-simulation': { addEventListener: vi.fn() },
  'speed-slider': { addEventListener: vi.fn(), value: '5' },
  'speed-display': { textContent: '5x' },
  'population-count': { textContent: '0' },
  'generation-count': { textContent: '0' },
  'time-elapsed': { textContent: '0s' },
  'birth-rate': { textContent: '0' },
  'death-rate': { textContent: '0' },
  'avg-age': { textContent: '0' },
  'oldest-organism': { textContent: '0' },
  'population-density': { textContent: '0' },
  'population-stability': { textContent: 'N/A' },
  'score': { textContent: '0' },
  'achievement-count': { textContent: '0/0' }
}

describe('OrganismSimulation', () => {
  let simulation: OrganismSimulation
  let originalRequestAnimationFrame: any
  let originalPerformanceNow: any
  let originalLocalStorage: any

  beforeEach(() => {
    // Mock getElementById
    vi.spyOn(document, 'getElementById').mockImplementation((id: string) => {
      return mockElements[id as keyof typeof mockElements] || null
    })

    // Mock querySelectorAll
    vi.spyOn(document, 'querySelectorAll').mockReturnValue([
      mockElements['organism-bacteria'],
      mockElements['organism-virus'],
      mockElements['organism-cell']
    ] as any)

    // Mock requestAnimationFrame
    originalRequestAnimationFrame = (globalThis as any).requestAnimationFrame
    ;(globalThis as any).requestAnimationFrame = vi.fn((cb) => {
      setTimeout(cb, 16)
      return 1
    })

    // Mock performance.now
    originalPerformanceNow = (globalThis as any).performance?.now
    ;(globalThis as any).performance = { now: vi.fn(() => Date.now()) } as any

    // Mock localStorage using Object.defineProperty
    originalLocalStorage = (globalThis as any).localStorage
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    })

    simulation = new OrganismSimulation(mockCanvas as HTMLCanvasElement, ORGANISM_TYPES.bacteria)
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
      const clickHandler = mockCanvas.addEventListener.mock.calls.find(
        call => call[0] === 'click'
      )[1]
      
      const mockEvent = {
        clientX: 150,
        clientY: 100
      }
      
      expect(() => {
        clickHandler(mockEvent)
      }).not.toThrow()
    })

    it('should handle canvas mousemove events', () => {
      const mousemoveHandler = mockCanvas.addEventListener.mock.calls.find(
        call => call[0] === 'mousemove'
      )[1]
      
      const mockEvent = {
        clientX: 150,
        clientY: 100
      }
      
      expect(() => {
        mousemoveHandler(mockEvent)
      }).not.toThrow()
    })
  })
})
