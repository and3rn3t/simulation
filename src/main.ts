// Import all CSS styles first
import './ui/style.css';

console.log('🚀 Starting application initialization...');

// Import essential modules
import { MemoryPanelComponent } from './ui/components/MemoryPanelComponent';
import {
  ErrorHandler,
  ErrorSeverity,
  initializeGlobalErrorHandlers,
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

// Clear any existing error dialogs that might be present from previous sessions
document.addEventListener('DOMContentLoaded', () => {
  const existingErrorDialogs = document.querySelectorAll(
    '.notification, .error-dialog, .alert, .error-notification'
  );
  existingErrorDialogs.forEach(dialog => dialog.remove());
});

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
    const existingErrorDialogs = document.querySelectorAll(
      '.notification, .error-dialog, .alert, .error-notification'
    );
    existingErrorDialogs.forEach(dialog => dialog.remove());

    // Setup mobile optimizations early
    setupMobileOptimizations();

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
    // Use HIGH severity instead of CRITICAL to avoid showing error dialog on startup
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error('Application initialization failed'),
      ErrorSeverity.HIGH,
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

    // Make canvas interactive
    canvas.style.cursor = 'crosshair';

    console.log('✅ Canvas setup complete');
  } else {
    console.error('❌ Canvas not found');
  }

  if (startBtn) {
    console.log('✅ Start button found');
  }

  if (pauseBtn) {
    console.log('✅ Pause button found');
  }

  if (resetBtn) {
    console.log('✅ Reset button found');
  }

  if (clearBtn) {
    console.log('✅ Clear button found');
  }

  if (statsPanel) {
    console.log('✅ Stats panel found');
  }

  console.log('✅ Basic elements initialized');
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
    gameStateManager = new GameStateManager(powerUpManager, leaderboardManager, unlockableManager);

    // Initialize leaderboard display
    leaderboardManager.updateLeaderboardDisplay();

    // Setup power-up event listeners
    const powerUpButtons = document.querySelectorAll('.buy-powerup');
    powerUpButtons.forEach(button => {
      button.addEventListener('click', event => {
        const target = event.target as HTMLButtonElement;
        const powerUpType = target.getAttribute('data-powerup');
        if (powerUpType && simulation) {
          const powerUp = powerUpManager.buyPowerUp(powerUpType);
          if (powerUp) {
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
      ErrorSeverity.MEDIUM,
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
      ErrorSeverity.MEDIUM,
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
    const populationLimitValue = document.getElementById(
      'population-limit-value'
    ) as HTMLSpanElement;
    const organismSelect = document.getElementById('organism-select') as HTMLSelectElement;

    // Setup button event listeners
    if (startBtn && simulation) {
      startBtn.addEventListener('click', () => {
        if (simulation!.getStats().isRunning) {
          handleGameOver();
          simulation!.pause();
        } else {
          simulation!.start();
        }
      });
    }

    if (pauseBtn && simulation) {
      pauseBtn.addEventListener('click', () => {
        simulation!.pause();
      });
    }

    if (resetBtn && simulation) {
      resetBtn.addEventListener('click', () => {
        simulation!.reset();
        leaderboardManager.updateLeaderboardDisplay();
      });
    }

    if (clearBtn && simulation) {
      clearBtn.addEventListener('click', () => {
        simulation!.clear();
      });
    }

    // Setup slider controls
    if (speedSlider && speedValue && simulation) {
      speedSlider.addEventListener('input', () => {
        const speed = parseInt(speedSlider.value);
        simulation!.setSpeed(speed);
        speedValue.textContent = `${speed}x`;
        console.log('🏃 Speed changed to:', speed);
      });
    }

    if (populationLimitSlider && populationLimitValue && simulation) {
      populationLimitSlider.addEventListener('input', () => {
        const limit = parseInt(populationLimitSlider.value);
        simulation!.setMaxPopulation(limit);
        populationLimitValue.textContent = limit.toString();
        console.log('👥 Population limit changed to:', limit);
      });
    }

    if (organismSelect && simulation) {
      organismSelect.addEventListener('change', () => {
        const selectedType = simulation!.getOrganismTypeById(organismSelect.value);
        if (selectedType) {
          simulation!.setOrganismType(selectedType);
          console.log('🦠 Organism type changed to:', organismSelect.value);
        }
      });
    }

    // Setup challenge button
    const challengeBtn = document.getElementById('start-challenge-btn');
    if (challengeBtn && simulation) {
      challengeBtn.addEventListener('click', () => {
        simulation!.startChallenge();
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

    // Calculate a simple score based on population and generation
    const score = finalStats.population * 10 + finalStats.generation * 5;

    // Add entry to leaderboard
    gameStateManager.handleGameOver({
      score,
      population: finalStats.population,
      generation: finalStats.generation,
      timeElapsed: Math.floor(Date.now() / 1000), // Simple time calculation
    });

    console.log('🏁 Game over handled, leaderboard updated with score:', score);
  } catch (error) {
    console.error('❌ Failed to handle game over:', error);
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error('Game over handling failed'),
      ErrorSeverity.MEDIUM,
      'Game over handling'
    );
  }
}

// === DEVELOPMENT TOOLS ===

function setupDevKeyboardShortcuts(): void {
  document.addEventListener('keydown', event => {
    // Ctrl/Cmd + Shift + D for debug mode
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
      event.preventDefault();
      if (debugMode) {
        debugMode.toggle();
      }
    }

    // Ctrl/Cmd + Shift + C for console
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'C') {
      event.preventDefault();
      if (devConsole) {
        devConsole.toggle();
      }
    }

    // Ctrl/Cmd + Shift + P for profiler
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'P') {
      event.preventDefault();
      if (performanceProfiler) {
        performanceProfiler.toggle();
      }
    }
  });
}

// Lazy load development tools
if (import.meta.env.DEV) {
  console.log('🔧 Development mode detected, loading dev tools...');

  import('./dev/index')
    .then(module => {
      debugMode = module.DebugMode.getInstance();
      devConsole = module.DeveloperConsole.getInstance();
      performanceProfiler = module.PerformanceProfiler.getInstance();

      // Set up keyboard shortcuts
      setupDevKeyboardShortcuts();

      console.log('✅ Development tools loaded successfully');
    })
    .catch(error => {
      console.error('❌ Failed to load development tools:', error);
    });

  // Hot reload support
  if (import.meta.hot) {
    import.meta.hot.accept('./dev/index', newModule => {
      if (newModule) {
        debugMode = newModule['DebugMode'].getInstance();
        devConsole = newModule['DeveloperConsole'].getInstance();
        performanceProfiler = newModule['PerformanceProfiler'].getInstance();
        console.log('🔄 Development tools reloaded');
      }
    });
  }
}

// Mobile-specific optimizations
function setupMobileOptimizations(): void {
  console.log('🔧 Setting up mobile optimizations...');

  try {
    // Detect if we're on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (isMobile) {
      console.log('📱 Mobile device detected, applying optimizations...');

      // Prevent bounce scrolling on iOS
      document.body.style.overscrollBehavior = 'none';

      // Improve touch performance
      document.body.style.touchAction = 'manipulation';

      // Fix iOS Safari viewport height issues
      const setVhProperty = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };

      setVhProperty();
      window.addEventListener('resize', setVhProperty);
      window.addEventListener('orientationchange', () => {
        setTimeout(setVhProperty, 100);
      });

      // Optimize canvas for mobile
      const canvas = document.getElementById('simulation-canvas') as HTMLCanvasElement;
      if (canvas) {
        // Enable hardware acceleration
        canvas.style.willChange = 'transform';

        // Improve touch responsiveness
        canvas.style.touchAction = 'none';

        // Set optimal canvas size for mobile
        const updateCanvasSize = () => {
          const container = canvas.parentElement;
          if (container) {
            const maxWidth = Math.min(container.clientWidth - 20, 400);
            const aspectRatio = 8 / 5; // 800x500 original ratio
            const height = Math.min(maxWidth / aspectRatio, 300);

            canvas.style.width = `${maxWidth}px`;
            canvas.style.height = `${height}px`;
          }
        };

        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);
        window.addEventListener('orientationchange', () => {
          setTimeout(updateCanvasSize, 100);
        });
      }

      // Add haptic feedback for supported devices
      if ('vibrate' in navigator) {
        const addHapticFeedback = (element: Element) => {
          element.addEventListener('touchstart', () => {
            navigator.vibrate(10); // Very short vibration
          });
        };

        // Add haptic feedback to buttons
        document.querySelectorAll('button').forEach(addHapticFeedback);
      }

      console.log('✅ Mobile optimizations applied');
    }
  } catch (error) {
    console.error('❌ Failed to setup mobile optimizations:', error);
  }
}
