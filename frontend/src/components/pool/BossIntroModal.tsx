import React from 'react';
import { CacapaPoolEngine } from '../../game/engine/CacapaPoolEngine';

interface BossIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  engine: CacapaPoolEngine;
}

export const BossIntroModal: React.FC<BossIntroModalProps> = ({ isOpen, onClose, engine }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200 select-none font-cacapa">
      <div className="w-full max-w-2xl sm:max-w-3xl bg-[#1b2427] border-[5px] border-[#0b0710] shadow-[0_10px_0_rgba(0,0,0,0.6)] rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden animate-boss-pulse">
        {/* Hazard banner */}
        <div className="hazard-stripes py-2 px-6 -mx-8 sm:-mx-10 -mt-8 sm:-mt-10 mb-6 flex items-center justify-center border-b-[4px] border-[#0b0710]">
          <span className="bg-[#0b0710] text-[#f2b632] font-black text-sm sm:text-base uppercase px-4 py-1.5 rounded-xl tracking-widest cacapa-stroke-sm">
            ⚠️ ALERTA DE CHEFÃO ⚠️
          </span>
        </div>

        <div className="text-7xl sm:text-8xl my-3 animate-bounce">💀</div>

        <span className="text-sm sm:text-base uppercase font-black tracking-widest text-[#ff5a4a] block cacapa-stroke-sm">
          MESA {engine.ante} • RODADA 3
        </span>

        <h2 className="text-4xl sm:text-5xl font-black text-white mt-1 mb-3 cacapa-stroke">
          MESA DO CHEFÃO
        </h2>

        <p className="text-base sm:text-lg text-[#ffd36a] font-bold mb-6">
          Respeite a mesa. Esta rodada define sua sobrevivência!
        </p>

        {/* Special rules */}
        <div className="bg-[#12181a] border-[3px] border-[#0b0710] rounded-3xl p-6 mb-8 text-left space-y-4 shadow-inner">
          <div className="text-sm sm:text-base uppercase font-black text-[#ff5a4a] border-b-2 border-[#0b0710] pb-2 tracking-wider">
            REGRAS ESPECIAIS DO CHEFÃO:
          </div>

          <div className="flex items-start gap-3.5 text-sm sm:text-base text-slate-200">
            <span className="text-2xl text-[#f2b632]">🎯</span>
            <div>
              <strong className="text-[#f2b632] text-base sm:text-lg">Meta Multiplicada:</strong>
              <div className="text-[#9fb4a8] mt-0.5">A pontuação necessária subiu para {engine.targetScore.toLocaleString()} pontos.</div>
            </div>
          </div>

          <div className="flex items-start gap-3.5 text-sm sm:text-base text-slate-200">
            <span className="text-2xl text-[#e0392b]">⚠️</span>
            <div>
              <strong className="text-[#e0392b] text-base sm:text-lg">Pressão Máxima:</strong>
              <div className="text-[#9fb4a8] mt-0.5">Faltas penalizam severamente e você tem menos tacadas de margem.</div>
            </div>
          </div>

          <div className="flex items-start gap-3.5 text-sm sm:text-base text-slate-200">
            <span className="text-2xl text-[#4aa3ff]">💎</span>
            <div>
              <strong className="text-[#4aa3ff] text-base sm:text-lg">Recompensa de Vitória:</strong>
              <div className="text-[#9fb4a8] mt-0.5">Vença para desbloquear os Coringas Lendários na Loja do Bar!</div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-5 px-8 rounded-2xl bg-gradient-to-r from-[#e0392b] to-[#b91c1c] hover:from-[#ff4b3a] hover:to-[#dc2626] border-[4px] border-[#0b0710] shadow-[0_6px_0_rgba(0,0,0,0.45)] text-white font-black text-xl sm:text-2xl uppercase tracking-wider transition-all hover:scale-102 active:scale-98 cursor-pointer cacapa-stroke-sm"
        >
          ENFRENTAR CHEFÃO 🎱
        </button>
      </div>
    </div>
  );
};
