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
import { ComponentFactory } from './ComponentFactory';
import './ui-components.css';

/**
 * Example integration of the UI Component Library
 * This demonstrates how to use the new components in the simulation
 */
export function initializeUIComponents() {
  const demoContainer = createDemoContainer();
  const demoPanel = createDemoPanel(demoContainer);
  const content = createDemoContent();

  populateDemoContent(content);
  demoPanel.addContent(content);
  demoPanel.mount(demoContainer);
  document.body.appendChild(demoContainer);

  return demoPanel;
}

function createDemoContainer(): HTMLElement {
  const demoContainer = document.createElement('div');
  demoContainer.id = 'ui-demo';
  demoContainer.style.position = 'fixed';
  demoContainer.style.top = '20px';
  demoContainer.style.right = '20px';
  demoContainer.style.width = '300px';
  demoContainer.style.maxHeight = '80vh';
  demoContainer.style.overflow = 'auto';
  demoContainer.style.zIndex = '1000';
  return demoContainer;
}

function createDemoPanel(demoContainer: HTMLElement) {
  return ComponentFactory.createPanel(
    {
      title: 'UI Components Demo',
      collapsible: true,
      closable: true,
      onClose: () => {
        document.body.removeChild(demoContainer);
      },
    },
    'ui-demo-panel'
  );
}

function createDemoContent(): HTMLElement {
  const content = document.createElement('div');
  content.style.padding = '1rem';
  return content;
}

function populateDemoContent(content: HTMLElement): void {
  addThemeToggle(content);
  addExampleButtons(content);
  addInputExample(content);
  addModalExample(content);
}

function addThemeToggle(content: HTMLElement): void {
  const themeToggle = ComponentFactory.createToggle(
    {
      label: 'Dark Mode',
      variant: 'switch',
      checked: false,
      onChange: (_checked: boolean) => {
        // ThemeManager integration would go here
      },
    },
    'theme-toggle'
  );
  themeToggle.mount(content);
}

function addExampleButtons(content: HTMLElement): void {
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.flexDirection = 'column';
  buttonContainer.style.gap = '0.5rem';
  buttonContainer.style.marginTop = '1rem';

  const primaryBtn = ComponentFactory.createButton({
    text: 'Primary Action',
    variant: 'primary',
    onClick: () => console.log('Primary clicked'),
  });

  const secondaryBtn = ComponentFactory.createButton({
    text: 'Secondary',
    variant: 'secondary',
    size: 'small',
    onClick: () => console.log('Secondary clicked'),
  });

  primaryBtn.mount(buttonContainer);
  secondaryBtn.mount(buttonContainer);
  content.appendChild(buttonContainer);
}

function addInputExample(content: HTMLElement): void {
  const inputContainer = document.createElement('div');
  inputContainer.style.marginTop = '1rem';

  const exampleInput = ComponentFactory.createInput({
    label: 'Example Input',
    placeholder: 'Type something...',
    helperText: 'This is a helper text',
    onChange: (value: string) => console.log('Input changed:', value),
  });

  exampleInput.mount(inputContainer);
  content.appendChild(inputContainer);
}

function addModalExample(content: HTMLElement): void {
  const modalBtn = ComponentFactory.createButton({
    text: 'Open Modal',
    variant: 'secondary',
    onClick: () => {
      const modal = ComponentFactory.createModal({
        title: 'Example Modal',
        size: 'medium',
        closable: true,
      });

      modal.addContent(`
        <p>This is an example modal dialog.</p>
        <p>It demonstrates the modal component with proper accessibility features.</p>
      `);

      modal.mount(document.body);
      modal.open();
    },
  });

  const modalContainer = document.createElement('div');
  modalContainer.style.marginTop = '1rem';
  modalBtn.mount(modalContainer);
  content.appendChild(modalContainer);
}

// Auto-initialize if this file is imported
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document?.addEventListener('DOMContentLoaded', _event => {
      try {
        initializeUIComponents();
      } catch (error) {
        console.error('Event listener error for DOMContentLoaded:', error);
      }
    });
  } else {
    // DOM is already ready
    setTimeout(initializeUIComponents, 100);
  }
}
