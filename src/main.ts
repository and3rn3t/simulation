import './style.css';
import { OrganismSimulation } from './simulation';
import { ORGANISM_TYPES } from './organismTypes';

// Initialize the simulation
const canvas = document.getElementById('simulation-canvas') as HTMLCanvasElement;
const organismSelect = document.getElementById('organism-select') as HTMLSelectElement;
const speedSlider = document.getElementById('speed-slider') as HTMLInputElement;
const speedValue = document.getElementById('speed-value') as HTMLSpanElement;
const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;

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
  simulation.reset();
  canvas.classList.remove('running');
});

clearBtn.addEventListener('click', () => {
  simulation.clear();
  canvas.classList.remove('running');
});

organismSelect.addEventListener('change', () => {
  const selectedType = ORGANISM_TYPES[organismSelect.value];
  simulation.setOrganismType(selectedType);
});

speedSlider.addEventListener('input', () => {
  const speed = parseInt(speedSlider.value);
  simulation.setSpeed(speed);
  speedValue.textContent = `${speed}x`;
});

// Initialize
initializeSimulation();
