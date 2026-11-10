import React from 'react';

interface TitleScreenModalProps {
  isOpen: boolean;
  onPlay: () => void;
  onHelp: () => void;
  onToggleSound: () => void;
  isMuted: boolean;
}

export const TitleScreenModal: React.FC<TitleScreenModalProps> = ({
  isOpen,
  onPlay,
  onHelp,
  onToggleSound,
  isMuted,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-300 font-cacapa select-none">
      <div className="w-full max-w-md bg-[#1b2427] border-[4px] border-[#0b0710] shadow-[0_8px_0_rgba(0,0,0,0.6)] rounded-3xl p-6 sm:p-8 text-center relative flex flex-col items-center">
        {/* Animated Swaying Arcade Title */}
        <div className="my-3 animate-cacapa-bob">
          <div className="text-6xl sm:text-7xl font-black text-[#f2b632] tracking-wider cacapa-stroke-lg drop-shadow-[0_8px_12px_rgba(0,0,0,0.8)]">
            CAÇAPA
          </div>
          <div className="text-sm sm:text-base font-black uppercase tracking-widest text-[#9ff1ff] -mt-1 cacapa-stroke-sm">
            SINUCA ROGUELIKE
          </div>
        </div>

        {/* 8-Ball Icon */}
        <div className="relative w-16 h-16 rounded-full bg-[#12181a] border-[3px] border-[#0b0710] shadow-[0_6px_16px_rgba(0,0,0,0.8)] flex items-center justify-center my-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#0b0710] font-black text-base shadow-inner">
            8
          </div>
        </div>

        {/* Tagline */}
        <p className="text-xs sm:text-sm text-[#9fb4a8] max-w-xs leading-snug my-2">
          Encaçape bolas, ative coringas lendários e quebre as metas antes que suas tacadas acabem!
        </p>

        {/* Actions */}
        <div className="w-full space-y-2.5 mt-4">
          <button
            onClick={onPlay}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#2f86ff] hover:bg-[#4aa3ff] border-[3px] border-[#0b0710] shadow-[0_4px_0_rgba(0,0,0,0.45)] text-white font-black text-lg uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer cacapa-stroke-sm"
          >
            JOGAR SINUCA 🎱
          </button>

          <button
            onClick={onHelp}
            className="w-full py-2.5 px-4 rounded-xl bg-[#3a2a4a] hover:bg-[#4a3a5a] border-[3px] border-[#0b0710] shadow-[0_3px_0_rgba(0,0,0,0.45)] text-[#f2b632] font-black text-sm uppercase tracking-wider transition-all hover:scale-102 active:scale-98 cursor-pointer cacapa-stroke-sm"
          >
            COMO JOGAR & DICAS 📖
          </button>

          <button
            onClick={onToggleSound}
            className="w-full py-2 px-4 rounded-xl bg-[#12181a] hover:bg-[#20292c] border-2 border-[#0b0710] text-[#9fb4a8] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            {isMuted ? '🔇 Ativar Som e Música' : '🔊 Som e Jazz Ativados'}
          </button>
        </div>

        {/* Footer Credit */}
        <div className="text-[10px] text-[#9fb4a8]/60 mt-5 uppercase tracking-widest">
          Inspirado em Caçapa • Projeto Caçapa
        </div>
      </div>
    </div>
  );
};