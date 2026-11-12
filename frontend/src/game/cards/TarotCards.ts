import { Card, type CardRarity, type CardType } from './Card';
import type { CacapaPoolEngine } from '../engine/CacapaPoolEngine';
import {
  GoldBallEnhancement,
  LuckyBallEnhancement,
  SilverBallEnhancement,
  FuzzyBallEnhancement,
} from '../enhancements/BallEnhancement';

export class EmpressTarot extends Card {
  readonly id = 'tarot_empress';
  readonly name = 'A Imperatriz';
  readonly description = 'Transforma 2 bolas em Bolas Douradas (+$4 ao encaçapar).';
  readonly rarity: CardRarity = 'Comum';
  readonly cost = 3;
  readonly icon = '👑';
  readonly type: CardType = 'Tarot';

  onUse(engine: unknown): { success: boolean; message: string } {
    const e = engine as CacapaPoolEngine;
    const candidates = e.balls.filter((b) => !b.isCue && !b.isPocketed && !b.enhancement);
    if (candidates.length === 0) {
      return { success: false, message: 'Nenhuma bola comum disponível para aprimorar.' };
    }

    const count = Math.min(2, candidates.length);
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * candidates.length);
      const chosen = candidates[idx];
      chosen.enhancement = new GoldBallEnhancement();
      chosen.color = '#fbbf24';
      chosen.isDirty = true;
      e.ballDeck.set(chosen.number, chosen.enhancement);
      const deckBall = e.deck?.find((b) => b.number === chosen.number);
      if (deckBall) {
        deckBall.enhancement = {
          id: 'gold',
          name: 'Bola Dourada',
          icon: '🟡',
          description: '+$4 quando encaçapada',
          color: '#fbbf24',
          cost: 4,
        };
      }
      e.syncDeckToEngine?.();
      candidates.splice(idx, 1);
    }
    return { success: true, message: `${count} bolas foram aprimoradas para Douradas!` };
  }
}

export class MagicianTarot extends Card {
  readonly id = 'tarot_magician';
  readonly name = 'O Mago';
  readonly description = 'Transforma 2 bolas em Bolas da Sorte (chance de +25 Mult ou +$10).';
  readonly rarity: CardRarity = 'Comum';
  readonly cost = 4;
  readonly icon = '✨';
  readonly type: CardType = 'Tarot';

  onUse(engine: unknown): { success: boolean; message: string } {
    const e = engine as CacapaPoolEngine;
    const candidates = e.balls.filter((b) => !b.isCue && !b.isPocketed && !b.enhancement);
    if (candidates.length === 0) {
      return { success: false, message: 'Nenhuma bola comum disponível para encantar.' };
    }

    const count = Math.min(2, candidates.length);
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * candidates.length);
      const chosen = candidates[idx];
      chosen.enhancement = new LuckyBallEnhancement();
      e.ballDeck.set(chosen.number, chosen.enhancement);
      candidates.splice(idx, 1);
    }
    return { success: true, message: `${count} bolas encantadas com a Sorte!` };
  }
}

export class ChariotTarot extends Card {
  readonly id = 'tarot_chariot';
  readonly name = 'O Carro';
  readonly description = 'Transforma 1 bola em Bola de Prata (+60 Fichas e ×1.5 Mult).';
  readonly rarity: CardRarity = 'Incomum';
  readonly cost = 4;
  readonly icon = '🛡️';
  readonly type: CardType = 'Tarot';

  onUse(engine: unknown): { success: boolean; message: string } {
    const e = engine as CacapaPoolEngine;
    const candidates = e.balls.filter((b) => !b.isCue && !b.isPocketed && b.enhancement?.id !== 'silver');
    if (candidates.length === 0) {
      return { success: false, message: 'Nenhuma bola disponível.' };
    }

    const idx = Math.floor(Math.random() * candidates.length);
    const chosen = candidates[idx];
    chosen.enhancement = new SilverBallEnhancement();
    e.ballDeck.set(chosen.number, chosen.enhancement);

    return { success: true, message: `Bola #${chosen.number} agora é Bola de Prata!` };
  }
}

export class FuzzyTarot extends Card {
  readonly id = 'tarot_fuzzy';
  readonly name = 'A Besta Felpuda';
  readonly description = 'Transforma 1 bola em Bola Peluda (conta como Lisa/Listrada e dobra tabelas)!';
  readonly rarity: CardRarity = 'Incomum';
  readonly cost = 4;
  readonly icon = '🧶';
  readonly type: CardType = 'Tarot';

  onUse(engine: unknown): { success: boolean; message: string } {
    const e = engine as CacapaPoolEngine;
    const candidates = e.balls.filter((b) => !b.isCue && !b.isPocketed && b.enhancement?.id !== 'fuzzy');
    if (candidates.length === 0) {
      return { success: false, message: 'Nenhuma bola disponível.' };
    }

    const idx = Math.floor(Math.random() * candidates.length);
    const chosen = candidates[idx];
    chosen.enhancement = new FuzzyBallEnhancement();
    e.ballDeck.set(chosen.number, chosen.enhancement);

    return { success: true, message: `Bola #${chosen.number} agora é uma Bola Peluda!` };
  }
}

export class HermitTarot extends Card {
  readonly id = 'tarot_hermit';
  readonly name = 'O Eremita';
  readonly description = 'Dobra o dinheiro atual (ganho máximo de até +$15).';
  readonly rarity: CardRarity = 'Incomum';
  readonly cost = 4;
  readonly icon = '🕯️';
  readonly type: CardType = 'Tarot';

  onUse(engine: unknown): { success: boolean; message: string } {
    const e = engine as CacapaPoolEngine;
    const gain = Math.min(15, Math.max(3, e.money));
    e.money += gain;
    return { success: true, message: `Ganhou +$${gain} de dinheiro!` };
  }
}

export class FoolTarot extends Card {
  readonly id = 'tarot_fool';
  readonly name = 'O Louco';
  readonly description = 'Adiciona +2 tacadas extras para a rodada atual.';
  readonly rarity: CardRarity = 'Incomum';
  readonly cost = 4;
  readonly icon = '🃏';
  readonly type: CardType = 'Tarot';

  onUse(engine: unknown): { success: boolean; message: string } {
    const e = engine as CacapaPoolEngine;
    e.shotsRemaining += 2;
    return { success: true, message: '+2 Tacadas extras concedidas!' };
  }
}

export class WheelOfFortuneTarot extends Card {
  readonly id = 'tarot_wheel';
  readonly name = 'Roda da Fortuna';
  readonly description = '50% de chance de dar Foil (+50 Fichas) ou Holo (+10 Mult) a um Coringa.';
  readonly rarity: CardRarity = 'Incomum';
  readonly cost = 4;
  readonly icon = '🎡';
  readonly type: CardType = 'Tarot';

  onUse(engine: unknown): { success: boolean; message: string } {
    const e = engine as CacapaPoolEngine;
    const eligibleJokers = e.ownedJokers.filter((j) => j.edition === 'Base');
    if (eligibleJokers.length === 0) {
      return { success: false, message: 'Todos os seus coringas já possuem edições especiais!' };
    }

    const success = Math.random() < 0.5;
    if (!success) {
      return { success: true, message: 'Nada aconteceu... A sorte não sorriu desta vez.' };
    }

    const target = eligibleJokers[Math.floor(Math.random() * eligibleJokers.length)];
    const edition = Math.random() < 0.6 ? 'Foil' : 'Holográfico';
    target.edition = edition;
    return { success: true, message: `Sucesso! ${target.name} agora é ${edition}!` };
  }
}
