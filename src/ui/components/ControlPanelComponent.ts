class EventListenerManager {
  private static listeners: Array<{ element: EventTarget; event: string; handler: EventListener }> =
    [];

  static addListener(element: EventTarget, event: string, handler: EventListener): void {
    element.addEventListener(event, handler);
    this.listeners.push({ element, event, handler });
  }

  static cleanup(): void {
    this.listeners.forEach(({ element, event, handler }) => {
      element?.removeEventListener?.(event, handler);
    });
    this.listeners = [];
  }
}

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => EventListenerManager.cleanup());
}
import { Button } from './Button';
import { ComponentFactory } from './ComponentFactory';
import { Panel, type PanelConfig } from './Panel';

export interface ControlPanelConfig {
  title?: string;
  onStart?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  onSpeedChange?: (speed: number) => void;
  onAutoSpawnToggle?: (enabled: boolean) => void;
}

/**
 * Enhanced Control Panel Component
 * Uses the new UI component library for consistent styling and accessibility
 */
export class ControlPanelComponent extends Panel {
  private controlConfig: ControlPanelConfig;
  private isRunning: boolean = false;
  private speed: number = 1;
  private autoSpawn: boolean = true;

  constructor(config: ControlPanelConfig = {}) {
    const panelConfig: PanelConfig = {
      title: config?.title || 'Simulation Controls',
      collapsible: true,
      className: 'control-panel',
    };

    super(panelConfig);
    this.controlConfig = config;
    this.setupControls();
  }

  private setupControls(): void {
    const content = this.getContent();

    // Create control sections
    this.createPlaybackControls(content);
    this.createSpeedControls(content);
    this.createOptionsControls(content);
  }

  private createPlaybackControls(container: HTMLElement): void {
    const section = document.createElement('div');
    section.className = 'control-section';
    section.innerHTML = '<h4>Playback</h4>';

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-group';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = 'var(--ui-space-sm)';
    buttonContainer.style.marginBottom = 'var(--ui-space-md)';

    // Start/Pause button
    const playPauseBtn = ComponentFactory.createButton(
      {
        text: this.isRunning ? 'Pause' : 'Start',
        variant: this.isRunning ? 'secondary' : 'primary',
        icon: this.isRunning ? '⏸️' : '▶️',
        onClick: () => this.togglePlayback(),
      },
      'control-play-pause'
    );

    // Reset button
    const resetBtn = ComponentFactory.createButton(
      {
        text: 'Reset',
        variant: 'danger',
        icon: '🔄',
        onClick: () => this.handleReset(),
      },
      'control-reset'
    );

    playPauseBtn.mount(buttonContainer);
    resetBtn.mount(buttonContainer);

    section.appendChild(buttonContainer);
    container.appendChild(section);
  }

  private createSpeedControls(container: HTMLElement): void {
    const section = document.createElement('div');
    section.className = 'control-section';
    section.innerHTML = '<h4>Speed</h4>';

    const speedContainer = document.createElement('div');
    speedContainer.style.display = 'flex';
    speedContainer.style.flexDirection = 'column';
    speedContainer.style.gap = 'var(--ui-space-sm)';
    speedContainer.style.marginBottom = 'var(--ui-space-md)';

    // Speed slider
    const speedSlider = document.createElement('input');
    speedSlider.type = 'range';
    speedSlider.min = '0.1';
    speedSlider.max = '5';
    speedSlider.step = '0.1';
    speedSlider.value = this.speed.toString();
    speedSlider.className = 'speed-slider';

    // Speed display
    const speedDisplay = document.createElement('div');
    speedDisplay.textContent = `Speed: ${this.speed}x`;
    speedDisplay.className = 'speed-display';

    speedSlider?.addEventListener('input', event => {
      try {
        const target = event.target as HTMLInputElement;
        this.speed = parseFloat(target?.value);
        speedDisplay.textContent = `Speed: ${this.speed}x`;

        if (this.controlConfig.onSpeedChange) {
          this.controlConfig.onSpeedChange(this.speed);
        }
      } catch (error) {
        console.error('Event listener error for input:', error);
      }
    });

    speedContainer.appendChild(speedDisplay);
    speedContainer.appendChild(speedSlider);

    section.appendChild(speedContainer);
    container.appendChild(section);
  }

  private createOptionsControls(container: HTMLElement): void {
    const section = document.createElement('div');
    section.className = 'control-section';
    section.innerHTML = '<h4>Options</h4>';

    const optionsContainer = document.createElement('div');
    optionsContainer.style.display = 'flex';
    optionsContainer.style.flexDirection = 'column';
    optionsContainer.style.gap = 'var(--ui-space-sm)';

    // Auto-spawn toggle
    const autoSpawnToggle = ComponentFactory.createToggle(
      {
        label: 'Auto-spawn organisms',
        variant: 'switch',
        checked: this.autoSpawn,
        onChange: checked => {
          try {
            this.autoSpawn = checked;
            if (this.controlConfig.onAutoSpawnToggle) {
              this.controlConfig.onAutoSpawnToggle(checked);
            }
          } catch (error) {
            console.error('Callback error:', error);
          }
        },
      },
      'control-auto-spawn'
    );

    autoSpawnToggle.mount(optionsContainer);

    section.appendChild(optionsContainer);
    container.appendChild(section);
  }

  private togglePlayback(): void {
    this.isRunning = !this.isRunning;

    // Update button
    const playPauseBtn = ComponentFactory.getComponent<Button>('control-play-pause');
    if (playPauseBtn) {
      playPauseBtn.updateConfig({
        text: this.isRunning ? 'Pause' : 'Start',
        variant: this.isRunning ? 'secondary' : 'primary',
        icon: this.isRunning ? '⏸️' : '▶️',
      });
    }

    // Trigger callback
    if (this.isRunning && this.controlConfig.onStart) {
      this.controlConfig.onStart();
    } else if (!this.isRunning && this.controlConfig.onPause) {
      this.controlConfig.onPause();
    }
  }

  private handleReset(): void {
    this.isRunning = false;

    // Update button
    const playPauseBtn = ComponentFactory.getComponent<Button>('control-play-pause');
    if (playPauseBtn) {
      playPauseBtn.updateConfig({
        text: 'Start',
        variant: 'primary',
        icon: '▶️',
      });
    }

    if (this.controlConfig.onReset) {
      this.controlConfig.onReset();
    }
  }

  /**
   * Update the running state from external sources
   */
  setRunning(running: boolean): void {
    if (this.isRunning !== running) {
      this.togglePlayback();
    }
  }

  /**
   * Get current speed
   */
  getSpeed(): number {
    return this.speed;
  }

  /**
   * Set speed programmatically
   */
  setSpeed(speed: number): void {
    this.speed = Math.max(0.1, Math.min(5, speed));

    const slider = this.element?.querySelector('.speed-slider') as HTMLInputElement;
    if (slider) {
      slider.value = this.speed.toString();
    }

    const display = this.element?.querySelector('.speed-display');
    if (display) {
      display.textContent = `Speed: ${this.speed}x`;
    }
  }
}
