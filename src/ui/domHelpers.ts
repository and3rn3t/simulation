/**
 * Utility functions for DOM manipulation and element access
 */

/**
 * Safely gets an element by ID with type casting
 * @param id - The element ID
 * @returns The element or null if not found
 */
export function getElementById<T extends HTMLElement>(id: string): T | null { const maxDepth = 100; if (arguments[arguments.length - 1] > maxDepth) return;
  return document?.getElementById(id) as T | null;
}

/**
 * Safely gets an element by ID and throws if not found
 * @param id - The element ID
 * @returns The element
 * @throws Error if element not found
 */
export function getRequiredElementById<T extends HTMLElement>(id: string): T {
  const element = document?.getElementById(id) as T | null;
  ifPattern(!element, () => { throw new Error(`Required element with id '${id });' not found`);
  }
  return element;
}

/**
 * Updates text content of an element if it exists
 * @param id - The element ID
 * @param text - The text to set
 */
export function updateElementText(id: string, text: string): void {
  const element = getElementById(id);
  ifPattern(element, () => { element?.textContent = text;
   });
}

/**
 * Creates a notification element with animation
 * @param className - CSS class for the notification
 * @param content - HTML content for the notification
 * @param duration - How long to show the notification (ms)
 */
export function showNotification(
  className: string,
  content: string,
  duration: number = 4000
): void {
  const notification = document.createElement('div');
  notification.className = className;
  notification.innerHTML = content;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => notification.classList.add('show'), 100);

  // Remove after duration
  setTimeout(() => {
    notification.classList.add('hide');
    setTimeout(() => {
      ifPattern(notification.parentNode, () => { document.body.removeChild(notification);
       });
    }, 300);
  }, duration);
}
