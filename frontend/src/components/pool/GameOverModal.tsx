import React from 'react';
import { CacapaPoolEngine } from '../../game/engine/CacapaPoolEngine';

interface GameOverModalProps {
  engine: CacapaPoolEngine;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ engine, onRestart }) => {
  const isVictory = engine.state === 'VICTORY';
  const isFoulOut = !isVictory && engine.foulCount >= engine.maxFouls;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#1b2427] border-[5px] border-[#0b0710] shadow-[0_10px_0_rgba(0,0,0,0.6)] rounded-3xl p-8 sm:p-10 text-center relative select-none font-cacapa"
      >
        <div className="text-7xl sm:text-8xl mb-3 animate-bounce">
          {isVictory ? '👑' : isFoulOut ? '🚫' : '💀'}
        </div>

        <span
          className={`text-sm sm:text-base uppercase font-black tracking-widest cacapa-stroke-sm ${
            isVictory ? 'text-[#f2b632]' : 'text-[#ff5a4a]'
          }`}
        >
          {isVictory ? 'Vitória Lendária!' : isFoulOut ? 'Limite de Faltas!' : 'Fim de Jogo'}
        </span>

        <h2 className="text-4xl sm:text-5xl font-black text-white mt-1 mb-6 cacapa-stroke animate-cacapa-bob leading-tight">
          {isVictory
            ? 'Você Zerou o Caçapa!'
            : isFoulOut
            ? `Você Atingiu ${engine.maxFouls} Faltas!`
            : 'Suas Tacadas Acabaram!'}
        </h2>

        <div className="bg-[#12181a] border-[3px] border-[#0b0710] rounded-3xl p-6 mb-8 text-left space-y-4 shadow-inner">
          <div className="flex justify-between items-center text-[#9fb4a8] border-b border-[#0b0710]/60 pb-3">
            <span className="font-bold text-base sm:text-lg flex items-center gap-2">
              <span>🏆</span> Mesa Alcançada:
            </span>
            <span className="text-[#f2b632] font-black text-2xl sm:text-3xl cacapa-stroke-sm">
              Mesa {engine.ante}/8
            </span>
          </div>
          <div className="flex justify-between items-center text-[#9fb4a8] border-b border-[#0b0710]/60 pb-3">
            <span className="font-bold text-base sm:text-lg flex items-center gap-2">
              <span>🎯</span> Pontuação na Rodada:
            </span>
            <span className="text-[#2f86ff] font-black text-2xl sm:text-3xl cacapa-stroke-sm">
              {engine.currentScore.toLocaleString()} <span className="text-base sm:text-lg text-[#9fb4a8]">/ {engine.targetScore.toLocaleString()}</span>
            </span>
          </div>
          <div className="flex justify-between items-center text-[#9fb4a8] border-b border-[#0b0710]/60 pb-3">
            <span className="font-bold text-base sm:text-lg flex items-center gap-2">
              <span>⚠️</span> Faltas Cometidas:
            </span>
            <span className={`font-black text-2xl sm:text-3xl cacapa-stroke-sm ${engine.foulCount >= 5 ? 'text-[#ff5a4a]' : 'text-[#f2b632]'}`}>
              {engine.foulCount}/5
            </span>
          </div>
          <div className="flex justify-between items-center text-[#9fb4a8] border-b border-[#0b0710]/60 pb-3">
            <span className="font-bold text-base sm:text-lg flex items-center gap-2">
              <span>💵</span> Dinheiro Restante:
            </span>
            <span className="text-[#f2b632] font-black text-2xl sm:text-3xl cacapa-stroke-sm">
              ${engine.money}
            </span>
          </div>
          <div className="flex justify-between items-center text-[#9fb4a8]">
            <span className="font-bold text-base sm:text-lg flex items-center gap-2">
              <span>🃏</span> Coringas Coletados:
            </span>
            <span className="text-[#e0392b] font-black text-2xl sm:text-3xl cacapa-stroke-sm">
              {engine.ownedJokers.length}
            </span>
          </div>
        </div>

        <button
          onClick={onRestart}
          className={`w-full py-5 px-8 rounded-2xl font-black text-xl sm:text-2xl uppercase tracking-wider text-white border-[4px] border-[#0b0710] shadow-[0_6px_0_rgba(0,0,0,0.5)] hover:scale-102 active:scale-98 transition-all cursor-pointer cacapa-stroke-sm ${
            isVictory
              ? 'bg-[#f2b632] text-slate-950 hover:bg-[#ffd36a]'
              : 'bg-[#e0392b] hover:bg-[#ff4b3a]'
          }`}
        >
          {isVictory ? 'Jogar Novamente' : 'Tentar Novamente 🎱'}
        </button>
      </div>
    </div>
  );
};
