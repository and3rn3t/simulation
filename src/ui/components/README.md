# UI Component Library Documentation

## Overview

This UI component library provides a comprehensive set of reusable, accessible, and styled components for the Organism Simulation game. The library follows modern design principles and includes:

- **Consistent Design System**: Unified color palette, spacing, typography, and visual elements
- **Accessibility Features**: ARIA labels, keyboard navigation, screen reader support, focus management
- **Responsive Design**: Mobile-friendly layouts that adapt to different screen sizes
- **Theme Support**: Dark/light mode with automatic system preference detection
- **TypeScript Support**: Full type safety with comprehensive interfaces

## Components

### BaseComponent

The foundation class that all components extend from.

**Features:**

- Lifecycle management (mount/unmount)
- Automatic accessibility setup
- Event handling utilities
- Common DOM manipulation methods

### Button

A versatile button component with multiple variants and sizes.

**Usage:**

```typescript
import { ComponentFactory } from './ui/components';

const button = ComponentFactory.createButton({
  text: 'Click Me',
  variant: 'primary',
  size: 'medium',
  onClick: () => console.log('Clicked!')
});

button.mount(container);
```

**Variants:**

- `primary`: Main action button with gradient background
- `secondary`: Secondary action button
- `danger`: Destructive action button (red theme)
- `success`: Positive action button (green theme)

**Sizes:**

- `small`: Compact button for tight spaces
- `medium`: Default size
- `large`: Prominent button for primary actions

**Features:**

- Loading state with spinner
- Icon support
- Disabled state
- Keyboard navigation
- Focus management

### Panel

A container component with optional header, close button, and collapse functionality.

**Usage:**

```typescript
const panel = ComponentFactory.createPanel({
  title: 'My Panel',
  closable: true,
  collapsible: true,
  onClose: () => console.log('Panel closed'),
  onToggle: (collapsed) => console.log('Panel collapsed:', collapsed)
});

panel.addContent('<p>Panel content here</p>');
panel.mount(container);
```

**Features:**

- Optional title header
- Close button functionality
- Collapsible content
- Customizable styling
- Accessibility labels

### Modal

An accessible modal dialog with backdrop and focus trapping.

**Usage:**

```typescript
const modal = ComponentFactory.createModal({
  title: 'Confirmation',
  size: 'medium',
  closable: true,
  onOpen: () => console.log('Modal opened'),
  onClose: () => console.log('Modal closed')
});

modal.addContent('<p>Are you sure?</p>');
modal.mount(document.body); // Modals should be mounted at root level
modal.open();
```

**Sizes:**

- `small`: Compact modal (24rem max width)
- `medium`: Default modal (32rem max width)
- `large`: Wide modal (48rem max width)

**Features:**

- Focus trapping for accessibility
- Keyboard navigation (ESC to close, Tab navigation)
- Backdrop click to close
- Smooth animations
- Prevents body scroll when open

### Input

A styled form input component with validation and helper text.

**Usage:**

```typescript
const input = ComponentFactory.createInput({
  label: 'Email Address',
  type: 'email',
  placeholder: 'Enter your email...',
  required: true,
  helperText: 'We will never share your email',
  onChange: (value) => console.log('Value changed:', value)
});

input.mount(container);
```

**Input Types:**

- `text`: Standard text input
- `email`: Email validation
- `password`: Password field
- `number`: Numeric input with min/max/step
- `search`: Search input
- `url`: URL validation
- `tel`: Telephone input

**Features:**

- Form validation
- Error states with custom messages
- Helper text
- Required field indicators
- Focus states
- Accessibility labels

### Toggle

A switch or checkbox toggle component.

**Usage:**

```typescript
const toggle = ComponentFactory.createToggle({
  label: 'Enable notifications',
  variant: 'switch',
  size: 'medium',
  checked: true,
  onChange: (checked) => console.log('Toggle changed:', checked)
});

toggle.mount(container);
```

**Variants:**

- `switch`: iOS-style toggle switch
- `checkbox`: Traditional checkbox style

**Sizes:**

- `small`: Compact toggle
- `medium`: Default size
- `large`: Prominent toggle

**Features:**

- Keyboard support (Space to toggle)
- Focus indicators
- Smooth animations
- Accessibility labels

## Utilities

### ComponentFactory

Central factory for creating and managing component instances.

**Methods:**

- `createButton(config, id?)`: Create a button component
- `createPanel(config, id?)`: Create a panel component
- `createModal(config, id?)`: Create a modal component
- `createInput(config, id?)`: Create an input component
- `createToggle(config, id?)`: Create a toggle component
- `getComponent<T>(id)`: Retrieve a component by ID
- `removeComponent(id)`: Remove and unmount a component
- `removeAllComponents()`: Clean up all managed components

### ThemeManager

Manages application themes and design system variables.

**Methods:**

- `setTheme(theme)`: Set 'light' or 'dark' theme
- `getCurrentTheme()`: Get current theme
- `toggleTheme()`: Switch between themes
- `initializeTheme()`: Auto-detect system preference
- `saveThemePreference()`: Persist theme choice

### AccessibilityManager

Provides accessibility utilities and helpers.

**Methods:**

- `announceToScreenReader(message)`: Announce to assistive technology
- `trapFocus(container)`: Set up focus trapping for modals
- `prefersReducedMotion()`: Check user motion preferences
- `prefersHighContrast()`: Check user contrast preferences

## Design System

### Color Palette

The library uses CSS custom properties for consistent theming:

**Primary Colors:**

- `--ui-primary`: #4CAF50 (Green)
- `--ui-secondary`: #2196F3 (Blue)
- `--ui-danger`: #F44336 (Red)
- `--ui-success`: #4CAF50 (Green)
- `--ui-warning`: #FF9800 (Orange)

**Neutral Colors:**

- `--ui-gray-50` to `--ui-gray-900`: Grayscale palette

**Dark Theme:**

- `--ui-dark-bg`: Background color
- `--ui-dark-surface`: Card/panel background
- `--ui-dark-text`: Primary text color

### Spacing System

Consistent spacing using CSS custom properties:

- `--ui-space-xs`: 0.25rem (4px)
- `--ui-space-sm`: 0.5rem (8px)
- `--ui-space-md`: 1rem (16px)
- `--ui-space-lg`: 1.5rem (24px)
- `--ui-space-xl`: 2rem (32px)

### Typography

- `--ui-font-size-xs`: 0.75rem
- `--ui-font-size-sm`: 0.875rem
- `--ui-font-size-md`: 1rem
- `--ui-font-size-lg`: 1.125rem
- `--ui-font-size-xl`: 1.25rem

## Accessibility Features

### Keyboard Navigation

All interactive components support keyboard navigation:

- **Tab**: Navigate between elements
- **Enter/Space**: Activate buttons and toggles
- **Escape**: Close modals and dropdowns
- **Arrow keys**: Navigate within component groups

### Screen Reader Support

- Proper ARIA labels and roles
- Live region announcements for dynamic content
- Descriptive text for complex interactions
- Semantic HTML structure

### Focus Management

- Visible focus indicators
- Focus trapping in modals
- Logical tab order
- Focus restoration after modal close

### Motion and Contrast

- Respects `prefers-reduced-motion` setting
- Supports `prefers-contrast: high`
- Scalable components for different zoom levels

## Best Practices

### Component Creation

1. **Use the ComponentFactory**: Centralized creation and management
2. **Provide IDs for reusable components**: Easy retrieval and updates
3. **Handle cleanup**: Always unmount components when no longer needed

### Accessibility

1. **Always provide labels**: Use `label` or `ariaLabel` props
2. **Use semantic HTML**: Let the components handle ARIA attributes
3. **Test with keyboard**: Ensure all functionality is keyboard accessible
4. **Provide feedback**: Use screen reader announcements for actions

### Styling

1. **Use CSS custom properties**: Maintain consistency with design system
2. **Responsive design**: Test components at different screen sizes
3. **Theme support**: Ensure components work in both light and dark themes

### Performance

1. **Reuse components**: Don't create multiple instances unnecessarily
2. **Clean up**: Remove components when they're no longer needed
3. **Lazy loading**: Create components only when needed

## Examples

### Complete Control Panel

```typescript
import { ComponentFactory, ControlPanelComponent } from './ui/components';

// Create a complete control panel
const controlPanel = new ControlPanelComponent({
  title: 'Simulation Controls',
  onStart: () => simulation.start(),
  onPause: () => simulation.pause(),
  onReset: () => simulation.reset(),
  onSpeedChange: (speed) => simulation.setSpeed(speed),
  onAutoSpawnToggle: (enabled) => simulation.setAutoSpawn(enabled)
});

controlPanel.mount(document.getElementById('controls'));
```

### Modal Confirmation Dialog

```typescript
// Create a confirmation modal
const confirmModal = ComponentFactory.createModal({
  title: 'Confirm Action',
  size: 'small',
  closable: true
}, 'confirm-modal');

const modalContent = document.createElement('div');
modalContent.innerHTML = '<p>Are you sure you want to reset the simulation?</p>';

const buttonContainer = document.createElement('div');
buttonContainer.style.display = 'flex';
buttonContainer.style.gap = '1rem';
buttonContainer.style.marginTop = '1rem';

const cancelBtn = ComponentFactory.createButton({
  text: 'Cancel',
  variant: 'secondary',
  onClick: () => confirmModal.close()
});

const confirmBtn = ComponentFactory.createButton({
  text: 'Reset',
  variant: 'danger',
  onClick: () => {
    simulation.reset();
    confirmModal.close();
  }
});

cancelBtn.mount(buttonContainer);
confirmBtn.mount(buttonContainer);

modalContent.appendChild(buttonContainer);
confirmModal.addContent(modalContent);
confirmModal.mount(document.body);
```

## Browser Support

The component library supports all modern browsers:

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Future Enhancements

Planned additions to the component library:

- **Dropdown/Select Component**: Custom styled dropdowns
- **Tooltip Component**: Accessible tooltips and popovers
- **Progress Component**: Progress bars and loading indicators
- **Chart Components**: Data visualization components
- **Grid Component**: Responsive grid layout system
- **Animation System**: Coordinated animations and transitions
