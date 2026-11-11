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
import { CRTEffects } from '../components/pool/CRTEffects';
import { AMBIENT_THEMES } from '../game/scenes/TableScenes';

export const ASIDE_HEIGHT_SCALE = 2.4;

const hScale = (px: number) => `${Math.max(1, Math.round(px * ASIDE_HEIGHT_SCALE))}px`;

export function PoolPage() {
  const navigate = useNavigate();

    const [engine] = useState(() => new CacapaPoolEngine());

    const [, setTick] = useState(0);
  const rerender = () => setTick((t) => t + 1);

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

    useEffect(() => {
    if (engine.sound.musicEnabled) {
      engine.sound.startMusic();
    }

    return () => {
      engine.destroy();
    };
  }, [engine]);

    useEffect(() => {
    engine.onStateChange = () => {
      rerender();
    };
  }, [engine]);

  useEffect(() => {
    engine.onShotScored = () => {
      setScorePop(true);
      setTimeout(() => setScorePop(false), 350);

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

    useEffect(() => {
    if (engine.blindType === 'Boss Blind' && lastSeenBossAnte !== engine.ante) {
      setIsBossIntroOpen(true);
      setLastSeenBossAnte(engine.ante);
    }
  }, [engine.blindType, engine.ante, lastSeenBossAnte]);

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

                {isMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150 select-none font-cacapa">
            <div className="w-full max-w-lg sm:max-w-xl bg-[#171d22] border-[5px] border-[#0b0710] shadow-[0_10px_0_rgba(0,0,0,0.6)] rounded-3xl p-6 sm:p-8 flex flex-col gap-3 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#0b0710]">
                <h3 className="text-xl sm:text-2xl font-black text-[#f2b632] uppercase tracking-wider cacapa-stroke-sm flex items-center gap-2">
                  <span>⚙</span> OPÇÕES DO JOGO
                </h3>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#2a1a3a] hover:bg-[#3a2a4a] text-[#ffd36a] font-black text-lg flex items-center justify-center border-2 border-[#0b0710] cursor-pointer active:scale-95 transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-2 py-1 text-sm sm:text-base">
                <button
                  onClick={() => {
                    setIsBallRackOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl bg-[#232b30] hover:bg-[#2d373e] text-[#f2b632] font-black flex items-center gap-3.5 border-2 border-[#0b0710] cursor-pointer transition-colors active:scale-98"
                >
                  <span className="text-2xl">📦</span>
                  <span>Caixa de Bolas</span>
                </button>

                <button
                  onClick={() => {
                    setShowShop(false);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl bg-[#232b30] hover:bg-[#2d373e] text-[#2f86ff] font-black flex items-center gap-3.5 border-2 border-[#0b0710] cursor-pointer transition-colors active:scale-98"
                >
                  <span className="text-2xl">🎱</span>
                  <span>Voltar à Mesa de Sinuca</span>
                </button>

                <button
                  onClick={() => setIsCrtEnabled(!isCrtEnabled)}
                  className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl bg-[#232b30] hover:bg-[#2d373e] text-[#9ff1ff] font-black flex items-center gap-3.5 border-2 border-[#0b0710] cursor-pointer transition-colors active:scale-98"
                >
                  <span className="text-2xl">📺</span>
                  <span>{isCrtEnabled ? 'Efeito CRT: LIGADO' : 'Efeito CRT: DESLIGADO'}</span>
                </button>

                <button
                  onClick={handleToggleSound}
                  className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl bg-[#232b30] hover:bg-[#2d373e] text-white font-black flex items-center gap-3.5 border-2 border-[#0b0710] cursor-pointer transition-colors active:scale-98"
                >
                  <span className="text-2xl">{isMuted ? '🔇' : '🔊'}</span>
                  <span>{isMuted ? 'Ativar Efeitos Sonoros' : 'Mutar Efeitos Sonoros'}</span>
                </button>

                <button
                  onClick={handleToggleMusic}
                  className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl bg-[#232b30] hover:bg-[#2d373e] text-[#f2b632] font-black flex items-center gap-3.5 border-2 border-[#0b0710] cursor-pointer transition-colors active:scale-98"
                >
                  <span className="text-2xl">{isMusicMuted ? '🎵❌' : '🎷'}</span>
                  <span>{isMusicMuted ? 'Tocar Caçapa Jazz (M)' : 'Mutar Música (M)'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsHelpOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl bg-[#232b30] hover:bg-[#2d373e] text-[#9fb4a8] font-black flex items-center gap-3.5 border-2 border-[#0b0710] cursor-pointer transition-colors active:scale-98"
                >
                  <span className="text-2xl">📖</span>
                  <span>Regras e Dicas</span>
                </button>

                <div className="h-[2px] bg-[#0b0710] my-1" />

                <button
                  onClick={() => {
                    engine.startNewGame();
                    setIsMenuOpen(false);
                    setShowShop(false);
                    rerender();
                  }}
                  className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl hover:bg-[#e0392b]/20 text-[#ff5a4a] font-black flex items-center gap-3.5 border-2 border-transparent hover:border-[#e0392b]/40 cursor-pointer transition-colors active:scale-98"
                >
                  <span className="text-2xl">🔄</span>
                  <span>Reiniciar Partida</span>
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl hover:bg-[#2d373e] text-slate-400 font-black flex items-center gap-3.5 border-2 border-transparent cursor-pointer transition-colors active:scale-98"
                >
                  <span className="text-2xl">🏠</span>
                  <span>Sair p/ Início</span>
                </button>
              </div>

              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-full py-4 px-6 rounded-2xl bg-[#2f86ff] hover:bg-[#4aa3ff] border-[4px] border-[#0b0710] shadow-[0_4px_0_rgba(0,0,0,0.45)] text-white font-black text-base sm:text-lg uppercase tracking-wider transition-all active:scale-95 cursor-pointer cacapa-stroke-sm mt-2"
              >
                VOLTAR AO JOGO
              </button>
            </div>
          </div>
        )}

                <BallRackModal
          isOpen={isBallRackOpen}
          onClose={() => setIsBallRackOpen(false)}
          engine={engine}
          onUpdate={rerender}
        />

                <PoolHelpModal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
        />

        <CRTEffects enabled={isCrtEnabled} intensity={1.0} />
      </div>
    );
  }

  const tableIndex = Math.max(0, engine.ante - 1) % AMBIENT_THEMES.length;
  const currentTheme = AMBIENT_THEMES[tableIndex];
  const currentBossRule = engine.currentBossRule;

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

    return (
    <div className="w-screen h-screen max-h-screen overflow-hidden bg-[#0b0710] text-slate-100 flex items-center justify-center p-0 select-none font-sans relative">
      <div id="w" className={`relative flex p-1.5 sm:p-2 xl:p-2.5 gap-2 sm:gap-2.5 z-10 ${!isCrtEnabled ? 'nocrt' : ''}`}>
                <CacapaBackground tableIndex={tableIndex} />

                <aside
          className="w-[23%] min-w-[240px] xl:min-w-[280px] max-w-[340px] flex-shrink-0 flex flex-col justify-center h-full select-none z-20 font-cacapa"
          style={{ gap: hScale(7) }}
        >
          {/* TOP ANTE & SCORE CARDS */}
          <div className="flex flex-col flex-shrink-0" style={{ gap: hScale(5) }}>
            {/* ANTE / BOSS INFO */}
            <div className="bg-[#1b2427] border-[4px] border-[#0b0710] rounded-2xl overflow-hidden flex flex-col shadow-[0_4px_0_rgba(0,0,0,0.5)]">
              <div
                className={`px-3 text-center border-b-[3px] border-[#0b0710] ${
                  engine.blindType === 'Boss Blind'
                    ? 'bg-[#cf3226]'
                    : 'bg-[#2563eb]'
                }`}
                style={{ paddingTop: hScale(4), paddingBottom: hScale(4) }}
              >
                <h3 className="text-base sm:text-lg xl:text-xl font-black text-white uppercase tracking-wider cacapa-stroke leading-tight truncate">
                  {currentBossRule?.name || currentTheme?.title || `Mesa ${engine.ante}`}
                </h3>
                <span className="text-xs sm:text-sm text-white/95 font-bold block leading-none mt-1 truncate">
                  {currentBossRule?.headers?.[0] || `Mesa ${engine.ante} de 10`}
                </span>
              </div>

              <div
                className="px-2.5 flex items-center gap-2.5 bg-[#171d22]"
                style={{ paddingTop: hScale(7), paddingBottom: hScale(7) }}
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-[3px] border-[#0b0710] flex items-center justify-center flex-shrink-0 shadow-inner ${
                    engine.blindType === 'Boss Blind'
                      ? 'bg-[#991b1b] text-red-200'
                      : 'bg-[#1e3a8a] text-blue-200'
                  }`}
                >
                  <span className="font-black text-2xl sm:text-3xl cacapa-stroke">
                    {engine.blindType === 'Boss Blind' ? '☠' : '🎱'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-[#9fb4a8] block leading-none uppercase">
                    Meta
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-[#ff5a4a] leading-tight flex items-center gap-1.5 cacapa-stroke my-0.5">
                    <span className="text-sm sm:text-base">✳</span>
                    <span>{engine.targetScore.toLocaleString()}</span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#f2b632] block leading-none">
                    Recompensa: <span className="font-black text-sm sm:text-base">${3 + Math.max(0, engine.shotsRemaining)}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* PONTUAÇÃO ATUAL */}
            <div className="bg-[#1b2427] border-[4px] border-[#0b0710] rounded-2xl overflow-hidden flex items-stretch shadow-[0_4px_0_rgba(0,0,0,0.5)]">
              <div
                className="bg-[#cf3226] border-r-[3px] border-[#0b0710] px-3 flex flex-col items-center justify-center text-center flex-shrink-0 min-w-[85px] sm:min-w-[95px]"
                style={{ paddingTop: hScale(5), paddingBottom: hScale(5) }}
              >
                <span className="text-xs sm:text-sm xl:text-base font-black text-white uppercase leading-none cacapa-stroke-sm">
                  Pontuação
                </span>
              </div>
              <div
                className="flex-1 bg-[#14181c] px-3 flex items-center justify-center gap-2 min-w-0"
                style={{ paddingTop: hScale(5), paddingBottom: hScale(5) }}
              >
                <span className="text-base sm:text-xl text-white/75 font-black">✳</span>
                <span className="text-3xl sm:text-4xl xl:text-5xl font-black text-white tracking-tight cacapa-stroke leading-none">
                  {engine.currentScore.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* GAME CONTROLS & STATS BOARD */}
          <div className="flex flex-col gap-0 flex-shrink-0">
            <div
              className="bg-[#171d22] border-[4px] border-[#0b0710] rounded-2xl px-2.5 sm:px-3 flex flex-col font-cacapa select-none overflow-hidden shadow-[0_5px_0_rgba(0,0,0,0.5)]"
              style={{
                paddingTop: hScale(8),
                paddingBottom: hScale(8),
                gap: hScale(6),
              }}
            >
              {/* LAST HAND + CHIPS × MULT */}
              <div
                className="bg-[#1b2427] border-[3px] border-[#0b0710] rounded-xl px-2.5 flex flex-col gap-1.5 shadow-inner"
                style={{ paddingTop: hScale(6), paddingBottom: hScale(6) }}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm sm:text-base font-black text-white cacapa-stroke truncate">
                    {engine.lastHandName || 'Tacada'}
                  </span>
                  <span className="text-xs font-black text-[#38bdf8] bg-[#0c2a44] px-1.5 py-0.5 rounded border border-[#38bdf8]/50">
                    lvl.1
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <div
                    className={`flex-1 bg-[#0080ff] border-[3px] border-[#0b0710] rounded-xl px-2 text-center transition-transform ${
                      scorePop ? 'animate-counter-pop' : ''
                    }`}
                    style={{ paddingTop: hScale(4), paddingBottom: hScale(4) }}
                  >
                    <span className="text-2xl sm:text-3xl font-black text-white leading-none block cacapa-stroke">
                      {engine.lastChips}
                    </span>
                  </div>

                  <span className="text-[#ff3b30] font-black text-2xl sm:text-3xl px-1 cacapa-stroke">
                    ×
                  </span>

                  <div
                    className={`flex-1 ${multStyle.bg} border-[3px] border-[#0b0710] rounded-xl px-2 text-center transition-transform ${
                      scorePop ? 'animate-counter-pop' : ''
                    }`}
                    style={{ paddingTop: hScale(4), paddingBottom: hScale(4) }}
                  >
                    <span className="text-2xl sm:text-3xl font-black text-white leading-none block cacapa-stroke">
                      {engine.lastMult}
                    </span>
                  </div>
                </div>
              </div>

              {/* STATS BUTTONS & COUNTERS */}
              <div className="flex flex-col" style={{ gap: hScale(5) }}>
                {/* HANDS & FALTAS */}
                <div className="flex gap-2 items-stretch">
                  <div
                    className="flex-1 bg-[#1b2427] border-[3px] border-[#0b0710] rounded-xl px-2 text-center shadow-inner"
                    style={{ paddingTop: hScale(5), paddingBottom: hScale(5) }}
                  >
                    <span className="text-xs sm:text-sm font-black uppercase text-white/80 block leading-tight">
                      Hands
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-[#2f86ff] leading-none block mt-1 cacapa-stroke">
                      {engine.shotsRemaining}
                    </span>
                  </div>

                  <div
                    className="flex-1 bg-[#1b2427] border-[3px] border-[#0b0710] rounded-xl px-2 text-center shadow-inner"
                    style={{ paddingTop: hScale(5), paddingBottom: hScale(5) }}
                  >
                    <span className="text-xs sm:text-sm font-black uppercase text-white/80 block leading-tight">
                      Faltas
                    </span>
                    <span
                      className={`text-2xl sm:text-3xl font-black leading-none block mt-1 cacapa-stroke ${
                        engine.foulCount >= 4 ? 'text-[#ff3b30] animate-pulse' : 'text-[#ff5a4a]'
                      }`}
                    >
                      {engine.foulCount}/5
                    </span>
                  </div>
                </div>

                {/* DINHEIRO */}
                <div
                  className="bg-[#1b2427] border-[3px] border-[#0b0710] rounded-xl px-3 flex items-center justify-center shadow-inner"
                  style={{ paddingTop: hScale(5), paddingBottom: hScale(5) }}
                >
                  <span className="text-2xl sm:text-3xl xl:text-4xl font-black text-[#f2b632] leading-none cacapa-stroke">
                    ${engine.money}
                  </span>
                </div>

                {/* OPÇÕES & ROUND */}
                <div className="flex gap-2 items-stretch">
                  <button
                    onClick={() => setIsMenuOpen(true)}
                    className="flex-1 bg-[#d97706] hover:bg-[#b45309] active:scale-95 border-[3px] border-[#0b0710] rounded-xl px-2 text-center transition-all cursor-pointer flex items-center justify-center shadow-[0_3px_0_rgba(0,0,0,0.45)]"
                    style={{ paddingTop: hScale(5), paddingBottom: hScale(5) }}
                    title="Abrir Menu de Opções"
                  >
                    <span className="text-xs sm:text-sm xl:text-base font-black text-white uppercase cacapa-stroke-sm">
                      Opções
                    </span>
                  </button>

                  <div
                    className="flex-1 bg-[#1b2427] border-[3px] border-[#0b0710] rounded-xl px-1.5 text-center shadow-inner"
                    style={{ paddingTop: hScale(5), paddingBottom: hScale(5) }}
                  >
                    <span className="text-xs sm:text-sm font-black uppercase text-white/80 block leading-tight">
                      Round
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-white leading-none block mt-0.5 cacapa-stroke">
                      {engine.shotsTaken + 1}
                    </span>
                  </div>
                </div>
              </div>

              {/* CONTROLS HINTS */}
              <div
                className="text-center text-xs sm:text-sm text-[#9fb4a8] leading-tight select-none"
                style={{ paddingTop: hScale(2) }}
              >
                <span className="text-[#ffe08a] font-black block mb-1">
                  LISAS {lisasCount} · LISTRADAS {listradasCount}
                </span>
                <div className="text-[11px] sm:text-xs">mirar: mouse · segurar: força</div>
                <div className="text-[11px] sm:text-xs">soltar: tacar · dir.: cancelar</div>
              </div>
            </div>

            {/* CAIXA DE BOLAS BUTTON */}
            <div className="flex-shrink-0" style={{ marginTop: hScale(4) }}>
              <button
                onClick={() => setIsBallRackOpen(true)}
                className="w-full group relative flex flex-col items-center justify-center px-2 sm:px-3 rounded-2xl bg-gradient-to-b from-[#c68949] via-[#ab7234] to-[#7c4815] border-[4px] border-[#0b0710] hover:translate-y-[-1px] transition-all cursor-pointer overflow-hidden select-none active:scale-95 shadow-[0_4px_0_rgba(0,0,0,0.5)]"
                style={{ paddingTop: hScale(6), paddingBottom: hScale(6) }}
                title="Abrir Caixa de Bolas"
              >
                <div className="absolute inset-x-0 top-0 h-1.5 bg-[#f4e2b8]/35 border-b border-[#8a5d2b]/50 pointer-events-none" />
                <div className="absolute inset-y-0 w-3 bg-[#f4e2b8]/20 border-x border-[#8a5d2b]/40 pointer-events-none" />

                <div className="text-xs sm:text-sm font-black text-[#fef08a] tracking-wider uppercase mb-1 flex items-center gap-1.5 z-10">
                  <span>📦</span>
                  <span>CAIXA DE BOLAS</span>
                </div>

                <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#161318] border-[3px] border-[#0b0710] flex items-center justify-center my-0.5 group-hover:scale-110 transition-transform z-10 shadow-lg">
                  <div className="absolute top-1 left-2 w-2 h-1 rounded-full bg-white/40 blur-[0.3px]" />
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#fffef0] flex items-center justify-center shadow-inner">
                    <span className="text-[#0b0710] font-black text-xs sm:text-sm leading-none">8</span>
                  </div>
                </div>

                <span className="text-[10px] sm:text-xs font-black text-[#fff4d1] uppercase tracking-wider opacity-95 z-10">
                  VER BARALHO (15)
                </span>
              </button>
            </div>
          </div>
        </aside>

        {/* MESA PRINCIPAL E JOKERS */}
        <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 z-20 justify-start gap-1">
          {/* HEADER COM CORINGAS */}
          <header className="flex items-center justify-between gap-3 h-24 sm:h-28 xl:h-36 flex-shrink-0">
            <div className="w-6 xl:w-10 hidden md:block flex-shrink-0" />

            <div className="flex-1 flex justify-center items-center gap-2 sm:gap-3 xl:gap-4">
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

            <div className="flex items-center gap-2.5 flex-shrink-0">
              {engine.isMetaAchieved && !showShop && (
                <button
                  onClick={() => setShowShop(true)}
                  className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm uppercase tracking-wider animate-bounce shadow-lg shadow-amber-500/30 cursor-pointer font-cacapa cacapa-stroke-sm border-[3px] border-[#0b0710]"
                >
                  <span className="text-base">⭐</span>
                  <span>Ir para a Loja!</span>
                </button>
              )}

              <div className="border-[4px] border-[#3ec1d3] bg-[#140c1c] shadow-[0_0_16px_rgba(62,193,211,0.65)] rounded-2xl px-4 py-1.5 text-center">
                <div className="text-[#ff8fd0] font-black text-sm sm:text-base xl:text-lg tracking-wider drop-shadow-[0_0_8px_#ff3fa4] leading-tight uppercase font-cacapa">
                  {currentTheme?.title || 'BOTECO DO ZÉ'}
                </div>
                <div className="text-[#9ff1ff] font-black text-[9px] sm:text-[10px] xl:text-xs tracking-widest drop-shadow-[0_0_6px_#3ec1d3] leading-tight uppercase font-cacapa">
                  {currentTheme?.subtitle || 'CERVEJA GELADA'}
                </div>
              </div>
            </div>
          </header>

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

            {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150 select-none font-cacapa">
          <div className="w-full max-w-lg sm:max-w-xl bg-[#171d22] border-[5px] border-[#0b0710] shadow-[0_10px_0_rgba(0,0,0,0.6)] rounded-3xl p-6 sm:p-8 flex flex-col gap-3 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#0b0710]">
              <h3 className="text-xl sm:text-2xl font-black text-[#f2b632] uppercase tracking-wider cacapa-stroke-sm flex items-center gap-2">
                <span>⚙</span> OPÇÕES DO JOGO
              </h3>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#2a1a3a] hover:bg-[#3a2a4a] text-[#ffd36a] font-black text-lg flex items-center justify-center border-2 border-[#0b0710] cursor-pointer active:scale-95 transition-all"
              >
                ✕
              </button>
            </div>

            {/* Menu items */}
            <div className="flex flex-col gap-2 py-1 text-sm sm:text-base">
              <button
                onClick={() => {
                  setIsBallRackOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl bg-[#232b30] hover:bg-[#2d373e] text-[#f2b632] font-black flex items-center gap-3.5 border-2 border-[#0b0710] cursor-pointer transition-colors active:scale-98"
              >
                <span className="text-2xl">📦</span>
                <span>Caixa de Bolas</span>
              </button>

              <button
                onClick={() => {
                  setShowShop(!showShop);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl bg-[#232b30] hover:bg-[#2d373e] text-[#2f86ff] font-black flex items-center gap-3.5 border-2 border-[#0b0710] cursor-pointer transition-colors active:scale-98"
              >
                <span className="text-2xl">🛒</span>
                <span>{showShop ? 'Voltar à Mesa' : 'Abrir Loja'}</span>
              </button>

              <button
                onClick={() => setIsCrtEnabled(!isCrtEnabled)}
                className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl bg-[#232b30] hover:bg-[#2d373e] text-[#9ff1ff] font-black flex items-center gap-3.5 border-2 border-[#0b0710] cursor-pointer transition-colors active:scale-98"
              >
                <span className="text-2xl">📺</span>
                <span>{isCrtEnabled ? 'Efeito CRT: LIGADO' : 'Efeito CRT: DESLIGADO'}</span>
              </button>

              <button
                onClick={() => {
                  setIsTitleOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl bg-[#232b30] hover:bg-[#2d373e] text-[#ffd36a] font-black flex items-center gap-3.5 border-2 border-[#0b0710] cursor-pointer transition-colors active:scale-98"
              >
                <span className="text-2xl">🎱</span>
                <span>Tela Inicial (Arcade)</span>
              </button>

              <button
                onClick={() => {
                  engine.rerack();
                  setIsMenuOpen(false);
                  rerender();
                }}
                disabled={engine.reracksRemaining <= 0}
                className={`w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl bg-[#232b30] border-2 border-[#0b0710] font-black flex items-center gap-3.5 transition-colors active:scale-98 ${
                  engine.reracksRemaining > 0
                    ? 'hover:bg-[#2d373e] text-[#ffd36a] cursor-pointer'
                    : 'opacity-40 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span className="text-2xl">🔄</span>
                <span>Rearrumar Mesa ({engine.reracksRemaining})</span>
              </button>

              <button
                onClick={handleToggleSound}
                className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl bg-[#232b30] hover:bg-[#2d373e] text-white font-black flex items-center gap-3.5 border-2 border-[#0b0710] cursor-pointer transition-colors active:scale-98"
              >
                <span className="text-2xl">{isMuted ? '🔇' : '🔊'}</span>
                <span>{isMuted ? 'Ativar Efeitos Sonoros' : 'Mutar Efeitos Sonoros'}</span>
              </button>

              <button
                onClick={handleToggleMusic}
                className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl bg-[#232b30] hover:bg-[#2d373e] text-[#f2b632] font-black flex items-center gap-3.5 border-2 border-[#0b0710] cursor-pointer transition-colors active:scale-98"
              >
                <span className="text-2xl">{isMusicMuted ? '🎵❌' : '🎷'}</span>
                <span>{isMusicMuted ? 'Tocar Caçapa Jazz (M)' : 'Mutar Música (M)'}</span>
              </button>

              <button
                onClick={() => {
                  setIsHelpOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl bg-[#232b30] hover:bg-[#2d373e] text-[#9fb4a8] font-black flex items-center gap-3.5 border-2 border-[#0b0710] cursor-pointer transition-colors active:scale-98"
              >
                <span className="text-2xl">📖</span>
                <span>Regras e Dicas</span>
              </button>

              <div className="h-[2px] bg-[#0b0710] my-1" />

              <button
                onClick={() => {
                  engine.startNewGame();
                  setIsMenuOpen(false);
                  setShowShop(false);
                  rerender();
                }}
                className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl hover:bg-[#e0392b]/20 text-[#ff5a4a] font-black flex items-center gap-3.5 border-2 border-transparent hover:border-[#e0392b]/40 cursor-pointer transition-colors active:scale-98"
              >
                <span className="text-2xl">🔄</span>
                <span>Reiniciar Partida</span>
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl hover:bg-[#2d373e] text-slate-400 font-black flex items-center gap-3.5 border-2 border-transparent cursor-pointer transition-colors active:scale-98"
              >
                <span className="text-2xl">🏠</span>
                <span>Sair p/ Início</span>
              </button>
            </div>

            <button
              onClick={() => setIsMenuOpen(false)}
              className="w-full py-4 px-6 rounded-2xl bg-[#2f86ff] hover:bg-[#4aa3ff] border-[4px] border-[#0b0710] shadow-[0_4px_0_rgba(0,0,0,0.45)] text-white font-black text-base sm:text-lg uppercase tracking-wider transition-all active:scale-95 cursor-pointer cacapa-stroke-sm mt-2"
            >
              VOLTAR AO JOGO
            </button>
          </div>
        </div>
      )}

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

            <BossIntroModal
        isOpen={isBossIntroOpen}
        onClose={() => setIsBossIntroOpen(false)}
        engine={engine}
      />

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

            <PoolHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

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

