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

// Initialize global error handlers first
initializeGlobalErrorHandlers();

// Initialize components
const memoryPanelComponent = new MemoryPanelComponent();

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
  const canvas = document.getElementById('simulation-canvas') as HTMLCanvasElement;
  const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
  const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
  const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
  const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
  const statsPanel = document.getElementById('stats-panel');

  if (canvas) {
    console.log('✅ Canvas found');
    // Make canvas interactive
    canvas.style.cursor = 'crosshair';
    canvas.addEventListener('click', event => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      console.log('🖱️ Canvas clicked at:', x, y);

      // Simple visual feedback - draw a small circle
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        console.log('✨ Drew organism at click position');
      }
    });
  } else {
    console.error('❌ Canvas not found');
  }

  if (startBtn) {
    console.log('✅ Start button found');
    startBtn.addEventListener('click', () => {
      console.log('▶️ Start button clicked');
      startBtn.textContent = 'Running...';
      startBtn.disabled = true;
      if (pauseBtn) pauseBtn.disabled = false;
    });
  }

  if (pauseBtn) {
    console.log('✅ Pause button found');
    pauseBtn.addEventListener('click', () => {
      console.log('⏸️ Pause button clicked');
      pauseBtn.disabled = true;
      if (startBtn) {
        startBtn.textContent = 'Start';
        startBtn.disabled = false;
      }
    });
  }

  if (resetBtn) {
    console.log('✅ Reset button found');
    resetBtn.addEventListener('click', () => {
      console.log('🔄 Reset button clicked');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          console.log('🧹 Canvas cleared');
        }
      }
      if (startBtn) {
        startBtn.textContent = 'Start';
        startBtn.disabled = false;
      }
      if (pauseBtn) pauseBtn.disabled = true;
    });
  }

  if (clearBtn) {
    console.log('✅ Clear button found');
    clearBtn.addEventListener('click', () => {
      console.log('🗑️ Clear button clicked');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          console.log('🧹 Canvas cleared');
        }
      }
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
    const populationLimit = document.getElementById('population-limit') as HTMLInputElement;
    const populationLimitValue = document.getElementById(
      'population-limit-value'
    ) as HTMLSpanElement;
    const organismSelect = document.getElementById('organism-select') as HTMLSelectElement;

    if (speedSlider && speedValue) {
      speedSlider.addEventListener('input', () => {
        speedValue.textContent = `${speedSlider.value}x`;
        console.log('🏃 Speed changed to:', speedSlider.value);
      });
      console.log('✅ Speed control initialized');
    }

    if (populationLimit && populationLimitValue) {
      populationLimit.addEventListener('input', () => {
        populationLimitValue.textContent = populationLimit.value;
        console.log('👥 Population limit changed to:', populationLimit.value);
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
