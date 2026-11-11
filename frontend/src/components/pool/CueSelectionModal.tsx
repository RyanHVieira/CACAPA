import React, { useState, useEffect } from 'react';
import { CUES, CueManager, type CueInfo } from '../../game/cues/CueManager';
import { VerticalCueCanvas } from './VerticalCueCanvas';

interface CueSelectionModalProps {
  isOpen: boolean;
  selectedCueId: string;
  onSelectCue: (cueId: string) => void;
  onConfirm: (cueId: string) => void;
  onClose?: () => void;
}

export const CueSelectionModal: React.FC<CueSelectionModalProps> = ({
  isOpen,
  selectedCueId,
  onSelectCue,
  onConfirm,
  onClose,
}) => {
  const initialIndex = CUES.findIndex((c) => c.id === selectedCueId);
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex >= 0 ? initialIndex : 0);

  // Sincroniza ao abrir
  useEffect(() => {
    if (isOpen) {
      const idx = CUES.findIndex((c) => c.id === selectedCueId);
      if (idx >= 0) setCurrentIndex(idx);
    }
  }, [isOpen, selectedCueId]);

  // Teclado: Setas esquerda/direita, Enter e Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((i) => (i - 1 + CUES.length) % CUES.length);
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((i) => (i + 1) % CUES.length);
      } else if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentCue: CueInfo = CUES[currentIndex] || CUES[0];
  const isUnlocked = CueManager.isCueUnlocked(currentCue.id);
  const unlockedCount = CUES.filter((c) => CueManager.isCueUnlocked(c.id)).length;

  const handlePrev = () => {
    const nextIdx = (currentIndex - 1 + CUES.length) % CUES.length;
    setCurrentIndex(nextIdx);
    const cue = CUES[nextIdx];
    if (cue && CueManager.isCueUnlocked(cue.id)) {
      CueManager.setSelectedCueId(cue.id);
      onSelectCue(cue.id);
    }
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % CUES.length;
    setCurrentIndex(nextIdx);
    const cue = CUES[nextIdx];
    if (cue && CueManager.isCueUnlocked(cue.id)) {
      CueManager.setSelectedCueId(cue.id);
      onSelectCue(cue.id);
    }
  };

  const handlePlayWithCurrent = () => {
    if (!isUnlocked) return;
    const chosenId = currentCue.id;
    CueManager.setSelectedCueId(chosenId);
    onSelectCue(chosenId);
    onConfirm(chosenId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200 select-none font-cacapa">
      <div className="w-full max-w-lg sm:max-w-xl bg-[#171d22] border-[5px] border-[#0b0710] shadow-[0_12px_0_rgba(0,0,0,0.65)] rounded-3xl p-5 sm:p-7 relative max-h-[96vh] overflow-y-auto flex flex-col justify-between items-center text-center">
        {/* Header */}
        <div className="w-full flex items-start justify-between border-b-2 border-[#0b0710] pb-3 mb-3">
          <div className="text-left">
            <span className="text-[10px] sm:text-xs uppercase font-black tracking-widest text-[#f2b632] block cacapa-stroke-sm">
              Equipamento Inicial • Sinuca Roguelike
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5 cacapa-stroke mt-0.5">
              <span>🎱</span> ESCOLHA SEU TACO
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-[#0b0710] border border-[#2b353b] text-[#ffd36a] text-xs font-black">
              {unlockedCount}/{CUES.length} Tacos
            </span>

            {onClose && (
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-[#3a2a4a] hover:bg-[#4a3a5a] text-[#f2b632] font-black text-base flex items-center justify-center border-2 border-[#0b0710] cursor-pointer active:scale-95 transition-all shadow-[0_2px_0_rgba(0,0,0,0.4)]"
                title="Voltar ao menu"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Carousel Central: Taco em pé com flechas nas laterais */}
        <div className="w-full flex items-center justify-between gap-2 sm:gap-4 my-2">
          {/* Flecha Esquerda */}
          <button
            onClick={handlePrev}
            className="group w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#232b30] hover:bg-[#2e373d] text-[#ffd36a] font-black text-2xl flex items-center justify-center border-[3px] border-[#0b0710] shadow-[0_4px_0_rgba(0,0,0,0.5)] cursor-pointer active:scale-95 hover:scale-105 transition-all shrink-0"
            title="Taco anterior (Seta Esquerda)"
          >
            <span className="transition-transform group-hover:-translate-x-0.5">◀</span>
          </button>

          {/* Palco do Taco em Pé */}
          <div className="flex-1 flex flex-col items-center justify-center py-2 px-1 relative min-h-[320px]">
            {/* Halo de Pedestal de fundo */}
            <div className="absolute inset-x-8 inset-y-4 bg-[#0e1315]/80 rounded-3xl border-2 border-[#2b353b]/60 -z-0 shadow-inner" />

            <div className="z-10 transition-transform duration-200">
              <VerticalCueCanvas
                cueId={currentCue.id}
                height={300}
                width={80}
                isUnlocked={isUnlocked}
              />
            </div>
          </div>

          {/* Flecha Direita */}
          <button
            onClick={handleNext}
            className="group w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#232b30] hover:bg-[#2e373d] text-[#ffd36a] font-black text-2xl flex items-center justify-center border-[3px] border-[#0b0710] shadow-[0_4px_0_rgba(0,0,0,0.5)] cursor-pointer active:scale-95 hover:scale-105 transition-all shrink-0"
            title="Próximo taco (Seta Direita)"
          >
            <span className="transition-transform group-hover:translate-x-0.5">▶</span>
          </button>
        </div>

        {/* Indicadores de bolinhas do carrossel */}
        <div className="flex items-center justify-center gap-1.5 my-1">
          {CUES.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => {
                setCurrentIndex(idx);
                if (CueManager.isCueUnlocked(c.id)) {
                  CueManager.setSelectedCueId(c.id);
                  onSelectCue(c.id);
                }
              }}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'w-7 bg-[#f2b632] border border-[#0b0710]'
                  : CueManager.isCueUnlocked(c.id)
                  ? 'w-2.5 bg-[#4b5563] hover:bg-slate-300'
                  : 'w-2.5 bg-[#1f2937]'
              }`}
              title={c.name}
            />
          ))}
        </div>

        {/* Informações Detalhadas do Taco Atual */}
        <div className="w-full bg-[#12181a] border-[3px] border-[#0b0710] rounded-2xl p-4 my-2 text-left shadow-inner">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl">{currentCue.icon}</span>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white cacapa-stroke-sm">
                  {currentCue.name}
                </h3>
                <span className="text-[10px] text-[#9fb4a8] font-bold uppercase tracking-wider">
                  Taco #{currentIndex + 1} de {CUES.length}
                </span>
              </div>
            </div>

            <span
              className={`text-[10px] sm:text-xs font-black uppercase px-2.5 py-1 rounded-full border ${
                isUnlocked
                  ? 'bg-[#22c55e]/20 text-[#4ade80] border-[#22c55e]/40'
                  : 'bg-[#ef4444]/20 text-[#f87171] border-[#ef4444]/40'
              }`}
            >
              {isUnlocked ? '✓ Desbloqueado' : '🔒 Bloqueado'}
            </span>
          </div>

          {/* Efeito em Destaque */}
          <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-[#0b0710] border border-[#2b353b] text-[#ffd36a] font-black text-xs sm:text-sm">
            ⚡ {currentCue.effectLabel}
          </div>

          {/* Descrição */}
          <p className="text-xs text-[#9fb4a8] mt-2 leading-relaxed">
            {currentCue.description}
          </p>

          {/* Se Bloqueado: Condição de desbloqueio */}
          {!isUnlocked && (
            <div className="mt-2.5 p-2 rounded-xl bg-red-950/40 border border-red-700/50 text-red-300 text-xs font-bold flex items-center gap-2">
              <span className="text-base">🎯</span>
              <span>Requisito: {currentCue.unlockCondition}</span>
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-2.5 mt-2">
          {onClose && (
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#232b30] hover:bg-[#2e373d] border-2 border-[#0b0710] text-[#9fb4a8] font-black text-xs sm:text-sm uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-[0_2px_0_rgba(0,0,0,0.4)]"
            >
              ✕ Cancelar
            </button>
          )}

          <button
            onClick={handlePlayWithCurrent}
            disabled={!isUnlocked}
            className={`flex-1 w-full py-3.5 sm:py-4 px-6 rounded-2xl border-[3px] border-[#0b0710] shadow-[0_4px_0_rgba(0,0,0,0.5)] font-black text-base sm:text-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 cacapa-stroke-sm ${
              isUnlocked
                ? 'bg-[#2f86ff] hover:bg-[#4aa3ff] text-white hover:scale-102 active:scale-95 cursor-pointer'
                : 'bg-[#2b353b] text-slate-500 opacity-60 cursor-not-allowed shadow-none'
            }`}
          >
            <span>🎱</span>
            <span>{isUnlocked ? 'SELECIONAR E JOGAR' : 'TACO BLOQUEADO'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
