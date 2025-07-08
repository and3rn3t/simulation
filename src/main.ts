import './style.css';
import { OrganismSimulation } from './simulation';
import { ORGANISM_TYPES } from './organismTypes';
import { ACHIEVEMENTS } from './gameSystem';
import { PowerUpManager } from './powerups';
import { LeaderboardManager } from './leaderboard';
import { UnlockableOrganismManager } from './unlockables';
import { GameStateManager } from './utils/gameStateManager';
import { getRequiredElementById } from './utils/domHelpers';
import { 
  ErrorHandler, 
  ErrorSeverity, 
  DOMError, 
  ConfigurationError,
  initializeGlobalErrorHandlers,
  withErrorHandling 
} from './utils/errorHandler';

/**
 * Main entry point for the organism simulation game
 * Initializes the UI, game systems, and event handlers
 */

// Initialize global error handlers first
initializeGlobalErrorHandlers();

// Initialize DOM elements
let canvas: HTMLCanvasElement;
let organismSelect: HTMLSelectElement;
let speedSlider: HTMLInputElement;
let speedValue: HTMLSpanElement;
let populationLimitSlider: HTMLInputElement;
let populationLimitValue: HTMLSpanElement;
let startBtn: HTMLButtonElement;
let pauseBtn: HTMLButtonElement;
let resetBtn: HTMLButtonElement;
let clearBtn: HTMLButtonElement;
let startChallengeBtn: HTMLButtonElement;
let buyPowerUpButtons: NodeListOf<HTMLButtonElement>;

// Game system managers
let powerUpManager: PowerUpManager;
let leaderboardManager: LeaderboardManager;
let unlockableManager: UnlockableOrganismManager;
let gameStateManager: GameStateManager;
let simulation: OrganismSimulation;

/**
 * Initializes DOM elements with error handling
 */
function initializeDOMElements(): void {
  try {
    canvas = getRequiredElementById<HTMLCanvasElement>('simulation-canvas');
    organismSelect = getRequiredElementById<HTMLSelectElement>('organism-select');
    speedSlider = getRequiredElementById<HTMLInputElement>('speed-slider');
    speedValue = getRequiredElementById<HTMLSpanElement>('speed-value');
    populationLimitSlider = getRequiredElementById<HTMLInputElement>('population-limit');
    populationLimitValue = getRequiredElementById<HTMLSpanElement>('population-limit-value');
    startBtn = getRequiredElementById<HTMLButtonElement>('start-btn');
    pauseBtn = getRequiredElementById<HTMLButtonElement>('pause-btn');
    resetBtn = getRequiredElementById<HTMLButtonElement>('reset-btn');
    clearBtn = getRequiredElementById<HTMLButtonElement>('clear-btn');
    startChallengeBtn = getRequiredElementById<HTMLButtonElement>('start-challenge-btn');
    buyPowerUpButtons = document.querySelectorAll('.buy-powerup') as NodeListOf<HTMLButtonElement>;
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new DOMError('Failed to initialize DOM elements'),
      ErrorSeverity.CRITICAL,
      'DOM initialization'
    );
    throw error; // Re-throw to prevent invalid app state
  }
}

/**
 * Initializes game system managers with error handling
 */
function initializeGameSystems(): void {
  try {
    powerUpManager = new PowerUpManager();
    leaderboardManager = new LeaderboardManager();
    unlockableManager = new UnlockableOrganismManager();
    gameStateManager = new GameStateManager(powerUpManager, leaderboardManager, unlockableManager);
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new ConfigurationError('Failed to initialize game systems'),
      ErrorSeverity.CRITICAL,
      'Game systems initialization'
    );
    throw error; // Re-throw to prevent invalid app state
  }
}

/**
 * Initializes the simulation with the selected organism type
 */
function initializeSimulation(): void {
  try {
    const selectedType = ORGANISM_TYPES[organismSelect.value];
    if (!selectedType) {
      throw new ConfigurationError('Invalid organism type selected');
    }
    simulation = new OrganismSimulation(canvas, selectedType);
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new ConfigurationError('Failed to initialize simulation'),
      ErrorSeverity.CRITICAL,
      'Simulation initialization'
    );
    throw error; // Re-throw to prevent invalid app state
  }
}

/**
 * Sets up event listeners with error handling
 */
function setupEventListeners(): void {
  try {
    // Simulation control event listeners
    startBtn.addEventListener('click', withErrorHandling(() => {
      simulation.start();
      canvas.classList.add('running');
    }, 'Start button click'));

    pauseBtn.addEventListener('click', withErrorHandling(() => {
      simulation.pause();
      canvas.classList.remove('running');
    }, 'Pause button click'));

    resetBtn.addEventListener('click', withErrorHandling(() => {
      const finalStats = simulation.getStats();
      if (finalStats.population > 0) {
        handleGameOver(finalStats);
      }
      simulation.reset();
      canvas.classList.remove('running');
    }, 'Reset button click'));

    clearBtn.addEventListener('click', withErrorHandling(() => {
      simulation.clear();
      canvas.classList.remove('running');
    }, 'Clear button click'));

    // Organism selection event listener
    organismSelect.addEventListener('change', withErrorHandling(() => {
      const selectedId = organismSelect.value;
      
      // Check if it's a standard organism type
      if (ORGANISM_TYPES[selectedId]) {
        const selectedType = ORGANISM_TYPES[selectedId];
        simulation.setOrganismType(selectedType);
      } else {
        // Check if it's an unlockable organism
        const unlockableType = simulation.getOrganismTypeById(selectedId);
        if (unlockableType) {
          simulation.setOrganismType(unlockableType);
        }
      }
    }, 'Organism selection change'));

    // Speed control event listener
    speedSlider.addEventListener('input', withErrorHandling(() => {
      const speed = parseInt(speedSlider.value);
      simulation.setSpeed(speed);
      speedValue.textContent = `${speed}x`;
    }, 'Speed slider change'));

    // Population limit event listener
    populationLimitSlider.addEventListener('input', withErrorHandling(() => {
      const limit = parseInt(populationLimitSlider.value);
      simulation.setMaxPopulation(limit);
      populationLimitValue.textContent = limit.toString();
    }, 'Population limit slider change'));

    // Challenge button event listener
    startChallengeBtn.addEventListener('click', withErrorHandling(() => {
      simulation.startChallenge();
      updateChallengeUI();
    }, 'Start challenge button click'));

    // Power-up button event listeners
    buyPowerUpButtons.forEach(button => {
      button.addEventListener('click', withErrorHandling(() => {
        const powerUpType = button.getAttribute('data-powerup');
        if (powerUpType) {
          const success = powerUpManager.buyPowerUp(powerUpType);
          if (success) {
            console.log(`Purchased power-up: ${powerUpType}`);
            // Power-up effects would be handled by the PowerUpManager
          }
        }
      }, `Buy power-up button click: ${button.getAttribute('data-powerup')}`));
    });
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new DOMError('Failed to setup event listeners'),
      ErrorSeverity.CRITICAL,
      'Event listeners setup'
    );
    throw error; // Re-throw to prevent invalid app state
  }
}

/**
 * Initializes the game UI and displays initial data
 */
function initializeUI(): void {
  try {
    // Display achievements
    displayAchievements();
    
    // Display leaderboard
    leaderboardManager.updateLeaderboardDisplay();
    
    // Update high score display
    updateHighScoreDisplay();
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new DOMError('Failed to initialize UI'),
      ErrorSeverity.HIGH,
      'UI initialization'
    );
  }
}

/**
 * Displays achievements in the UI
 */
function displayAchievements(): void {
  try {
    const achievementsList = document.getElementById('achievements-list');
    if (achievementsList) {
      achievementsList.innerHTML = '';
      ACHIEVEMENTS.forEach(achievement => {
        const achievementDiv = document.createElement('div');
        achievementDiv.className = `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;
        achievementDiv.innerHTML = `
          <span class="achievement-icon">${achievement.icon}</span>
          <div class="achievement-info">
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-description">${achievement.description}</div>
            <div class="achievement-points">${achievement.points} pts</div>
          </div>
        `;
        achievementsList.appendChild(achievementDiv);
      });
    }
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new DOMError('Failed to display achievements'),
      ErrorSeverity.MEDIUM,
      'Achievements display'
    );
  }
}

/**
 * Updates the challenge UI display
 */
function updateChallengeUI(): void {
  try {
    const challengeDiv = document.getElementById('current-challenge');
    
    // This would need to be implemented based on the current challenge
    // For now, just show that a challenge is active
    if (challengeDiv) {
      challengeDiv.innerHTML = '<p>Challenge active! Check simulation stats for progress.</p>';
    }
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new DOMError('Failed to update challenge UI'),
      ErrorSeverity.MEDIUM,
      'Challenge UI update'
    );
  }
}

function updateHighScoreDisplay(): void {
  try {
    const highScoreElement = document.getElementById('high-score');
    if (highScoreElement) {
      highScoreElement.textContent = gameStateManager.getHighScore().toString();
    }
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new DOMError('Failed to update high score display'),
      ErrorSeverity.MEDIUM,
      'High score display update'
    );
  }
}

function updateGameSystems(): void {
  try {
    const stats = simulation.getStats();
    
    // Update power-up manager with current score
    powerUpManager.updateScore(stats.population);
    
    // Update power-ups (check for expired ones)
    powerUpManager.updatePowerUps();
    
    // Check for unlocks
    const newlyUnlocked = unlockableManager.checkUnlocks(ACHIEVEMENTS, stats.population, stats.population);
    
    // Show unlock notifications
    newlyUnlocked.forEach(organism => {
      unlockableManager.showUnlockNotification(organism);
    });
    
    // Update high score display
    updateHighScoreDisplay();
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error('Failed to update game systems'),
      ErrorSeverity.MEDIUM,
      'Game systems update'
    );
  }
}

// Add game over handler
function handleGameOver(finalStats: any): void {
  try {
    leaderboardManager.addEntry({
      score: finalStats.population,
      population: finalStats.population,
      generation: finalStats.generation,
      timeElapsed: finalStats.timeElapsed || 0
    });
    
    // Update leaderboard display
    leaderboardManager.updateLeaderboardDisplay();
    updateHighScoreDisplay();
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error('Failed to handle game over'),
      ErrorSeverity.MEDIUM,
      'Game over handling'
    );
  }
}

/**
 * Main application initialization with comprehensive error handling
 */
function initializeApplication(): void {
  try {
    // Initialize DOM elements
    initializeDOMElements();
    
    // Initialize game systems
    initializeGameSystems();
    
    // Initialize simulation
    initializeSimulation();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize UI
    initializeUI();
    
    // Start periodic game system updates
    setInterval(updateGameSystems, 1000);
    
    console.log('Organism simulation application initialized successfully');
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error('Failed to initialize application'),
      ErrorSeverity.CRITICAL,
      'Application initialization'
    );
    
    // Show a fallback error message if the application fails to initialize
    const errorMessage = 'Failed to initialize the simulation. Please refresh the page and try again.';
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ff4444;
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      z-index: 10000;
      font-family: Arial, sans-serif;
    `;
    errorDiv.innerHTML = `
      <h2>⚠️ Initialization Error</h2>
      <p>${errorMessage}</p>
      <button onclick="window.location.reload()" style="
        background: white;
        color: #ff4444;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
      ">Refresh Page</button>
    `;
    
    document.body.appendChild(errorDiv);
  }
}

// Initialize the application
initializeApplication();
