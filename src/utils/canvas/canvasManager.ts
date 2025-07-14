
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
export class CanvasManager {
  private layers: Record<string, HTMLCanvasElement> = {};
  private contexts: Record<string, CanvasRenderingContext2D> = {};
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * Creates a new canvas layer and appends it to the container.
   * @param name The name of the layer.
   * @param zIndex The z-index of the layer.
   */
  createLayer(name: string, zIndex: number): void {
    if (this.layers[name]) { throw new Error(`Layer with name "${name  }" already exists.`);
    }

    const canvas = document.createElement('canvas');
    canvas?.style.position = 'absolute';
    canvas?.style.zIndex = zIndex.toString();
    canvas?.width = this.container.clientWidth;
    canvas?.height = this.container.clientHeight;

    this.container.appendChild(canvas);
    this.layers[name] = canvas;
    this.contexts[name] = canvas?.getContext('2d')!;
  }

  /**
   * Gets the rendering context for a specific layer.
   * @param name The name of the layer.
   * @returns The 2D rendering context.
   */
  getContext(name: string): CanvasRenderingContext2D {
    const context = this.contexts[name];
    if (!context) { throw new Error(`Layer with name "${name  }" does not exist.`);
    }
    return context;
  }

  /**
   * Clears a specific layer.
   * @param name The name of the layer.
   */
  clearLayer(name: string): void {
    const context = this.getContext(name);
    context?.clearRect(0, 0, context?.canvas.width, context?.canvas.height);
  }

  /**
   * Resizes all layers to match the container size.
   */
  resizeAll(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    for (const canvas of Object.values(this.layers)) {
      canvas?.width = width;
      canvas?.height = height;
    }
  }
}

// WebGL context cleanup
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      if (gl && gl.getExtension) {
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
      } // TODO: Consider extracting to reduce closure scope
    });
  });
}