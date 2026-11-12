import { Ball } from '../models/Ball';
import type { Pocket } from '../models/Table';
import { Card } from '../cards/Card';
import type { ShotPhysicsEvents } from '../physics/PhysicsEngine';

export interface PotEvaluationContext {
  potIndex: number;
  ball: Ball;
  pocket: Pocket;
  railsHit: number;
  distanceTraveled?: number;
  sidesTouched?: number;
  isPossessed?: boolean;
  power?: number;
  activeBallsRemaining?: number;
  jokers: Card[];
  ballMods: Record<number, string>;
  stripes: boolean[];
  cueId: string | null;
  parState: { p: number; e: number };
}

export interface PotResult {
  deltaChips: number;
  deltaMult: number;
  xMult: number;
  deltaMoney: number;
  deltaShots: number;
  messages: string[];
}

export interface ShotEndResult {
  finalChips: number;
  finalMult: number;
  totalScore: number;
  moneyEarned: number;
  shotsDelta: number;
  scratch: boolean;
  pocketCount: number;
  handName: string;
}

export class ScoreManager {
    private getSaborSource(jokers: Card[], index: number): Card | null {
    const card = jokers[index];
    if (!card || card.id !== 'sabor' || (card as { isLocked?: boolean }).isLocked) return null;
    if (index < 1) return null;
    const left = jokers[index - 1];
    if (!left || left.id === 'sabor' || (left as { isLocked?: boolean }).isLocked) return null;
    return left;
  }

    public countJoker(jokers: Card[], id: string): number {
    let count = 0;
    for (let i = 0; i < jokers.length; i++) {
      const j = jokers[i];
      if ((j as { isLocked?: boolean }).isLocked) continue;
      if (j.id === id) {
        count++;
      } else if (j.id === 'sabor') {
        const src = this.getSaborSource(jokers, i);
        if (src && src.id === id) {
          count++;
        }
      }
    }
    return count;
  }

    public evaluatePot(ctx: PotEvaluationContext): PotResult {
    const {
      potIndex,
      ball,
      pocket,
      railsHit,
      distanceTraveled = 0,
      sidesTouched = 0,
      isPossessed = false,
      power = 0.5,
      activeBallsRemaining = 0,
      jokers,
      ballMods,
      stripes,
      cueId,
      parState,
    } = ctx;

    let dc = 10 + ball.number * 5;
    if (ball.number === 8) dc = 60;

    let dm = 1 + (railsHit > 0 ? 1 : 0);
    let pxm = 1;
    let deltaMoney = 0;
    let deltaShots = 0;
    const messages: string[] = [];

        const A = (id: string) => this.countJoker(jokers, id);

        if (railsHit > 0) {
      const k = A('tab');
      if (k > 0) dm += 3 * k;
    }

    const gizK = A('giz');
    if (gizK > 0) dc += 35 * gizK;

    if (potIndex === 1) {
      const priK = A('pri');
      if (priK > 0) dc += 60 * priK;
    }

    const lisK = A('lis');
    if (lisK > 0) dm += 2 * lisK;

    if (ball.number === 8) {
      const b8K = A('b8');
      if (b8K > 0) dm += 8 * b8K;
    }

    const choK = A('cho');
    if (choK > 0) dc += 100 * choK;

    const cmbK = A('cmb');
    if (cmbK > 0) dm += 2 * potIndex * cmbK;

        if (pocket.isCorner) {
      const quiK = A('qui');
      if (quiK > 0) dm += 4 * quiK;
    } else {
      const latK = A('lat');
      if (latK > 0) dc += 50 * latK;
    }

        if (ball.number % 2 === parState.p) {
      const parK = A('par');
      if (parK > 0) {
        const e = parState.e;
        if (e === 0) dm += 3 * parK;
        else if (e === 1) dc += 40 * parK;
        else if (e === 2) deltaMoney += 2 * parK;
        else if (e === 3) pxm *= Math.pow(1.25, parK);
        else if (e === 4) {
          dm += 2 * parK;
          dc += 20 * parK;
        } else if (e === 5) {
          for (let i = 0; i < parK; i++) {
            if (Math.random() < 0.2) deltaShots++;
          }
        }
      }
    }

        const isBallStriped = ball.isStriped || !!stripes[ball.number];
    if (isBallStriped) {
      const lsdK = A('lsd');
      if (lsdK > 0) dc += 30 * lsdK;
    }

        const midK = A('mid');
    if (midK > 0) deltaMoney += 4 * midK;

        const mod = (ball.enhancement as unknown as { id?: string })?.id || ballMods[ball.number];
    if (mod) {
      if (mod === 'gold') {
        deltaMoney += 4;
        messages.push('+$4 (Bola Dourada)');
      }
      if (mod === 'silver') {
        dc += 60;
        messages.push('+60 Fichas (Prata)');
      }
      if (mod === 'lucky') {
        if (Math.random() < 0.25) dm += 25;
        if (Math.random() < 0.125) deltaMoney += 10;
        dc += 15;
      }
      if (mod === 'pel') dm += 6;
      if (mod === '67') dc += 67;
      if (mod === 'riz') deltaMoney += 2;
      if (mod === 'chd') deltaShots += 1;
      if (mod === 'sap') {
        dc += 25;
        deltaMoney += 1;
        if (Math.random() < 0.1) deltaMoney += 10;
      }
      if (mod === 'hoq' && railsHit > 0) dm += 12;
      if (mod === 'lst') dm += 5 * (potIndex - 1);
      if (mod === 'gri') {
        dc += 160;
        deltaShots -= 1;
      }
      if (mod === 'ohi') {
        if (Math.random() < 0.5) dc += Math.round(Math.random() * 120);
        else dm += Math.round(Math.random() * 8);
      }
      if (mod === 'jaw' && distanceTraveled >= 320) {
        dc += 120;
      }
    }

        if (isPossessed && A('nec') > 0) {
      dc += 50;
    }

        if (cueId === 'ouro') deltaMoney += 1;
    if (cueId === 'pes') dc += 20;
    if (cueId === 'sor' && Math.random() < 0.2) dc *= 2;
    if (cueId === 'bru' && power > 0.8) dm += 4;
    if (cueId === 'sua' && power < 0.35) dc *= 2;
    if (cueId === 'fog' && railsHit > 0) dm += 2;
    if (cueId === 'fac' && potIndex === 1) dm += 8;
    if (cueId === 'mch' && railsHit > 0) dc += 15 * Math.min(railsHit, 4);
    if (cueId === 'gar') dm += activeBallsRemaining;
    if (cueId === 'mac' && isBallStriped) dc += 40;
    if (cueId === 'mal') dm += 6;

        let multMult = pxm;
    if (mod === 'lem' && sidesTouched >= 3) multMult *= 2;
    if (mod === 'sig') multMult *= 1.5;
    if (mod === 'silver') multMult *= 1.5;
    if (mod === 'bco' && activeBallsRemaining <= 0) multMult *= 2;
    if (cueId === 'mot' && potIndex >= 3) multMult *= 1.5;

    const supK = A('sup');
    if (supK > 0) multMult *= Math.pow(1.5, supK);

    return {
      deltaChips: dc,
      deltaMult: dm,
      xMult: multMult,
      deltaMoney,
      deltaShots,
      messages,
    };
  }

    public evaluateEndShot(params: {
    chips: number;
    mult: number;
    pots: number;
    scratch: boolean;
    jokers: Card[];
  }): ShotEndResult {
    const { chips, mult, pots, scratch, jokers } = params;
    const A = (id: string) => this.countJoker(jokers, id);

    let m2 = mult;
    let shotsDelta = 0;

    if (pots >= 2) m2 *= Math.pow(2, A('dob'));
    if (pots >= 3) m2 *= Math.pow(3, A('tri'));
    if (pots >= 4) m2 *= Math.pow(3, A('cer'));

    if (pots >= 3) {
      const relK = A('rel');
      if (relK > 0) shotsDelta += relK;
    }

    if (pots > 0) m2 *= Math.pow(2, A('rei'));

    const finalMult = m2;
    const gain = Math.round(chips * finalMult * (scratch ? 0.5 : 1));

    const handName = scratch
      ? 'FALTA: BRANCA'
      : pots >= 4
      ? 'CERCO (4+ BOLAS)'
      : pots >= 3
      ? 'TRINCA (3 BOLAS)'
      : pots === 2
      ? 'DOBRADINHA (2 BOLAS)'
      : pots === 1
      ? 'CAÇAPA SIMPLES'
      : 'TACADA EM BRANCO';

    return {
      finalChips: chips,
      finalMult,
      totalScore: gain,
      moneyEarned: 0,
      shotsDelta,
      scratch,
      pocketCount: pots,
      handName,
    };
  }

    public evaluateHand(events: ShotPhysicsEvents) {
    if (events.scratch) {
      return {
        handName: 'FALTA: BRANCA',
        description: 'A bola branca caiu na caçapa.',
        baseChips: 0,
        baseMult: 0,
        isScratch: true,
      };
    }
    const count = events.pocketedBalls.length;
    return {
      handName: `CAÇAPAS ${count}`,
      description: `${count} bola(s) encaçapada(s).`,
      baseChips: 0,
      baseMult: 1,
      isScratch: false,
    };
  }

  public calculateFullScore(
    _hand: unknown,
    events: ShotPhysicsEvents,
    jokers: Card[],
    _shotCtx: { money: number; shotsRemaining: number }
  ) {
    let chips = 0;
    let mult = 1;
    let pots = 0;
    let moneyEarned = 0;

    const stripes: boolean[] = Array.from({ length: 16 }, (_, n) => n > 8);
    const parState = { p: 0, e: 0 };

    for (const p of events.pocketedBalls) {
      pots++;
      const res = this.evaluatePot({
        potIndex: pots,
        ball: p.ball,
        pocket: p.pocket,
        railsHit: events.cushionHits,
        jokers,
        ballMods: {},
        stripes,
        cueId: null,
        parState,
      });

      chips += res.deltaChips;
      mult += res.deltaMult;
      if (res.xMult > 1) mult *= res.xMult;
      moneyEarned += res.deltaMoney;
    }

    const endRes = this.evaluateEndShot({
      chips,
      mult,
      pots,
      scratch: events.scratch,
      jokers,
    });

    return {
      hand: {
        handName: endRes.handName,
        description: '',
        baseChips: chips,
        baseMult: mult,
        isScratch: events.scratch,
      },
      steps: [],
      finalChips: endRes.finalChips,
      finalMult: endRes.finalMult,
      totalScore: endRes.totalScore,
      moneyEarned,
    };
  }
}
