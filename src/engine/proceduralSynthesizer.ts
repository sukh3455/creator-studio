export interface GeneratedVisual {
  theme: string;
  code: string;
}

export class ProceduralSynthesizer {
  public static cleanTopic(prompt: string): string {
    const raw = prompt.trim();
    let cleaned = raw
      .replace(/^(explain|how|why|what is|what are|tell me about|make a video about|create a reel on|script about)\s+/i, '')
      .replace(/\s+(works|works\?|happens|is formed|operates|functions|grow|grows)\s*$/i, '')
      .trim();
    return cleaned || raw || 'CONCEPT';
  }

  public static synthesizeVisualCode(prompt: string, sceneIndex: number): GeneratedVisual {
    const raw = prompt.toLowerCase();
    // Normalize into padded string for word boundary checks
    const p = ` ${raw.replace(/[^a-z0-9]/g, ' ')} `;

    // 1. Black Hole / Space / Astronomy / Physics / Stars
    if (/\b(black hole|space|gravity|galaxy|universe|star|stars|cosmos|astronomy|planet|orbit|spacetime)\b/.test(p)) {
      return this.synthesizeBlackHole(sceneIndex);
    }

    // 2. Solar Energy / Photovoltaics / Clean Energy / Photons
    if (/\b(solar|photovoltaic|photon|photons|clean energy|renewable|sunlight|sun power|solar panel|solar panels)\b/.test(p)) {
      return this.synthesizeSolarEnergy(sceneIndex);
    }

    // 3. Crypto / Bitcoin / Blockchain / Web3
    if (/\b(bitcoin|crypto|blockchain|ethereum|token|mining|web3|btc|eth|cryptocurrency)\b/.test(p)) {
      return this.synthesizeCrypto(sceneIndex);
    }

    // 4. Brain / Psychology / Memory / Thinking / Neuroscience / Dopamine
    if (/\b(brain|mind|psychology|neuro|neuroscience|dopamine|habit|habits|memory|mental|synapse|synaptic)\b/.test(p)) {
      return this.synthesizeNeural(sceneIndex);
    }

    // 5. Gym / Muscle / Fitness / Workout / Hypertrophy
    if (/\b(gym|muscle|muscles|fitness|workout|exercise|hypertrophy|lifting|barbell|weights|biceps|squat)\b/.test(p)) {
      return this.synthesizeFitness(sceneIndex);
    }

    // 6. Flight / Aerodynamics / Speed / Aviation
    if (/\b(flight|airplane|airplanes|aircraft|aerodynamic|aerodynamics|airfoil|bernoulli|aviation|propulsion)\b/.test(p)) {
      return this.synthesizeAerodynamics(sceneIndex);
    }

    // 7. Quantum / Superposition / Entanglement / Qubits
    if (/\b(quantum|qubit|qubits|entanglement|schrodinger|superposition|bloch sphere)\b/.test(p)) {
      return this.synthesizeQuantum(sceneIndex);
    }

    // 8. Biology / DNA / Cells / Genetics / Photosynthesis
    if (/\b(dna|cell|cells|biology|cellular|genetics|photosynthesis|mitochondria|chlorophyll|enzyme|enzymes)\b/.test(p)) {
      return this.synthesizeBiologyCell(sceneIndex);
    }

    // 9. Nature / Ecology / Rain / Petrichor / Forest / Animals / Ocean
    if (/\b(rain|petrichor|nature|forest|ecology|tree|trees|ecosystem|weather|ocean|dog|dogs|animal|animals|bark)\b/.test(p)) {
      return this.synthesizeNatureEcology(sceneIndex);
    }

    // 10. History / Empires / Rome / Civilizations / War
    if (/\b(history|empire|empires|rome|roman|war|ancient|sparta|civilization|medieval|gladiator|caesar)\b/.test(p)) {
      return this.synthesizeHistoryEmpire(sceneIndex);
    }

    // 11. Chemistry / Molecules / Atoms / Chemical Reactions
    if (/\b(chemistry|molecule|molecules|atomic|atom|atoms|chemical|reaction|reactions|benzene|covalent)\b/.test(p)) {
      return this.synthesizeChemistryMolecules(sceneIndex);
    }

    // 12. Cyber / Internet / Servers / Software / Algorithms / AI
    if (/\b(cyber|network|server|servers|internet|packet|packets|algorithm|coding|software|firewall|ai model|deep learning)\b/.test(p)) {
      return this.synthesizeCyberNetwork(sceneIndex);
    }

    // 13. Wealth / Compounding Interest / Finance / Investing
    if (/\b(compound|compounding|wealth|invest|investing|stock|stocks|snowball|dividend|passive income|interest)\b/.test(p)) {
      return this.synthesizeCompounding(sceneIndex);
    }

    // Dynamic Universal Concept Synthesizer for ANY arbitrary prompt
    return this.synthesizeUniversalConcept(prompt, sceneIndex);
  }

  // 1. Black Hole & Spacetime Warping
  private static synthesizeBlackHole(stage: number): GeneratedVisual {
    const code = `
      const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.45, 10, w * 0.5, h * 0.45, Math.max(w, h) * 0.75);
      bgGrad.addColorStop(0, '#020617');
      bgGrad.addColorStop(0.5, '#090d1f');
      bgGrad.addColorStop(1, '#000000');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 40; i++) {
        const sx = ((i * 137.5) % w);
        const sy = ((i * 97.3) % h);
        const dx = sx - w * 0.5;
        const dy = sy - h * 0.45;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const warp = 350 / (dist + 30);
        const starX = sx + (dx / dist) * warp;
        const starY = sy + (dy / dist) * warp;
        const flicker = 0.4 + 0.6 * Math.sin(t * 3 + i);
        ctx.globalAlpha = Math.max(0.1, flicker);
        ctx.beginPath();
        ctx.arc(starX, starY, (i % 3 === 0 ? 2 : 1), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      ctx.save();
      const centerX = isVertical ? w * 0.5 : w * 0.72;
      const centerY = isVertical ? h * 0.38 : h * 0.42;
      ctx.translate(centerX, centerY);

      const diskRadius = isVertical ? 140 : 120;
      for (let ring = 0; ring < 4; ring++) {
        const r = diskRadius - ring * 18;
        ctx.save();
        ctx.rotate(-t * (1.2 + ring * 0.4));
        ctx.strokeStyle = ring % 2 === 0 ? '#38bdf8' : '#f59e0b';
        ctx.lineWidth = 6 + ring * 3;
        ctx.shadowColor = ring % 2 === 0 ? '#0ea5e9' : '#f97316';
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 0.38, 0.25, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.shadowBlur = 40;
      ctx.shadowColor = '#38bdf8';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 52, 0, Math.PI * 2);
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.fill();

      for (let j = 0; j < 8; j++) {
        const jetY = -60 - ((t * 180 + j * 35) % 180);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc((Math.random() - 0.5) * 8, jetY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    `;
    return { theme: 'black_hole_spacetime', code };
  }

  // 2. Solar Energy & Photovoltaic Cell
  private static synthesizeSolarEnergy(stage: number): GeneratedVisual {
    const code = `
      const bg = ctx.createRadialGradient(w * 0.5, h * 0.4, 30, w * 0.5, h * 0.45, Math.max(w, h) * 0.75);
      bg.addColorStop(0, '#451a03');
      bg.addColorStop(0.4, '#1c1917');
      bg.addColorStop(1, '#09090b');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      const centerX = isVertical ? w * 0.5 : w * 0.72;
      const centerY = isVertical ? h * 0.38 : h * 0.42;
      ctx.translate(centerX, centerY);

      // Pulsing Sun Core
      const sunPulse = 1 + Math.sin(t * 3) * 0.06;
      ctx.save();
      ctx.scale(sunPulse, sunPulse);
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 35;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, -60, 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Photon Ray Stream
      for (let r = 0; r < 7; r++) {
        const angle = -Math.PI * 0.4 + (r * 0.28);
        const rayLen = 55 + Math.sin(t * 8 + r) * 12;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 44, -60 + Math.sin(angle) * 44);
        ctx.lineTo(Math.cos(angle) * (44 + rayLen), -60 + Math.sin(angle) * (44 + rayLen));
        ctx.stroke();
      }

      // Silicon Solar Cell Grid (Angled 3D plane)
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#0284c7';
      ctx.fillStyle = '#0c4a6e';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(-90, 45);
      ctx.lineTo(90, 45);
      ctx.lineTo(120, 105);
      ctx.lineTo(-120, 105);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Busbars on silicon panel
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 1.5;
      for (let b = -70; b <= 70; b += 28) {
        ctx.beginPath();
        ctx.moveTo(b * 0.8, 45);
        ctx.lineTo(b * 1.15, 105);
        ctx.stroke();
      }

      // Flowing Electron Sparks (Green/Cyan)
      for (let e = 0; e < 6; e++) {
        const progress = ((t * 1.5 + e * 0.18) % 1);
        const ex = -70 + progress * 140;
        const ey = 50 + progress * 50;
        ctx.fillStyle = '#34d399';
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(ex, ey, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Metric Badge
      ctx.translate(0, 135);
      ctx.fillStyle = '#f59e0b';
      ctx.font = '900 17px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ 22.8% PHOTON TO ELECTRON CONVERSION', 0, 0);

      ctx.restore();
    `;
    return { theme: 'solar_photovoltaic', code };
  }

  // 3. Compounding Interest Snowball
  private static synthesizeCompounding(stage: number): GeneratedVisual {
    const code = `
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(0.4, '#1e293b');
      skyGrad.addColorStop(1, '#0c1a2e');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
      ctx.beginPath();
      ctx.moveTo(-50, h * 0.55);
      ctx.lineTo(w * 0.3, h * 0.32);
      ctx.lineTo(w * 0.65, h * 0.5);
      ctx.lineTo(w + 50, h * 0.35);
      ctx.lineTo(w + 50, h);
      ctx.lineTo(-50, h);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      for (let s = 0; s < 35; s++) {
        const fx = ((s * 47 + t * 40) % (w + 40)) - 20;
        const fy = ((s * 73 + t * 90) % h);
        ctx.beginPath();
        ctx.arc(fx, fy, (s % 3 === 0 ? 3 : 1.5), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.save();
      const hillY = isVertical ? h * 0.44 : h * 0.48;
      
      ctx.strokeStyle = 'rgba(241, 245, 249, 0.85)';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(-40, hillY - 80);
      ctx.quadraticCurveTo(w * 0.5, hillY, w + 40, hillY + 60);
      ctx.stroke();

      const centerX = isVertical ? w * 0.5 : w * 0.7;
      const centerY = hillY - 20;
      ctx.translate(centerX, centerY);

      const growth = Math.min(2.4, 1 + t * 0.3);
      const rad = 50 * growth;

      ctx.save();
      ctx.rotate(t * 3.8);

      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(-rad * 0.3, -rad * 0.25, rad * 0.28, 0, Math.PI * 2);
      ctx.arc(rad * 0.25, rad * 0.3, rad * 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-rad * 0.2, -rad * 0.4, rad * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.translate(0, -rad - 40);
      ctx.fillStyle = '#22c55e';
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.roundRect(-90, -20, 180, 40, 12);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#052e16';
      ctx.font = '900 19px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+ ' + Math.round(growth * 160) + '% COMPOUND', 0, 0);

      ctx.restore();
    `;
    return { theme: 'alpine_compounding', code };
  }

  // 4. Bitcoin & Blockchain Network
  private static synthesizeCrypto(stage: number): GeneratedVisual {
    const code = `
      const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 50, w * 0.5, h * 0.5, Math.max(w, h) * 0.7);
      bgGrad.addColorStop(0, '#064e3b');
      bgGrad.addColorStop(0.6, '#022c22');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(52, 211, 153, 0.18)';
      ctx.lineWidth = 1;
      for (let x = 30; x < w; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      ctx.save();
      const centerX = isVertical ? w * 0.5 : w * 0.72;
      const centerY = isVertical ? h * 0.38 : h * 0.42;
      ctx.translate(centerX, centerY);

      ctx.save();
      ctx.rotate(t * 0.8);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 20;
      ctx.strokeRect(-65, -65, 130, 130);
      ctx.strokeRect(-45, -45, 90, 90);
      ctx.restore();

      const coinPulse = 1 + Math.sin(t * 4) * 0.05;
      ctx.scale(coinPulse, coinPulse);
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 6;
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 30;

      ctx.beginPath();
      ctx.arc(0, 0, 58, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 46, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#78350f';
      ctx.font = '900 48px Inter, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('₿', 0, 4);

      ctx.translate(0, 85);
      ctx.fillStyle = '#34d399';
      ctx.font = '700 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PROOF-OF-WORK VERIFIED', 0, 0);

      ctx.restore();
    `;
    return { theme: 'crypto_blockchain', code };
  }

  // 5. Brain & Neural Synaptic Network
  private static synthesizeNeural(stage: number): GeneratedVisual {
    const code = `
      const bg = ctx.createRadialGradient(w * 0.5, h * 0.45, 20, w * 0.5, h * 0.45, Math.max(w, h) * 0.8);
      bg.addColorStop(0, '#31104b');
      bg.addColorStop(0.5, '#1e1136');
      bg.addColorStop(1, '#05020a');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const nodes = [
        { x: w * 0.3, y: h * 0.3 },
        { x: w * 0.7, y: h * 0.28 },
        { x: w * 0.25, y: h * 0.55 },
        { x: w * 0.75, y: h * 0.52 },
        { x: w * 0.5, y: h * 0.2 }
      ];

      ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.lineWidth = 2;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }

      ctx.save();
      const centerX = isVertical ? w * 0.5 : w * 0.72;
      const centerY = isVertical ? h * 0.38 : h * 0.42;
      ctx.translate(centerX, centerY);

      const pulse = 1 + Math.sin(t * 6) * 0.08;
      ctx.scale(pulse, pulse);
      ctx.shadowColor = '#d946ef';
      ctx.shadowBlur = 35;

      ctx.fillStyle = '#ec4899';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(-26, -10, 48, Math.PI * 0.5, Math.PI * 1.8);
      ctx.quadraticCurveTo(-55, 45, -15, 45);
      ctx.lineTo(15, 45);
      ctx.quadraticCurveTo(55, 45, 26, -10);
      ctx.arc(26, -10, 48, Math.PI * 1.2, Math.PI * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.moveTo(-15, -40);
      ctx.lineTo(0, -15);
      ctx.lineTo(-8, 5);
      ctx.lineTo(15, 30);
      ctx.stroke();

      ctx.translate(0, 75);
      ctx.fillStyle = '#f43f5e';
      ctx.font = '900 18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ DOPAMINE PATHWAY REWIRED', 0, 0);

      ctx.restore();
    `;
    return { theme: 'neural_synapse', code };
  }

  // 6. Fitness & Progressive Overload
  private static synthesizeFitness(stage: number): GeneratedVisual {
    const code = `
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#450a0a');
      bg.addColorStop(0.5, '#1c0707');
      bg.addColorStop(1, '#050202');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#f97316';
      for (let f = 0; f < 30; f++) {
        const ex = ((f * 53) % w);
        const ey = h - ((t * 120 + f * 45) % h);
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(ex, ey, (f % 2 === 0 ? 3 : 1.5), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      ctx.save();
      const centerX = isVertical ? w * 0.5 : w * 0.72;
      const centerY = isVertical ? h * 0.38 : h * 0.42;
      ctx.translate(centerX, centerY);

      const lift = Math.sin(t * 4) * 20;
      ctx.translate(0, lift);

      ctx.fillStyle = '#94a3b8';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 6;
      ctx.fillRect(-110, -10, 220, 20);
      ctx.strokeRect(-110, -10, 220, 20);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-135, -55, 25, 110);
      ctx.strokeRect(-135, -55, 25, 110);
      ctx.fillRect(-110, -45, 15, 90);
      ctx.strokeRect(-110, -45, 15, 90);

      ctx.fillRect(110, -55, 25, 110);
      ctx.strokeRect(110, -55, 25, 110);
      ctx.fillRect(95, -45, 15, 90);
      ctx.strokeRect(95, -45, 15, 90);

      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 30;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 75 + Math.sin(t * 10) * 8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.translate(0, -85);
      ctx.fillStyle = '#ef4444';
      ctx.font = '900 18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PROGRESSIVE OVERLOAD 🔥', 0, 0);

      ctx.restore();
    `;
    return { theme: 'fitness_hypertrophy', code };
  }

  // 7. Aerodynamics & Bernoulli Lift
  private static synthesizeAerodynamics(stage: number): GeneratedVisual {
    const code = `
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#0369a1');
      skyGrad.addColorStop(0.5, '#075985');
      skyGrad.addColorStop(1, '#082f49');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      for (let line = 0; line < 12; line++) {
        const lineY = (line * 30 + 120);
        const offset = (t * 400 + line * 60) % (w + 100);
        ctx.beginPath();
        ctx.moveTo(offset - 60, lineY);
        ctx.lineTo(offset, lineY);
        ctx.stroke();
      }

      ctx.save();
      const centerX = isVertical ? w * 0.5 : w * 0.72;
      const centerY = isVertical ? h * 0.38 : h * 0.42;
      ctx.translate(centerX, centerY);

      ctx.save();
      ctx.rotate(-0.1 + Math.sin(t * 2) * 0.05);

      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-110, 0);
      ctx.bezierCurveTo(-90, -45, 20, -50, 110, 0);
      ctx.bezierCurveTo(40, -10, -70, -5, -110, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(-120, -25);
      ctx.quadraticCurveTo(-20, -75, 120, -25);
      ctx.stroke();

      ctx.fillStyle = '#22c55e';
      for (let a = -40; a <= 40; a += 40) {
        ctx.beginPath();
        ctx.moveTo(a, -55);
        ctx.lineTo(a - 8, -40);
        ctx.lineTo(a + 8, -40);
        ctx.closePath();
        ctx.fill();
      }

      ctx.translate(0, 60);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BERNOULLI LIFT GENERATED', 0, 0);

      ctx.restore();
    `;
    return { theme: 'aerodynamics_bernoulli', code };
  }

  // 8. Quantum Superposition & Bloch Sphere
  private static synthesizeQuantum(stage: number): GeneratedVisual {
    const code = `
      const qGrad = ctx.createRadialGradient(w * 0.5, h * 0.45, 10, w * 0.5, h * 0.45, Math.max(w, h) * 0.8);
      qGrad.addColorStop(0, '#1e1b4b');
      qGrad.addColorStop(0.5, '#0f172a');
      qGrad.addColorStop(1, '#020617');
      ctx.fillStyle = qGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
      ctx.lineWidth = 2;
      for (let wave = 0; wave < 5; wave++) {
        ctx.beginPath();
        for (let x = 0; x < w; x += 15) {
          const y = h * 0.5 + Math.sin(x * 0.02 + t * 4 + wave) * 35;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.save();
      const centerX = isVertical ? w * 0.5 : w * 0.72;
      const centerY = isVertical ? h * 0.38 : h * 0.42;
      ctx.translate(centerX, centerY);

      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#818cf8';
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.arc(0, 0, 65, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 65, 22, 0, 0, Math.PI * 2);
      ctx.stroke();

      const stateAngle = t * 2.5;
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(stateAngle) * 55, Math.sin(stateAngle) * 55);
      ctx.stroke();

      ctx.translate(0, 85);
      ctx.fillStyle = '#a5b4fc';
      ctx.font = '900 18px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('|ψ⟩ = α|0⟩ + β|1⟩', 0, 0);

      ctx.restore();
    `;
    return { theme: 'quantum_superposition', code };
  }

  // 9. Biology / DNA Double Helix & Cell Mitosis
  private static synthesizeBiologyCell(stage: number): GeneratedVisual {
    const code = `
      const bg = ctx.createRadialGradient(w * 0.5, h * 0.45, 20, w * 0.5, h * 0.45, Math.max(w, h) * 0.8);
      bg.addColorStop(0, '#064e3b');
      bg.addColorStop(0.5, '#022c22');
      bg.addColorStop(1, '#020617');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      const centerX = isVertical ? w * 0.5 : w * 0.72;
      const centerY = isVertical ? h * 0.38 : h * 0.42;
      ctx.translate(centerX, centerY);

      // Rotating DNA Double Helix
      const points = 16;
      const heightStep = 10;
      const startY = -80;

      for (let i = 0; i < points; i++) {
        const y = startY + i * heightStep;
        const phase = t * 2.5 + i * 0.4;
        const x1 = Math.cos(phase) * 55;
        const x2 = -x1;
        const depth = (Math.sin(phase) + 1) * 0.5;

        // Base pair rung bridge
        ctx.strokeStyle = 'rgba(255, 255, 255, ' + (0.2 + depth * 0.5) + ')';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();

        // Strand 1 Node (Adenine/Thymine - Cyan)
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(x1, y, 5 + depth * 3, 0, Math.PI * 2);
        ctx.fill();

        // Strand 2 Node (Guanine/Cytosine - Emerald)
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.beginPath();
        ctx.arc(x2, y, 5 + (1 - depth) * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.translate(0, 110);
      ctx.fillStyle = '#34d399';
      ctx.font = '900 17px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GENETIC CODE HELIX (3.2B BP)', 0, 0);

      ctx.restore();
    `;
    return { theme: 'biology_dna_cell', code };
  }

  // 10. Nature / Ecology / Rain & Petrichor
  private static synthesizeNatureEcology(stage: number): GeneratedVisual {
    const code = `
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#064e3b');
      bg.addColorStop(0.4, '#0f766e');
      bg.addColorStop(1, '#022c22');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Rain droplets falling with angles
      ctx.strokeStyle = 'rgba(204, 251, 241, 0.6)';
      ctx.lineWidth = 1.5;
      for (let d = 0; d < 45; d++) {
        const rx = (d * 37 + t * 60) % (w + 40);
        const ry = (d * 53 + t * 450) % h;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 4, ry + 18);
        ctx.stroke();
      }

      ctx.save();
      const centerX = isVertical ? w * 0.5 : w * 0.72;
      const centerY = isVertical ? h * 0.38 : h * 0.42;
      ctx.translate(centerX, centerY);

      // Expanding Earth Soil Concentric Ripple Rings
      for (let r = 0; r < 4; r++) {
        const rad = ((t * 45 + r * 30) % 120);
        const alpha = Math.max(0, 1 - (rad / 120));
        ctx.strokeStyle = 'rgba(52, 211, 153, ' + alpha + ')';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 40, rad, rad * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Sprouting Botanical Leaf
      ctx.fillStyle = '#22c55e';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, 35);
      ctx.quadraticCurveTo(-45, -20, 0, -65);
      ctx.quadraticCurveTo(45, -20, 0, 35);
      ctx.fill();
      ctx.stroke();

      // Leaf Spine
      ctx.strokeStyle = '#86efac';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 30);
      ctx.lineTo(0, -60);
      ctx.stroke();

      ctx.translate(0, 85);
      ctx.fillStyle = '#5eead4';
      ctx.font = '900 18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ORGANIC ECOSYSTEM HARMONY', 0, 0);

      ctx.restore();
    `;
    return { theme: 'nature_ecology', code };
  }

  // 11. History & Ancient Empires
  private static synthesizeHistoryEmpire(stage: number): GeneratedVisual {
    const code = `
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#451a03');
      bg.addColorStop(0.5, '#292524');
      bg.addColorStop(1, '#0c0a09');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      const centerX = isVertical ? w * 0.5 : w * 0.72;
      const centerY = isVertical ? h * 0.38 : h * 0.42;
      ctx.translate(centerX, centerY);

      // Classical Stone Columns (Parthenon/Colosseum pillars)
      ctx.fillStyle = '#d6d3d1';
      ctx.strokeStyle = '#1c1917';
      ctx.lineWidth = 5;

      [-80, 80].forEach(colX => {
        ctx.fillRect(colX - 16, -65, 32, 130);
        ctx.strokeRect(colX - 16, -65, 32, 130);
        ctx.fillRect(colX - 22, -75, 44, 12);
        ctx.strokeRect(colX - 22, -75, 44, 12);
      });

      // Golden Roman Laurel Wreath
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 20;

      ctx.beginPath();
      ctx.arc(0, 0, 52, 0.4, Math.PI * 1.6);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, 52, Math.PI * 1.4, Math.PI * 2.6);
      ctx.stroke();

      // Imperial Gold Eagle / Standard Crest
      ctx.fillStyle = '#fde047';
      ctx.font = '900 36px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SPQR', 0, 0);

      ctx.shadowBlur = 0;
      ctx.translate(0, 95);
      ctx.fillStyle = '#fbbf24';
      ctx.font = '900 17px Inter, sans-serif';
      ctx.fillText('HISTORICAL EXPANSION EPOCH', 0, 0);

      ctx.restore();
    `;
    return { theme: 'history_empire', code };
  }

  // 12. Chemistry & Molecular Bonding
  private static synthesizeChemistryMolecules(stage: number): GeneratedVisual {
    const code = `
      const bg = ctx.createRadialGradient(w * 0.5, h * 0.45, 10, w * 0.5, h * 0.45, Math.max(w, h) * 0.8);
      bg.addColorStop(0, '#172554');
      bg.addColorStop(0.5, '#0f172a');
      bg.addColorStop(1, '#020617');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      const centerX = isVertical ? w * 0.5 : w * 0.72;
      const centerY = isVertical ? h * 0.38 : h * 0.42;
      ctx.translate(centerX, centerY);

      // Rotating Benzene Hexagon Lattice
      ctx.save();
      ctx.rotate(t * 0.6);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 5;
      ctx.shadowColor = '#0ea5e9';
      ctx.shadowBlur = 20;

      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        const hx = Math.cos(ang) * 65;
        const hy = Math.sin(ang) * 65;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();

      // Inner aromatic resonance ring
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 42, 0, Math.PI * 2);
      ctx.stroke();

      // Carbon/Hydrogen Atoms at Vertices
      for (let j = 0; j < 6; j++) {
        const a = (j * Math.PI) / 3;
        ctx.fillStyle = j % 2 === 0 ? '#38bdf8' : '#f43f5e';
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 65, Math.sin(a) * 65, 9, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      ctx.shadowBlur = 0;
      ctx.translate(0, 95);
      ctx.fillStyle = '#67e8f9';
      ctx.font = '900 17px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('MOLECULAR COVALENT BONDS', 0, 0);

      ctx.restore();
    `;
    return { theme: 'chemistry_molecules', code };
  }

  // 13. Cyber & Internet Data Network
  private static synthesizeCyberNetwork(stage: number): GeneratedVisual {
    const code = `
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#022c22');
      bg.addColorStop(0.5, '#020617');
      bg.addColorStop(1, '#0f172a');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Flowing binary / optical bus packets
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.lineWidth = 1;
      for (let y = 50; y < h; y += 45) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      ctx.save();
      const centerX = isVertical ? w * 0.5 : w * 0.72;
      const centerY = isVertical ? h * 0.38 : h * 0.42;
      ctx.translate(centerX, centerY);

      // Server Nodes & Interconnects
      const serverNodes = [
        { x: -75, y: -40, label: 'NODE-01' },
        { x: 75, y: -40, label: 'NODE-02' },
        { x: 0, y: 45, label: 'CORE-HUB' }
      ];

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 15;

      ctx.beginPath();
      ctx.moveTo(serverNodes[0].x, serverNodes[0].y);
      ctx.lineTo(serverNodes[2].x, serverNodes[2].y);
      ctx.lineTo(serverNodes[1].x, serverNodes[1].y);
      ctx.closePath();
      ctx.stroke();

      // Traveling Packet Data
      for (let p = 0; p < 3; p++) {
        const segProgress = (t * 2 + p * 0.33) % 1;
        const px = serverNodes[0].x + (serverNodes[2].x - serverNodes[0].x) * segProgress;
        const py = serverNodes[0].y + (serverNodes[2].y - serverNodes[0].y) * segProgress;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Server Terminals
      serverNodes.forEach(node => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(node.x - 30, node.y - 18, 60, 36);
        ctx.strokeRect(node.x - 30, node.y - 18, 60, 36);
      });

      ctx.shadowBlur = 0;
      ctx.translate(0, 95);
      ctx.fillStyle = '#34d399';
      ctx.font = '900 17px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('100 GBPS HIGH-THROUGHPUT BUS', 0, 0);

      ctx.restore();
    `;
    return { theme: 'cyber_network', code };
  }

  // 14. Master Universal Dynamic Concept Synthesizer for ANY prompt
  private static synthesizeUniversalConcept(prompt: string, stage: number): GeneratedVisual {
    const cleanSubj = this.cleanTopic(prompt).toUpperCase().slice(0, 24);

    // Deterministic palette based on string hash
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      hash = ((hash << 5) - hash) + prompt.charCodeAt(i);
      hash |= 0;
    }
    const palIndex = Math.abs(hash) % 5;
    const palettes = [
      { primary: '#00f5d4', secondary: '#00bbf9', bg: '#020617', label: 'CYBER_NEON' },
      { primary: '#f59e0b', secondary: '#ef4444', bg: '#0c0a09', label: 'AMBER_FLARE' },
      { primary: '#8b5cf6', secondary: '#ec4899', bg: '#090514', label: 'COSMIC_VIOLET' },
      { primary: '#10b981', secondary: '#06b6d4', bg: '#021814', label: 'EMERALD_FLUX' },
      { primary: '#38bdf8', secondary: '#6366f1', bg: '#040d21', label: 'ELECTRIC_SKY' }
    ];
    const pal = palettes[palIndex];

    const code = `
      // DYNAMIC AI CANVAS VISUAL: "${cleanSubj}" (Stage ${stage})
      const bg = ctx.createRadialGradient(w * 0.5, h * 0.45, 20, w * 0.5, h * 0.45, Math.max(w, h) * 0.85);
      bg.addColorStop(0, '${pal.primary}22');
      bg.addColorStop(0.5, '${pal.bg}');
      bg.addColorStop(1, '#000000');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Dynamic Animated Particle Web
      const pCount = 20;
      const pts = [];
      for (let i = 0; i < pCount; i++) {
        const ang = (i / pCount) * Math.PI * 2 + t * 0.3;
        const rad = 70 + Math.sin(t * 1.5 + i * 2) * 35;
        const px = (isVertical ? w * 0.5 : w * 0.72) + Math.cos(ang) * rad;
        const py = (isVertical ? h * 0.38 : h * 0.42) + Math.sin(ang) * rad * 0.7;
        pts.push({ x: px, y: py });
      }

      ctx.strokeStyle = '${pal.primary}33';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < pts.length; i++) {
        const next = pts[(i + 1) % pts.length];
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(next.x, next.y);
        ctx.stroke();
      }

      ctx.save();
      const centerX = isVertical ? w * 0.5 : w * 0.72;
      const centerY = isVertical ? h * 0.38 : h * 0.42;
      ctx.translate(centerX, centerY);

      // Rotating Outer Telemetry Ring
      ctx.save();
      ctx.rotate(t * 0.8);
      ctx.strokeStyle = '${pal.primary}';
      ctx.lineWidth = 4;
      ctx.shadowColor = '${pal.secondary}';
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.arc(0, 0, 72, 0, Math.PI * 2);
      ctx.stroke();

      // Degree Tick Marks
      ctx.strokeStyle = '${pal.secondary}';
      ctx.lineWidth = 2;
      for (let d = 0; d < 8; d++) {
        const tickAng = (d * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(tickAng) * 62, Math.sin(tickAng) * 62);
        ctx.lineTo(Math.cos(tickAng) * 72, Math.sin(tickAng) * 72);
        ctx.stroke();
      }
      ctx.restore();

      // Stage-Specific Centerpiece Graphic
      const st = ${stage};
      if (st === 0) {
        // Stage 0: Expanding Radar Acquisition Pulse
        const pulseR = ((t * 60) % 65);
        ctx.strokeStyle = '${pal.primary}';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '${pal.primary}';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
      } else if (st === 1) {
        // Stage 1: Dual Interacting Flux Nodes
        const osc = Math.sin(t * 4) * 28;
        ctx.fillStyle = '${pal.secondary}';
        ctx.beginPath();
        ctx.arc(-osc, 0, 14, 0, Math.PI * 2);
        ctx.arc(osc, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '${pal.primary}';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-osc, 0);
        ctx.lineTo(osc, 0);
        ctx.stroke();
      } else if (st === 2) {
        // Stage 2: Exponential Energy Crescendo Burst
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '${pal.primary}';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(0, 0, 22 + Math.sin(t * 8) * 6, 0, Math.PI * 2);
        ctx.fill();

        for (let ray = 0; ray < 8; ray++) {
          const rAng = (ray * Math.PI) / 4 + t * 2;
          ctx.strokeStyle = '${pal.secondary}';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(rAng) * 45, Math.sin(rAng) * 45);
          ctx.stroke();
        }
      } else {
        // Stage 3: Glowing Star of Victory
        ctx.fillStyle = '${pal.primary}';
        ctx.shadowColor = '${pal.primary}';
        ctx.shadowBlur = 25;
        ctx.beginPath();
        for (let sp = 0; sp < 8; sp++) {
          const sRad = sp % 2 === 0 ? 32 : 14;
          const sAng = (sp * Math.PI) / 4 + t;
          const sx = Math.cos(sAng) * sRad;
          const sy = Math.sin(sAng) * sRad;
          if (sp === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        ctx.fill();
      }

      // Glowing Glass HUD Label with Topic Name
      ctx.shadowBlur = 0;
      ctx.translate(0, 95);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = '${pal.primary}';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-110, -16, 220, 32, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('${cleanSubj}', 0, 0);

      ctx.restore();
    `;
    return { theme: `universal_${pal.label.toLowerCase()}`, code };
  }
}
