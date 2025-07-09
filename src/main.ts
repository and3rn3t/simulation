// Import all CSS styles first
import './ui/style.css';

console.log('🚀 Starting application initialization...');

// Import essential modules
import { MemoryPanelComponent } from './ui/components/MemoryPanelComponent';
import { 
  ErrorHandler, 
  ErrorSeverity,
  initializeGlobalErrorHandlers 
} from './utils/system/errorHandler';

// Initialize global error handlers first
initializeGlobalErrorHandlers();

// Initialize components
const memoryPanelComponent = new MemoryPanelComponent();

// Simulation state
let isSimulationRunning = false;
let simulationInterval: number | null = null;
let animationFrameId: number | null = null;
let simulationSpeed = 5;
let populationLimit = 1000;
let frameCounter = 0;
let organisms: Array<{
  x: number, 
  y: number, 
  age: number, 
  size: number,
  vx: number,
  vy: number,
  reproductionTimer: number,
  lifespan: number
}> = [];
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

// Check if DOM is already loaded
if (document.readyState === 'loading') {
  console.log('⏳ DOM is still loading, waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
  console.log('✅ DOM already loaded, initializing immediately...');
  initializeApplication();
}

function initializeApplication(): void {
  console.log('🎯 Starting full application initialization...');
  
  try {
    // Clear any existing error dialogs
    const existingErrorDialogs = document.querySelectorAll('.notification, .error-dialog, .alert');
    existingErrorDialogs.forEach(dialog => dialog.remove());
    
    // Initialize basic DOM elements
    initializeBasicElements();
    
    // Initialize memory panel
    initializeMemoryPanel();
    
    // Initialize basic simulation controls
    initializeSimulationControls();
    
    console.log('✅ Application initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error('Application initialization failed'),
      ErrorSeverity.CRITICAL,
      'Application startup'
    );
  }
}

function initializeBasicElements(): void {
  console.log('🔧 Initializing basic DOM elements...');
  
  // Check for essential elements
  canvas = document.getElementById('simulation-canvas') as HTMLCanvasElement;
  const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
  const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
  const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
  const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
  const statsPanel = document.getElementById('stats-panel');
  
  if (canvas) {
    console.log('✅ Canvas found');
    ctx = canvas.getContext('2d');
    
    // Make canvas interactive
    canvas.style.cursor = 'crosshair';
    canvas.addEventListener('click', (event) => {
      const rect = canvas!.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      console.log('🖱️ Canvas clicked at:', x, y);
      
      // Add a new organism at click position
      addOrganism(x, y);
    });
  } else {
    console.error('❌ Canvas not found');
  }
  
  if (startBtn) {
    console.log('✅ Start button found');
    startBtn.addEventListener('click', () => {
      console.log('▶️ Start button clicked');
      startSimulation();
    });
  }
  
  if (pauseBtn) {
    console.log('✅ Pause button found');
    pauseBtn.addEventListener('click', () => {
      console.log('⏸️ Pause button clicked');
      pauseSimulation();
    });
  }
  
  if (resetBtn) {
    console.log('✅ Reset button found');
    resetBtn.addEventListener('click', () => {
      console.log('🔄 Reset button clicked');
      resetSimulation();
    });
  }
  
  if (clearBtn) {
    console.log('✅ Clear button found');
    clearBtn.addEventListener('click', () => {
      console.log('🗑️ Clear button clicked');
      clearCanvas();
    });
  }
  
  if (statsPanel) {
    console.log('✅ Stats panel found');
  }
}

function initializeMemoryPanel(): void {
  console.log('🧠 Initializing memory panel...');
  
  try {
    memoryPanelComponent.mount(document.body);
    console.log('✅ Memory panel mounted successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize memory panel:', error);
  }
}

function initializeSimulationControls(): void {
  console.log('🎮 Initializing simulation controls...');
  
  try {
    // Initialize basic controls
    const speedSlider = document.getElementById('speed-slider') as HTMLInputElement;
    const speedValue = document.getElementById('speed-value') as HTMLSpanElement;
    const populationLimitSlider = document.getElementById('population-limit') as HTMLInputElement;
    const populationLimitValue = document.getElementById('population-limit-value') as HTMLSpanElement;
    const organismSelect = document.getElementById('organism-select') as HTMLSelectElement;
    
    if (speedSlider && speedValue) {
      speedSlider.addEventListener('input', () => {
        simulationSpeed = parseInt(speedSlider.value);
        speedValue.textContent = `${speedSlider.value}x`;
        console.log('🏃 Speed changed to:', speedSlider.value);
      });
      console.log('✅ Speed control initialized');
    }
    
    if (populationLimitSlider && populationLimitValue) {
      populationLimitSlider.addEventListener('input', () => {
        populationLimit = parseInt(populationLimitSlider.value);
        populationLimitValue.textContent = populationLimitSlider.value;
        console.log('👥 Population limit changed to:', populationLimitSlider.value);
      });
      console.log('✅ Population limit control initialized');
    }
    
    if (organismSelect) {
      organismSelect.addEventListener('change', () => {
        console.log('🦠 Organism type changed to:', organismSelect.value);
      });
      console.log('✅ Organism selector initialized');
    }
    
    console.log('✅ All simulation controls initialized');
    
  } catch (error) {
    console.error('❌ Failed to initialize controls:', error);
  }
}

// === SIMULATION FUNCTIONS ===

function addOrganism(x: number, y: number): void {
  if (organisms.length >= populationLimit) {
    console.log('⚠️ Population limit reached');
    return;
  }
  
  const organism = {
    x,
    y,
    age: 0,
    size: 3 + Math.random() * 3,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    reproductionTimer: 0,
    lifespan: 50 + Math.random() * 100
  };
  
  organisms.push(organism);
  console.log('🦠 Added organism at', x, y, '- Total:', organisms.length);
  
  // Draw immediately if not running simulation
  if (!isSimulationRunning) {
    drawOrganisms();
  }
}

function startSimulation(): void {
  if (isSimulationRunning) return;
  
  isSimulationRunning = true;
  frameCounter = 0; // Reset frame counter
  console.log('▶️ Starting simulation...');
  
  // Update UI
  const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
  const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
  
  if (startBtn) {
    startBtn.textContent = 'Running...';
    startBtn.disabled = true;
  }
  if (pauseBtn) {
    pauseBtn.disabled = false;
  }
  
  // Add running class to canvas
  if (canvas) {
    canvas.classList.add('running');
  }
  
  // Start animation loop
  animationLoop();
}

function pauseSimulation(): void {
  isSimulationRunning = false;
  console.log('⏸️ Pausing simulation...');
  
  // Update UI
  const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
  const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
  
  if (startBtn) {
    startBtn.textContent = 'Start';
    startBtn.disabled = false;
  }
  if (pauseBtn) {
    pauseBtn.disabled = true;
  }
  
  // Remove running class from canvas
  if (canvas) {
    canvas.classList.remove('running');
  }
  
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function resetSimulation(): void {
  console.log('🔄 Resetting simulation...');
  
  pauseSimulation();
  organisms = [];
  clearCanvas();
  
  // Reset stats
  updateStats();
}

function clearCanvas(): void {
  if (!canvas || !ctx) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  console.log('🧹 Canvas cleared');
}

function animationLoop(): void {
  if (!isSimulationRunning) return;
  
  // Speed control - only update simulation every N frames based on speed
  const frameSkip = Math.max(1, 11 - simulationSpeed); // Higher speed = fewer frames to skip
  
  frameCounter++;
  
  if (frameCounter % frameSkip === 0) {
    // Update simulation
    updateSimulation();
  }
  
  // Always draw (for smooth visuals)
  clearCanvas();
  drawOrganisms();
  
  // Update stats occasionally
  if (frameCounter % 30 === 0) {
    updateStats();
  }
  
  // Continue loop
  animationFrameId = requestAnimationFrame(animationLoop);
}

function updateSimulation(): void {
  const newOrganisms: typeof organisms = [];
  
  for (let i = 0; i < organisms.length; i++) {
    const organism = organisms[i];
    
    // Age the organism
    organism.age++;
    
    // Move the organism
    organism.x += organism.vx;
    organism.y += organism.vy;
    
    // Bounce off walls
    if (canvas) {
      if (organism.x <= 0 || organism.x >= canvas.width) {
        organism.vx *= -1;
        organism.x = Math.max(0, Math.min(canvas.width, organism.x));
      }
      if (organism.y <= 0 || organism.y >= canvas.height) {
        organism.vy *= -1;
        organism.y = Math.max(0, Math.min(canvas.height, organism.y));
      }
    }
    
    // Check if organism should die
    if (organism.age > organism.lifespan) {
      continue; // Don't add to new array (dies)
    }
    
    // Reproduction logic
    organism.reproductionTimer++;
    if (organism.reproductionTimer > 60 && organisms.length < populationLimit) {
      // Create offspring
      const offspring = {
        x: organism.x + (Math.random() - 0.5) * 20,
        y: organism.y + (Math.random() - 0.5) * 20,
        age: 0,
        size: organism.size * (0.8 + Math.random() * 0.4),
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        reproductionTimer: 0,
        lifespan: 50 + Math.random() * 100
      };
      
      newOrganisms.push(offspring);
      organism.reproductionTimer = 0; // Reset parent's timer
    }
    
    newOrganisms.push(organism);
  }
  
  organisms = newOrganisms;
}

function drawOrganisms(): void {
  if (!ctx || !canvas) return;
  
  for (const organism of organisms) {
    // Color based on age
    const ageRatio = organism.age / organism.lifespan;
    const hue = 120 - (ageRatio * 60); // Green to red
    
    ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
    ctx.beginPath();
    ctx.arc(organism.x, organism.y, organism.size, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw subtle outline
    ctx.strokeStyle = `hsl(${hue}, 70%, 30%)`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function updateStats(): void {
  // Update population counter
  const populationElement = document.getElementById('population-count');
  if (populationElement) {
    populationElement.textContent = organisms.length.toString();
  }
  
  // Calculate average age
  const avgAge = organisms.length > 0 
    ? Math.round(organisms.reduce((sum, org) => sum + org.age, 0) / organisms.length)
    : 0;
    
  const avgAgeElement = document.getElementById('avg-age');
  if (avgAgeElement) {
    avgAgeElement.textContent = avgAge.toString();
  }
}
