import { Table, type Pocket } from '../models/Table';
import { Ball } from '../models/Ball';
import { Card } from '../cards/Card';
import { PhysicsEngine } from '../physics/PhysicsEngine';
import { ScoreManager } from '../scoring/ScoreManager';
import { ShopManager } from '../shop/ShopManager';
import { SoundManager } from '../audio/SoundManager';
import { ParticleSystem } from '../physics/ParticleSystem';
import {
  TG,
  NM,
  BOSS,
  BRL,
  nBalls,
  RK,
  PE,
  MAXF,
  START_MONEY,
  BASE_SHOTS,
  type TableBossRule,
} from '../config/gameConfig';

export type GameState =
  | 'AIMING'
  | 'SIMULATING'
  | 'TALLY'
  | 'SHOP'
  | 'BOSS_INTRO'
  | 'ROUND_CLEARED'
  | 'GAME_OVER'
  | 'VICTORY';

export class CacapaPoolEngine {
  // Table & Models
  public table: Table;
  public balls: Ball[] = [];
  public physics: PhysicsEngine;
  public scoreManager: ScoreManager;
  public shopManager: ShopManager;
  public sound: SoundManager;
  public particleSystem: ParticleSystem;

  // Flow & State
  public state: GameState = 'AIMING';
  public activeShotScore: { finalChips: number; finalMult: number } | null = null;
  public lastEarnedCash: number = 0;
  public notificationMessage: string = '';

  // 10 Tables progression (0 to 9 in code, 1 to 10 on screen)
  public tableIndex: number = 0;
  public targetScore: number = TG[0];
  public currentScore: number = 0;

  // Stats matching prototype B
  public shotsRemaining: number = BASE_SHOTS;
  public shotsTaken: number = 0;
  public foulCount: number = 0; // Persistent across the run (MAXF = 5)
  public money: number = START_MONEY;
  public ownedJokers: Card[] = [];
  public ownedConsumables: Card[] = [];
  public ballDeck: Map<
    number,
    { id: string; name: string; color: string; icon: string; description: string } | null
  > = new Map();
  public ballMods: Record<number, string> = {}; // { [ballNumber]: modId }
  public cueId: string | null = null;

  // Stripes randomization per run (STR in B)
  public STR: boolean[] = Array(16).fill(false);

  // Par ou Ímpar random state (PAR in B)
  public PAR: { p: number; e: number } = { p: 0, e: 0 };

  // Shot tracking
  public currentShotPots: number = 0;
  public currentShotChips: number = 0;
  public currentShotMult: number = 1;
  public scratchInShot: boolean = false;

  // Caçapa HUD stats
  public lastHandName: string = 'CAÇAPAS 0';
  public lastChips: number = 0;
  public lastMult: number = 1;
  public lastCaçapasCount: number = 0;
  public isMetaAchieved: boolean = false;
  public reracksRemaining: number = 2;

  // Aiming stats
  public cueBall: Ball | null = null;
  public aimAngle: number = 0;
  public aimPower: number = 0;

  // Shot scored callback for UI animations
  public onShotScored?: (score: unknown) => void;

  // Compatibility getters for existing UI
  get ante(): number {
    return this.tableIndex + 1;
  }
  set ante(val: number) {
    this.tableIndex = Math.max(0, Math.min(TG.length - 1, val - 1));
  }

  get roundInAnte(): number {
    // 3rd round of each boss bracket
    return BOSS.includes(this.tableIndex) ? 3 : 1;
  }

  get blindType(): string {
    if (BOSS.includes(this.tableIndex)) return 'Boss Blind';
    return 'Small Blind';
  }

  get maxShots(): number {
    return (
      BASE_SHOTS +
      2 * this.countJoker('mao') +
      3 * this.countJoker('inf') +
      (this.cueId === 'nov' ? 1 : 0) -
      (this.cueId === 'mal' ? 1 : 0)
    );
  }

  get currentBossRule(): TableBossRule | undefined {
    return BRL[this.tableIndex];
  }

  constructor() {
    this.table = new Table();
    this.physics = new PhysicsEngine(this.table);
    this.scoreManager = new ScoreManager();
    this.shopManager = new ShopManager();
    this.sound = SoundManager.getInstance();
    this.particleSystem = new ParticleSystem();
    this.physics.particles = this.particleSystem;

    // Physics sound & particle hooks
    this.physics.onBallHit = (speed) => this.sound.playBallHit(speed);
    this.physics.onCushionHit = (speed) => this.sound.playCushionBounce(speed);
    this.physics.onPocketBall = (ball, pocket) => this.handleBallPocketed(ball, pocket);

    this.startNewGame();
  }

  public destroy(): void {
    this.sound.stopMusic();
  }

  public toggleSound(): boolean {
    return this.sound.toggleSound();
  }

  public toggleMusic(): boolean {
    return this.sound.toggleMusic();
  }

  public countJoker(id: string): number {
    return this.scoreManager.countJoker(this.ownedJokers, id);
  }

  /**
   * Sorteia lisas e listradas para a run (rollStripes de B)
   * A bola 8 é sempre lisa; entre as bolas 1-7 e 9, de 2 a 6 são listradas.
   */
  public rollStripes(): void {
    let s: boolean[];
    let c9: number;
    do {
      const k = 3 + Math.floor(Math.random() * 9);
      s = Array(16).fill(false);
      const pool = [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15].sort(() => Math.random() - 0.5);
      pool.slice(0, k).forEach((n) => {
        s[n] = true;
      });
      c9 = [1, 2, 3, 4, 5, 6, 7, 9].filter((n) => s[n]).length;
    } while (c9 < 2 || c9 > 6);
    this.STR = s;
  }

  /**
   * Sorteia Par ou Ímpar a cada tacada (parRoll de B)
   */
  public parRoll(): void {
    this.PAR.p = Math.random() < 0.5 ? 1 : 0;
    this.PAR.e = Math.floor(Math.random() * PE.length);
  }

  /**
   * Inicia uma nova Run (begin de B)
   */
  public startNewGame(): void {
    this.tableIndex = 0;
    this.money = START_MONEY;
    this.foulCount = 0;
    this.ownedJokers = [];
    this.ownedConsumables = [];
    this.ballMods = {};
    this.cueId = null;
    this.rollStripes();
    this.setupTable();
  }

  /**
   * Configura a mesa atual (start de B)
   */
  public setupTable(): void {
    this.targetScore = TG[this.tableIndex];
    this.currentScore = 0;
    this.shotsRemaining = this.maxShots;
    this.shotsTaken = 0;
    this.isMetaAchieved = false;
    this.lastChips = 0;
    this.lastMult = 1;
    this.lastHandName = 'CAÇAPAS 0';
    this.lastCaçapasCount = 0;
    this.reracksRemaining = 2;
    this.notificationMessage = `Mesa ${this.tableIndex + 1}: ${NM[this.tableIndex]} — Meta: ${this.targetScore} pts`;

    // Unlock any locked jokers from previous boss
    this.ownedJokers.forEach((j) => {
      (j as { isLocked?: boolean }).isLocked = false;
    });

    // Boss rule 1: Chefão Exigente (Table 4, index 3) locks 1st joker
    if (this.tableIndex === 3 && this.ownedJokers.length > 0) {
      (this.ownedJokers[0] as { isLocked?: boolean }).isLocked = true;
    }

    this.rackBalls();

    // Boss rule 2: Chefão Exigente removes 3 balls from rack
    if (this.tableIndex === 3) {
      this.missBalls(3);
    }

    this.state = 'AIMING';
  }

  /**
   * Remove N bolas do rack no início da mesa do chefão
   */
  private missBalls(count: number): void {
    const objectBalls = this.balls.filter((b) => !b.isCue && !b.isPocketed);
    const toRemove = objectBalls.sort(() => Math.random() - 0.5).slice(0, count);
    for (const b of toRemove) {
      b.isPocketed = true;
      this.particleSystem.spark(b.pos.x, b.pos.y, 16, '#ff6a5a');
      this.particleSystem.pop(b.pos.x, b.pos.y - 20, 'SUMIU!', '#ff8a6a', 0.9);
    }
  }

  /**
   * Arruma o rack de bolas conforme a mesa atual (rack de B)
   */
  public rackBalls(): void {
    this.balls = [];
    const r = 16.5;

    // Baulk position (left quarter)
    const baulkX = this.table.minX + (this.table.maxX - this.table.minX) * 0.25;
    const centerY = this.table.height / 2;
    this.cueBall = new Ball(0, 0, baulkX, centerY, r);
    this.balls.push(this.cueBall);

    // Number of balls and rack shape
    const N = nBalls(this.tableIndex);
    const shape = RK[N] || RK[9];

    // Numbers pool: 1 at apex, 9 in center, others shuffled
    const pool = [2, 3, 4, 5, 6, 7, 8, ...Array.from({ length: N - 9 }, (_, i) => 10 + i)].sort(
      () => Math.random() - 0.5
    );
    const ord = [1, pool[0], pool[1], pool[2], 9, ...pool.slice(3)];

    const rackStartX = this.table.minX + (this.table.maxX - this.table.minX) * 0.72;
    const rowSpacing = r * 1.95;
    const colSpacing = r * 1.86;

    let k = 0;
    shape.forEach((countInCol, colIdx) => {
      for (let i = 0; i < countInCol; i++) {
        if (k >= ord.length) break;
        const num = ord[k++];
        const x = rackStartX + colIdx * colSpacing;
        const y = centerY + (i - (countInCol - 1) / 2) * rowSpacing;
        const ball = new Ball(num, num, x, y, r);
        ball.isStriped = !!this.STR[num];
        this.balls.push(ball);
      }
    });

    this.physics.setBalls(this.balls);
  }

  public rerack(): boolean {
    if (this.reracksRemaining <= 0 || this.state !== 'AIMING') return false;
    this.reracksRemaining--;
    this.rackBalls();
    return true;
  }

  /**
   * Executa a tacada (fire de B)
   */
  public shoot(angle: number, power: number): boolean {
    if (this.state !== 'AIMING' || !this.cueBall || this.shotsRemaining <= 0) {
      return false;
    }

    const clampedPower = Math.min(1.0, Math.max(0.05, power));
    const impulseStrength = 32 * clampedPower * (this.cueId === 'for' ? 1.3 : 1.0);

    this.cueBall.vel.x = Math.cos(angle) * impulseStrength;
    this.cueBall.vel.y = Math.sin(angle) * impulseStrength;

    this.shotsRemaining--;
    this.shotsTaken++;
    this.state = 'SIMULATING';

    // Reset per-shot running counters
    this.currentShotPots = 0;
    this.currentShotChips = 0;
    this.currentShotMult = 1;
    this.scratchInShot = false;

    // Roll Par ou Ímpar
    this.parRoll();

    // Necronomicon: 1 random ball becomes possessed
    const necCount = this.countJoker('nec');
    if (necCount > 0) {
      const liveBalls = this.balls.filter((b) => !b.isCue && !b.isPocketed).sort(() => Math.random() - 0.5);
      liveBalls.slice(0, necCount).forEach((b) => {
        b.isPossessed = true;
        this.particleSystem.spark(b.pos.x, b.pos.y, 14, '#7dff6a');
      });
    }

    // Boss rule Table 7: Shark eats 1 ball (50% chance, leaving >= 2)
    if (this.tableIndex === 6) {
      const liveBalls = this.balls.filter((b) => !b.isCue && !b.isPocketed);
      if (liveBalls.length > 2 && Math.random() < 0.5) {
        const victim = liveBalls[Math.floor(Math.random() * liveBalls.length)];
        victim.isPocketed = true;
        this.particleSystem.spark(victim.pos.x, victim.pos.y, 22, '#aaf0ff');
        this.particleSystem.pop(victim.pos.x, victim.pos.y - 30, 'NHAC! TUBARÃO', '#ff6a5a', 1.1);
        this.particleSystem.addShake(0.5);
      }
    }

    // Boss rule Table 10: Nudge balls slightly
    if (this.tableIndex === 9) {
      for (const b of this.balls) {
        if (!b.isCue && !b.isPocketed) {
          const a = Math.random() * Math.PI * 2;
          const v = 0.3 + Math.random() * 0.2;
          b.vel.x += Math.cos(a) * v;
          b.vel.y += Math.sin(a) * v;
        }
      }
    }

    this.physics.resetShotTracker();
    this.sound.playCueHit(clampedPower);
    this.particleSystem.addShake(0.2 + clampedPower * 0.4);

    return true;
  }

  /**
   * Chamado quando uma bola cai na caçapa durante a física (pot de B)
   */
  private handleBallPocketed(ball: Ball, pocket: Pocket): void {
    if (ball.isCue) {
      this.scratchInShot = true;
      this.foulCount++;
      this.sound.playFoul();
      this.particleSystem.addShake(0.6);
      this.particleSystem.pop(
        pocket.x,
        pocket.y - 24,
        `FALTA! ${this.foulCount}/${MAXF}`,
        '#ff4b3a',
        1.3
      );

      if (this.foulCount >= MAXF) {
        this.sound.playLose();
        this.state = 'GAME_OVER';
      }
      return;
    }

    this.currentShotPots++;
    const activeRemaining = this.balls.filter((b) => !b.isCue && !b.isPocketed).length;

    // Evaluate pot using exact formulas from B
    const potRes = this.scoreManager.evaluatePot({
      potIndex: this.currentShotPots,
      ball,
      pocket,
      railsHit: ball.cushionBounces,
      distanceTraveled: ball.distanceTraveled,
      sidesTouched: ball.sidesHitMask,
      isPossessed: ball.isPossessed,
      power: this.aimPower,
      activeBallsRemaining: activeRemaining,
      jokers: this.ownedJokers,
      ballMods: this.ballMods,
      stripes: this.STR,
      cueId: this.cueId,
      parState: this.PAR,
    });

    this.currentShotChips += potRes.deltaChips;
    this.currentShotMult += potRes.deltaMult;
    if (potRes.xMult > 1) {
      this.currentShotMult *= potRes.xMult;
    }
    this.money += potRes.deltaMoney;
    this.shotsRemaining += potRes.deltaShots;

    this.lastChips = this.currentShotChips;
    this.lastMult = Math.round(this.currentShotMult * 10) / 10;
    this.lastCaçapasCount = this.currentShotPots;

    // Particles and audio
    this.sound.playPocket(this.currentShotPots);
    this.particleSystem.triggerFreeze(3);
    this.particleSystem.spark(pocket.x, pocket.y, 22, ball.color);
    this.particleSystem.spawnFlyingPill(
      pocket.x,
      pocket.y,
      `+${potRes.deltaChips}`,
      ball.color,
      () => {
        this.sound.playChipCount();
      }
    );

    if (ball.cushionBounces > 0) {
      this.particleSystem.pop(pocket.x, pocket.y - 50, 'TABELA!', '#3ec1d3', 0.9);
    }
  }

  public update(dt: number): void {
    this.particleSystem.update();

    if (this.state === 'SIMULATING') {
      const speedMultiplier = 1.35;
      this.physics.update(dt * speedMultiplier);

      // Suction in Table 10 (Vórtices do Destino): pull cue ball towards pockets
      if (this.tableIndex === 9 && this.cueBall && !this.cueBall.isPocketed) {
        for (const p of this.table.pockets) {
          const dx = p.x - this.cueBall.pos.x;
          const dy = p.y - this.cueBall.pos.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 80 && dist > 1) {
            const pull = 0.5 * (1 - dist / 80);
            this.cueBall.pos.x += (dx / dist) * pull;
            this.cueBall.pos.y += (dy / dist) * pull;
          }
        }
      }

      if (this.physics.areAllBallsStopped()) {
        this.onShotStopped();
      }
    }
  }

  /**
   * Finalização da tacada (endShot e after de B)
   */
  private onShotStopped(): void {
    if (this.scratchInShot && this.foulCount >= MAXF) {
      this.state = 'GAME_OVER';
      this.sound.playLose();
      return;
    }

    // Evaluate end of shot multipliers from B
    const endResult = this.scoreManager.evaluateEndShot({
      chips: this.currentShotChips,
      mult: this.currentShotMult,
      pots: this.currentShotPots,
      scratch: this.scratchInShot,
      jokers: this.ownedJokers,
    });

    this.shotsRemaining += endResult.shotsDelta;
    this.lastChips = endResult.finalChips;
    this.lastMult = endResult.finalMult;
    this.lastHandName = endResult.handName;
    this.currentScore += endResult.totalScore;
    this.activeShotScore = {
      finalChips: endResult.finalChips,
      finalMult: endResult.finalMult,
    };

    // Trigger sequential UI animations
    this.onShotScored?.(endResult);

    // Sounds & flash
    if (endResult.totalScore > 0) {
      this.sound.playScoreImpact();
      this.particleSystem.spark(this.table.width / 2, this.table.height / 2, 24, '#f2b632');
      this.particleSystem.pop(
        this.table.width / 2,
        this.table.height / 2 - 30,
        `+${endResult.totalScore.toLocaleString()}`,
        '#f2b632',
        1.4
      );
      this.particleSystem.addShake(0.3);

      if (endResult.finalMult >= 8 || this.currentShotPots >= 2 || endResult.totalScore >= 500) {
        this.particleSystem.triggerFlash(0.6);
      }
    }

    // Respawn cue ball if scratched
    if (this.scratchInShot && this.cueBall) {
      const baulkX = this.table.minX + (this.table.maxX - this.table.minX) * 0.25;
      const centerY = this.table.height / 2;
      this.cueBall.resetPosition(baulkX, centerY);
      this.cueBall.isPocketed = false;
    }

    // After Shot (after de B)
    // 1. If table is completely cleared of object balls -> Faxina payout and fresh rack
    const remainingBalls = this.balls.filter((b) => !b.isCue && !b.isPocketed);
    if (remainingBalls.length === 0) {
      const faxK = this.countJoker('fax');
      if (faxK > 0) {
        const bonus = 8 * faxK;
        this.money += bonus;
        this.particleSystem.pop(
          this.table.width / 2,
          this.table.height / 2,
          `FAXINA +$${bonus}`,
          '#9fe08a',
          1.1
        );
      }
      this.rackBalls();
    }

    // 2. Check if Meta beaten -> Collect reward and open Shop
    if (this.currentScore >= this.targetScore) {
      this.isMetaAchieved = true;
      this.sound.playWin();
      this.particleSystem.spark(this.table.width / 2, this.table.height / 2, 40, '#7ad36a');
      this.particleSystem.pop(
        this.table.width / 2,
        this.table.height / 2 - 40,
        'META BATIDA! INDO PARA A LOJA',
        '#7ad36a',
        1.8
      );
      this.particleSystem.addShake(0.4);

      // Payout: cash = 3 + shots + 5*bnk + (shots > 0 ? shots * 3 * cof : 0) + 12*bcc
      const bnkK = this.countJoker('bnk');
      const cofK = this.countJoker('cof');
      const bccK = this.countJoker('bcc');
      const cash =
        3 +
        this.shotsRemaining +
        5 * bnkK +
        (this.shotsRemaining > 0 ? this.shotsRemaining * 3 * cofK : 0) +
        12 * bccK;

      this.money += cash;
      this.lastEarnedCash = cash;

      // Victory of the whole run upon clearing Table 10 (index 9)
      if (this.tableIndex >= TG.length - 1) {
        this.state = 'VICTORY';
        return;
      }

      // Generate shops
      this.shopManager.generateStock(this.tableIndex, this.ownedJokers);
      if (this.shopManager.shouldOpenBallModShop(this.tableIndex)) {
        this.shopManager.generateBallModStock(this.ballMods);
      }
      if (this.shopManager.shouldOpenTacoShop(this.tableIndex)) {
        this.shopManager.generateCueStock(this.cueId);
      }

      this.state = 'SHOP';
      return;
    }

    // 3. Out of shots without reaching target -> Defeat
    if (this.shotsRemaining <= 0) {
      this.sound.playLose();
      this.state = 'GAME_OVER';
      return;
    }

    // Ready for next shot
    this.state = 'AIMING';
  }

  public nextRound(): void {
    this.tableIndex++;
    if (this.tableIndex >= TG.length) {
      this.state = 'VICTORY';
      return;
    }
    this.setupTable();
  }

  public buyShopCard(index: number) {
    const res = this.shopManager.buyCard(index, this.money, this.ownedJokers, this.ownedConsumables);
    if (res.success && res.card) {
      this.money -= res.cost;
      this.sound.playBuy();
      this.ownedJokers.push(res.card);
    }
    return res;
  }

  public sellJoker(index: number): { success: boolean; value: number } {
    if (index < 0 || index >= this.ownedJokers.length) return { success: false, value: 0 };
    const card = this.ownedJokers[index];
    if (!card) return { success: false, value: 0 };
    const val = Math.max(1, Math.floor(card.cost * 0.75));
    this.money += val;
    this.ownedJokers.splice(index, 1);
    this.sound.playBuy();
    return { success: true, value: val };
  }

  public buyShopBallMod(index: number) {
    const res = this.shopManager.buyBallMod(index, this.money);
    if (res.success && res.offer) {
      this.money -= res.cost;
      this.ballMods[res.offer.ballNumber] = res.offer.id;
      this.ballDeck.set(res.offer.ballNumber, {
        id: res.offer.id,
        name: res.offer.name,
        color: res.offer.color,
        icon: res.offer.icon,
        description: res.offer.description,
      });
      this.sound.playBuy();
    }
    return res;
  }

  public buyShopCue(index: number) {
    const res = this.shopManager.buyCue(index, this.money);
    if (res.success && res.cue) {
      this.money -= res.cost;
      this.cueId = res.cue.id;
      this.sound.playBuy();
    }
    return res;
  }

  public rerollShop(): { success: boolean; message: string } {
    const res = this.shopManager.rerollJokers(this.tableIndex, this.ownedJokers, this.money);
    if (res.success) {
      this.money -= res.cost;
      this.sound.playBuy();
    }
    return res;
  }

  // Compatibility method
  public buyShopBall(index: number) {
    return this.buyShopBallMod(index);
  }
}
