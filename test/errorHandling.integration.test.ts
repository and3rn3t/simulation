import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OrganismSimulation } from '../src/core/simulation';
import { ORGANISM_TYPES } from '../src/models/organismTypes';
import { ErrorHandler } from '../src/utils/system/errorHandler';
import { CanvasManager } from '../src/utils/canvas/canvasManager';

// Mock HTML elements for testing
const mockCanvas = {
  width: 800,
  height: 600,
  getContext: vi.fn(() => ({
    fillStyle: '',
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    strokeStyle: '',
    lineWidth: 0,
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    font: '',
    textAlign: '',
    fillText: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    globalAlpha: 1
  })),
  classList: {
    add: vi.fn(),
    remove: vi.fn()
  },
  addEventListener: vi.fn(),
  getBoundingClientRect: vi.fn(() => ({
    left: 0,
    top: 0,
    width: 800,
    height: 600
  }))
} as unknown as HTMLCanvasElement;

vi.mock('../src/utils/canvas/canvasManager', () => {
  return {
    CanvasManager: vi.fn().mockImplementation(() => {
      return {
        addLayer: vi.fn(),
        getContext: vi.fn(() => ({
          fillStyle: '',
          fillRect: vi.fn(),
          clearRect: vi.fn(),
          beginPath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          stroke: vi.fn(),
          arc: vi.fn(),
          closePath: vi.fn(),
          canvas: { width: 800, height: 600 }, // Mocked canvas dimensions
        })),
        removeLayer: vi.fn(),
        createLayer: vi.fn(() => document.createElement('canvas')),
      };
    }),
  };
});

describe('Error Handling Integration', () => {
  let errorHandler: ErrorHandler;
  
  beforeEach(() => {
    errorHandler = ErrorHandler.getInstance();
    errorHandler.clearErrors();
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const container = document.createElement('div');
    container.id = 'canvas-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    const container = document.getElementById('canvas-container');
    if (container) {
      container.remove();
    }
  });

  it('should handle invalid canvas gracefully', () => {
    expect(() => {
      new OrganismSimulation(null as any, ORGANISM_TYPES.bacteria);
    }).toThrow();
    
    const errors = errorHandler.getRecentErrors();
    expect(errors).toHaveLength(1);
    expect(errors[0].context).toBe('OrganismSimulation constructor');
  });

  it('should handle invalid organism type gracefully', () => {
    expect(() => {
      new OrganismSimulation(mockCanvas, null as any);
    }).toThrow();
    
    const errors = errorHandler.getRecentErrors();
    expect(errors).toHaveLength(1);
    expect(errors[0].context).toBe('OrganismSimulation constructor');
  });

  it('should handle invalid speed values', () => {
    const simulation = new OrganismSimulation(mockCanvas, ORGANISM_TYPES.bacteria);
    
    simulation.setSpeed(-1); // Invalid speed
    simulation.setSpeed(15); // Invalid speed
    
    const errors = errorHandler.getRecentErrors();
    expect(errors).toHaveLength(2);
    expect(errors[0].context).toBe('Setting simulation speed');
    expect(errors[1].context).toBe('Setting simulation speed');
  });

  it('should handle invalid population limits', () => {
    const simulation = new OrganismSimulation(mockCanvas, ORGANISM_TYPES.bacteria);
    
    simulation.setMaxPopulation(0); // Invalid limit
    simulation.setMaxPopulation(10000); // Invalid limit
    
    const errors = errorHandler.getRecentErrors();
    expect(errors).toHaveLength(2);
    expect(errors[0].context).toBe('Setting maximum population');
    expect(errors[1].context).toBe('Setting maximum population');
  });

  it('should continue working despite minor errors', () => {
    const simulation = new OrganismSimulation(mockCanvas, ORGANISM_TYPES.bacteria);
    
    // These should not crash the simulation
    simulation.setSpeed(-1);
    simulation.setMaxPopulation(0);
    simulation.setOrganismType(null as any);
    
    // Simulation should still have valid state
    const stats = simulation.getStats();
    expect(stats).toBeDefined();
    expect(typeof stats.population).toBe('number');
  });

  it('should provide error statistics', () => {
    const simulation = new OrganismSimulation(mockCanvas, ORGANISM_TYPES.bacteria);
    
    // Generate some errors
    simulation.setSpeed(-1);
    simulation.setMaxPopulation(0);
    
    const stats = errorHandler.getErrorStats();
    expect(stats.total).toBe(2);
    expect(stats.bySeverity.medium).toBe(2);
  });
});
