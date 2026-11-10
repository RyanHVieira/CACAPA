import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CacapaPoolEngine } from '../game/engine/CacapaPoolEngine';
import { PoolCanvas } from '../components/pool/PoolCanvas';
import { CacapaShop } from '../components/pool/CacapaShop';
import { GameOverModal } from '../components/pool/GameOverModal';
import { PoolHelpModal } from '../components/pool/PoolHelpModal';
import { BallRackModal } from '../components/pool/BallRackModal';
import { CacapaBackground } from '../components/pool/CacapaBackground';
import { CacapaJokerSlot } from '../components/pool/CacapaJokerSlot';
import { BossIntroModal } from '../components/pool/BossIntroModal';
import { TitleScreenModal } from '../components/pool/TitleScreenModal';
import { AMBIENT_THEMES } from '../game/scenes/TableScenes';

export function PoolPage() {
  const navigate = useNavigate();

  // Single persistent game engine instance
  const [engine] = useState(() => new CacapaPoolEngine());

  // React state trigger to re-render UI when engine state changes
  const [, setTick] = useState(0);
  const rerender = () => setTick((t) => t + 1);

  // UI state
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isBallRackOpen, setIsBallRackOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(() => !engine.sound.soundEnabled);
  const [isMusicMuted, setIsMusicMuted] = useState(() => !engine.sound.musicEnabled);
  const [showShop, setShowShop] = useState(false);
  const [isCrtEnabled, setIsCrtEnabled] = useState(true);
  const [isTitleOpen, setIsTitleOpen] = useState(false);
  const [isBossIntroOpen, setIsBossIntroOpen] = useState(false);
  const [lastSeenBossAnte, setLastSeenBossAnte] = useState<number | null>(null);
  const [activatingJokerIdx, setActivatingJokerIdx] = useState<number | null>(null);
  const [scorePop, setScorePop] = useState(false);

  // Lifecycle: ensure music plays if enabled, and stop music when unmounting / navigating away
  useEffect(() => {
    if (engine.sound.musicEnabled) {
      engine.sound.startMusic();
    }

    return () => {
      engine.destroy();
    };
  }, [engine]);

  // Hook up engine onShotScored for sequential Joker activation and score pops
  useEffect(() => {
    engine.onShotScored = () => {
      setScorePop(true);
      setTimeout(() => setScorePop(false), 350);

      // Sequential Joker activation from left to right
      if (engine.ownedJokers.length > 0) {
        let idx = 0;
        const triggerNext = () => {
          if (idx < engine.ownedJokers.length) {
            setActivatingJokerIdx(idx);
            engine.sound.playCardTrigger();
            idx++;
            setTimeout(triggerNext, 220);
          } else {
            setActivatingJokerIdx(null);
          }
        };
        triggerNext();
      }
    };
  }, [engine]);

  // Boss Blind notification modal trigger
  useEffect(() => {
    if (engine.blindType === 'Boss Blind' && lastSeenBossAnte !== engine.ante) {
      setIsBossIntroOpen(true);
      setLastSeenBossAnte(engine.ante);
    }
  }, [engine.blindType, engine.ante, lastSeenBossAnte]);

  // Joker management handlers
  const handleReorderJokers = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    const jokers = [...engine.ownedJokers];
    const [moved] = jokers.splice(fromIdx, 1);
    if (moved) {
      jokers.splice(toIdx, 0, moved);
      engine.ownedJokers = jokers;
      rerender();
    }
  };

  const handleSellJoker = (idx: number) => {
    const card = engine.ownedJokers[idx];
    if (!card) return;
    const sellValue = Math.max(1, Math.floor(card.cost / 2));
    engine.money += sellValue;
    engine.ownedJokers.splice(idx, 1);
    engine.sound.playBuy();
    rerender();
  };

  // Sync mute states
  const handleToggleSound = () => {
    const isEnabled = engine.toggleSound();
    setIsMuted(!isEnabled);
    rerender();
  };

  const handleToggleMusic = () => {
    const isEnabled = engine.toggleMusic();
    setIsMusicMuted(!isEnabled);
    rerender();
  };

  // Keyboard shortcut: 'M' toggles music
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        const isEnabled = engine.toggleMusic();
        setIsMusicMuted(!isEnabled);
        rerender();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [engine]);

  // Re-render regularly while simulating physics
  useEffect(() => {
    const interval = setInterval(() => {
      if (engine.state === 'SIMULATING' || engine.state === 'TALLY') {
        rerender();
      }
    }, 120);
    return () => clearInterval(interval);
  }, [engine]);

  const lisasCount = engine.balls.filter(
    (b) => !b.isCue && !b.isPocketed && b.number >= 1 && b.number <= 7
  ).length;
  const listradasCount = engine.balls.filter(
    (b) => !b.isCue && !b.isPocketed && b.number >= 9 && b.number <= 15
  ).length;

  const isShopOpen = showShop || engine.state === 'SHOP';

  // --- DEDICATED FULL-SCREEN BAR SHOP SCENE (OUTRA CENA) ---
  if (isShopOpen) {
    return (
      <div className="w-screen h-screen overflow-hidden bg-[#2b1408] text-slate-100 flex flex-col justify-between select-none font-sans relative">
        <CacapaShop
          engine={engine}
          onNextRound={() => {
            engine.nextRound();
            setShowShop(false);
            rerender();
          }}
          onUpdate={rerender}
          onOpenMenu={() => setIsMenuOpen(true)}
        />

        {/* Menu Dropdown Modal in Shop */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-64 bg-slate-900 border-2 border-amber-600 rounded-2xl shadow-2xl p-4 flex flex-col gap-2 text-xs">
              <h4 className="font-black text-amber-400 uppercase font-mono text-center pb-2 border-b border-slate-800">
                Menu do Boteco
              </h4>
              <button
                onClick={() => {
                  setIsBallRackOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-amber-300 font-bold flex items-center gap-2 cursor-pointer"
              >
                <span>📦</span>
                <span>Caixa de Bolas</span>
              </button>
              <button
                onClick={handleToggleSound}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-300 font-bold flex items-center gap-2 cursor-pointer"
              >
                <span>{isMuted ? '🔇' : '🔊'}</span>
                <span>{isMuted ? 'Ativar Efeitos' : 'Mutar Efeitos'}</span>
              </button>
              <button
                onClick={handleToggleMusic}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-amber-300 font-bold flex items-center gap-2 cursor-pointer"
              >
                <span>{isMusicMuted ? '🎵❌' : '🎷'}</span>
                <span>{isMusicMuted ? 'Tocar Caçapa Jazz (M)' : 'Mutar Música (M)'}</span>
              </button>
              <button
                onClick={() => {
                  setIsHelpOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-300 font-bold flex items-center gap-2 cursor-pointer"
              >
                <span>📖</span>
                <span>Regras e Dicas</span>
              </button>
              <div className="h-px bg-slate-800 my-1" />
              <button
                onClick={() => {
                  engine.startNewGame();
                  setIsMenuOpen(false);
                  setShowShop(false);
                  rerender();
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-950/60 text-red-400 font-bold flex items-center gap-2 cursor-pointer"
              >
                <span>🔄</span>
                <span>Reiniciar Partida</span>
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-400 font-bold flex items-center gap-2 cursor-pointer"
              >
                <span>🏠</span>
                <span>Sair p/ Dashboard</span>
              </button>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold mt-1 cursor-pointer"
              >
                Voltar
              </button>
            </div>
          </div>
        )}

        {/* Observation Modal for Ball Box */}
        <BallRackModal
          isOpen={isBallRackOpen}
          onClose={() => setIsBallRackOpen(false)}
          engine={engine}
          onUpdate={rerender}
        />

        {/* Help Modal */}
        <PoolHelpModal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
        />
      </div>
    );
  }

  const tableIndex = Math.max(0, engine.ante - 1) % AMBIENT_THEMES.length;
  const currentTheme = AMBIENT_THEMES[tableIndex];
  const currentBossRule = engine.currentBossRule;

  // 5 MULT tiers with escalating colors and glowing halos (matching prototype XC/XB/XK)
  const multTiers = [
    { bg: 'bg-[#ff4b3a]', shadow: 'shadow-[0_0_12px_#ff5a4a]', text: 'text-white' },
    { bg: 'bg-[#ff5a2a]', shadow: 'shadow-[0_0_15px_#ff7a3a]', text: 'text-white' },
    { bg: 'bg-[#f27a14]', shadow: 'shadow-[0_0_18px_#ffa02e]', text: 'text-white' },
    { bg: 'bg-[#e0284f]', shadow: 'shadow-[0_0_22px_#ff4f8a]', text: 'text-white' },
    { bg: 'bg-[#a02ee0]', shadow: 'shadow-[0_0_26px_#d46bff]', text: 'text-white' },
  ];
  const multTierIdx =
    engine.lastMult < 6
      ? 0
      : engine.lastMult < 14
      ? 1
      : engine.lastMult < 30
      ? 2
      : engine.lastMult < 60
      ? 3
      : 4;
  const multStyle = multTiers[multTierIdx];

  // --- POOL TABLE PLAYING SCENE (AUTHENTIC CAÇAPA SCREEN WITH CRT FRAME) ---
  return (
    <div className="w-screen h-screen max-h-screen overflow-hidden bg-[#0b0710] text-slate-100 flex items-center justify-center p-0 select-none font-sans relative">
      <div id="w" className={`relative w-full h-full flex p-1.5 sm:p-2 xl:p-2.5 gap-2 sm:gap-2.5 z-10 ${!isCrtEnabled ? 'nocrt' : ''}`}>
        {/* 1. AUTHENTIC CAÇAPA HYPNOTIC CRT PLASMA BACKGROUND & ANIMATED SCENE */}
        <CacapaBackground tableIndex={tableIndex} />

        {/* 2. LEFT SIDEBAR HUD */}
        <aside className="w-52 sm:w-56 xl:w-60 flex-shrink-0 flex flex-col justify-start gap-1.5 sm:gap-2 h-full select-none z-20 font-cacapa">
          {/* TOP SECTION: Blind / Meta Panel + Pontuação Pill */}
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            {/* 1. BLIND / META PANEL (Top Card) */}
            <div className="bg-[#1b2427] border-2 border-[#0b0710] rounded-xl overflow-hidden flex flex-col">
              <div
                className={`py-1 px-2.5 text-center border-b-2 border-[#0b0710] ${
                  engine.blindType === 'Boss Blind'
                    ? 'bg-[#cf3226]'
                    : 'bg-[#2563eb]'
                }`}
              >
                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider cacapa-stroke leading-tight truncate">
                  {currentBossRule?.name || currentTheme?.title || `Mesa ${engine.ante}`}
                </h3>
                <span className="text-[9px] text-white/90 font-bold block leading-none mt-0.5 truncate">
                  {currentBossRule?.headers?.[0] || `Mesa ${engine.ante} de 10`}
                </span>
              </div>

              <div className="p-2 flex items-center gap-2 bg-[#171d22]">
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-[#0b0710] flex items-center justify-center flex-shrink-0 ${
                    engine.blindType === 'Boss Blind'
                      ? 'bg-[#991b1b] text-red-200'
                      : 'bg-[#1e3a8a] text-blue-200'
                  }`}
                >
                  <span className="font-black text-xl cacapa-stroke">
                    {engine.blindType === 'Boss Blind' ? '☠' : '🎱'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-bold text-[#9fb4a8] block leading-none">
                    Score at least
                  </span>
                  <div className="text-lg sm:text-xl font-black text-[#ff5a4a] leading-tight flex items-center gap-1 cacapa-stroke my-0.5">
                    <span className="text-xs">✳</span>
                    <span>{engine.targetScore.toLocaleString()}</span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-[#f2b632] block leading-none">
                    Reward: <span className="font-black">${3 + Math.max(0, engine.shotsRemaining)}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 2. PONTUAÇÃO MOSTRADOR (Iconic Caçapa Round Score Pill) */}
            <div className="bg-[#1b2427] border-2 border-[#0b0710] rounded-xl overflow-hidden flex items-stretch">
              <div className="bg-[#cf3226] border-r-2 border-[#0b0710] px-2 py-1.5 flex flex-col items-center justify-center text-center flex-shrink-0 min-w-[70px]">
                <span className="text-[10px] sm:text-[11px] font-black text-white uppercase leading-none cacapa-stroke-sm">
                  Pontuação
                </span>
              </div>
              <div className="flex-1 bg-[#14181c] px-2.5 py-1.5 flex items-center justify-center gap-1.5 min-w-0">
                <span className="text-sm sm:text-base text-white/75 font-black">✳</span>
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight cacapa-stroke leading-none">
                  {engine.currentScore.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* MIDDLE: A HUD QUE GUARDA AS INFORMAÇÕES DA PARTIDA (COMPACTA, ALTURA DIMINUÍDA) */}
          <div className="bg-[#171d22] border-2 border-[#0b0710] rounded-2xl p-2 sm:p-2.5 flex flex-col gap-1.5 sm:gap-2 font-cacapa select-none overflow-hidden flex-shrink-0">
            {/* 1. Hand Evaluation & Fichas × Mult */}
            <div className="bg-[#1b2427] border-2 border-[#0b0710] rounded-xl p-2 flex flex-col gap-1">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-xs sm:text-sm font-black text-white cacapa-stroke truncate">
                  {engine.lastHandName || 'Tacada'}
                </span>
                <span className="text-[9px] font-black text-[#38bdf8] bg-[#0c2a44] px-1 py-0.2 rounded border border-[#38bdf8]/50">
                  lvl.1
                </span>
              </div>

              <div className="flex items-center justify-center gap-1.5">
                <div
                  className={`flex-1 bg-[#0080ff] border-2 border-[#0b0710] rounded-xl py-1 px-1.5 text-center transition-transform ${
                    scorePop ? 'animate-counter-pop' : ''
                  }`}
                >
                  <span className="text-lg sm:text-xl font-black text-white leading-none block cacapa-stroke">
                    {engine.lastChips}
                  </span>
                </div>

                <span className="text-[#ff3b30] font-black text-lg px-0.5 cacapa-stroke">
                  ×
                </span>

                <div
                  className={`flex-1 ${multStyle.bg} border-2 border-[#0b0710] rounded-xl py-1 px-1.5 text-center transition-transform ${
                    scorePop ? 'animate-counter-pop' : ''
                  }`}
                >
                  <span className="text-lg sm:text-xl font-black text-white leading-none block cacapa-stroke">
                    {engine.lastMult}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Stats Matrix (Hands, Faltas, Money, Opções, Mesa, Round) */}
            <div className="flex flex-col gap-1.5">
              {/* Row 1: Hands + Faltas */}
              <div className="flex gap-1.5 items-stretch">
                <div className="flex-1 bg-[#1b2427] border-2 border-[#0b0710] rounded-xl py-1.5 px-2 text-center">
                  <span className="text-[9px] font-black uppercase text-white/80 block leading-tight">
                    Hands
                  </span>
                  <span className="text-lg sm:text-xl font-black text-[#2f86ff] leading-none block mt-0.5 cacapa-stroke">
                    {engine.shotsRemaining}
                  </span>
                </div>

                <div className="flex-1 bg-[#1b2427] border-2 border-[#0b0710] rounded-xl py-1.5 px-2 text-center">
                  <span className="text-[9px] font-black uppercase text-white/80 block leading-tight">
                    Faltas
                  </span>
                  <span
                    className={`text-lg sm:text-xl font-black leading-none block mt-0.5 cacapa-stroke ${
                      engine.foulCount >= 4 ? 'text-[#ff3b30] animate-pulse' : 'text-[#ff5a4a]'
                    }`}
                  >
                    {engine.foulCount}/5
                  </span>
                </div>
              </div>

              {/* Row 2: Money */}
              <div className="bg-[#1b2427] border-2 border-[#0b0710] rounded-xl py-1.5 px-3 flex items-center justify-center">
                <span className="text-xl sm:text-2xl font-black text-[#f2b632] leading-none cacapa-stroke">
                  ${engine.money}
                </span>
              </div>

              {/* Row 3: Opções + Mesa + Round */}
              <div className="flex gap-1.5 items-stretch">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="w-14 sm:w-16 bg-[#d97706] hover:bg-[#b45309] active:scale-95 border-2 border-[#0b0710] rounded-xl flex items-center justify-center p-1 text-center transition-all cursor-pointer flex-shrink-0"
                  title="Abrir Menu de Opções"
                >
                  <span className="text-[9px] sm:text-[10px] font-black text-white uppercase cacapa-stroke-sm">
                    Opções
                  </span>
                </button>

                <div className="flex-1 bg-[#1b2427] border-2 border-[#0b0710] rounded-xl py-1.5 px-1 text-center">
                  <span className="text-[9px] font-black uppercase text-white/80 block leading-tight">
                    Mesa
                  </span>
                  <span className="text-base sm:text-lg font-black text-[#f2b632] leading-none block mt-0.5 cacapa-stroke">
                    {engine.ante}/10
                  </span>
                </div>

                <div className="flex-1 bg-[#1b2427] border-2 border-[#0b0710] rounded-xl py-1.5 px-1 text-center">
                  <span className="text-[9px] font-black uppercase text-white/80 block leading-tight">
                    Round
                  </span>
                  <span className="text-base sm:text-lg font-black text-white leading-none block mt-0.5 cacapa-stroke">
                    {engine.shotsTaken + 1}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick ball summary & aim hints */}
            <div className="text-center text-[9px] sm:text-[10px] text-[#9fb4a8] leading-tight select-none pt-0.5">
              <span className="text-[#ffe08a] font-bold block mb-0.5">
                LISAS {lisasCount} · LISTRADAS {listradasCount}
              </span>
              <div>mirar: mouse · segurar: força</div>
              <div>soltar: tacar · dir.: cancelar</div>
            </div>
          </div>

          {/* BOTTOM SECTION: CAIXA DE BOLAS (Cardboard box with 8-ball) */}
          <div className="mt-auto pt-1 flex-shrink-0">
            <button
              onClick={() => setIsBallRackOpen(true)}
              className="w-full group relative flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl bg-gradient-to-b from-[#c68949] via-[#ab7234] to-[#7c4815] border-2 border-[#0b0710] hover:translate-y-[-1px] transition-all cursor-pointer overflow-hidden select-none active:scale-95"
              title="Abrir Caixa de Bolas"
            >
              <div className="absolute inset-x-0 top-0 h-1.5 bg-[#f4e2b8]/35 border-b border-[#8a5d2b]/50 pointer-events-none" />
              <div className="absolute inset-y-0 w-2.5 bg-[#f4e2b8]/20 border-x border-[#8a5d2b]/40 pointer-events-none" />

              <div className="text-[8px] sm:text-[8.5px] font-black text-[#fef08a] tracking-wider uppercase mb-0.5 flex items-center gap-1 z-10">
                <span>📦</span>
                <span>CAIXA DE BOLAS</span>
              </div>

              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#161318] border-2 border-[#0b0710] flex items-center justify-center my-0.5 group-hover:scale-110 transition-transform z-10">
                <div className="absolute top-0.5 left-1.5 w-1.5 h-1 rounded-full bg-white/40 blur-[0.3px]" />
                <div className="w-4 h-4 rounded-full bg-[#fffef0] border border-[#0b0710] flex items-center justify-center">
                  <span className="text-[#0b0710] font-black text-[10px] leading-none">8</span>
                </div>
              </div>

              <span className="text-[7px] sm:text-[7.5px] font-black text-[#fff4d1] uppercase tracking-wider opacity-90 z-10">
                VER BARALHO (15)
              </span>
            </button>
          </div>
        </aside>

        {/* 3. RIGHT GAME AREA: HEADER (JOKERS + NEON) + EXPANDED FULL-SIZE CLOSE-UP TABLE */}
        <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 z-20 justify-start gap-1">
          {/* HEADER: JOKER SLOTS + NEON */}
          <header className="flex items-center justify-between gap-2 h-12 sm:h-14 xl:h-16 flex-shrink-0">
            <div className="w-6 xl:w-10 hidden md:block flex-shrink-0" />

            <div className="flex-1 flex justify-center items-center gap-1.5 sm:gap-2.5">
              {Array.from({ length: 5 }).map((_, idx) => (
                <CacapaJokerSlot
                  key={`joker-slot-${idx}`}
                  card={engine.ownedJokers[idx] || null}
                  index={idx}
                  isActivating={activatingJokerIdx === idx}
                  onOpenDeck={() => setIsBallRackOpen(true)}
                  onSellCard={handleSellJoker}
                  onDropOnSlot={handleReorderJokers}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {engine.isMetaAchieved && !showShop && (
                <button
                  onClick={() => setShowShop(true)}
                  className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider animate-bounce shadow-lg shadow-amber-500/30 cursor-pointer font-cacapa cacapa-stroke-sm"
                >
                  <span>⭐</span>
                  <span>Ir para a Loja!</span>
                </button>
              )}

              <div className="border-2 border-[#3ec1d3] bg-[#140c1c] shadow-[0_0_14px_rgba(62,193,211,0.65)] rounded-xl px-3 py-1 text-center">
                <div className="text-[#ff8fd0] font-black text-xs sm:text-sm xl:text-base tracking-wider drop-shadow-[0_0_8px_#ff3fa4] leading-tight uppercase font-cacapa">
                  {currentTheme?.title || 'BOTECO DO ZÉ'}
                </div>
                <div className="text-[#9ff1ff] font-black text-[7px] sm:text-[8px] xl:text-[9px] tracking-widest drop-shadow-[0_0_6px_#3ec1d3] leading-tight uppercase font-cacapa">
                  {currentTheme?.subtitle || 'CERVEJA GELADA'}
                </div>
              </div>
            </div>
          </header>

          {/* POOL TABLE AREA (ORIGINAL FULL CLOSE-UP ZOOM) */}
          <section className="flex-1 min-h-0 w-full flex items-center justify-center relative p-1 sm:p-1.5 overflow-hidden">
            <PoolCanvas
              engine={engine}
              onShotFired={() => {
                rerender();
              }}
            />
          </section>
        </div>
      </div>

      {/* 4. MODALS (OPÇÕES NO MEIO DA TELA, GAME OVER, BOSS INTRO, TITLE SCREEN, BALL BOX & RULES) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#171d22] border-[4px] border-[#0b0710] shadow-[0_8px_0_rgba(0,0,0,0.6)] rounded-3xl p-5 flex flex-col gap-2 font-cacapa select-none">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b-2 border-[#0b0710]">
              <h3 className="text-base sm:text-lg font-black text-[#f2b632] uppercase tracking-wider cacapa-stroke-sm">
                ⚙ OPÇÕES DO JOGO
              </h3>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-7 h-7 rounded-lg bg-[#2a1a3a] hover:bg-[#3a2a4a] text-[#ffd36a] font-black text-sm flex items-center justify-center border-2 border-[#0b0710] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Lista de Opções */}
            <div className="flex flex-col gap-1.5 py-1 text-xs">
              <button
                onClick={() => {
                  setIsBallRackOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl bg-[#232b30] hover:bg-[#2d373e] text-[#f2b632] font-black flex items-center gap-2.5 border-2 border-[#0b0710] cursor-pointer transition-colors"
              >
                <span className="text-base">📦</span>
                <span>Caixa de Bolas</span>
              </button>

              <button
                onClick={() => {
                  setShowShop(!showShop);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl bg-[#232b30] hover:bg-[#2d373e] text-[#2f86ff] font-black flex items-center gap-2.5 border-2 border-[#0b0710] cursor-pointer transition-colors"
              >
                <span className="text-base">🛒</span>
                <span>{showShop ? 'Voltar à Mesa' : 'Abrir Loja'}</span>
              </button>

              <button
                onClick={() => setIsCrtEnabled(!isCrtEnabled)}
                className="w-full text-left px-3 py-2 rounded-xl bg-[#232b30] hover:bg-[#2d373e] text-[#9ff1ff] font-black flex items-center gap-2.5 border-2 border-[#0b0710] cursor-pointer transition-colors"
              >
                <span className="text-base">📺</span>
                <span>{isCrtEnabled ? 'Efeito CRT: LIGADO' : 'Efeito CRT: DESLIGADO'}</span>
              </button>

              <button
                onClick={() => {
                  setIsTitleOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl bg-[#232b30] hover:bg-[#2d373e] text-[#ffd36a] font-black flex items-center gap-2.5 border-2 border-[#0b0710] cursor-pointer transition-colors"
              >
                <span className="text-base">🎱</span>
                <span>Tela Inicial (Arcade)</span>
              </button>

              <button
                onClick={() => {
                  engine.rerack();
                  setIsMenuOpen(false);
                  rerender();
                }}
                disabled={engine.reracksRemaining <= 0}
                className={`w-full text-left px-3 py-2 rounded-xl bg-[#232b30] border-2 border-[#0b0710] font-black flex items-center gap-2.5 transition-colors ${
                  engine.reracksRemaining > 0
                    ? 'hover:bg-[#2d373e] text-[#ffd36a] cursor-pointer'
                    : 'opacity-40 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span className="text-base">🔄</span>
                <span>Rearrumar Mesa ({engine.reracksRemaining})</span>
              </button>

              <button
                onClick={handleToggleSound}
                className="w-full text-left px-3 py-2 rounded-xl bg-[#232b30] hover:bg-[#2d373e] text-white font-black flex items-center gap-2.5 border-2 border-[#0b0710] cursor-pointer transition-colors"
              >
                <span className="text-base">{isMuted ? '🔇' : '🔊'}</span>
                <span>{isMuted ? 'Ativar Efeitos' : 'Mutar Efeitos'}</span>
              </button>

              <button
                onClick={handleToggleMusic}
                className="w-full text-left px-3 py-2 rounded-xl bg-[#232b30] hover:bg-[#2d373e] text-[#f2b632] font-black flex items-center gap-2.5 border-2 border-[#0b0710] cursor-pointer transition-colors"
              >
                <span className="text-base">{isMusicMuted ? '🎵❌' : '🎷'}</span>
                <span>{isMusicMuted ? 'Tocar Caçapa Jazz (M)' : 'Mutar Música (M)'}</span>
              </button>

              <button
                onClick={() => {
                  setIsHelpOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl bg-[#232b30] hover:bg-[#2d373e] text-[#9fb4a8] font-black flex items-center gap-2.5 border-2 border-[#0b0710] cursor-pointer transition-colors"
              >
                <span className="text-base">📖</span>
                <span>Regras e Dicas</span>
              </button>

              <div className="h-px bg-[#0b0710] my-1" />

              <button
                onClick={() => {
                  engine.startNewGame();
                  setIsMenuOpen(false);
                  setShowShop(false);
                  rerender();
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#e0392b]/20 text-[#ff5a4a] font-black flex items-center gap-2.5 border-2 border-transparent hover:border-[#e0392b]/40 cursor-pointer transition-colors"
              >
                <span className="text-base">🔄</span>
                <span>Reiniciar Partida</span>
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#2d373e] text-slate-400 font-black flex items-center gap-2.5 border-2 border-transparent cursor-pointer transition-colors"
              >
                <span className="text-base">🏠</span>
                <span>Sair p/ Início</span>
              </button>
            </div>

            {/* Botão de Fechar / Voltar ao Jogo */}
            <button
              onClick={() => setIsMenuOpen(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#2f86ff] hover:bg-[#4aa3ff] border-[3px] border-[#0b0710] shadow-[0_3px_0_rgba(0,0,0,0.45)] text-white font-black text-sm uppercase tracking-wider transition-all active:scale-95 cursor-pointer cacapa-stroke-sm mt-1"
            >
              VOLTAR AO JOGO
            </button>
          </div>
        </div>
      )}

      {/* 4. MODALS (GAME OVER, BOSS INTRO, TITLE SCREEN, BALL BOX & RULES) */}
      {(engine.state === 'GAME_OVER' || engine.state === 'VICTORY') && (
        <GameOverModal
          engine={engine}
          onRestart={() => {
            engine.startNewGame();
            setShowShop(false);
            rerender();
          }}
        />
      )}

      {/* Boss Intro Modal */}
      <BossIntroModal
        isOpen={isBossIntroOpen}
        onClose={() => setIsBossIntroOpen(false)}
        engine={engine}
      />

      {/* Title Screen Arcade Modal */}
      <TitleScreenModal
        isOpen={isTitleOpen}
        onPlay={() => setIsTitleOpen(false)}
        onHelp={() => {
          setIsTitleOpen(false);
          setIsHelpOpen(true);
        }}
        onToggleSound={() => {
          handleToggleSound();
          handleToggleMusic();
        }}
        isMuted={isMuted && isMusicMuted}
      />

      {/* Help Modal */}
      <PoolHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Ball Rack & Caixa de Bolas Modal */}
      <BallRackModal
        isOpen={isBallRackOpen}
        onClose={() => setIsBallRackOpen(false)}
        engine={engine}
        canUpgrade={engine.state === 'SHOP' || showShop}
        onUpdate={rerender}
      />
    </div>
  );
}

