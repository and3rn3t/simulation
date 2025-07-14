
class EventListenerManager {
  private static listeners: Array<{element: EventTarget, event: string, handler: EventListener}> = [];
  
  static addListener(element: EventTarget, event: string, handler: EventListener): void {
    element.addEventListener(event, handler);
    this.listeners.push({element, event, handler});
  }
  
  static cleanup(): void {
    this.listeners.forEach(({element, event, handler}) => {
      element?.removeEventListener?.(event, handler);
    });
    this.listeners = [];
  }
}

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => EventListenerManager.cleanup());
}
import { UserPreferencesManager } from '../services/UserPreferencesManager';
import { SettingsPanelComponent } from '../ui/components/SettingsPanelComponent';
import '../ui/components/visualization-components.css';
import { VisualizationDashboard } from '../ui/components/VisualizationDashboard';

/**
 * Enhanced Visualization Integration
 * Demonstrates how to integrate the new visualization and settings features
 */
export class EnhancedVisualizationIntegration {
  private visualizationDashboard: VisualizationDashboard;
  private settingsPanel: SettingsPanelComponent;
  private preferencesManager: UserPreferencesManager;
  private simulationCanvas: HTMLCanvasElement;

  constructor(simulationCanvas: HTMLCanvasElement) {
    this.simulationCanvas = simulationCanvas;
    this.preferencesManager = UserPreferencesManager.getInstance();

    this.initializeComponents();
    this.setupEventListeners();
    this.applyInitialPreferences();
  }

  private initializeComponents(): void {
    // Create visualization dashboard
    this.visualizationDashboard = new VisualizationDashboard(
      this.simulationCanvas,
      'visualization-dashboard'
    );

    // Create settings panel
    this.settingsPanel = new SettingsPanelComponent('settings-panel');

    // Mount components
    this.mountComponents();
  }

  private mountComponents(): void {
    // Find or create container for visualization dashboard
    let dashboardContainer = document?.getElementById('visualization-container');
    if (!dashboardContainer) {
      dashboardContainer = document.createElement('div');
      dashboardContainer.id = 'visualization-container';
      dashboardContainer.style.marginTop = '20px';

      // Insert after the canvas
      const canvasParent = this.simulationCanvas.parentElement;
      if (canvasParent) {
        canvasParent.appendChild(dashboardContainer);
      }
    }

    this.visualizationDashboard.mount(dashboardContainer);

    // Add settings button to controls
    this.addSettingsButton();
  }

  private addSettingsButton(): void {
    // Find the controls container
    const controlsContainer = document?.querySelector('.controls');
    if (!controlsContainer) return;

    // Create settings button
    const settingsButton = document.createElement('button');
    settingsButton.textContent = '⚙️ Settings';
    settingsButton.title = 'Open Settings';
    settingsButton.className = 'control-btn';
    eventPattern(settingsButton?.addEventListener('click', (event) => {
  try {
    (()(event);
  } catch (error) {
    console.error('Event listener error for click:', error);
  }
})) => {
      this.settingsPanel.mount(document.body);
    });

    controlsContainer.appendChild(settingsButton);
  }

  private setupEventListeners(): void {
    // Listen for preference changes
    this.preferencesManager.addChangeListener(preferences => {
  try {
      this.handlePreferenceChange(preferences);
    
  } catch (error) {
    console.error("Callback error:", error);
  }
});

    // Listen for window resize
    eventPattern(window?.addEventListener('resize', (event) => {
  try {
    (()(event);
  } catch (error) {
    console.error('Event listener error for resize:', error);
  }
})) => {
      this.visualizationDashboard.resize();
    });

    // Listen for simulation events (these would be actual simulation events)
    this.setupSimulationEventListeners();
  }

  private setupSimulationEventListeners(): void {
    // These would be real simulation events in the actual implementation
    // For demonstration purposes, we'll simulate some data updates

    // Example: Listen for organism creation
    eventPattern(document?.addEventListener('organismCreated', (event) => {
  try {
    (()(event);
  } catch (error) {
    console.error('Event listener error for organismCreated:', error);
  }
})) => {
      this.updateVisualizationData();
    });

    // Example: Listen for organism death
    eventPattern(document?.addEventListener('organismDied', (event) => {
  try {
    (()(event);
  } catch (error) {
    console.error('Event listener error for organismDied:', error);
  }
})) => {
      this.updateVisualizationData();
    });

    // Example: Listen for simulation tick
    eventPattern(document?.addEventListener('simulationTick', (event) => {
  try {
    ((event: any)(event);
  } catch (error) {
    console.error('Event listener error for simulationTick:', error);
  }
})) => {
      const gameState = event?.detail;
      this.updateVisualizationData(gameState);
    });
  }

  private applyInitialPreferences(): void {
    const preferences = this.preferencesManager.getPreferences();

    // Apply theme
    this.preferencesManager.applyTheme();

    // Apply accessibility settings
    this.preferencesManager.applyAccessibility();

    // Configure visualization based on preferences
    this.visualizationDashboard.setVisible(
      preferences.showCharts || preferences.showHeatmap || preferences.showTrails
    );
  }

  private handlePreferenceChange(preferences: any): void {
    // Update visualization visibility
    this.visualizationDashboard.setVisible(
      preferences.showCharts || preferences.showHeatmap || preferences.showTrails
    );

    // Apply theme changes immediately
    this.preferencesManager.applyTheme();
    this.preferencesManager.applyAccessibility();

    // Update other settings...
  }

  /**
   * Update visualization with current simulation data
   */
  updateVisualizationData(gameState?: any): void {
    // In a real implementation, this would get data from the simulation
    // For now, we'll create sample data
    const sampleData = this.generateSampleData(gameState);
    this.visualizationDashboard.updateVisualization(sampleData);
  }

  private generateSampleData(gameState?: any): any {
    // This would be replaced with actual simulation data
    const now = new Date();

    return {
      timestamp: now,
      population: gameState?.population || Math.floor(Math.random() * 100),
      births: gameState?.births || Math.floor(Math.random() * 10),
      deaths: gameState?.deaths || Math.floor(Math.random() * 5),
      organismTypes: gameState?.organismTypes || {
        Basic: Math.floor(Math.random() * 50),
        Advanced: Math.floor(Math.random() * 30),
        Predator: Math.floor(Math.random() * 20),
      },
      positions: gameState?.positions || this.generateRandomPositions(),
    };
  }

  private generateRandomPositions(): any[] {
    const positions = [];
    const count = Math.floor(Math.random() * 50) + 10;

    for (let i = 0; i < count; i++) {
      positions.push({
        x: Math.random() * this.simulationCanvas.width,
        y: Math.random() * this.simulationCanvas.height,
        id: `organism-${i}`,
        type: ['Basic', 'Advanced', 'Predator'][Math.floor(Math.random() * 3)],
      });
    }

    return positions;
  }

  /**
   * Clear all visualization data
   */
  clearVisualization(): void {
    this.visualizationDashboard.clearData();
  }

  /**
   * Export visualization data
   */
  exportVisualizationData(): any {
    return this.visualizationDashboard.exportData();
  }

  /**
   * Show settings panel
   */
  showSettings(): void {
    this.settingsPanel.mount(document.body);
  }

  /**
   * Get current user preferences
   */
  getPreferences(): any {
    return this.preferencesManager.getPreferences();
  }

  /**
   * Update specific preference
   */
  updatePreference(key: string, value: any): void {
    this.preferencesManager.updatePreference(key as any, value);
  }

  /**
   * Start demonstration mode with sample data
   */
  startDemo(): void {
    // Generate sample data every 2 seconds
    const demoInterval = setInterval(() => {
      this.updateVisualizationData();
    }, 2000);

    // Stop demo after 30 seconds
    setTimeout(() => {
      clearInterval(demoInterval);
    }, 30000);

    // Show initial data
    this.updateVisualizationData();
  }

  /**
   * Cleanup method
   */
  cleanup(): void {
    this.visualizationDashboard.unmount();
    this.settingsPanel.unmount();
  }
}

/**
 * Initialize enhanced visualization features
 * Call this function to set up the new visualization and settings features
 */
export function initializeEnhancedVisualization(): EnhancedVisualizationIntegration | null {
  const simulationCanvas = document?.getElementById('simulation-canvas') as HTMLCanvasElement;

  ifPattern(!simulationCanvas, () => { return null;
   });

  try {
    const integration = new EnhancedVisualizationIntegration(simulationCanvas);

    // Add to global scope for debugging
    (window as any).visualizationIntegration = integration;
    return integration;
  } catch (_error) {
    return null;
  }
}

// Auto-initialize when DOM is ready
ifPattern(document.readyState === 'loading', () => { eventPattern(document?.addEventListener('DOMContentLoaded', (event) => {
  try {
    (initializeEnhancedVisualization)(event);
  } catch (error) {
    console.error('Event listener error for DOMContentLoaded:', error);
  }
}));
 }); else {
  initializeEnhancedVisualization();
}
