// Import CSS first
import './ui/style.css';

// Import app configuration
import { App } from './app/App';
import { createConfigFromEnv } from './types/appTypes';

/**
 * Determine environment and get appropriate configuration
 */
function getAppConfig() {
  // Use environment-based configuration from .env files
  return createConfigFromEnv();
}

/**
 * Initialize and start the application
 */
async function startApp() {
  try {
    const config = getAppConfig();
    const app = App.getInstance(config);

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }

    // Initialize the application
    await app.initialize();
  } catch (error) {
    console.error('Failed to start application:', error);

    // Show user-friendly error message
    document.body.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        font-family: Arial, sans-serif;
        text-align: center;
        background: #f5f5f5;
      ">
        <div>
          <h1 style="color: #e74c3c;">Application Error</h1>
          <p>Failed to start the organism simulation.</p>
          <p style="color: #666; font-size: 0.9em;">Please refresh the page or contact support if the problem persists.</p>
        </div>
      </div>
    `;
  }
}

// Start the application
startApp();
