import {
  Card,
  type CardEdition,
  type CardRarity,
  type CardType,
  type ScoreContext,
  type ShotContext,
  type TriggerResult,
} from './Card';
import { Ball } from '../models/Ball';
import type { Pocket } from '../models/Table';

export class BlueChalkJoker extends Card {
  readonly id = 'blue_chalk';
  readonly name = 'Giz Azul';
  readonly description = '+30 Fichas por cada tabela na tacada (se encaçapar).';
  readonly rarity: CardRarity = 'Comum';
  readonly cost = 4;
  readonly icon = '🟦';
  readonly type: CardType = 'Joker';

  constructor(edition: CardEdition = 'Base') {
    super(edition);
    this.sellPrice = 2;
  }

  onScoreEval(ctx: ScoreContext): TriggerResult[] {
    const triggers = [...this.getEditionTriggers()];
    if (ctx.shot.pocketedBalls.length > 0 && ctx.shot.cushionHits > 0) {
      const chips = ctx.shot.cushionHits * 30;
      triggers.push({
        cardId: this.id,
        cardName: this.name,
        type: 'chips',
        value: chips,
        message: `+${chips} Fichas (${ctx.shot.cushionHits}x Tabela)`,
      });
      this.timesTriggered++;
    }
    return triggers;
  }
}

export class GroselhaJoker extends Card {
  readonly id = 'groselha_joker';
  readonly name = 'Coringa Groselha';
  readonly description = '+4 Mult para cada bola encaçapada na tacada.';
  readonly rarity: CardRarity = 'Comum';
  readonly cost = 4;
  readonly icon = '🍒';
  readonly type: CardType = 'Joker';

  constructor(edition: CardEdition = 'Base') {
    super(edition);
    this.sellPrice = 2;
  }

  onScoreEval(ctx: ScoreContext): TriggerResult[] {
    const triggers = [...this.getEditionTriggers()];
    const count = ctx.shot.pocketedBalls.length;
    if (count > 0) {
      const multVal = count * 4;
      triggers.push({
        cardId: this.id,
        cardName: this.name,
        type: 'mult',
        value: multVal,
        message: `+${multVal} Mult (${count} bolas)`,
      });
      this.timesTriggered++;
    }
    return triggers;
  }
}

export class BilliardJoker extends Card {
  readonly id = 'billiard_joker';
  readonly name = 'Saco de Fichas';
  readonly description = '+45 Fichas fixas em todas as tacadas que pontuarem.';
  readonly rarity: CardRarity = 'Comum';
  readonly cost = 3;
  readonly icon = '🎱';
  readonly type: CardType = 'Joker';

  constructor(edition: CardEdition = 'Base') {
    super(edition);
    this.sellPrice = 2;
  }

  onScoreEval(ctx: ScoreContext): TriggerResult[] {
    const triggers = [...this.getEditionTriggers()];
    if (ctx.shot.pocketedBalls.length > 0) {
      triggers.push({
        cardId: this.id,
        cardName: this.name,
        type: 'chips',
        value: 45,
        message: '+45 Fichas',
      });
      this.timesTriggered++;
    }
    return triggers;
  }
}

export class JollyJoker extends Card {
  readonly id = 'jolly_joker';
  readonly name = 'Coringa Fiel';
  readonly description = '+8 Mult fixo em qualquer tacada com caçapa.';
  readonly rarity: CardRarity = 'Comum';
  readonly cost = 4;
  readonly icon = '🃏';
  readonly type: CardType = 'Joker';

  constructor(edition: CardEdition = 'Base') {
    super(edition);
    this.sellPrice = 2;
  }

  onScoreEval(ctx: ScoreContext): TriggerResult[] {
    const triggers = [...this.getEditionTriggers()];
    if (ctx.shot.pocketedBalls.length > 0) {
      triggers.push({
        cardId: this.id,
        cardName: this.name,
        type: 'mult',
        value: 8,
        message: '+8 Mult',
      });
      this.timesTriggered++;
    }
    return triggers;
  }
}

export class LuckyEightJoker extends Card {
  readonly id = 'lucky_eight';
  readonly name = 'Oito da Sorte';
  readonly description = '+20 Mult se acertar ou encaçapar a bola 8!';
  readonly rarity: CardRarity = 'Incomum';
  readonly cost = 6;
  readonly icon = '🔮';
  readonly type: CardType = 'Joker';

  constructor(edition: CardEdition = 'Base') {
    super(edition);
    this.sellPrice = 3;
  }

  onScoreEval(ctx: ScoreContext): TriggerResult[] {
    const triggers = [...this.getEditionTriggers()];
    const hitEight = ctx.shot.cueFirstHitBall?.number === 8;
    const pocketedEight = ctx.shot.pocketedBalls.some((p) => p.ball.number === 8);

    if (hitEight || pocketedEight) {
      triggers.push({
        cardId: this.id,
        cardName: this.name,
        type: 'mult',
        value: 20,
        message: '+20 Mult (Bola 8!)',
      });
      this.timesTriggered++;
    }
    return triggers;
  }
}

export class TelescopeJoker extends Card {
  readonly id = 'telescope';
  readonly name = 'Mira Laser';
  readonly description = 'Linha de mira mais longa e +35 Fichas.';
  readonly rarity: CardRarity = 'Comum';
  readonly cost = 5;
  readonly icon = '🔭';
  readonly type: CardType = 'Joker';

  constructor(edition: CardEdition = 'Base') {
    super(edition);
    this.sellPrice = 2;
  }

  onScoreEval(ctx: ScoreContext): TriggerResult[] {
    const triggers = [...this.getEditionTriggers()];
    if (ctx.shot.pocketedBalls.length > 0) {
      triggers.push({
        cardId: this.id,
        cardName: this.name,
        type: 'chips',
        value: 35,
        message: '+35 Fichas (Laser)',
      });
      this.timesTriggered++;
    }
    return triggers;
  }
}

export class GoldenPocketJoker extends Card {
  readonly id = 'golden_pocket';
  readonly name = 'Caçapa de Ouro';
  readonly description = 'Ganhe +$2 ao encaçapar em caçapas do meio.';
  readonly rarity: CardRarity = 'Incomum';
  readonly cost = 6;
  readonly icon = '💰';
  readonly type: CardType = 'Joker';

  constructor(edition: CardEdition = 'Base') {
    super(edition);
    this.sellPrice = 3;
  }

  onBallPocketed(ball: Ball, pocket: Pocket, _ctx: ShotContext): TriggerResult[] {
    if (pocket.isSide && !ball.isCue) {
      this.timesTriggered++;
      return [
        {
          cardId: this.id,
          cardName: this.name,
          type: 'money',
          value: 2,
          message: '+$2 (Caçapa Lateral)',
        },
      ];
    }
    return [];
  }
}

export class BaronJoker extends Card {
  readonly id = 'baron_joker';
  readonly name = 'Barão do Feltro';
  readonly description = '×1.5 Mult se a pontuação base ultrapassar 100.';
  readonly rarity: CardRarity = 'Rara';
  readonly cost = 8;
  readonly icon = '👑';
  readonly type: CardType = 'Joker';

  constructor(edition: CardEdition = 'Base') {
    super(edition);
    this.sellPrice = 4;
  }

  onScoreEval(ctx: ScoreContext): TriggerResult[] {
    const triggers = [...this.getEditionTriggers()];
    if (ctx.currentChips >= 100) {
      triggers.push({
        cardId: this.id,
        cardName: this.name,
        type: 'xmult',
        value: 1.5,
        message: '×1.5 Mult (Barão)',
      });
      this.timesTriggered++;
    }
    return triggers;
  }
}

export class DuetJoker extends Card {
  readonly id = 'duet_joker';
  readonly name = 'Dueto Perfeito';
  readonly description = 'Se encaçapar exatamente 2 bolas na mesma tacada, ganhe ×2.0 Mult!';
  readonly rarity: CardRarity = 'Rara';
  readonly cost = 7;
  readonly icon = '✌️';
  readonly type: CardType = 'Joker';

  constructor(edition: CardEdition = 'Base') {
    super(edition);
    this.sellPrice = 3;
  }

  onScoreEval(ctx: ScoreContext): TriggerResult[] {
    const triggers = [...this.getEditionTriggers()];
    if (ctx.shot.pocketedBalls.length === 2) {
      triggers.push({
        cardId: this.id,
        cardName: this.name,
        type: 'xmult',
        value: 2.0,
        message: '×2.0 Mult (Dueto Exato!)',
      });
      this.timesTriggered++;
    }
    return triggers;
  }
}

export class BullJoker extends Card {
  readonly id = 'bull_joker';
  readonly name = 'Touro Financeiro';
  readonly description = '+2 Fichas para cada $1 que você possui no banco.';
  readonly rarity: CardRarity = 'Incomum';
  readonly cost = 6;
  readonly icon = '🐂';
  readonly type: CardType = 'Joker';

  constructor(edition: CardEdition = 'Base') {
    super(edition);
    this.sellPrice = 3;
  }

  onScoreEval(ctx: ScoreContext): TriggerResult[] {
    const triggers = [...this.getEditionTriggers()];
    if (ctx.shot.pocketedBalls.length > 0 && ctx.shot.money > 0) {
      const chips = ctx.shot.money * 2;
      triggers.push({
        cardId: this.id,
        cardName: this.name,
        type: 'chips',
        value: chips,
        message: `+${chips} Fichas ($${ctx.shot.money})`,
      });
      this.timesTriggered++;
    }
    return triggers;
  }
}

export class SolidSteelJoker extends Card {
  readonly id = 'solid_steel';
  readonly name = 'Lisas de Aço';
  readonly description = '+35 Fichas para cada bola lisa (1-7) encaçapada.';
  readonly rarity: CardRarity = 'Comum';
  readonly cost = 4;
  readonly icon = '🟡';
  readonly type: CardType = 'Joker';

  constructor(edition: CardEdition = 'Base') {
    super(edition);
    this.sellPrice = 2;
  }

  onScoreEval(ctx: ScoreContext): TriggerResult[] {
    const triggers = [...this.getEditionTriggers()];
    const solids = ctx.shot.pocketedBalls.filter((p) => p.ball.isSolid).length;
    if (solids > 0) {
      const bonus = solids * 35;
      triggers.push({
        cardId: this.id,
        cardName: this.name,
        type: 'chips',
        value: bonus,
        message: `+${bonus} Fichas (${solids}x Lisas)`,
      });
      this.timesTriggered++;
    }
    return triggers;
  }
}

export class BurningStripesJoker extends Card {
  readonly id = 'burning_stripes';
  readonly name = 'Listradas em Chamas';
  readonly description = '+6 Mult para cada bola listrada (9-15) encaçapada.';
  readonly rarity: CardRarity = 'Incomum';
  readonly cost = 5;
  readonly icon = '🔥';
  readonly type: CardType = 'Joker';

  constructor(edition: CardEdition = 'Base') {
    super(edition);
    this.sellPrice = 2;
  }

  onScoreEval(ctx: ScoreContext): TriggerResult[] {
    const triggers = [...this.getEditionTriggers()];
    const stripes = ctx.shot.pocketedBalls.filter((p) => p.ball.isStripe).length;
    if (stripes > 0) {
      const bonus = stripes * 6;
      triggers.push({
        cardId: this.id,
        cardName: this.name,
        type: 'mult',
        value: bonus,
        message: `+${bonus} Mult (${stripes}x Listradas)`,
      });
      this.timesTriggered++;
    }
    return triggers;
  }
}

export class WizardCueJoker extends Card {
  readonly id = 'wizard_cue';
  readonly name = 'O Bruxo da Sinuca';
  readonly description = '×2.5 Mult se não cometer falta e encaçapar ao menos 1 bola.';
  readonly rarity: CardRarity = 'Lendária';
  readonly cost = 10;
  readonly icon = '🧙‍♂️';
  readonly type: CardType = 'Joker';

  constructor(edition: CardEdition = 'Base') {
    super(edition);
    this.sellPrice = 5;
  }

  onScoreEval(ctx: ScoreContext): TriggerResult[] {
    const triggers = [...this.getEditionTriggers()];
    if (!ctx.shot.scratch && ctx.shot.pocketedBalls.length > 0) {
      triggers.push({
        cardId: this.id,
        cardName: this.name,
        type: 'xmult',
        value: 2.5,
        message: '×2.5 Mult (Bruxo Lendário!)',
      });
      this.timesTriggered++;
    }
    return triggers;
  }
}

export class GoldDiggerJoker extends Card {
  readonly id = 'gold_digger';
  readonly name = 'Garimpeiro de Ouro';
  readonly description = 'Ao final da rodada, ganhe +$3 se sobrar 2 ou mais tacadas.';
  readonly rarity: CardRarity = 'Incomum';
  readonly cost = 6;
  readonly icon = '⛏️';
  readonly type: CardType = 'Joker';

  constructor(edition: CardEdition = 'Base') {
    super(edition);
    this.sellPrice = 3;
  }

  onRoundEnd(ctx: { money: number; shotsRemaining: number }): TriggerResult[] {
    if (ctx.shotsRemaining >= 2) {
      this.timesTriggered++;
      return [
        {
          cardId: this.id,
          cardName: this.name,
          type: 'money',
          value: 3,
          message: '+$3 Bônus de Tacadas',
        },
      ];
    }
    return [];
  }
}
