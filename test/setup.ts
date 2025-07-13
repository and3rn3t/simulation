import { vi } from 'vitest';

// Global test setup for Vitest

// Mock Chart.js immediately
vi.mock('chart.js', () => {
  const mockRegister = vi.fn();

  const createChartInstance = function (ctx: any, config: any) {
    const instance = {
      destroy: vi.fn(),
      update: vi.fn((mode?: string) => {
        // Return void, not a Promise - Chart.js update can be sync or async
        return undefined;
      }),
      resize: vi.fn(),
      render: vi.fn(),
      clear: vi.fn(),
      stop: vi.fn(),
      reset: vi.fn(),
      toBase64Image: vi.fn(() => 'data:image/png;base64,mock'),
      generateLegend: vi.fn(),
      data: config?.data || { datasets: [], labels: [] },
      options: config?.options || {},
      canvas: ctx || null,
      ctx: ctx || null,
    };
    return instance;
  };

  const mockChart = vi.fn().mockImplementation(createChartInstance);

  // Assign register method to Chart function
  (mockChart as any).register = mockRegister;

  return {
    Chart: mockChart,
    ChartConfiguration: {},
    ChartData: {},
    ChartOptions: {},
    ChartType: {},
    registerables: [],
    default: mockChart,
    register: mockRegister,
  };
});

// Mock chartjs-adapter-date-fns
vi.mock('chartjs-adapter-date-fns', () => ({}));

// Mock UserPreferencesManager
vi.mock('../src/services/UserPreferencesManager', () => {
  const mockInstance = {
    getPreferences: vi.fn(() => ({
      theme: 'dark',
      language: 'en',
      enableAnimations: true,
      showFPS: false,
      showDebugInfo: false,
      maxFrameRate: 60,
      enableSounds: true,
      shareUsageData: false,
      customColors: {
        primary: '#4CAF50',
        secondary: '#2196F3',
        accent: '#FF9800',
      },
    })),
    updatePreference: vi.fn(), // Added missing method
    updatePreferences: vi.fn(),
    addChangeListener: vi.fn(), // Added missing method
    removeChangeListener: vi.fn(), // Added missing method
    applyTheme: vi.fn(),
    setLanguage: vi.fn(),
    getAvailableLanguages: vi.fn(() => [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español' },
      { code: 'fr', name: 'Français' },
      { code: 'de', name: 'Deutsch' },
      { code: 'zh', name: '中文' },
    ]),
    exportPreferences: vi.fn(() => '{}'),
    importPreferences: vi.fn(() => true),
    resetToDefaults: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  };

  // Create a constructor function that returns the mock instance
  const MockUserPreferencesManager = vi.fn().mockImplementation(() => mockInstance);
  (MockUserPreferencesManager as any).getInstance = vi.fn(() => mockInstance);

  return {
    UserPreferencesManager: MockUserPreferencesManager,
    default: MockUserPreferencesManager,
  };
});

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  setTimeout(callback, 16);
  return 1;
});

global.cancelAnimationFrame = vi.fn();

// Mock window.matchMedia
// Basic DOM mocks
Object.defineProperty(window, 'requestAnimationFrame', {
  value: vi.fn((callback: FrameRequestCallback) => {
    return setTimeout(callback, 16); // Simulate 60fps
  }),
  writable: true,
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  value: vi.fn((id: number) => {
    clearTimeout(id);
  }),
  writable: true,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Worker API
global.Worker = class Worker extends EventTarget {
  url: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  onmessageerror: ((event: MessageEvent) => void) | null = null;

  constructor(url: string | URL) {
    super();
    this.url = url.toString();
  }

  postMessage(message: any): void {
    // Simulate worker message processing
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage(new MessageEvent('message', { data: message }));
      }
    }, 0);
  }

  terminate(): void {
    // Mock termination
  }
} as any;

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = vi.fn();

// Mock Blob
global.Blob = class Blob {
  size: number;
  type: string;

  constructor(blobParts?: BlobPart[], options?: BlobPropertyBag) {
    this.size = 0;
    this.type = options?.type || '';
  }
} as any;

// Mock Canvas and CanvasRenderingContext2D
(HTMLCanvasElement.prototype.getContext as any) = vi.fn(type => {
  if (type === '2d') {
    return {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: 'start',
      textBaseline: 'alphabetic',
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      shadowBlur: 0,
      shadowColor: '',
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      lineCap: 'butt',
      lineJoin: 'miter',
      miterLimit: 10,
      lineDashOffset: 0,

      // Drawing methods
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      clearRect: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      arc: vi.fn(),
      arcTo: vi.fn(),
      ellipse: vi.fn(),
      rect: vi.fn(),

      // Text methods
      fillText: vi.fn(),
      strokeText: vi.fn(),
      measureText: vi.fn(() => ({ width: 100 })),

      // Transform methods
      scale: vi.fn(),
      rotate: vi.fn(),
      translate: vi.fn(),
      transform: vi.fn(),
      setTransform: vi.fn(),
      resetTransform: vi.fn(),

      // State methods
      save: vi.fn(),
      restore: vi.fn(),

      // Image methods
      drawImage: vi.fn(),
      createImageData: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(4),
        width: 1,
        height: 1,
      })),
      putImageData: vi.fn(),

      // Gradient methods
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      createPattern: vi.fn(),

      // Path methods
      clip: vi.fn(),
      isPointInPath: vi.fn(() => false),
      isPointInStroke: vi.fn(() => false),

      // Line dash methods
      setLineDash: vi.fn(),
      getLineDash: vi.fn(() => []),

      // Canvas dimensions
      canvas: {
        width: 800,
        height: 600,
        clientWidth: 800,
        clientHeight: 600,
        getBoundingClientRect: vi.fn(() => ({
          left: 0,
          top: 0,
          right: 800,
          bottom: 600,
          width: 800,
          height: 600,
          x: 0,
          y: 0,
          toJSON: vi.fn(),
        })),
      },
    };
  }
  return null;
});

// Mock HTMLCanvasElement methods
HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,mock');
HTMLCanvasElement.prototype.toBlob = vi.fn(callback => {
  if (callback) callback(new Blob());
});

// Mock requestAnimationFrame and cancelAnimationFrame
(global as any).requestAnimationFrame = vi.fn(callback => {
  return setTimeout(callback, 16) as any;
});
(global as any).cancelAnimationFrame = vi.fn(id => {
  clearTimeout(id);
});

// Mock performance API
let mockTime = 0;
global.performance = {
  ...global.performance,
  now: vi.fn(() => {
    mockTime += Math.random() * 5; // Add some random time
    return mockTime;
  }),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn(() => []),
  getEntriesByType: vi.fn(() => []),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
};

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(callback => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(callback => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}));

// Mock MutationObserver
global.MutationObserver = vi.fn().mockImplementation(callback => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(() => []),
}));

// Mock navigator APIs
Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  configurable: true,
});

Object.defineProperty(navigator, 'maxTouchPoints', {
  value: 0,
  configurable: true,
});

Object.defineProperty(navigator, 'hardwareConcurrency', {
  value: 4,
  configurable: true,
});

// Mock battery API
Object.defineProperty(navigator, 'battery', {
  value: Promise.resolve({
    charging: true,
    chargingTime: Infinity,
    dischargingTime: Infinity,
    level: 1.0,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }),
  configurable: true,
});

// Mock gamepad API
Object.defineProperty(navigator, 'getGamepads', {
  value: vi.fn(() => []),
  configurable: true,
});

// Mock vibration API
Object.defineProperty(navigator, 'vibrate', {
  value: vi.fn(() => true),
  configurable: true,
});

// Mock geolocation API
Object.defineProperty(navigator, 'geolocation', {
  value: {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  },
  configurable: true,
});

// Mock MediaRecorder API
global.MediaRecorder = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  state: 'inactive',
  mimeType: 'video/webm',
})) as any;

// Mock MediaStream API
global.MediaStream = vi.fn().mockImplementation(() => ({
  getTracks: vi.fn(() => []),
  getVideoTracks: vi.fn(() => []),
  getAudioTracks: vi.fn(() => []),
  addTrack: vi.fn(),
  removeTrack: vi.fn(),
  clone: vi.fn(),
  active: true,
  id: 'mock-stream-id',
})) as any;

// Mock Web Share API
Object.defineProperty(navigator, 'share', {
  value: vi.fn(() => Promise.resolve()),
  configurable: true,
});

Object.defineProperty(navigator, 'canShare', {
  value: vi.fn(() => true),
  configurable: true,
});

// Mock document.head for dynamic element management
if (!document.head) {
  Object.defineProperty(document, 'head', {
    value: document.createElement('head'),
    writable: false,
    configurable: true,
  });
}

// Ensure head has appendChild method
if (!document.head.appendChild) {
  (document.head as any).appendChild = vi.fn((element: any) => {
    if (element && typeof element === 'object') {
      // Simulate proper DOM behavior
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      return element;
    }
    throw new Error('Invalid element for appendChild');
  });
}

// Mock Fullscreen API
Object.defineProperty(document, 'fullscreenElement', {
  value: null,
  writable: true,
  configurable: true,
});
document.exitFullscreen = vi.fn(() => Promise.resolve());
HTMLElement.prototype.requestFullscreen = vi.fn(() => Promise.resolve());

// Add Element.remove() method if not present
if (!Element.prototype.remove) {
  Element.prototype.remove = function () {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  };
}

// Mock pointer events
window.PointerEvent = class PointerEvent extends Event {
  pointerId: number = 0;
  width: number = 1;
  height: number = 1;
  pressure: number = 0;
  tangentialPressure: number = 0;
  tiltX: number = 0;
  tiltY: number = 0;
  twist: number = 0;
  pointerType: string = 'mouse';
  isPrimary: boolean = true;

  constructor(type: string, eventInitDict?: PointerEventInit) {
    super(type, eventInitDict);
  }
} as any;

// Mock touch events
window.TouchEvent = class TouchEvent extends Event {
  touches: TouchList = [] as any;
  targetTouches: TouchList = [] as any;
  changedTouches: TouchList = [] as any;
  altKey: boolean = false;
  metaKey: boolean = false;
  ctrlKey: boolean = false;
  shiftKey: boolean = false;

  constructor(type: string, eventInitDict?: TouchEventInit) {
    super(type, eventInitDict);
  }
} as any;

// Mock missing DOM methods globally
if (!document.addEventListener) {
  document.addEventListener = vi.fn();
}
if (!document.removeEventListener) {
  document.removeEventListener = vi.fn();
}
if (!document.dispatchEvent) {
  document.dispatchEvent = vi.fn();
}

// Mock missing window methods
if (!global.setInterval) {
  global.setInterval = vi.fn((callback: any, delay: number) => {
    return setTimeout(callback, delay) as any;
  });
}
if (!global.clearInterval) {
  global.clearInterval = vi.fn((id: any) => {
    clearTimeout(id);
  });
}
if (!window.setInterval) {
  window.setInterval = global.setInterval;
}
if (!window.clearInterval) {
  window.clearInterval = global.clearInterval;
}

// Mock document.body if it doesn't exist or doesn't have classList
if (!document.body) {
  (document as any).body = {
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(() => false),
      toggle: vi.fn(),
    },
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    style: {},
  };
} else if (!document.body.classList) {
  (document.body as any).classList = {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn(() => false),
    toggle: vi.fn(),
  };
}

// Enhance DOM element creation to prevent null reference errors
const originalCreateElement = document.createElement.bind(document);
document.createElement = vi.fn((tagName: string, options?: ElementCreationOptions) => {
  let element = originalCreateElement(tagName, options);

  // If element creation failed, create a comprehensive mock element
  if (!element) {
    // Create a complete mock element with all Node interface methods and jsdom compatibility
    element = {
      // Basic element properties
      tagName: tagName.toUpperCase(),
      nodeName: tagName.toUpperCase(),
      nodeType: 1, // Element node type
      className: '',
      id: '',
      innerHTML: '',
      outerHTML: '',
      textContent: '',
      innerText: '',

      // jsdom compatibility - add Symbol.toStringTag for proper type validation
      [Symbol.toStringTag]: 'HTMLElement',

      // Node interface methods (required for appendChild)
      nodeValue: null,
      parentNode: null,
      parentElement: null,
      childNodes: [],
      children: [],
      firstChild: null,
      lastChild: null,
      nextSibling: null,
      previousSibling: null,
      ownerDocument: document,

      // DOM manipulation methods
      appendChild: vi.fn((child: any) => {
        // Enhanced Node validation for jsdom compatibility
        if (!child || typeof child !== 'object') {
          throw new TypeError(
            `Failed to execute 'appendChild' on 'Node': parameter 1 is not of type 'Node'.`
          );
        }

        // Ensure child has complete Node interface for jsdom validation
        if (!child.nodeType) {
          child.nodeType = 1; // ELEMENT_NODE
        }
        if (!child.nodeName && child.tagName) {
          child.nodeName = child.tagName;
        }
        if (!child.ownerDocument) {
          child.ownerDocument = document;
        }
        // Add jsdom Symbol.toStringTag for proper type validation
        if (!child[Symbol.toStringTag]) {
          child[Symbol.toStringTag] = 'HTMLElement';
        }

        // Ensure element has proper children collections
        if (!element.children || !Array.isArray(element.children)) {
          element.children = [];
        }
        if (!element.childNodes || !Array.isArray(element.childNodes)) {
          element.childNodes = [];
        }

        element.children.push(child);
        element.childNodes.push(child);

        if (child) {
          child.parentNode = element;
          child.parentElement = element;
        }
        return child;
      }),
      removeChild: vi.fn((child: any) => {
        if (element.children && Array.isArray(element.children)) {
          const index = element.children.indexOf(child);
          if (index >= 0) {
            element.children.splice(index, 1);
          }
        }
        if (child) {
          child.parentNode = null;
          child.parentElement = null;
        }
        return child;
      }),
      insertBefore: vi.fn((newNode: any, referenceNode: any) => {
        // Enhanced jsdom compatibility for insertBefore
        if (!newNode || typeof newNode !== 'object') {
          throw new TypeError(
            `Failed to execute 'insertBefore' on 'Node': parameter 1 is not of type 'Node'.`
          );
        }

        // Ensure newNode has complete Node interface
        if (!newNode.nodeType) newNode.nodeType = 1;
        if (!newNode.ownerDocument) newNode.ownerDocument = document;
        if (!newNode[Symbol.toStringTag]) newNode[Symbol.toStringTag] = 'HTMLElement';

        // Ensure element has proper children collections
        if (!element.children || !Array.isArray(element.children)) {
          element.children = [];
        }
        if (!element.childNodes || !Array.isArray(element.childNodes)) {
          element.childNodes = [];
        }

        const index = referenceNode
          ? element.children.indexOf(referenceNode)
          : element.children.length;
        element.children.splice(index, 0, newNode);
        element.childNodes.splice(index, 0, newNode);
        newNode.parentNode = element;
        newNode.parentElement = element;
        return newNode;
      }),
      replaceChild: vi.fn(),
      cloneNode: vi.fn(() => element),
      remove: vi.fn(() => {
        try {
          if (
            element.parentNode &&
            element.parentNode.removeChild &&
            element.parentNode.contains(element)
          ) {
            element.parentNode.removeChild(element);
          }
        } catch (error) {
          // Silently ignore DOM removal errors in tests
        }
      }),

      // Query methods
      querySelector: vi.fn((selector: string) => {
        // Enhanced querySelector that can find elements created via innerHTML
        if (selector === 'canvas') {
          // Always return a mock canvas when requested
          const mockCanvas = {
            tagName: 'CANVAS',
            nodeName: 'CANVAS',
            nodeType: 1,
            className: '',
            width: 800,
            height: 600,
            style: {},
            getContext: vi.fn((type: string) => {
              if (type === '2d') {
                return {
                  fillStyle: '',
                  strokeStyle: '',
                  lineWidth: 1,
                  font: '',
                  textAlign: 'start',
                  textBaseline: 'alphabetic',
                  globalAlpha: 1,
                  globalCompositeOperation: 'source-over',
                  shadowBlur: 0,
                  shadowColor: '',
                  shadowOffsetX: 0,
                  shadowOffsetY: 0,
                  lineCap: 'butt',
                  lineJoin: 'miter',
                  miterLimit: 10,
                  lineDashOffset: 0,
                  fillRect: vi.fn(),
                  strokeRect: vi.fn(),
                  clearRect: vi.fn(),
                  fill: vi.fn(),
                  stroke: vi.fn(),
                  beginPath: vi.fn(),
                  closePath: vi.fn(),
                  moveTo: vi.fn(),
                  lineTo: vi.fn(),
                  quadraticCurveTo: vi.fn(),
                  bezierCurveTo: vi.fn(),
                  arc: vi.fn(),
                  arcTo: vi.fn(),
                  ellipse: vi.fn(),
                  rect: vi.fn(),
                  fillText: vi.fn(),
                  strokeText: vi.fn(),
                  measureText: vi.fn(() => ({ width: 100 })),
                  scale: vi.fn(),
                  rotate: vi.fn(),
                  translate: vi.fn(),
                  transform: vi.fn(),
                  setTransform: vi.fn(),
                  resetTransform: vi.fn(),
                  save: vi.fn(),
                  restore: vi.fn(),
                  drawImage: vi.fn(),
                  createImageData: vi.fn(),
                  getImageData: vi.fn(() => ({
                    data: new Uint8ClampedArray(4),
                    width: 1,
                    height: 1,
                  })),
                  putImageData: vi.fn(),
                  createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
                  createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
                  createPattern: vi.fn(),
                  clip: vi.fn(),
                  isPointInPath: vi.fn(() => false),
                  isPointInStroke: vi.fn(() => false),
                  setLineDash: vi.fn(),
                  getLineDash: vi.fn(() => []),
                  canvas: this,
                };
              }
              return null;
            }),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            getAttribute: vi.fn(() => null),
            setAttribute: vi.fn(),
            removeAttribute: vi.fn(),
          };
          return mockCanvas;
        }

        // Handle other common selectors
        if (selector.includes('settings-container')) {
          return element; // Return self if looking for settings container
        }
        if (selector.includes('ui-tabs')) {
          return element; // Return self for tab containers
        }
        if (selector.includes('ui-button')) {
          return {
            tagName: 'BUTTON',
            className: 'ui-button',
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            click: vi.fn(),
          };
        }

        return null;
      }),
      querySelectorAll: vi.fn((selector: string) => {
        // Handle common multi-element queries
        if (selector.includes('ui-button')) {
          return [
            {
              tagName: 'BUTTON',
              className: 'ui-button',
              addEventListener: vi.fn(),
              removeEventListener: vi.fn(),
              click: vi.fn(),
            },
          ];
        }
        return [];
      }),
      getElementById: vi.fn((id: string) => {
        if (id === 'simulation-canvas' || id.includes('canvas')) {
          // Create a proper canvas mock element
          const canvasElement = {
            id,
            tagName: 'CANVAS',
            width: 800,
            height: 600,
            getContext: vi.fn(() => ({
              fillStyle: '',
              strokeStyle: '',
              clearRect: vi.fn(),
              fillRect: vi.fn(),
              strokeRect: vi.fn(),
              beginPath: vi.fn(),
              moveTo: vi.fn(),
              lineTo: vi.fn(),
              arc: vi.fn(),
              fill: vi.fn(),
              stroke: vi.fn(),
              save: vi.fn(),
              restore: vi.fn(),
              translate: vi.fn(),
              scale: vi.fn(),
              rotate: vi.fn(),
              drawImage: vi.fn(),
              createImageData: vi.fn(),
              getImageData: vi.fn(),
              putImageData: vi.fn(),
              measureText: vi.fn(() => ({ width: 100 })),
            })),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
            style: {},
            classList: {
              add: vi.fn(),
              remove: vi.fn(),
              contains: vi.fn(() => false),
              toggle: vi.fn(),
            },
            getAttribute: vi.fn(),
            setAttribute: vi.fn(),
            removeAttribute: vi.fn(),
            parentNode: null,
            parentElement: null,
            ownerDocument: document,
            nodeType: 1,
            [Symbol.toStringTag]: 'HTMLCanvasElement',
          };
          return canvasElement;
        }
        return null;
      }),
      getElementsByClassName: vi.fn(() => []),
      getElementsByTagName: vi.fn(() => []),

      // Event methods
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),

      // Attribute methods
      getAttribute: vi.fn(() => null),
      setAttribute: vi.fn(),
      removeAttribute: vi.fn(),
      hasAttribute: vi.fn(() => false),
      getAttributeNames: vi.fn(() => []),

      // CSS and styling
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(() => false),
        toggle: vi.fn(),
        replace: vi.fn(),
        item: vi.fn(() => null),
        length: 0,
        value: '',
      },
      style: {},

      // Special properties for specific elements
      ...(tagName.toLowerCase() === 'canvas'
        ? {
            width: 800,
            height: 600,
            getContext: vi.fn(() => null),
          }
        : {}),

      ...(tagName.toLowerCase() === 'input'
        ? {
            value: '',
            checked: false,
            type: 'text',
            disabled: false,
          }
        : {}),

      ...(tagName.toLowerCase() === 'select'
        ? {
            value: '',
            selectedIndex: -1,
            options: [],
          }
        : {}),
    } as any;
  }

  // Mock specific elements for better testing
  if (tagName.toLowerCase() === 'canvas') {
    // Enhance canvas elements with proper width/height and getContext
    if (!element.hasOwnProperty('width')) {
      Object.defineProperty(element, 'width', {
        get: function () {
          return this._width || 800;
        },
        set: function (value) {
          this._width = value;
        },
        configurable: true,
      });
    }

    if (!element.hasOwnProperty('height')) {
      Object.defineProperty(element, 'height', {
        get: function () {
          return this._height || 600;
        },
        set: function (value) {
          this._height = value;
        },
        configurable: true,
      });
    }

    if (!(element as any).getContext) {
      (element as any).getContext = vi.fn((type: string) => {
        if (type === '2d') {
          return {
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
            font: '',
            textAlign: 'start',
            textBaseline: 'alphabetic',
            globalAlpha: 1,
            globalCompositeOperation: 'source-over',
            shadowBlur: 0,
            shadowColor: '',
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            lineCap: 'butt',
            lineJoin: 'miter',
            miterLimit: 10,
            lineDashOffset: 0,
            fillRect: vi.fn(),
            strokeRect: vi.fn(),
            clearRect: vi.fn(),
            fill: vi.fn(),
            stroke: vi.fn(),
            beginPath: vi.fn(),
            closePath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            quadraticCurveTo: vi.fn(),
            bezierCurveTo: vi.fn(),
            arc: vi.fn(),
            arcTo: vi.fn(),
            ellipse: vi.fn(),
            rect: vi.fn(),
            fillText: vi.fn(),
            strokeText: vi.fn(),
            measureText: vi.fn(() => ({ width: 100 })),
            scale: vi.fn(),
            rotate: vi.fn(),
            translate: vi.fn(),
            transform: vi.fn(),
            setTransform: vi.fn(),
            resetTransform: vi.fn(),
            save: vi.fn(),
            restore: vi.fn(),
            drawImage: vi.fn(),
            createImageData: vi.fn(),
            getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })),
            putImageData: vi.fn(),
            createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
            createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
            createPattern: vi.fn(),
            clip: vi.fn(),
            isPointInPath: vi.fn(() => false),
            isPointInStroke: vi.fn(() => false),
            setLineDash: vi.fn(),
            getLineDash: vi.fn(() => []),
            canvas: element,
          };
        }
        return null;
      });
    }

    // Enhanced event handling for canvas touch events
    if (!element._eventListeners) {
      element._eventListeners = {};
    }

    element.addEventListener = function (type: string, listener: any, options?: any) {
      if (!this._eventListeners[type]) this._eventListeners[type] = [];
      this._eventListeners[type].push({ listener, options });
    };

    element.removeEventListener = function (type: string, listener: any) {
      if (this._eventListeners[type]) {
        this._eventListeners[type] = this._eventListeners[type].filter(
          (item: any) => item.listener !== listener
        );
      }
    };

    element.dispatchEvent = function (event: Event) {
      // Set proper event properties
      Object.defineProperty(event, 'target', { value: this, configurable: true });
      Object.defineProperty(event, 'currentTarget', { value: this, configurable: true });

      // Call all registered listeners
      const listeners = this._eventListeners[event.type];
      if (listeners && Array.isArray(listeners)) {
        listeners.forEach((item: any) => {
          try {
            if (typeof item.listener === 'function') {
              item.listener.call(this, event);
            } else if (item.listener && typeof item.listener.handleEvent === 'function') {
              item.listener.handleEvent.call(item.listener, event);
            }
          } catch (error) {
            // Don't let listener errors break event propagation
            console.warn('Event listener error:', error);
          }
        });
      }
      return true;
    };
  }

  // Add size properties for container elements (div, etc.)
  if (tagName.toLowerCase() === 'div') {
    // Add offsetWidth and offsetHeight properties for responsive calculations
    Object.defineProperty(element, 'offsetWidth', {
      get: function () {
        // Parse CSS width or use default
        const styleWidth = this.style?.width;
        if (styleWidth && styleWidth.includes('px')) {
          return parseInt(styleWidth.replace('px', ''));
        }
        return 800; // Default container width
      },
      configurable: true,
    });

    Object.defineProperty(element, 'offsetHeight', {
      get: function () {
        // Parse CSS height or use default
        const styleHeight = this.style?.height;
        if (styleHeight && styleHeight.includes('px')) {
          return parseInt(styleHeight.replace('px', ''));
        }
        return 600; // Default container height
      },
      configurable: true,
    });

    Object.defineProperty(element, 'clientWidth', {
      get: function () {
        return this.offsetWidth;
      },
      configurable: true,
    });

    Object.defineProperty(element, 'clientHeight', {
      get: function () {
        return this.offsetHeight;
      },
      configurable: true,
    });

    // Enhanced getBoundingClientRect for container elements
    element.getBoundingClientRect = vi.fn(function () {
      return {
        x: 0,
        y: 0,
        width: this.offsetWidth || 800,
        height: this.offsetHeight || 600,
        top: 0,
        right: this.offsetWidth || 800,
        bottom: this.offsetHeight || 600,
        left: 0,
        toJSON: vi.fn(),
      };
    });
  }

  // Enhanced innerHTML setter for better querySelector support
  if (element && element.innerHTML !== undefined) {
    const originalInnerHTMLSetter = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(element),
      'innerHTML'
    )?.set;
    if (originalInnerHTMLSetter) {
      Object.defineProperty(element, 'innerHTML', {
        get: function () {
          return this._innerHTML || '';
        },
        set: function (value) {
          this._innerHTML = value;
          originalInnerHTMLSetter.call(this, value);

          // Create mock elements for querySelector when innerHTML contains specific patterns
          this._innerElements = this._innerElements || {};

          if (value.includes('<canvas')) {
            const mockCanvas = originalCreateElement('canvas');
            if (mockCanvas && (mockCanvas as any).getContext) {
              this._innerElements['canvas'] = mockCanvas;
              this._innerElements['.heatmap-canvas'] = mockCanvas;
            }
          }

          if (value.includes('heatmap-legend')) {
            this._innerElements['.heatmap-legend'] = originalCreateElement('div');
          }
        },
        configurable: true,
      });

      // Enhanced querySelector
      const originalQuerySelector = element.querySelector;
      element.querySelector = vi.fn((selector: string) => {
        if (element._innerElements && element._innerElements[selector]) {
          return element._innerElements[selector];
        }
        return originalQuerySelector ? originalQuerySelector.call(element, selector) : null;
      });
    }
  }

  return element;
});

// Enhance document.body and document.head to prevent appendChild failures
if (global.document && global.document.body) {
  // Ensure body has proper children arrays
  if (!Array.isArray(global.document.body.children)) {
    Object.defineProperty(global.document.body, 'children', {
      value: [],
      writable: true,
      configurable: true,
    });
  }
  if (!Array.isArray(global.document.body.childNodes)) {
    Object.defineProperty(global.document.body, 'childNodes', {
      value: [],
      writable: true,
      configurable: true,
    });
  }

  const originalBodyAppendChild = global.document.body.appendChild;
  global.document.body.appendChild = function (child: any) {
    // Enhanced Node validation for jsdom compatibility
    if (!child || typeof child !== 'object') {
      throw new TypeError(
        `Failed to execute 'appendChild' on 'Node': parameter 1 is not of type 'Node'.`
      );
    }

    // Ensure child has complete Node interface for jsdom validation
    if (!child.nodeType) {
      child.nodeType = 1; // ELEMENT_NODE
    }
    if (!child.nodeName && child.tagName) {
      child.nodeName = child.tagName;
    }
    if (!child.ownerDocument) {
      child.ownerDocument = document;
    }
    // Add jsdom Symbol.toStringTag for proper type validation
    if (!child[Symbol.toStringTag]) {
      child[Symbol.toStringTag] = 'HTMLElement';
    }

    // Try original first, fall back to mock behavior
    try {
      return originalBodyAppendChild.call(this, child);
    } catch (error) {
      // Mock appendChild behavior - ensure arrays are properly initialized
      if (!Array.isArray(this.children)) this.children = [];
      if (!Array.isArray(this.childNodes)) this.childNodes = [];
      this.children.push(child);
      this.childNodes.push(child);
      child.parentNode = this;
      child.parentElement = this;
      return child;
    }
  };
}

if (global.document && global.document.head) {
  // Ensure head has proper children arrays
  if (!Array.isArray(global.document.head.children)) {
    Object.defineProperty(global.document.head, 'children', {
      value: [],
      writable: true,
      configurable: true,
    });
  }
  if (!Array.isArray(global.document.head.childNodes)) {
    Object.defineProperty(global.document.head, 'childNodes', {
      value: [],
      writable: true,
      configurable: true,
    });
  }

  const originalHeadAppendChild = global.document.head.appendChild;
  global.document.head.appendChild = function (child: any) {
    // Enhanced Node validation for jsdom compatibility
    if (!child || typeof child !== 'object') {
      throw new TypeError(
        `Failed to execute 'appendChild' on 'Node': parameter 1 is not of type 'Node'.`
      );
    }

    // Ensure child has complete Node interface for jsdom validation
    if (!child.nodeType) {
      child.nodeType = 1; // ELEMENT_NODE
    }
    if (!child.nodeName && child.tagName) {
      child.nodeName = child.tagName;
    }
    if (!child.ownerDocument) {
      child.ownerDocument = document;
    }
    // Add jsdom Symbol.toStringTag for proper type validation
    if (!child[Symbol.toStringTag]) {
      child[Symbol.toStringTag] = 'HTMLElement';
    }

    // Try original first, fall back to mock behavior
    try {
      return originalHeadAppendChild.call(this, child);
    } catch (error) {
      // Mock appendChild behavior - ensure arrays are properly initialized
      if (!Array.isArray(this.children)) this.children = [];
      if (!Array.isArray(this.childNodes)) this.childNodes = [];
      this.children.push(child);
      this.childNodes.push(child);
      child.parentNode = this;
      child.parentElement = this;
      return child;
    }
  };
}

// Mock TouchEvent for mobile tests
if (!global.TouchEvent) {
  (global as any).TouchEvent = class MockTouchEvent extends Event {
    public touches: TouchList;
    public changedTouches: TouchList;
    public targetTouches: TouchList;

    constructor(type: string, eventInitDict?: any) {
      super(type, eventInitDict);

      // Convert touch arrays to TouchList-like objects
      this.touches = this.createTouchList(eventInitDict?.touches || []);
      this.changedTouches = this.createTouchList(eventInitDict?.changedTouches || []);
      this.targetTouches = this.createTouchList(eventInitDict?.targetTouches || []);
    }

    private createTouchList(touches: any[]): TouchList {
      const touchList = touches as any;
      touchList.item = (index: number) => touches[index] || null;
      return touchList;
    }
  };
}

// Complete setup - all done
// Add missing browser APIs for mobile tests
if (!global.requestAnimationFrame) {
  global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
    const timeoutId = setTimeout(() => callback(performance.now()), 16);
    return timeoutId as unknown as number;
  });
}

if (!global.cancelAnimationFrame) {
  global.cancelAnimationFrame = vi.fn((id: number) => {
    clearTimeout(id as unknown as NodeJS.Timeout);
  });
}

// Also set on window for source code access
if (typeof window !== 'undefined') {
  window.requestAnimationFrame = global.requestAnimationFrame;
  window.cancelAnimationFrame = global.cancelAnimationFrame;
}

// Add ResizeObserver mock for mobile canvas management
if (!global.ResizeObserver) {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
}

// Add IntersectionObserver mock for mobile features
if (!global.IntersectionObserver) {
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
}

// Add touchstart/touchend events support for mobile testing
if (global.document && global.document.createElement) {
  const originalCreateElement = global.document.createElement;
  global.document.createElement = function (tagName: string, options?: ElementCreationOptions) {
    const element = originalCreateElement.call(this, tagName, options);

    // Enhance canvas elements with touch event support
    if (tagName.toLowerCase() === 'canvas' && element) {
      // Add missing canvas properties for mobile tests
      if (!element.style) {
        element.style = {};
      }

      // Enhanced getBoundingClientRect for proper coordinate calculations
      element.getBoundingClientRect = vi.fn(() => ({
        x: 0,
        y: 0,
        width: element.width || 800,
        height: element.height || 600,
        top: 0,
        right: element.width || 800,
        bottom: element.height || 600,
        left: 0,
        toJSON: vi.fn(),
      }));

      // Ensure canvas has proper default dimensions
      if (!element.width) element.width = 800;
      if (!element.height) element.height = 600;

      // Mock offsetWidth and offsetHeight for responsive calculations
      Object.defineProperty(element, 'offsetWidth', {
        get: () => element.width || 800,
        configurable: true,
      });
      Object.defineProperty(element, 'offsetHeight', {
        get: () => element.height || 600,
        configurable: true,
      });

      // Mock clientWidth and clientHeight for container calculations
      Object.defineProperty(element, 'clientWidth', {
        get: () => element.width || 800,
        configurable: true,
      });
      Object.defineProperty(element, 'clientHeight', {
        get: () => element.height || 600,
        configurable: true,
      });

      // Add touch event support
      element.dispatchEvent = vi.fn((event: Event) => {
        // Mock successful event dispatch
        return true;
      });
    }

    return element;
  };
}

// Ensure console methods are available for debugging
if (!global.console) {
  global.console = {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    group: vi.fn(),
    groupEnd: vi.fn(),
    time: vi.fn(),
    timeEnd: vi.fn(),
    assert: vi.fn(),
    clear: vi.fn(),
    count: vi.fn(),
    countReset: vi.fn(),
    dir: vi.fn(),
    dirxml: vi.fn(),
    table: vi.fn(),
    profile: vi.fn(),
    profileEnd: vi.fn(),
    timeLog: vi.fn(),
    timeStamp: vi.fn(),
  } as any;
}

// Complete setup - all done
