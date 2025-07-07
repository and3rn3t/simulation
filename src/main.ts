import './style.css';
import { OrganismSimulation } from './simulation';
import { ORGANISM_TYPES } from './organismTypes';
import { ACHIEVEMENTS } from './gameSystem';
import { PowerUpManager } from './powerups';
import { LeaderboardManager } from './leaderboard';
import { UnlockableOrganismManager } from './unlockables';
import { GameStateManager } from './utils/gameStateManager';
import { getRequiredElementById } from './utils/domHelpers';

/**
 * Main entry point for the organism simulation game
 * Initializes the UI, game systems, and event handlers
 */

// Initialize DOM elements
const canvas = getRequiredElementById<HTMLCanvasElement>('simulation-canvas');
const organismSelect = getRequiredElementById<HTMLSelectElement>('organism-select');
const speedSlider = getRequiredElementById<HTMLInputElement>('speed-slider');
const speedValue = getRequiredElementById<HTMLSpanElement>('speed-value');
const populationLimitSlider = getRequiredElementById<HTMLInputElement>('population-limit');
const populationLimitValue = getRequiredElementById<HTMLSpanElement>('population-limit-value');
const startBtn = getRequiredElementById<HTMLButtonElement>('start-btn');
const pauseBtn = getRequiredElementById<HTMLButtonElement>('pause-btn');
const resetBtn = getRequiredElementById<HTMLButtonElement>('reset-btn');
const clearBtn = getRequiredElementById<HTMLButtonElement>('clear-btn');

// Game system elements
const startChallengeBtn = getRequiredElementById<HTMLButtonElement>('start-challenge-btn');
const buyPowerUpButtons = document.querySelectorAll('.buy-powerup') as NodeListOf<HTMLButtonElement>;

// Initialize game systems
const powerUpManager = new PowerUpManager();
const leaderboardManager = new LeaderboardManager();
const unlockableManager = new UnlockableOrganismManager();
const gameStateManager = new GameStateManager(powerUpManager, leaderboardManager, unlockableManager);

let simulation: OrganismSimulation;

/**
 * Initializes the simulation with the selected organism type
 */
function initializeSimulation() {
  const selectedType = ORGANISM_TYPES[organismSelect.value];
  simulation = new OrganismSimulation(canvas, selectedType);
}

// Event listeners
startBtn.addEventListener('click', () => {
  simulation.start();
  canvas.classList.add('running');
});

pauseBtn.addEventListener('click', () => {
  simulation.pause();
  canvas.classList.remove('running');
});

resetBtn.addEventListener('click', () => {
  const finalStats = simulation.getStats();
  if (finalStats.population > 0) {
    handleGameOver(finalStats);
  }
  simulation.reset();
  canvas.classList.remove('running');
});

clearBtn.addEventListener('click', () => {
  simulation.clear();
  canvas.classList.remove('running');
});

organismSelect.addEventListener('change', () => {
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
});

speedSlider.addEventListener('input', () => {
  const speed = parseInt(speedSlider.value);
  simulation.setSpeed(speed);
  speedValue.textContent = `${speed}x`;
});

populationLimitSlider.addEventListener('input', () => {
  const limit = parseInt(populationLimitSlider.value);
  simulation.setMaxPopulation(limit);
  populationLimitValue.textContent = limit.toString();
});

// Challenge button event listener
startChallengeBtn.addEventListener('click', () => {
  simulation.startChallenge();
  updateChallengeUI();
});

// Power-up button event listeners
buyPowerUpButtons.forEach(button => {
  button.addEventListener('click', () => {
    const powerUpType = button.getAttribute('data-powerup');
    if (powerUpType) {
      const success = powerUpManager.buyPowerUp(powerUpType);
      if (success) {
        console.log(`Purchased power-up: ${powerUpType}`);
        // Power-up effects would be handled by the PowerUpManager
      }
    }
  });
});

// Initialize UI
/**
 * Initializes the game UI and displays initial data
 */
function initializeUI() {
  // Display achievements
  displayAchievements();
  
  // Display leaderboard
  leaderboardManager.updateLeaderboardDisplay();
  
  // Update high score display
  updateHighScoreDisplay();
}

/**
 * Displays achievements in the UI
 */
function displayAchievements() {
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
}

/**
 * Updates the challenge UI display
 */
function updateChallengeUI() {
  const challengeDiv = document.getElementById('current-challenge');
  
  // This would need to be implemented based on the current challenge
  // For now, just show that a challenge is active
  if (challengeDiv) {
    challengeDiv.innerHTML = '<p>Challenge active! Check simulation stats for progress.</p>';
  }
}

function updateHighScoreDisplay() {
  const highScoreElement = document.getElementById('high-score');
  if (highScoreElement) {
    highScoreElement.textContent = gameStateManager.getHighScore().toString();
  }
}

function updateGameSystems() {
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
}

// Add periodic updates for game systems
setInterval(updateGameSystems, 1000);

// Add game over handler
function handleGameOver(finalStats: any) {
  leaderboardManager.addEntry({
    score: finalStats.population,
    population: finalStats.population,
    generation: finalStats.generation,
    timeElapsed: finalStats.timeElapsed || 0
  });
  
  // Update leaderboard display
  leaderboardManager.updateLeaderboardDisplay();
  updateHighScoreDisplay();
}

// Initialize
initializeSimulation();
initializeUI();
