import { vi } from 'vitest';

// Global test setup for Vitest

// Mock window.matchMedia
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

// Mock Fullscreen API
Object.defineProperty(document, 'fullscreenElement', {
  value: null,
  writable: true,
  configurable: true,
});
document.exitFullscreen = vi.fn(() => Promise.resolve());
HTMLElement.prototype.requestFullscreen = vi.fn(() => Promise.resolve());

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

// Mock Chart.js
vi.mock('chart.js', async () => {
  const mockChart = {
    register: vi.fn(),
    Chart: vi.fn().mockImplementation(() => ({
      destroy: vi.fn(),
      update: vi.fn(),
      resize: vi.fn(),
      render: vi.fn(),
      clear: vi.fn(),
      stop: vi.fn(),
      reset: vi.fn(),
      toBase64Image: vi.fn(),
      generateLegend: vi.fn(),
      data: { datasets: [] },
      options: {},
      canvas: null,
      ctx: null,
    })),
    registerables: [],
  };

  return {
    Chart: mockChart.Chart,
    registerables: mockChart.registerables,
    default: mockChart.Chart,
  };
});

// Mock chartjs-adapter-date-fns
vi.mock('chartjs-adapter-date-fns', () => ({}));

// Mock DOM element creation to prevent null reference errors
const originalCreateElement = document.createElement.bind(document);
document.createElement = vi.fn((tagName: string, options?: ElementCreationOptions) => {
  const element = originalCreateElement(tagName, options);

  // Mock a canvas element specifically with getContext
  if (tagName.toLowerCase() === 'canvas') {
    Object.defineProperty(element, 'width', {
      get: function () {
        return this._width || 800;
      },
      set: function (value) {
        this._width = value;
      },
      configurable: true,
    });

    Object.defineProperty(element, 'height', {
      get: function () {
        return this._height || 600;
      },
      set: function (value) {
        this._height = value;
      },
      configurable: true,
    });

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
          getImageData: vi.fn(() => ({
            data: new Uint8ClampedArray(4),
            width: 1,
            height: 1,
          })),
          putImageData: vi.fn(),
          createLinearGradient: vi.fn(() => ({
            addColorStop: vi.fn(),
          })),
          createRadialGradient: vi.fn(() => ({
            addColorStop: vi.fn(),
          })),
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

  // Ensure all elements have basic properties that might be accessed
  if (!element.style) {
    element.style = {
      display: '',
      position: '',
      top: '',
      left: '',
      width: '',
      height: '',
      visibility: '',
      opacity: '',
      transform: '',
      transition: '',
      backgroundColor: '',
      color: '',
      border: '',
      borderRadius: '',
      padding: '',
      margin: '',
      fontSize: '',
      fontFamily: '',
      textAlign: '',
      zIndex: '',
      overflow: '',
      cursor: '',
      pointerEvents: '',
      boxShadow: '',
      outline: '',
      setProperty: vi.fn(),
      getPropertyValue: vi.fn(() => ''),
      removeProperty: vi.fn(),
    } as any;
  }

  // Ensure className property exists
  if (!element.hasOwnProperty('className')) {
    Object.defineProperty(element, 'className', {
      get: function () {
        return this._className || '';
      },
      set: function (value) {
        this._className = value;
      },
      configurable: true,
    });
  }

  // Ensure classList exists
  if (!element.classList) {
    element.classList = {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(() => false),
      toggle: vi.fn(),
      replace: vi.fn(),
      value: '',
      length: 0,
      item: vi.fn(),
      forEach: vi.fn(),
      [Symbol.iterator]: function* () {},
    } as any;
  }

  // Mock innerHTML and querySelector for proper DOM simulation
  let _innerHTML = '';
  Object.defineProperty(element, 'innerHTML', {
    get: function () {
      return _innerHTML;
    },
    set: function (value) {
      _innerHTML = value;
      // When innerHTML is set, we need to mock querySelector to return appropriate elements
      this._innerElements = {};

      // Mock common selectors that HeatmapComponent uses
      if (value.includes('heatmap-canvas')) {
        this._innerElements['.heatmap-canvas'] = originalCreateElement('canvas');
        // Ensure the canvas has proper width/height properties
        Object.defineProperty(this._innerElements['.heatmap-canvas'], 'width', {
          get: function () {
            return this._width || 800;
          },
          set: function (value) {
            this._width = value;
          },
          configurable: true,
        });

        Object.defineProperty(this._innerElements['.heatmap-canvas'], 'height', {
          get: function () {
            return this._height || 600;
          },
          set: function (value) {
            this._height = value;
          },
          configurable: true,
        });

        (this._innerElements['.heatmap-canvas'] as any).getContext = vi.fn((type: string) => {
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
              createLinearGradient: vi.fn(() => ({
                addColorStop: vi.fn(),
              })),
              createRadialGradient: vi.fn(() => ({
                addColorStop: vi.fn(),
              })),
              createPattern: vi.fn(),
              clip: vi.fn(),
              isPointInPath: vi.fn(() => false),
              isPointInStroke: vi.fn(() => false),
              setLineDash: vi.fn(),
              getLineDash: vi.fn(() => []),
              canvas: this._innerElements['.heatmap-canvas'],
            };
          }
          return null;
        });
      }

      if (value.includes('heatmap-legend')) {
        this._innerElements['.heatmap-legend'] = originalCreateElement('div');
      }
    },
    configurable: true,
  });

  // Mock querySelector to return the appropriate inner elements
  element.querySelector = vi.fn((selector: string) => {
    if (element._innerElements && element._innerElements[selector]) {
      return element._innerElements[selector];
    }
    return null;
  });

  // Add common properties that tests might expect
  Object.defineProperty(element, 'offsetWidth', {
    get: () => 100,
    configurable: true,
  });

  Object.defineProperty(element, 'offsetHeight', {
    get: () => 100,
    configurable: true,
  });

  Object.defineProperty(element, 'clientWidth', {
    get: () => 100,
    configurable: true,
  });

  Object.defineProperty(element, 'clientHeight', {
    get: () => 100,
    configurable: true,
  });

  return element;
});

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
