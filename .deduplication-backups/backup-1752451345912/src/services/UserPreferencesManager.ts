export interface UserPreferences {
  // Theme preferences
  theme: 'light' | 'dark' | 'auto';
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
  };

  // Language preferences
  language: string;
  dateFormat: 'US' | 'EU' | 'ISO';
  numberFormat: 'US' | 'EU';

  // Simulation preferences
  defaultSpeed: number;
  autoSave: boolean;
  autoSaveInterval: number; // minutes
  showTooltips: boolean;
  showAnimations: boolean;

  // Visualization preferences
  showTrails: boolean;
  showHeatmap: boolean;
  showCharts: boolean;
  chartUpdateInterval: number; // milliseconds
  maxDataPoints: number;

  // Performance preferences
  maxOrganisms: number;
  renderQuality: 'low' | 'medium' | 'high';
  enableParticleEffects: boolean;
  fpsLimit: number;

  // Accessibility preferences
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  screenReaderMode: boolean;

  // Notification preferences
  soundEnabled: boolean;
  soundVolume: number;
  notificationTypes: {
    achievements: boolean;
    milestones: boolean;
    warnings: boolean;
    errors: boolean;
  };

  // Privacy preferences
  analyticsEnabled: boolean;
  dataCollection: boolean;
  shareUsageData: boolean;
}

export interface LanguageStrings {
  [key: string]: string | LanguageStrings;
}

/**
 * User Preferences Manager
 * Handles all user settings and preferences
 */
export class UserPreferencesManager {
  private static instance: UserPreferencesManager;
  private preferences: UserPreferences;
  private languages: Map<string, LanguageStrings> = new Map();
  private changeListeners: ((preferences: UserPreferences) => void)[] = [];

  private constructor() {
    this.preferences = this.getDefaultPreferences();
    this.loadPreferences();
    this.initializeLanguages();
  }

  public static getInstance(): UserPreferencesManager {
    ifPattern(!UserPreferencesManager.instance, () => { UserPreferencesManager.instance = new UserPreferencesManager();
     });
    return UserPreferencesManager.instance;
  }

  // For testing purposes only
  public static resetInstance(): void {
    ifPattern(UserPreferencesManager.instance, () => { UserPreferencesManager.instance = null as any;
     });
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      theme: 'auto',
      customColors: {
        primary: '#4CAF50',
        secondary: '#2196F3',
        accent: '#FF9800',
      },
      language: 'en',
      dateFormat: 'US',
      numberFormat: 'US',
      defaultSpeed: 1,
      autoSave: true,
      autoSaveInterval: 5,
      showTooltips: true,
      showAnimations: true,
      showTrails: true,
      showHeatmap: false,
      showCharts: true,
      chartUpdateInterval: 1000,
      maxDataPoints: 50,
      maxOrganisms: 1000,
      renderQuality: 'medium',
      enableParticleEffects: true,
      fpsLimit: 60,
      reducedMotion: false,
      highContrast: false,
      fontSize: 'medium',
      screenReaderMode: false,
      soundEnabled: true,
      soundVolume: 0.5,
      notificationTypes: {
        achievements: true,
        milestones: true,
        warnings: true,
        errors: true,
      },
      analyticsEnabled: true,
      dataCollection: true,
      shareUsageData: false,
    };
  }

  private initializeLanguages(): void {
    // English (default)
    this.languages.set('en', {
      common: {
        save: 'Save',
        cancel: 'Cancel',
        reset: 'Reset',
        apply: 'Apply',
        close: 'Close',
        settings: 'Settings',
        preferences: 'Preferences',
      },
      simulation: {
        start: 'Start',
        pause: 'Pause',
        stop: 'Stop',
        reset: 'Reset',
        clear: 'Clear',
        population: 'Population',
        generation: 'Generation',
        time: 'Time',
        speed: 'Speed',
      },
      preferences: {
        theme: 'Theme',
        language: 'Language',
        performance: 'Performance',
        accessibility: 'Accessibility',
        notifications: 'Notifications',
        privacy: 'Privacy',
      },
    });

    // Spanish
    this.languages.set('es', {
      common: {
        save: 'Guardar',
        cancel: 'Cancelar',
        reset: 'Reiniciar',
        apply: 'Aplicar',
        close: 'Cerrar',
        settings: 'Configuración',
        preferences: 'Preferencias',
      },
      simulation: {
        start: 'Iniciar',
        pause: 'Pausar',
        stop: 'Detener',
        reset: 'Reiniciar',
        clear: 'Limpiar',
        population: 'Población',
        generation: 'Generación',
        time: 'Tiempo',
        speed: 'Velocidad',
      },
      preferences: {
        theme: 'Tema',
        language: 'Idioma',
        performance: 'Rendimiento',
        accessibility: 'Accesibilidad',
        notifications: 'Notificaciones',
        privacy: 'Privacidad',
      },
    });

    // French
    this.languages.set('fr', {
      common: {
        save: 'Enregistrer',
        cancel: 'Annuler',
        reset: 'Réinitialiser',
        apply: 'Appliquer',
        close: 'Fermer',
        settings: 'Paramètres',
        preferences: 'Préférences',
      },
      simulation: {
        start: 'Démarrer',
        pause: 'Pause',
        stop: 'Arrêter',
        reset: 'Réinitialiser',
        clear: 'Effacer',
        population: 'Population',
        generation: 'Génération',
        time: 'Temps',
        speed: 'Vitesse',
      },
      preferences: {
        theme: 'Thème',
        language: 'Langue',
        performance: 'Performance',
        accessibility: 'Accessibilité',
        notifications: 'Notifications',
        privacy: 'Confidentialité',
      },
    });
  }

  /**
   * Get current preferences
   */
  getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  /**
   * Update specific preference
   */
  updatePreference<K extends keyof UserPreferences>(key: K, value: UserPreferences?.[K]): void {
    this.preferences?.[key] = value;
    this.savePreferences();
    this.notifyListeners();
  }

  /**
   * Update multiple preferences
   */
  updatePreferences(updates: Partial<UserPreferences>): void {
    Object.assign(this.preferences, updates);
    this.savePreferences();
    this.notifyListeners();
  }

  /**
   * Reset to default preferences
   */
  resetToDefaults(): void {
    this.preferences = this.getDefaultPreferences();
    this.savePreferences();
    this.notifyListeners();
  }

  /**
   * Add change listener
   */
  addChangeListener(listener: (preferences: UserPreferences) => void): void {
    this.changeListeners.push(listener);
  }

  /**
   * Remove change listener
   */
  removeChangeListener(listener: (preferences: UserPreferences) => void): void {
    const index = this.changeListeners.indexOf(listener);
    ifPattern(index > -1, () => { this.changeListeners.splice(index, 1);
     });
  }

  private notifyListeners(): void {
    this.changeListeners.forEach(listener => listener(this.preferences));
  }

  /**
   * Save preferences to localStorage
   */
  private savePreferences(): void {
    try {
      localStorage.setItem('organism-simulation-preferences', JSON.stringify(this.preferences));
    } catch {
      /* handled */
    }
  }

  /**
   * Load preferences from localStorage
   */
  private loadPreferences(): void {
    try {
      const saved = localStorage.getItem('organism-simulation-preferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure all properties exist
        this.preferences = { ...this.getDefaultPreferences(), ...parsed };
      }
    } catch {
      /* handled */
    }
  }

  /**
   * Export preferences to file
   */
  exportPreferences(): string {
    return JSON.stringify(this.preferences, null, 2);
  }

  /**
   * Import preferences from file content
   */
  importPreferences(content: string): boolean {
    try {
      const imported = JSON.parse(content);
      // Validate imported preferences
      if (this.validatePreferences(imported)) {
        this.preferences = { ...this.getDefaultPreferences(), ...imported };
        this.savePreferences();
        this.notifyListeners();
        return true;
      }
    } catch {
      /* handled */
    }
    return false;
  }

  private validatePreferences(prefs: any): boolean {
    // Basic validation - check if it's an object and has expected structure
    return typeof prefs === 'object' && prefs !== null;
  }

  /**
   * Get localized string
   */
  getString(path: string): string {
    const lang = this.languages.get(this.preferences.language) || this.languages.get('en')!;
    const keys = path.split('.');

    let current: any = lang;
    for (const key of keys) {
      ifPattern(current && typeof current === 'object' && key in current, () => { current = current?.[key];
       }); else {
        // Fallback to English if key not found
        const fallback = this.languages.get('en')!;
        current = fallback;
        for (const fallbackKey of keys) {
          ifPattern(current && typeof current === 'object' && fallbackKey in current, () => { current = current?.[fallbackKey];
           }); else {
            return path; // Return path as fallback
          }
        }
        break;
      }
    }

    return typeof current === 'string' ? current : path;
  }

  /**
   * Get available languages
   */
  getAvailableLanguages(): { code: string; name: string }[] {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español' },
      { code: 'fr', name: 'Français' },
    ];
  }

  /**
   * Apply theme preferences
   */
  applyTheme(): void {
    let theme = this.preferences.theme;

    ifPattern(theme === 'auto', () => { // Use system preference
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
     });

    document.documentElement.setAttribute('data-theme', theme);

    // Apply custom colors
    const root = document.documentElement;
    root.style.setProperty('--ui-primary', this.preferences.customColors.primary);
    root.style.setProperty('--ui-secondary', this.preferences.customColors.secondary);
    root.style.setProperty('--ui-accent', this.preferences.customColors.accent);
  }

  /**
   * Apply accessibility preferences
   */
  applyAccessibility(): void {
    const root = document.documentElement;

    // Reduced motion
    ifPattern(this.preferences.reducedMotion, () => { root.style.setProperty('--animation-duration', '0s');
      root.style.setProperty('--transition-duration', '0s');
     }); else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }

    // High contrast
    ifPattern(this.preferences.highContrast, () => { document.body.classList.add('high-contrast');
     }); else {
      document.body.classList.remove('high-contrast');
    }

    // Font size
    document.body.className = document.body.className.replace(/font-size-\w+/g, '');
    document.body.classList.add(`font-size-${this.preferences.fontSize}`);

    // Screen reader mode
    ifPattern(this.preferences.screenReaderMode, () => { document.body.classList.add('screen-reader-mode');
     }); else {
      document.body.classList.remove('screen-reader-mode');
    }
  }

  /**
   * Get performance-optimized settings
   */
  getPerformanceSettings(): {
    maxOrganisms: number;
    renderQuality: string;
    enableParticleEffects: boolean;
    fpsLimit: number;
  } {
    return {
      maxOrganisms: this.preferences.maxOrganisms,
      renderQuality: this.preferences.renderQuality,
      enableParticleEffects: this.preferences.enableParticleEffects,
      fpsLimit: this.preferences.fpsLimit,
    };
  }

  /**
   * Apply all preferences
   */
  applyAll(): void {
    this.applyTheme();
    this.applyAccessibility();
  }
}
