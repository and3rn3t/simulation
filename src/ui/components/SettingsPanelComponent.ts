
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
import { Modal } from './Modal';
import { ComponentFactory } from './ComponentFactory';
import { UserPreferencesManager, UserPreferences } from '../../services/UserPreferencesManager';

/**
 * Settings Panel Component
 * Comprehensive settings interface for all user preferences
 */
export class SettingsPanelComponent extends Modal {
  private preferencesManager: UserPreferencesManager;
  private tempPreferences: UserPreferences;

  constructor(id?: string) {
    super({
      title: 'Settings & Preferences',
      size: 'large',
      closable: true,
      onClose: () => this.handleCancel(),
    });

    if (id) this.element.id = id;

    this.preferencesManager = UserPreferencesManager.getInstance();
    this.tempPreferences = this.preferencesManager.getPreferences();

    this.createSettingsContent();
  }

  private createSettingsContent(): void {
    const container = document.createElement('div');
    container.className = 'settings-container';

    // Create tabs
    const tabContainer = this.createTabs();
    container.appendChild(tabContainer);

    // Create tab content
    const contentContainer = document.createElement('div');
    contentContainer.className = 'settings-content';

    // Tab panels
    contentContainer.appendChild(this.createGeneralPanel());
    contentContainer.appendChild(this.createThemePanel());
    contentContainer.appendChild(this.createVisualizationPanel());
    contentContainer.appendChild(this.createPerformancePanel());
    contentContainer.appendChild(this.createAccessibilityPanel());
    contentContainer.appendChild(this.createNotificationsPanel());
    contentContainer.appendChild(this.createPrivacyPanel());

    container.appendChild(contentContainer);

    // Action buttons
    const actionsContainer = this.createActionButtons();
    container.appendChild(actionsContainer);

    this.addContent(container);
  }

  private createTabs(): HTMLElement {
    const tabContainer = document.createElement('div');
    tabContainer.className = 'settings-tabs';

    const tabs = [
      { id: 'general', label: 'General', icon: '⚙️' },
      { id: 'theme', label: 'Theme', icon: '🎨' },
      { id: 'visualization', label: 'Visualization', icon: '📊' },
      { id: 'performance', label: 'Performance', icon: '🚀' },
      { id: 'accessibility', label: 'Accessibility', icon: '♿' },
      { id: 'notifications', label: 'Notifications', icon: '🔔' },
      { id: 'privacy', label: 'Privacy', icon: '🔒' },
    ];

    tabs.forEach((tab, index) => {
      const tabButton = ComponentFactory.createButton(
        {
          text: `${tab.icon} ${tab.label}`,
          variant: index === 0 ? 'primary' : 'secondary',
          onClick: () => this.switchTab(tab.id),
        },
        `settings-tab-${tab.id}`
      );

      tabButton.mount(tabContainer);
    });

    return tabContainer;
  }

  private switchTab(tabId: string): void {
    try {
      // Update tab buttons
      const tabs = this.element.querySelectorAll('[id^="settings-tab-"]');
      tabs.forEach(tab => {
        try {
          const button = tab?.querySelector('button');
          if (button) {
            button.className = button.className.replace('ui-button--primary', 'ui-button--secondary');
          }
        } catch (error) {
          console.error('Tab button update error:', error);
        }
      });

      const activeTab = this.element?.querySelector(`#settings-tab-${tabId} button`);
      if (activeTab) {
        activeTab.className = activeTab.className.replace(
          'ui-button--secondary',
          'ui-button--primary'
        );
      }

      // Show/hide panels
      const panels = this.element.querySelectorAll('.settings-panel');
      panels.forEach(panel => {
        try {
          (panel as HTMLElement).style.display = 'none';
        } catch (error) {
          console.error('Panel hide error:', error);
        }
      });

      const activePanel = this.element?.querySelector(`#${tabId}-panel`);
      if (activePanel) {
        (activePanel as HTMLElement).style.display = 'block';
      }
    } catch (error) {
      console.error('Switch tab error:', error);
    }
  }

  private createGeneralPanel(): HTMLElement {
    try {
      const panel = document.createElement('div');
      panel.id = 'general-panel';
      panel.className = 'settings-panel';

      const form = document.createElement('form');
      form.className = 'settings-form';

      // Language selection
      const languageSection = document.createElement('div');
      languageSection.className = 'settings-section';
      languageSection.innerHTML = '<h3>Language & Localization</h3>';

      const languageSelect = document.createElement('select');
      languageSelect.className = 'ui-select';
      this.preferencesManager.getAvailableLanguages().forEach(lang => {
        try {
          const option = document.createElement('option');
          option.value = lang.code;
          option.textContent = lang.name;
          option.selected = lang.code === this.tempPreferences.language;
          languageSelect.appendChild(option);
        } catch (error) {
          console.error('Language option creation error:', error);
        }
      });

      languageSelect?.addEventListener('change', (event) => {
        try {
          this.tempPreferences.language = (event.target as HTMLSelectElement).value;
        } catch (error) {
          console.error('Language change error:', error);
        }
      });

      languageSection.appendChild(this.createFieldWrapper('Language', languageSelect));

      // Date format
      const dateFormatSelect = document.createElement('select');
      dateFormatSelect.className = 'ui-select';
      ['US', 'EU', 'ISO'].forEach(format => {
        try {
          const option = document.createElement('option');
          option.value = format;
          option.textContent = format;
          option.selected = format === this.tempPreferences.dateFormat;
          dateFormatSelect.appendChild(option);
        } catch (error) {
          console.error('Date format option creation error:', error);
        }
      });

      dateFormatSelect?.addEventListener('change', (event) => {
        try {
          this.tempPreferences.dateFormat = (event.target as HTMLSelectElement).value;
        } catch (error) {
          console.error('Date format change error:', error);
        }
      });

      languageSection.appendChild(this.createFieldWrapper('Date Format', dateFormatSelect));

    // Simulation defaults
    const simulationSection = document.createElement('div');
    simulationSection.className = 'settings-section';
    simulationSection.innerHTML = '<h3>Simulation Defaults</h3>';

    // Default speed
    const speedSlider = document.createElement('input');
    speedSlider.type = 'range';
    speedSlider.min = '0.1';
    speedSlider.max = '5';
    speedSlider.step = '0.1';
    speedSlider.value = this.tempPreferences.defaultSpeed.toString();
    speedSlider.className = 'ui-slider';

    const speedValue = document.createElement('span');
    speedValue.textContent = `${this.tempPreferences.defaultSpeed}x`;

    speedSlider?.addEventListener('input', (event) => {
      try {
        const value = parseFloat((event.target as HTMLInputElement).value);
        this.tempPreferences.defaultSpeed = value;
        speedValue.textContent = `${value}x`;
      } catch (error) {
        console.error('Speed slider change error:', error);
      }
    });

    const speedContainer = document.createElement('div');
    speedContainer.className = 'slider-container';
    speedContainer.appendChild(speedSlider);
    speedContainer.appendChild(speedValue);

    simulationSection.appendChild(this.createFieldWrapper('Default Speed', speedContainer));

    // Auto-save settings
    const autoSaveToggle = ComponentFactory.createToggle({
      label: 'Auto-save simulations',
      checked: this.tempPreferences.autoSave,
      onChange: checked => {
  try {
        this.tempPreferences.autoSave = checked;
      
  } catch (error) {
    console.error("Callback error:", error);
  }
},
    });

    autoSaveToggle.mount(simulationSection);

      form.appendChild(languageSection);
      form.appendChild(simulationSection);
      panel.appendChild(form);

      return panel;
    } catch (error) {
      console.error('Create general panel error:', error);
      return document.createElement('div');
    }
  }

  private createThemePanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.id = 'theme-panel';
    panel.className = 'settings-panel';
    panel.style.display = 'none';

    const form = document.createElement('form');
    form.className = 'settings-form';

    // Theme selection
    const themeSection = document.createElement('div');
    themeSection.className = 'settings-section';
    themeSection.innerHTML = '<h3>Theme Settings</h3>';

    const themeSelect = document.createElement('select');
    themeSelect.className = 'ui-select';
    [
      { value: 'auto', label: 'Auto (System)' },
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
    ].forEach(theme => {
  try {
      const option = document.createElement('option');
      option.value = theme.value;
      option.textContent = theme.label;
      option.selected = theme.value === this.tempPreferences.theme;
      themeSelect.appendChild(option);
    
  } catch (error) {
    console.error("Callback error:", error);
  }
});
    themeSelect?.addEventListener('change', (event) => {
      try {
        this.tempPreferences.theme = (event.target as HTMLSelectElement).value as any;
      } catch (error) {
        console.error('Theme change error:', error);
      }
    });

    themeSection.appendChild(this.createFieldWrapper('Theme', themeSelect));

    // Custom colors
    const colorsSection = document.createElement('div');
    colorsSection.className = 'settings-section';
    colorsSection.innerHTML = '<h3>Custom Colors</h3>';

    // Primary color
    const primaryColor = document.createElement('input');
    primaryColor.type = 'color';
    primaryColor.value = this.tempPreferences.customColors.primary;
    primaryColor.className = 'ui-color-picker';
    primaryColor?.addEventListener('change', (event) => {
      try {
        this.tempPreferences.customColors.primary = (event.target as HTMLInputElement).value;
      } catch (error) {
        console.error('Primary color change error:', error);
      }
    });

    colorsSection.appendChild(this.createFieldWrapper('Primary Color', primaryColor));

    // Secondary color
    const secondaryColor = document.createElement('input');
    secondaryColor.type = 'color';
    secondaryColor.value = this.tempPreferences.customColors.secondary;
    secondaryColor.className = 'ui-color-picker';
    secondaryColor?.addEventListener('change', (event) => {
      try {
        this.tempPreferences.customColors.secondary = (event.target as HTMLInputElement).value;
      } catch (error) {
        console.error('Secondary color change error:', error);
      }
    });

    colorsSection.appendChild(this.createFieldWrapper('Secondary Color', secondaryColor));

    // Accent color
    const accentColor = document.createElement('input');
    accentColor.type = 'color';
    accentColor.value = this.tempPreferences.customColors.accent;
    accentColor.className = 'ui-color-picker';
    accentColor?.addEventListener('change', (event) => {
      try {
        this.tempPreferences.customColors.accent = (event.target as HTMLInputElement).value;
      } catch (error) {
        console.error('Accent color change error:', error);
      }
    });

    colorsSection.appendChild(this.createFieldWrapper('Accent Color', accentColor));

    form.appendChild(themeSection);
    form.appendChild(colorsSection);
    panel.appendChild(form);

    return panel;
  }

  private createVisualizationPanel(): HTMLElement  { try { const panel = document.createElement('div');
    panel.id = 'visualization-panel';
    panel.className = 'settings-panel';
    panel.style.display = 'none';

    const form = document.createElement('form');
    form.className = 'settings-form';

    const section = document.createElement('div');
    section.className = 'settings-section';
    section.innerHTML = '<h3>Visualization Options</h3>';

    // Show trails
    const trailsToggle = ComponentFactory.createToggle({
      label: 'Show organism trails',
      checked: this.tempPreferences.showTrails,
      onChange: checked => {
  try {
        this.tempPreferences.showTrails = checked;
      
   } catch (error) { /* handled */ } }
},
    });
    trailsToggle.mount(section);

    // Show heatmap
    const heatmapToggle = ComponentFactory.createToggle({
      label: 'Show population heatmap',
      checked: this.tempPreferences.showHeatmap,
      onChange: checked => {
  try {
        this.tempPreferences.showHeatmap = checked;
      
  } catch (error) {
    console.error("Callback error:", error);
  }
},
    });
    heatmapToggle.mount(section);

    // Show charts
    const chartsToggle = ComponentFactory.createToggle({
      label: 'Show data charts',
      checked: this.tempPreferences.showCharts,
      onChange: checked => {
  try {
        this.tempPreferences.showCharts = checked;
      
  } catch (error) {
    console.error("Callback error:", error);
  }
},
    });
    chartsToggle.mount(section);

    // Chart update interval
    const intervalSlider = document.createElement('input');
    intervalSlider.type = 'range';
    intervalSlider.min = '500';
    intervalSlider.max = '5000';
    intervalSlider.step = '100';
    intervalSlider.value = this.tempPreferences.chartUpdateInterval.toString();
    intervalSlider.className = 'ui-slider';

    const intervalValue = document.createElement('span');
    intervalValue.textContent = `${this.tempPreferences.chartUpdateInterval}ms`;

    eventPattern(intervalSlider?.addEventListener('input', (event) => {
  try {
    (e => {
      const value = parseInt(e.target as HTMLInputElement) => {
  } catch (error) {
    console.error('Event listener error for input:', error);
  }
})).value);
      this.tempPreferences.chartUpdateInterval = value;
      intervalValue.textContent = `${value}ms`;
    });

    const intervalContainer = document.createElement('div');
    intervalContainer.className = 'slider-container';
    intervalContainer.appendChild(intervalSlider);
    intervalContainer.appendChild(intervalValue);

    section.appendChild(this.createFieldWrapper('Chart Update Interval', intervalContainer));

    form.appendChild(section);
    panel.appendChild(form);

    return panel;
  }

  private createPerformancePanel(): HTMLElement  { try { const panel = document.createElement('div');
    panel.id = 'performance-panel';
    panel.className = 'settings-panel';
    panel.style.display = 'none';

    const form = document.createElement('form');
    form.className = 'settings-form';

    const section = document.createElement('div');
    section.className = 'settings-section';
    section.innerHTML = '<h3>Performance Settings</h3>';

    // Max organisms
    const maxOrganismsSlider = document.createElement('input');
    maxOrganismsSlider.type = 'range';
    maxOrganismsSlider.min = '100';
    maxOrganismsSlider.max = '5000';
    maxOrganismsSlider.step = '50';
    maxOrganismsSlider.value = this.tempPreferences.maxOrganisms.toString();
    maxOrganismsSlider.className = 'ui-slider';

    const maxOrganismsValue = document.createElement('span');
    maxOrganismsValue.textContent = this.tempPreferences.maxOrganisms.toString();

    eventPattern(maxOrganismsSlider?.addEventListener('input', (event) => {
  try {
    (e => {
      const value = parseInt(e.target as HTMLInputElement) => {
   } catch (error) { /* handled */ } }
})).value);
      this.tempPreferences.maxOrganisms = value;
      maxOrganismsValue.textContent = value.toString();
    });

    const maxOrganismsContainer = document.createElement('div');
    maxOrganismsContainer.className = 'slider-container';
    maxOrganismsContainer.appendChild(maxOrganismsSlider);
    maxOrganismsContainer.appendChild(maxOrganismsValue);

    section.appendChild(this.createFieldWrapper('Max Organisms', maxOrganismsContainer));

    // Render quality
    const qualitySelect = document.createElement('select');
    qualitySelect.className = 'ui-select';
    ['low', 'medium', 'high'].forEach(quality => {
  try {
      const option = document.createElement('option');
      option.value = quality;
      option.textContent = quality.charAt(0).toUpperCase() + quality.slice(1);
      option.selected = quality === this.tempPreferences.renderQuality;
      qualitySelect.appendChild(option);
    
  } catch (error) {
    console.error("Callback error:", error);
  }
});
    eventPattern(qualitySelect?.addEventListener('change', (event) => {
  try {
    (e => {
      this.tempPreferences.renderQuality = (e.target as HTMLSelectElement)(event);
  } catch (error) {
    console.error('Event listener error for change:', error);
  }
})).value as any;
    });

    section.appendChild(this.createFieldWrapper('Render Quality', qualitySelect));

    // Enable particle effects
    const particleToggle = ComponentFactory.createToggle({
      label: 'Enable particle effects',
      checked: this.tempPreferences.enableParticleEffects,
      onChange: checked => {
  try {
        this.tempPreferences.enableParticleEffects = checked;
      
  } catch (error) {
    console.error("Callback error:", error);
  }
},
    });
    particleToggle.mount(section);

    form.appendChild(section);
    panel.appendChild(form);

    return panel;
  }

  private createAccessibilityPanel(): HTMLElement  { try { const panel = document.createElement('div');
    panel.id = 'accessibility-panel';
    panel.className = 'settings-panel';
    panel.style.display = 'none';

    const form = document.createElement('form');
    form.className = 'settings-form';

    const section = document.createElement('div');
    section.className = 'settings-section';
    section.innerHTML = '<h3>Accessibility Options</h3>';

    // Reduced motion
    const motionToggle = ComponentFactory.createToggle({
      label: 'Reduce animations',
      checked: this.tempPreferences.reducedMotion,
      onChange: checked => {
  try {
        this.tempPreferences.reducedMotion = checked;
      
   } catch (error) { /* handled */ } }
},
    });
    motionToggle.mount(section);

    // High contrast
    const contrastToggle = ComponentFactory.createToggle({
      label: 'High contrast mode',
      checked: this.tempPreferences.highContrast,
      onChange: checked => {
  try {
        this.tempPreferences.highContrast = checked;
      
  } catch (error) {
    console.error("Callback error:", error);
  }
},
    });
    contrastToggle.mount(section);

    // Font size
    const fontSizeSelect = document.createElement('select');
    fontSizeSelect.className = 'ui-select';
    ['small', 'medium', 'large'].forEach(size => {
  try {
      const option = document.createElement('option');
      option.value = size;
      option.textContent = size.charAt(0).toUpperCase() + size.slice(1);
      option.selected = size === this.tempPreferences.fontSize;
      fontSizeSelect.appendChild(option);
    
  } catch (error) {
    console.error("Callback error:", error);
  }
});
    eventPattern(fontSizeSelect?.addEventListener('change', (event) => {
  try {
    (e => {
      this.tempPreferences.fontSize = (e.target as HTMLSelectElement)(event);
  } catch (error) {
    console.error('Event listener error for change:', error);
  }
})).value as any;
    });

    section.appendChild(this.createFieldWrapper('Font Size', fontSizeSelect));

    // Screen reader mode
    const screenReaderToggle = ComponentFactory.createToggle({
      label: 'Screen reader optimizations',
      checked: this.tempPreferences.screenReaderMode,
      onChange: checked => {
  try {
        this.tempPreferences.screenReaderMode = checked;
      
  } catch (error) {
    console.error("Callback error:", error);
  }
},
    });
    screenReaderToggle.mount(section);

    form.appendChild(section);
    panel.appendChild(form);

    return panel;
  }

  private createNotificationsPanel(): HTMLElement  { try { const panel = document.createElement('div');
    panel.id = 'notifications-panel';
    panel.className = 'settings-panel';
    panel.style.display = 'none';

    const form = document.createElement('form');
    form.className = 'settings-form';

    const section = document.createElement('div');
    section.className = 'settings-section';
    section.innerHTML = '<h3>Notification Settings</h3>';

    // Sound enabled
    const soundToggle = ComponentFactory.createToggle({
      label: 'Enable sound effects',
      checked: this.tempPreferences.soundEnabled,
      onChange: checked => {
  try {
        this.tempPreferences.soundEnabled = checked;
      
   } catch (error) { /* handled */ } }
},
    });
    soundToggle.mount(section);

    // Sound volume
    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.min = '0';
    volumeSlider.max = '1';
    volumeSlider.step = '0.1';
    volumeSlider.value = this.tempPreferences.soundVolume.toString();
    volumeSlider.className = 'ui-slider';

    const volumeValue = document.createElement('span');
    volumeValue.textContent = `${Math.round(this.tempPreferences.soundVolume * 100)}%`;

    eventPattern(volumeSlider?.addEventListener('input', (event) => {
  try {
    (e => {
      const value = parseFloat(e.target as HTMLInputElement) => {
  } catch (error) {
    console.error('Event listener error for input:', error);
  }
})).value);
      this.tempPreferences.soundVolume = value;
      volumeValue.textContent = `${Math.round(value * 100)}%`;
    });

    const volumeContainer = document.createElement('div');
    volumeContainer.className = 'slider-container';
    volumeContainer.appendChild(volumeSlider);
    volumeContainer.appendChild(volumeValue);

    section.appendChild(this.createFieldWrapper('Sound Volume', volumeContainer));

    // Notification types
    const notificationTypes = [
      { key: 'achievements', label: 'Achievement notifications' },
      { key: 'milestones', label: 'Milestone notifications' },
      { key: 'warnings', label: 'Warning notifications' },
      { key: 'errors', label: 'Error notifications' },
    ];

    notificationTypes.forEach(type => {
  try {
      const toggle = ComponentFactory.createToggle({
        label: type.label,
        checked: (this.tempPreferences.notificationTypes as any)[type.key],
        onChange: checked => {
          (this.tempPreferences.notificationTypes as any)[type.key] = checked;
        
  } catch (error) {
    console.error("Callback error:", error);
  }
},
      });
      toggle.mount(section);
    });

    form.appendChild(section);
    panel.appendChild(form);

    return panel;
  }

  private createPrivacyPanel(): HTMLElement  { try { const panel = document.createElement('div');
    panel.id = 'privacy-panel';
    panel.className = 'settings-panel';
    panel.style.display = 'none';

    const form = document.createElement('form');
    form.className = 'settings-form';

    const section = document.createElement('div');
    section.className = 'settings-section';
    section.innerHTML = '<h3>Privacy Settings</h3>';

    // Analytics enabled
    const analyticsToggle = ComponentFactory.createToggle({
      label: 'Enable analytics',
      checked: this.tempPreferences.analyticsEnabled,
      onChange: checked => {
  try {
        this.tempPreferences.analyticsEnabled = checked;
      
   } catch (error) { /* handled */ } }
},
    });
    analyticsToggle.mount(section);

    // Data collection
    const dataToggle = ComponentFactory.createToggle({
      label: 'Allow data collection',
      checked: this.tempPreferences.dataCollection,
      onChange: checked => {
  try {
        this.tempPreferences.dataCollection = checked;
      
  } catch (error) {
    console.error("Callback error:", error);
  }
},
    });
    dataToggle.mount(section);

    // Share usage data
    const shareToggle = ComponentFactory.createToggle({
      label: 'Share usage data',
      checked: this.tempPreferences.shareUsageData,
      onChange: checked => {
  try {
        this.tempPreferences.shareUsageData = checked;
      
  } catch (error) {
    console.error("Callback error:", error);
  }
},
    });
    shareToggle.mount(section);

    form.appendChild(section);
    panel.appendChild(form);

    return panel;
  }

  private createActionButtons(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'settings-actions';

    // Reset to defaults
    const resetButton = ComponentFactory.createButton({
      text: 'Reset to Defaults',
      variant: 'secondary',
      onClick: () => this.handleReset(),
    });

    // Cancel
    const cancelButton = ComponentFactory.createButton({
      text: 'Cancel',
      variant: 'secondary',
      onClick: () => this.handleCancel(),
    });

    // Save
    const saveButton = ComponentFactory.createButton({
      text: 'Save Changes',
      variant: 'primary',
      onClick: () => this.handleSave(),
    });

    resetButton.mount(container);
    cancelButton.mount(container);
    saveButton.mount(container);

    return container;
  }

  private createFieldWrapper(label: string, input: HTMLElement): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'field-wrapper';

    const labelElement = document.createElement('label');
    labelElement.textContent = label;
    labelElement.className = 'field-label';

    wrapper.appendChild(labelElement);
    wrapper.appendChild(input);

    return wrapper;
  }

  private handleSave(): void {
    this.preferencesManager.updatePreferences(this.tempPreferences);
    this.preferencesManager.applyAll();
    this.close();
  }

  private handleCancel(): void {
    this.tempPreferences = this.preferencesManager.getPreferences();
    this.close();
  }

  private handleReset(): void {
    const confirmModal = ComponentFactory.createModal({
      title: 'Reset Settings',
      size: 'small',
      closable: true,
    });

    const content = document.createElement('div');
    content.innerHTML = `
      <p>Are you sure you want to reset all settings to their default values?</p>
      <p><strong>This action cannot be undone.</strong></p>
    `;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '1rem';
    buttonContainer.style.marginTop = '1rem';
    buttonContainer.style.justifyContent = 'flex-end';

    const cancelBtn = ComponentFactory.createButton({
      text: 'Cancel',
      variant: 'secondary',
      onClick: () => confirmModal.close(),
    });

    const resetBtn = ComponentFactory.createButton({
      text: 'Reset',
      variant: 'danger',
      onClick: () => {
        this.tempPreferences = this.preferencesManager.getPreferences();
        this.preferencesManager.resetToDefaults();
        this.preferencesManager.applyAll();
        confirmModal.close();
        this.close();
      } // TODO: Consider extracting to reduce closure scope,
    });

    cancelBtn.mount(buttonContainer);
    resetBtn.mount(buttonContainer);

    content.appendChild(buttonContainer);
    confirmModal.addContent(content);
    confirmModal.mount(document.body);
  }
}
