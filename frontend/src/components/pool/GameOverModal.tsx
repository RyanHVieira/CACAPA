import React from 'react';
import { CacapaPoolEngine } from '../../game/engine/CacapaPoolEngine';

interface GameOverModalProps {
  engine: CacapaPoolEngine;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ engine, onRestart }) => {
  const isVictory = engine.state === 'VICTORY';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md bg-[#1b2427] border-[4px] border-[#0b0710] shadow-[0_6px_0_rgba(0,0,0,0.45)] rounded-3xl p-6 text-center relative select-none font-cacapa`}
      >
        <div className="text-5xl mb-2">{isVictory ? '👑' : '💀'}</div>

        <span
          className={`text-xs uppercase font-black tracking-widest cacapa-stroke-sm ${
            isVictory ? 'text-[#f2b632]' : 'text-[#ff5a4a]'
          }`}
        >
          {isVictory ? 'Vitória Lendária!' : 'Fim de Jogo'}
        </span>

        <h2 className="text-3xl font-black text-white mt-1 mb-4 cacapa-stroke animate-cacapa-bob">
          {isVictory ? 'Você Zerou o Caçapa!' : 'Suas Tacadas Acabaram!'}
        </h2>

        {/* Stats Panel */}
        <div className="bg-[#12181a] border-2 border-[#0b0710] rounded-2xl p-4 mb-6 text-left space-y-2 text-sm shadow-inner">
          <div className="flex justify-between items-center text-[#9fb4a8]">
            <span className="font-bold">Mesa Alcançada:</span>
            <span className="text-[#f2b632] font-black text-base cacapa-stroke-sm">
              Mesa {engine.ante}/8
            </span>
          </div>
          <div className="flex justify-between items-center text-[#9fb4a8]">
            <span className="font-bold">Pontuação na Rodada:</span>
            <span className="text-[#2f86ff] font-black text-base cacapa-stroke-sm">
              {engine.currentScore.toLocaleString()} / {engine.targetScore.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-[#9fb4a8]">
            <span className="font-bold">Dinheiro Restante:</span>
            <span className="text-[#f2b632] font-black text-base cacapa-stroke-sm">
              ${engine.money}
            </span>
          </div>
          <div className="flex justify-between items-center text-[#9fb4a8]">
            <span className="font-bold">Coringas Coletados:</span>
            <span className="text-[#e0392b] font-black text-base cacapa-stroke-sm">
              {engine.ownedJokers.length}
            </span>
          </div>
        </div>

        <button
          onClick={onRestart}
          className={`w-full py-3.5 px-6 rounded-2xl font-black text-base uppercase tracking-wider text-white border-[3px] border-[#0b0710] shadow-[0_4px_0_rgba(0,0,0,0.45)] hover:scale-105 active:scale-95 transition-all cursor-pointer cacapa-stroke-sm ${
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
