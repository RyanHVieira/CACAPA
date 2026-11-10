import { Ball } from '../models/Ball';
import type { Pocket } from '../models/Table';

export type CardRarity = 'Comum' | 'Incomum' | 'Rara' | 'Lendária';
export type CardType = 'Joker' | 'Tarot';
export type CardEdition = 'Base' | 'Foil' | 'Holográfico' | 'Policromático';

export interface TriggerResult {
  cardId: string;
  cardName: string;
  type: 'chips' | 'mult' | 'xmult' | 'money' | 'shots' | 'custom';
  value: number;
  message: string;
}

export interface ShotContext {
  pocketedBalls: { ball: Ball; pocket: Pocket }[];
  cushionHits: number;
  cueFirstHitBall: Ball | null;
  scratch: boolean;
  shotsRemaining: number;
  money: number;
  activeBalls: Ball[];
  maxVelocity: number;
  ballsRemaining?: number;
  pocketsInShot?: number;
}

export interface ScoreContext {
  handName: string;
  baseChips: number;
  baseMult: number;
  currentChips: number;
  currentMult: number;
  shot: ShotContext;
}

export abstract class Card {
  public abstract readonly id: string;
  public abstract readonly name: string;
  public abstract readonly description: string;
  public abstract readonly rarity: CardRarity;
  public abstract readonly cost: number;
  public abstract readonly icon: string;
  public abstract readonly type: CardType;

  public sellPrice: number = 2;
  public timesTriggered: number = 0;
  public edition: CardEdition = 'Base';

  constructor(edition: CardEdition = 'Base') {
    this.edition = edition;
  }

  // Hook for when a shot is completed and scoring is calculated
  public onScoreEval(_ctx: ScoreContext): TriggerResult[] {
    return [];
  }

  // Hook for each individual ball that gets pocketed
  public onBallPocketed(_ball: Ball, _pocket: Pocket, _ctx: ShotContext): TriggerResult[] {
    return [];
  }

  // Hook for round cashout / end of round
  public onRoundEnd(_ctx: { money: number; shotsRemaining: number }): TriggerResult[] {
    return [];
  }

  // Consumable usage (for Tarots)
  public onUse?(_engine: unknown): { success: boolean; message: string };

  // Calculate bonus from special edition (Foil / Holo / Poly)
  protected getEditionTriggers(): TriggerResult[] {
    const results: TriggerResult[] = [];
    if (this.edition === 'Foil') {
      results.push({
        cardId: this.id,
        cardName: this.name,
        type: 'chips',
        value: 50,
        message: '+50 Fichas (Foil)',
      });
    } else if (this.edition === 'Holográfico') {
      results.push({
        cardId: this.id,
        cardName: this.name,
        type: 'mult',
        value: 10,
        message: '+10 Mult (Holo)',
      });
    } else if (this.edition === 'Policromático') {
      results.push({
        cardId: this.id,
        cardName: this.name,
        type: 'xmult',
        value: 1.5,
        message: '×1.5 Mult (Poli)',
      });
    }
    return results;
  }

  public getRarityColor(): string {
    switch (this.rarity) {
      case 'Comum':
        return '#3b82f6'; // Blue
      case 'Incomum':
        return '#10b981'; // Emerald
      case 'Rara':
        return '#ef4444'; // Ruby Red
      case 'Lendária':
        return '#a855f7'; // Purple
      default:
        return '#64748b';
    }
  }
}
