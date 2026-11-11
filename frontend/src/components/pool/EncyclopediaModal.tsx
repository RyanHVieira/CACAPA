import React, { useState } from 'react';
import { CardCatalog } from '../../game/cards/CardCatalog';
import { CUES, CueManager } from '../../game/cues/CueManager';
import { CueSprite } from './CueSprite';
import { BallEnhancementCatalog } from '../../game/enhancements/BallEnhancement';
import { BallCanvasPreview } from './BallCanvasPreview';
import { NM, TG, FEL, BOSS, BRL } from '../../game/config/gameConfig';
import { SCENE_PALETTES } from '../../game/scenes/TableScenes';
import { CONSUMABLES } from '../../game/consumables/Consumable';

export type EncyclopediaTab = 'cues' | 'jokers' | 'stages' | 'balls' | 'consumables';

interface EncyclopediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: EncyclopediaTab;
}

export const EncyclopediaModal: React.FC<EncyclopediaModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'cues',
}) => {
  const [activeTab, setActiveTab] = useState<EncyclopediaTab>(initialTab);
  const [jokerFilter, setJokerFilter] = useState<string>('all');

  if (!isOpen) return null;

  const allJokers = CardCatalog.getAllJokers();
  const discoveredJokerIds = CardCatalog.getDiscoveredJokerIds();
  const allEnhancements = BallEnhancementCatalog.getAll();
  const discoveredEnhancementIds = BallEnhancementCatalog.getDiscoveredEnhancementIds();
  const highestStageReached = CueManager.getHighestStageReached();
  const unlockedCueIds = CueManager.getUnlockedCueIds();

  const getRarityBadgeStyle = (rarity: string) => {
    switch (rarity) {
      case 'Lendária':
        return 'bg-purple-950/80 text-purple-300 border-purple-500/60';
      case 'Rara':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/60';
      case 'Incomum':
        return 'bg-sky-950/80 text-sky-300 border-sky-500/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-600/60';
    }
  };

  const filteredJokers = allJokers.filter((j) => {
    if (jokerFilter === 'all') return true;
    return j.rarity.toLowerCase() === jokerFilter.toLowerCase();
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200 select-none font-cacapa">
      <div className="w-full max-w-5xl bg-[#171d22] border-[5px] border-[#0b0710] rounded-3xl p-5 sm:p-8 shadow-[0_12px_0_rgba(0,0,0,0.65)] relative max-h-[95vh] overflow-y-auto flex flex-col justify-between">
        {/* Header */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-[#0b0710] pb-4 mb-4 gap-3">
            <div>
              <span className="text-xs sm:text-sm uppercase font-black tracking-widest text-[#f2b632] block cacapa-stroke-sm">
                Compêndio Balatro • Projeto Caçapa
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white flex items-center gap-3 cacapa-stroke mt-0.5">
                <span>📖</span> ENCICLOPÉDIA DA SINUCA
              </h2>
              <p className="text-xs sm:text-sm text-[#9fb4a8] mt-1 cacapa-stroke-sm">
                Consulte todos os tacos, coringas, fases e modificadores de bola do jogo.
              </p>
            </div>

            <button
              onClick={onClose}
              className="bg-[#3a2a4a] border-2 border-[#0b0710] shadow-[0_3px_0_rgba(0,0,0,0.45)] hover:border-[#f2b632] text-[#f2b632] px-4 py-2 rounded-2xl text-sm sm:text-base font-black cursor-pointer transition-all active:scale-95 cacapa-stroke-sm self-end sm:self-center"
            >
              ✕ Fechar
            </button>
          </div>

          {/* Abas Principais */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-5">
            <button
              onClick={() => setActiveTab('cues')}
              className={`py-3 px-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider border-[3px] border-[#0b0710] shadow-[0_3px_0_rgba(0,0,0,0.45)] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'cues'
                  ? 'bg-[#f2b632] text-[#0b0710] scale-102 -translate-y-0.5'
                  : 'bg-[#232b30] text-slate-300 hover:bg-[#2d373e] hover:text-white'
              }`}
            >
              <span className="text-lg">🪵</span>
              <span>Tacos ({CUES.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('jokers')}
              className={`py-3 px-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider border-[3px] border-[#0b0710] shadow-[0_3px_0_rgba(0,0,0,0.45)] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'jokers'
                  ? 'bg-[#8b3dff] text-white scale-102 -translate-y-0.5'
                  : 'bg-[#232b30] text-slate-300 hover:bg-[#2d373e] hover:text-white'
              }`}
            >
              <span className="text-lg">🃏</span>
              <span>Coringas ({allJokers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('stages')}
              className={`py-3 px-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider border-[3px] border-[#0b0710] shadow-[0_3px_0_rgba(0,0,0,0.45)] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'stages'
                  ? 'bg-[#2f86ff] text-white scale-102 -translate-y-0.5'
                  : 'bg-[#232b30] text-slate-300 hover:bg-[#2d373e] hover:text-white'
              }`}
            >
              <span className="text-lg">🗺️</span>
              <span>Fases ({NM.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('balls')}
              className={`py-3 px-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider border-[3px] border-[#0b0710] shadow-[0_3px_0_rgba(0,0,0,0.45)] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'balls'
                  ? 'bg-[#10b981] text-white scale-102 -translate-y-0.5'
                  : 'bg-[#232b30] text-slate-300 hover:bg-[#2d373e] hover:text-white'
              }`}
            >
              <span className="text-lg">🔮</span>
              <span>Modificadores ({allEnhancements.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('consumables')}
              className={`py-3 px-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider border-[3px] border-[#0b0710] shadow-[0_3px_0_rgba(0,0,0,0.45)] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'consumables'
                  ? 'bg-[#f59e0b] text-[#0b0710] scale-102 -translate-y-0.5'
                  : 'bg-[#232b30] text-slate-300 hover:bg-[#2d373e] hover:text-white'
              }`}
            >
              <span className="text-lg">🍔</span>
              <span>Consumíveis ({CONSUMABLES.length})</span>
            </button>
          </div>

          {/* ======================= ABA 1: TACOS ======================= */}
          {activeTab === 'cues' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs sm:text-sm font-bold text-[#9fb4a8]">
                  Desbloqueados: {unlockedCueIds.size}/{CUES.length} tacos
                </span>
                <span className="text-xs text-[#9fb4a8]/70">
                  Cada taco altera a física, regras e habilidades de cada partida
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CUES.map((cue) => {
                  const isUnlocked = CueManager.isCueUnlocked(cue.id);
                  return (
                    <div
                      key={cue.id}
                      className={`p-4 rounded-2xl border-[3px] border-[#0b0710] shadow-[0_4px_0_rgba(0,0,0,0.45)] flex flex-col justify-between transition-all ${
                        isUnlocked
                          ? 'bg-[#1e272c] hover:border-[#f2b632]'
                          : 'bg-[#13181a] opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#0b0710] border-2 border-[#2b353b] flex items-center justify-center text-3xl shrink-0 shadow-inner">
                          {cue.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-lg sm:text-xl font-black text-white cacapa-stroke-sm truncate">
                              {cue.name}
                            </h4>
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                isUnlocked
                                  ? 'bg-[#22c55e]/20 text-[#4ade80] border-[#22c55e]/40'
                                  : 'bg-[#ef4444]/20 text-[#f87171] border-[#ef4444]/40'
                              }`}
                            >
                              {isUnlocked ? '✓ Liberado' : '🔒 Bloqueado'}
                            </span>
                          </div>

                          <div className="mt-1 px-2.5 py-1 rounded-xl bg-[#0b0710]/60 border border-[#232b30] text-[#f2b632] font-black text-xs">
                            ⚡ {cue.effectLabel}
                          </div>

                          <p className="text-xs text-[#9fb4a8] mt-2 leading-relaxed">
                            {cue.description}
                          </p>
                        </div>
                      </div>

                      {/* Sprite do Taco */}
                      <div className="mt-3 pt-2 border-t border-[#0b0710]/60 flex items-center justify-between">
                        <div className="text-[11px] font-bold text-[#9fb4a8]/80">
                          🎯 {cue.unlockCondition}
                        </div>
                        <div className="w-24 h-5 flex items-center justify-end">
                          <CueSprite cueId={cue.id} width={96} height={18} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================= ABA 2: CORINGAS ======================= */}
          {activeTab === 'jokers' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                  <button
                    onClick={() => setJokerFilter('all')}
                    className={`px-3 py-1 rounded-xl font-bold text-xs uppercase tracking-wider border-2 transition-all cursor-pointer ${
                      jokerFilter === 'all'
                        ? 'bg-[#f2b632] text-[#0b0710] border-[#0b0710] shadow-[0_2px_0_rgba(0,0,0,0.4)]'
                        : 'bg-[#12181a] text-[#9fb4a8] border-[#0b0710] hover:text-white'
                    }`}
                  >
                    Todos ({allJokers.length})
                  </button>
                  {['Comum', 'Incomum', 'Rara', 'Lendária'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setJokerFilter(r)}
                      className={`px-3 py-1 rounded-xl font-bold text-xs uppercase tracking-wider border-2 transition-all cursor-pointer ${
                        jokerFilter === r
                          ? 'bg-[#f2b632] text-[#0b0710] border-[#0b0710] shadow-[0_2px_0_rgba(0,0,0,0.4)]'
                          : 'bg-[#12181a] text-[#9fb4a8] border-[#0b0710] hover:text-white'
                      }`}
                    >
                      {r} ({allJokers.filter((j) => j.rarity === r).length})
                    </button>
                  ))}
                </div>

                <div className="text-xs font-bold text-[#9fb4a8]">
                  Descobertos na jornada: <span className="text-[#f2b632]">{discoveredJokerIds.size}</span>/{allJokers.length}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {filteredJokers.map((joker) => {
                  const isDiscovered = discoveredJokerIds.has(joker.id);

                  if (!isDiscovered) {
                    return (
                      <div
                        key={joker.id}
                        className="p-4 rounded-2xl border-[3px] border-[#0b0710] bg-[#101416] opacity-65 flex flex-col items-center justify-center text-center shadow-[0_4px_0_rgba(0,0,0,0.45)] min-h-[170px]"
                      >
                        <div className="w-14 h-14 rounded-full bg-[#0b0710] border-2 border-dashed border-[#2b353b] flex items-center justify-center text-2xl text-slate-600 mb-2">
                          ?
                        </div>
                        <h4 className="text-base font-black text-slate-400">???</h4>
                        <span className="text-[10px] font-black uppercase text-slate-500 mt-1">
                          Ainda não encontrado no bar
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={joker.id}
                      className="p-4 rounded-2xl border-[3px] border-[#0b0710] bg-[#1e272c] hover:border-[#f2b632] shadow-[0_4px_0_rgba(0,0,0,0.45)] flex flex-col justify-between transition-all hover:-translate-y-1"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${getRarityBadgeStyle(
                              joker.rarity
                            )}`}
                          >
                            {joker.rarity}
                          </span>
                          <span className="text-xs font-black text-[#22c55e]">
                            ${joker.cost}
                          </span>
                        </div>

                        <h4 className="text-base sm:text-lg font-black text-white cacapa-stroke-sm mt-1">
                          {joker.name}
                        </h4>

                        <p className="text-xs text-[#9fb4a8] mt-2 leading-relaxed">
                          {joker.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#0b0710]/60 flex items-center justify-between text-[10px] font-bold text-[#4ade80]">
                        <span>✓ Descoberto</span>
                        <span className="text-[#9fb4a8]/70">Garrafa Coringa</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================= ABA 3: FASES (MESAS) ======================= */}
          {activeTab === 'stages' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs sm:text-sm font-bold text-[#9fb4a8]">
                  Fases descobertas: <span className="text-[#f2b632]">{Math.min(highestStageReached + 1, NM.length)}/{NM.length} mesas</span>
                </span>
                <span className="text-xs text-[#9fb4a8]/70">
                  Apenas informações de fases que você já viu em jogo são reveladas
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {NM.map((name, idx) => {
                  const target = TG[idx];
                  const felt = FEL[idx];
                  const isBoss = BOSS.includes(idx);
                  const bossRule = BRL[idx];
                  const palette = SCENE_PALETTES[idx];
                  const isReached = idx <= highestStageReached;
                  const isHighest = idx === highestStageReached;

                  if (!isReached) {
                    return (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl border-[3px] border-[#0b0710] bg-[#121618] opacity-65 flex flex-col items-center justify-center text-center min-h-[160px] shadow-[0_4px_0_rgba(0,0,0,0.45)]"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center text-2xl mb-2 text-slate-400">
                          🔒
                        </div>
                        <div className="px-2.5 py-0.5 rounded-lg bg-[#0b0710] text-[#ffd36a] text-xs font-black border border-[#2b353b] mb-1">
                          Mesa {idx + 1}
                        </div>
                        <h4 className="text-xl font-black text-slate-400">???</h4>
                        <span className="text-xs font-bold text-slate-500 mt-1">
                          Alcance a Mesa {idx + 1} para revelar as informações e regras
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border-[3px] border-[#0b0710] shadow-[0_4px_0_rgba(0,0,0,0.45)] flex flex-col justify-between transition-all ${
                        isHighest
                          ? 'bg-[#232b35] border-[#f2b632]'
                          : 'bg-[#1e272c]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-lg bg-[#0b0710] text-[#ffd36a] text-xs font-black border border-[#2b353b]">
                              Mesa {idx + 1}
                            </span>
                            {isBoss && (
                              <span className="px-2 py-0.5 rounded-lg bg-red-950/80 text-red-400 text-[10px] font-black border border-red-700/60 uppercase animate-pulse">
                                💀 Chefão
                              </span>
                            )}
                          </div>

                          {isHighest && (
                            <span className="px-2 py-0.5 rounded-full bg-[#f2b632]/20 border border-[#f2b632] text-[#f2b632] text-[10px] font-black uppercase">
                              ⭐ Seu Recorde
                            </span>
                          )}
                        </div>

                        <h4 className="text-xl font-black text-white cacapa-stroke-sm">
                          {name}
                        </h4>

                        <div className="mt-2 flex items-center justify-between text-xs font-bold text-[#9fb4a8]">
                          <span>Meta de Pontuação:</span>
                          <span className="text-base font-black text-[#f2b632]">
                            {target.toLocaleString('pt-BR')} pts
                          </span>
                        </div>

                        {bossRule && (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-red-950/30 border border-red-900/50 text-red-300 text-xs">
                            <div className="font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5 mb-1">
                              <span>⚠️ Regra do Chefão:</span> {bossRule.name}
                            </div>
                            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-red-200/90">
                              {bossRule.description.map((desc, dIdx) => (
                                <li key={dIdx}>{desc}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Visual da Mesa e Swirl */}
                      <div className="mt-4 pt-2.5 border-t border-[#0b0710]/60 flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <span className="text-[#9fb4a8]/80 text-[11px]">Feltro:</span>
                          <span
                            className="w-5 h-5 rounded-full border border-black shadow-inner"
                            style={{ backgroundColor: felt }}
                            title={`Cor do Feltro: ${felt}`}
                          />
                          <span className="text-[#9fb4a8]/80 text-[11px] ml-2">Ambiente:</span>
                          <span
                            className="w-5 h-5 rounded-full border border-black shadow-inner"
                            style={{
                              backgroundColor: `rgb(${palette.light[0]}, ${palette.light[1]}, ${palette.light[2]})`,
                            }}
                            title="Paleta Swirl de Fundo"
                          />
                        </div>

                        <span
                          className={`text-[11px] font-black uppercase ${
                            isReached ? 'text-[#4ade80]' : 'text-slate-500'
                          }`}
                        >
                          {isReached ? '✓ Conquistada' : '🔒 Não alcançada'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================= ABA 4: MODIFICADORES DE BOLA ======================= */}
          {activeTab === 'balls' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs sm:text-sm font-bold text-[#9fb4a8]">
                  Modificadores descobertos: <span className="text-[#10b981]">{allEnhancements.filter((e) => discoveredEnhancementIds.has(e.id)).length}/{allEnhancements.length}</span>
                </span>
                <span className="text-xs text-[#9fb4a8]/70">
                  Apenas modificadores que você já viu no bar ou em jogo são revelados
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {allEnhancements.map((enh, idx) => {
                  const ballNum = (idx % 15) + 1;
                  const isStripe = ballNum >= 9;
                  const isDiscovered = discoveredEnhancementIds.has(enh.id);

                  if (!isDiscovered) {
                    return (
                      <div
                        key={enh.id}
                        className="p-4 rounded-2xl border-[3px] border-[#0b0710] bg-[#121618] opacity-65 flex flex-col items-center justify-center text-center min-h-[160px] shadow-[0_4px_0_rgba(0,0,0,0.45)]"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center text-2xl mb-2 text-slate-400">
                          🔒
                        </div>
                        <h4 className="text-base font-black text-slate-400">???</h4>
                        <span className="text-[10px] font-black uppercase text-slate-500 mt-1">
                          Ainda não descoberto no bar
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={enh.id}
                      className="p-4 rounded-2xl border-[3px] border-[#0b0710] bg-[#1e272c] hover:border-[#10b981] shadow-[0_4px_0_rgba(0,0,0,0.45)] flex flex-col justify-between transition-all hover:-translate-y-1"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="relative shrink-0 flex items-center justify-center">
                          <BallCanvasPreview
                            number={ballNum}
                            isStripe={isStripe}
                            enhancement={enh}
                            size={56}
                            animate={true}
                          />
                          <div className="absolute -top-1 -right-1 text-sm drop-shadow">
                            {enh.icon}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-base sm:text-lg font-black text-white cacapa-stroke-sm truncate">
                              {enh.name}
                            </h4>
                            <span className="text-xs font-black text-[#22c55e]">
                              ${enh.cost}
                            </span>
                          </div>

                          <span className="text-[10px] font-black uppercase text-[#38bdf8] block mt-0.5">
                            ID: {enh.id}
                          </span>

                          <p className="text-xs text-[#9fb4a8] mt-1.5 leading-relaxed">
                            {enh.description}
                          </p>
                        </div>
                      </div>

                      {enh.popupText && (
                        <div className="mt-3 pt-2 border-t border-[#0b0710]/60 flex items-center justify-between text-[10px] font-black">
                          <span className="text-[#9fb4a8]/70 uppercase">Efeito ao Encaçapar:</span>
                          <span className="text-[#f2b632]">{enh.popupText}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================= ABA 5: CONSUMÍVEIS ======================= */}
          {activeTab === 'consumables' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs sm:text-sm font-bold text-[#9fb4a8]">
                  Total: {CONSUMABLES.length} consumíveis disponíveis
                </span>
                <span className="text-xs text-[#9fb4a8]/70">
                  Você possui 1 slot de consumível durante a partida
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {CONSUMABLES.map((c) => {
                  const badgeStyle = getRarityBadgeStyle(c.rarity);
                  return (
                    <div
                      key={c.id}
                      className="bg-[#1f2930] border-2 border-[#0b0710] rounded-2xl p-4 shadow-[0_4px_0_rgba(0,0,0,0.35)] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-3xl">{c.icon}</span>
                            <div>
                              <h4 className="text-base sm:text-lg font-black text-white cacapa-stroke-sm">
                                {c.name}
                              </h4>
                              <span className="text-[10px] font-black uppercase text-[#f2b632]">
                                {c.targetType === 'ball' ? 'Alvo: Bola' : 'Instantâneo'}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border ${badgeStyle}`}
                          >
                            {c.rarity}
                          </span>
                        </div>

                        <p className="text-xs text-[#cbd5e1] leading-relaxed mt-2">
                          {c.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-2 border-t border-[#0b0710]/60 flex items-center justify-between text-xs font-black">
                        <span className="text-[#86efac]">Custo: ${c.cost}</span>
                        <span className="text-[#f59e0b]">Venda: ${c.sellValue}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t-2 border-[#0b0710] flex justify-between items-center text-xs text-[#9fb4a8]">
          <span>Caçapa Roguelike • Sinuca Estratégica</span>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[#3a2a4a] hover:bg-[#4a3a5a] border-2 border-[#0b0710] text-[#f2b632] font-black text-sm uppercase tracking-wider cursor-pointer active:scale-95 transition-all cacapa-stroke-sm shadow-[0_2px_0_rgba(0,0,0,0.4)]"
          >
            Fechar Enciclopédia
          </button>
        </div>
      </div>
    </div>
  );
};
