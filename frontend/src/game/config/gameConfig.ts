
export interface JokerDef {
  id: string;
  name: string;
  description: string;
  color: string;
  cost: number;
  isLegendary?: boolean;
  sellValue?: number;
}

export interface BallModDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  cost: number;
  popText: string;
  customDraw?: number;
  rarity?: 'Comum' | 'Incomum' | 'Rara' | 'Lendária';
}

export interface CueDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  accent: string;
  cost: number;
  weaponId?: string;
}

export interface TableBossRule {
  name: string;
  keys: string[];
  headers: [string, string];
  description: string[];
}

export interface TableDef {
  index: number;
  name: string;
  target: number;
  feltColor: string;
  bgColor: [[number, number, number], [number, number, number], [number, number, number]];
  isBoss: boolean;
  bossRule?: TableBossRule;
}

export const TG: number[] = [
  120,
  300,
  600,
  1200,
  2500,
  5000,
  7000,
  9000,
  15000,
  22000,
];

export const NM: string[] = [
  'Boteco do Zé',
  'Clube do Bairro',
  'Salão VIP',
  'Mesa do Chefão',
  'Sinuca da Praia',
  'Cassino Neon',
  'Bar do Pescador',
  'Cobertura 77',
  'Salão Imperial',
  'Mesa do Destino',
];

export const FEL: string[] = [
  '#1f7a52',
  '#1f6a44',
  '#7a2a45',
  '#2a2f3a',
  '#1f9aa8',
  '#5a2a8a',
  '#1f5f7a',
  '#33378a',
  '#1f3a7a',
  '#4a2a7a',
];

export const PAL: Array<[[number, number, number], [number, number, number], [number, number, number]]> = [
  [[240, 160, 50], [130, 50, 30], [26, 10, 14]],
  [[90, 190, 120], [30, 90, 70], [8, 24, 22]],
  [[230, 160, 70], [120, 20, 50], [26, 6, 18]],
  [[200, 50, 50], [60, 34, 48], [12, 8, 14]],
  [[255, 200, 110], [40, 190, 210], [10, 70, 110]],
  [[255, 70, 210], [90, 30, 160], [14, 6, 32]],
  [[110, 210, 230], [30, 90, 140], [6, 20, 36]],
  [[170, 130, 255], [60, 40, 130], [10, 8, 30]],
  [[255, 200, 90], [150, 30, 40], [36, 6, 14]],
  [[170, 110, 255], [60, 30, 120], [10, 6, 28]],
];

export const BOSS: number[] = [3, 6, 9];

export const BRL: Record<number, TableBossRule> = {
  3: {
    name: 'CHEFÃO EXIGENTE',
    keys: ['lock', 'miss'],
    headers: ['1º CURINGA TRANCADO', '3 BOLAS A MENOS'],
    description: [
      'O 1º curinga (mais à esquerda) fica trancado.',
      '3 das bolas do rack somem no início da mesa.',
    ],
  },
  6: {
    name: 'MARÉ DO TUBARÃO',
    keys: ['shark'],
    headers: ['50% DE CHANCE DE O TUBARÃO', 'COMER 1 BOLA POR TACADA'],
    description: [
      'A cada tacada, 50% de chance de um tubarão comer 1 bola.',
      'Sempre sobram pelo menos 2 bolas na mesa.',
    ],
  },
  9: {
    name: 'VÓRTICES DO DESTINO',
    keys: ['spi', 'nud'],
    headers: ['CAÇAPAS SUGAM A BRANCA', 'BOLAS SE MEXEM'],
    description: [
      'Caçapas em espiral sugam a bola branca: falta!',
      'As bolas se mexem um pouco a cada tacada.',
    ],
  },
};

export const nBalls = (tableIndex: number): number =>
  9 + 2 * BOSS.filter((t) => t <= tableIndex).length;

export const RK: Record<number, number[]> = {
  9: [1, 2, 3, 2, 1],
  11: [1, 2, 3, 4, 1],
  13: [1, 2, 3, 4, 3],
  15: [1, 2, 3, 4, 5],
};

export const J: JokerDef[] = [
  { id: 'tab', name: 'Tabelinha', description: '+3 Mult por caçapa após bater na tabela', color: '#3ec1d3', cost: 5 },
  { id: 'giz', name: 'Giz Azul', description: '+35 Fichas por bola encaçapada', color: '#254caf', cost: 4 },
  { id: 'dob', name: 'Dobradinha', description: '×2 Mult se 2+ bolas na tacada', color: '#ff6a3d', cost: 6 },
  { id: 'b8', name: 'Bola Oito', description: '+8 Mult ao encaçapar a bola 8', color: '#7a7f88', cost: 5 },
  { id: 'mao', name: 'Mão Firme', description: '+2 tacadas por mesa', color: '#7ad36a', cost: 4 },
  { id: 'bnk', name: 'Banqueiro', description: '+$5 ao vencer cada mesa', color: '#f2b632', cost: 3 },
  { id: 'pri', name: 'Abertura', description: '+60 Fichas na 1ª caçapa de cada tacada', color: '#e86fb0', cost: 4 },
  { id: 'tri', name: 'Trinca', description: '×3 Mult se 3+ bolas na tacada', color: '#9a6bff', cost: 7 },
  { id: 'lis', name: 'Taco Liso', description: '+2 Mult por caçapa', color: '#35b8a0', cost: 5 },
  { id: 'cof', name: 'Cofrinho', description: '+$3 por tacada que sobrou', color: '#d9a441', cost: 4 },
  { id: 'qui', name: 'Quina', description: '+4 Mult em caçapa de canto', color: '#2f9a5a', cost: 5 },
  { id: 'lat', name: 'Lateral', description: '+50 Fichas em caçapa do meio', color: '#e0a020', cost: 4 },
  { id: 'par', name: 'Par ou Ímpar', description: 'Sorteia a cada tacada: bolas PARES ou ÍMPARES + um efeito aleatório', color: '#c0392b', cost: 5 },
  { id: 'lsd', name: 'Listradas', description: '+30 Fichas por bola listrada', color: '#2a52c9', cost: 4 },
  { id: 'rel', name: 'Relógio', description: '+1 tacada se encaçapar 3+ bolas na tacada', color: '#8a6a3a', cost: 6 },
  { id: 'fax', name: 'Faxina', description: '+$8 ao limpar todas as bolas da mesa', color: '#35b8a0', cost: 5 },
  { id: 'sabor', name: 'Sabor', description: 'Copia e repete o efeito do curinga à esquerda. Não copia outro Sabor', color: '#6ec1f5', cost: 8 },
];

export const JE: JokerDef[] = [
  { id: 'rei', name: 'Rei da Mesa', description: '×2 Mult final em toda tacada que encaçapar', color: '#8a3bd6', cost: 12, isLegendary: true },
  { id: 'mid', name: 'Rei Midas', description: '+$4 por bola encaçapada', color: '#d9a02e', cost: 10, isLegendary: true },
  { id: 'cho', name: 'Chuva de Fichas', description: '+100 Fichas por bola encaçapada', color: '#2f86ff', cost: 11, isLegendary: true },
  { id: 'inf', name: 'Infinito', description: '+3 tacadas por mesa', color: '#1f9a6a', cost: 11, isLegendary: true },
  { id: 'cmb', name: 'Combo Mortal', description: 'caçapas seguidas na tacada dão +2, +4, +6… Mult', color: '#d6322a', cost: 12, isLegendary: true },
  { id: 'sup', name: 'Supernova', description: '×1.5 Mult a cada caçapa', color: '#ff7a1f', cost: 14, isLegendary: true },
  { id: 'cer', name: 'Cerco', description: '×3 Mult se encaçapar 4+ bolas na tacada', color: '#d6322a', cost: 12, isLegendary: true },
  { id: 'bcc', name: 'Banco Central', description: '+$12 ao vencer cada mesa', color: '#d9a02e', cost: 10, isLegendary: true },
  { id: 'nec', name: 'Necronomicon', description: '1 bola possuída por tacada; passa por colisões; encaçapada: +50 Fichas', color: '#2f5a3a', cost: 12, isLegendary: true },
  { id: 'aln', name: 'All In', description: 'Vender com 1 tacada restante: aposta todo o $ — 50% vence a mesa, 50% perde a run. Valor de venda: $0', color: '#c92a2a', cost: 8, isLegendary: true, sellValue: 0 },
];

export const BMOD: BallModDef[] = [
  { id: 'pel', name: 'Peluda', icon: 'P', description: '+6 Mult, mas freia 2,5× mais rápido', color: '#b5835a', cost: 7, popText: 'PELUDA +6', rarity: 'Comum' },
  { id: '67', name: 'Seis-Sete', icon: '7', description: 'vira 67 e dá +67 Fichas', color: '#ff6a3d', cost: 8, popText: '67! +67', rarity: 'Incomum' },
  { id: 'sig', name: 'Sigma', icon: 'Σ', description: '×1,5 Mult ao encaçapar', color: '#7a7f88', cost: 9, popText: 'SIGMA ×1,5', rarity: 'Rara' },
  { id: 'riz', name: 'Rizz', icon: '$', description: '+$2 ao encaçapar', color: '#e86fb0', cost: 6, popText: 'RIZZ +$2', rarity: 'Comum' },
  { id: 'ohi', name: 'Ohio', icon: '?', description: 'sorte: +0~120 Fichas ou +0~8 Mult', color: '#9a6bff', cost: 5, popText: 'OHIO?!', rarity: 'Comum' },
  { id: 'chd', name: 'Gigachad', icon: '+', description: '+1 tacada ao encaçapar', color: '#7ad36a', cost: 12, popText: 'CHAD +1 TACADA', rarity: 'Lendária' },
  { id: 'sap', name: 'Sapo Raro', icon: 'S', description: '+25 Fichas e +$1; 10% de chance de +$10', color: '#5fae3a', cost: 7, popText: 'SAPO RARO', rarity: 'Incomum' },
  { id: 'hoq', name: 'Máscara de Hóquei', icon: 'H', description: '+12 Mult se a bola bateu na tabela antes', color: '#d6322a', cost: 8, popText: 'HÓQUEI +12', rarity: 'Incomum' },
  { id: 'bco', name: 'Máscara Branca', icon: 'B', description: '×2 Mult se for a última bola da mesa', color: '#cfc8b4', cost: 9, popText: 'ÚLTIMA ×2', rarity: 'Rara' },
  { id: 'lst', name: 'Suéter Listrado', icon: 'L', description: '+5 Mult por caçapa anterior na mesma tacada', color: '#c0392b', cost: 8, popText: 'LISTRADO', rarity: 'Incomum' },
  { id: 'gri', name: 'Grito', icon: 'G', description: '+160 Fichas, mas custa 1 tacada', color: '#3a3a48', cost: 7, popText: 'GRITO +160', rarity: 'Incomum' },
  { id: 'lem', name: 'LeMerchant', icon: 'M', description: '×2 Mult se tocou 3 lados distintos da mesa na tacada', color: '#d9a02e', cost: 11, popText: 'LEMERCHANT ×2', customDraw: 1, rarity: 'Rara' },
  { id: 'jaw', name: 'Jaws', icon: 'J', description: 'faz +120 Fichas se percorreu ≥ metade da mesa (FW/2) antes de cair', color: '#2f6ad0', cost: 8, popText: 'JAWS +120', customDraw: 1, rarity: 'Incomum' },
];

export const TQ: CueDef[] = [
  { id: 'for', name: 'Taco Forte', icon: 'F', description: 'tacadas saem 30% mais fortes', color: '#7a3b16', accent: '#ff6a3d', cost: 5 },
  { id: 'ouro', name: 'Taco de Ouro', icon: '$', description: '+$1 por bola encaçapada', color: '#b8861f', accent: '#fff0a0', cost: 7 },
  { id: 'sor', name: 'Taco Sortudo', icon: '7', description: '20% de chance de dobrar as Fichas de cada caçapa', color: '#1d5a3a', accent: '#8dff9a', cost: 6 },
  { id: 'pes', name: 'Taco Pesado', icon: '+', description: '+20 Fichas por bola encaçapada', color: '#2a2f3a', accent: '#4aa3ff', cost: 5 },
  { id: 'bru', name: 'Taco Brutal', icon: '!', description: '+4 Mult por caçapa se a força passar de 80%', color: '#6a1a2a', accent: '#ff4b3a', cost: 7 },
  { id: 'sua', name: 'Taco Suave', icon: '~', description: '×2 Fichas por caçapa se a força for menor que 35%', color: '#3a2a6a', accent: '#c9a6ff', cost: 6 },
  { id: 'nov', name: 'Taco Reserva', icon: 'R', description: '+1 tacada por mesa', color: '#2a5a7a', accent: '#9ff1ff', cost: 6 },
  { id: 'bin', name: 'Binho', icon: 'B', description: 'Você escolhe o efeito (spin) da bola branca: follow, draw ou english', color: '#1f4a6a', accent: '#ffd36a', cost: 8 },
  { id: 'fog', name: 'Taco Brasa', icon: 'B', description: '+2 Mult em bolas que bateram na tabela', color: '#8a2a10', accent: '#ffb347', cost: 6 },
  { id: 'fac', name: 'Faca de Cozinha', icon: 'F', description: '+8 Mult na 1ª caçapa de cada tacada', color: '#1a1a22', accent: '#d6322a', cost: 7, weaponId: 'fac' },
  { id: 'mch', name: 'Machete Enferrujado', icon: 'M', description: '+15 Fichas por batida da bola na tabela (até 4)', color: '#4a3220', accent: '#b8651f', cost: 7, weaponId: 'mch' },
  { id: 'gar', name: 'Luva de Garras', icon: 'G', description: '+1 Mult por bola ainda na mesa a cada caçapa', color: '#7a2a1a', accent: '#2f7a44', cost: 8, weaponId: 'gar' },
  { id: 'mot', name: 'Motosserra', icon: 'S', description: '×1,5 Mult a cada caçapa a partir da 3ª da tacada', color: '#c0561a', accent: '#e8e2d2', cost: 11, weaponId: 'mot' },
  { id: 'mac', name: 'Machado', icon: 'X', description: '+40 Fichas por bola listrada', color: '#5a3a1a', accent: '#aab0b8', cost: 7, weaponId: 'mac' },
  { id: 'mal', name: 'Taco Maldito', icon: 'T', description: '+6 Mult por caçapa, mas −1 tacada por mesa', color: '#2a1030', accent: '#d6322a', cost: 6, weaponId: 'mal' },
];

export const SL = 5;
export const ESP = 5;
export const MAXF = 5;
export const BASE_SHOTS = 7;
export const START_MONEY = 4;

export const PE: Array<[string, string]> = [
  ['+3 Mult', '+3M'],
  ['+40 Fichas', '+40F'],
  ['+$2', '+$2'],
  ['×1,25 Mult', '×1,25'],
  ['+2 Mult e +20 Fichas', '+2M+20F'],
  ['20% de +1 tacada', '20% +1T'],
];
