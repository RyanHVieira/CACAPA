import { Card, type CardEdition, type CardRarity, type CardType } from './Card';
import { type JokerDef } from '../config/gameConfig';

export class CacapaJokerCard extends Card {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly rarity: CardRarity;
  public readonly cost: number;
  public readonly icon: string;
  public readonly type: CardType = 'Joker';
  public readonly color: string;
  public readonly isLegendary: boolean;
  public isLocked: boolean = false;

  constructor(def: JokerDef, edition: CardEdition = 'Base') {
    super(edition);
    this.id = def.id;
    this.name = def.name;
    this.description = def.description;
    this.color = def.color;
    this.cost = def.cost;
    this.isLegendary = !!def.isLegendary;
    this.rarity = this.isLegendary ? 'Lendária' : 'Comum';

        const iconMap: Record<string, string> = {
      tab: '↗',
      giz: '🟦',
      dob: '×2',
      b8: '🎱',
      mao: '🎯',
      bnk: '🏦',
      pri: '1️⃣',
      tri: '×3',
      lis: '🪄',
      cof: '🐷',
      qui: '📐',
      lat: '↔️',
      par: '⚖️',
      lsd: '💈',
      rel: '⏱️',
      fax: '🧹',
      sabor: '👅',
      rei: '👑',
      mid: '💰',
      cho: '🌧️',
      inf: '♾️',
      cmb: '⚡',
      sup: '💥',
      cer: '🛡️',
      bcc: '🏛️',
      nec: '👁️',
      aln: '🎰',
    };
    this.icon = iconMap[def.id] || '🃏';

        if (def.sellValue !== undefined) {
      this.sellPrice = def.sellValue;
    } else {
      this.sellPrice = Math.max(1, Math.floor(def.cost * 0.75));
    }
  }
}
