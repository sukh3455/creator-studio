import { Asset } from '../../types/creatorStudio';

export interface StockItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  category: 'festive' | 'tech' | 'abstract' | 'music';
  url: string;
  previewUrl: string;
  duration?: number;
  dimensions?: { width: number; height: number };
  license: {
    type: 'Free Commercial' | 'CC0 / Public Domain';
    attribution: string;
    sourceUrl: string;
  };
}

export const CURATED_STOCK_LIBRARY: StockItem[] = [
  {
    id: 'stock_diwali_gold_bg',
    name: 'Golden Festive Bokeh Background',
    type: 'image',
    category: 'festive',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1280&auto=format&fit=crop',
    previewUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=300&auto=format&fit=crop',
    dimensions: { width: 1280, height: 720 },
    license: {
      type: 'Free Commercial',
      attribution: 'Photo by Unsplash Community / Free Unsplash License',
      sourceUrl: 'https://unsplash.com/license'
    }
  },
  {
    id: 'stock_diya_clay_lamp',
    name: 'Traditional Indian Diya Lamp',
    type: 'image',
    category: 'festive',
    url: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?q=80&w=1280&auto=format&fit=crop',
    previewUrl: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?q=80&w=300&auto=format&fit=crop',
    dimensions: { width: 1280, height: 853 },
    license: {
      type: 'Free Commercial',
      attribution: 'Photo by Unsplash Community',
      sourceUrl: 'https://unsplash.com/license'
    }
  },
  {
    id: 'stock_cyber_grid',
    name: 'Cyberpunk Neon Matrix Grid',
    type: 'image',
    category: 'tech',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1280&auto=format&fit=crop',
    previewUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=300&auto=format&fit=crop',
    dimensions: { width: 1280, height: 853 },
    license: {
      type: 'Free Commercial',
      attribution: 'Photo by Unsplash Community',
      sourceUrl: 'https://unsplash.com/license'
    }
  },
  {
    id: 'stock_audio_festive_sitar',
    name: 'Celebratory Festive Sitar & Tabla (Royalty Free)',
    type: 'audio',
    category: 'music',
    url: 'https://cdn.freesound.org/previews/518/518305_5674468-lq.mp3',
    previewUrl: 'https://cdn.freesound.org/previews/518/518305_5674468-lq.mp3',
    duration: 18,
    license: {
      type: 'CC0 / Public Domain',
      attribution: 'Freesound Creative Commons 0 (Public Domain)',
      sourceUrl: 'https://creativecommons.org/publicdomain/zero/1.0/'
    }
  },
  {
    id: 'stock_audio_tech_ambient',
    name: 'Futuristic Tech Synth Pulse (Royalty Free)',
    type: 'audio',
    category: 'music',
    url: 'https://cdn.freesound.org/previews/467/467471_71257-lq.mp3',
    previewUrl: 'https://cdn.freesound.org/previews/467/467471_71257-lq.mp3',
    duration: 20,
    license: {
      type: 'CC0 / Public Domain',
      attribution: 'Freesound Creative Commons 0 (Public Domain)',
      sourceUrl: 'https://creativecommons.org/publicdomain/zero/1.0/'
    }
  }
];

export function convertStockToAsset(stock: StockItem, projectId: string): Asset {
  return {
    id: `asset_${stock.id}_${Date.now()}`,
    projectId,
    name: stock.name,
    type: stock.type,
    url: stock.url,
    mimeType: stock.type === 'audio' ? 'audio/mpeg' : 'image/jpeg',
    size: 250000,
    dimensions: stock.dimensions,
    duration: stock.duration,
    source: 'stock',
    license: {
      type: stock.license.type,
      attribution: stock.license.attribution,
      sourceUrl: stock.license.sourceUrl
    },
    createdAt: new Date().toISOString()
  };
}
