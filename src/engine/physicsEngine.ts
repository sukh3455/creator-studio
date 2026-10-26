import { CharacterAction, CharacterPosition } from '../types/timeline';

export interface CharacterTransform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number; // in radians
  groundY: number;
  isSquashing: boolean;
  dustTriggered: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  maxLife: number;
  life: number;
}

export class PhysicsEngine {
  private particles: Particle[] = [];
  private lastAction: string = '';
  private lastJumpCycle: number = -1;

  public reset() {
    this.particles = [];
    this.lastAction = '';
    this.lastJumpCycle = -1;
  }

  public update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life += dt;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  public emitDust(x: number, y: number, color = 'rgba(255, 255, 255, 0.7)') {
    for (let i = 0; i < 8; i++) {
      const angle = Math.PI + (Math.random() - 0.5) * Math.PI * 0.8;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y - 5,
        vx: Math.cos(angle) * speed,
        vy: -Math.abs(Math.sin(angle)) * speed * 0.5,
        size: 4 + Math.random() * 6,
        alpha: 0.8,
        color,
        maxLife: 0.4 + Math.random() * 0.3,
        life: 0
      });
    }
  }

  public emitSparkles(x: number, y: number, color = '#fef08a') {
    for (let i = 0; i < 3; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 2.5;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 60,
        y: y + (Math.random() - 0.5) * 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        alpha: 0.9,
        color,
        maxLife: 0.5 + Math.random() * 0.4,
        life: 0
      });
    }
  }

  public drawParticles(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  public computeTransform(
    canvasWidth: number,
    canvasHeight: number,
    position: CharacterPosition = 'center',
    action: CharacterAction = 'idle',
    elapsed: number
  ): CharacterTransform {
    const isVertical = canvasHeight > canvasWidth;

    // Base anchor coordinates adjusted for aspect ratio
    let baseX = canvasWidth / 2;
    if (position === 'left') {
      baseX = isVertical ? canvasWidth * 0.32 : canvasWidth * 0.28;
    } else if (position === 'right') {
      baseX = isVertical ? canvasWidth * 0.68 : canvasWidth * 0.72;
    }

    const groundY = isVertical ? canvasHeight * 0.70 : canvasHeight * 0.74;
    let x = baseX;
    let y = groundY;
    const baseScale = isVertical ? 1.12 : 1.0;
    let scaleX = baseScale;
    let scaleY = baseScale;
    let rotation = 0;
    let isSquashing = false;
    let dustTriggered = false;

    // Subtle idle breathing pulse
    const breath = Math.sin(elapsed * 3) * 0.02 * baseScale;
    scaleX += breath;
    scaleY -= breath;

    switch (action) {
      case 'jump': {
        const jumpFreq = 1.6;
        const jumpCycle = Math.floor(elapsed * jumpFreq);
        const cycleProgress = (elapsed * jumpFreq) % 1;

        const jumpHeight = isVertical ? 175 : 140;
        const arc = 4 * jumpHeight * cycleProgress * (1 - cycleProgress);
        y = groundY - arc;

        if (cycleProgress < 0.12) {
          const squashFactor = Math.sin((cycleProgress / 0.12) * Math.PI);
          scaleX = baseScale * (1 + 0.25 * squashFactor);
          scaleY = baseScale * (1 - 0.22 * squashFactor);
          isSquashing = true;
          if (jumpCycle !== this.lastJumpCycle) {
            this.emitDust(x, groundY);
            this.lastJumpCycle = jumpCycle;
            dustTriggered = true;
          }
        } else if (cycleProgress < 0.5) {
          scaleX = baseScale * 0.88;
          scaleY = baseScale * 1.18;
          rotation = 0.04 * Math.sin(elapsed * 10);
        } else if (cycleProgress < 0.88) {
          scaleX = baseScale * 0.94;
          scaleY = baseScale * 1.1;
        } else {
          scaleX = baseScale * 1.05;
          scaleY = baseScale * 0.95;
        }
        break;
      }

      case 'bounce': {
        const bounceFreq = 3.5;
        const bounceHeight = isVertical ? 55 : 45;
        const bounceProgress = Math.abs(Math.sin(elapsed * Math.PI * bounceFreq));
        y = groundY - bounceProgress * bounceHeight;

        scaleX = baseScale * (1 + 0.08 * (1 - bounceProgress));
        scaleY = baseScale * (1 - 0.08 * (1 - bounceProgress));
        rotation = Math.sin(elapsed * 4) * 0.05;
        break;
      }

      case 'slide_left': {
        const duration = 0.8;
        const t = Math.min(1, elapsed / duration);
        const easeOut = 1 - Math.pow(1 - t, 3);
        const startX = canvasWidth + (isVertical ? 200 : 250);
        x = startX + (baseX - startX) * easeOut;

        if (t < 1) {
          rotation = -0.12 * (1 - t);
          scaleX = baseScale * 1.08;
          scaleY = baseScale * 0.95;
          if (Math.random() < 0.4) {
            this.emitDust(x + 40, groundY);
          }
        } else {
          const settleTime = elapsed - duration;
          const settleBounce = Math.exp(-settleTime * 6) * Math.sin(settleTime * 15);
          scaleX = baseScale * (1 + 0.1 * settleBounce);
          scaleY = baseScale * (1 - 0.1 * settleBounce);
        }
        break;
      }

      case 'slide_right': {
        const duration = 0.8;
        const t = Math.min(1, elapsed / duration);
        const easeOut = 1 - Math.pow(1 - t, 3);
        const startX = -(isVertical ? 200 : 250);
        x = startX + (baseX - startX) * easeOut;

        if (t < 1) {
          rotation = 0.12 * (1 - t);
          scaleX = baseScale * 1.08;
          scaleY = baseScale * 0.95;
          if (Math.random() < 0.4) {
            this.emitDust(x - 40, groundY);
          }
        } else {
          const settleTime = elapsed - duration;
          const settleBounce = Math.exp(-settleTime * 6) * Math.sin(settleTime * 15);
          scaleX = baseScale * (1 + 0.1 * settleBounce);
          scaleY = baseScale * (1 - 0.1 * settleBounce);
        }
        break;
      }

      case 'scale_up': {
        const duration = 0.7;
        const t = Math.min(1, elapsed / duration);
        const spring = Math.sin(t * Math.PI * 2.5) * Math.exp(-t * 4);
        const currentScale = Math.min(1.25, 0.2 + 0.8 * (1 - Math.pow(1 - t, 2)) + spring * 0.35);
        scaleX = baseScale * currentScale;
        scaleY = baseScale * currentScale;
        y = groundY;
        if (t < 0.5 && Math.random() < 0.3) {
          this.emitSparkles(x, y - 80);
        }
        break;
      }

      case 'float': {
        const hoverOffset = Math.sin(elapsed * 2.2) * (isVertical ? 30 : 25);
        y = groundY - (isVertical ? 75 : 60) + hoverOffset;
        rotation = Math.sin(elapsed * 1.5) * 0.04;
        scaleX = baseScale * (1 + Math.sin(elapsed * 2) * 0.03);
        scaleY = baseScale * (1 - Math.sin(elapsed * 2) * 0.03);
        break;
      }

      case 'shake': {
        x = baseX + (Math.random() - 0.5) * 12;
        y = groundY + (Math.random() - 0.5) * 8;
        rotation = (Math.random() - 0.5) * 0.08;
        scaleX = baseScale * (1 + (Math.random() - 0.5) * 0.1);
        scaleY = baseScale * (1 + (Math.random() - 0.5) * 0.1);
        break;
      }

      case 'idle':
      default: {
        y = groundY;
        rotation = Math.sin(elapsed * 1.8) * 0.015;
        break;
      }
    }

    return {
      x,
      y,
      scaleX,
      scaleY,
      rotation,
      groundY,
      isSquashing,
      dustTriggered
    };
  }
}
