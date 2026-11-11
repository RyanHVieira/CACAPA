import { Table, type Pocket } from '../models/Table';
import { Ball } from '../models/Ball';
import { Card } from '../cards/Card';
import { PhysicsEngine } from '../physics/PhysicsEngine';
import { ScoreManager } from '../scoring/ScoreManager';
import { ShopManager } from '../shop/ShopManager';
import { SoundManager } from '../audio/SoundManager';
import { ParticleSystem } from '../physics/ParticleSystem';
import { BallEnhancementCatalog } from '../enhancements/BallEnhancement';
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

export interface DeckBallItem {
  id: string;
  number: number;
  isStripe: boolean;
  enhancement: {
    id: string;
    name: string;
    color: string;
    icon: string;
    description: string;
    rarity?: string;
  } | null;
}

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
    public table: Table;
  public balls: Ball[] = [];
  public physics: PhysicsEngine;
  public scoreManager: ScoreManager;
  public shopManager: ShopManager;
  public sound: SoundManager;
  public particleSystem: ParticleSystem;

  private _state: GameState = 'AIMING';
  public get state(): GameState {
    return this._state;
  }
  public set state(newState: GameState) {
    if (this._state !== newState) {
      this._state = newState;
      this.onStateChange?.(newState);
    }
  }
  public activeShotScore: { finalChips: number; finalMult: number } | null = null;
  public lastEarnedCash: number = 0;
  public notificationMessage: string = '';

    public tableIndex: number = 0;
  public targetScore: number = TG[0];
  public currentScore: number = 0;

    public shotsRemaining: number = BASE_SHOTS;
  public shotsTaken: number = 0;
  public foulCount: number = 0;
  public money: number = START_MONEY;
  public ownedJokers: Card[] = [];
  public ownedConsumables: Card[] = [];
  public ballDeck: Map<
    number,
    { id: string; name: string; color: string; icon: string; description: string; rarity?: string } | null
  > = new Map();
  public deck: DeckBallItem[] = [];
  public ballMods: Record<number, string> = {};
  public cueId: string | null = null;

    public STR: boolean[] = Array(16).fill(false);

    public PAR: { p: number; e: number } = { p: 0, e: 0 };

    public currentShotPots: number = 0;
  public currentShotChips: number = 0;
  public currentShotMult: number = 1;
  public scratchInShot: boolean = false;

    public lastHandName: string = 'CAÇAPAS 0';
  public lastChips: number = 0;
  public lastMult: number = 1;
  public lastCaçapasCount: number = 0;
  public isMetaAchieved: boolean = false;
  public reracksRemaining: number = 2;

    public cueBall: Ball | null = null;
  public aimAngle: number = 0;
  public aimPower: number = 0;

    public onShotScored?: (score: unknown) => void;
    public onStateChange?: (state: GameState) => void;

    get ante(): number {
    return this.tableIndex + 1;
  }
  set ante(val: number) {
    this.tableIndex = Math.max(0, Math.min(TG.length - 1, val - 1));
  }

  get roundInAnte(): number {
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

    public parRoll(): void {
    this.PAR.p = Math.random() < 0.5 ? 1 : 0;
    this.PAR.e = Math.floor(Math.random() * PE.length);
  }

    public initDeck(): void {
    this.deck = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((num, i) => ({
      id: `deck-${i + 1}-${Math.random().toString(36).slice(2, 7)}`,
      number: num,
      isStripe: !!this.STR[num] || num >= 9,
      enhancement: null,
    }));
    this.syncDeckToEngine();
  }

  public syncDeckToEngine(): void {
    this.ballDeck.clear();
    this.ballMods = {};
    this.deck.forEach((ball) => {
      if (ball.enhancement) {
        this.ballDeck.set(ball.number, ball.enhancement);
        this.ballMods[ball.number] = ball.enhancement.id;
      }
      this.STR[ball.number] = ball.isStripe;
    });
  }

  public startNewGame(): void {
    this.tableIndex = 0;
    this.money = START_MONEY;
    this.foulCount = 0;
    this.ownedJokers = [];
    this.ownedConsumables = [];
    this.ballMods = {};
    this.cueId = null;
    this.rollStripes();
    this.initDeck();
    this.setupTable();
  }

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

        this.ownedJokers.forEach((j) => {
      (j as { isLocked?: boolean }).isLocked = false;
    });

        if (this.tableIndex === 3 && this.ownedJokers.length > 0) {
      (this.ownedJokers[0] as { isLocked?: boolean }).isLocked = true;
    }

    this.rackBalls();

        if (this.tableIndex === 3) {
      this.missBalls(3);
    }

    this.state = 'AIMING';
  }

    private missBalls(count: number): void {
    const objectBalls = this.balls.filter((b) => !b.isCue && !b.isPocketed);
    const toRemove = objectBalls.sort(() => Math.random() - 0.5).slice(0, count);
    for (const b of toRemove) {
      b.isPocketed = true;
      this.particleSystem.spark(b.pos.x, b.pos.y, 16, '#ff6a5a');
      this.particleSystem.pop(b.pos.x, b.pos.y - 20, 'SUMIU!', '#ff8a6a', 0.9);
    }
  }

    public rackBalls(): void {
    this.balls = [];
    const r = 16.5;

    const baulkX = this.table.minX + (this.table.maxX - this.table.minX) * 0.25;
    const centerY = this.table.height / 2;
    this.cueBall = new Ball(0, 0, baulkX, centerY, r);
    this.balls.push(this.cueBall);

    const N = nBalls(this.tableIndex);
    const shape = RK[N] || RK[9];

    while (this.deck.length < N) {
      const nextNum = Math.min(12, this.deck.length + 1);
      this.deck.push({
        id: `deck-${this.deck.length + 1}-${Math.random().toString(36).slice(2, 7)}`,
        number: nextNum,
        isStripe: true,
        enhancement: null,
      });
    }
    this.syncDeckToEngine();

    const activeDeck = this.deck.slice(0, N);
    const rackStartX = this.table.minX + (this.table.maxX - this.table.minX) * 0.72;
    const rowSpacing = r * 1.95;
    const colSpacing = r * 1.86;

    let k = 0;
    shape.forEach((countInCol, colIdx) => {
      for (let i = 0; i < countInCol; i++) {
        if (k >= activeDeck.length) break;
        const deckItem = activeDeck[k++];
        const x = rackStartX + colIdx * colSpacing;
        const y = centerY + (i - (countInCol - 1) / 2) * rowSpacing;
        const ball = new Ball(deckItem.number, deckItem.number, x, y, r);
        ball.isStriped = deckItem.isStripe;
        if (deckItem.enhancement) {
          ball.enhancement = BallEnhancementCatalog.getById(deckItem.enhancement.id);
        }
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

        this.currentShotPots = 0;
    this.currentShotChips = 0;
    this.currentShotMult = 1;
    this.scratchInShot = false;

        this.parRoll();

        const necCount = this.countJoker('nec');
    if (necCount > 0) {
      const liveBalls = this.balls.filter((b) => !b.isCue && !b.isPocketed).sort(() => Math.random() - 0.5);
      liveBalls.slice(0, necCount).forEach((b) => {
        b.isPossessed = true;
        this.particleSystem.spark(b.pos.x, b.pos.y, 14, '#7dff6a');
      });
    }

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
      return;
    }

    this.currentShotPots++;
    const activeRemaining = this.balls.filter((b) => !b.isCue && !b.isPocketed).length;

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

  private onShotStopped(): void {
    if (this.scratchInShot && this.cueBall) {
      const baulkX = this.table.minX + (this.table.maxX - this.table.minX) * 0.25;
      const centerY = this.table.height / 2;
      this.cueBall.resetPosition(baulkX, centerY);
      this.cueBall.isPocketed = false;
    }

    if (this.scratchInShot && this.foulCount >= MAXF) {
      this.state = 'GAME_OVER';
      this.sound.playLose();
      this.particleSystem.pop(
        this.table.width / 2,
        this.table.height / 2 - 30,
        'LIMITE DE FALTAS! FIM DE JOGO',
        '#ff4b3a',
        2.0
      );
      this.onShotScored?.(null);
      return;
    }

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

        this.onShotScored?.(endResult);

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

        if (this.scratchInShot && this.cueBall) {
      const baulkX = this.table.minX + (this.table.maxX - this.table.minX) * 0.25;
      const centerY = this.table.height / 2;
      this.cueBall.resetPosition(baulkX, centerY);
      this.cueBall.isPocketed = false;
    }

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

            if (this.tableIndex >= TG.length - 1) {
        this.state = 'VICTORY';
        return;
      }

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

        if (this.shotsRemaining <= 0) {
      this.sound.playLose();
      this.state = 'GAME_OVER';
      return;
    }

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

    public buyAndReplaceShopBall(shopOfferIndex: number, deckIndexToReplace: number): {
    success: boolean;
    message: string;
    cost: number;
  } {
    if (shopOfferIndex < 0 || shopOfferIndex >= this.shopManager.ballModStock.length) {
      return { success: false, message: 'Oferta inválida.', cost: 0 };
    }
    const offer = this.shopManager.ballModStock[shopOfferIndex];
    if (!offer) {
      return { success: false, message: 'Item já comprado!', cost: 0 };
    }
    if (this.money < offer.cost) {
      return { success: false, message: 'Dinheiro insuficiente!', cost: 0 };
    }
    if (deckIndexToReplace < 0 || deckIndexToReplace >= this.deck.length) {
      return { success: false, message: 'Bola do deck selecionada é inválida.', cost: 0 };
    }

    const oldBall = this.deck[deckIndexToReplace];
    this.money -= offer.cost;
    this.sound.playBuy();

    const newDeckBall: DeckBallItem = {
      id: `deck-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      number: offer.ballNumber,
      isStripe: offer.isStripe,
      enhancement: offer.hasEnhancement
        ? {
            id: offer.id,
            name: offer.name,
            color: offer.color,
            icon: offer.icon,
            description: offer.description,
            rarity: offer.rarity,
          }
        : null,
    };

    this.deck[deckIndexToReplace] = newDeckBall;
    this.syncDeckToEngine();
    this.shopManager.ballModStock[shopOfferIndex] = null;

    const modInfo = offer.hasEnhancement ? `com ${offer.name} (${offer.rarity || 'Especial'})` : `(Normal)`;
    return {
      success: true,
      cost: offer.cost,
      message: `Bola #${offer.ballNumber} (${offer.isStripe ? 'Listrada' : 'Lisa'}) ${modInfo} substituiu a Bola #${oldBall.number}!`,
    };
  }

  public buyShopBall(index: number) {
    if (this.deck.length > 0) {
      const unenhancedIndex = this.deck.findIndex((b) => b.enhancement === null);
      const targetIndex = unenhancedIndex >= 0 ? unenhancedIndex : 0;
      return this.buyAndReplaceShopBall(index, targetIndex);
    }
    return this.buyShopBallMod(index);
  }
}
