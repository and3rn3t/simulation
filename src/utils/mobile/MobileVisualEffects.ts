import { isMobileDevice } from '../system/mobileDetection';

/**
 * Mobile Visual Effects - Optimized visual effects for mobile devices
 */

export interface MobileEffectConfig {
  particleCount: number;
  animationDuration: number;
  enableBlur: boolean;
  enableGlow: boolean;
  enableTrails: boolean;
  quality: 'low' | 'medium' | 'high';
}

export class MobileVisualEffects {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: MobileEffectConfig;
  private particles: Particle[] = [];
  private activeEffects: Map<string, Effect> = new Map();
  private animationFrame?: number;

  constructor(canvas: HTMLCanvasElement, config: Partial<MobileEffectConfig> = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.config = {
      particleCount: this.getOptimalParticleCount(),
      animationDuration: 1000,
      enableBlur: this.shouldEnableBlur(),
      enableGlow: this.shouldEnableGlow(),
      enableTrails: this.shouldEnableTrails(),
      quality: this.getOptimalQuality(),
      ...config,
    };

    this.setupOptimizations();
  }

  /**
   * Get optimal particle count based on device
   */
  private getOptimalParticleCount(): number {
    const isMobile = isMobileDevice();
    if (!isMobile) return 50;

    // Mobile optimization
    const memory = (navigator as any).deviceMemory || 4;
    if (memory <= 2) return 10; // Low-end
    if (memory <= 4) return 20; // Mid-range
    return 30; // High-end
  }

  /**
   * Determine if blur effects should be enabled
   */
  private shouldEnableBlur(): boolean {
    const isMobile = isMobileDevice();
    if (!isMobile) return true;

    // Disable blur on older/slower devices
    const cores = navigator.hardwareConcurrency || 4;
    return cores >= 6; // Only on modern devices
  }

  /**
   * Determine if glow effects should be enabled
   */
  private shouldEnableGlow(): boolean {
    const isMobile = isMobileDevice();
    if (!isMobile) return true;

    // Enable glow on mid-range+ devices
    const memory = (navigator as any).deviceMemory || 4;
    return memory > 3;
  }

  /**
   * Determine if trail effects should be enabled
   */
  private shouldEnableTrails(): boolean {
    const isMobile = isMobileDevice();
    return !isMobile || this.config.quality !== 'low';
  }

  /**
   * Get optimal quality setting
   */
  private getOptimalQuality(): 'low' | 'medium' | 'high' {
    const isMobile = isMobileDevice();
    if (!isMobile) return 'high';

    const memory = (navigator as any).deviceMemory || 4;
    if (memory <= 2) return 'low';
    if (memory <= 4) return 'medium';
    return 'high';
  }

  /**
   * Setup mobile-specific optimizations
   */
  private setupOptimizations(): void {
    // Enable hardware acceleration
    this.ctx.imageSmoothingEnabled = this.config.quality !== 'low';

    // Set optimal composite operation for mobile
    if (this.config.quality === 'low') {
      this.ctx.globalCompositeOperation = 'source-over';
    }
  }

  /**
   * Create success celebration effect
   */
  public createSuccessEffect(x: number, y: number): void {
    const effect: Effect = {
      id: `success-${Date.now()}`,
      type: 'success',
      x,
      y,
      startTime: Date.now(),
      duration: this.config.animationDuration,
    };

    this.activeEffects.set(effect.id, effect);

    // Create particles
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push(
        new Particle({
          x: x + (Math.random() - 0.5) * 40,
          y: y + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          color: this.getSuccessColor(),
          life: 1.0,
          decay: 0.02,
          size: Math.random() * 4 + 2,
        })
      );
    }

    this.startAnimation();
  }

  /**
   * Create error feedback effect
   */
  public createErrorEffect(x: number, y: number): void {
    // Screen shake effect
    this.createScreenShake(3, 200);

    // Red pulse effect
    const effect: Effect = {
      id: `error-${Date.now()}`,
      type: 'error',
      x,
      y,
      startTime: Date.now(),
      duration: 500,
    };

    this.activeEffects.set(effect.id, effect);
    this.startAnimation();
  }

  /**
   * Create organism birth effect
   */
  public createBirthEffect(x: number, y: number, color: string): void {
    if (this.config.quality === 'low') return; // Skip on low quality

    const effect: Effect = {
      id: `birth-${Date.now()}`,
      type: 'birth',
      x,
      y,
      startTime: Date.now(),
      duration: 800,
      color,
    };

    this.activeEffects.set(effect.id, effect);

    // Create expanding ring
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      this.particles.push(
        new Particle({
          x,
          y,
          vx: Math.cos(angle) * 2,
          vy: Math.sin(angle) * 2,
          color,
          life: 1.0,
          decay: 0.015,
          size: 3,
        })
      );
    }

    this.startAnimation();
  }

  /**
   * Create organism death effect
   */
  public createDeathEffect(x: number, y: number): void {
    const effect: Effect = {
      id: `death-${Date.now()}`,
      type: 'death',
      x,
      y,
      startTime: Date.now(),
      duration: 600,
    };

    this.activeEffects.set(effect.id, effect);

    // Create dispersing particles
    for (let i = 0; i < Math.min(15, this.config.particleCount); i++) {
      this.particles.push(
        new Particle({
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 3,
          vy: -Math.random() * 2 - 1, // Upward bias
          color: '#666666',
          life: 1.0,
          decay: 0.025,
          size: Math.random() * 2 + 1,
        })
      );
    }

    this.startAnimation();
  }

  /**
   * Create ripple effect for touch feedback
   */
  public createTouchRipple(x: number, y: number): void {
    const effect: Effect = {
      id: `ripple-${Date.now()}`,
      type: 'ripple',
      x,
      y,
      startTime: Date.now(),
      duration: 400,
    };

    this.activeEffects.set(effect.id, effect);
    this.startAnimation();
  }

  /**
   * Create screen shake effect
   */
  private createScreenShake(intensity: number, duration: number): void {
    const startTime = Date.now();
    const originalTransform = this.canvas.style.transform;

    const shake = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        this.canvas.style.transform = originalTransform;
        return;
      }

      const currentIntensity = intensity * (1 - progress);
      const x = (Math.random() - 0.5) * currentIntensity;
      const y = (Math.random() - 0.5) * currentIntensity;

      this.canvas.style.transform = `${originalTransform} translate(${x}px, ${y}px)`;
      requestAnimationFrame(shake);
    };

    shake();
  }

  /**
   * Get success effect color
   */
  private getSuccessColor(): string {
    const colors = ['#4CAF50', '#8BC34A', '#CDDC39', '#FFD700'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Start animation loop
   */
  private startAnimation(): void {
    if (this.animationFrame) return; // Already running

    const animate = () => {
      this.updateEffects();
      this.renderEffects();

      if (this.hasActiveEffects()) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.animationFrame = undefined;
      }
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  /**
   * Update all active effects
   */
  private updateEffects(): void {
    const now = Date.now();

    // Update effects
    for (const [id, effect] of this.activeEffects) {
      const elapsed = now - effect.startTime;
      if (elapsed >= effect.duration) {
        this.activeEffects.delete(id);
      }
    }

    // Update particles
    this.particles = this.particles.filter(particle => {
      particle.update();
      return particle.life > 0;
    });
  }

  /**
   * Render all effects
   */
  private renderEffects(): void {
    this.ctx.save();

    // Render effects
    for (const effect of this.activeEffects.values()) {
      this.renderEffect(effect);
    }

    // Render particles
    for (const particle of this.particles) {
      particle.render(this.ctx);
    }

    this.ctx.restore();
  }

  /**
   * Render individual effect
   */
  private renderEffect(effect: Effect): void {
    const now = Date.now();
    const elapsed = now - effect.startTime;
    const progress = elapsed / effect.duration;

    switch (effect.type) {
      case 'ripple':
        this.renderRipple(effect, progress);
        break;
      case 'birth':
        this.renderBirth(effect, progress);
        break;
      case 'error':
        this.renderError(effect, progress);
        break;
    }
  }

  /**
   * Render ripple effect
   */
  private renderRipple(effect: Effect, progress: number): void {
    const maxRadius = 50;
    const radius = maxRadius * progress;
    const alpha = 1 - progress;

    this.ctx.save();
    this.ctx.globalAlpha = alpha * 0.3;
    this.ctx.strokeStyle = '#4CAF50';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.restore();
  }

  /**
   * Render birth effect
   */
  private renderBirth(effect: Effect, progress: number): void {
    if (!this.config.enableGlow) return;

    const alpha = 1 - progress;
    const radius = 20 + progress * 30;

    this.ctx.save();
    this.ctx.globalAlpha = alpha * 0.5;

    // Create glow effect
    const gradient = this.ctx.createRadialGradient(
      effect.x,
      effect.y,
      0,
      effect.x,
      effect.y,
      radius
    );
    gradient.addColorStop(0, effect.color || '#4CAF50');
    gradient.addColorStop(1, 'transparent');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  /**
   * Render error effect
   */
  private renderError(effect: Effect, progress: number): void {
    const alpha = 1 - progress;

    this.ctx.save();
    this.ctx.globalAlpha = alpha * 0.2;
    this.ctx.fillStyle = '#F44336';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  /**
   * Check if there are active effects
   */
  private hasActiveEffects(): boolean {
    return this.activeEffects.size > 0 || this.particles.length > 0;
  }

  /**
   * Update effect quality
   */
  public updateQuality(quality: 'low' | 'medium' | 'high'): void {
    this.config.quality = quality;
    this.config.enableBlur = quality !== 'low';
    this.config.enableGlow = quality === 'high';
    this.config.enableTrails = quality !== 'low';
    this.config.particleCount = quality === 'low' ? 10 : quality === 'medium' ? 20 : 30;

    this.setupOptimizations();
  }

  /**
   * Clear all effects
   */
  public clearEffects(): void {
    this.activeEffects.clear();
    this.particles = [];
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = undefined;
    }
  }
}

/**
 * Effect interface
 */
interface Effect {
  id: string;
  type: 'success' | 'error' | 'birth' | 'death' | 'ripple';
  x: number;
  y: number;
  startTime: number;
  duration: number;
  color?: string;
}

/**
 * Particle class for visual effects
 */
class Particle {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public color: string;
  public life: number;
  public decay: number;
  public size: number;

  constructor(options: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    life: number;
    decay: number;
    size: number;
  }) {
    this.x = options.x;
    this.y = options.y;
    this.vx = options.vx;
    this.vy = options.vy;
    this.color = options.color;
    this.life = options.life;
    this.decay = options.decay;
    this.size = options.size;
  }

  update(): void {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.1; // Gravity
    this.life -= this.decay;
    this.vx *= 0.99; // Air resistance
    this.vy *= 0.99;
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
