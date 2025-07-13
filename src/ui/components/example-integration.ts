import { ComponentFactory } from './ComponentFactory';
import './ui-components.css';

/**
 * Example integration of the UI Component Library
 * This demonstrates how to use the new components in the simulation
 */
export function initializeUIComponents() {
  // Initialize theme system
  // ThemeManager.initializeTheme();

  // Create a demo container to showcase components
  const demoContainer = document.createElement('div');
  demoContainer.id = 'ui-demo';
  demoContainer.style.position = 'fixed';
  demoContainer.style.top = '20px';
  demoContainer.style.right = '20px';
  demoContainer.style.width = '300px';
  demoContainer.style.maxHeight = '80vh';
  demoContainer.style.overflow = 'auto';
  demoContainer.style.zIndex = '1000';

  // Create a demo panel
  const demoPanel = ComponentFactory.createPanel(
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

  // Add some example content
  const content = document.createElement('div');
  content.style.padding = '1rem';

  // Theme toggle
  const themeToggle = ComponentFactory.createToggle(
    {
      label: 'Dark Mode',
      variant: 'switch',
      checked: false, // ThemeManager.getCurrentTheme() === 'dark',
      onChange: (checked: boolean) => {
        // ThemeManager.setTheme(checked ? 'dark' : 'light');
        // ThemeManager.saveThemePreference();
        console.log('Theme changed:', checked ? 'dark' : 'light');
      },
    },
    'theme-toggle'
  );

  themeToggle.mount(content);

  // Example buttons
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.flexDirection = 'column';
  buttonContainer.style.gap = '0.5rem';
  buttonContainer.style.marginTop = '1rem';

  const primaryBtn = ComponentFactory.createButton({
    text: 'Primary Action',
    variant: 'primary',
    onClick: () => console.log('Primary action clicked'),
  });

  const secondaryBtn = ComponentFactory.createButton({
    text: 'Secondary',
    variant: 'secondary',
    size: 'small',
    onClick: () => console.log('Secondary action clicked'),
  });

  primaryBtn.mount(buttonContainer);
  secondaryBtn.mount(buttonContainer);

  content.appendChild(buttonContainer);

  // Add input example
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

  // Modal example
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

  demoPanel.addContent(content);
  demoPanel.mount(demoContainer);

  document.body.appendChild(demoContainer);

  return demoPanel;
}

// Auto-initialize if this file is imported
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUIComponents);
  } else {
    // DOM is already ready
    setTimeout(initializeUIComponents, 100);
  }
}
