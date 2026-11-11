import type { Ball } from '../models/Ball';
import type { ShotContext } from '../cards/Card';

export interface BallTriggerResult {
  type: 'chips' | 'mult' | 'xmult' | 'money' | 'shots' | 'custom';
  value: number;
  message: string;
}

export abstract class BallEnhancement {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly icon: string;
  abstract readonly color: string;
  abstract readonly cost: number;
  readonly popupText?: string;

  abstract onPocketed(ball: Ball, context: ShotContext): BallTriggerResult[];

    abstract drawEffect(ctx: CanvasRenderingContext2D, ball: Ball): void;
}

export class GoldBallEnhancement extends BallEnhancement {
  readonly id = 'gold';
  readonly name = 'Bola Dourada';
  readonly description = 'Concede +$4 imediatamente ao ser encaçapada.';
  readonly icon = '🟡';
  readonly color = '#fbbf24';
  readonly cost = 4;
  readonly popupText = '+$4 OURO';

  onPocketed(_ball: Ball, _ctx: ShotContext): BallTriggerResult[] {
    return [{ type: 'money', value: 4, message: '+$4 (Bola Dourada)' }];
  }

  drawEffect(ctx: CanvasRenderingContext2D, ball: Ball): void {
    const r = ball.radius;
    ctx.beginPath();
    ctx.arc(0, 0, r + 3.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(r * 0.7, -r * 0.7, 1.8, 0, Math.PI * 2);
    ctx.arc(-r * 0.7, r * 0.7, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

export class LuckyBallEnhancement extends BallEnhancement {
  readonly id = 'lucky';
  readonly name = 'Bola da Sorte';
  readonly description = '1 em 4 chance de +25 Mult; 1 em 8 chance de ganhar +$10.';
  readonly icon = '🍀';
  readonly color = '#10b981';
  readonly cost = 5;

  onPocketed(_ball: Ball, _ctx: ShotContext): BallTriggerResult[] {
    const results: BallTriggerResult[] = [];
    const rollMult = Math.random() < 0.25;
    const rollMoney = Math.random() < 0.125;

    if (rollMult) results.push({ type: 'mult', value: 25, message: '+25 Mult (Sorte Grande!)' });
    if (rollMoney) results.push({ type: 'money', value: 10, message: '+$10 (Prêmio da Sorte!)' });
    if (!rollMult && !rollMoney) results.push({ type: 'chips', value: 15, message: '+15 Fichas (Sorte)' });

    return results;
  }

  drawEffect(ctx: CanvasRenderingContext2D, ball: Ball): void {
    const r = ball.radius;
    ctx.beginPath();
    ctx.arc(0, 0, r + 3, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.85)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🍀', r * 0.7, -r * 0.7);
  }
}

export class SilverBallEnhancement extends BallEnhancement {
  readonly id = 'silver';
  readonly name = 'Bola de Prata';
  readonly description = 'Concede +60 Fichas e ×1.5 Mult ao ser encaçapada.';
  readonly icon = '⚪';
  readonly color = '#e2e8f0';
  readonly cost = 5;

  onPocketed(_ball: Ball, _ctx: ShotContext): BallTriggerResult[] {
    return [
      { type: 'chips', value: 60, message: '+60 Fichas (Prata Maciça)' },
      { type: 'xmult', value: 1.5, message: '×1.5 Mult (Prata)' },
    ];
  }

  drawEffect(ctx: CanvasRenderingContext2D, ball: Ball): void {
    const r = ball.radius;
    ctx.beginPath();
    ctx.arc(0, 0, r + 3.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.9)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
}

export class PeludaBallEnhancement extends BallEnhancement {
  readonly id = 'pel';
  readonly name = 'Peluda';
  readonly description = '+6 Mult, mas freia 2,5× mais rápido na mesa.';
  readonly icon = 'P';
  readonly color = '#b5835a';
  readonly cost = 7;
  readonly popupText = 'PELUDA +6';

  onPocketed(_ball: Ball, _ctx: ShotContext): BallTriggerResult[] {
    return [{ type: 'mult', value: 6, message: '+6 Mult (Peluda)' }];
  }

  drawEffect(ctx: CanvasRenderingContext2D, ball: Ball): void {
    const r = ball.radius;
        ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0b0710';
    ctx.lineWidth = 3.6;
    for (let k = 0; k < 22; k++) {
      const a = k * 0.2856 + Math.sin(k * 7.3) * 0.08;
      const l = r + 3.5;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (r - 2), Math.sin(a) * (r - 2));
      ctx.lineTo(Math.cos(a) * l, Math.sin(a) * l);
      ctx.stroke();
    }
    ctx.strokeStyle = '#b5835a';
    ctx.lineWidth = 1.8;
    for (let k = 0; k < 22; k++) {
      const a = k * 0.2856 + Math.sin(k * 7.3) * 0.08;
      const l = r + 3.5;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (r - 2), Math.sin(a) * (r - 2));
      ctx.lineTo(Math.cos(a) * l, Math.sin(a) * l);
      ctx.stroke();
    }
    ctx.restore();
  }
}

export class SeisSeteBallEnhancement extends BallEnhancement {
  readonly id = '67';
  readonly name = 'Seis-Sete';
  readonly description = 'Vira número 67 e concede +67 Fichas ao encaçapar.';
  readonly icon = '7';
  readonly color = '#ff6a3d';
  readonly cost = 8;
  readonly popupText = '67! +67';

  onPocketed(_ball: Ball, _ctx: ShotContext): BallTriggerResult[] {
    return [{ type: 'chips', value: 67, message: '+67 Fichas (67!)' }];
  }

  drawEffect(ctx: CanvasRenderingContext2D, ball: Ball): void {
    const r = ball.radius;
    ctx.save();
    ctx.shadowColor = '#ff6a3d';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#ff6a3d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r + 2.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

export class SigmaBallEnhancement extends BallEnhancement {
  readonly id = 'sig';
  readonly name = 'Sigma';
  readonly description = '×1,5 Mult imediato ao ser encaçapada.';
  readonly icon = 'Σ';
  readonly color = '#7a7f88';
  readonly cost = 9;
  readonly popupText = 'SIGMA ×1,5';

  onPocketed(_ball: Ball, _ctx: ShotContext): BallTriggerResult[] {
    return [{ type: 'xmult', value: 1.5, message: '×1.5 Mult (Sigma)' }];
  }

  drawEffect(ctx: CanvasRenderingContext2D, ball: Ball): void {
    const r = ball.radius;
    ctx.save();
        ctx.fillStyle = '#0b0710';
    ctx.fillRect(-r * 0.75, -r * 0.45, r * 0.65, r * 0.4);
    ctx.fillRect(r * 0.1, -r * 0.45, r * 0.65, r * 0.4);
    ctx.fillRect(-r * 0.1, -r * 0.35, r * 0.2, r * 0.12);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(-r * 0.6, -r * 0.4, r * 0.25, r * 0.1);
    ctx.fillRect(r * 0.25, -r * 0.4, r * 0.25, r * 0.1);
    ctx.restore();
  }
}

export class RizzBallEnhancement extends BallEnhancement {
  readonly id = 'riz';
  readonly name = 'Rizz';
  readonly description = '+$2 ao encaçapar com puro charme.';
  readonly icon = '$';
  readonly color = '#e86fb0';
  readonly cost = 6;
  readonly popupText = 'RIZZ +$2';

  onPocketed(_ball: Ball, _ctx: ShotContext): BallTriggerResult[] {
    return [{ type: 'money', value: 2, message: '+$2 (Rizz)' }];
  }

  drawEffect(ctx: CanvasRenderingContext2D, ball: Ball): void {
    const r = ball.radius;
    ctx.save();
    ctx.fillStyle = '#e86fb0';
        ctx.beginPath();
    ctx.arc(r * 0.75, -r * 0.75, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0b0710';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = '7px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♥', r * 0.75, -r * 0.75);
    ctx.restore();
  }
}

export class OhioBallEnhancement extends BallEnhancement {
  readonly id = 'ohi';
  readonly name = 'Ohio';
  readonly description = 'Caos de Ohio: concede +0~120 Fichas ou +0~8 Mult aleatório.';
  readonly icon = '?';
  readonly color = '#9a6bff';
  readonly cost = 5;
  readonly popupText = 'OHIO?!';

  onPocketed(_ball: Ball, _ctx: ShotContext): BallTriggerResult[] {
    if (Math.random() < 0.5) {
      const chips = Math.round(Math.random() * 120);
      return [{ type: 'chips', value: chips, message: `+${chips} Fichas (Ohio!)` }];
    } else {
      const mult = Math.round(Math.random() * 8);
      return [{ type: 'mult', value: mult, message: `+${mult} Mult (Ohio!)` }];
    }
  }

  drawEffect(ctx: CanvasRenderingContext2D, ball: Ball): void {
    const r = ball.radius;
    ctx.save();
    ctx.shadowColor = '#9a6bff';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#9a6bff';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, r + 2.5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#d6c2ff';
    ctx.font = 'bold 8px Oswald, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', r * 0.75, -r * 0.75);
    ctx.restore();
  }
}

export class GigachadBallEnhancement extends BallEnhancement {
  readonly id = 'chd';
  readonly name = 'Gigachad';
  readonly description = '+1 tacada recuperada ao encaçapar.';
  readonly icon = '+';
  readonly color = '#7ad36a';
  readonly cost = 12;
  readonly popupText = 'CHAD +1 TACADA';

  onPocketed(_ball: Ball, _ctx: ShotContext): BallTriggerResult[] {
    return [{ type: 'shots', value: 1, message: '+1 Tacada (Gigachad)' }];
  }

  drawEffect(ctx: CanvasRenderingContext2D, ball: Ball): void {
    const r = ball.radius;
    ctx.save();
    ctx.shadowColor = '#7ad36a';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#7ad36a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r + 2.5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#a6f090';
    ctx.font = 'bold 8px Oswald, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+1', r * 0.75, -r * 0.75);
    ctx.restore();
  }
}

export class SapoRaroBallEnhancement extends BallEnhancement {
  readonly id = 'sap';
  readonly name = 'Sapo Raro';
  readonly description = '+25 Fichas e +$1; 10% de chance de jackpot de +$10.';
  readonly icon = 'S';
  readonly color = '#5fae3a';
  readonly cost = 7;
  readonly popupText = 'SAPO RARO';

  onPocketed(_ball: Ball, _ctx: ShotContext): BallTriggerResult[] {
    const res: BallTriggerResult[] = [
      { type: 'chips', value: 25, message: '+25 Fichas (Sapo Raro)' },
      { type: 'money', value: 1, message: '+$1 (Sapo Raro)' },
    ];
    if (Math.random() < 0.1) {
      res.push({ type: 'money', value: 10, message: 'JACKPOT! +$10 (Sapo Raro)' });
    }
    return res;
  }

  drawEffect(ctx: CanvasRenderingContext2D, ball: Ball): void {
    const r = ball.radius;
    ctx.save();
        ctx.beginPath();
    ctx.arc(r * 0.75, -r * 0.75, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#5fae3a';
    ctx.fill();
    ctx.strokeStyle = '#0b0710';
    ctx.lineWidth = 1;
    ctx.stroke();

        ctx.fillStyle = '#fff';
    ctx.fillRect(r * 0.75 - 3, -r * 0.75 - 2, 2.5, 2.5);
    ctx.fillRect(r * 0.75 + 0.5, -r * 0.75 - 2, 2.5, 2.5);
    ctx.fillStyle = '#0b0710';
    ctx.fillRect(r * 0.75 - 2, -r * 0.75 - 1.5, 1.2, 1.2);
    ctx.fillRect(r * 0.75 + 1.2, -r * 0.75 - 1.5, 1.2, 1.2);
    ctx.restore();
  }
}

export class HockeyMaskBallEnhancement extends BallEnhancement {
  readonly id = 'hoq';
  readonly name = 'Máscara de Hóquei';
  readonly description = '+12 Mult se a bola rebateu na tabela antes de cair.';
  readonly icon = 'H';
  readonly color = '#d6322a';
  readonly cost = 8;
  readonly popupText = 'HÓQUEI +12';

  onPocketed(ball: Ball, ctx: ShotContext): BallTriggerResult[] {
    if (ball.cushionBounces > 0 || ctx.cushionHits > 0) {
      return [{ type: 'mult', value: 12, message: '+12 Mult (Tabela Jason!)' }];
    }
    return [{ type: 'chips', value: 20, message: '+20 Fichas' }];
  }

  drawEffect(ctx: CanvasRenderingContext2D, ball: Ball): void {
    const r = ball.radius;
    ctx.save();
        ctx.beginPath();
    ctx.arc(r * 0.75, -r * 0.75, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = '#f2efe4';
    ctx.fill();
    ctx.strokeStyle = '#0b0710';
    ctx.lineWidth = 1;
    ctx.stroke();

        ctx.strokeStyle = '#d6322a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(r * 0.75 - 2.5, -r * 0.75 - 3);
    ctx.lineTo(r * 0.75, -r * 0.75 - 1);
    ctx.lineTo(r * 0.75 + 2.5, -r * 0.75 - 3);
    ctx.stroke();
    ctx.restore();
  }
}

export class WhiteMaskBallEnhancement extends BallEnhancement {
  readonly id = 'bco';
  readonly name = 'Máscara Branca';
  readonly description = '×2 Mult se for a última bola restante na mesa.';
  readonly icon = 'B';
  readonly color = '#cfc8b4';
  readonly cost = 9;
  readonly popupText = 'ÚLTIMA ×2';

  onPocketed(_ball: Ball, ctx: ShotContext): BallTriggerResult[] {
    const ballsLeft = ctx.ballsRemaining ?? ctx.activeBalls.length;
    if (ballsLeft <= 1) {
      return [{ type: 'xmult', value: 2.0, message: '×2 Mult (Última Bola!)' }];
    }
    return [{ type: 'chips', value: 30, message: '+30 Fichas' }];
  }

  drawEffect(ctx: CanvasRenderingContext2D, ball: Ball): void {
    const r = ball.radius;
    ctx.save();
    ctx.beginPath();
    ctx.arc(r * 0.75, -r * 0.75, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ebe6d8';
    ctx.fill();
    ctx.strokeStyle = '#0b0710';
    ctx.lineWidth = 1;
    ctx.stroke();

        ctx.fillStyle = '#0b0710';
    ctx.beginPath();
    ctx.ellipse(r * 0.75 - 1.8, -r * 0.75 - 0.5, 1, 1.4, 0, 0, Math.PI * 2);
    ctx.ellipse(r * 0.75 + 1.8, -r * 0.75 - 0.5, 1, 1.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export class StripedSweaterBallEnhancement extends BallEnhancement {
  readonly id = 'lst';
  readonly name = 'Suéter Listrado';
  readonly description = '+5 Mult por cada caçapa anterior na mesma tacada.';
  readonly icon = 'L';
  readonly color = '#c0392b';
  readonly cost = 8;
  readonly popupText = 'LISTRADO';

  onPocketed(_ball: Ball, ctx: ShotContext): BallTriggerResult[] {
    const pockets = ctx.pocketsInShot ?? ctx.pocketedBalls.length;
    const bonusMult = 5 * Math.max(1, pockets);
    return [{ type: 'mult', value: bonusMult, message: `+${bonusMult} Mult (Suéter Listrado)` }];
  }

  drawEffect(ctx: CanvasRenderingContext2D, ball: Ball): void {
    const r = ball.radius;
    ctx.save();
        ctx.beginPath();
    ctx.arc(r * 0.75, -r * 0.75, 5.5, 0, Math.PI * 2);
    ctx.clip();
    for (let i = -4; i < 4; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#c0392b' : '#2f7a44';
      ctx.fillRect(r * 0.75 - 6, -r * 0.75 + i * 2, 12, 2);
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(r * 0.75, -r * 0.75, 5.5, 0, Math.PI * 2);
    ctx.strokeStyle = '#0b0710';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

export class ScreamBallEnhancement extends BallEnhancement {
  readonly id = 'gri';
  readonly name = 'Grito';
  readonly description = '+160 Fichas brutais, mas custa 1 tacada extra.';
  readonly icon = 'G';
  readonly color = '#3a3a48';
  readonly cost = 7;
  readonly popupText = 'GRITO +160';

  onPocketed(_ball: Ball, _ctx: ShotContext): BallTriggerResult[] {
    return [
      { type: 'chips', value: 160, message: '+160 Fichas (Grito!)' },
      { type: 'shots', value: -1, message: '-1 Tacada (Custo do Grito)' },
    ];
  }

  drawEffect(ctx: CanvasRenderingContext2D, ball: Ball): void {
    const r = ball.radius;
    ctx.save();
    ctx.beginPath();
    ctx.arc(r * 0.75, -r * 0.75, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ece7de';
    ctx.fill();
    ctx.strokeStyle = '#0b0710';
    ctx.lineWidth = 1;
    ctx.stroke();

        ctx.fillStyle = '#0b0710';
    ctx.beginPath();
    ctx.ellipse(r * 0.75 - 1.6, -r * 0.75 - 1.2, 0.9, 1.6, -0.2, 0, Math.PI * 2);
    ctx.ellipse(r * 0.75 + 1.6, -r * 0.75 - 1.2, 0.9, 1.6, 0.2, 0, Math.PI * 2);
    ctx.ellipse(r * 0.75, -r * 0.75 + 1.8, 1.2, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export class LeMerchantBallEnhancement extends BallEnhancement {
  readonly id = 'lem';
  readonly name = 'LeMerchant';
  readonly description = '×2 Mult se a bola tocou 3 lados distintos da mesa na tacada.';
  readonly icon = 'M';
  readonly color = '#d9a02e';
  readonly cost = 11;
  readonly popupText = 'LEMERCHANT ×2';

  onPocketed(ball: Ball, _ctx: ShotContext): BallTriggerResult[] {
    if (ball.cushionBounces >= 3) {
      return [{ type: 'xmult', value: 2.0, message: '×2 Mult (LeMerchant 3 Tabelas!)' }];
    }
    return [{ type: 'chips', value: 40, message: '+40 Fichas' }];
  }

  drawEffect(ctx: CanvasRenderingContext2D, ball: Ball): void {
    const r = ball.radius;
    ctx.save();
        ctx.beginPath();
    ctx.arc(r * 0.75, -r * 0.75, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = '#14090a';
    ctx.fill();
    ctx.strokeStyle = '#e8b640';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.strokeStyle = '#e8b640';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(r * 0.75 - 2.5, -r * 0.75 - 2.5, 5, 5);
    ctx.restore();
  }
}

export class JawsBallEnhancement extends BallEnhancement {
  readonly id = 'jaw';
  readonly name = 'Jaws';
  readonly description = '+120 Fichas se percorreu pelo menos metade da mesa antes de cair.';
  readonly icon = 'J';
  readonly color = '#2f6ad0';
  readonly cost = 8;
  readonly popupText = 'JAWS +120';

  onPocketed(_ball: Ball, _ctx: ShotContext): BallTriggerResult[] {
    return [{ type: 'chips', value: 120, message: '+120 Fichas (Jaws Long Shot!)' }];
  }

  drawEffect(ctx: CanvasRenderingContext2D, ball: Ball): void {
    const r = ball.radius;
    ctx.save();
        ctx.strokeStyle = '#7a1020';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, r - 1.5, 0, Math.PI * 2);
    ctx.stroke();

    const teeth = 12;
    ctx.fillStyle = '#f6f3ea';
    for (let k = 0; k < teeth; k++) {
      const a = (k * Math.PI * 2) / teeth;
      const r0 = r - 1.2;
      const r1 = r0 - 2.4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a - 0.2) * r0, Math.sin(a - 0.2) * r0);
      ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
      ctx.lineTo(Math.cos(a + 0.2) * r0, Math.sin(a + 0.2) * r0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
}

export class NecronomiconBallEnhancement extends BallEnhancement {
  readonly id = 'nec';
  readonly name = 'Necronomicon';
  readonly description = 'Bola possuída por forças ocultas: concede +50 Fichas e infecta ao colidir.';
  readonly icon = 'N';
  readonly color = '#2f5a3a';
  readonly cost = 10;
  readonly popupText = 'NECRONOMICON +50';

  onPocketed(_ball: Ball, _ctx: ShotContext): BallTriggerResult[] {
    return [{ type: 'chips', value: 50, message: '+50 Fichas (Necronomicon)' }];
  }

  drawEffect(ctx: CanvasRenderingContext2D, ball: Ball): void {
    const r = ball.radius;
    ctx.save();
        ctx.shadowColor = '#7dff6a';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = 'rgba(125, 255, 106, 0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r + 2.5, 0, Math.PI * 2);
    ctx.stroke();

        for (let k = 0; k < 6; k++) {
      const a = k * 1.047;
      ctx.strokeStyle = k % 2 === 0 ? '#9a6bff' : '#7dff6a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (r + 2), Math.sin(a) * (r + 2));
      ctx.lineTo(Math.cos(a + 0.15) * (r + 5.5), Math.sin(a + 0.15) * (r + 5.5));
      ctx.stroke();
    }

        ctx.translate(0, -r - 7);
    ctx.beginPath();
    ctx.ellipse(0, 0, 4.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#f4ecd8';
    ctx.fill();
    ctx.fillStyle = '#d8d030';
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0b0710';
    ctx.beginPath();
    ctx.ellipse(0, 0, 0.6, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export { PeludaBallEnhancement as FuzzyBallEnhancement };

export class BallEnhancementCatalog {
  static getAll(): BallEnhancement[] {
    return [
      new PeludaBallEnhancement(),
      new SeisSeteBallEnhancement(),
      new SigmaBallEnhancement(),
      new RizzBallEnhancement(),
      new OhioBallEnhancement(),
      new GigachadBallEnhancement(),
      new SapoRaroBallEnhancement(),
      new HockeyMaskBallEnhancement(),
      new WhiteMaskBallEnhancement(),
      new StripedSweaterBallEnhancement(),
      new ScreamBallEnhancement(),
      new LeMerchantBallEnhancement(),
      new JawsBallEnhancement(),
      new NecronomiconBallEnhancement(),
      new GoldBallEnhancement(),
      new LuckyBallEnhancement(),
      new SilverBallEnhancement(),
    ];
  }

  static getById(id: string): BallEnhancement | null {
    const all = this.getAll();
    return all.find((e) => e.id === id) || null;
  }
}
