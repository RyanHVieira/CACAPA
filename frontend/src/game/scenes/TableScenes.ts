
export interface ScenePalette {
  light: [number, number, number];
  mid: [number, number, number];
  dark: [number, number, number];
}

export const SCENE_PALETTES: ScenePalette[] = [
    { light: [240, 160, 50], mid: [130, 50, 30], dark: [26, 10, 14] },
    { light: [90, 190, 120], mid: [30, 90, 70], dark: [8, 24, 22] },
    { light: [230, 160, 70], mid: [120, 20, 50], dark: [26, 6, 18] },
    { light: [200, 50, 50], mid: [60, 34, 48], dark: [12, 8, 14] },
    { light: [255, 200, 110], mid: [40, 190, 210], dark: [10, 70, 110] },
    { light: [255, 70, 210], mid: [90, 30, 160], dark: [14, 6, 32] },
    { light: [110, 210, 230], mid: [30, 90, 140], dark: [6, 20, 36] },
    { light: [170, 130, 255], mid: [60, 40, 130], dark: [10, 8, 30] },
    { light: [255, 200, 90], mid: [150, 30, 40], dark: [36, 6, 14] },
    { light: [170, 110, 255], mid: [60, 30, 120], dark: [10, 6, 28] },
];

export interface AmbientTheme {
  wood: string;
  markings: string;
  light: [number, number, number];
  darkness: number;
  title: string;
  subtitle: string;
  titleColor1: string;
  titleGlow1: string;
  titleColor2: string;
  titleGlow2: string;
  bg: string;
  border: string;
  decorations: string[];
  objects: string[];
}

export const AMBIENT_THEMES: AmbientTheme[] = [
    {
    wood: '#7a4422',
    markings: '#f4ecd8',
    light: [255, 200, 120],
    darkness: 0.2,
    title: 'BOTECO DO ZÉ',
    subtitle: 'CERVEJA GELADA',
    titleColor1: '#ff8fd0',
    titleGlow1: '#ff3fa4',
    titleColor2: '#9ff1ff',
    titleGlow2: '#3ec1d3',
    bg: '#140c1c',
    border: '#3ec1d3',
    decorations: ['candle', 'ball', 'tarot', 'candle', 'ball', 'tarot'],
    objects: ['candle', 'ball', 'tarot', 'candle', 'ball', 'tarot'],
  },
    {
    wood: '#5a6a44',
    markings: '#e8f5e8',
    light: [180, 220, 140],
    darkness: 0.15,
    title: 'CLUBE DO BAIRRO',
    subtitle: 'SINUCA AMADORA',
    titleColor1: '#ffd36a',
    titleGlow1: '#f2b632',
    titleColor2: '#8dff9a',
    titleGlow2: '#4ade80',
    bg: '#0c1a0c',
    border: '#4ade80',
    decorations: ['trophy', 'flag', 'cue', 'trophy', 'flag', 'cue'],
    objects: ['trophy', 'flag', 'cue', 'trophy', 'flag', 'cue'],
  },
    {
    wood: '#4a1a2a',
    markings: '#f4ecd8',
    light: [255, 180, 100],
    darkness: 0.25,
    title: 'SALÃO VIP',
    subtitle: 'MESA EXCLUSIVA',
    titleColor1: '#ffd36a',
    titleGlow1: '#f59e0b',
    titleColor2: '#f5c6a0',
    titleGlow2: '#f97316',
    bg: '#1a080c',
    border: '#f59e0b',
    decorations: ['champagne', 'cigar', 'chips', 'champagne', 'cigar', 'chips'],
    objects: ['champagne', 'cigar', 'chips', 'champagne', 'cigar', 'chips'],
  },
    {
    wood: '#2a0a14',
    markings: '#8b0000',
    light: [220, 60, 60],
    darkness: 0.35,
    title: 'MESA DO CHEFÃO',
    subtitle: 'NÃO PERCA',
    titleColor1: '#ff6b6b',
    titleGlow1: '#dc2626',
    titleColor2: '#ffd36a',
    titleGlow2: '#f59e0b',
    bg: '#1a0005',
    border: '#dc2626',
    decorations: ['gun', 'money', 'cigar', 'gun', 'money', 'cigar'],
    objects: ['gun', 'money', 'cigar', 'gun', 'money', 'cigar'],
  },
    {
    wood: '#8b7355',
    markings: '#f0e6d2',
    light: [255, 220, 140],
    darkness: 0.1,
    title: 'SINUCA DA PRAIA',
    subtitle: 'BRISA DO MAR',
    titleColor1: '#38bdf8',
    titleGlow1: '#0ea5e9',
    titleColor2: '#fbbf24',
    titleGlow2: '#f59e0b',
    bg: '#0a2a3a',
    border: '#38bdf8',
    decorations: ['palm', 'drink', 'surf', 'palm', 'drink', 'surf'],
    objects: ['palm', 'drink', 'surf', 'palm', 'drink', 'surf'],
  },
    {
    wood: '#1a0a2a',
    markings: '#ff00ff',
    light: [255, 100, 255],
    darkness: 0.3,
    title: 'CASSINO NEON',
    subtitle: 'JACKPOT OU NADA',
    titleColor1: '#f472b6',
    titleGlow1: '#ec4899',
    titleColor2: '#a855f7',
    titleGlow2: '#9333ea',
    bg: '#0d0214',
    border: '#d946ef',
    decorations: ['dice', 'chip', 'card', 'dice', 'chip', 'card'],
    objects: ['dice', 'chip', 'card', 'dice', 'chip', 'card'],
  },
    {
    wood: '#3a5a6a',
    markings: '#a8d0e6',
    light: [140, 210, 240],
    darkness: 0.2,
    title: 'BAR DO PESCADOR',
    subtitle: 'PEIXE FRESCO',
    titleColor1: '#67e8f9',
    titleGlow1: '#06b6d4',
    titleColor2: '#fbbf24',
    titleGlow2: '#f59e0b',
    bg: '#081a22',
    border: '#06b6d4',
    decorations: ['fish', 'net', 'anchor', 'fish', 'net', 'anchor'],
    objects: ['fish', 'net', 'anchor', 'fish', 'net', 'anchor'],
  },
    {
    wood: '#2a1a4a',
    markings: '#c8b8e8',
    light: [200, 180, 255],
    darkness: 0.25,
    title: 'COBERTURA 77',
    subtitle: 'ALTA SOCIEDADE',
    titleColor1: '#c084fc',
    titleGlow1: '#a855f7',
    titleColor2: '#fbbf24',
    titleGlow2: '#f59e0b',
    bg: '#120a22',
    border: '#a855f7',
    decorations: ['diamond', 'glass', 'watch', 'diamond', 'glass', 'watch'],
    objects: ['diamond', 'glass', 'watch', 'diamond', 'glass', 'watch'],
  },
    {
    wood: '#5a1a14',
    markings: '#f4d8b8',
    light: [255, 210, 140],
    darkness: 0.3,
    title: 'SALÃO IMPERIAL',
    subtitle: 'TRADIÇÃO REAL',
    titleColor1: '#ffd36a',
    titleGlow1: '#f59e0b',
    titleColor2: '#fca5a5',
    titleGlow2: '#ef4444',
    bg: '#1a0a08',
    border: '#f59e0b',
    decorations: ['crown', 'scepter', 'orb', 'crown', 'scepter', 'orb'],
    objects: ['crown', 'scepter', 'orb', 'crown', 'scepter', 'orb'],
  },
    {
    wood: '#1a122a',
    markings: '#b8a8e8',
    light: [200, 170, 255],
    darkness: 0.4,
    title: 'MESA DO DESTINO',
    subtitle: 'O FIM DA LINHA',
    titleColor1: '#c084fc',
    titleGlow1: '#a855f7',
    titleColor2: '#fbbf24',
    titleGlow2: '#f59e0b',
    bg: '#0a0614',
    border: '#7c3aed',
    decorations: ['tarot', 'skull', 'hourglass', 'tarot', 'skull', 'hourglass'],
    objects: ['tarot', 'skull', 'hourglass', 'tarot', 'skull', 'hourglass'],
  },
];

export function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  fill?: string | CanvasGradient | CanvasPattern,
  stroke?: string,
  lineWidth: number = 1.5
): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

export function drawCurve(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  cx: number, cy: number,
  x2: number, y2: number,
  stroke: string,
  lineWidth: number
): void {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(cx, cy, x2, y2);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

export function createRadialGradient(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number,
  colorStops: [number, string][]
): CanvasGradient {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
  colorStops.forEach(([stop, color]) => grad.addColorStop(stop, color));
  return grad;
}