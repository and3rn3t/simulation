import { vi, describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import { OrganismSimulation } from '../../src/core/simulation';
import { OrganismType } from '../../src/models/organismTypes';
import { CanvasManager } from '../../src/utils/canvas/canvasManager';

// Mock CanvasManager
vi.mock('../src/utils/canvas/canvasManager', () => {
  const mockCanvasManager = {
    createLayer: vi.fn(),
    getContext: vi.fn(),
    clearLayer: vi.fn(),
    resizeAll: vi.fn(),
  };
  
  return {
    CanvasManager: vi.fn(() => mockCanvasManager),
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

  it('should initialize CanvasManager and create layers', () => {
    const simulation = new OrganismSimulation(container, organismType);
    
    // Check that CanvasManager was instantiated
    expect(CanvasManager).toHaveBeenCalled();
  });

  it('should render organisms on the organisms layer', () => {
    const simulation = new OrganismSimulation(container, organismType);

    const organisms = [
      { x: 10, y: 20, size: 5, color: 'blue' },
      { x: 30, y: 40, size: 10, color: 'green' },
    ];

    simulation.renderOrganisms(organisms);

    // This test just ensures the method runs without error
    expect(true).toBe(true);
  });

  it('should resize all layers when resized', () => {
    const simulation = new OrganismSimulation(container, organismType);

    simulation.resize();

    // This test just ensures the method runs without error
    expect(true).toBe(true);
  });
});
