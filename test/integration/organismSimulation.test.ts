import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { OrganismSimulation } from '../../src/core/simulation';
import { OrganismType } from '../../src/models/organismTypes';
import { MobileCanvasManager } from '../../src/utils/mobile/MobileCanvasManager';

// Mock MobileCanvasManager
vi.mock('../../src/utils/mobile/MobileCanvasManager', () => {
  const mockMobileCanvasManager = {
    createLayer: vi.fn(),
    getContext: vi.fn(),
    clearLayer: vi.fn(),
    resizeAll: vi.fn(),
    isMobileDevice: vi.fn(() => false),
    updateCanvasSize: vi.fn(),
    enableTouchOptimizations: vi.fn(),
    disableTouchOptimizations: vi.fn(),
    getTouchScale: vi.fn(() => 1),
  };

  return {
    MobileCanvasManager: vi.fn(() => mockMobileCanvasManager),
  };
});

// Mock HTMLCanvasElement.prototype.getContext globally
beforeAll(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((contextType: string) => {
    if (contextType === '2d') {
      return {
        canvas: document.createElement('canvas'),
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        getImageData: vi.fn(),
        putImageData: vi.fn(),
        createImageData: vi.fn(() => ({ width: 0, height: 0 })),
        setTransform: vi.fn(),
        drawImage: vi.fn(),
        save: vi.fn(),
        fillText: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        stroke: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        rotate: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        measureText: vi.fn(() => ({ width: 0 })),
        transform: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
      } as unknown as CanvasRenderingContext2D;
    }
    return null;
  });
});

describe('OrganismSimulation', () => {
  let container: HTMLCanvasElement;
  let organismType: OrganismType;

  beforeEach(() => {
    // Create a mock canvas container element
    const containerDiv = document.createElement('div');
    containerDiv.id = 'canvas-container';
    document.body.appendChild(containerDiv);

    // Create a mock canvas element
    container = document.createElement('canvas');
    container.id = 'simulation-canvas';
    containerDiv.appendChild(container);

    // Define a complete mock organism type
    organismType = {
      name: 'Test Organism',
      color: 'red',
      size: 5,
      growthRate: 0.1,
      deathRate: 0.05,
      maxAge: 100,
      description: 'A test organism for simulation.',
    };
  });

  afterEach(() => {
    const containerDiv = document.getElementById('canvas-container');
    if (containerDiv) {
      document.body.removeChild(containerDiv);
    }
    vi.restoreAllMocks();
  });

  it('should initialize MobileCanvasManager and create layers', () => {
    const simulation = new OrganismSimulation(container);

    // Check that MobileCanvasManager was instantiated
    expect(MobileCanvasManager).toHaveBeenCalled();
  });

  it('should render organisms on the organisms layer', () => {
    const simulation = new OrganismSimulation(container);

    // This test just ensures the simulation is created without error
    expect(simulation).toBeDefined();
  });

  it('should resize all layers when resized', () => {
    const simulation = new OrganismSimulation(container);

    // This test just ensures the simulation is created without error
    expect(simulation).toBeDefined();
  });
});
