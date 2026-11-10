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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-in fade-in duration-200 select-none font-cacapa">
      <div className="w-full max-w-lg bg-[#1b2427] border-[4px] border-[#0b0710] shadow-[0_8px_0_rgba(0,0,0,0.6)] rounded-3xl p-6 text-center relative overflow-hidden animate-boss-pulse">
        {/* Animated Hazard Stripes at Top */}
        <div className="hazard-stripes py-1.5 px-4 -mx-6 -mt-6 mb-4 flex items-center justify-center border-b-[3px] border-[#0b0710]">
          <span className="bg-[#0b0710] text-[#f2b632] font-black text-xs uppercase px-3 py-1 rounded tracking-widest cacapa-stroke-sm">
            ⚠️ ALERTA DE CHEFÃO ⚠️
          </span>
        </div>

        {/* Skull / Boss Icon */}
        <div className="text-6xl my-2 animate-bounce">💀</div>

        <span className="text-xs uppercase font-black tracking-widest text-[#ff5a4a] block cacapa-stroke-sm">
          MESA {engine.ante} • RODADA 3
        </span>

        <h2 className="text-3xl sm:text-4xl font-black text-white mt-1 mb-2 cacapa-stroke">
          MESA DO CHEFÃO
        </h2>

        <p className="text-sm text-[#ffd36a] font-bold mb-4">
          Respeite a mesa. Esta rodada define sua sobrevivência!
        </p>

        {/* Special Rules Panel */}
        <div className="bg-[#12181a] border-2 border-[#0b0710] rounded-2xl p-4 mb-6 text-left space-y-2.5 shadow-inner">
          <div className="text-xs uppercase font-black text-[#ff5a4a] border-b border-[#0b0710] pb-1 tracking-wider">
            REGRAS ESPECIAIS DO CHEFÃO:
          </div>

          <div className="flex items-start gap-2.5 text-xs text-slate-200">
            <span className="text-base text-[#f2b632]">🎯</span>
            <div>
              <strong className="text-[#f2b632]">Meta Multiplicada:</strong>
              <div className="text-[#9fb4a8]">A pontuação necessária subiu para {engine.targetScore.toLocaleString()} pontos.</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-slate-200">
            <span className="text-base text-[#e0392b]">⚠️</span>
            <div>
              <strong className="text-[#e0392b]">Pressão Máxima:</strong>
              <div className="text-[#9fb4a8]">Faltas penalizam severamente e você tem menos tacadas de margem.</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-slate-200">
            <span className="text-base text-[#4aa3ff]">💎</span>
            <div>
              <strong className="text-[#4aa3ff]">Recompensa de Vitória:</strong>
              <div className="text-[#9fb4a8]">Vença para desbloquear os Coringas Lendários na Loja do Bar!</div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onClose}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#e0392b] to-[#b91c1c] hover:from-[#ff4b3a] hover:to-[#dc2626] border-[3px] border-[#0b0710] shadow-[0_4px_0_rgba(0,0,0,0.45)] text-white font-black text-lg uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer cacapa-stroke-sm"
        >
          ENFRENTAR CHEFÃO 🎱
        </button>
      </div>
    </div>
  );
};