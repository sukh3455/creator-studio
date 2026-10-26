import { CharacterExpression, CharacterPose } from '../types/timeline';
import { CharacterTransform } from './physicsEngine';

export interface CharacterRenderOptions {
  transform: CharacterTransform;
  expression?: CharacterExpression;
  pose?: CharacterPose;
  elapsed: number;
  isSpeaking: boolean;
  accentColor?: string;
}

export class CharacterRenderer {
  private outlineColor = '#0f172a';
  private outlineWidth = 6;
  private skinColor = '#fed7aa';
  private skinShadow = '#fdba74';
  private tealShirt = '#0d9488';
  private tealHighlight = '#14b8a6';
  private tealShadow = '#0f766e';
  private pantsColor = '#1e293b';
  private shoeColor = '#0f172a';
  private hairColor = '#3b1c06';

  public draw(ctx: CanvasRenderingContext2D, options: CharacterRenderOptions) {
    const { transform, expression = 'happy', pose = 'explaining', elapsed, isSpeaking } = options;
    const { x, y, scaleX, scaleY, rotation } = transform;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scaleX, scaleY);

    // Apply cartoon line styling
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw Ground Shadow
    this.drawShadow(ctx, transform);

    // Character parts drawn back-to-front:
    // 1. Legs and Shoes
    this.drawLegsAndShoes(ctx, elapsed, transform.isSquashing);

    // 2. Torso (Teal Shirt)
    this.drawTorso(ctx, elapsed);

    // 3. Head (Face, Hair, Expression)
    this.drawHead(ctx, elapsed, expression, isSpeaking);

    // 4. Arms and Poses (Teal sleeves + hands)
    this.drawArms(ctx, elapsed, pose, isSpeaking);

    ctx.restore();
  }

  private drawShadow(ctx: CanvasRenderingContext2D, transform: CharacterTransform) {
    const shadowWidth = 110 * (1 / (1 + (transform.groundY - transform.y) * 0.008));
    const shadowHeight = 22 * (1 / (1 + (transform.groundY - transform.y) * 0.008));
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 5, Math.max(15, shadowWidth), Math.max(5, shadowHeight), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawLegsAndShoes(ctx: CanvasRenderingContext2D, elapsed: number, isSquashing: boolean) {
    const legSpread = isSquashing ? 34 : 26;
    const legY = -90;
    const shoeY = 0;

    // Pants (Dark slate denim)
    ctx.lineWidth = this.outlineWidth;
    ctx.strokeStyle = this.outlineColor;
    ctx.fillStyle = this.pantsColor;

    // Left leg
    ctx.beginPath();
    ctx.moveTo(-legSpread, legY);
    ctx.lineTo(-legSpread - 5, shoeY - 14);
    ctx.lineTo(-legSpread + 16, shoeY - 14);
    ctx.lineTo(-legSpread + 14, legY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.moveTo(legSpread - 14, legY);
    ctx.lineTo(legSpread - 16, shoeY - 14);
    ctx.lineTo(legSpread + 5, shoeY - 14);
    ctx.lineTo(legSpread, legY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Left Shoe
    this.drawShoe(ctx, -legSpread - 4, shoeY, false);
    // Right Shoe
    this.drawShoe(ctx, legSpread - 6, shoeY, true);
  }

  private drawShoe(ctx: CanvasRenderingContext2D, x: number, y: number, isRight: boolean) {
    ctx.save();
    ctx.translate(x, y);
    if (!isRight) ctx.scale(-1, 1);

    // Shoe base
    ctx.fillStyle = this.shoeColor;
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = this.outlineWidth;

    ctx.beginPath();
    ctx.roundRect(-10, -18, 38, 18, [8, 12, 4, 4]);
    ctx.fill();
    ctx.stroke();

    // Rubber sole (White)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(-10, -6, 38, 6, [0, 0, 4, 4]);
    ctx.fill();
    ctx.stroke();

    // Teal accent stripe on sneaker
    ctx.fillStyle = this.tealHighlight;
    ctx.beginPath();
    ctx.roundRect(0, -14, 16, 4, 2);
    ctx.fill();

    ctx.restore();
  }

  private drawTorso(ctx: CanvasRenderingContext2D, elapsed: number) {
    const torsoY = -170;
    const torsoW = 80;
    const torsoH = 85;

    ctx.save();
    ctx.lineWidth = this.outlineWidth;
    ctx.strokeStyle = this.outlineColor;

    // Teal Shirt Base Body
    ctx.fillStyle = this.tealShirt;
    ctx.beginPath();
    // Rounded trapezoid for cartoon chest & belly
    ctx.moveTo(-torsoW / 2 + 6, torsoY);
    ctx.lineTo(torsoW / 2 - 6, torsoY);
    ctx.quadraticCurveTo(torsoW / 2 + 10, torsoY + torsoH * 0.6, torsoW / 2 + 2, torsoY + torsoH);
    ctx.lineTo(-torsoW / 2 - 2, torsoY + torsoH);
    ctx.quadraticCurveTo(-torsoW / 2 - 10, torsoY + torsoH * 0.6, -torsoW / 2 + 6, torsoY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Teal Shirt Highlight & Shadow details
    // Shadow under collar / bottom fold
    ctx.fillStyle = this.tealShadow;
    ctx.beginPath();
    ctx.moveTo(-torsoW / 2 + 4, torsoY + torsoH - 12);
    ctx.quadraticCurveTo(0, torsoY + torsoH - 4, torsoW / 2 - 4, torsoY + torsoH - 12);
    ctx.lineTo(torsoW / 2 + 2, torsoY + torsoH);
    ctx.lineTo(-torsoW / 2 - 2, torsoY + torsoH);
    ctx.closePath();
    ctx.fill();

    // Chest Highlight sheen
    ctx.fillStyle = this.tealHighlight;
    ctx.beginPath();
    ctx.ellipse(-14, torsoY + 28, 8, 20, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Collar (V-neck with dark outline)
    ctx.fillStyle = this.skinColor;
    ctx.beginPath();
    ctx.moveTo(-16, torsoY);
    ctx.lineTo(0, torsoY + 16);
    ctx.lineTo(16, torsoY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Collar Hem Trim
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-20, torsoY);
    ctx.lineTo(0, torsoY + 20);
    ctx.lineTo(20, torsoY);
    ctx.stroke();

    ctx.restore();
  }

  private drawHead(
    ctx: CanvasRenderingContext2D,
    elapsed: number,
    expression: CharacterExpression,
    isSpeaking: boolean
  ) {
    const headY = -230;
    const headRadius = 48;

    ctx.save();
    ctx.translate(0, headY);

    // Subtle head bob
    const bob = Math.sin(elapsed * 4) * 2;
    ctx.translate(0, bob);

    // 1. Neck
    ctx.fillStyle = this.skinShadow;
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = this.outlineWidth;
    ctx.fillRect(-14, headRadius - 10, 28, 22);
    ctx.strokeRect(-14, headRadius - 10, 28, 22);

    // 2. Ears
    ctx.fillStyle = this.skinColor;
    // Left ear
    ctx.beginPath();
    ctx.arc(-headRadius - 4, 4, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Right ear
    ctx.beginPath();
    ctx.arc(headRadius + 4, 4, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3. Head shape (warm cartoon tone)
    ctx.fillStyle = this.skinColor;
    ctx.beginPath();
    ctx.arc(0, 0, headRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cheerful Rosy Blush
    ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
    ctx.beginPath();
    ctx.arc(-26, 12, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(26, 12, 11, 0, Math.PI * 2);
    ctx.fill();

    // 4. Stylized Messy Cartoon Hair (Chunky dark tufts with thick outline)
    this.drawHair(ctx, headRadius);

    // 5. Facial Features (Eyes, Eyebrows, Mouth)
    this.drawFace(ctx, elapsed, expression, isSpeaking);

    ctx.restore();
  }

  private drawHair(ctx: CanvasRenderingContext2D, headRadius: number) {
    ctx.fillStyle = this.hairColor;
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = this.outlineWidth;

    ctx.beginPath();
    // Hair tufts looping across top of head
    ctx.moveTo(-headRadius - 6, -6);
    ctx.quadraticCurveTo(-headRadius - 12, -headRadius, -headRadius * 0.6, -headRadius - 14);
    ctx.lineTo(-headRadius * 0.3, -headRadius - 26);
    ctx.lineTo(-headRadius * 0.05, -headRadius - 16);
    ctx.lineTo(headRadius * 0.25, -headRadius - 28);
    ctx.lineTo(headRadius * 0.45, -headRadius - 16);
    ctx.quadraticCurveTo(headRadius + 14, -headRadius * 0.7, headRadius + 6, -6);
    // Front bangs dipping over forehead
    ctx.quadraticCurveTo(headRadius * 0.5, -headRadius * 0.4, 10, -headRadius * 0.5);
    ctx.lineTo(4, -headRadius * 0.25);
    ctx.lineTo(-8, -headRadius * 0.45);
    ctx.quadraticCurveTo(-headRadius * 0.5, -headRadius * 0.35, -headRadius - 6, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Hair shine streak
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(-24, -headRadius - 12, 44, 7, 4);
    ctx.fill();
  }

  private drawFace(
    ctx: CanvasRenderingContext2D,
    elapsed: number,
    expression: CharacterExpression,
    isSpeaking: boolean
  ) {
    // Eye blink calculation: quick blink every ~3.5 seconds
    const blinkCycle = elapsed % 3.5;
    const isBlinking = blinkCycle > 3.35 && blinkCycle < 3.48;

    // Eyebrows
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 5;

    if (expression === 'thinking') {
      // One raised questioning brow, one lowered
      ctx.beginPath();
      ctx.moveTo(-28, -26);
      ctx.lineTo(-10, -32);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(10, -22);
      ctx.lineTo(28, -18);
      ctx.stroke();
    } else if (expression === 'surprised') {
      // Arched high brows
      ctx.beginPath();
      ctx.arc(-18, -24, 12, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(18, -24, 12, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    } else {
      // Confident happy brows
      ctx.beginPath();
      ctx.arc(-18, -20, 11, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(18, -20, 11, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    }

    // Eyes
    if (isBlinking) {
      // Closed line eyes
      ctx.beginPath();
      ctx.moveTo(-26, -6);
      ctx.lineTo(-10, -6);
      ctx.moveTo(10, -6);
      ctx.lineTo(26, -6);
      ctx.stroke();
    } else if (expression === 'happy') {
      // Joyful upward crescent eyes (^ ^)
      ctx.beginPath();
      ctx.arc(-18, -4, 11, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(18, -4, 11, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    } else if (expression === 'excited') {
      // Big starry expressive eyes
      this.drawEye(ctx, -18, -6, 14, true);
      this.drawEye(ctx, 18, -6, 14, true);
    } else {
      // Standard big cartoon expressive eyes
      this.drawEye(ctx, -18, -6, 13, false);
      this.drawEye(ctx, 18, -6, 13, false);
    }

    // Nose
    ctx.fillStyle = this.skinShadow;
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 3, 5, 0, Math.PI * 2);
    ctx.stroke();

    // Mouth
    this.drawMouth(ctx, elapsed, expression, isSpeaking);
  }

  private drawEye(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    sparkle: boolean
  ) {
    ctx.save();
    // Eye white
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * 1.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pupil
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(x + 1, y, size * 0.58, 0, Math.PI * 2);
    ctx.fill();

    // Catchlight shine reflections
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x - 2, y - 3, size * 0.28, 0, Math.PI * 2);
    ctx.fill();

    if (sparkle) {
      // Small secondary glint
      ctx.beginPath();
      ctx.arc(x + 3, y + 3, size * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawMouth(
    ctx: CanvasRenderingContext2D,
    elapsed: number,
    expression: CharacterExpression,
    isSpeaking: boolean
  ) {
    ctx.save();
    const mouthY = 20;

    if (isSpeaking) {
      // Dynamic talking mouth flap synchronized with voice envelope
      const speakOpen = Math.abs(Math.sin(elapsed * 14));
      const mouthHeight = 8 + speakOpen * 16;
      const mouthWidth = 26 + speakOpen * 6;

      ctx.fillStyle = '#881337'; // Deep mouth interior
      ctx.strokeStyle = this.outlineColor;
      ctx.lineWidth = 4;

      ctx.beginPath();
      ctx.ellipse(0, mouthY + mouthHeight * 0.3, mouthWidth / 2, mouthHeight / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Upper white teeth
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.rect(-mouthWidth * 0.35, mouthY - 2, mouthWidth * 0.7, 5);
      ctx.fill();

      // Pink tongue
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(0, mouthY + mouthHeight * 0.6, mouthWidth * 0.3, Math.PI, 0);
      ctx.fill();
    } else {
      // Static expressive mouth shapes
      ctx.strokeStyle = this.outlineColor;
      ctx.lineWidth = 4;

      switch (expression) {
        case 'surprised': {
          ctx.fillStyle = '#881337';
          ctx.beginPath();
          ctx.ellipse(0, mouthY, 9, 13, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          break;
        }
        case 'thinking': {
          ctx.beginPath();
          ctx.moveTo(-10, mouthY + 2);
          ctx.quadraticCurveTo(0, mouthY - 4, 12, mouthY);
          ctx.stroke();
          break;
        }
        case 'excited': {
          ctx.fillStyle = '#881337';
          ctx.beginPath();
          ctx.arc(0, mouthY - 4, 16, 0.1 * Math.PI, 0.9 * Math.PI);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          // Teeth
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.rect(-10, mouthY - 4, 20, 5);
          ctx.fill();
          break;
        }
        case 'cool': {
          ctx.beginPath();
          ctx.moveTo(-6, mouthY);
          ctx.quadraticCurveTo(8, mouthY + 2, 14, mouthY - 4);
          ctx.stroke();
          break;
        }
        case 'happy':
        default: {
          // Broad friendly smile
          ctx.beginPath();
          ctx.arc(0, mouthY - 6, 15, 0.2 * Math.PI, 0.8 * Math.PI);
          ctx.stroke();
          // Smile corner dimples
          ctx.beginPath();
          ctx.moveTo(-12, mouthY + 2);
          ctx.lineTo(-15, mouthY);
          ctx.moveTo(12, mouthY + 2);
          ctx.lineTo(15, mouthY);
          ctx.stroke();
          break;
        }
      }
    }
    ctx.restore();
  }

  private drawArms(
    ctx: CanvasRenderingContext2D,
    elapsed: number,
    pose: CharacterPose,
    isSpeaking: boolean
  ) {
    const shoulderY = -155;
    const leftShoulderX = -42;
    const rightShoulderX = 42;

    switch (pose) {
      case 'pointing': {
        // Left arm casual, Right arm extended pointing towards content
        this.drawSleeve(ctx, leftShoulderX, shoulderY, -20, 45);
        this.drawHand(ctx, leftShoulderX - 16, shoulderY + 45, 'rest');

        this.drawSleeve(ctx, rightShoulderX, shoulderY, 55, -25);
        this.drawHand(ctx, rightShoulderX + 55, shoulderY - 25, 'pointing');
        break;
      }

      case 'waving': {
        // Right arm raised, forearm swinging
        const waveAngle = Math.sin(elapsed * 7) * 20;
        this.drawSleeve(ctx, rightShoulderX, shoulderY, 40, -50 + waveAngle);
        this.drawHand(ctx, rightShoulderX + 40, shoulderY - 50 + waveAngle, 'open');

        this.drawSleeve(ctx, leftShoulderX, shoulderY, -18, 42);
        this.drawHand(ctx, leftShoulderX - 18, shoulderY + 42, 'rest');
        break;
      }

      case 'cheering': {
        // Both arms raised high in victory!
        this.drawSleeve(ctx, leftShoulderX, shoulderY, -35, -55);
        this.drawHand(ctx, leftShoulderX - 35, shoulderY - 55, 'fist');

        this.drawSleeve(ctx, rightShoulderX, shoulderY, 35, -55);
        this.drawHand(ctx, rightShoulderX + 35, shoulderY - 55, 'fist');
        break;
      }

      case 'thumbs_up': {
        this.drawSleeve(ctx, leftShoulderX, shoulderY, -20, 35);
        this.drawHand(ctx, leftShoulderX - 20, shoulderY + 35, 'rest');

        this.drawSleeve(ctx, rightShoulderX, shoulderY, 36, -8);
        this.drawHand(ctx, rightShoulderX + 36, shoulderY - 8, 'thumbs_up');
        break;
      }

      case 'hands_on_hips': {
        this.drawSleeve(ctx, leftShoulderX, shoulderY, -28, 22);
        this.drawHand(ctx, leftShoulderX - 28, shoulderY + 22, 'hip');

        this.drawSleeve(ctx, rightShoulderX, shoulderY, 28, 22);
        this.drawHand(ctx, rightShoulderX + 28, shoulderY + 22, 'hip');
        break;
      }

      case 'explaining':
      default: {
        // Welcoming explainer arms, gesturing with speech cadence
        const gestureL = Math.sin(elapsed * 4) * 8;
        const gestureR = Math.cos(elapsed * 4) * 8;

        this.drawSleeve(ctx, leftShoulderX, shoulderY, -36, 12 + gestureL);
        this.drawHand(ctx, leftShoulderX - 36, shoulderY + 12 + gestureL, 'open');

        this.drawSleeve(ctx, rightShoulderX, shoulderY, 36, 12 + gestureR);
        this.drawHand(ctx, rightShoulderX + 36, shoulderY + 12 + gestureR, 'open');
        break;
      }
    }
  }

  private drawSleeve(
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    dx: number,
    dy: number
  ) {
    ctx.save();
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = this.outlineWidth;
    ctx.lineCap = 'round';

    // Teal Shirt Arm Sleeve
    ctx.strokeStyle = this.tealShirt;
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + dx * 0.7, startY + dy * 0.7);
    ctx.stroke();

    // Outline over sleeve
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = this.outlineWidth;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + dx * 0.7, startY + dy * 0.7);
    ctx.stroke();

    // Forearm (warm skin tone)
    ctx.strokeStyle = this.skinColor;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(startX + dx * 0.7, startY + dy * 0.7);
    ctx.lineTo(startX + dx, startY + dy);
    ctx.stroke();

    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = this.outlineWidth;
    ctx.beginPath();
    ctx.moveTo(startX + dx * 0.7, startY + dy * 0.7);
    ctx.lineTo(startX + dx, startY + dy);
    ctx.stroke();

    ctx.restore();
  }

  private drawHand(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    type: 'pointing' | 'open' | 'fist' | 'thumbs_up' | 'hip' | 'rest'
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = this.skinColor;
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 4;

    switch (type) {
      case 'pointing': {
        // Pointing index finger
        ctx.beginPath();
        ctx.roundRect(-6, -8, 26, 11, 5); // index finger extended
        ctx.fill();
        ctx.stroke();
        // Palm
        ctx.beginPath();
        ctx.roundRect(-10, -5, 14, 16, 4);
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'thumbs_up': {
        // Palm
        ctx.beginPath();
        ctx.roundRect(-8, -4, 16, 16, 4);
        ctx.fill();
        ctx.stroke();
        // Thumb sticking up
        ctx.beginPath();
        ctx.roundRect(-4, -18, 10, 16, 5);
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'fist': {
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'open': {
        // Cartoon open hand
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Fingers
        ctx.beginPath();
        ctx.arc(6, -6, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'hip':
      case 'rest':
      default: {
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      }
    }

    ctx.restore();
  }
}
