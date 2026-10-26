import { Scene, AspectRatio, RESOLUTIONS, VisualElement, CompositionLayout, CameraMotion } from '../types/creatorStudio';

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

// Cubic bezier easing curves for professional motion graphics
function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
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
    this.initParticles(90);
  }

  private initParticles(count: number): void {
    this.particles = [];
    const colors = ['#F59E0B', '#FBBF24', '#FEF08A', '#FF7700', '#FFD700', '#FFFFFF', '#38BDF8'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.04,
        vy: -0.04 - Math.random() * 0.12, // Rising embers / ambient dust
        size: 2 + Math.random() * 3.5,
        alpha: 0.3 + Math.random() * 0.7,
        color: colors[Math.floor(Math.random() * colors.length)],
        twinkleSpeed: 2 + Math.random() * 5,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }
  }

  // Safe multi-line text wrapping helper to prevent text clipping
  public wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    if (!text) return [];
    const result: string[] = [];
    const paragraphs = text.split('\n');

    for (const para of paragraphs) {
      if (!para.trim()) {
        result.push('');
        continue;
      }
      const words = para.trim().split(/\s+/);
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
          result.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        result.push(currentLine);
      }
    }
    return result;
  }

  // Main scene draw call
  drawScene(rc: RenderContext): void {
    const { ctx, width, height, scene, progress, time } = rc;

    ctx.save();

    // 1. Apply Intentional Camera Motion (zoom, pan, drift)
    this.applyCameraMotion(rc);

    // 2. Draw Layered Vector Background
    this.drawBackground(rc);

    // 3. Draw Assigned Media Asset if present
    if (scene.assignedAssetIds?.background && rc.assetsMap) {
      const media = rc.assetsMap.get(scene.assignedAssetIds.background);
      if (media) {
        ctx.save();
        ctx.globalAlpha = 0.82;
        this.drawCoverMedia(ctx, media, width, height);
        ctx.restore();
      }
    }

    // 4. Draw Composition Layout Archetypes
    this.drawCompositionLayout(rc);

    // 5. Render Scene Visual Elements
    if (scene.elements && scene.elements.length > 0) {
      for (const elem of scene.elements) {
        this.renderElement(elem, rc);
      }
    }

    // 6. Cultural & Theme Ambience (Holi Gulal Powder bursts or Diwali Lamps)
    if (scene.theme?.includes('holi') || scene.theme?.includes('vibrant')) {
      this.drawHoliAmbience(rc);
    } else if (scene.theme?.includes('diwali') || scene.theme?.includes('festive')) {
      this.drawDiwaliAmbience(rc);
    }

    // 7. Draw Cinematic Vignette & Edge Accents
    this.drawCinematicVignette(rc);

    // 8. Draw Kinetic Caption Overlay within safe margins
    if (scene.captionText) {
      this.drawKineticCaptions(rc);
    }

    // 9. Scene Transitions (fade, slide, wipe)
    this.applyTransitions(rc);

    ctx.restore();
  }

  // Camera Motion (zoom in, zoom out, subtle vertical pan drift)
  private applyCameraMotion(rc: RenderContext): void {
    const { ctx, width, height, scene, progress } = rc;
    const motion: CameraMotion = scene.cameraMotion || 'zoom_in';
    const cx = width / 2;
    const cy = height / 2;

    switch (motion) {
      case 'zoom_in': {
        const scale = 1.0 + 0.07 * easeInOutCubic(progress);
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.translate(-cx, -cy);
        break;
      }
      case 'zoom_out': {
        const scale = 1.07 - 0.07 * easeInOutCubic(progress);
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.translate(-cx, -cy);
        break;
      }
      case 'pan_drift_up': {
        const dy = (0.5 - progress) * (height * 0.035);
        ctx.translate(0, dy);
        break;
      }
      case 'pan_drift_down': {
        const dy = (progress - 0.5) * (height * 0.035);
        ctx.translate(0, dy);
        break;
      }
      case 'steady':
      default:
        break;
    }
  }

  // Layered Vector Background with Dynamic Lighting and Blueprint Guides
  private drawBackground(rc: RenderContext): void {
    const { ctx, width, height, scene, time } = rc;
    const bg = scene.backgroundColor || '#0A0E17';
    const theme = scene.theme || 'luxury_gold';

    // 1. Base Gradient Fill
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // 2. Animated Ambient Glowing Light Orbs
    const orb1X = width * 0.3 + Math.sin(time * 0.8) * (width * 0.15);
    const orb1Y = height * 0.35 + Math.cos(time * 0.7) * (height * 0.1);
    const orb1Radius = Math.max(width, height) * 0.65;

    const orb1Grad = ctx.createRadialGradient(orb1X, orb1Y, 20, orb1X, orb1Y, orb1Radius);
    if (theme.includes('holi') || theme.includes('vibrant') || theme.includes('colors')) {
      orb1Grad.addColorStop(0, 'rgba(236, 72, 153, 0.32)'); // Vibrant Magenta Gulal
      orb1Grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.14)'); // Purple
      orb1Grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else if (theme.includes('diwali') || theme.includes('gold') || theme.includes('luxury')) {
      orb1Grad.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
      orb1Grad.addColorStop(0.5, 'rgba(180, 83, 9, 0.08)');
      orb1Grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else if (theme.includes('cyberpunk') || theme.includes('high_tech') || theme.includes('blue')) {
      orb1Grad.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
      orb1Grad.addColorStop(0.5, 'rgba(30, 58, 138, 0.08)');
      orb1Grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else {
      orb1Grad.addColorStop(0, 'rgba(99, 102, 241, 0.18)');
      orb1Grad.addColorStop(0.5, 'rgba(30, 41, 59, 0.06)');
      orb1Grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }
    ctx.fillStyle = orb1Grad;
    ctx.fillRect(0, 0, width, height);

    // Secondary subtle counter-orb
    const orb2X = width * 0.75 + Math.cos(time * 0.6) * (width * 0.12);
    const orb2Y = height * 0.7 + Math.sin(time * 0.75) * (height * 0.08);
    const orb2Grad = ctx.createRadialGradient(orb2X, orb2Y, 10, orb2X, orb2Y, width * 0.5);
    if (theme.includes('holi') || theme.includes('vibrant') || theme.includes('colors')) {
      orb2Grad.addColorStop(0, 'rgba(6, 182, 212, 0.28)'); // Cyan / Turquoise
      orb2Grad.addColorStop(0.5, 'rgba(250, 204, 21, 0.14)'); // Canary Yellow
      orb2Grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else {
      orb2Grad.addColorStop(0, 'rgba(254, 240, 138, 0.1)');
      orb2Grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }
    ctx.fillStyle = orb2Grad;
    ctx.fillRect(0, 0, width, height);

    // 3. Vector Crosshair Blueprint Grid & Design Guides
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;

    // Crosshairs at 160px intervals
    const gridStep = Math.round(width / 6);
    const crossSize = 5;
    for (let x = gridStep; x < width; x += gridStep) {
      for (let y = gridStep; y < height; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x - crossSize, y);
        ctx.lineTo(x + crossSize, y);
        ctx.moveTo(x, y - crossSize);
        ctx.lineTo(x, y + crossSize);
        ctx.stroke();
      }
    }

    // Architectural margin framing lines (subtle guide rules)
    const marginX = width * 0.08;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.beginPath();
    ctx.moveTo(marginX, height * 0.08);
    ctx.lineTo(marginX, height * 0.92);
    ctx.moveTo(width - marginX, height * 0.08);
    ctx.lineTo(width - marginX, height * 0.92);
    ctx.stroke();

    ctx.restore();
  }

  // Composition Layout Archetypes (Dispatches based on scene.compositionLayout)
  private drawCompositionLayout(rc: RenderContext): void {
    const layout = rc.scene.compositionLayout;
    if (!layout) return;

    switch (layout) {
      case 'split_editorial':
        this.drawEditorialGuides(rc);
        break;
      case 'metric_grid':
        // Grid background accents
        this.drawGridFloor(rc);
        break;
      case 'geometric_focus':
        this.drawGeometricFocus({ shape: 'golden_ratio' }, rc);
        break;
      case 'brand_outro':
        this.drawGrandRays(rc);
        break;
      default:
        break;
    }
  }

  // Editorial Guide Rules and Coordinate Marks
  private drawEditorialGuides(rc: RenderContext): void {
    const { ctx, width, height } = rc;
    ctx.save();
    ctx.font = `500 ${(width / 720) * 11}px 'JetBrains Mono', monospace, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.letterSpacing = '1.5px';

    // Top-left technical coordinate mark
    ctx.fillText('REF // 01-PROD', width * 0.09, height * 0.11);
    ctx.fillText('FPS: 60 • 4K RES', width - width * 0.32, height * 0.11);

    // Left vertical accent dash line
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width * 0.08, height * 0.13);
    ctx.lineTo(width * 0.08, height * 0.18);
    ctx.stroke();

    ctx.restore();
  }

  // Subtle Perspective Grid Floor for Tech / Craft Scenes
  private drawGridFloor(rc: RenderContext): void {
    const { ctx, width, height, time } = rc;
    ctx.save();
    const horizonY = height * 0.72;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
    ctx.lineWidth = 1;

    for (let i = -6; i <= 6; i++) {
      ctx.beginPath();
      ctx.moveTo(width / 2 + i * 40, horizonY);
      ctx.lineTo(width / 2 + i * (width * 0.22), height);
      ctx.stroke();
    }

    const offset = (time * 25) % 30;
    for (let y = horizonY; y < height; y += 30) {
      const lineY = y + offset;
      if (lineY < height) {
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(width, lineY);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Grand God-Rays / Radial Beams behind Outro
  private drawGrandRays(rc: RenderContext): void {
    const { ctx, width, height, time } = rc;
    ctx.save();
    const cx = width / 2;
    const cy = height * 0.42;
    const rays = 16;
    const rayAngle = (Math.PI * 2) / rays;

    ctx.translate(cx, cy);
    ctx.rotate(time * 0.06);

    for (let i = 0; i < rays; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, Math.max(width, height) * 0.7, i * rayAngle, i * rayAngle + rayAngle * 0.35);
      ctx.closePath();
      ctx.fillStyle = i % 2 === 0 ? 'rgba(245, 158, 11, 0.035)' : 'rgba(254, 240, 138, 0.015)';
      ctx.fill();
    }
    ctx.restore();
  }

  // Cinematic Vignette and Safe Zone Reticles
  private drawCinematicVignette(rc: RenderContext): void {
    const { ctx, width, height } = rc;

    // Soft Radial Vignette
    const vigGrad = ctx.createRadialGradient(
      width / 2, height / 2, width * 0.4,
      width / 2, height / 2, Math.max(width, height) * 0.72
    );
    vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vigGrad.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, width, height);

    // Corner Guide Reticles [ ]
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    const bSize = (width / 720) * 16;
    const padX = width * 0.07;
    const padY = height * 0.06;

    // Top-Left [
    ctx.beginPath();
    ctx.moveTo(padX, padY + bSize);
    ctx.lineTo(padX, padY);
    ctx.lineTo(padX + bSize, padY);
    ctx.stroke();

    // Top-Right ]
    ctx.beginPath();
    ctx.moveTo(width - padX - bSize, padY);
    ctx.lineTo(width - padX, padY);
    ctx.lineTo(width - padX, padY + bSize);
    ctx.stroke();

    // Bottom-Left [
    ctx.beginPath();
    ctx.moveTo(padX, height - padY - bSize);
    ctx.lineTo(padX, height - padY);
    ctx.lineTo(padX + bSize, height - padY);
    ctx.stroke();

    // Bottom-Right ]
    ctx.beginPath();
    ctx.moveTo(width - padX - bSize, height - padY);
    ctx.lineTo(width - padX, height - padY);
    ctx.lineTo(width - padX, height - padY - bSize);
    ctx.stroke();

    ctx.restore();
  }

  // Render Visual Element Dispatcher
  private renderElement(elem: VisualElement, rc: RenderContext): void {
    switch (elem.type) {
      case 'kinetic_headline':
        this.drawKineticHeadline(elem.props, rc);
        break;
      case 'hero_card':
        this.drawHeroCard(elem.props, rc);
        break;
      case 'metric_grid':
        this.drawMetricGrid(elem.props, rc);
        break;
      case 'geometric_focus':
        this.drawGeometricFocus(elem.props, rc);
        break;
      case 'vector_illustration':
        this.drawVectorIllustration(elem.props, rc);
        break;
      case 'brand_outro':
        this.drawBrandOutro(elem.props, rc);
        break;
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

  // 1. KINETIC HEADLINE (Hook Scene Archetype)
  public drawKineticHeadline(props: any, rc: RenderContext): void {
    const { ctx, width, height, progress, time } = rc;
    const kicker = props.kicker || '✦ CREATIVE EXCELLENCE';
    const headline = props.headline || props.text || 'DESIGN THAT COMMANDS ATTENTION';
    const subtitle = props.subtitle || '';
    const accentColor = props.accentColor || '#F59E0B';

    ctx.save();

    // Staggered pop entrance using easeOutBack
    const enterProgress = Math.min(1, progress * 2.8);
    const ease = easeOutBack(enterProgress);
    const alpha = Math.min(1, enterProgress * 1.5);
    ctx.globalAlpha = alpha;

    const startY = height * 0.22;
    const maxWidth = width * 0.84;

    // A. Kicker Pill Badge
    const kickerFontSize = (width / 720) * 16;
    ctx.font = `700 ${kickerFontSize}px 'Inter', system-ui, sans-serif`;
    const kickerMetrics = ctx.measureText(kicker);
    const pillW = kickerMetrics.width + 28;
    const pillH = kickerFontSize * 2.2;
    const pillX = (width - pillW) / 2;
    const pillY = startY - pillH - 20;

    // Glass backdrop for kicker adapting to accentColor / theme
    const isVibrant = rc.scene.theme?.includes('holi') || rc.scene.theme?.includes('vibrant');
    ctx.fillStyle = isVibrant
      ? 'rgba(236, 72, 153, 0.20)'
      : 'rgba(245, 158, 11, 0.12)';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isVibrant ? '#FDF2F8' : '#FEF08A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(kicker, width / 2, pillY + pillH / 2);

    // B. Main Wrapped Headline
    const headlineFontSize = (width / 720) * 48;
    ctx.font = `900 ${headlineFontSize}px 'Cinzel', 'Playfair Display', Georgia, serif`;
    const lines = this.wrapText(ctx, headline.toUpperCase(), maxWidth);

    const lineHeight = headlineFontSize * 1.18;
    const totalTextHeight = lines.length * lineHeight;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Slide-up with overshoot
    const slideOffset = (1 - ease) * 40;

    lines.forEach((line, index) => {
      const lineY = startY + index * lineHeight + slideOffset;

      // Theme-adaptive linear gradient
      const grad = ctx.createLinearGradient(width * 0.15, lineY, width * 0.85, lineY);
      if (isVibrant) {
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.3, '#F472B6'); // Bright Pink
        grad.addColorStop(0.7, '#38BDF8'); // Cyan
        grad.addColorStop(1, '#FACC15'); // Yellow
        ctx.shadowColor = 'rgba(236, 72, 153, 0.65)';
      } else if (rc.scene.theme?.includes('cyberpunk') || rc.scene.theme?.includes('high_tech')) {
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.3, '#38BDF8');
        grad.addColorStop(0.7, '#60A5FA');
        grad.addColorStop(1, '#1D4ED8');
        ctx.shadowColor = 'rgba(56, 189, 248, 0.65)';
      } else {
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.2, '#FEF08A');
        grad.addColorStop(0.6, '#F59E0B');
        grad.addColorStop(1, '#D97706');
        ctx.shadowColor = 'rgba(245, 158, 11, 0.55)';
      }

      ctx.fillStyle = grad;
      ctx.shadowBlur = 18;
      ctx.fillText(line, width / 2, lineY);
    });

    ctx.shadowBlur = 0;

    // C. Glowing Accent Dividing Rule
    const ruleY = startY + totalTextHeight + 25 + slideOffset;
    const ruleW = Math.min(180, (width * 0.28) * ease);

    const ruleGrad = ctx.createLinearGradient(width / 2 - ruleW / 2, 0, width / 2 + ruleW / 2, 0);
    ruleGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
    ruleGrad.addColorStop(0.5, accentColor);
    ruleGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

    ctx.strokeStyle = ruleGrad;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width / 2 - ruleW / 2, ruleY);
    ctx.lineTo(width / 2 + ruleW / 2, ruleY);
    ctx.stroke();

    // D. Narrative Subtitle / Description
    if (subtitle) {
      const subFontSize = (width / 720) * 22;
      ctx.font = `500 ${subFontSize}px 'Inter', system-ui, sans-serif`;
      const subLines = this.wrapText(ctx, subtitle, maxWidth * 0.95);
      const subLineH = subFontSize * 1.45;
      const subStartY = ruleY + 22;

      ctx.fillStyle = '#CBD5E1';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      subLines.forEach((sLine, sIdx) => {
        ctx.fillText(sLine, width / 2, subStartY + sIdx * subLineH);
      });
    }

    ctx.restore();
  }

  // 2. HERO GLASS CARD (Value / Product Showcase Archetype)
  public drawHeroCard(props: any, rc: RenderContext): void {
    const { ctx, width, height, progress, time } = rc;
    const title = props.title || 'PORTFOLIO SHOWCASE';
    const description = props.description || 'Bespoke Brand Identity & Motion Graphics';
    const badge = props.badge || 'PRO SERVICES';
    const metric = props.metric || '100% BESPOKE';

    ctx.save();

    const enter = Math.min(1, progress * 2.5);
    const ease = easeOutBack(enter);
    ctx.globalAlpha = Math.min(1, enter * 1.5);

    const cardW = width * 0.84;
    const cardH = height * 0.38;
    const cardX = (width - cardW) / 2;
    const cardY = height * 0.40 + (1 - ease) * 50;

    // Card Outer Drop Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 32;
    ctx.shadowOffsetY = 16;

    // Card Glass Body Fill
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 24);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Card Border Rim Gradient
    const borderGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
    borderGrad.addColorStop(0, 'rgba(245, 158, 11, 0.7)');
    borderGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.3)');
    borderGrad.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Top Inner Sheen Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cardX + 24, cardY + 2);
    ctx.lineTo(cardX + cardW - 24, cardY + 2);
    ctx.stroke();

    // Card Content
    const innerPadX = cardW * 0.08;
    let currY = cardY + cardH * 0.14;

    // Pill Tag
    ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 1;
    const badgeW = (width / 720) * 140;
    const badgeH = (width / 720) * 32;
    ctx.beginPath();
    ctx.roundRect(cardX + innerPadX, currY, badgeW, badgeH, badgeH / 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = `700 ${(width / 720) * 13}px 'Inter', sans-serif`;
    ctx.fillStyle = '#38BDF8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badge, cardX + innerPadX + badgeW / 2, currY + badgeH / 2);

    currY += badgeH + 20;

    // Card Title
    const titleSize = (width / 720) * 34;
    ctx.font = `800 ${titleSize}px 'Cinzel', Georgia, serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const wrappedTitle = this.wrapText(ctx, title, cardW - innerPadX * 2);
    wrappedTitle.forEach(tLine => {
      ctx.fillText(tLine, cardX + innerPadX, currY);
      currY += titleSize * 1.25;
    });

    currY += 10;

    // Card Description
    const descSize = (width / 720) * 20;
    ctx.font = `500 ${descSize}px 'Inter', sans-serif`;
    ctx.fillStyle = '#94A3B8';
    const wrappedDesc = this.wrapText(ctx, description, cardW - innerPadX * 2);
    wrappedDesc.forEach(dLine => {
      ctx.fillText(dLine, cardX + innerPadX, currY);
      currY += descSize * 1.35;
    });

    // Bottom Metric Highlight Pill
    const metricW = cardW - innerPadX * 2;
    const metricH = (width / 720) * 46;
    const metricY = cardY + cardH - metricH - cardH * 0.1;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cardX + innerPadX, metricY, metricW, metricH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.font = `700 ${(width / 720) * 15}px 'Inter', sans-serif`;
    ctx.fillStyle = '#FEF08A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`✦ ${metric} ✦`, cardX + innerPadX + metricW / 2, metricY + metricH / 2);

    ctx.restore();
  }

  // 3. METRIC GRID (Multi-Pill Craft & Value Archetype)
  public drawMetricGrid(props: any, rc: RenderContext): void {
    const { ctx, width, height, progress } = rc;
    const headline = props.headline || 'CRAFT & CAPABILITIES';
    const items = props.items || [
      { num: '01', title: 'Brand Identity & Visual Systems', desc: 'Logos, guidelines & typography' },
      { num: '02', title: 'Motion Graphics & 3D Animation', desc: 'Dynamic 60fps high-converting reels' },
      { num: '03', title: 'Performance Ad Creatives', desc: 'Engineered for viral retention & growth' }
    ];

    ctx.save();

    // Section Headline
    const headSize = (width / 720) * 36;
    ctx.font = `900 ${headSize}px 'Cinzel', serif`;
    ctx.fillStyle = '#FEF08A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
    ctx.shadowBlur = 14;
    ctx.fillText(headline.toUpperCase(), width / 2, height * 0.22);
    ctx.shadowBlur = 0;

    // Render Staggered Cards
    const cardW = width * 0.84;
    const cardH = (height * 0.46) / items.length;
    const startY = height * 0.32;
    const gap = 16;

    items.forEach((item: any, idx: number) => {
      // Staggered entry delay per item
      const itemProgress = Math.max(0, Math.min(1, (progress - idx * 0.12) * 2.8));
      const ease = easeOutBack(itemProgress);
      const alpha = Math.min(1, itemProgress * 1.6);

      if (alpha <= 0) return;

      const y = startY + idx * (cardH + gap);
      const x = (width - cardW) / 2 + (1 - ease) * 60;

      ctx.save();
      ctx.globalAlpha = alpha;

      // Card Glass Fill
      ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
      ctx.strokeStyle = idx === 1 ? 'rgba(245, 158, 11, 0.6)' : 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x, y, cardW, cardH, 16);
      ctx.fill();
      ctx.stroke();

      // Number badge
      const numBoxSize = cardH * 0.55;
      const numBoxX = x + 18;
      const numBoxY = y + (cardH - numBoxSize) / 2;

      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(numBoxX, numBoxY, numBoxSize, numBoxSize, 10);
      ctx.fill();
      ctx.stroke();

      ctx.font = `800 ${(width / 720) * 18}px 'Inter', sans-serif`;
      ctx.fillStyle = '#F59E0B';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.num || `0${idx + 1}`, numBoxX + numBoxSize / 2, numBoxY + numBoxSize / 2);

      // Title & Desc
      const textX = numBoxX + numBoxSize + 18;
      const titleY = y + cardH * 0.30;
      const descY = y + cardH * 0.68;

      ctx.font = `700 ${(width / 720) * 20}px 'Inter', system-ui, sans-serif`;
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.title, textX, titleY);

      ctx.font = `500 ${(width / 720) * 15}px 'Inter', system-ui, sans-serif`;
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(item.desc, textX, descY);

      ctx.restore();
    });

    ctx.restore();
  }

  // 4. VECTOR ILLUSTRATION (Stylized Pen Tool Drawing Bezier Curves)
  public drawVectorIllustration(props: any, rc: RenderContext): void {
    const { ctx, width, height, progress, time } = rc;
    const cx = width / 2;
    const cy = height * 0.58;
    const scale = (width / 720);

    ctx.save();
    ctx.translate(cx, cy);

    // Dynamic drawing curve
    const pathProgress = Math.min(1, progress * 1.6);
    const p0 = { x: -220 * scale, y: 40 * scale };
    const p1 = { x: -80 * scale, y: -160 * scale };
    const p2 = { x: 80 * scale, y: 160 * scale };
    const p3 = { x: 220 * scale, y: -40 * scale };

    // Draw coordinate grid guidelines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(-250 * scale, -180 * scale, 500 * scale, 360 * scale);
    ctx.setLineDash([]);

    // Draw Anchor Handle Tangent Lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.moveTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.stroke();

    // Draw Cubic Bezier Path progressively
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 4 * scale;
    ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
    ctx.shadowBlur = 15;

    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);

    const steps = 60;
    const maxStep = Math.round(steps * pathProgress);
    let currentX = p0.x;
    let currentY = p0.y;

    for (let i = 0; i <= maxStep; i++) {
      const t = i / steps;
      const x = Math.pow(1 - t, 3) * p0.x +
                3 * Math.pow(1 - t, 2) * t * p1.x +
                3 * (1 - t) * Math.pow(t, 2) * p2.x +
                Math.pow(t, 3) * p3.x;
      const y = Math.pow(1 - t, 3) * p0.y +
                3 * Math.pow(1 - t, 2) * t * p1.y +
                3 * (1 - t) * Math.pow(t, 2) * p2.y +
                Math.pow(t, 3) * p3.y;
      ctx.lineTo(x, y);
      currentX = x;
      currentY = y;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Anchor Point Handles
    [p0, p1, p2, p3].forEach((pt, pIdx) => {
      ctx.fillStyle = pIdx === 0 || pIdx === 3 ? '#38BDF8' : '#FEF08A';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Stylus Pen Nib at current drawing position
    ctx.save();
    ctx.translate(currentX, currentY);
    ctx.rotate(-Math.PI / 4);

    // Pen Nib Body
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-12 * scale, -28 * scale);
    ctx.lineTo(12 * scale, -28 * scale);
    ctx.closePath();
    ctx.fill();

    // Pen Core
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(-12 * scale, -55 * scale, 24 * scale, 27 * scale);

    // Spark light at nib tip
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, 4 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    ctx.restore();
  }

  // 5. GEOMETRIC FOCUS (Golden Ratio Concentric Rings & Reticles)
  public drawGeometricFocus(props: any, rc: RenderContext): void {
    const { ctx, width, height, time } = rc;
    const color = props.color || '#F59E0B';
    const cx = width / 2;
    const cy = height * 0.50;
    const radius = (width / 720) * 140;

    ctx.save();
    ctx.translate(cx, cy);

    // Rotating nested frames
    ctx.save();
    ctx.rotate(time * 0.15);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.35;
    ctx.strokeRect(-radius * 0.8, -radius * 0.8, radius * 1.6, radius * 1.6);
    ctx.restore();

    ctx.save();
    ctx.rotate(-time * 0.22);
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.25;
    ctx.strokeRect(-radius * 0.6, -radius * 0.6, radius * 1.2, radius * 1.2);
    ctx.restore();

    // Concentric Dashed Compass Rings
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.45;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Central Radar Crosshair
    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(-radius * 0.25, 0);
    ctx.lineTo(radius * 0.25, 0);
    ctx.moveTo(0, -radius * 0.25);
    ctx.lineTo(0, radius * 0.25);
    ctx.stroke();

    ctx.restore();
  }

  // 6. BRAND OUTRO (Climax & CTA Archetype)
  public drawBrandOutro(props: any, rc: RenderContext): void {
    const { ctx, width, height, progress, time } = rc;
    const brandName = props.brandName || 'SUKH GRAPHIX';
    const tagline = props.tagline || 'Illuminating Creative Excellence';
    const cta = props.cta || 'START YOUR PROJECT →';
    const emblem = props.emblem || 'SG';
    const glowColor = props.glowColor || '#F59E0B';

    ctx.save();
    const enter = Math.min(1, progress * 2.4);
    const ease = easeOutBack(enter);
    ctx.globalAlpha = Math.min(1, enter * 1.6);

    const cx = width / 2;
    const cy = height * 0.44;

    // A. Grand Monogram Crest Emblem
    const crestRadius = (width / 720) * 65;
    const crestY = cy - crestRadius - 40;

    // Pulsing Outer Aura Ring
    const auraPulse = 1.0 + Math.sin(time * 4) * 0.08;
    const auraGrad = ctx.createRadialGradient(cx, crestY, crestRadius * 0.5, cx, crestY, crestRadius * 1.8 * auraPulse);
    auraGrad.addColorStop(0, 'rgba(245, 158, 11, 0.45)');
    auraGrad.addColorStop(0.5, 'rgba(180, 83, 9, 0.15)');
    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(cx, crestY, crestRadius * 1.8 * auraPulse, 0, Math.PI * 2);
    ctx.fill();

    // Crest Circular Border
    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 3;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(cx, crestY, crestRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Crest Monogram Initials
    ctx.font = `900 ${(width / 720) * 44}px 'Cinzel', 'Playfair Display', serif`;
    ctx.fillStyle = '#FEF08A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emblem, cx, crestY);
    ctx.shadowBlur = 0;

    // B. Brand Title with Travelling Specular Sheen
    const brandFontSize = (width / 720) * 50;
    ctx.font = `900 ${brandFontSize}px 'Cinzel', 'Playfair Display', serif`;
    const brandY = cy + 30;

    // Metallic Title Gradient
    const brandGrad = ctx.createLinearGradient(cx - width * 0.35, 0, cx + width * 0.35, 0);
    brandGrad.addColorStop(0, '#FEF08A');
    brandGrad.addColorStop(0.5, '#F59E0B');
    brandGrad.addColorStop(1, '#D97706');

    ctx.fillStyle = brandGrad;
    ctx.shadowColor = 'rgba(245, 158, 11, 0.7)';
    ctx.shadowBlur = 22;
    ctx.fillText(brandName.toUpperCase(), cx, brandY);
    ctx.shadowBlur = 0;

    // Specular Light Sheen Sweep
    const sheenProgress = (time * 0.7) % 1.5;
    const sheenX = (cx - width * 0.4) + sheenProgress * (width * 0.8);
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx - width * 0.4, brandY - brandFontSize / 2, width * 0.8, brandFontSize);
    ctx.clip();

    const sheenGrad = ctx.createLinearGradient(sheenX - 60, 0, sheenX + 60, 0);
    sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    sheenGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.85)');
    sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sheenGrad;
    ctx.fillRect(sheenX - 60, brandY - brandFontSize / 2, 120, brandFontSize);
    ctx.restore();

    // C. Elegant Tagline
    const tagFontSize = (width / 720) * 18;
    ctx.font = `600 ${tagFontSize}px 'Inter', sans-serif`;
    ctx.fillStyle = '#CBD5E1';
    ctx.letterSpacing = '3px';
    ctx.fillText(tagline.toUpperCase(), cx, brandY + brandFontSize * 0.9);

    // D. Call to Action Pill Button
    const ctaY = brandY + brandFontSize * 0.9 + 55;
    const ctaW = width * 0.72;
    const ctaH = (width / 720) * 58;
    const ctaX = (width - ctaW) / 2;

    // CTA Button Pulse & Glow
    const ctaPulse = 1.0 + Math.sin(time * 3.5) * 0.02;
    ctx.save();
    ctx.translate(cx, ctaY + ctaH / 2);
    ctx.scale(ctaPulse, ctaPulse);
    ctx.translate(-cx, -(ctaY + ctaH / 2));

    ctx.fillStyle = '#F59E0B';
    ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.roundRect(ctaX, ctaY, ctaW, ctaH, ctaH / 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = `800 ${(width / 720) * 18}px 'Inter', system-ui, sans-serif`;
    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(cta, cx, ctaY + ctaH / 2);

    ctx.restore();

    ctx.restore();
  }

  // Floating Embers & Particle Sparks
  public drawParticles(props: any, rc: RenderContext): void {
    const { ctx, width, height, time } = rc;
    const count = props.count || 50;

    ctx.save();
    for (let i = 0; i < Math.min(count, this.particles.length); i++) {
      const p = this.particles[i];

      const px = ((p.x + p.vx * time * 0.5) % 1 + 1) % 1 * width;
      const py = ((p.y + p.vy * time * 0.5) % 1 + 1) % 1 * height;

      const twinkle = Math.sin(time * p.twinkleSpeed + p.twinklePhase);
      const alpha = Math.max(0.1, p.alpha * (0.6 + twinkle * 0.4));

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

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

  // Legacy Diya Drawing (Festive Celebrations)
  public drawDiya(props: any, rc: RenderContext): void {
    const { ctx, width, height, time } = rc;
    const size = (props.size || 130) * (width / 720);
    const cx = width / 2;
    const cy = height * 0.55;

    ctx.save();
    ctx.translate(cx, cy);

    const floatY = Math.sin(time * 2.5) * 5;
    ctx.translate(0, floatY);

    // Radiant Aura Halo
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

    // Terracotta Bowl
    const bowlGrad = ctx.createLinearGradient(0, -size * 0.1, 0, size * 0.6);
    bowlGrad.addColorStop(0, '#D97706');
    bowlGrad.addColorStop(0.5, '#92400E');
    bowlGrad.addColorStop(1, '#451A03');

    ctx.fillStyle = bowlGrad;
    ctx.strokeStyle = '#FDE68A';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.bezierCurveTo(-size * 0.9, size * 0.7, size * 0.9, size * 0.7, size, 0);
    ctx.bezierCurveTo(size * 0.6, size * 0.15, -size * 0.6, size * 0.15, -size, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Flickering Flame
    const flickerX = Math.sin(time * 14) * (size * 0.04) + Math.cos(time * 22) * (size * 0.02);
    const flickerHeight = size * (0.8 + Math.sin(time * 18) * 0.08);

    const flameOuterGrad = ctx.createLinearGradient(0, 0, 0, -flickerHeight);
    flameOuterGrad.addColorStop(0, '#DC2626');
    flameOuterGrad.addColorStop(0.3, '#EA580C');
    flameOuterGrad.addColorStop(0.7, '#FBBF24');
    flameOuterGrad.addColorStop(1, '#FEF3C7');

    ctx.fillStyle = flameOuterGrad;
    ctx.beginPath();
    ctx.moveTo(-size * 0.25, -size * 0.05);
    ctx.bezierCurveTo(-size * 0.35, -flickerHeight * 0.4, flickerX - size * 0.1, -flickerHeight * 0.75, flickerX, -flickerHeight);
    ctx.bezierCurveTo(flickerX + size * 0.1, -flickerHeight * 0.75, size * 0.35, -flickerHeight * 0.4, size * 0.25, -size * 0.05);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Legacy Typography Element
  public drawTypography(props: any, rc: RenderContext): void {
    this.drawKineticHeadline({
      kicker: '✦ HIGHLIGHT',
      headline: props.text || '',
      subtitle: props.subtitle || '',
      accentColor: props.style === 'neon_glow' ? '#38BDF8' : '#F59E0B'
    }, rc);
  }

  // Legacy Brand Reveal Element
  public drawBrandReveal(props: any, rc: RenderContext): void {
    this.drawBrandOutro(props, rc);
  }

  // Legacy Device Mockup
  public drawDeviceMockup(props: any, rc: RenderContext): void {
    const { ctx, width, height, progress } = rc;
    const phoneW = width * 0.65;
    const phoneH = phoneW * 2.05;
    const cx = width / 2;
    const cy = height * 0.52;

    ctx.save();
    ctx.translate(cx, cy);

    const enterY = Math.max(0, (1 - progress * 3) * 100);
    ctx.translate(0, enterY);

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

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.roundRect(-40, -phoneH / 2 + 12, 80, 22, 11);
    ctx.fill();

    ctx.fillStyle = '#1E293B';
    ctx.fillRect(-phoneW / 2 + 8, -phoneH / 2 + 45, phoneW - 16, phoneH - 60);

    ctx.restore();
  }

  // Legacy Geometric Element
  public drawGeometric(props: any, rc: RenderContext): void {
    this.drawGeometricFocus(props, rc);
  }

  // Kinetic Subtitle Captions with Safe Margin Protection
  private drawKineticCaptions(rc: RenderContext): void {
    const { ctx, width, height, scene } = rc;
    const text = scene.captionText;
    if (!text) return;

    ctx.save();
    const fontSize = (width / 720) * 28;
    ctx.font = `800 ${fontSize}px 'Inter', system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const maxTextWidth = width * 0.82;
    const lines = this.wrapText(ctx, text, maxTextWidth);

    const startY = height * 0.82;
    const lineHeight = fontSize * 1.4;

    lines.forEach((line, index) => {
      if (!line.trim()) return;
      const y = startY + index * lineHeight;

      const metrics = ctx.measureText(line);
      const bgPadX = 18;
      const bgPadY = 6;

      ctx.fillStyle = 'rgba(10, 15, 29, 0.85)';
      ctx.beginPath();
      ctx.roundRect(
        width / 2 - metrics.width / 2 - bgPadX,
        y - fontSize / 2 - bgPadY,
        metrics.width + bgPadX * 2,
        fontSize + bgPadY * 2,
        10
      );
      ctx.fill();

      ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(line, width / 2, y);
    });

    ctx.restore();
  }

  // Dynamic Multicolor Powder Ambience for Holi & Spring Celebrations
  private drawHoliAmbience(rc: RenderContext): void {
    const { ctx, width, height, time } = rc;
    const holiColors = ['#EC4899', '#06B6D4', '#FACC15', '#A855F7', '#10B981', '#F97316', '#FFFFFF'];

    // 1. Soft expanding powder cloud blooms
    const clouds = [
      { x: width * 0.35 + Math.sin(time * 1.2) * 40, y: height * 0.42, color: 'rgba(236, 72, 153, 0.24)', r: width * 0.32 },
      { x: width * 0.68 + Math.cos(time * 1.0) * 40, y: height * 0.52, color: 'rgba(6, 182, 212, 0.22)', r: width * 0.36 },
      { x: width * 0.50 + Math.sin(time * 0.9) * 30, y: height * 0.65, color: 'rgba(250, 204, 21, 0.20)', r: width * 0.28 }
    ];

    clouds.forEach(c => {
      const g = ctx.createRadialGradient(c.x, c.y, 10, c.x, c.y, c.r);
      g.addColorStop(0, c.color);
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. Multi-color floating powder flecks
    ctx.save();
    for (let i = 0; i < 48; i++) {
      const px = ((i * 37 + time * 65) % width);
      const py = ((i * 53 + Math.sin(time * 2 + i) * 80 + height) % height);
      const color = holiColors[i % holiColors.length];
      const size = 3 + (i % 5);

      ctx.fillStyle = color;
      ctx.globalAlpha = 0.55 + Math.sin(time * 3 + i) * 0.3;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }
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

  // Enhanced Scene Transitions (Fade, Slide Left/Right, Wipe)
  private applyTransitions(rc: RenderContext): void {
    const { ctx, width, height, scene, progress } = rc;
    const transition = scene.transition || 'fade';

    // Enter transition (first 10% of scene)
    if (progress < 0.1) {
      const enter = progress / 0.1;
      const ease = easeOutCubic(enter);

      if (transition === 'fade') {
        ctx.fillStyle = `rgba(0, 0, 0, ${1 - ease})`;
        ctx.fillRect(0, 0, width, height);
      } else if (transition === 'slide_left') {
        const wipeW = width * (1 - ease);
        ctx.fillStyle = '#0A0E17';
        ctx.fillRect(0, 0, wipeW, height);
      } else if (transition === 'slide_right') {
        const wipeW = width * (1 - ease);
        ctx.fillStyle = '#0A0E17';
        ctx.fillRect(width - wipeW, 0, wipeW, height);
      }
    }

    // Exit transition (last 10% of scene)
    if (progress > 0.9) {
      const exit = (progress - 0.9) / 0.1;
      const ease = easeInOutCubic(exit);

      if (transition === 'fade') {
        ctx.fillStyle = `rgba(0, 0, 0, ${ease})`;
        ctx.fillRect(0, 0, width, height);
      } else if (transition === 'slide_left') {
        const wipeW = width * ease;
        ctx.fillStyle = '#0A0E17';
        ctx.fillRect(width - wipeW, 0, wipeW, height);
      } else if (transition === 'slide_right') {
        const wipeW = width * ease;
        ctx.fillStyle = '#0A0E17';
        ctx.fillRect(0, 0, wipeW, height);
      }
    }
  }
}
