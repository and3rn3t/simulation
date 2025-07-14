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
import { BaseComponent } from './BaseComponent';

export interface TrailConfig {
  maxTrailLength: number;
  trailFadeRate: number;
  trailWidth: number;
  colorScheme: string[];
  showTrails: boolean;
}

export interface OrganismTrail {
  id: string;
  positions: { x: number; y: number; timestamp: number }[];
  color: string;
  type: string;
}

/**
 * Organism Trail Visualization Component
 * Displays movement trails and patterns of organisms
 */
export class OrganismTrailComponent extends BaseComponent {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: TrailConfig;
  private trails: Map<string, OrganismTrail> = new Map();
  private animationFrame: number | null = null;

  constructor(canvas: HTMLCanvasElement, config: Partial<TrailConfig> = {}, id?: string) {
    super(id);

    this.config = {
      maxTrailLength: 50,
      trailFadeRate: 0.02,
      trailWidth: 2,
      colorScheme: [
        '#4CAF50', // Green
        '#2196F3', // Blue
        '#FF9800', // Orange
        '#E91E63', // Pink
        '#9C27B0', // Purple
        '#00BCD4', // Cyan
      ],
      showTrails: true,
      ...config,
    };

    this.canvas = canvas;
    const ctx = canvas?.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context for trail canvas');
    }
    this.ctx = ctx;

    this.createElement();
    this.startAnimation();
  }

  protected createElement(): void {
    this.element = document.createElement('div');
    this.element.className = 'trail-component';
    this.element.innerHTML = `
      <div class="trail-controls">
        <label class="trail-toggle">
          <input type="checkbox" ${this.config.showTrails ? 'checked' : ''}>
          <span>Show Trails</span>
        </label>
        <div class="trail-settings">
          <label>
            Trail Length: 
            <input type="range" class="trail-length" min="10" max="100" value="${this.config.maxTrailLength}">
            <span class="trail-length-value">${this.config.maxTrailLength}</span>
          </label>
          <label>
            Trail Width: 
            <input type="range" class="trail-width" min="1" max="5" step="0.5" value="${this.config.trailWidth}">
            <span class="trail-width-value">${this.config.trailWidth}</span>
          </label>
        </div>
      </div>
      <div class="trail-stats">
        <span class="active-trails">Active Trails: 0</span>
        <span class="total-points">Total Points: 0</span>
      </div>
    `;

    this.setupControls();
  }

  private setupControls(): void {
    // Trail toggle
    const toggle = this.element?.querySelector('.trail-toggle input') as HTMLInputElement;
    toggle?.addEventListener('change', event => {
      try {
        this.config.showTrails = (event.target as HTMLInputElement).checked;
        if (!this.config.showTrails) {
          this.clearAllTrails();
        }
      } catch (error) {
        console.error('Event listener error for change:', error);
      }
    });

    // Trail length control
    const lengthSlider = this.element?.querySelector('.trail-length') as HTMLInputElement;
    const lengthValue = this.element?.querySelector('.trail-length-value') as HTMLElement;
    lengthSlider?.addEventListener('input', event => {
      try {
        this.config.maxTrailLength = parseInt((event.target as HTMLInputElement).value);
        lengthValue.textContent = this.config.maxTrailLength.toString();
        this.trimAllTrails();
      } catch (error) {
        console.error('Event listener error for input:', error);
      }
    });

    // Trail width control
    const widthSlider = this.element?.querySelector('.trail-width') as HTMLInputElement;
    const widthValue = this.element?.querySelector('.trail-width-value') as HTMLElement;
    widthSlider?.addEventListener('input', event => {
      try {
        this.config.trailWidth = parseFloat((event.target as HTMLInputElement).value);
        widthValue.textContent = this.config.trailWidth.toString();
      } catch (error) {
        console.error('Event listener error for input:', error);
      }
    });
  }

  /**
   * Update organism position and add to trail
   */
  updateOrganismPosition(id: string, x: number, y: number, type: string): void {
    if (!this.config.showTrails) return;

    let trail = this.trails.get(id);

    if (!trail) {
      const colorIndex = this.trails.size % this.config.colorScheme.length;
      trail = {
        id,
        positions: [],
        color: this.config.colorScheme[colorIndex],
        type,
      };
      this.trails.set(id, trail);
    }

    // Add new position
    trail.positions.push({
      x,
      y,
      timestamp: Date.now(),
    });

    // Trim trail if too long
    if (trail.positions.length > this.config.maxTrailLength) {
      trail.positions.shift();
    }
  }

  /**
   * Remove organism trail
   */
  removeOrganismTrail(id: string): void {
    this.trails.delete(id);
  }

  /**
   * Clear all trails
   */
  clearAllTrails(): void {
    this.trails.clear();
  }

  private trimAllTrails(): void {
    this.trails.forEach(trail => {
      try {
        if (trail.positions.length > this.config.maxTrailLength) {
          trail.positions = trail.positions.slice(-this.config.maxTrailLength);
        }
      } catch (error) {
        console.error('Callback error:', error);
      }
    });
  }

  private startAnimation(): void {
    const animate = () => {
      this.render();
      this.updateStats();
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  private render(): void {
    if (!this.config.showTrails) return;

    const currentTime = Date.now();

    this.trails.forEach(trail => {
      try {
        if (trail.positions.length < 2) return;

        this.ctx.save();
        this.ctx.strokeStyle = trail.color;
        this.ctx.lineWidth = this.config.trailWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Draw trail with fading effect
        for (let i = 1; i < trail.positions.length; i++) {
          const prev = trail.positions[i - 1];
          const curr = trail.positions[i];

          // Calculate age-based opacity
          const age = currentTime - curr.timestamp;
          const maxAge = 10000; // 10 seconds
          const opacity = Math.max(0, 1 - age / maxAge);

          // Calculate position-based opacity (newer positions are more opaque)
          const positionOpacity = i / trail.positions.length;

          const finalOpacity = Math.min(opacity, positionOpacity) * 0.8;

          if (finalOpacity > 0.1) {
            this.ctx.globalAlpha = finalOpacity;

            this.ctx.beginPath();
            this.ctx.moveTo(prev.x, prev.y);
            this.ctx.lineTo(curr.x, curr.y);
            this.ctx.stroke();
          }
        }

        this.ctx.restore();
      } catch (error) {
        console.error('Callback error:', error);
      }
    });

    // Clean up old trail points
    this.cleanupOldTrails(currentTime);
  }

  private cleanupOldTrails(currentTime: number): void {
    const maxAge = 10000; // 10 seconds

    this.trails.forEach((trail, id) => {
      // Remove old positions
      trail.positions = trail.positions.filter(pos => currentTime - pos.timestamp < maxAge);

      // Remove trail if no positions left
      if (trail.positions.length === 0) {
        this.trails.delete(id);
      }
    });
  }

  private updateStats(): void {
    const activeTrails = this.trails.size;
    const totalPoints = Array.from(this.trails.values()).reduce(
      (sum, trail) => sum + trail.positions.length,
      0
    );

    const activeTrailsElement = this.element?.querySelector('.active-trails') as HTMLElement;
    const totalPointsElement = this.element?.querySelector('.total-points') as HTMLElement;

    if (activeTrailsElement) {
      activeTrailsElement.textContent = `Active Trails: ${activeTrails}`;
    }
    if (totalPointsElement) {
      totalPointsElement.textContent = `Total Points: ${totalPoints}`;
    }
  }

  /**
   * Export trail data for analysis
   */
  exportTrailData(): { [id: string]: OrganismTrail } {
    const data: { [id: string]: OrganismTrail } = {};
    this.trails.forEach((trail, id) => {
      data[id] = { ...trail };
    });
    return data;
  }

  /**
   * Import trail data
   */
  importTrailData(data: { [id: string]: OrganismTrail }): void {
    this.trails.clear();
    Object.entries(data).forEach(([id, trail]) => {
      this.trails.set(id, trail);
    });
  }

  /**
   * Get movement patterns analysis
   */
  getMovementAnalysis(): {
    averageSpeed: number;
    totalDistance: number;
    directionChanges: number;
    clusteringIndex: number;
  } {
    let totalDistance = 0;
    let totalSpeed = 0;
    let directionChanges = 0;
    let totalTrails = 0;

    this.trails.forEach(trail => {
      try {
        if (trail.positions.length < 2) return;

        totalTrails++;
        let trailDistance = 0;
        let prevDirection = 0;
        let trailDirectionChanges = 0;

        for (let i = 1; i < trail.positions.length; i++) {
          const prev = trail.positions[i - 1];
          const curr = trail.positions[i];

          const dx = curr.x - prev.x;
          const dy = curr.y - prev.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          trailDistance += distance;

          // Calculate direction change
          const direction = Math.atan2(dy, dx);
          if (i > 1) {
            const directionChange = Math.abs(direction - prevDirection);
            if (directionChange > Math.PI / 4) {
              // 45 degrees
              trailDirectionChanges++;
            }
          }
          prevDirection = direction;
        }

        totalDistance += trailDistance;
        directionChanges += trailDirectionChanges;

        // Calculate speed (distance per time)
        if (trail.positions.length > 1) {
          const timeSpan =
            trail.positions[trail.positions.length - 1].timestamp - trail.positions[0].timestamp;
          if (timeSpan > 0) {
            totalSpeed += trailDistance / (timeSpan / 1000); // pixels per second
          }
        }
      } catch (error) {
        console.error('Callback error:', error);
      }
    });

    return {
      averageSpeed: totalTrails > 0 ? totalSpeed / totalTrails : 0,
      totalDistance,
      directionChanges,
      clusteringIndex: this.calculateClusteringIndex(),
    };
  }

  private calculateClusteringIndex(): number {
    // Simple clustering index based on how spread out the trails are
    if (this.trails.size < 2) return 0;

    const positions = Array.from(this.trails.values())
      .flatMap(trail => trail.positions.slice(-5)) // Use recent positions
      .map(pos => ({ x: pos.x, y: pos.y }));

    if (positions.length < 2) return 0;

    // Calculate average distance from center
    const centerX = positions.reduce((sum, pos) => sum + pos.x, 0) / positions.length;
    const centerY = positions.reduce((sum, pos) => sum + pos.y, 0) / positions.length;

    const avgDistance =
      positions.reduce((sum, pos) => {
        const dx = pos.x - centerX;
        const dy = pos.y - centerY;
        return sum + Math.sqrt(dx * dx + dy * dy);
      }, 0) / positions.length;

    // Normalize to canvas size
    const canvasSize = Math.sqrt(
      this.canvas.width * this.canvas.width + this.canvas.height * this.canvas.height
    );
    return 1 - avgDistance / canvasSize;
  }

  public unmount(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.clearAllTrails();
    super.unmount();
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
