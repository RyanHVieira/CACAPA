export interface CueInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
  effectLabel: string;
  unlockCondition: string;
  defaultUnlocked?: boolean;
}

export const CUES: CueInfo[] = [
  {
    id: 'iniciante',
    name: 'Taco Iniciante',
    icon: '🪵',
    description: 'O taco clássico de madeira do salão. Confiável e balanceado.',
    effectLabel: '+1 tacada por mesa',
    unlockCondition: 'Taco padrão liberado no início do jogo.',
    defaultUnlocked: true,
  },
  {
    id: 'maua',
    name: 'Taco de Mauá',
    icon: '🎯',
    description: 'Feito com o lendário giz de Mauá. Revela a reação e direção exata da bola atingida.',
    effectLabel: 'Mostra o efeito e direção que a bola causa na outra',
    unlockCondition: 'Liberado desde o início.',
    defaultUnlocked: true,
  },
  {
    id: 'forte',
    name: 'Taco Forte',
    icon: '💥',
    description: 'Pau-ferro reforçado com chumbo na ponteira.',
    effectLabel: '+20% de força máxima em todas as tacadas',
    unlockCondition: 'Chegue até a Mesa 5 em uma partida.',
    defaultUnlocked: false,
  },
  {
    id: 'magnata',
    name: 'Taco Magnata',
    icon: '💰',
    description: 'Madeira nobre banhada a ouro para quem sabe negociar.',
    effectLabel: 'Cada tacada que sobra na blind vale o dobro (+$2 cada)',
    unlockCondition: 'Acumule 50 moedas em alguma partida.',
    defaultUnlocked: false,
  },
  {
    id: 'gelo',
    name: 'Taco de Gelo',
    icon: '❄️',
    description: 'Frio ao toque. Congela o atrito do feltro verde.',
    effectLabel: 'As bolas deslizam muito mais pela mesa (fricção reduzida)',
    unlockCondition: 'Encaçape 3 bolas em uma única tacada.',
    defaultUnlocked: false,
  },
  {
    id: 'paciente',
    name: 'Taco Paciente',
    icon: '🧘',
    description: 'Equilíbrio impecável que reduz o estresse da mira.',
    effectLabel: 'A barra de carregar força oscila mais devagar para controle fino',
    unlockCondition: 'Taco padrão liberado para jogadores metódicos.',
    defaultUnlocked: true,
  },
  {
    id: 'trapaceiro',
    name: 'Taco do Trapaceiro',
    icon: '🃏',
    description: 'Um taco com marcas de baralho marcado escondidas sob o verniz.',
    effectLabel: 'Permite até 8 faltas antes do Game Over',
    unlockCondition: 'Liberado após perder uma partida por limite de faltas.',
    defaultUnlocked: false,
  },
];

const STORAGE_KEY_UNLOCKED_CUES = 'cacapa_unlocked_cues';
const STORAGE_KEY_SELECTED_CUE = 'cacapa_selected_cue';
const STORAGE_KEY_HIGHEST_STAGE = 'cacapa_highest_stage';

export class CueManager {
  static getHighestStageReached(): number {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_HIGHEST_STAGE);
      if (stored !== null) {
        const val = parseInt(stored, 10);
        if (!isNaN(val) && val >= 0) return val;
      }
    } catch {}
    return 0;
  }

  static recordStageReached(tableIndex: number): void {
    try {
      const highest = this.getHighestStageReached();
      if (tableIndex > highest) {
        localStorage.setItem(STORAGE_KEY_HIGHEST_STAGE, tableIndex.toString());
      }
      // Se alcançou Mesa 5 (índice 4 ou superior), desbloqueia o Taco Forte
      if (tableIndex >= 4) {
        this.unlockCue('forte');
      }
    } catch {}
  }
  static getUnlockedCueIds(): Set<string> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_UNLOCKED_CUES);
      const set = new Set<string>();
      // Cues liberados por padrão
      CUES.filter((c) => c.defaultUnlocked).forEach((c) => set.add(c.id));
      if (stored) {
        const parsed: string[] = JSON.parse(stored);
        parsed.forEach((id) => set.add(id));
      }
      return set;
    } catch {
      return new Set(['iniciante', 'maua', 'paciente']);
    }
  }

  static isCueUnlocked(id: string): boolean {
    return this.getUnlockedCueIds().has(id);
  }

  static unlockCue(id: string): boolean {
    const unlocked = this.getUnlockedCueIds();
    if (!unlocked.has(id)) {
      unlocked.add(id);
      try {
        localStorage.setItem(STORAGE_KEY_UNLOCKED_CUES, JSON.stringify([...unlocked]));
      } catch {}
      return true;
    }
    return false;
  }

  static unlockAllCues(): void {
    const allIds = CUES.map((c) => c.id);
    try {
      localStorage.setItem(STORAGE_KEY_UNLOCKED_CUES, JSON.stringify(allIds));
    } catch {}
  }

  static getSelectedCueId(): string {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SELECTED_CUE);
      if (stored && this.isCueUnlocked(stored)) {
        return stored;
      }
    } catch {}
    return 'iniciante';
  }

  static setSelectedCueId(id: string): void {
    try {
      localStorage.setItem(STORAGE_KEY_SELECTED_CUE, id);
    } catch {}
  }

  static getCue(id: string): CueInfo {
    return CUES.find((c) => c.id === id) || CUES[0];
  }
}
