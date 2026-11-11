import { Card } from '../cards/Card';
import { CacapaJokerCard } from '../cards/CacapaJokerCard';
import {
  J,
  JE,
  BMOD,
  TQ,
  BOSS,
  type CueDef,
} from '../config/gameConfig';

export type BallModRarity = 'Comum' | 'Incomum' | 'Rara' | 'Lendária';

export interface ShopBallModOffer {
  id: string;
  name: string;
  ballNumber: number;
  isStripe: boolean;
  description: string;
  cost: number;
  color: string;
  icon: string;
  popText: string;
  hasEnhancement: boolean;
  rarity?: BallModRarity;
}

export interface ShopBallOffer {
  id: string;
  ballNumber: number;
  isStripe: boolean;
  hasEnhancement: boolean;
  rarity?: BallModRarity;
  enhancement: {
    id: string;
    name: string;
    icon: string;
    description: string;
    color: string;
    cost: number;
    rarity?: BallModRarity;
  } | null;
  price: number;
}

export class ShopManager {
  public cardStock: (CacapaJokerCard | null)[] = [];
  public ballModStock: (ShopBallModOffer | null)[] = [];
  public cueStock: (CueDef | null)[] = [];

  public rerollsCount: number = 0;
  public rerollsCountShop2: number = 0;
  public isTacoShopOpen: boolean = false;

  get ballStock(): (ShopBallOffer | null)[] {
    return this.ballModStock.map((m) =>
      m
        ? {
            id: m.id,
            ballNumber: m.ballNumber,
            isStripe: m.isStripe,
            hasEnhancement: m.hasEnhancement,
            rarity: m.rarity,
            enhancement: m.hasEnhancement
              ? {
                  id: m.id,
                  name: m.name,
                  icon: m.icon,
                  description: m.description,
                  color: m.color,
                  cost: m.cost,
                  rarity: m.rarity,
                }
              : null,
            price: m.cost,
          }
        : null
    );
  }

  get currentRerollCost(): number {
    return 2 + this.rerollsCount;
  }

  get currentShop2RerollCost(): number {
    return 3 + this.rerollsCountShop2;
  }

  public generateStock(table: number, ownedJokers: Card[]): void {
    this.rerollsCount = 0;
    this.generateJokers(table, ownedJokers);
    this.generateBallModStock();
  }

  public generateJokers(table: number, ownedJokers: Card[]): void {
    const ownedIds = new Set(ownedJokers.map((j) => j.id));
    const rs = () => Math.random() - 0.5;

    const commonAvailable = J.filter((j) => !ownedIds.has(j.id)).sort(rs);
    const chosen = commonAvailable.slice(0, 3).map((def) => new CacapaJokerCard(def));

    const legCount = ownedJokers.filter((j) => (j as CacapaJokerCard).isLegendary).length;
    const legAvailable = JE.filter((j) => !ownedIds.has(j.id)).sort(rs);

    if (table >= BOSS[0] && legAvailable.length > 0 && legCount < 2) {
      const isBossTable = BOSS.includes(table);
      const slotsToReplace = Math.min(
        2 - legCount,
        isBossTable
          ? Math.random() < 0.4 ? 2 : 1
          : Math.random() < 0.35 ? 1 : 0
      );

      for (let i = 0; i < slotsToReplace && i < legAvailable.length; i++) {
        chosen[i] = new CacapaJokerCard(legAvailable[i]);
      }
    }

    this.cardStock = chosen;
  }

  public generateBallModStock(_existingBallMods?: Record<number, string>): void {
    const offers: ShopBallModOffer[] = [];

    for (let i = 0; i < 3; i++) {
      // Chances iguais de vir qualquer número de 1 a 12
      const ballNum = Math.floor(Math.random() * 12) + 1;
      // 50% de chance de vir com ou sem listra
      const isStripe = Math.random() < 0.5;
      // Chance de só 10% de vir com modificador
      const hasEnhancement = Math.random() < 0.10;

      if (hasEnhancement) {
        // Modificador com raridades: Comum 60%, Incomum 28%, Rara 10%, Lendária 2%
        const rRoll = Math.random();
        let targetRarity: BallModRarity;
        if (rRoll < 0.60) {
          targetRarity = 'Comum';
        } else if (rRoll < 0.88) {
          targetRarity = 'Incomum';
        } else if (rRoll < 0.98) {
          targetRarity = 'Rara';
        } else {
          targetRarity = 'Lendária';
        }

        const pool = BMOD.filter((m) => m.rarity === targetRarity);
        const m = pool.length > 0
          ? pool[Math.floor(Math.random() * pool.length)]
          : BMOD[Math.floor(Math.random() * BMOD.length)];

        offers.push({
          id: m.id,
          name: m.name,
          ballNumber: ballNum,
          isStripe,
          hasEnhancement: true,
          rarity: m.rarity,
          description: `Só na bola ${ballNum}: ${m.description}`,
          cost: m.cost,
          color: m.color,
          icon: m.icon,
          popText: m.popText,
        });
      } else {
        // Bola normal sem modificador (90% das vezes)
        offers.push({
          id: `normal-${ballNum}-${i}`,
          name: 'Bola Normal',
          ballNumber: ballNum,
          isStripe,
          hasEnhancement: false,
          rarity: 'Comum',
          description: `Bola #${ballNum} (${isStripe ? 'Listrada' : 'Lisa'}) comum sem modificador para seu deck.`,
          cost: 2,
          color: '#9fb4a8',
          icon: '',
          popText: `BOLA #${ballNum}`,
        });
      }
    }

    this.ballModStock = offers;
  }

  public generateCueStock(currentCueId: string | null): void {
    const availableCues = TQ.filter((q) => q.id !== currentCueId).sort(() => Math.random() - 0.5);
    this.cueStock = availableCues.slice(0, 3);
  }

  public shouldOpenTacoShop(table: number): boolean {
    return table >= 4 && (table === 4 || Math.random() < 0.35);
  }

  public shouldOpenBallModShop(_table: number): boolean {
    return true;
  }

  public rerollJokers(
    table: number,
    ownedJokers: Card[],
    playerMoney: number
  ): { success: boolean; cost: number; message: string } {
    const cost = this.currentRerollCost;
    if (playerMoney < cost) {
      return { success: false, cost: 0, message: `Dinheiro insuficiente para trocar ($${cost})!` };
    }
    this.rerollsCount++;
    this.generateJokers(table, ownedJokers);
    return { success: true, cost, message: 'Loja de curingas atualizada!' };
  }

  public rerollBallMods(
    existingBallMods: Record<number, string>,
    playerMoney: number
  ): { success: boolean; cost: number; message: string } {
    const cost = this.currentShop2RerollCost;
    if (playerMoney < cost) {
      return { success: false, cost: 0, message: `Dinheiro insuficiente para trocar ($${cost})!` };
    }
    this.rerollsCountShop2++;
    this.generateBallModStock(existingBallMods);
    return { success: true, cost, message: 'Oficina das bolas atualizada!' };
  }

  public buyCard(
    cardIndex: number,
    playerMoney: number,
    ownedJokers: Card[],
    _ownedConsumables: Card[],
    maxJokers: number = 5
  ): { success: boolean; card?: Card; cost: number; message: string } {
    if (cardIndex < 0 || cardIndex >= this.cardStock.length) {
      return { success: false, cost: 0, message: 'Carta inválida.' };
    }

    const card = this.cardStock[cardIndex];
    if (!card) {
      return { success: false, cost: 0, message: 'Item já comprado!' };
    }

    if (playerMoney < card.cost) {
      return { success: false, cost: 0, message: 'Dinheiro insuficiente!' };
    }

    if (ownedJokers.length >= maxJokers) {
      return { success: false, cost: 0, message: 'Seus 5 espaços de curinga estão cheios!' };
    }

    const isLegend = (card as CacapaJokerCard).isLegendary;
    const currentLegendCount = ownedJokers.filter((j) => (j as CacapaJokerCard).isLegendary).length;
    if (isLegend && currentLegendCount >= 2) {
      return { success: false, cost: 0, message: 'Limite máximo de 2 Coringas Lendários atingido!' };
    }

    this.cardStock[cardIndex] = null;
    return {
      success: true,
      card,
      cost: card.cost,
      message: `${card.name} comprado com sucesso!`,
    };
  }

  public buyBallMod(
    modIndex: number,
    playerMoney: number
  ): { success: boolean; offer?: ShopBallModOffer; cost: number; message: string } {
    if (modIndex < 0 || modIndex >= this.ballModStock.length) {
      return { success: false, cost: 0, message: 'Modificação inválida.' };
    }

    const offer = this.ballModStock[modIndex];
    if (!offer) {
      return { success: false, cost: 0, message: 'Item já comprado!' };
    }

    if (playerMoney < offer.cost) {
      return { success: false, cost: 0, message: 'Dinheiro insuficiente!' };
    }

    this.ballModStock[modIndex] = null;
    return {
      success: true,
      offer,
      cost: offer.cost,
      message: `${offer.name} aplicada na bola #${offer.ballNumber}!`,
    };
  }

  public buyCue(
    cueIndex: number,
    playerMoney: number
  ): { success: boolean; cue?: CueDef; cost: number; message: string } {
    if (cueIndex < 0 || cueIndex >= this.cueStock.length) {
      return { success: false, cost: 0, message: 'Taco inválido.' };
    }

    const cue = this.cueStock[cueIndex];
    if (!cue) {
      return { success: false, cost: 0, message: 'Item já comprado!' };
    }

    if (playerMoney < cue.cost) {
      return { success: false, cost: 0, message: 'Dinheiro insuficiente!' };
    }

    this.cueStock[cueIndex] = null;
    return {
      success: true,
      cue,
      cost: cue.cost,
      message: `${cue.name} adquirido!`,
    };
  }
}
