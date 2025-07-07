import './style.css';
import { OrganismSimulation } from './simulation';
import { ORGANISM_TYPES } from './organismTypes';
import { ACHIEVEMENTS } from './gameSystem';
import { PowerUpManager } from './powerups';
import { LeaderboardManager } from './leaderboard';
import { UnlockableOrganismManager } from './unlockables';

// Initialize the simulation
const canvas = document.getElementById('simulation-canvas') as HTMLCanvasElement;
const organismSelect = document.getElementById('organism-select') as HTMLSelectElement;
const speedSlider = document.getElementById('speed-slider') as HTMLInputElement;
const speedValue = document.getElementById('speed-value') as HTMLSpanElement;
const populationLimitSlider = document.getElementById('population-limit') as HTMLInputElement;
const populationLimitValue = document.getElementById('population-limit-value') as HTMLSpanElement;
const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;

// Game system elements
const startChallengeBtn = document.getElementById('start-challenge-btn') as HTMLButtonElement;
const buyPowerUpButtons = document.querySelectorAll('.buy-powerup') as NodeListOf<HTMLButtonElement>;

// Initialize game systems
const powerUpManager = new PowerUpManager();
const leaderboardManager = new LeaderboardManager();
const unlockableManager = new UnlockableOrganismManager();

let simulation: OrganismSimulation;

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
function initializeUI() {
  // Display achievements
  displayAchievements();
  
  // Display leaderboard
  leaderboardManager.updateLeaderboardDisplay();
  
  // Update high score display
  updateHighScoreDisplay();
}

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
    highScoreElement.textContent = leaderboardManager.getHighScore().toString();
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
