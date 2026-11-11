import React from 'react';
import { CacapaPoolEngine } from '../../game/engine/CacapaPoolEngine';

interface CacapaHeaderProps {
  engine: CacapaPoolEngine;
  onSoundToggle?: () => void;
  isMuted?: boolean;
  onViewBalls?: () => void;
}

export const CacapaHeader: React.FC<CacapaHeaderProps> = ({
  engine,
  onSoundToggle,
  isMuted = false,
  onViewBalls,
}) => {
  const progressPercent = Math.min(
    100,
    Math.round((engine.currentScore / engine.targetScore) * 100)
  );

  return (
    <div className="w-full max-w-[960px] mx-auto mb-4 bg-slate-900/95 border-2 border-slate-700/80 rounded-2xl p-4 shadow-xl backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
          <span className="bg-amber-500/20 text-amber-400 font-extrabold px-3 py-1 rounded-lg text-xs uppercase tracking-wider border border-amber-500/30">
            Ante {engine.ante}/8
          </span>

          <span
            className={`font-black px-3 py-1 rounded-lg text-xs uppercase tracking-wider border ${
              engine.roundInAnte === 3
                ? 'bg-red-950/80 text-red-400 border-red-600 animate-pulse'
                : engine.roundInAnte === 2
                ? 'bg-amber-950/60 text-amber-300 border-amber-600'
                : 'bg-blue-950/60 text-blue-300 border-blue-600'
            }`}
          >
            {engine.roundInAnte === 3 ? '💀 ' : '🎯 '}
            {engine.blindType}
          </span>
        </div>

                <div className="flex items-center gap-3">
          {onViewBalls && (
            <button
              onClick={onViewBalls}
              className="p-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95"
              title="Ver suas bolas e melhorias ativas"
            >
              <span>🎱</span>
              <span>Deck de Bolas</span>
            </button>
          )}

          <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 font-mono font-black px-4 py-1.5 rounded-xl text-base flex items-center gap-1.5 shadow-sm">
            <span>💵</span>
            <span>${engine.money}</span>
          </div>

          {onSoundToggle && (
            <button
              onClick={onSoundToggle}
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-sm"
              title={isMuted ? 'Ativar Som' : 'Mutar Som'}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          )}
        </div>
      </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-5 bg-slate-950/80 border border-slate-800 rounded-xl p-3">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider mb-1.5">
            <span className="text-slate-400">Meta da Rodada</span>
            <span className="text-amber-400 font-mono">
              {engine.currentScore.toLocaleString()} / {engine.targetScore.toLocaleString()}
            </span>
          </div>

          <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
            <div
              className={`h-full transition-all duration-300 ${
                progressPercent >= 100
                  ? 'bg-gradient-to-r from-emerald-500 to-amber-400 animate-pulse'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
            <span>Progresso</span>
            <span>{progressPercent}%</span>
          </div>
        </div>

                <div className="md:col-span-3 bg-gradient-to-br from-blue-950/90 to-blue-900/60 border-2 border-blue-500/80 rounded-xl p-2.5 text-center shadow-lg relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-12 h-12 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20" />
          <span className="text-[10px] uppercase font-black tracking-widest text-blue-300 block mb-0.5">
            Fichas Base
          </span>
          <div className="text-2xl font-black font-mono text-blue-100 flex items-center justify-center gap-1">
            <span className="text-blue-400 text-lg">🔵</span>
            <span>
              {engine.activeShotScore ? engine.activeShotScore.finalChips : 0}
            </span>
          </div>
        </div>

                <div className="md:col-span-2 bg-gradient-to-br from-rose-950/90 to-red-900/60 border-2 border-red-500/80 rounded-xl p-2.5 text-center shadow-lg relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-12 h-12 bg-red-500/10 rounded-full blur-xl group-hover:bg-red-500/20" />
          <span className="text-[10px] uppercase font-black tracking-widest text-red-300 block mb-0.5">
            Mult
          </span>
          <div className="text-2xl font-black font-mono text-red-100 flex items-center justify-center gap-1">
            <span className="text-red-400 text-lg">🔴</span>
            <span>
              {engine.activeShotScore ? engine.activeShotScore.finalMult : 0}
            </span>
          </div>
        </div>

                <div className="md:col-span-2 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-center">
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-0.5">
            Tacadas
          </span>
          <div className="text-2xl font-black font-mono text-amber-400 flex items-center justify-center gap-1">
            <span>🎱</span>
            <span>{engine.shotsRemaining}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
