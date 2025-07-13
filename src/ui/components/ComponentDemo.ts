import { ComponentFactory, ThemeManager, AccessibilityManager } from './index';
import './ui-components.css';

/**
 * UI Component Library Demo
 * Demonstrates usage of all available components
 */
export class ComponentDemo {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.initializeDemo();
  }

  private initializeDemo(): void {
    // Create main demo container
    const demoContainer = document.createElement('div');
    demoContainer.className = 'component-demo';
    demoContainer.innerHTML = `
      <h2>UI Component Library Demo</h2>
      <p>Interactive demonstration of all available components with accessibility features.</p>
    `;

    // Create sections for each component type
    this.createButtonDemo(demoContainer);
    this.createInputDemo(demoContainer);
    this.createToggleDemo(demoContainer);
    this.createPanelDemo(demoContainer);
    this.createModalDemo(demoContainer);
    this.createThemeDemo(demoContainer);

    this.container.appendChild(demoContainer);
  }

  private createButtonDemo(container: HTMLElement): void {
    const section = document.createElement('div');
    section.className = 'demo-section';
    section.innerHTML = '<h3>Buttons</h3>';

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '1rem';
    buttonContainer.style.flexWrap = 'wrap';
    buttonContainer.style.marginBottom = '2rem';

    // Create various button examples
    const buttons = [
      { text: 'Primary', variant: 'primary' as const },
      { text: 'Secondary', variant: 'secondary' as const },
      { text: 'Danger', variant: 'danger' as const },
      { text: 'Success', variant: 'success' as const },
      { text: 'Small', size: 'small' as const },
      { text: 'Large', size: 'large' as const },
      { text: 'With Icon', icon: '🚀' },
      { text: 'Disabled', disabled: true },
    ];

    buttons.forEach((config, index) => {
      const button = ComponentFactory.createButton(
        {
          ...config,
          onClick: () => {
            AccessibilityManager.announceToScreenReader(`Button "${config.text}" clicked`);
            },
        },
        `demo-button-${index}`
      );

      button.mount(buttonContainer);
    });

    section.appendChild(buttonContainer);
    container.appendChild(section);
  }

  private createInputDemo(container: HTMLElement): void {
    const section = document.createElement('div');
    section.className = 'demo-section';
    section.innerHTML = '<h3>Form Inputs</h3>';

    const inputContainer = document.createElement('div');
    inputContainer.style.display = 'grid';
    inputContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
    inputContainer.style.gap = '1rem';
    inputContainer.style.marginBottom = '2rem';

    // Create various input examples
    const inputs = [
      {
        label: 'Text Input',
        placeholder: 'Enter text...',
        helperText: 'This is helper text',
      },
      {
        label: 'Email Input',
        type: 'email' as const,
        placeholder: 'Enter email...',
        required: true,
      },
      {
        label: 'Number Input',
        type: 'number' as const,
        min: 0,
        max: 100,
        step: 1,
      },
      {
        label: 'Password Input',
        type: 'password' as const,
        placeholder: 'Enter password...',
      },
    ];

    inputs.forEach((config, index) => {
      const input = ComponentFactory.createInput(
        {
          ...config,
          onChange: value => {
            },
        },
        `demo-input-${index}`
      );

      input.mount(inputContainer);
    });

    section.appendChild(inputContainer);
    container.appendChild(section);
  }

  private createToggleDemo(container: HTMLElement): void {
    const section = document.createElement('div');
    section.className = 'demo-section';
    section.innerHTML = '<h3>Toggles</h3>';

    const toggleContainer = document.createElement('div');
    toggleContainer.style.display = 'flex';
    toggleContainer.style.flexDirection = 'column';
    toggleContainer.style.gap = '1rem';
    toggleContainer.style.marginBottom = '2rem';

    // Create various toggle examples
    const toggles = [
      { label: 'Switch Toggle', variant: 'switch' as const },
      { label: 'Checkbox Toggle', variant: 'checkbox' as const },
      { label: 'Small Switch', variant: 'switch' as const, size: 'small' as const },
      { label: 'Large Switch', variant: 'switch' as const, size: 'large' as const },
      { label: 'Pre-checked', variant: 'switch' as const, checked: true },
    ];

    toggles.forEach((config, index) => {
      const toggle = ComponentFactory.createToggle(
        {
          ...config,
          onChange: checked => {
            AccessibilityManager.announceToScreenReader(
              `${config.label} ${checked ? 'enabled' : 'disabled'}`
            );
            },
        },
        `demo-toggle-${index}`
      );

      toggle.mount(toggleContainer);
    });

    section.appendChild(toggleContainer);
    container.appendChild(section);
  }

  private createPanelDemo(container: HTMLElement): void {
    const section = document.createElement('div');
    section.className = 'demo-section';
    section.innerHTML = '<h3>Panels</h3>';

    const panelContainer = document.createElement('div');
    panelContainer.style.display = 'grid';
    panelContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
    panelContainer.style.gap = '1rem';
    panelContainer.style.marginBottom = '2rem';

    // Create panel examples
    const basicPanel = ComponentFactory.createPanel(
      {
        title: 'Basic Panel',
        closable: true,
        onClose: () => {
          AccessibilityManager.announceToScreenReader('Panel closed');
          },
      },
      'demo-panel-basic'
    );

    basicPanel.addContent('<p>This is a basic panel with a close button.</p>');
    basicPanel.mount(panelContainer);

    const collapsiblePanel = ComponentFactory.createPanel(
      {
        title: 'Collapsible Panel',
        collapsible: true,
        onToggle: collapsed => {
          },
      },
      'demo-panel-collapsible'
    );

    collapsiblePanel.addContent('<p>This panel can be collapsed and expanded.</p>');
    collapsiblePanel.mount(panelContainer);

    section.appendChild(panelContainer);
    container.appendChild(section);
  }

  private createModalDemo(container: HTMLElement): void {
    const section = document.createElement('div');
    section.className = 'demo-section';
    section.innerHTML = '<h3>Modals</h3>';

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '1rem';
    buttonContainer.style.marginBottom = '2rem';

    // Create modal examples
    const basicModal = ComponentFactory.createModal(
      {
        title: 'Basic Modal',
        closable: true,
        size: 'medium',
        onOpen: () => {
          AccessibilityManager.announceToScreenReader('Modal opened');
        },
        onClose: () => {
          AccessibilityManager.announceToScreenReader('Modal closed');
        },
      },
      'demo-modal-basic'
    );

    basicModal.addContent(`
      <p>This is a basic modal dialog.</p>
      <p>It includes proper accessibility features like focus trapping and keyboard navigation.</p>
    `);

    const openModalBtn = ComponentFactory.createButton({
      text: 'Open Modal',
      variant: 'primary',
      onClick: () => basicModal.open(),
    });

    openModalBtn.mount(buttonContainer);

    // Mount modal to body (modals should be at root level)
    basicModal.mount(document.body);

    section.appendChild(buttonContainer);
    container.appendChild(section);
  }

  private createThemeDemo(container: HTMLElement): void {
    const section = document.createElement('div');
    section.className = 'demo-section';
    section.innerHTML = '<h3>Theme Controls</h3>';

    const themeContainer = document.createElement('div');
    themeContainer.style.display = 'flex';
    themeContainer.style.gap = '1rem';
    themeContainer.style.alignItems = 'center';
    themeContainer.style.marginBottom = '2rem';

    // Theme toggle
    const themeToggle = ComponentFactory.createToggle(
      {
        label: 'Dark Mode',
        variant: 'switch',
        checked: ThemeManager.getCurrentTheme() === 'dark',
        onChange: checked => {
          ThemeManager.setTheme(checked ? 'dark' : 'light');
          ThemeManager.saveThemePreference();
          AccessibilityManager.announceToScreenReader(
            `Theme changed to ${checked ? 'dark' : 'light'} mode`
          );
        },
      },
      'theme-toggle'
    );

    themeToggle.mount(themeContainer);

    // Accessibility info
    const accessibilityInfo = document.createElement('div');
    accessibilityInfo.style.marginTop = '1rem';
    accessibilityInfo.style.padding = '1rem';
    accessibilityInfo.style.border = '1px solid var(--ui-gray-600)';
    accessibilityInfo.style.borderRadius = 'var(--ui-radius-md)';
    accessibilityInfo.innerHTML = `
      <h4>Accessibility Features</h4>
      <ul>
        <li>Keyboard navigation support</li>
        <li>Screen reader announcements</li>
        <li>High contrast mode support</li>
        <li>Reduced motion support</li>
        <li>Focus management and trapping</li>
        <li>ARIA labels and roles</li>
      </ul>
      <p><strong>User Preferences:</strong></p>
      <ul>
        <li>Prefers reduced motion: ${AccessibilityManager.prefersReducedMotion()}</li>
        <li>Prefers high contrast: ${AccessibilityManager.prefersHighContrast()}</li>
      </ul>
    `;

    section.appendChild(themeContainer);
    section.appendChild(accessibilityInfo);
    container.appendChild(section);
  }
}

// CSS for demo styling
const demoCSS = `
  .component-demo {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    color: var(--ui-dark-text);
  }

  .demo-section {
    margin-bottom: 3rem;
    padding: 1.5rem;
    border: 1px solid var(--ui-gray-700);
    border-radius: var(--ui-radius-lg);
    background: var(--ui-dark-surface);
  }

  .demo-section h3 {
    margin-top: 0;
    color: var(--ui-primary);
  }
`;

// Inject demo CSS
const style = document.createElement('style');
style.textContent = demoCSS;
document.head.appendChild(style);
