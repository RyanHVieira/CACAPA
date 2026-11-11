export type ConsumableRarity = 'Comum' | 'Incomum' | 'Raro' | 'Épico' | 'Lendário';

export interface ConsumableDef {
  id: string;
  name: string;
  rarity: ConsumableRarity;
  cost: number;
  sellValue: number;
  description: string;
  icon: string;
  color: string;
  targetType: 'none' | 'ball';
}

export const CONSUMABLE_RARITY_COST: Record<ConsumableRarity, number> = {
  'Comum': 2,
  'Incomum': 3,
  'Raro': 4,
  'Épico': 6,
  'Lendário': 8,
};

export const CONSUMABLE_RARITY_COLORS: Record<ConsumableRarity, { text: string; bg: string; border: string; glow: string }> = {
  'Comum': {
    text: '#9fb4a8',
    bg: 'rgba(159, 180, 168, 0.15)',
    border: '#4a6054',
    glow: 'rgba(159, 180, 168, 0.4)',
  },
  'Incomum': {
    text: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.15)',
    border: '#0284c7',
    glow: 'rgba(56, 189, 248, 0.5)',
  },
  'Raro': {
    text: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: '#b45309',
    glow: 'rgba(245, 158, 11, 0.5)',
  },
  'Épico': {
    text: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.15)',
    border: '#be185d',
    glow: 'rgba(236, 72, 153, 0.5)',
  },
  'Lendário': {
    text: '#c084fc',
    bg: 'rgba(192, 132, 252, 0.15)',
    border: '#7e22ce',
    glow: 'rgba(192, 132, 252, 0.6)',
  },
};

export const CONSUMABLES: ConsumableDef[] = [
  {
    id: 'hamburguer',
    name: 'Hambúrguer',
    rarity: 'Comum',
    cost: 2,
    sellValue: 1,
    description: 'Concede +2 tacadas adicionais para a rodada atual.',
    icon: '🍔',
    color: '#f59e0b',
    targetType: 'none',
  },
  {
    id: 'refri',
    name: 'Refri',
    rarity: 'Incomum',
    cost: 3,
    sellValue: 1,
    description: 'Multiplica o multiplicador (Mult) por 5x na sua próxima tacada.',
    icon: '🥤',
    color: '#38bdf8',
    targetType: 'none',
  },
  {
    id: 'polimento_dourado',
    name: 'Polimento Dourado',
    rarity: 'Raro',
    cost: 4,
    sellValue: 2,
    description: 'Transforma a bola escolhida em uma Bola de Ouro (concede +$4 quando for encaçapada).',
    icon: '✨',
    color: '#fbbf24',
    targetType: 'ball',
  },
  {
    id: 'polimento',
    name: 'Polimento',
    rarity: 'Comum',
    cost: 2,
    sellValue: 1,
    description: 'Aumenta em +1 o número da bola escolhida (respeitando que a bola 8 nunca é listrada e sempre preta).',
    icon: '🧽',
    color: '#60a5fa',
    targetType: 'ball',
  },
  {
    id: 'polimento_arco_iris',
    name: 'Polimento Arco-Íris',
    rarity: 'Lendário',
    cost: 8,
    sellValue: 4,
    description: 'Concede um modificador aleatório qualquer para a bola escolhida.',
    icon: '🌈',
    color: '#c084fc',
    targetType: 'ball',
  },
  {
    id: 'borracha',
    name: 'Borracha',
    rarity: 'Comum',
    cost: 2,
    sellValue: 1,
    description: 'Apaga todas as suas faltas cometidas, zerando o contador de faltas.',
    icon: '🧹',
    color: '#f43f5e',
    targetType: 'none',
  },
];

export class ConsumableCatalog {
  public static getAll(): ConsumableDef[] {
    return [...CONSUMABLES];
  }

  public static getById(id: string): ConsumableDef | null {
    const found = CONSUMABLES.find((c) => c.id === id);
    return found ? { ...found } : null;
  }

  public static getRandom(): ConsumableDef {
    // Pesos de raridade: Comum 60%, Incomum 25%, Raro 12%, Lendário 3%
    const roll = Math.random();
    let targetRarity: ConsumableRarity = 'Comum';
    if (roll < 0.60) {
      targetRarity = 'Comum';
    } else if (roll < 0.85) {
      targetRarity = 'Incomum';
    } else if (roll < 0.97) {
      targetRarity = 'Raro';
    } else {
      targetRarity = 'Lendário';
    }

    const pool = CONSUMABLES.filter((c) => c.rarity === targetRarity);
    const chosen = pool.length > 0
      ? pool[Math.floor(Math.random() * pool.length)]
      : CONSUMABLES[Math.floor(Math.random() * CONSUMABLES.length)];

    return { ...chosen };
  }
}
