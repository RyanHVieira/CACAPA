import { ScoreManager } from '../frontend/src/game/scoring/ScoreManager';
import { BalatroJokerCard } from '../frontend/src/game/cards/BalatroJokerCard';
import { Ball } from '../frontend/src/game/models/Ball';
import { Table } from '../frontend/src/game/models/Table';
import { J, TG } from '../frontend/src/game/config/gameConfig';

const sm = new ScoreManager();
const table = new Table();
const cornerPocket = table.pockets.find(p => p.isCorner)!;
const stripes: boolean[] = Array(16).fill(false);
const parState = { p: 0, e: 0 };

console.log('=== EXECUÇÃO DOS TESTES T1 A T7 ===\n');

// T1: Encaçapar a bola 5 depois de bater na tabela: fichas 35, mult 1+2 = 3, ganho 105.
{
  const b5 = new Ball(5, 5, 100, 100);
  const pot1 = sm.evaluatePot({
    potIndex: 1,
    ball: b5,
    pocket: cornerPocket,
    railsHit: 1, // bateu na tabela
    jokers: [],
    ballMods: {},
    stripes,
    cueId: null,
    parState,
  });
  // mult começa em 1 a cada tacada; dm = 1 + railsHit = 1 + 1 = 2 => mult = 1 + 2 = 3
  const chips = pot1.deltaChips;
  const mult = 1 + pot1.deltaMult;
  const end = sm.evaluateEndShot({
    chips,
    mult,
    pots: 1,
    scratch: false,
    jokers: [],
  });
  console.log(`T1: Fichas = ${chips} (esp: 35), Mult = ${end.finalMult} (esp: 3), Ganho = ${end.totalScore} (esp: 105)`);
  if (chips === 35 && end.finalMult === 3 && end.totalScore === 105) {
    console.log('T1: PASSOU! ✅\n');
  } else {
    console.error('T1: FALHOU! ❌\n');
  }
}

// T2: Encaçapar a bola 8 sem tabela: fichas 60, mult 2, ganho 120.
{
  const b8 = new Ball(8, 8, 100, 100);
  const pot = sm.evaluatePot({
    potIndex: 1,
    ball: b8,
    pocket: cornerPocket,
    railsHit: 0,
    jokers: [],
    ballMods: {},
    stripes,
    cueId: null,
    parState,
  });
  const chips = pot.deltaChips;
  const mult = 1 + pot.deltaMult;
  const end = sm.evaluateEndShot({
    chips,
    mult,
    pots: 1,
    scratch: false,
    jokers: [],
  });
  console.log(`T2: Fichas = ${chips} (esp: 60), Mult = ${end.finalMult} (esp: 2), Ganho = ${end.totalScore} (esp: 120)`);
  if (chips === 60 && end.finalMult === 2 && end.totalScore === 120) {
    console.log('T2: PASSOU! ✅\n');
  } else {
    console.error('T2: FALHOU! ❌\n');
  }
}

// T3: Encaçapar bola 3 (sem tabela) + bola 5 (com tabela) na mesma tacada: fichas 25+35 = 60, mult 1+1+2 = 4, ganho 240.
{
  const b3 = new Ball(3, 3, 100, 100);
  const b5 = new Ball(5, 5, 100, 100);
  const pot1 = sm.evaluatePot({
    potIndex: 1,
    ball: b3,
    pocket: cornerPocket,
    railsHit: 0,
    jokers: [],
    ballMods: {},
    stripes,
    cueId: null,
    parState,
  });
  const pot2 = sm.evaluatePot({
    potIndex: 2,
    ball: b5,
    pocket: cornerPocket,
    railsHit: 1,
    jokers: [],
    ballMods: {},
    stripes,
    cueId: null,
    parState,
  });
  const chips = pot1.deltaChips + pot2.deltaChips;
  const mult = 1 + pot1.deltaMult + pot2.deltaMult;
  const end = sm.evaluateEndShot({
    chips,
    mult,
    pots: 2,
    scratch: false,
    jokers: [],
  });
  console.log(`T3: Fichas = ${chips} (esp: 60), Mult = ${end.finalMult} (esp: 4), Ganho = ${end.totalScore} (esp: 240)`);
  if (chips === 60 && end.finalMult === 4 && end.totalScore === 240) {
    console.log('T3: PASSOU! ✅\n');
  } else {
    console.error('T3: FALHOU! ❌\n');
  }
}

// T4: T3 com falta (bola branca caiu junto): ganho 120.
{
  const b3 = new Ball(3, 3, 100, 100);
  const b5 = new Ball(5, 5, 100, 100);
  const pot1 = sm.evaluatePot({
    potIndex: 1,
    ball: b3,
    pocket: cornerPocket,
    railsHit: 0,
    jokers: [],
    ballMods: {},
    stripes,
    cueId: null,
    parState,
  });
  const pot2 = sm.evaluatePot({
    potIndex: 2,
    ball: b5,
    pocket: cornerPocket,
    railsHit: 1,
    jokers: [],
    ballMods: {},
    stripes,
    cueId: null,
    parState,
  });
  const chips = pot1.deltaChips + pot2.deltaChips;
  const mult = 1 + pot1.deltaMult + pot2.deltaMult;
  const end = sm.evaluateEndShot({
    chips,
    mult,
    pots: 2,
    scratch: true, // FALTA
    jokers: [],
  });
  console.log(`T4: Fichas = ${chips} (esp: 60), Mult = ${end.finalMult} (esp: 4), Falta: true, Ganho = ${end.totalScore} (esp: 120)`);
  if (chips === 60 && end.finalMult === 4 && end.totalScore === 120) {
    console.log('T4: PASSOU! ✅\n');
  } else {
    console.error('T4: FALHOU! ❌\n');
  }
}

// T5: T3 com Giz Azul + Dobradinha: fichas (25+35)+(35+35) = 130, mult 1+1+2 = 4, ×2 = 8, ganho 1040.
{
  const gizDef = J.find(j => j.id === 'giz')!;
  const dobDef = J.find(j => j.id === 'dob')!;
  const jokers = [new BalatroJokerCard(gizDef), new BalatroJokerCard(dobDef)];

  const b3 = new Ball(3, 3, 100, 100);
  const b5 = new Ball(5, 5, 100, 100);
  const pot1 = sm.evaluatePot({
    potIndex: 1,
    ball: b3,
    pocket: cornerPocket,
    railsHit: 0,
    jokers,
    ballMods: {},
    stripes,
    cueId: null,
    parState,
  });
  const pot2 = sm.evaluatePot({
    potIndex: 2,
    ball: b5,
    pocket: cornerPocket,
    railsHit: 1,
    jokers,
    ballMods: {},
    stripes,
    cueId: null,
    parState,
  });
  const chips = pot1.deltaChips + pot2.deltaChips;
  const mult = 1 + pot1.deltaMult + pot2.deltaMult;
  const end = sm.evaluateEndShot({
    chips,
    mult,
    pots: 2,
    scratch: false,
    jokers,
  });
  console.log(`T5: Fichas = ${chips} (esp: 130), Mult = ${end.finalMult} (esp: 8), Ganho = ${end.totalScore} (esp: 1040)`);
  if (chips === 130 && end.finalMult === 8 && end.totalScore === 1040) {
    console.log('T5: PASSOU! ✅\n');
  } else {
    console.error('T5: FALHOU! ❌\n');
  }
}

// T6: Vencer uma mesa com 3 tacadas sobrando, sem curingas de bônus: ganha $6.
{
  const shotsRemaining = 3;
  const jokers: BalatroJokerCard[] = [];
  const bnkK = sm.countJoker(jokers, 'bnk');
  const cofK = sm.countJoker(jokers, 'cof');
  const bccK = sm.countJoker(jokers, 'bcc');
  const cash = 3 + shotsRemaining + 5 * bnkK + (shotsRemaining > 0 ? shotsRemaining * 3 * cofK : 0) + 12 * bccK;
  console.log(`T6: Dinheiro ganho = $${cash} (esp: $6) [fórmula: 3 + 3 = 6]`);
  if (cash === 6) {
    console.log('T6: PASSOU! ✅\n');
  } else {
    console.error('T6: FALHOU! ❌\n');
  }
}

// T7: Mesa 1 exige 120 fichas e a mesa 10 exige 27000. Mostre a lista completa de metas do A depois da mudança.
{
  console.log(`T7: Metas completas (total: ${TG.length} mesas):`);
  TG.forEach((target, i) => {
    console.log(`  Mesa ${i + 1}: ${target} fichas`);
  });
  if (TG[0] === 120 && TG[9] === 27000 && TG.length === 10) {
    console.log('T7: PASSOU! ✅\n');
  } else {
    console.error('T7: FALHOU! ❌\n');
  }
}
