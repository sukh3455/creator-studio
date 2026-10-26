import { VisualPropType } from '../types/timeline';

export class VisualPropsRenderer {
  private outlineColor = '#0f172a';
  private outlineWidth = 5;

  public draw(
    ctx: CanvasRenderingContext2D,
    propType: VisualPropType | string,
    x: number,
    y: number,
    elapsed: number,
    accentColor = '#0ea5e9',
    isVertical = true
  ) {
    ctx.save();
    ctx.translate(x, y);

    const scale = isVertical ? 1.05 : 0.95;
    ctx.scale(scale, scale);

    switch (propType) {
      case 'snowball':
        this.drawSnowball(ctx, elapsed, accentColor);
        break;
      case 'coin_stack':
        this.drawCoinStack(ctx, elapsed, accentColor);
        break;
      case 'rocket':
        this.drawRocket(ctx, elapsed, accentColor);
        break;
      case 'brain':
        this.drawBrain(ctx, elapsed, accentColor);
        break;
      case 'clock':
        this.drawClock(ctx, elapsed, accentColor);
        break;
      case 'dumbbell':
        this.drawDumbbell(ctx, elapsed, accentColor);
        break;
      case 'chart_growth':
        this.drawChartGrowth(ctx, elapsed, accentColor);
        break;
      case 'fire':
        this.drawFire(ctx, elapsed, accentColor);
        break;
      case 'magnet':
        this.drawMagnet(ctx, elapsed, accentColor);
        break;
      case 'trophy':
        this.drawTrophy(ctx, elapsed, accentColor);
        break;
      case 'lightbulb':
        this.drawLightbulb(ctx, elapsed, accentColor);
        break;
      case 'speed_lines':
        this.drawSpeedLines(ctx, elapsed, accentColor, isVertical);
        break;
      case 'star':
        this.drawStar(ctx, elapsed, accentColor);
        break;
      case 'square':
        this.drawSquare(ctx, elapsed, accentColor);
        break;
      case 'circle':
      default:
        this.drawCircle(ctx, elapsed, accentColor);
        break;
    }

    ctx.restore();
  }

  // 1. Snowball compounding interest visual
  private drawSnowball(ctx: CanvasRenderingContext2D, elapsed: number, color: string) {
    // Growth multiplier over scene time
    const grow = Math.min(2.2, 1 + elapsed * 0.28);
    const radius = 65 * grow;

    // Rolling hill curve
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-180, 80);
    ctx.quadraticCurveTo(0, 70, 180, 95);
    ctx.stroke();

    // Rolling animation
    ctx.rotate(elapsed * 3.5);

    // Snowball body with thick dark outline
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = this.outlineWidth;

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Snow texture clumps
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(-radius * 0.35, -radius * 0.3, radius * 0.25, 0, Math.PI * 2);
    ctx.arc(radius * 0.3, radius * 0.2, radius * 0.28, 0, Math.PI * 2);
    ctx.fill();

    // Snow highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-radius * 0.2, -radius * 0.4, radius * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Floating compounding label badge
    ctx.save();
    ctx.translate(0, -radius - 35);
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 15;
    ctx.font = '900 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`+${Math.round(grow * 100)}% EXPONENTIAL`, 0, 0);
    ctx.restore();
  }

  // 2. Stacking gold coins visual
  private drawCoinStack(ctx: CanvasRenderingContext2D, elapsed: number, color: string) {
    const numCoins = Math.min(7, 3 + Math.floor(elapsed * 1.8));

    ctx.save();
    for (let i = 0; i < numCoins; i++) {
      const cy = 60 - i * 22;
      const coinBounce = Math.sin(elapsed * 5 + i) * 3;

      ctx.save();
      ctx.translate(0, cy + coinBounce);

      // Coin edge / thickness
      ctx.fillStyle = '#ca8a04';
      ctx.strokeStyle = this.outlineColor;
      ctx.lineWidth = this.outlineWidth;
      ctx.beginPath();
      ctx.ellipse(0, 8, 70, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Coin face
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.ellipse(0, 0, 70, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Coin inner rim
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, 54, 18, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Dollar / Currency symbol
      ctx.fillStyle = '#a16207';
      ctx.font = 'bold 22px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', 0, 1);

      ctx.restore();
    }

    // Floating Green Profit Pill
    ctx.translate(85, -50 + Math.sin(elapsed * 4) * 8);
    ctx.fillStyle = '#22c55e';
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.roundRect(-45, -18, 90, 36, 10);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#052e16';
    ctx.font = '900 18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('▲ +500%', 0, 0);

    ctx.restore();
  }

  // 3. Rocket Launch
  private drawRocket(ctx: CanvasRenderingContext2D, elapsed: number, color: string) {
    ctx.save();
    const bob = Math.sin(elapsed * 8) * 8;
    ctx.translate(0, -20 + bob);
    ctx.rotate(0.18 + Math.sin(elapsed * 6) * 0.05);

    // Rocket Exhaust Fire
    const fireScale = 1 + 0.3 * Math.sin(elapsed * 25);
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(-18, 70);
    ctx.quadraticCurveTo(0, 140 * fireScale, 18, 70);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(-10, 70);
    ctx.quadraticCurveTo(0, 110 * fireScale, 10, 70);
    ctx.closePath();
    ctx.fill();

    // Rocket Body
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = this.outlineWidth;
    ctx.beginPath();
    ctx.moveTo(0, -85);
    ctx.quadraticCurveTo(45, -30, 32, 70);
    ctx.lineTo(-32, 70);
    ctx.quadraticCurveTo(-45, -30, 0, -85);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Nose Cone (Teal/Red)
    ctx.fillStyle = color || '#0ea5e9';
    ctx.beginPath();
    ctx.moveTo(0, -85);
    ctx.quadraticCurveTo(24, -45, 26, -30);
    ctx.lineTo(-26, -30);
    ctx.quadraticCurveTo(-24, -45, 0, -85);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Porthole Window
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, 5, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-5, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    // Fins
    ctx.fillStyle = '#0f766e';
    ctx.beginPath();
    ctx.moveTo(-32, 40);
    ctx.lineTo(-58, 75);
    ctx.lineTo(-32, 70);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(32, 40);
    ctx.lineTo(58, 75);
    ctx.lineTo(32, 70);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // 4. Glowing Brain
  private drawBrain(ctx: CanvasRenderingContext2D, elapsed: number, color: string) {
    ctx.save();
    const pulse = 1 + Math.sin(elapsed * 5) * 0.08;
    ctx.scale(pulse, pulse);

    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 25;

    // Brain hemispheres
    ctx.fillStyle = '#f472b6';
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = this.outlineWidth;

    // Left hemisphere
    ctx.beginPath();
    ctx.arc(-28, -10, 48, Math.PI * 0.5, Math.PI * 1.8);
    ctx.quadraticCurveTo(-55, 45, -15, 45);
    ctx.lineTo(0, 45);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right hemisphere
    ctx.beginPath();
    ctx.arc(28, -10, 48, Math.PI * 1.2, Math.PI * 0.5);
    ctx.quadraticCurveTo(55, 45, 15, 45);
    ctx.lineTo(0, 45);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Brain convolutions/folds
    ctx.strokeStyle = '#9333ea';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(-22, -10, 20, 0, Math.PI);
    ctx.arc(22, -10, 20, 0, Math.PI);
    ctx.stroke();

    // Spark of electricity / lightning
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-10, -50);
    ctx.lineTo(5, -25);
    ctx.lineTo(-5, -10);
    ctx.lineTo(15, 15);
    ctx.stroke();

    ctx.restore();
  }

  // 5. Ticking Clock
  private drawClock(ctx: CanvasRenderingContext2D, elapsed: number, color: string) {
    ctx.save();
    const tremble = Math.sin(elapsed * 20) * 0.03;
    ctx.rotate(tremble);

    // Alarm bells on top
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = this.outlineWidth;
    ctx.beginPath();
    ctx.arc(-42, -54, 20, 0, Math.PI * 2);
    ctx.arc(42, -54, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Clock Face
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 68, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Rim accent
    ctx.strokeStyle = color || '#0ea5e9';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, 60, 0, Math.PI * 2);
    ctx.stroke();

    // Center pin
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    // Spinning hands
    const secondAngle = elapsed * Math.PI * 2;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(secondAngle) * 45, Math.sin(secondAngle) * 45);
    ctx.stroke();

    const minuteAngle = elapsed * 0.8;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(minuteAngle) * 32, Math.sin(minuteAngle) * 32);
    ctx.stroke();

    ctx.restore();
  }

  // 6. Gym Dumbbell
  private drawDumbbell(ctx: CanvasRenderingContext2D, elapsed: number, color: string) {
    ctx.save();
    const lift = Math.sin(elapsed * 4) * 18;
    ctx.translate(0, lift);
    ctx.rotate(Math.sin(elapsed * 3) * 0.15);

    // Steel Bar
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = this.outlineWidth;
    ctx.fillRect(-75, -8, 150, 16);
    ctx.strokeRect(-75, -8, 150, 16);

    // Left Plates
    ctx.fillStyle = '#334155';
    ctx.fillRect(-95, -45, 20, 90);
    ctx.strokeRect(-95, -45, 20, 90);
    ctx.fillRect(-75, -35, 12, 70);
    ctx.strokeRect(-75, -35, 12, 70);

    // Right Plates
    ctx.fillRect(75, -45, 20, 90);
    ctx.strokeRect(75, -45, 20, 90);
    ctx.fillRect(63, -35, 12, 70);
    ctx.strokeRect(63, -35, 12, 70);

    // Power Aura Sparks
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, -35 + Math.sin(elapsed * 6) * 5, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 7. Exponential Growth Chart
  private drawChartGrowth(ctx: CanvasRenderingContext2D, elapsed: number, color: string) {
    ctx.save();
    // Grid box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-100, -70, 200, 140, 12);
    ctx.fill();
    ctx.stroke();

    // Chart curve
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(-80, 45);
    ctx.quadraticCurveTo(-20, 40, 20, 0);
    ctx.quadraticCurveTo(50, -25, 80, -50);
    ctx.stroke();

    // Glowing Arrow Head
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(80, -50, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 8. Bonfire / Energy Fire
  private drawFire(ctx: CanvasRenderingContext2D, elapsed: number, color: string) {
    ctx.save();
    const flicker = 1 + Math.sin(elapsed * 12) * 0.15;
    ctx.scale(flicker, flicker);

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(0, -80);
    ctx.quadraticCurveTo(55, -20, 45, 45);
    ctx.quadraticCurveTo(0, 60, -45, 45);
    ctx.quadraticCurveTo(-55, -20, 0, -80);
    ctx.fill();

    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(0, -60);
    ctx.quadraticCurveTo(35, -10, 30, 45);
    ctx.quadraticCurveTo(0, 50, -30, 45);
    ctx.quadraticCurveTo(-35, -10, 0, -60);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(0, -35);
    ctx.quadraticCurveTo(18, 0, 15, 40);
    ctx.quadraticCurveTo(0, 45, -15, 40);
    ctx.quadraticCurveTo(-18, 0, 0, -35);
    ctx.fill();

    ctx.restore();
  }

  // 9. Horseshoe Magnet
  private drawMagnet(ctx: CanvasRenderingContext2D, elapsed: number, color: string) {
    ctx.save();
    ctx.rotate(-0.2 + Math.sin(elapsed * 4) * 0.08);

    // Red U-Shape
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = this.outlineWidth;

    ctx.beginPath();
    ctx.arc(0, 0, 65, Math.PI, 0, true);
    ctx.lineTo(65, 35);
    ctx.lineTo(35, 35);
    ctx.arc(0, 0, 35, 0, Math.PI, false);
    ctx.lineTo(-65, 35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Silver Poles
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-65, 35, 30, 25);
    ctx.strokeRect(-65, 35, 30, 25);

    ctx.fillRect(35, 35, 30, 25);
    ctx.strokeRect(35, 35, 30, 25);

    // Magnetic Sparks
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(-50, 75 + Math.sin(elapsed * 10) * 6, 6, 0, Math.PI * 2);
    ctx.arc(50, 75 + Math.cos(elapsed * 10) * 6, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 10. Gold Trophy
  private drawTrophy(ctx: CanvasRenderingContext2D, elapsed: number, color: string) {
    ctx.save();
    const glint = Math.sin(elapsed * 5);
    ctx.translate(0, -10 + Math.sin(elapsed * 3) * 5);

    // Handles
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(-42, -15, 26, Math.PI * 0.5, Math.PI * 1.5);
    ctx.arc(42, -15, 26, Math.PI * 1.5, Math.PI * 0.5);
    ctx.stroke();

    // Cup Body
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = this.outlineWidth;
    ctx.beginPath();
    ctx.moveTo(-45, -55);
    ctx.lineTo(45, -55);
    ctx.quadraticCurveTo(45, 10, 15, 30);
    ctx.lineTo(15, 50);
    ctx.lineTo(35, 55);
    ctx.lineTo(35, 75);
    ctx.lineTo(-35, 75);
    ctx.lineTo(-35, 55);
    ctx.lineTo(-15, 50);
    ctx.lineTo(-15, 30);
    ctx.quadraticCurveTo(-45, 10, -45, -55);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Star on Cup
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -15, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 11. Lightbulb (Idea)
  private drawLightbulb(ctx: CanvasRenderingContext2D, elapsed: number, color: string) {
    ctx.save();
    const glow = 20 + Math.sin(elapsed * 8) * 10;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = glow;

    // Glass bulb
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = this.outlineWidth;
    ctx.beginPath();
    ctx.arc(0, -20, 50, Math.PI * 0.25, Math.PI * 0.75, true);
    ctx.quadraticCurveTo(18, 30, 16, 42);
    ctx.lineTo(-16, 42);
    ctx.quadraticCurveTo(-18, 30, -35, 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Screw base
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-14, 42, 28, 18);
    ctx.strokeRect(-14, 42, 28, 18);

    // Radiant Rays
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 5;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 5 - Math.PI;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * 65, -20 + Math.sin(angle) * 65);
      ctx.lineTo(Math.cos(angle) * 85, -20 + Math.sin(angle) * 85);
      ctx.stroke();
    }

    ctx.restore();
  }

  // 12. Speed Lines
  private drawSpeedLines(
    ctx: CanvasRenderingContext2D,
    elapsed: number,
    color: string,
    isVertical: boolean
  ) {
    ctx.save();
    ctx.strokeStyle = color || '#0ea5e9';
    ctx.lineWidth = 3;
    const count = 18;
    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count + elapsed * 0.6;
      const inner = (isVertical ? 170 : 190) + Math.sin(elapsed * 10 + i) * 35;
      const outer = isVertical ? 500 : 560;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
      ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 13. Rotating Star
  private drawStar(ctx: CanvasRenderingContext2D, elapsed: number, color: string) {
    ctx.save();
    ctx.rotate(elapsed * 1.5);
    ctx.shadowColor = color;
    ctx.shadowBlur = 30;
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * 85, Math.sin((18 + i * 72) * Math.PI / 180) * 85);
      ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * 42, Math.sin((54 + i * 72) * Math.PI / 180) * 42);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 14. Neon Prism Square
  private drawSquare(ctx: CanvasRenderingContext2D, elapsed: number, color: string) {
    ctx.save();
    ctx.rotate(elapsed * 1.2);
    ctx.shadowColor = color;
    ctx.shadowBlur = 25;
    ctx.fillStyle = color;
    ctx.fillRect(-65, -65, 130, 130);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.strokeRect(-65, -65, 130, 130);
    ctx.restore();
  }

  // 15. Pulsing Glowing Circle
  private drawCircle(ctx: CanvasRenderingContext2D, elapsed: number, color: string) {
    ctx.save();
    const grow = 1 + 0.1 * Math.sin(elapsed * 4);
    ctx.scale(grow, grow);
    ctx.shadowColor = color;
    ctx.shadowBlur = 30;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, 75, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 55, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
