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

// Import game features
import { LeaderboardManager } from './features/leaderboard';
import { PowerUpManager } from './features/powerups';
import { UnlockableOrganismManager } from './models/unlockables';
import { GameStateManager } from './utils/game/gameStateManager';
import { OrganismSimulation } from './core/simulation';
import { ORGANISM_TYPES } from './models/organismTypes';

// Initialize global error handlers first
initializeGlobalErrorHandlers();

// Initialize components
const memoryPanelComponent = new MemoryPanelComponent();

// Development tools (lazy loaded)
let debugMode: any = null;
let devConsole: any = null;
let performanceProfiler: any = null;

// Game system managers
let leaderboardManager: LeaderboardManager;
let powerUpManager: PowerUpManager;
let unlockableManager: UnlockableOrganismManager;
let gameStateManager: GameStateManager;
let simulation: OrganismSimulation | null = null;

// Basic state
let canvas: HTMLCanvasElement | null = null;

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
    
    // Initialize game systems
    initializeGameSystems();
    
    // Initialize simulation
    initializeSimulation();
    
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

function initializeGameSystems(): void {
  console.log('🎮 Initializing game systems...');
  
  try {
    // Initialize managers
    leaderboardManager = new LeaderboardManager();
    powerUpManager = new PowerUpManager();
    unlockableManager = new UnlockableOrganismManager();
    gameStateManager = new GameStateManager(
      powerUpManager,
      leaderboardManager,
      unlockableManager
    );
    
    // Initialize leaderboard display
    leaderboardManager.updateLeaderboardDisplay();
    
    // Initialize power-up buttons
    powerUpManager.updatePowerUpButtons();
    
    // Setup power-up event listeners
    const powerUpButtons = document.querySelectorAll('.buy-powerup');
    powerUpButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        const target = event.target as HTMLButtonElement;
        const powerUpType = target.getAttribute('data-powerup');
        if (powerUpType && simulation) {
          const success = powerUpManager.purchasePowerUp(powerUpType);
          if (success) {
            console.log(`✅ Purchased power-up: ${powerUpType}`);
          } else {
            console.log(`❌ Cannot afford power-up: ${powerUpType}`);
          }
        }
      });
    });
    
    console.log('✅ Game systems initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize game systems:', error);
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error('Game systems initialization failed'),
      ErrorSeverity.HIGH,
      'Game systems initialization'
    );
  }
}

function initializeSimulation(): void {
  console.log('🧬 Initializing simulation...');
  
  try {
    if (!canvas) {
      throw new Error('Canvas not found');
    }
    
    // Initialize simulation with default organism type
    simulation = new OrganismSimulation(canvas, ORGANISM_TYPES.bacteria);
    
    // Setup simulation controls
    setupSimulationControls();
    
    console.log('✅ Simulation initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize simulation:', error);
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error('Simulation initialization failed'),
      ErrorSeverity.CRITICAL,
      'Simulation initialization'
    );
  }
}

function setupSimulationControls(): void {
  console.log('🎛️ Setting up simulation controls...');
  
  try {
    // Get control elements
    const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
    const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
    const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
    const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
    const speedSlider = document.getElementById('speed-slider') as HTMLInputElement;
    const speedValue = document.getElementById('speed-value') as HTMLSpanElement;
    const populationLimitSlider = document.getElementById('population-limit') as HTMLInputElement;
    const populationLimitValue = document.getElementById('population-limit-value') as HTMLSpanElement;
    const organismSelect = document.getElementById('organism-select') as HTMLSelectElement;
    
    // Setup button event listeners
    if (startBtn && simulation) {
      startBtn.addEventListener('click', () => {
        if (simulation.getStats().isRunning) {
          handleGameOver();
        } else {
          simulation.start();
        }
      });
    }
    
    if (pauseBtn && simulation) {
      pauseBtn.addEventListener('click', () => {
        simulation.pause();
      });
    }
    
    if (resetBtn && simulation) {
      resetBtn.addEventListener('click', () => {
        simulation.reset();
        leaderboardManager.updateLeaderboardDisplay();
      });
    }
    
    if (clearBtn && simulation) {
      clearBtn.addEventListener('click', () => {
        simulation.clear();
      });
    }
    
    // Setup slider controls
    if (speedSlider && speedValue && simulation) {
      speedSlider.addEventListener('input', () => {
        const speed = parseInt(speedSlider.value);
        simulation.setSpeed(speed);
        speedValue.textContent = `${speed}x`;
        console.log('🏃 Speed changed to:', speed);
      });
    }
    
    if (populationLimitSlider && populationLimitValue && simulation) {
      populationLimitSlider.addEventListener('input', () => {
        const limit = parseInt(populationLimitSlider.value);
        simulation.setMaxPopulation(limit);
        populationLimitValue.textContent = limit.toString();
        console.log('👥 Population limit changed to:', limit);
      });
    }
    
    if (organismSelect && simulation) {
      organismSelect.addEventListener('change', () => {
        const selectedType = simulation.getOrganismTypeById(organismSelect.value);
        if (selectedType) {
          simulation.setOrganismType(selectedType);
          console.log('🦠 Organism type changed to:', organismSelect.value);
        }
      });
    }
    
    // Setup challenge button
    const challengeBtn = document.getElementById('start-challenge-btn');
    if (challengeBtn && simulation) {
      challengeBtn.addEventListener('click', () => {
        simulation.startChallenge();
      });
    }
    
    console.log('✅ Simulation controls setup successfully');
    
  } catch (error) {
    console.error('❌ Failed to setup simulation controls:', error);
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error('Simulation controls setup failed'),
      ErrorSeverity.HIGH,
      'Simulation controls setup'
    );
  }
}

function handleGameOver(): void {
  if (!simulation || !gameStateManager) return;
  
  try {
    const finalStats = simulation.getStats();
    gameStateManager.handleGameOver({
      population: finalStats.population,
      generation: finalStats.generation,
      timeElapsed: Math.floor(Date.now() / 1000) // Simple time calculation
    });
    
    console.log('🏁 Game over handled, leaderboard updated');
    
  } catch (error) {
    console.error('❌ Failed to handle game over:', error);
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error('Game over handling failed'),
      ErrorSeverity.MEDIUM,
      'Game over handling'
    );
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
    startBtn.innerHTML = '⏹️'; // Change to stop symbol when running
    startBtn.title = 'Stop Simulation';
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
    startBtn.innerHTML = '▶️';
    startBtn.title = 'Start Simulation';
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
  
  // Performance profiling - track frame
  if (performanceProfiler && import.meta.env.DEV) {
    performanceProfiler.trackFrame();
  }
  
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
  
  // Update debug info
  if (debugMode && import.meta.env.DEV && frameCounter % 60 === 0) {
    debugMode.updateInfo({
      fps: Math.round(1000 / (performance.now() - frameCounter)),
      frameTime: performance.now(),
      organismCount: organisms.length,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      canvasOperations: organisms.length * 2, // Rough estimate
      simulationTime: Date.now(),
      lastUpdate: performance.now()
    });
  }
  
  // Track frame for debug mode
  if (debugMode && import.meta.env.DEV) {
    debugMode.trackFrame();
  }
  
  // Continue loop
  animationFrameId = requestAnimationFrame(animationLoop);
}

function updateSimulation(): void {
  const newOrganisms: typeof organisms = [];
  
  for (let i = 0; i < organisms.length; i++) {
    const organism = organisms[i];
    if (!organism) continue;
    
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

// Development tools keyboard shortcuts
function setupDevKeyboardShortcuts(): void {
  document.addEventListener('keydown', (event) => {
    // Only handle shortcuts if not typing in an input field
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }
    
    // F1 - Show/Hide keyboard shortcuts help
    if (event.key === 'F1') {
      event.preventDefault();
      toggleShortcutsHelp();
    }
    
    // F12 - Toggle Developer Console
    if (event.key === 'F12') {
      event.preventDefault();
      if (devConsole) {
        devConsole.toggle();
      }
    }
    
    // F11 - Toggle Debug Mode
    if (event.key === 'F11') {
      event.preventDefault();
      if (debugMode) {
        if (debugMode.isDebugEnabled()) {
          debugMode.disable();
        } else {
          debugMode.enable();
        }
      }
    }
    
    // Ctrl+Shift+P - Start/Stop Performance Profiling
    if (event.ctrlKey && event.shiftKey && event.key === 'P') {
      event.preventDefault();
      if (performanceProfiler) {
        if (performanceProfiler.isProfiling()) {
          performanceProfiler.stopProfiling();
        } else {
          performanceProfiler.startProfiling();
        }
      }
    }
    
    // Ctrl+Shift+D - Toggle all development tools
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
      event.preventDefault();
      if (debugMode && devConsole) {
        const shouldEnable = !debugMode.isDebugEnabled();
        if (shouldEnable) {
          debugMode.enable();
          devConsole.show();
        } else {
          debugMode.disable();
          devConsole.hide();
        }
      }
    }
  });
}

function toggleShortcutsHelp(): void {
  let helpPanel = document.getElementById('dev-shortcuts-help');
  
  if (helpPanel) {
    helpPanel.remove();
  } else {
    helpPanel = document.createElement('div');
    helpPanel.id = 'dev-shortcuts-help';
    helpPanel.className = 'dev-shortcuts show';
    helpPanel.innerHTML = `
      <h4>🔧 Development Tools Shortcuts</h4>
      <ul>
        <li><kbd>F1</kbd> - Toggle this help</li>
        <li><kbd>F11</kbd> - Toggle Debug Mode</li>
        <li><kbd>F12</kbd> - Toggle Developer Console</li>
        <li><kbd>Ctrl+Shift+P</kbd> - Performance Profiling</li>
        <li><kbd>Ctrl+Shift+D</kbd> - Toggle All Dev Tools</li>
      </ul>
    `;
    
    document.body.appendChild(helpPanel);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (helpPanel) {
        helpPanel.remove();
      }
    }, 5000);
  }
}

// Load dev tools in development mode
if (import.meta.env.DEV) {
  console.log('🔧 Loading development tools...');
  import('./dev/index').then((module) => {
    debugMode = module.DebugMode.getInstance();
    devConsole = module.DeveloperConsole.getInstance();
    performanceProfiler = module.PerformanceProfiler.getInstance();
    
    // Set up keyboard shortcuts
    setupDevKeyboardShortcuts();
    
    console.log('✅ Development tools loaded successfully');
  }).catch((error) => {
    console.error('❌ Failed to load development tools:', error);
  });
  
  // Hot reload support
  if (import.meta.hot) {
    import.meta.hot.accept('./dev/index', (newModule) => {
      if (newModule) {
        debugMode = newModule['DebugMode'].getInstance();
        devConsole = newModule['DeveloperConsole'].getInstance();
        performanceProfiler = newModule['PerformanceProfiler'].getInstance();
        console.log('🔄 Development tools reloaded');
      }
    });
  }
}
