import { Scene, AspectRatio, StylePreset, BrandKit } from '../../types/creatorStudio';

export interface TemplateMatch {
  title: string;
  description: string;
  stylePreset: StylePreset;
  defaultBrand: BrandKit;
  scenes: (duration: number, brand: BrandKit) => Scene[];
}

export const FESTIVE_DIWALI_TEMPLATE: TemplateMatch = {
  title: 'Diwali Festive Reel — Sukh Graphix',
  description: '15-second celebratory motion-graphics reel with glowing diyas, particle embers, festive Sanskrit typography, and luxury gold brand reveal.',
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
    const sceneDuration = duration / 3;
    return [
      {
        id: `sc_diwali_1_${Date.now()}`,
        order: 1,
        title: 'Festive Greeting & Radiant Light',
        label: 'SCENE 1: FESTIVE DAWN',
        narration: 'This Diwali, let light triumph over darkness and every creation shine with boundless radiance.',
        captionText: '✨ Shubh Deepavali ✨\nCelebrate The Festival of Lights',
        duration: Math.round(sceneDuration),
        visualType: 'motion_graphic',
        theme: 'diwali_festive',
        backgroundColor: '#1E1100',
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
            type: 'typography',
            props: { text: 'शुभ दीपावली', subtitle: 'Festival of Lights', style: 'festive_gold' }
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
        duration: Math.round(sceneDuration),
        visualType: 'motion_graphic',
        theme: 'luxury_gold',
        backgroundColor: '#170E05',
        elements: [
          {
            id: 'elem_diya_duo',
            type: 'diya',
            props: { size: 95, glowIntensity: 1.0, dual: true }
          },
          {
            id: 'elem_geometric_gold',
            type: 'geometric',
            props: { shape: 'mandala', rotationSpeed: 0.008, color: '#F59E0B' }
          },
          {
            id: 'elem_typo_2',
            type: 'typography',
            props: { text: 'CREATIVE MASTERY', subtitle: 'Where Design Meets Passion', style: 'kinetic_pop' }
          }
        ],
        assetRequirements: ['Portfolio highlight graphics', 'Golden mandala vector'],
        assignedAssetIds: {},
        transition: 'particle_dissolve',
        approved: false
      },
      {
        id: `sc_diwali_3_${Date.now()}`,
        order: 3,
        title: `Grand Brand Reveal — ${brand.name}`,
        label: 'SCENE 3: BRAND REVEAL',
        narration: `${brand.name} wishes you prosperity, success, and endless joy this Diwali.`,
        captionText: `${brand.name.toUpperCase()}\n${brand.tagline || 'Illuminating Creative Excellence'}`,
        duration: Math.round(sceneDuration),
        visualType: 'motion_graphic',
        theme: 'luxury_gold',
        backgroundColor: '#0D0800',
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
            id: 'elem_diya_center',
            type: 'diya',
            props: { size: 120, glowIntensity: 1.5, flameColor: '#FF9900' }
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
    const sceneDuration = duration / 3;
    return [
      {
        id: `sc_saas_1_${Date.now()}`,
        order: 1,
        title: 'The Problem & The Future',
        label: 'SCENE 1: HOOK & CHALLENGE',
        narration: 'Stop wasting hours on manual workflows. Experience the speed of intelligent automation.',
        captionText: 'Tired of Slow Workflows?\nStep Into The Future.',
        duration: Math.round(sceneDuration),
        visualType: 'motion_graphic',
        theme: 'cyberpunk_blue',
        backgroundColor: '#0A0F1D',
        elements: [
          {
            id: 'elem_grid_1',
            type: 'geometric',
            props: { shape: 'grid', color: '#1E3A8A', perspective: true }
          },
          {
            id: 'elem_typo_saas1',
            type: 'typography',
            props: { text: '10X YOUR SPEED', subtitle: 'Autonomous Workflows', style: 'neon_glow' }
          }
        ],
        assetRequirements: ['Interface screenshot', 'Whoosh sound effect'],
        assignedAssetIds: {},
        transition: 'slide_left',
        approved: false
      },
      {
        id: `sc_saas_2_${Date.now()}`,
        order: 2,
        title: 'Device Mockup & Feature Demo',
        label: 'SCENE 2: INTERACTIVE DEMO',
        narration: 'Designed for high-growth teams. Real-time collaboration, zero latency, and seamless integrations.',
        captionText: 'Instant Collaboration\nZero Overhead',
        duration: Math.round(sceneDuration),
        visualType: 'motion_graphic',
        theme: 'high_tech',
        backgroundColor: '#050B14',
        elements: [
          {
            id: 'elem_mockup_phone',
            type: 'device_mockup',
            props: { device: 'mobile', glow: '#3B82F6', tilt: true }
          },
          {
            id: 'elem_particles_matrix',
            type: 'particles',
            props: { count: 50, color: '#60A5FA', speed: 0.9, style: 'digital_stream' }
          }
        ],
        assetRequirements: ['Product Mobile Capture', 'Click sound effect'],
        assignedAssetIds: {},
        transition: 'zoom_in',
        approved: false
      },
      {
        id: `sc_saas_3_${Date.now()}`,
        order: 3,
        title: `Get Started with ${brand.name}`,
        label: 'SCENE 3: CONVERTING CTA',
        narration: `Join thousands of creators building the future with ${brand.name}. Try it free today.`,
        captionText: `${brand.name.toUpperCase()}\nStart Free • No Credit Card Required`,
        duration: Math.round(sceneDuration),
        visualType: 'motion_graphic',
        theme: 'cyberpunk_blue',
        backgroundColor: '#020617',
        elements: [
          {
            id: 'elem_saas_brand',
            type: 'brand_reveal',
            props: {
              brandName: brand.name.toUpperCase(),
              tagline: brand.tagline || 'Automate Without Limits',
              glowColor: '#3B82F6',
              lensSweep: true,
              particleExplosion: true
            }
          }
        ],
        assetRequirements: [`${brand.name} Icon`, 'Upbeat Synth Outro'],
        assignedAssetIds: {},
        transition: 'fade',
        approved: false
      }
    ];
  }
};

export const FINANCE_COMPOUNDING_TEMPLATE: TemplateMatch = {
  title: 'Compounding Snowball Effect',
  description: 'Viral educational reel visualizing exponential compounding interest through an alpine snowball avalanche.',
  stylePreset: 'luxury_gold',
  defaultBrand: {
    name: 'Wealth Matrix',
    primaryColor: '#10B981',
    secondaryColor: '#047857',
    accentColor: '#6EE7B7',
    tagline: 'Mastering Compound Growth',
    fontFamily: 'sans'
  },
  scenes: (duration: number, brand: BrandKit): Scene[] => {
    const sceneDuration = duration / 3;
    return [
      {
        id: `sc_fin_1_${Date.now()}`,
        order: 1,
        title: 'The Modest Beginning',
        label: 'SCENE 1: THE SPARK',
        narration: 'At first, compounding feels painfully slow. You barely notice the difference.',
        captionText: 'The Eighth Wonder of The World\nStarts Silently Small',
        duration: Math.round(sceneDuration),
        visualType: 'motion_graphic',
        theme: 'finance_green',
        backgroundColor: '#061A14',
        elements: [
          {
            id: 'elem_chart_start',
            type: 'geometric',
            props: { shape: 'exponential_curve', progress: 0.3, color: '#10B981' }
          },
          {
            id: 'elem_typo_fin1',
            type: 'typography',
            props: { text: 'PATIENCE PAYS', subtitle: 'Phase 1: Accumulation', style: 'clean_sans' }
          }
        ],
        assetRequirements: ['Subtle wind ambient', 'Coin drop chime'],
        assignedAssetIds: {},
        transition: 'fade',
        approved: false
      },
      {
        id: `sc_fin_2_${Date.now()}`,
        order: 2,
        title: 'The Tipping Point & Explosion',
        label: 'SCENE 2: EXPONENTIAL SHIFT',
        narration: 'Then suddenly, your returns generate their own returns, unleashing an unstoppable avalanche of wealth.',
        captionText: 'Returns on Returns\nThe Avalanche Begins!',
        duration: Math.round(sceneDuration),
        visualType: 'motion_graphic',
        theme: 'finance_green',
        backgroundColor: '#022C22',
        elements: [
          {
            id: 'elem_particles_snow',
            type: 'particles',
            props: { count: 80, color: '#A7F3D0', speed: 2.0, style: 'snow_flurries' }
          },
          {
            id: 'elem_typo_fin2',
            type: 'typography',
            props: { text: 'EXPONENTIAL SURGE', subtitle: 'Phase 2: Acceleration', style: 'kinetic_pop' }
          }
        ],
        assetRequirements: ['Avalanche rumble audio', 'Crescendo riser'],
        assignedAssetIds: {},
        transition: 'particle_dissolve',
        approved: false
      },
      {
        id: `sc_fin_3_${Date.now()}`,
        order: 3,
        title: `The Ultimate Wealth Rule — ${brand.name}`,
        label: 'SCENE 3: ACTIONABLE INSIGHT',
        narration: `Start early, stay consistent, and let time do the heavy lifting with ${brand.name}.`,
        captionText: `${brand.name.toUpperCase()}\nTime in the Market > Timing the Market`,
        duration: Math.round(sceneDuration),
        visualType: 'motion_graphic',
        theme: 'luxury_gold',
        backgroundColor: '#061A14',
        elements: [
          {
            id: 'elem_brand_fin',
            type: 'brand_reveal',
            props: {
              brandName: brand.name.toUpperCase(),
              tagline: brand.tagline || 'Mastering Compound Growth',
              glowColor: '#10B981',
              lensSweep: true,
              particleExplosion: true
            }
          }
        ],
        assetRequirements: [`${brand.name} Logo`, 'Cash register ding'],
        assignedAssetIds: {},
        transition: 'zoom_in',
        approved: false
      }
    ];
  }
};

export function matchOfflineTemplate(prompt: string, duration: number, brand: BrandKit): Scene[] {
  const p = prompt.toLowerCase();
  if (p.includes('diwali') || p.includes('festiv') || p.includes('deepavali') || p.includes('sukh graphix') || p.includes('diya')) {
    return FESTIVE_DIWALI_TEMPLATE.scenes(duration, brand);
  }
  if (p.includes('saas') || p.includes('software') || p.includes('app') || p.includes('website') || p.includes('tech') || p.includes('automation')) {
    return SAAS_PRODUCT_TEMPLATE.scenes(duration, brand);
  }
  if (p.includes('compound') || p.includes('money') || p.includes('wealth') || p.includes('invest') || p.includes('finance') || p.includes('crypto')) {
    return FINANCE_COMPOUNDING_TEMPLATE.scenes(duration, brand);
  }
  // Default to festive / creative brand template
  return FESTIVE_DIWALI_TEMPLATE.scenes(duration, brand);
}
