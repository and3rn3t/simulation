import { isMobileDevice } from './MobileDetection';

export interface VisualEffectsConfig {
  quality?: 'low' | 'medium' | 'high';
  particleCount?: number;
  animationSpeed?: number;
  enableShake?: boolean;
  enableFlash?: boolean;
  enableParticles?: boolean;
}

export interface ParticleEffect {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

/**
 * Mobile Visual Effects - Simplified implementation for mobile-optimized visual effects
 */
export class MobileVisualEffects {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: VisualEffectsConfig;
  private activeEffects: Map<string, any> = new Map();
  private particles: ParticleEffect[] = [];
  private animationFrame: number | null = null;
  private isEnabled: boolean = false;

  constructor(canvas: HTMLCanvasElement, config: VisualEffectsConfig = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.config = {
      quality: 'medium',
      particleCount: 50,
      animationSpeed: 1,
      enableShake: true,
      enableFlash: true,
      enableParticles: true,
      ...config,
    };

    this.isEnabled = isMobileDevice();

    if (this.isEnabled) {
      this.init();
    }
  }

  /**
   * Initialize the visual effects system
   */
  private init(): void {
    // Adjust quality based on mobile performance
    if (this.config.quality === 'low') {
      this.ctx.globalCompositeOperation = 'source-over';
      this.config.particleCount = Math.min(this.config.particleCount || 50, 20);
    }

    this.startRenderLoop();
  }

  /**
   * Start the render loop for animated effects
   */
  private startRenderLoop(): void {
    const render = () => {
      this.updateEffects();
      this.renderParticles();

      if (this.isEnabled && (this.activeEffects.size > 0 || this.particles.length > 0)) {
        this.animationFrame = requestAnimationFrame(render);
      } else {
        this.animationFrame = null;
      }
    };

    if (!this.animationFrame) {
      this.animationFrame = requestAnimationFrame(render);
    }
  }

  /**
   * Add a screen shake effect
   */
  public addShakeEffect(duration: number = 500, intensity: number = 10): void {
    if (!this.isEnabled || !this.config.enableShake) return;

    const shakeId = `shake_${Date.now()}`;
    const startTime = Date.now();
    const originalTransform = this.canvas.style.transform || '';

    const shake = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        this.canvas.style.transform = originalTransform;
        this.activeEffects.delete(shakeId);
        return;
      }

      const currentIntensity = intensity * (1 - progress);
      const x = (Math.random() - 0.5) * currentIntensity;
      const y = (Math.random() - 0.5) * currentIntensity;

      this.canvas.style.transform = `${originalTransform} translate(${x}px, ${y}px)`;
      requestAnimationFrame(shake);
    };

    this.activeEffects.set(shakeId, { type: 'shake', startTime, duration });
    shake();
  }

  /**
   * Update all active effects
   */
  private updateEffects(): void {
    const now = Date.now();

    for (const [id, effect] of this.activeEffects) {
      const elapsed = now - effect.startTime;
      if (elapsed >= effect.duration) {
        this.activeEffects.delete(id);
      }
    }
  }

  /**
   * Render all particles
   */
  private renderParticles(): void {
    if (this.particles.length === 0) return;

    this.ctx.save();

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      // Update particle
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.1; // gravity
      particle.life++;

      // Remove expired particles
      if (particle.life >= particle.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      // Render particle
      const alpha = 1 - particle.life / particle.maxLife;
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  /**
   * Clear all active effects
   */
  public clearAllEffects(): void {
    // Cancel any running animations
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    // Reset canvas transform
    this.canvas.style.transform = '';

    // Clear effects and particles
    this.activeEffects.clear();
    this.particles = [];
  }

  /**
   * Check if effects are enabled
   */
  public isEffectsEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Cleanup and dispose of resources
   */
  public dispose(): void {
    this.clearAllEffects();
    this.isEnabled = false;
  }
}
