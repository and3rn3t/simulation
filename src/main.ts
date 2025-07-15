// Import all CSS styles first
import './ui/style.css';

// Import reliability systems
import ReliabilityKit from './utils/system/reliabilityKit';

// Import essential modules
import { MemoryPanelComponent } from './ui/components/MemoryPanelComponent';
import {
  ErrorHandler,
  ErrorSeverity,
  initializeGlobalErrorHandlers,
} from './utils/system/errorHandler';
import { log } from './utils/system/logger';

// Import game features
import { OrganismSimulation } from './core/simulation';
import { LeaderboardManager } from './features/leaderboard/leaderboard.js';
import { PowerUpManager } from './features/powerups/powerups.js';
import { UnlockableOrganismManager } from './models/unlockables';
import { GameStateManager } from './utils/game/gameStateManager';
import { MobileTestInterface } from './utils/mobile/MobileTestInterface';

log.logSystem('🚀 Starting application initialization...');

// Initialize reliability systems for SonarCloud compliance
ReliabilityKit.init();

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
  log.logSystem('⏳ DOM is still loading, waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
  log.logSystem('✅ DOM already loaded, initializing immediately...');
  initializeApplication();
}

function initializeApplication(): void {
  log.logSystem('🎯 Starting full application initialization...');

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

    log.logSystem('✅ Application initialized successfully');
  } catch (error) {
    log.logError(
      error instanceof Error ? error : new Error('Application initialization failed'),
      'Application startup'
    );
    // Use HIGH severity instead of CRITICAL to avoid showing error dialog on startup
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error('Application initialization failed'),
      ErrorSeverity.HIGH,
      'Application startup'
    );
  }
}

function initializeBasicElements(): void {
  log.logSystem('🔧 Initializing basic DOM elements...');

  // Check for essential elements
  canvas = document.getElementById('simulation-canvas') as HTMLCanvasElement;
  const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
  const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
  const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
  const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
  const statsPanel = document.getElementById('stats-panel');

  if (canvas) {
    log.logSystem('✅ Canvas found');

    // Make canvas interactive
    canvas.style.cursor = 'crosshair';

    log.logSystem('✅ Canvas setup complete');
  } else {
    log.logError(new Error('Canvas not found'), 'DOM initialization');
  }

  if (startBtn) {
    log.logSystem('✅ Start button found');
  }

  if (pauseBtn) {
    log.logSystem('✅ Pause button found');
  }

  if (resetBtn) {
    log.logSystem('✅ Reset button found');
  }

  if (clearBtn) {
    log.logSystem('✅ Clear button found');
  }

  if (statsPanel) {
    log.logSystem('✅ Stats panel found');
  }

  log.logSystem('✅ Basic elements initialized');
}

function initializeMemoryPanel(): void {
  log.logSystem('🧠 Initializing memory panel...');

  try {
    memoryPanelComponent.mount(document.body);
    log.logSystem('✅ Memory panel mounted successfully');
  } catch (error) {
    log.logError(error, '❌ Failed to initialize memory panel');
  }
}

function initializeGameSystems(): void {
  log.logSystem('🎮 Initializing game systems...');

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
            log.logSystem(`✅ Purchased power-up: ${powerUpType}`);
          } else {
            log.logSystem(`❌ Cannot afford power-up: ${powerUpType}`);
          }
        }
      });
    });

    log.logSystem('✅ Game systems initialized successfully');
  } catch (error) {
    log.logError(error, '❌ Failed to initialize game systems');
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error('Game systems initialization failed'),
      ErrorSeverity.MEDIUM,
      'Game systems initialization'
    );
  }
}

function initializeSimulation(): void {
  log.logSystem('🧬 Initializing simulation...');

  try {
    if (!canvas) {
      throw new Error('Canvas not found');
    }

    // Initialize simulation with default organism type
    simulation = new OrganismSimulation(canvas);

    // Initialize mobile test interface for mobile devices
    const _mobileTestInterface = new MobileTestInterface();

    // Setup simulation controls
    setupSimulationControls();

    log.logSystem('✅ Simulation initialized successfully');
  } catch (error) {
    log.logError(error, '❌ Failed to initialize simulation');
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error('Simulation initialization failed'),
      ErrorSeverity.MEDIUM,
      'Simulation initialization'
    );
  }
}

function setupSimulationControls(): void {
  log.logSystem('🎛️ Setting up simulation controls...');

  try {
    setupButtonControls();
    setupSliderControls();
    setupSelectControls();

    log.logSystem('✅ Simulation controls setup successfully');
  } catch (error) {
    log.logError(error, '❌ Failed to setup simulation controls');
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error('Simulation controls setup failed'),
      ErrorSeverity.HIGH,
      'Simulation controls setup'
    );
  }
}

function setupButtonControls(): void {
  const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
  const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
  const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
  const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;

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
}

function setupSliderControls(): void {
  const speedSlider = document.getElementById('speed-slider') as HTMLInputElement;
  const speedValue = document.getElementById('speed-value') as HTMLSpanElement;
  const populationLimitSlider = document.getElementById('population-limit') as HTMLInputElement;
  const populationLimitValue = document.getElementById('population-limit-value') as HTMLSpanElement;

  if (speedSlider && speedValue && simulation) {
    speedSlider.addEventListener('input', () => {
      const speed = parseInt(speedSlider.value);
      simulation!.setSpeed(speed);
      speedValue.textContent = `${speed}x`;
      log.logSystem('🏃 Speed changed to:', speed);
    });
  }

  if (populationLimitSlider && populationLimitValue && simulation) {
    populationLimitSlider.addEventListener('input', () => {
      const limit = parseInt(populationLimitSlider.value);
      simulation!.setMaxPopulation(limit);
      populationLimitValue.textContent = limit.toString();
      log.logSystem('👥 Population limit changed to:', limit);
    });
  }
}

function setupSelectControls(): void {
  const organismSelect = document.getElementById('organism-select') as HTMLSelectElement;

  if (organismSelect && simulation) {
    organismSelect.addEventListener('change', () => {
      simulation!.setOrganismType(organismSelect.value);
      log.logSystem('🦠 Organism type changed to:', organismSelect.value);
    });
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

    log.logSystem('🏁 Game over handled, leaderboard updated with score:', score);
  } catch (error) {
    log.logError(error, '❌ Failed to handle game over');
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error('Game over handling failed'),
      ErrorSeverity.MEDIUM,
      'Game over handling'
    );
  }
}

// === DEVELOPMENT TOOLS ===

function setupDevKeyboardShortcuts(): void {
  document.addEventListener('keydown', handleDevKeyboardShortcut);
}

function handleDevKeyboardShortcut(event: KeyboardEvent): void {
  if (isDebugShortcut(event)) {
    handleDebugToggle(event);
  } else if (isConsoleShortcut(event)) {
    handleConsoleToggle(event);
  } else if (isProfilerShortcut(event)) {
    handleProfilerToggle(event);
  }
}

function isDebugShortcut(event: KeyboardEvent): boolean {
  return (event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D';
}

function isConsoleShortcut(event: KeyboardEvent): boolean {
  return (event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'C';
}

function isProfilerShortcut(event: KeyboardEvent): boolean {
  return (event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'P';
}

function handleDebugToggle(event: KeyboardEvent): void {
  event.preventDefault();
  if (debugMode) {
    debugMode.toggle();
  }
}

function handleConsoleToggle(event: KeyboardEvent): void {
  event.preventDefault();
  if (devConsole) {
    devConsole.toggle();
  }
}

function handleProfilerToggle(event: KeyboardEvent): void {
  event.preventDefault();
  if (performanceProfiler) {
    performanceProfiler.toggle();
  }
}

// Lazy load development tools
if (import.meta.env.DEV) {
  log.logSystem('🔧 Development mode detected, loading dev tools...');

  import('./dev/index')
    .then(module => {
      debugMode = module['DebugMode']?.getInstance();
      devConsole = module['DeveloperConsole']?.getInstance();
      performanceProfiler = module['PerformanceProfiler']?.getInstance();

      // Set up keyboard shortcuts
      setupDevKeyboardShortcuts();

      log.logSystem('✅ Development tools loaded successfully');
    })
    .catch(error => {
      log.logError(error, '❌ Failed to load development tools');
    });

  // Hot reload support
  if (import.meta.hot) {
    import.meta.hot.accept('./dev/index', newModule => {
      if (newModule) {
        debugMode = newModule['DebugMode']?.getInstance();
        devConsole = newModule['DeveloperConsole']?.getInstance();
        performanceProfiler = newModule['PerformanceProfiler']?.getInstance();
        log.logSystem('🔄 Development tools reloaded');
      }
    });
  }
}

// Mobile-specific optimizations
function setupMobileOptimizations(): void {
  log.logSystem('🔧 Setting up mobile optimizations...');

  try {
    // Detect if we're on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (isMobile) {
      log.logSystem('📱 Mobile device detected, applying optimizations...');

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

      log.logSystem('✅ Mobile optimizations applied');
    }
  } catch (error) {
    log.logError(error, '❌ Failed to setup mobile optimizations');
  }
}
