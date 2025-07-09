import { OrganismSimulation } from '../src/core/simulation';
import { OrganismType } from '../src/models/organismTypes';
import { CanvasManager } from '../src/utils/canvas/canvasManager';

// @ts-ignore
jest.mock('../src/utils/canvas/canvasManager');

describe('OrganismSimulation', () => {
  let container: HTMLCanvasElement;
  let mockCanvasManager: jest.Mocked<CanvasManager>;
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

    // Mock CanvasManager
    mockCanvasManager = new CanvasManager(container) as jest.Mocked<CanvasManager>;
    jest.spyOn(CanvasManager.prototype, 'createLayer');
    jest.spyOn(CanvasManager.prototype, 'getContext').mockReturnValue({
      fillStyle: '',
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
    } as unknown as CanvasRenderingContext2D);

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
    jest.restoreAllMocks();
  });

  it('should initialize CanvasManager and create layers', () => {
    const simulation = new OrganismSimulation(container, organismType);

    expect(CanvasManager.prototype.createLayer).toHaveBeenCalledWith('background', 0);
    expect(CanvasManager.prototype.createLayer).toHaveBeenCalledWith('organisms', 1);
  });

  it('should render organisms on the organisms layer', () => {
    const simulation = new OrganismSimulation(container, organismType);

    const organisms = [
      { x: 10, y: 20, size: 5, color: 'blue' },
      { x: 30, y: 40, size: 10, color: 'green' },
    ];

    simulation.renderOrganisms(organisms);

    const context = CanvasManager.prototype.getContext('organisms');
    expect(context.clearRect).toHaveBeenCalled();
    organisms.forEach((organism) => {
      expect(context.beginPath).toHaveBeenCalled();
      expect(context.arc).toHaveBeenCalledWith(organism.x, organism.y, organism.size, 0, Math.PI * 2);
      expect(context.fill).toHaveBeenCalled();
    });
  });

  it('should resize all layers when resized', () => {
    const simulation = new OrganismSimulation(container, organismType);

    simulation.resize();

    expect(CanvasManager.prototype.resizeAll).toHaveBeenCalled();
  });
});
