import { Scene, AspectRatio, StylePreset, BrandKit } from '../../types/creatorStudio';

export interface TemplateMatch {
  title: string;
  description: string;
  stylePreset: StylePreset;
  defaultBrand: BrandKit;
  scenes: (duration: number, brand: BrandKit) => Scene[];
}

// =========================================================================
// 1. HOLI FESTIVAL OF COLORS TEMPLATE
// =========================================================================
export const HOLI_FESTIVE_TEMPLATE: TemplateMatch = {
  title: 'Holi Festival of Colors Reel',
  description: '15-second celebratory motion-graphics reel with vibrant gulal powder particles, playful spring rhythm, and festive greetings.',
  stylePreset: 'vibrant_colors',
  defaultBrand: {
    name: 'HAPPY HOLI',
    primaryColor: '#EC4899',
    secondaryColor: '#06B6D4',
    accentColor: '#FACC15',
    tagline: 'Festival of Colors & Boundless Joy',
    fontFamily: 'serif'
  },
  scenes: (duration: number, brand: BrandKit): Scene[] => {
    const s1Duration = Math.round(duration * 0.33);
    const s2Duration = Math.round(duration * 0.33);
    const s3Duration = duration - s1Duration - s2Duration;

    return [
      {
        id: `sc_holi_1_${Date.now()}`,
        order: 1,
        title: 'Colors in the Air — The Joyous Dawn',
        label: 'SCENE 1: FESTIVE DAWN',
        narration: 'As the spring sun rises, clouds of vibrant gulal take to the sky. Let every color wash away sorrows and awaken boundless joy.',
        captionText: '✨ RANG BARSE ✨\nCelebrate The Festival of Colors',
        duration: s1Duration,
        visualType: 'motion_graphic',
        theme: 'vibrant_colors',
        backgroundColor: '#0F0728',
        compositionLayout: 'split_editorial',
        cameraMotion: 'zoom_in',
        focalConcept: 'Vibrant Gulal Cloud with Glowing Kinetic Typography',
        elements: [
          {
            id: 'elem_holi_headline',
            type: 'kinetic_headline',
            props: {
              kicker: '✦ FESTIVAL OF COLORS ✦',
              headline: 'CELEBRATE THE MAGIC OF HOLI',
              subtitle: 'Where every color tells a story of love, laughter, and unity.',
              accentColor: '#EC4899'
            }
          },
          {
            id: 'elem_holi_particles1',
            type: 'particles',
            props: { count: 60, color: '#EC4899', speed: 1.2 }
          }
        ],
        assetRequirements: ['Festive Dhol rhythm intro', 'Joyful celebration cheers'],
        assignedAssetIds: {},
        transition: 'fade',
        approved: false
      },
      {
        id: `sc_holi_2_${Date.now()}`,
        order: 2,
        title: 'Laughter, Rhythm & Playful Splashes',
        label: 'SCENE 2: CELEBRATION IN MOTION',
        narration: 'From flying powders of pink, turquoise, and gold to rhythmic beats of the dhol, hearts dance in pure celebration.',
        captionText: 'VIBRANT HEARTS DANCE\nLove, Laughter & Pure Celebration',
        duration: s2Duration,
        visualType: 'motion_graphic',
        theme: 'vibrant_colors',
        backgroundColor: '#160838',
        compositionLayout: 'metric_grid',
        cameraMotion: 'pan_drift_up',
        focalConcept: '3-Tier Festive Highlight Cards in Vibrant Glassmorphism',
        elements: [
          {
            id: 'elem_holi_grid',
            type: 'metric_grid',
            props: {
              headline: 'THE SPIRIT OF HOLI',
              items: [
                { num: '01', title: 'Vibrant Gulal Powders', desc: 'Magenta, cyan, and sunny gold clouds' },
                { num: '02', title: 'Dhol Beats & Dancing', desc: 'Rhythmic celebration of friendship & life' },
                { num: '03', title: 'Sweet Festive Warmth', desc: 'Sharing gujiya and spreading happiness' }
              ]
            }
          },
          {
            id: 'elem_holi_particles2',
            type: 'particles',
            props: { count: 70, color: '#06B6D4', speed: 1.4 }
          }
        ],
        assetRequirements: ['Dynamic dhol drum crescendo', 'Festive song transition'],
        assignedAssetIds: {},
        transition: 'slide_left',
        approved: false
      },
      {
        id: `sc_holi_3_${Date.now()}`,
        order: 3,
        title: 'Happy Holi — Blessings & Joy',
        label: 'SCENE 3: CLIMAX & BLESSINGS',
        narration: 'May your life be painted with the colors of peace, prosperity, and endless joy. Happy Holi to you and your family!',
        captionText: 'HAPPY HOLI\nWishing You Peace, Love & Endless Colors',
        duration: s3Duration,
        visualType: 'motion_graphic',
        theme: 'vibrant_colors',
        backgroundColor: '#0B0520',
        compositionLayout: 'brand_outro',
        cameraMotion: 'zoom_out',
        focalConcept: 'Grand Luminous Festive Crest with Specular Sheen & Celebration Pill',
        elements: [
          {
            id: 'elem_holi_outro',
            type: 'brand_outro',
            props: {
              brandName: brand?.name && brand.name !== 'Sukh Graphix' ? brand.name : 'HAPPY HOLI',
              tagline: brand?.tagline || 'May Your Life Be Painted With Endless Joy',
              emblem: '✦',
              cta: 'SHARE THE COLORS OF JOY →',
              glowColor: '#EC4899'
            }
          },
          {
            id: 'elem_holi_particles3',
            type: 'particles',
            props: { count: 80, color: '#FACC15', speed: 1.6 }
          }
        ],
        assetRequirements: ['Triumphant festive crescendo chime', 'Sparkle chime sound'],
        assignedAssetIds: {},
        transition: 'zoom_in',
        approved: false
      }
    ];
  }
};

// =========================================================================
// 2. BENCHMARK PROJECT: 15-Second Sukh Graphix Agency Showcase
// =========================================================================
export const SUKH_GRAPHIX_BENCHMARK_TEMPLATE: TemplateMatch = {
  title: 'Sukh Graphix — Agency Showcase Masterclass',
  description: '15-second high-impact creative agency promotional reel demonstrating bespoke brand identities, 60fps motion graphics, and high-converting marketing creatives with distinct scene compositions.',
  stylePreset: 'luxury_gold',
  defaultBrand: {
    name: 'Sukh Graphix',
    primaryColor: '#F59E0B',
    secondaryColor: '#B45309',
    accentColor: '#FEF08A',
    tagline: 'Illuminating Creative Excellence',
    fontFamily: 'serif'
  },
  scenes: (duration: number, brand: BrandKit): Scene[] => {
    const s1Duration = Math.round(duration * 0.33);
    const s2Duration = Math.round(duration * 0.33);
    const s3Duration = duration - s1Duration - s2Duration;

    return [
      {
        id: `sc_sg_1_${Date.now()}`,
        order: 1,
        title: 'Design That Commands Attention',
        label: 'SCENE 1: HOOK',
        narration: 'In a noisy world, ordinary design gets ignored. You need visual identities that command immediate authority.',
        captionText: 'DESIGN THAT COMMANDS ATTENTION\nPrecision Meets Visual Strategy',
        duration: s1Duration,
        visualType: 'motion_graphic',
        theme: 'luxury_gold',
        backgroundColor: '#0B0F19',
        compositionLayout: 'split_editorial',
        cameraMotion: 'zoom_in',
        focalConcept: 'Editorial Typography & Animated Digital Stylus Drawing Bezier Vectors',
        elements: [
          {
            id: 'elem_sg_headline',
            type: 'kinetic_headline',
            props: {
              kicker: '✦ SUKH GRAPHIX // CREATIVE STUDIO',
              headline: 'DESIGN THAT COMMANDS ATTENTION',
              subtitle: 'Where aesthetic precision meets high-converting visual strategy.',
              accentColor: '#F59E0B'
            }
          },
          {
            id: 'elem_sg_vector',
            type: 'vector_illustration',
            props: {}
          },
          {
            id: 'elem_sg_particles1',
            type: 'particles',
            props: { count: 40, color: '#FBBF24', speed: 0.9 }
          }
        ],
        assetRequirements: ['Dynamic opening riser chime', 'Sleek pen drawing sound fx'],
        assignedAssetIds: {},
        transition: 'fade',
        approved: false
      },
      {
        id: `sc_sg_2_${Date.now()}`,
        order: 2,
        title: 'Masterpieces Crafted Pixel by Pixel',
        label: 'SCENE 2: CRAFT & PROOF',
        narration: 'From iconic brand identities and 60fps motion graphics to viral performance ad creatives, we engineer assets that drive exponential growth.',
        captionText: 'BESPOKE CREATIVE EXCELLENCE\nEngineered To Scale Your Brand',
        duration: s2Duration,
        visualType: 'motion_graphic',
        theme: 'high_tech',
        backgroundColor: '#080E1C',
        compositionLayout: 'metric_grid',
        cameraMotion: 'pan_drift_up',
        focalConcept: 'Glassmorphic 3-Tier Specialty Capabilities Grid',
        elements: [
          {
            id: 'elem_sg_grid',
            type: 'metric_grid',
            props: {
              headline: 'OUR CRAFT & SPECIALTIES',
              items: [
                { num: '01', title: 'Brand Identity & Visual Systems', desc: 'Bespoke logos, guidelines & luxury typography' },
                { num: '02', title: '60 FPS Motion Graphics', desc: 'Cinematic reels engineered for retention' },
                { num: '03', title: 'Performance Ad Creatives', desc: 'Visual systems built for viral reach & conversion' }
              ]
            }
          },
          {
            id: 'elem_sg_particles2',
            type: 'particles',
            props: { count: 50, color: '#38BDF8', speed: 1.1 }
          }
        ],
        assetRequirements: ['Cinematic synth beat transition', 'Glassmorphism interface sound fx'],
        assignedAssetIds: {},
        transition: 'slide_left',
        approved: false
      },
      {
        id: `sc_sg_3_${Date.now()}`,
        order: 3,
        title: 'Elevate Your Brand Today',
        label: 'SCENE 3: CLIMAX & CTA',
        narration: 'Ready to stand out and scale? Partner with Sukh Graphix today and let us illuminate your brand story.',
        captionText: 'SUKH GRAPHIX\nIlluminating Creative Excellence',
        duration: s3Duration,
        visualType: 'motion_graphic',
        theme: 'luxury_gold',
        backgroundColor: '#0D0801',
        compositionLayout: 'brand_outro',
        cameraMotion: 'zoom_out',
        focalConcept: 'Luminous Monogram Crest Emblem with Specular Sheen Sweep & CTA Pill',
        elements: [
          {
            id: 'elem_sg_outro',
            type: 'brand_outro',
            props: {
              brandName: 'SUKH GRAPHIX',
              tagline: 'Illuminating Creative Excellence',
              emblem: 'SG',
              cta: 'START YOUR PROJECT →',
              glowColor: '#F59E0B'
            }
          },
          {
            id: 'elem_sg_reveal',
            type: 'brand_reveal',
            props: {
              brandName: 'SUKH GRAPHIX',
              tagline: 'Illuminating Creative Excellence',
              glowColor: '#F59E0B'
            }
          },
          {
            id: 'elem_sg_particles3',
            type: 'particles',
            props: { count: 70, color: '#FEF08A', speed: 1.4 }
          }
        ],
        assetRequirements: ['Grand orchestral crescendo chord', 'Sukh Graphix high-res vector logo'],
        assignedAssetIds: {},
        transition: 'zoom_in',
        approved: false
      }
    ];
  }
};

// =========================================================================
// 3. FESTIVE DIWALI REEL TEMPLATE
// =========================================================================
export const FESTIVE_DIWALI_TEMPLATE: TemplateMatch = {
  title: 'Diwali Festive Reel — Sukh Graphix',
  description: 'Celebratory motion-graphics reel with glowing diyas, particle embers, festive Sanskrit typography, and luxury gold brand reveal.',
  stylePreset: 'festive',
  defaultBrand: {
    name: 'Sukh Graphix',
    primaryColor: '#F59E0B',
    secondaryColor: '#B45309',
    accentColor: '#FEF08A',
    tagline: 'Illuminating Creative Excellence',
    fontFamily: 'serif'
  },
  scenes: (duration: number, brand: BrandKit): Scene[] => {
    const sDuration = Math.round(duration / 3);
    return [
      {
        id: `sc_diwali_1_${Date.now()}`,
        order: 1,
        title: 'Festive Greeting & Radiant Light',
        label: 'SCENE 1: FESTIVE DAWN',
        narration: 'This Diwali, let light triumph over darkness and every creation shine with boundless radiance.',
        captionText: '✨ Shubh Deepavali ✨\nCelebrate The Festival of Lights',
        duration: sDuration,
        visualType: 'motion_graphic',
        theme: 'diwali_festive',
        backgroundColor: '#1E1100',
        compositionLayout: 'split_editorial',
        cameraMotion: 'zoom_in',
        focalConcept: 'Radiant Terracotta Diya with Flickering Flame & Sanskrit Greeting',
        elements: [
          {
            id: 'elem_diya_1',
            type: 'diya',
            props: { size: 140, glowIntensity: 1.2, flameColor: '#FF7700', oilGlow: '#FFD700' }
          },
          {
            id: 'elem_particles_1',
            type: 'particles',
            props: { count: 70, color: '#FBBF24', speed: 1.2, style: 'ember_sparks' }
          },
          {
            id: 'elem_typo_1',
            type: 'kinetic_headline',
            props: { kicker: '✨ SHUBH DEEPAVALI ✨', headline: 'FESTIVAL OF LIGHTS', subtitle: 'Celebrate with joy and prosperity.' }
          }
        ],
        assetRequirements: ['Festive Sanskrit audio intro', 'Ambient diya flame sound'],
        assignedAssetIds: {},
        transition: 'fade',
        approved: false
      },
      {
        id: `sc_diwali_2_${Date.now()}`,
        order: 2,
        title: 'Creative Mastery & Visual Brilliance',
        label: 'SCENE 2: CREATIVE ESSENCE',
        narration: 'From imaginative vision to breathtaking visuals, we craft designs that illuminate your brand story.',
        captionText: 'Crafting Visual Magic\nThat Elevates Your Brand',
        duration: sDuration,
        visualType: 'motion_graphic',
        theme: 'luxury_gold',
        backgroundColor: '#140A02',
        compositionLayout: 'geometric_focus',
        cameraMotion: 'pan_drift_up',
        focalConcept: 'Mandala Geometric Focus with Dual Terracotta Lamps',
        elements: [
          {
            id: 'elem_diya_duo',
            type: 'diya',
            props: { size: 100, glowIntensity: 1.0 }
          },
          {
            id: 'elem_geometric_gold',
            type: 'geometric_focus',
            props: { color: '#F59E0B' }
          },
          {
            id: 'elem_typo_2',
            type: 'kinetic_headline',
            props: { kicker: '✦ CREATIVE MASTERY', headline: 'ILLUMINATING YOUR VISION', subtitle: 'Where Design Meets Passion', accentColor: '#FEF08A' }
          }
        ],
        assetRequirements: ['Portfolio highlight graphics', 'Golden mandala vector'],
        assignedAssetIds: {},
        transition: 'slide_left',
        approved: false
      },
      {
        id: `sc_diwali_3_${Date.now()}`,
        order: 3,
        title: `Grand Brand Reveal — ${brand.name}`,
        label: 'SCENE 3: BRAND REVEAL',
        narration: `${brand.name} wishes you prosperity, success, and endless joy this Diwali.`,
        captionText: `${brand.name.toUpperCase()}\n${brand.tagline || 'Illuminating Creative Excellence'}`,
        duration: duration - (sDuration * 2),
        visualType: 'motion_graphic',
        theme: 'luxury_gold',
        backgroundColor: '#0A0500',
        compositionLayout: 'brand_outro',
        cameraMotion: 'zoom_out',
        focalConcept: 'Brand Monogram Outro with Specular Light Sweep',
        elements: [
          {
            id: 'elem_brand_reveal',
            type: 'brand_reveal',
            props: {
              brandName: brand.name.toUpperCase(),
              tagline: brand.tagline || 'Illuminating Creative Excellence',
              glowColor: brand.primaryColor,
              lensSweep: true,
              particleExplosion: true
            }
          },
          {
            id: 'elem_brand_outro',
            type: 'brand_outro',
            props: {
              brandName: brand.name.toUpperCase(),
              tagline: brand.tagline || 'Illuminating Creative Excellence',
              emblem: brand.name.slice(0, 2).toUpperCase(),
              cta: 'CELEBRATE WITH US →',
              glowColor: brand.primaryColor
            }
          },
          {
            id: 'elem_diya_center',
            type: 'diya',
            props: { size: 110, glowIntensity: 1.5, flameColor: '#FF9900' }
          }
        ],
        assetRequirements: [`${brand.name} Official Logo`, 'Festive Music Outro'],
        assignedAssetIds: {},
        transition: 'zoom_in',
        approved: false
      }
    ];
  }
};

// =========================================================================
// 4. SAAS PRODUCT SHOWCASE TEMPLATE
// =========================================================================
export const SAAS_PRODUCT_TEMPLATE: TemplateMatch = {
  title: 'Next-Gen Product Showcase',
  description: 'High-converting SaaS product teaser with modern device mockups, kinetic typography, and bold call to action.',
  stylePreset: 'cyberpunk',
  defaultBrand: {
    name: 'SaaS Studio',
    primaryColor: '#3B82F6',
    secondaryColor: '#1D4ED8',
    accentColor: '#60A5FA',
    tagline: 'Automate Without Limits',
    fontFamily: 'sans'
  },
  scenes: (duration: number, brand: BrandKit): Scene[] => {
    const sDuration = Math.round(duration / 3);
    return [
      {
        id: `sc_saas_1_${Date.now()}`,
        order: 1,
        title: 'The Modern Workflow Dilemma',
        label: 'SCENE 1: HOOK',
        narration: 'Are repetitive tasks and fragmented tools holding your business back from scale?',
        captionText: 'STOP LOSING HOURS\nTo Outdated Manual Workflows',
        duration: sDuration,
        visualType: 'motion_graphic',
        theme: 'cyberpunk',
        backgroundColor: '#080E1C',
        compositionLayout: 'split_editorial',
        cameraMotion: 'zoom_in',
        focalConcept: 'Warning Grid with Bold Headline',
        elements: [
          {
            id: 'elem_saas_typo1',
            type: 'kinetic_headline',
            props: { kicker: '⚡ MODERN WORKFLOWS', headline: 'STOP LOSING VALUABLE TIME', subtitle: 'Automate complex manual work effortlessly.', accentColor: '#38BDF8' }
          },
          {
            id: 'elem_saas_particles1',
            type: 'particles',
            props: { count: 50, color: '#38BDF8', speed: 1.2 }
          }
        ],
        assetRequirements: ['Subtle glitched bass sound', 'HUD UI sound fx'],
        assignedAssetIds: {},
        transition: 'fade',
        approved: false
      },
      {
        id: `sc_saas_2_${Date.now()}`,
        order: 2,
        title: 'Intelligent Automation in Action',
        label: 'SCENE 2: VALUE & PROOF',
        narration: 'Meet the unified platform that turns days of complex execution into minutes of automated perfection.',
        captionText: 'LIGHTNING SPEED\nAutomate 90% of Repetitive Tasks',
        duration: sDuration,
        visualType: 'motion_graphic',
        theme: 'high_tech',
        backgroundColor: '#061324',
        compositionLayout: 'hero_badge',
        cameraMotion: 'pan_drift_up',
        focalConcept: 'Interactive Device Mockup with 3-Tier Metric Card Grid',
        elements: [
          {
            id: 'elem_saas_device',
            type: 'device_mockup',
            props: {}
          },
          {
            id: 'elem_saas_grid',
            type: 'metric_grid',
            props: {
              headline: 'PLATFORM ADVANTAGES',
              items: [
                { num: '10x', title: 'Faster Execution', desc: 'Deploy workflows in seconds' },
                { num: '99%', title: 'Zero Human Error', desc: 'Guaranteed deterministic outputs' },
                { num: '24/7', title: 'Continuous Automation', desc: 'Runs seamlessly in background' }
              ]
            }
          },
          {
            id: 'elem_saas_particles2',
            type: 'particles',
            props: { count: 60, color: '#60A5FA', speed: 1.0 }
          }
        ],
        assetRequirements: ['Digital interface whoosh', 'Typing sound effects'],
        assignedAssetIds: {},
        transition: 'slide_left',
        approved: false
      },
      {
        id: `sc_saas_3_${Date.now()}`,
        order: 3,
        title: `Launch Today With ${brand.name}`,
        label: 'SCENE 3: CALL TO ACTION',
        narration: `Join thousands of top teams building the future with ${brand.name}.`,
        captionText: `${brand.name.toUpperCase()}\nStart Your Free Trial • Link In Bio`,
        duration: duration - (sDuration * 2),
        visualType: 'motion_graphic',
        theme: 'cyberpunk',
        backgroundColor: '#040A14',
        compositionLayout: 'brand_outro',
        cameraMotion: 'zoom_out',
        focalConcept: 'Grand SaaS Brand Emblem & CTA Button',
        elements: [
          {
            id: 'elem_saas_outro',
            type: 'brand_outro',
            props: {
              brandName: brand.name.toUpperCase(),
              tagline: brand.tagline || 'Automate Without Limits',
              emblem: brand.name.slice(0, 2).toUpperCase(),
              cta: 'CLAIM 14-DAY FREE TRIAL →',
              glowColor: '#3B82F6'
            }
          }
        ],
        assetRequirements: ['Triumphant synth chord', `${brand.name} UI screenshot`],
        assignedAssetIds: {},
        transition: 'zoom_in',
        approved: false
      }
    ];
  }
};

// =========================================================================
// 5. BESPOKE DYNAMIC 3-ACT GENERATOR (FOR ANY USER PROMPT)
// =========================================================================
export function generateDynamicBespokeScenes(prompt: string, duration: number, brand: BrandKit): Scene[] {
  const p = prompt.toLowerCase();
  const sDuration = Math.round(duration / 3);

  const isHoli = p.includes('holi') || p.includes('gulal') || p.includes('rang barse') || p.includes('colors');
  const isDiwali = p.includes('diwali') || p.includes('deepavali') || p.includes('diya');
  const isFitness = p.includes('gym') || p.includes('fitness') || p.includes('workout') || p.includes('sport');
  const isTech = p.includes('tech') || p.includes('ai') || p.includes('crypto') || p.includes('future') || p.includes('cyber');

  // Determine dynamic aesthetic
  let theme: string = 'luxury_gold';
  let bg1 = '#0B0F19';
  let bg2 = '#080E1C';
  let bg3 = '#0D0801';
  let particleColor = '#F59E0B';

  if (isHoli) {
    theme = 'vibrant_colors';
    bg1 = '#0F0728';
    bg2 = '#160838';
    bg3 = '#0B0520';
    particleColor = '#EC4899';
  } else if (isDiwali) {
    theme = 'diwali_festive';
    bg1 = '#1E1100';
    bg2 = '#140A02';
    bg3 = '#0A0500';
    particleColor = '#F59E0B';
  } else if (isFitness) {
    theme = 'high_tech';
    bg1 = '#090E17';
    bg2 = '#061622';
    bg3 = '#050D16';
    particleColor = '#10B981';
  } else if (isTech) {
    theme = 'cyberpunk';
    bg1 = '#0A0E1A';
    bg2 = '#081226';
    bg3 = '#060B18';
    particleColor = '#38BDF8';
  }

  // Extract clean words from prompt
  const cleanTitle = prompt.length > 32 ? prompt.slice(0, 30) + '...' : prompt;
  const brandName = brand?.name ? brand.name : (isHoli ? 'HAPPY HOLI' : 'CREATOR STUDIO');
  const brandTagline = brand?.tagline ? brand.tagline : (isHoli ? 'Festival of Colors & Boundless Joy' : 'Crafted For Modern Creators');

  // Derive 3 contextual highlight points from prompt
  const pWords = prompt.split(/\s+/).filter(w => w.length > 3);
  const w1 = pWords[0] || 'Energy';
  const w2 = pWords[1] || 'Passion';
  const w3 = pWords[2] || 'Excellence';

  return [
    {
      id: `sc_dyn_1_${Date.now()}`,
      order: 1,
      title: `The Hook: ${cleanTitle}`,
      label: 'SCENE 1: HOOK',
      narration: `Are you ready to experience the unforgettable? Here is why ${cleanTitle} captures hearts.`,
      captionText: `⚡ ${cleanTitle.toUpperCase()} ⚡\nThe Experience Begins`,
      duration: sDuration,
      visualType: 'motion_graphic',
      theme,
      backgroundColor: bg1,
      compositionLayout: 'split_editorial',
      cameraMotion: 'zoom_in',
      focalConcept: 'Striking Kinetic Headline with Editorial Vector Guides',
      elements: [
        {
          id: 'elem_dyn_headline',
          type: 'kinetic_headline',
          props: {
            kicker: `✦ ${brandName.toUpperCase()} ✦`,
            headline: cleanTitle.toUpperCase(),
            subtitle: 'Engineered for maximum visual authority and unforgettable impact.',
            accentColor: particleColor
          }
        },
        {
          id: 'elem_dyn_particles1',
          type: 'particles',
          props: { count: 50, color: particleColor, speed: 1.0 }
        }
      ],
      assetRequirements: ['Punchy opening riser sound fx', 'Bass impact'],
      assignedAssetIds: {},
      transition: 'fade',
      approved: false
    },
    {
      id: `sc_dyn_2_${Date.now()}`,
      order: 2,
      title: 'Core Highlights & Experience',
      label: 'SCENE 2: VALUE & PROOF',
      narration: `Crafted with intention and deep resonance. Dynamic rhythm, vibrant emotion, and unforgettable results.`,
      captionText: `UNSTOPPABLE ENERGY\nCrafted For Maximum Resonance`,
      duration: sDuration,
      visualType: 'motion_graphic',
      theme,
      backgroundColor: bg2,
      compositionLayout: 'metric_grid',
      cameraMotion: 'pan_drift_up',
      focalConcept: 'Glassmorphic 3-Tier Value & Feature Card Grid',
      elements: [
        {
          id: 'elem_dyn_grid',
          type: 'metric_grid',
          props: {
            headline: 'KEY EXPERIENCES',
            items: [
              { num: '01', title: `${w1.toUpperCase()} In Motion`, desc: 'Dynamic visual energy and rhythm' },
              { num: '02', title: `${w2.toUpperCase()} & Connection`, desc: 'Bonds forged through shared experience' },
              { num: '03', title: `${w3.toUpperCase()} & Joy`, desc: 'Unforgettable moments of celebration' }
            ]
          }
        },
        {
          id: 'elem_dyn_particles2',
          type: 'particles',
          props: { count: 55, color: '#38BDF8', speed: 1.2 }
        }
      ],
      assetRequirements: ['Rhythmic synth beat', 'Whoosh transition sound'],
      assignedAssetIds: {},
      transition: 'slide_left',
      approved: false
    },
    {
      id: `sc_dyn_3_${Date.now()}`,
      order: 3,
      title: `Grand Finale & Call To Action`,
      label: 'SCENE 3: BRAND FINALE',
      narration: `Celebrate the moment. Join in and elevate your experience today.`,
      captionText: `${brandName.toUpperCase()}\n${brandTagline}`,
      duration: duration - (sDuration * 2),
      visualType: 'motion_graphic',
      theme,
      backgroundColor: bg3,
      compositionLayout: 'brand_outro',
      cameraMotion: 'zoom_out',
      focalConcept: 'Monogram Crest with Specular Sheen Sweep & Call to Action Button',
      elements: [
        {
          id: 'elem_dyn_outro',
          type: 'brand_outro',
          props: {
            brandName: brandName,
            tagline: brandTagline,
            emblem: brandName.slice(0, 2).toUpperCase(),
            cta: 'JOIN THE CELEBRATION →',
            glowColor: particleColor
          }
        },
        {
          id: 'elem_dyn_particles3',
          type: 'particles',
          props: { count: 70, color: '#FEF08A', speed: 1.4 }
        }
      ],
      assetRequirements: ['Grand crescendo chime', 'Brand reveal impact'],
      assignedAssetIds: {},
      transition: 'zoom_in',
      approved: false
    }
  ];
}

export function matchOfflineTemplate(prompt: string, duration: number, brand: BrandKit): Scene[] {
  const p = prompt.toLowerCase();

  // 1. Holi Festival of Colors
  if (p.includes('holi') || p.includes('gulal') || p.includes('rang barse') || p.includes('festival of colors') || p.includes('colors festival')) {
    return HOLI_FESTIVE_TEMPLATE.scenes(duration, brand);
  }

  // 2. Diwali Festive Celebration (explicit match for festive prompts)
  if (p.includes('diwali') || p.includes('deepavali') || p.includes('diya')) {
    return FESTIVE_DIWALI_TEMPLATE.scenes(duration, brand);
  }

  // 3. SaaS & Product Teaser
  if (p.includes('saas') || p.includes('software') || p.includes('dashboard') || p.includes('automation')) {
    return SAAS_PRODUCT_TEMPLATE.scenes(duration, brand);
  }

  // 4. Sukh Graphix Agency Benchmark (Directive #8)
  if (p.includes('sukh') || p.includes('graphix') || p.includes('graphic') || p.includes('agency') || p.includes('portfolio') || p.includes('design studio')) {
    return SUKH_GRAPHIX_BENCHMARK_TEMPLATE.scenes(duration, brand);
  }

  // 5. Fallback: Bespoke 3-Act Motion Graphics sequence tailored to prompt
  return generateDynamicBespokeScenes(prompt, duration, brand);
}
