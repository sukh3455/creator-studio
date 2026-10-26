import { Scene, AspectRatio, RESOLUTIONS, VisualElement } from '../types/creatorStudio';

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  time: number; // scene time in seconds
  progress: number; // 0 to 1 for this scene
  scene: Scene;
  aspectRatio: AspectRatio;
  assetsMap?: Map<string, HTMLImageElement | HTMLVideoElement>;
}

export class MotionGraphicsEngine {
  private particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    alpha: number;
    color: string;
    twinkleSpeed: number;
    twinklePhase: number;
  }> = [];

  constructor() {
    this.initParticles(80);
  }

  private initParticles(count: number): void {
    this.particles = [];
    const colors = ['#F59E0B', '#FBBF24', '#FEF08A', '#FF7700', '#FFD700', '#FFFFFF'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.05,
        vy: -0.05 - Math.random() * 0.15, // Rise upward like embers
        size: 2 + Math.random() * 4,
        alpha: 0.3 + Math.random() * 0.7,
        color: colors[Math.floor(Math.random() * colors.length)],
        twinkleSpeed: 2 + Math.random() * 5,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }
  }

  // Main scene draw call
  drawScene(rc: RenderContext): void {
    const { ctx, width, height, scene, progress, time } = rc;

    // 1. Draw Background
    this.drawBackground(rc);

    // 2. Draw Assigned Media Asset if present
    if (scene.assignedAssetIds.background && rc.assetsMap) {
      const media = rc.assetsMap.get(scene.assignedAssetIds.background);
      if (media) {
        ctx.save();
        ctx.globalAlpha = 0.85;
        this.drawCoverMedia(ctx, media, width, height);
        ctx.restore();
      }
    }

    // 3. Render Visual Elements
    if (scene.elements && scene.elements.length > 0) {
      for (const elem of scene.elements) {
        this.renderElement(elem, rc);
      }
    }

    // 4. Fallback or Theme Visuals (e.g. Diya + Particles if festive)
    if (scene.theme.includes('diwali') || scene.theme.includes('festive')) {
      this.drawDiwaliAmbience(rc);
    }

    // 5. Draw Kinetic Caption Overlay
    if (scene.captionText) {
      this.drawKineticCaptions(rc);
    }

    // 6. Draw Transition effect if near start or end
    this.applyTransitions(rc);
  }

  private drawBackground(rc: RenderContext): void {
    const { ctx, width, height, scene, time } = rc;
    const bg = scene.backgroundColor || '#0F0902';

    // Rich radial background gradient with subtle pulse
    const grad = ctx.createRadialGradient(
      width / 2,
      height * 0.45,
      width * 0.1,
      width / 2,
      height * 0.5,
      Math.max(width, height) * 0.8
    );

    if (scene.theme.includes('diwali') || scene.theme.includes('festive') || scene.theme.includes('gold')) {
      const pulse = Math.sin(time * 3) * 0.05;
      grad.addColorStop(0, '#381E05');
      grad.addColorStop(0.5 + pulse, '#1A0C02');
      grad.addColorStop(1, '#080400');
    } else if (scene.theme.includes('cyberpunk') || scene.theme.includes('high_tech') || scene.theme.includes('blue')) {
      grad.addColorStop(0, '#1E293B');
      grad.addColorStop(0.6, '#0F172A');
      grad.addColorStop(1, '#020617');
    } else if (scene.theme.includes('green') || scene.theme.includes('finance')) {
      grad.addColorStop(0, '#064E3B');
      grad.addColorStop(0.6, '#022C22');
      grad.addColorStop(1, '#01140F');
    } else {
      grad.addColorStop(0, '#262626');
      grad.addColorStop(1, bg);
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  private renderElement(elem: VisualElement, rc: RenderContext): void {
    switch (elem.type) {
      case 'diya':
        this.drawDiya(elem.props, rc);
        break;
      case 'particles':
        this.drawParticles(elem.props, rc);
        break;
      case 'typography':
        this.drawTypography(elem.props, rc);
        break;
      case 'brand_reveal':
        this.drawBrandReveal(elem.props, rc);
        break;
      case 'device_mockup':
        this.drawDeviceMockup(elem.props, rc);
        break;
      case 'geometric':
        this.drawGeometric(elem.props, rc);
        break;
      default:
        break;
    }
  }

  // Custom Animated Diwali Diya
  public drawDiya(props: any, rc: RenderContext): void {
    const { ctx, width, height, time, progress } = rc;
    const size = (props.size || 130) * (width / 720);
    const cx = width / 2;
    const cy = height * 0.55;

    ctx.save();
    ctx.translate(cx, cy);

    // Subtle floating breath animation
    const floatY = Math.sin(time * 2.5) * 5;
    ctx.translate(0, floatY);

    // 1. Radiant Aura Halo
    const haloPulse = 1.0 + Math.sin(time * 6) * 0.12;
    const haloRadius = size * 1.8 * haloPulse;
    const haloGrad = ctx.createRadialGradient(0, -size * 0.3, size * 0.2, 0, -size * 0.3, haloRadius);
    haloGrad.addColorStop(0, 'rgba(255, 180, 0, 0.45)');
    haloGrad.addColorStop(0.4, 'rgba(245, 120, 0, 0.2)');
    haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(0, -size * 0.3, haloRadius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Diya Terracotta Bowl (Clay Lamp)
    // Deep clay gradient with warm ambient reflection
    const bowlGrad = ctx.createLinearGradient(0, -size * 0.1, 0, size * 0.6);
    bowlGrad.addColorStop(0, '#D97706'); // Warm terracotta amber
    bowlGrad.addColorStop(0.5, '#92400E');
    bowlGrad.addColorStop(1, '#451A03'); // Dark earthen base

    ctx.fillStyle = bowlGrad;
    ctx.strokeStyle = '#FDE68A';
    ctx.lineWidth = 3;

    ctx.beginPath();
    // Diya bowl bezier curve
    ctx.moveTo(-size, 0);
    ctx.bezierCurveTo(-size * 0.9, size * 0.7, size * 0.9, size * 0.7, size, 0);
    ctx.bezierCurveTo(size * 0.6, size * 0.15, -size * 0.6, size * 0.15, -size, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Diya Rim Golden Ornamentation
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 1.5;
    for (let i = -8; i <= 8; i++) {
      const rx = (i / 9) * size * 0.8;
      const ry = Math.abs(i) * 1.5;
      ctx.beginPath();
      ctx.arc(rx, ry + 2, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FEF08A';
      ctx.fill();
    }

    // 3. Golden Oil Shimmer Puddle inside the bowl
    const oilGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, size * 0.7);
    oilGrad.addColorStop(0, '#FEF08A');
    oilGrad.addColorStop(0.6, '#F59E0B');
    oilGrad.addColorStop(1, '#92400E');
    ctx.fillStyle = oilGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.7, size * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. Cotton Wick Tip
    ctx.fillStyle = '#1F1206';
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.05, 4, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. Multi-Layer Dynamic Flickering Flame
    const flickerX = Math.sin(time * 14) * (size * 0.04) + Math.cos(time * 22) * (size * 0.02);
    const flickerHeight = size * (0.8 + Math.sin(time * 18) * 0.08);

    // Outer flame (Rich Red-Orange)
    const flameOuterGrad = ctx.createLinearGradient(0, 0, 0, -flickerHeight);
    flameOuterGrad.addColorStop(0, '#DC2626');
    flameOuterGrad.addColorStop(0.3, '#EA580C');
    flameOuterGrad.addColorStop(0.7, '#FBBF24');
    flameOuterGrad.addColorStop(1, '#FEF3C7');

    ctx.fillStyle = flameOuterGrad;
    ctx.beginPath();
    ctx.moveTo(-size * 0.25, -size * 0.05);
    ctx.bezierCurveTo(
      -size * 0.35, -flickerHeight * 0.4,
      flickerX - size * 0.1, -flickerHeight * 0.75,
      flickerX, -flickerHeight
    );
    ctx.bezierCurveTo(
      flickerX + size * 0.1, -flickerHeight * 0.75,
      size * 0.35, -flickerHeight * 0.4,
      size * 0.25, -size * 0.05
    );
    ctx.closePath();
    ctx.fill();

    // Inner Flame Core (Brilliant Golden-Yellow & White-Hot)
    const flameInnerGrad = ctx.createLinearGradient(0, 0, 0, -flickerHeight * 0.65);
    flameInnerGrad.addColorStop(0, '#38BDF8'); // subtle blue base
    flameInnerGrad.addColorStop(0.2, '#F59E0B');
    flameInnerGrad.addColorStop(0.7, '#FEF08A');
    flameInnerGrad.addColorStop(1, '#FFFFFF');

    ctx.fillStyle = flameInnerGrad;
    ctx.beginPath();
    ctx.moveTo(-size * 0.12, -size * 0.05);
    ctx.bezierCurveTo(
      -size * 0.18, -flickerHeight * 0.25,
      flickerX * 0.5 - size * 0.05, -flickerHeight * 0.5,
      flickerX * 0.5, -flickerHeight * 0.65
    );
    ctx.bezierCurveTo(
      flickerX * 0.5 + size * 0.05, -flickerHeight * 0.5,
      size * 0.18, -flickerHeight * 0.25,
      size * 0.12, -size * 0.05
    );
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Floating Embers & Particle Sparks
  public drawParticles(props: any, rc: RenderContext): void {
    const { ctx, width, height, time } = rc;
    const count = props.count || 50;

    ctx.save();
    for (let i = 0; i < Math.min(count, this.particles.length); i++) {
      const p = this.particles[i];

      // Update position
      const px = ((p.x + p.vx * time * 0.5) % 1 + 1) % 1 * width;
      const py = ((p.y + p.vy * time * 0.5) % 1 + 1) % 1 * height;

      // Twinkle alpha
      const twinkle = Math.sin(time * p.twinkleSpeed + p.twinklePhase);
      const alpha = Math.max(0.1, p.alpha * (0.6 + twinkle * 0.4));

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      // Sparkle cross star for larger particles
      if (p.size > 3.5) {
        ctx.beginPath();
        ctx.arc(px, py, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px - p.size * 1.5, py);
        ctx.lineTo(px + p.size * 1.5, py);
        ctx.moveTo(px, py - p.size * 1.5);
        ctx.lineTo(px, py + p.size * 1.5);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  // Animated Kinetic Typography
  public drawTypography(props: any, rc: RenderContext): void {
    const { ctx, width, height, progress, time } = rc;
    const text = props.text || '';
    const subtitle = props.subtitle || '';
    const style = props.style || 'festive_gold';

    ctx.save();
    const enterProgress = Math.min(1, progress * 4); // enters during first 25% of scene
    const scale = 0.8 + 0.2 * Math.sin(enterProgress * Math.PI * 0.5);
    const alpha = Math.min(1, enterProgress * 1.5);

    ctx.globalAlpha = alpha;
    ctx.translate(width / 2, height * 0.26);
    ctx.scale(scale, scale);

    const baseFontSize = (width / 720) * 44;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (style === 'festive_gold') {
      // Golden luxury gradient
      const goldGrad = ctx.createLinearGradient(-width * 0.3, 0, width * 0.3, 0);
      goldGrad.addColorStop(0, '#F59E0B');
      goldGrad.addColorStop(0.3, '#FEF08A');
      goldGrad.addColorStop(0.6, '#FBBF24');
      goldGrad.addColorStop(1, '#D97706');

      ctx.font = `900 ${baseFontSize}px 'Cinzel', 'Playfair Display', Georgia, serif`;
      ctx.fillStyle = goldGrad;
      ctx.shadowColor = 'rgba(245, 158, 11, 0.7)';
      ctx.shadowBlur = 18;
      ctx.fillText(text, 0, 0);

      // Reset shadow for subtitle
      ctx.shadowBlur = 0;
      if (subtitle) {
        ctx.font = `600 ${(baseFontSize * 0.45)}px 'Cinzel', Georgia, serif`;
        ctx.fillStyle = '#FDE68A';
        ctx.letterSpacing = '3px';
        ctx.fillText(subtitle.toUpperCase(), 0, baseFontSize * 0.95);
      }
    } else if (style === 'neon_glow') {
      ctx.font = `900 ${baseFontSize}px 'Inter', system-ui, sans-serif`;
      ctx.fillStyle = '#60A5FA';
      ctx.shadowColor = '#3B82F6';
      ctx.shadowBlur = 24;
      ctx.fillText(text, 0, 0);

      ctx.shadowBlur = 0;
      if (subtitle) {
        ctx.font = `600 ${(baseFontSize * 0.45)}px 'Inter', sans-serif`;
        ctx.fillStyle = '#93C5FD';
        ctx.fillText(subtitle, 0, baseFontSize * 0.9);
      }
    } else {
      ctx.font = `800 ${baseFontSize}px system-ui, sans-serif`;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(text, 0, 0);
      if (subtitle) {
        ctx.font = `500 ${(baseFontSize * 0.45)}px system-ui, sans-serif`;
        ctx.fillStyle = '#D1D5DB';
        ctx.fillText(subtitle, 0, baseFontSize * 0.9);
      }
    }

    ctx.restore();
  }

  // Grand Luxury Brand Reveal
  public drawBrandReveal(props: any, rc: RenderContext): void {
    const { ctx, width, height, progress, time } = rc;
    const brandName = props.brandName || 'SUKH GRAPHIX';
    const tagline = props.tagline || 'Illuminating Creative Excellence';
    const glowColor = props.glowColor || '#F59E0B';

    ctx.save();
    ctx.translate(width / 2, height * 0.45);

    // Zoom-in entrance
    const pop = Math.min(1, progress * 2.5);
    const scale = 0.7 + 0.3 * Math.sin(pop * Math.PI * 0.5);
    ctx.scale(scale, scale);

    // 1. Radial lens sweep light burst behind brand
    const sweepPhase = (time * 0.8) % 1;
    const sweepRadius = width * 0.65;
    const sweepGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, sweepRadius);
    sweepGrad.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
    sweepGrad.addColorStop(0.5, 'rgba(217, 119, 6, 0.15)');
    sweepGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sweepGrad;
    ctx.beginPath();
    ctx.arc(0, 0, sweepRadius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Brand Crest / Emblem Circle
    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 3;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(0, -height * 0.1, (width / 720) * 60, 0, Math.PI * 2);
    ctx.stroke();

    // Emblem Initial Letter
    const initial = brandName.charAt(0) || 'S';
    ctx.font = `900 ${(width / 720) * 55}px 'Playfair Display', Georgia, serif`;
    ctx.fillStyle = '#FEF08A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initial, 0, -height * 0.1);

    // 3. Brand Title
    const fontSize = (width / 720) * 48;
    ctx.font = `900 ${fontSize}px 'Cinzel', 'Playfair Display', serif`;
    const brandGrad = ctx.createLinearGradient(-width * 0.35, 0, width * 0.35, 0);
    brandGrad.addColorStop(0, '#FEF08A');
    brandGrad.addColorStop(0.5, '#F59E0B');
    brandGrad.addColorStop(1, '#FBBF24');
    ctx.fillStyle = brandGrad;
    ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
    ctx.shadowBlur = 20;
    ctx.fillText(brandName, 0, height * 0.05);

    // 4. Sheen Light Sweep across text
    const sheenX = -width * 0.4 + (progress * width * 1.5);
    ctx.save();
    ctx.beginPath();
    ctx.rect(-width * 0.4, height * 0.01, width * 0.8, fontSize * 1.3);
    ctx.clip();

    const sheenGrad = ctx.createLinearGradient(sheenX - 60, 0, sheenX + 60, 0);
    sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    sheenGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
    sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sheenGrad;
    ctx.fillRect(sheenX - 60, height * 0.01, 120, fontSize * 1.3);
    ctx.restore();

    // 5. Tagline & Golden Separator
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-width * 0.25, height * 0.11);
    ctx.lineTo(width * 0.25, height * 0.11);
    ctx.stroke();

    ctx.font = `600 ${(width / 720) * 20}px 'Cinzel', Georgia, serif`;
    ctx.fillStyle = '#FDE68A';
    ctx.fillText(tagline.toUpperCase(), 0, height * 0.15);

    ctx.restore();
  }

  // Device Mockup (Phone / Browser)
  public drawDeviceMockup(props: any, rc: RenderContext): void {
    const { ctx, width, height, progress } = rc;
    const phoneW = width * 0.65;
    const phoneH = phoneW * 2.05;
    const cx = width / 2;
    const cy = height * 0.52;

    ctx.save();
    ctx.translate(cx, cy);

    // Enter slide up
    const enterY = Math.max(0, (1 - progress * 3) * 100);
    ctx.translate(0, enterY);

    // Phone Body
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 4;
    ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
    ctx.shadowBlur = 20;

    const rad = 28;
    ctx.beginPath();
    ctx.roundRect(-phoneW / 2, -phoneH / 2, phoneW, phoneH, rad);
    ctx.fill();
    ctx.stroke();

    // Dynamic Island
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.roundRect(-40, -phoneH / 2 + 12, 80, 22, 11);
    ctx.fill();

    // Screen content shimmer
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(-phoneW / 2 + 8, -phoneH / 2 + 45, phoneW - 16, phoneH - 60);

    ctx.restore();
  }

  // Geometric / Mandala Shapes
  public drawGeometric(props: any, rc: RenderContext): void {
    const { ctx, width, height, time } = rc;
    const shape = props.shape || 'mandala';
    const color = props.color || '#F59E0B';
    const cx = width / 2;
    const cy = height * 0.52;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * 0.25);

    if (shape === 'mandala') {
      const petals = 12;
      const radius = (width / 720) * 110;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.globalAlpha = 0.45;

      for (let i = 0; i < petals; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI * 2) / petals);
        ctx.beginPath();
        ctx.ellipse(0, radius * 0.6, radius * 0.35, radius * 0.6, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.9, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Kinetic Subtitle Captions
  private drawKineticCaptions(rc: RenderContext): void {
    const { ctx, width, height, scene, progress } = rc;
    const text = scene.captionText;
    const lines = text.split('\n');

    ctx.save();
    const fontSize = (width / 720) * 32;
    ctx.font = `800 ${fontSize}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const startY = height * 0.82;
    const lineHeight = fontSize * 1.35;

    lines.forEach((line, index) => {
      const y = startY + index * lineHeight;

      // Measure text for badge background
      const metrics = ctx.measureText(line);
      const bgPadX = 18;
      const bgPadY = 8;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
      ctx.beginPath();
      ctx.roundRect(
        width / 2 - metrics.width / 2 - bgPadX,
        y - fontSize / 2 - bgPadY,
        metrics.width + bgPadX * 2,
        fontSize + bgPadY * 2,
        8
      );
      ctx.fill();

      // Border highlight
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Caption text
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 6;
      ctx.fillText(line, width / 2, y);
    });

    ctx.restore();
  }

  private drawDiwaliAmbience(rc: RenderContext): void {
    this.drawParticles({ count: 65 }, rc);
  }

  private drawCoverMedia(ctx: CanvasRenderingContext2D, img: HTMLImageElement | HTMLVideoElement, w: number, h: number): void {
    const srcW = (img as HTMLVideoElement).videoWidth || img.width || w;
    const srcH = (img as HTMLVideoElement).videoHeight || img.height || h;
    const scale = Math.max(w / srcW, h / srcH);
    const dw = srcW * scale;
    const dh = srcH * scale;
    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  private applyTransitions(rc: RenderContext): void {
    const { ctx, width, height, scene, progress } = rc;
    const transition = scene.transition || 'fade';

    // Enter transition (first 10%)
    if (progress < 0.1) {
      const enter = progress / 0.1;
      if (transition === 'fade') {
        ctx.fillStyle = `rgba(0, 0, 0, ${1 - enter})`;
        ctx.fillRect(0, 0, width, height);
      }
    }

    // Exit transition (last 10%)
    if (progress > 0.9) {
      const exit = (progress - 0.9) / 0.1;
      if (transition === 'fade') {
        ctx.fillStyle = `rgba(0, 0, 0, ${exit})`;
        ctx.fillRect(0, 0, width, height);
      }
    }
  }
}
