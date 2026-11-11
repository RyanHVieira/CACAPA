import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CacapaPoolEngine } from '../game/engine/CacapaPoolEngine';
import { PoolCanvas } from '../components/pool/PoolCanvas';
import { CacapaShop } from '../components/pool/CacapaShop';
import { GameOverModal } from '../components/pool/GameOverModal';
import { PoolHelpModal } from '../components/pool/PoolHelpModal';
import { BallRackModal } from '../components/pool/BallRackModal';
import { CacapaBackground } from '../components/pool/CacapaBackground';
import { CacapaJokerSlot } from '../components/pool/CacapaJokerSlot';
import { ConsumableSlot } from '../components/pool/ConsumableSlot';
import { ConsumableTargetModal } from '../components/pool/ConsumableTargetModal';
import { BossIntroModal } from '../components/pool/BossIntroModal';
import { TitleScreenModal } from '../components/pool/TitleScreenModal';
import { JokerCollectionModal } from '../components/pool/JokerCollectionModal';
import { EncyclopediaModal, type EncyclopediaTab } from '../components/pool/EncyclopediaModal';
import { AdminDebugModal } from '../components/pool/AdminDebugModal';
import { CueManager } from '../game/cues/CueManager';
import { CRTEffects } from '../components/pool/CRTEffects';
import { AMBIENT_THEMES } from '../game/scenes/TableScenes';
import { GlobalFpsCounter } from '../components/pool/GlobalFpsCounter';

export const ASIDE_HEIGHT_SCALE = 2.4;

/**
 * =========================================================================
 * ⚙️ VARIÁVEL DE TAMANHO DA DIV DE CORINGAS E CONSUMÍVEIS (HEADER)
 * =========================================================================
 * Altere este valor para redimensionar toda a div de coringas e consumíveis.
 * Localização: frontend/src/pages/PoolPage.tsx (Linha ~32)
 *
 * Exemplos:
 *   1.0  = 100% (tamanho padrão)
 *   1.15 = 115% (15% maior)
 *   1.25 = 125% (25% maior)
 *   0.85 = 85%  (15% menor)
 */
export const JOKER_AND_CONSUMABLE_BAR_SCALE = 1.0;

const hScale = (px: number) => `${Math.max(1, Math.round(px * ASIDE_HEIGHT_SCALE))}px`;

export function PoolPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isVox =
    user?.name?.trim().toLowerCase() === 'vox' &&
    user?.id?.trim().toLowerCase() === '38921965-4c35-419f-8f02-9ab6cf86f407';

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
  const [isTitleOpen, setIsTitleOpen] = useState(true);
  const [isBossIntroOpen, setIsBossIntroOpen] = useState(false);
  const [lastSeenBossAnte, setLastSeenBossAnte] = useState<number | null>(null);
  const [activatingJokerIdx, setActivatingJokerIdx] = useState<number | null>(null);
  const [scorePop, setScorePop] = useState(false);
  const [isJokerCollectionOpen, setIsJokerCollectionOpen] = useState(false);
  const [isEncyclopediaOpen, setIsEncyclopediaOpen] = useState(false);
  const [isConsumableTargetModalOpen, setIsConsumableTargetModalOpen] = useState(false);
  const [encyclopediaTab, setEncyclopediaTab] = useState<EncyclopediaTab>('cues');
  const [selectedCueId, setSelectedCueId] = useState<string>(() => CueManager.getSelectedCueId());
  const [tableZoom, setTableZoom] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cacapa_table_zoom');
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val >= 0.8 && val <= 1.5) return val;
      }
    } catch {}
    return 1.0;
  });

  const [selectedBgTheme, setSelectedBgTheme] = useState<string>(() => {
    try {
      return localStorage.getItem('cacapa_selected_bg_theme') || 'auto';
    } catch {
      return 'auto';
    }
  });

  const [showFps, setShowFps] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('cacapa_show_fps');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const handleToggleFps = () => {
    setShowFps((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('cacapa_show_fps', String(next));
      } catch {}
      return next;
    });
  };

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const konamiIndexRef = useRef<number>(0);

  // Código Konami sem B A (apenas as setas: Cima Cima Baixo Baixo Esquerda Direita Esquerda Direita)
  // Restrito exclusivamente ao usuário Vox com o id 38921965-4c35-419f-8f02-9ab6cf86f407
  useEffect(() => {
    const KONAMI_ARROWS = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
    ];

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'Escape' && isAdminOpen) {
        setIsAdminOpen(false);
        return;
      }

      if (e.key === KONAMI_ARROWS[konamiIndexRef.current]) {
        konamiIndexRef.current++;
        if (konamiIndexRef.current === KONAMI_ARROWS.length) {
          konamiIndexRef.current = 0;
          const isVoxAdmin =
            user?.name?.trim().toLowerCase() === 'vox' &&
            user?.id?.trim().toLowerCase() === '38921965-4c35-419f-8f02-9ab6cf86f407';

          if (isVoxAdmin) {
            setIsAdminOpen((prev) => !prev);
            try {
              engine.sound.playWin();
            } catch {}
          }
        }
      } else {
        konamiIndexRef.current = e.key === KONAMI_ARROWS[0] ? 1 : 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user, engine, isAdminOpen]);

  const handleCycleBackgroundTheme = () => {
    const highest = CueManager.getHighestStageReached();
    const availableOptions: string[] = ['auto'];
    for (let i = 0; i <= highest && i < AMBIENT_THEMES.length; i++) {
      availableOptions.push(i.toString());
    }

    const currentIdx = availableOptions.indexOf(selectedBgTheme);
    const nextIdx = (currentIdx + 1) % availableOptions.length;
    const nextVal = availableOptions[nextIdx];

    setSelectedBgTheme(nextVal);
    try {
      localStorage.setItem('cacapa_selected_bg_theme', nextVal);
    } catch {}
    rerender();
  };

  const getBgThemeLabel = () => {
    const defaultIdx = Math.max(0, engine.ante - 1) % AMBIENT_THEMES.length;
    if (selectedBgTheme === 'auto') {
      return `Automático (Mesa ${defaultIdx + 1})`;
    }
    const idx = parseInt(selectedBgTheme, 10);
    if (!isNaN(idx) && AMBIENT_THEMES[idx]) {
      return `Mesa ${idx + 1}: ${AMBIENT_THEMES[idx].title}`;
    }
    return 'Automático';
  };

  const handleZoomChange = (newZoom: number) => {
    setTableZoom(newZoom);
    try {
      localStorage.setItem('cacapa_table_zoom', newZoom.toString());
    } catch {}
  };

  const handleStartGame = (cueIdToUse?: string) => {
    const cueId = cueIdToUse || CueManager.getSelectedCueId() || selectedCueId || 'iniciante';
    setSelectedCueId(cueId);
    CueManager.setSelectedCueId(cueId);
    engine.startNewGame(cueId);
    setShowShop(false);
    setIsTitleOpen(false);
    rerender();
  };

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
      setTimeout(() => setScorePop(false), 750);

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
    if (engine.areBallsMoving()) return;
    const ok = engine.reorderJokers(fromIdx, toIdx);
    if (ok) {
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

  const handleUseConsumable = () => {
    const cons = engine.ownedConsumable;
    if (!cons) return;
    if (cons.targetType === 'ball') {
      setIsConsumableTargetModalOpen(true);
    } else {
      engine.useConsumable();
      rerender();
    }
  };

  const handleSelectBallTarget = (ballNumber: number) => {
    setIsConsumableTargetModalOpen(false);
    engine.useConsumable(ballNumber);
    rerender();
  };

  const handleSellConsumable = () => {
    engine.sellConsumable();
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
        <GlobalFpsCounter show={showFps} onToggle={handleToggleFps} />

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
          <div className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150 select-none font-cacapa">
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
                    setEncyclopediaTab('jokers');
                    setIsEncyclopediaOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl bg-[#232b30] hover:bg-[#2d373e] text-[#ffd36a] font-black flex items-center gap-3.5 border-2 border-[#0b0710] cursor-pointer transition-colors active:scale-98"
                >
                  <span className="text-2xl">📖</span>
                  <span>Enciclopédia & Compêndio</span>
                </button>

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
                  onClick={handleToggleFps}
                  className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl bg-[#232b30] hover:bg-[#2d373e] text-[#ffd36a] font-black flex items-center gap-3.5 border-2 border-[#0b0710] cursor-pointer transition-colors active:scale-98"
                >
                  <span className="text-2xl">⚡</span>
                  <span>{showFps ? 'Contador de FPS: LIGADO' : 'Contador de FPS: DESLIGADO'}</span>
                </button>

                {/* SLIDER DE ZOOM DA MESA */}
                <div className="w-full px-4 py-3 sm:py-3.5 rounded-2xl bg-[#232b30] border-2 border-[#0b0710] flex flex-col gap-2 select-none">
                  <div className="flex items-center justify-between text-sm sm:text-base font-black text-[#9ff1ff]">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">🔍</span>
                      <span>Zoom da Mesa</span>
                    </div>
                    <span className="bg-[#12181a] px-2.5 py-0.5 rounded-lg border border-[#0b0710] text-[#f2b632] cacapa-stroke-sm">
                      {Math.round(tableZoom * 100)}%
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#9fb4a8] font-bold">80%</span>
                    <input
                      type="range"
                      min="0.8"
                      max="1.5"
                      step="0.05"
                      value={tableZoom}
                      onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                      className="flex-1 h-2.5 bg-[#12181a] rounded-lg appearance-none cursor-pointer accent-[#2f86ff] border border-[#0b0710]"
                    />
                    <span className="text-xs text-[#9fb4a8] font-bold">150%</span>
                    {tableZoom !== 1.0 && (
                      <button
                        onClick={() => handleZoomChange(1.0)}
                        className="px-2 py-0.5 text-xs font-black bg-[#1b2427] hover:bg-[#2a343a] text-slate-300 rounded border border-[#0b0710] cursor-pointer"
                        title="Restaurar zoom padrão para 100%"
                      >
                        100%
                      </button>
                    )}
                  </div>
                </div>

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
                  onClick={handleCycleBackgroundTheme}
                  className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl bg-[#232b30] hover:bg-[#2d373e] text-white font-black flex items-center justify-between border-2 border-[#0b0710] cursor-pointer transition-colors active:scale-98"
                  title="Alternar entre os temas de fundo das fases que você já liberou"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-2xl">🎨</span>
                    <span>Tema de fundo:</span>
                  </div>
                  <span className="bg-[#12181a] px-3 py-1 rounded-xl border border-[#0b0710] text-[#f2b632] text-xs sm:text-sm font-black cacapa-stroke-sm truncate max-w-[210px]">
                    {getBgThemeLabel()}
                  </span>
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
                    setIsMenuOpen(false);
                    setIsTitleOpen(true);
                  }}
                  className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl hover:bg-[#e0392b]/20 text-[#ff5a4a] font-black flex items-center gap-3.5 border-2 border-transparent hover:border-[#e0392b]/40 cursor-pointer transition-colors active:scale-98"
                >
                  <span className="text-2xl">🔄</span>
                  <span>Voltar ao Menu Principal</span>
                </button>

                {isVox && (
                  <>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsAdminOpen(true);
                      }}
                      className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl bg-[#4d1627] hover:bg-[#681e35] text-[#ffd36a] font-black flex items-center justify-between border-2 border-[#b52a4e] cursor-pointer transition-colors active:scale-98"
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="text-2xl">🛠️</span>
                        <span>Painel Debug & Admin</span>
                      </div>
                      <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded font-mono text-slate-300">
                        ↑↑↓↓←→←→
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate('/dashboard');
                      }}
                      className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl bg-[#3b1d60] hover:bg-[#522986] text-[#ffd36a] font-black flex items-center gap-3.5 border-2 border-[#8b3dff] cursor-pointer transition-colors active:scale-98"
                    >
                      <span className="text-2xl">📊</span>
                      <span>Painel Vox (/dashboard)</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl hover:bg-[#2d373e] text-slate-400 font-black flex items-center gap-3.5 border-2 border-transparent cursor-pointer transition-colors active:scale-98"
                >
                  <span className="text-2xl">🚪</span>
                  <span>Sair da Conta ({user?.name || 'Desconectar'})</span>
                </button>
              </div>

              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-full py-4 px-6 rounded-2xl bg-[#2f86ff] hover:bg-[#4aa3ff] border-[4px] border-[#0b0710] shadow-[0_4px_0_rgba(0,0,0,0.45)] text-white font-black text-base sm:text-lg uppercase tracking-wider transition-all active:scale-95 cursor-pointer cacapa-stroke-sm mt-2"
              >
                {isTitleOpen ? 'VOLTAR AO MENU' : 'VOLTAR AO JOGO'}
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

        <JokerCollectionModal
          isOpen={isJokerCollectionOpen}
          onClose={() => setIsJokerCollectionOpen(false)}
        />

        <AdminDebugModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          engine={engine}
          onUpdate={rerender}
          user={user}
        />

        <CRTEffects enabled={isCrtEnabled} intensity={1.0} />
      </div>
    );
  }

  const highestStageReached = CueManager.getHighestStageReached();
  const defaultTableIndex = Math.max(0, engine.ante - 1) % AMBIENT_THEMES.length;
  let effectiveTableIndex = defaultTableIndex;
  if (selectedBgTheme !== 'auto') {
    const parsed = parseInt(selectedBgTheme, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= highestStageReached) {
      effectiveTableIndex = parsed % AMBIENT_THEMES.length;
    }
  }
  const currentTheme = AMBIENT_THEMES[effectiveTableIndex];
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
      <GlobalFpsCounter show={showFps} onToggle={handleToggleFps} />
      <div id="w" className={`relative flex p-1.5 sm:p-2 xl:p-2.5 gap-2 sm:gap-2.5 z-10 ${!isCrtEnabled ? 'nocrt' : ''}`}>
                <CacapaBackground tableIndex={effectiveTableIndex} />

                <aside
          className="w-[25%] min-w-[260px] xl:min-w-[300px] max-w-[360px] flex-shrink-0 flex flex-col justify-center h-full select-none z-30 relative font-cacapa"
          style={{ gap: hScale(6) }}
        >
          {/* TOP UNIFIED STAGE & SCORE / META CARD */}
          <div className="bg-[#1b2427] border-[4px] border-[#0b0710] rounded-2xl overflow-hidden flex flex-col shadow-[0_4px_0_rgba(0,0,0,0.5)] flex-shrink-0">
            {/* 1. TÍTULO DA FASE LOGO EM CIMA */}
            <div
              className={`px-3 text-center border-b-[3px] border-[#0b0710] ${
                engine.blindType === 'Boss Blind'
                  ? 'bg-[#cf3226]'
                  : 'bg-[#2563eb]'
              }`}
              style={{ paddingTop: hScale(4), paddingBottom: hScale(4) }}
            >
              <h3 className="text-lg sm:text-xl xl:text-2xl font-black text-white uppercase tracking-wider cacapa-stroke leading-tight truncate">
                {currentBossRule?.name || currentTheme?.title || `Mesa ${engine.ante}`}
              </h3>
              <span className="text-sm sm:text-base text-white/95 font-bold block leading-none mt-1 truncate">
                {currentBossRule?.headers?.[0] || `Mesa ${engine.ante} de 10`}
              </span>
            </div>

            {/* 2. PONTUAÇÃO / META JUNTOS */}
            <div
              className="bg-[#14181c] px-3.5 border-b-[3px] border-[#0b0710] flex flex-col gap-1"
              style={{ paddingTop: hScale(5), paddingBottom: hScale(6) }}
            >
              {/* Labels & Recompensa */}
              <div className="flex items-center justify-between text-xs sm:text-sm font-black uppercase">
                <div className="flex items-center gap-1.5 text-[#9ff1ff]">
                  <span className="text-sm sm:text-base">✳</span>
                  <span>Pontuação / Meta</span>
                </div>
                <div className="text-xs sm:text-sm text-[#f2b632] font-black">
                  Recompensa: <span className="text-white">${3 + Math.max(0, engine.shotsRemaining)}</span>
                </div>
              </div>

              {/* Placar Pontuação / Meta em destaque */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 my-0.5">
                <span className="text-3xl sm:text-4xl xl:text-5xl font-black text-white cacapa-stroke tracking-tight leading-none">
                  {engine.currentScore.toLocaleString()}
                </span>
                <span className="text-2xl sm:text-3xl xl:text-4xl font-black text-[#9fb4a8]/50 leading-none">
                  /
                </span>
                <span className="text-2xl sm:text-3xl xl:text-4xl font-black text-[#ff5a4a] cacapa-stroke tracking-tight leading-none">
                  {engine.targetScore.toLocaleString()}
                </span>
              </div>
            </div>

            {/* 3. FICHAS × MULTI */}
            <div
              className="bg-[#171d22] px-3 flex flex-col gap-1.5"
              style={{ paddingTop: hScale(5), paddingBottom: hScale(6) }}
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-base sm:text-lg xl:text-xl font-black text-white cacapa-stroke truncate">
                  {engine.lastHandName || 'Tacada'}
                </span>
                <span className="text-xs sm:text-sm font-black text-[#38bdf8] bg-[#0c2a44] px-2 py-0.5 rounded-lg border border-[#38bdf8]/50">
                  lvl.1
                </span>
              </div>

              <div className="flex items-center justify-center gap-2">
                <div
                  className={`flex-1 bg-[#0080ff] border-[3px] border-[#0b0710] rounded-xl px-2 py-1 text-center transition-transform ${
                    scorePop ? 'animate-counter-pop' : ''
                  }`}
                  style={{ paddingTop: hScale(4), paddingBottom: hScale(4) }}
                >
                  <span className="text-2xl sm:text-3xl xl:text-4xl font-black text-white leading-none block cacapa-stroke">
                    {engine.lastChips}
                  </span>
                </div>

                <span className="text-[#ff3b30] font-black text-2xl sm:text-3xl xl:text-4xl px-1 cacapa-stroke">
                  ×
                </span>

                <div
                  className={`flex-1 ${multStyle.bg} border-[3px] border-[#0b0710] rounded-xl px-2 py-1 text-center transition-transform ${
                    scorePop ? 'animate-counter-pop' : ''
                  }`}
                  style={{ paddingTop: hScale(4), paddingBottom: hScale(4) }}
                >
                  <span className="text-2xl sm:text-3xl xl:text-4xl font-black text-white leading-none block cacapa-stroke">
                    {engine.lastMult}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* GAME CONTROLS & STATS BOARD */}
          <div className="flex flex-col gap-0 flex-shrink-0">
            <div
              className="bg-[#171d22] border-[4px] border-[#0b0710] rounded-2xl px-3 flex flex-col font-cacapa select-none overflow-hidden shadow-[0_5px_0_rgba(0,0,0,0.5)]"
              style={{
                paddingTop: hScale(7),
                paddingBottom: hScale(7),
                gap: hScale(5),
              }}
            >
              {/* STATS BUTTONS & COUNTERS */}
              <div className="flex flex-col" style={{ gap: hScale(5) }}>
                {/* HANDS & FALTAS */}
                <div className="flex gap-2 items-stretch">
                  <div
                    className="flex-1 bg-[#1b2427] border-[3px] border-[#0b0710] rounded-xl px-2 text-center shadow-inner"
                    style={{ paddingTop: hScale(5), paddingBottom: hScale(5) }}
                  >
                    <span className="text-sm sm:text-base font-black uppercase text-white/90 block leading-tight">
                      Hands
                    </span>
                    <span className="text-3xl sm:text-4xl xl:text-5xl font-black text-[#2f86ff] leading-none block mt-1 cacapa-stroke">
                      {engine.shotsRemaining}
                    </span>
                  </div>

                  <div
                    className="flex-1 bg-[#1b2427] border-[3px] border-[#0b0710] rounded-xl px-2 text-center shadow-inner"
                    style={{ paddingTop: hScale(5), paddingBottom: hScale(5) }}
                  >
                    <span className="text-sm sm:text-base font-black uppercase text-white/90 block leading-tight">
                      Faltas
                    </span>
                    <span
                      className={`text-3xl sm:text-4xl xl:text-5xl font-black leading-none block mt-1 cacapa-stroke ${
                        engine.foulCount >= engine.maxFouls - 1 ? 'text-[#ff3b30] animate-pulse' : 'text-[#ff5a4a]'
                      }`}
                    >
                      {engine.foulCount}/{engine.maxFouls}
                    </span>
                  </div>
                </div>

                {/* DINHEIRO */}
                <div
                  className="bg-[#1b2427] border-[3px] border-[#0b0710] rounded-xl px-3 flex items-center justify-center shadow-inner"
                  style={{ paddingTop: hScale(5), paddingBottom: hScale(5) }}
                >
                  <span className="text-3xl sm:text-4xl xl:text-5xl font-black text-[#f2b632] leading-none cacapa-stroke">
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
                    <span className="text-sm sm:text-base xl:text-lg font-black text-white uppercase cacapa-stroke-sm">
                      Opções
                    </span>
                  </button>

                  <div
                    className="flex-1 bg-[#1b2427] border-[3px] border-[#0b0710] rounded-xl px-1.5 text-center shadow-inner"
                    style={{ paddingTop: hScale(5), paddingBottom: hScale(5) }}
                  >
                    <span className="text-sm sm:text-base font-black uppercase text-white/90 block leading-tight">
                      Round
                    </span>
                    <span className="text-2xl sm:text-3xl xl:text-4xl font-black text-white leading-none block mt-0.5 cacapa-stroke">
                      {engine.shotsTaken + 1}
                    </span>
                  </div>
                </div>
              </div>

              {/* CONTROLS HINTS */}
              <div
                className="text-center text-sm sm:text-base text-[#9fb4a8] leading-tight select-none"
                style={{ paddingTop: hScale(2) }}
              >
                <span className="text-[#ffe08a] font-black text-sm sm:text-base xl:text-lg block mb-1">
                  LISAS {lisasCount} · LISTRADAS {listradasCount}
                </span>
                <div className="text-xs sm:text-sm font-bold">mirar: mouse · segurar: força</div>
                <div className="text-xs sm:text-sm font-bold">soltar: tacar · dir.: cancelar</div>
              </div>
            </div>

            {/* CAIXA DE BOLAS BUTTON */}
            <div className="flex-shrink-0" style={{ marginTop: hScale(4) }}>
              <button
                onClick={() => setIsBallRackOpen(true)}
                className="w-full group relative flex flex-col items-center justify-center px-3 rounded-2xl bg-gradient-to-b from-[#c68949] via-[#ab7234] to-[#7c4815] border-[4px] border-[#0b0710] hover:translate-y-[-1px] transition-all cursor-pointer overflow-hidden select-none active:scale-95 shadow-[0_4px_0_rgba(0,0,0,0.5)]"
                style={{ paddingTop: hScale(6), paddingBottom: hScale(6) }}
                title="Abrir Caixa de Bolas"
              >
                <div className="absolute inset-x-0 top-0 h-1.5 bg-[#f4e2b8]/35 border-b border-[#8a5d2b]/50 pointer-events-none" />
                <div className="absolute inset-y-0 w-3 bg-[#f4e2b8]/20 border-x border-[#8a5d2b]/40 pointer-events-none" />

                <div className="text-sm sm:text-base xl:text-lg font-black text-[#fef08a] tracking-wider uppercase mb-1 flex items-center gap-2 z-10">
                  <span className="text-lg">📦</span>
                  <span>CAIXA DE BOLAS</span>
                </div>

                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#161318] border-[3px] border-[#0b0710] flex items-center justify-center my-0.5 group-hover:scale-110 transition-transform z-10 shadow-lg">
                  <div className="absolute top-1 left-2 w-2 h-1 rounded-full bg-white/40 blur-[0.3px]" />
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#fffef0] flex items-center justify-center shadow-inner">
                    <span className="text-[#0b0710] font-black text-sm sm:text-base leading-none">8</span>
                  </div>
                </div>
              </button>
            </div>

            {/* BOTÃO ENCICLOPÉDIA */}
            <div className="flex-shrink-0" style={{ marginTop: hScale(3) }}>
              <button
                onClick={() => {
                  setEncyclopediaTab('jokers');
                  setIsEncyclopediaOpen(true);
                }}
                className="group w-full py-3 sm:py-3.5 px-3 rounded-2xl bg-[#8b3dff] hover:bg-[#9d4edd] border-[4px] border-[#0b0710] shadow-[0_5px_0_rgba(0,0,0,0.55)] text-[#ffd36a] font-black text-sm sm:text-base xl:text-lg uppercase tracking-wider transition-all hover:scale-102 active:scale-95 cursor-pointer cacapa-stroke-sm flex items-center justify-center gap-2 select-none"
                title="Abrir Enciclopédia (Coringas, Tacos, Consumíveis, Fases e Bolas)"
              >
                <span className="text-lg sm:text-2xl transition-transform group-hover:scale-110">📖</span>
                <span>ENCICLOPÉDIA</span>
              </button>
            </div>
          </div>
        </aside>

        {/* MESA PRINCIPAL E JOKERS */}
        <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 z-20 justify-start gap-1">
          {/* HEADER COM CORINGAS */}
          <header className="flex items-center justify-between gap-3 h-24 sm:h-28 xl:h-36 flex-shrink-0 z-30 relative pointer-events-auto">
            <div className="w-4 sm:w-12 lg:w-28 flex-shrink-0" />

            {/* CONTAINER COM BACKGROUND PARA CORINGAS E CONSUMÍVEIS */}
            <div className="flex-1 flex justify-center items-center overflow-visible">
              <div
                style={{
                  transform: `scale(${JOKER_AND_CONSUMABLE_BAR_SCALE})`,
                  transformOrigin: 'center center',
                }}
                className="relative flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-3xl bg-gradient-to-b from-[#2a1a10] via-[#1c120c] to-[#120a06] border-[4px] border-[#0b0710] shadow-[0_8px_0_rgba(0,0,0,0.65),inset_0_2px_4px_rgba(255,255,255,0.08)] select-none overflow-visible flex-shrink-0 transition-transform duration-150"
              >
                {/* Brilho superior de verniz de madeira */}
                <div className="absolute inset-x-5 top-1 h-[2px] bg-gradient-to-r from-transparent via-[#ffd36a]/30 to-transparent pointer-events-none" />

                {/* Plaquinha da Prateleira */}
                <div className="absolute -top-3.5 left-5 px-2.5 py-0.5 rounded-lg bg-[#3a2012] border-2 border-[#0b0710] shadow-sm flex items-center gap-1.5 pointer-events-none z-10">
                  <span className="text-[11px] leading-none">🍾</span>
                  <span className="text-[9px] sm:text-[10px] font-black text-[#ffd36a] uppercase tracking-wider font-cacapa leading-none">
                    Prateleira de Bebidas
                  </span>
                </div>

                {/* SLOTS DE CORINGAS (GARRAFAS) */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-visible">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <CacapaJokerSlot
                      key={`joker-slot-${idx}`}
                      card={engine.ownedJokers[idx] || null}
                      index={idx}
                      isActivating={activatingJokerIdx === idx}
                      canDrag={!engine.areBallsMoving()}
                      onOpenDeck={() => setIsBallRackOpen(true)}
                      onSellCard={handleSellJoker}
                      onDropOnSlot={handleReorderJokers}
                    />
                  ))}
                </div>

                {/* DIVISÓRIA DECORATIVA ENTRE CORINGAS E CONSUMÍVEL */}
                <div className="h-20 sm:h-24 w-[3px] bg-gradient-to-b from-transparent via-[#8a5d2b]/70 to-transparent rounded-full mx-0.5 sm:mx-1 flex-shrink-0" />

                {/* SLOT DE CONSUMÍVEL */}
                <div className="overflow-visible flex-shrink-0">
                  <ConsumableSlot
                    consumable={engine.ownedConsumable}
                    onUse={handleUseConsumable}
                    onSell={handleSellConsumable}
                    nextShotMultMultiplier={engine.nextShotMultMultiplier}
                  />
                </div>

                {/* Apoio / rodapé de madeira na base */}
                <div className="absolute inset-x-3 bottom-0.5 h-1 rounded-full bg-gradient-to-r from-[#5a3a22] via-[#8a5d2b] to-[#5a3a22] border-t border-[#3b2314] pointer-events-none opacity-80" />
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0">
              {engine.isMetaAchieved && !showShop && (
                <button
                  onClick={() => setShowShop(true)}
                  className="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-base uppercase tracking-wider animate-bounce shadow-lg shadow-amber-500/30 cursor-pointer font-cacapa cacapa-stroke-sm border-[3px] border-[#0b0710]"
                >
                  <span className="text-xl">⭐</span>
                  <span>Ir para a Loja!</span>
                </button>
              )}

              <div className="border-[4px] border-[#3ec1d3] bg-[#140c1c] shadow-[0_0_16px_rgba(62,193,211,0.65)] rounded-2xl px-4 py-1.5 text-center">
                <div className="text-[#ff8fd0] font-black text-base sm:text-lg xl:text-xl tracking-wider drop-shadow-[0_0_8px_#ff3fa4] leading-tight uppercase font-cacapa">
                  {currentTheme?.title || 'BOTECO DO ZÉ'}
                </div>
                <div className="text-[#9ff1ff] font-black text-xs sm:text-sm xl:text-base tracking-widest drop-shadow-[0_0_6px_#3ec1d3] leading-tight uppercase font-cacapa">
                  {currentTheme?.subtitle || 'CERVEJA GELADA'}
                </div>
              </div>
            </div>
          </header>

                    <section className="flex-1 min-h-0 w-full flex items-center justify-center relative p-1 sm:p-1.5 z-10 overflow-visible">
            <PoolCanvas
              engine={engine}
              zoom={tableZoom}
              onShotFired={() => {
                rerender();
              }}
            />
          </section>
        </div>
      </div>

            {isMenuOpen && (
        <div className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150 select-none font-cacapa">
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
                  setEncyclopediaTab('jokers');
                  setIsEncyclopediaOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl bg-[#232b30] hover:bg-[#2d373e] text-[#ffd36a] font-black flex items-center gap-3.5 border-2 border-[#0b0710] cursor-pointer transition-colors active:scale-98"
              >
                <span className="text-2xl">📖</span>
                <span>Enciclopédia & Compêndio</span>
              </button>

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
                onClick={handleToggleFps}
                className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl bg-[#232b30] hover:bg-[#2d373e] text-[#ffd36a] font-black flex items-center gap-3.5 border-2 border-[#0b0710] cursor-pointer transition-colors active:scale-98"
              >
                <span className="text-2xl">⚡</span>
                <span>{showFps ? 'Contador de FPS: LIGADO' : 'Contador de FPS: DESLIGADO'}</span>
              </button>

              {/* SLIDER DE ZOOM DA MESA */}
              <div className="w-full px-4 py-3 sm:py-3.5 rounded-2xl bg-[#232b30] border-2 border-[#0b0710] flex flex-col gap-2 select-none">
                <div className="flex items-center justify-between text-sm sm:text-base font-black text-[#9ff1ff]">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🔍</span>
                    <span>Zoom da Mesa</span>
                  </div>
                  <span className="bg-[#12181a] px-2.5 py-0.5 rounded-lg border border-[#0b0710] text-[#f2b632] cacapa-stroke-sm">
                    {Math.round(tableZoom * 100)}%
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#9fb4a8] font-bold">80%</span>
                  <input
                    type="range"
                    min="0.8"
                    max="1.5"
                    step="0.05"
                    value={tableZoom}
                    onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                    className="flex-1 h-2.5 bg-[#12181a] rounded-lg appearance-none cursor-pointer accent-[#2f86ff] border border-[#0b0710]"
                  />
                  <span className="text-xs text-[#9fb4a8] font-bold">150%</span>
                  {tableZoom !== 1.0 && (
                    <button
                      onClick={() => handleZoomChange(1.0)}
                      className="px-2 py-0.5 text-xs font-black bg-[#1b2427] hover:bg-[#2a343a] text-slate-300 rounded border border-[#0b0710] cursor-pointer"
                      title="Restaurar zoom padrão para 100%"
                    >
                      100%
                    </button>
                  )}
                </div>
              </div>

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
                onClick={handleCycleBackgroundTheme}
                className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl bg-[#232b30] hover:bg-[#2d373e] text-white font-black flex items-center justify-between border-2 border-[#0b0710] cursor-pointer transition-colors active:scale-98"
                title="Alternar entre os temas de fundo das fases que você já liberou"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">🎨</span>
                  <span>Tema de fundo:</span>
                </div>
                <span className="bg-[#12181a] px-3 py-1 rounded-xl border border-[#0b0710] text-[#f2b632] text-xs sm:text-sm font-black cacapa-stroke-sm truncate max-w-[210px]">
                  {getBgThemeLabel()}
                </span>
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
                  setIsMenuOpen(false);
                  setIsTitleOpen(true);
                }}
                className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl hover:bg-[#e0392b]/20 text-[#ff5a4a] font-black flex items-center gap-3.5 border-2 border-transparent hover:border-[#e0392b]/40 cursor-pointer transition-colors active:scale-98"
              >
                <span className="text-2xl">🔄</span>
                <span>Voltar ao Menu Principal</span>
              </button>

              {isVox && (
                <>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsAdminOpen(true);
                    }}
                    className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl bg-[#4d1627] hover:bg-[#681e35] text-[#ffd36a] font-black flex items-center justify-between border-2 border-[#b52a4e] cursor-pointer transition-colors active:scale-98"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="text-2xl">🛠️</span>
                      <span>Painel Debug & Admin</span>
                    </div>
                    <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded font-mono text-slate-300">
                      ↑↑↓↓←→←→
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate('/dashboard');
                    }}
                    className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl bg-[#3b1d60] hover:bg-[#522986] text-[#ffd36a] font-black flex items-center gap-3.5 border-2 border-[#8b3dff] cursor-pointer transition-colors active:scale-98"
                  >
                    <span className="text-2xl">📊</span>
                    <span>Painel Vox (/dashboard)</span>
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full text-left px-4 py-3 sm:py-3.5 rounded-2xl hover:bg-[#2d373e] text-slate-400 font-black flex items-center gap-3.5 border-2 border-transparent cursor-pointer transition-colors active:scale-98"
              >
                <span className="text-2xl">🚪</span>
                <span>Sair da Conta ({user?.name || 'Desconectar'})</span>
              </button>
            </div>

            <button
              onClick={() => setIsMenuOpen(false)}
              className="w-full py-4 px-6 rounded-2xl bg-[#2f86ff] hover:bg-[#4aa3ff] border-[4px] border-[#0b0710] shadow-[0_4px_0_rgba(0,0,0,0.45)] text-white font-black text-base sm:text-lg uppercase tracking-wider transition-all active:scale-95 cursor-pointer cacapa-stroke-sm mt-2"
            >
              {isTitleOpen ? 'VOLTAR AO MENU' : 'VOLTAR AO JOGO'}
            </button>
          </div>
        </div>
      )}

        {(engine.state === 'GAME_OVER' || engine.state === 'VICTORY') && (
          <GameOverModal
            engine={engine}
            onRestart={() => {
              setIsTitleOpen(true);
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
          selectedCueId={selectedCueId}
          onSelectCue={(id) => setSelectedCueId(id)}
          onPlay={(cueId) => handleStartGame(cueId)}
          onOpenEncyclopedia={() => {
            setEncyclopediaTab('cues');
            setIsEncyclopediaOpen(true);
          }}
          onOpenOptions={() => {
            setIsMenuOpen(true);
          }}
          onToggleSound={() => {
            handleToggleSound();
            handleToggleMusic();
          }}
          isMuted={isMuted && isMusicMuted}
        />

        <EncyclopediaModal
          isOpen={isEncyclopediaOpen}
          initialTab={encyclopediaTab}
          onClose={() => setIsEncyclopediaOpen(false)}
        />

        <ConsumableTargetModal
          isOpen={isConsumableTargetModalOpen}
          consumable={engine.ownedConsumable}
          engine={engine}
          onClose={() => setIsConsumableTargetModalOpen(false)}
          onSelectBall={handleSelectBallTarget}
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

        <JokerCollectionModal
          isOpen={isJokerCollectionOpen}
          onClose={() => setIsJokerCollectionOpen(false)}
        />

        <AdminDebugModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          engine={engine}
          onUpdate={rerender}
          user={user}
        />
    </div>
  );
}

