import React, { useState } from 'react';
import { type ConsumableDef, CONSUMABLE_RARITY_COLORS } from '../../game/consumables/Consumable';

interface ConsumableSlotProps {
  consumable: ConsumableDef | null;
  onUse: () => void;
  onSell: () => void;
  nextShotMultMultiplier?: number;
}

export const ConsumableSlot: React.FC<ConsumableSlotProps> = ({
  consumable,
  onUse,
  onSell,
  nextShotMultMultiplier = 1,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!consumable) {
    return (
      <div className="relative flex items-center">
        <div
          className="w-24 sm:w-28 md:w-32 h-14 sm:h-16 rounded-2xl border-2 border-dashed border-[#475569] bg-[#141a22]/70 flex flex-col items-center justify-center text-slate-500 font-cacapa select-none transition-all hover:border-slate-400 group"
          title="Slot de Consumível (Vazio)"
        >
          <div className="text-xs sm:text-sm font-black tracking-wider uppercase opacity-85 group-hover:opacity-100">
            CONSUMÍVEL
          </div>
          <div className="text-xs font-black text-slate-400">
            0 / 1
          </div>
        </div>

        {nextShotMultMultiplier > 1 && (
          <div className="ml-2 animate-pulse flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-950/90 border-2 border-sky-400 text-sky-200 text-xs font-black uppercase tracking-wider shadow-[0_0_12px_rgba(56,189,248,0.7)] font-cacapa">
            <span>⚡</span>
            <span>5x MULT ATIVO!</span>
          </div>
        )}
      </div>
    );
  }

  const colors = CONSUMABLE_RARITY_COLORS[consumable.rarity];

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className="relative flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-2xl border-[3px] border-[#0b0710] shadow-[0_3px_0_rgba(0,0,0,0.5)] select-none font-cacapa transition-all"
        style={{
          backgroundColor: '#1b2228',
          borderColor: colors.border,
          boxShadow: `0 0 10px ${colors.glow}`,
        }}
      >
        {/* Ícone */}
        <div className="text-xl sm:text-2xl flex-shrink-0 animate-bounce duration-1000">
          {consumable.icon}
        </div>

        {/* Info & Botões */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-sm sm:text-base font-black text-white cacapa-stroke-sm leading-none">
              {consumable.name}
            </span>
            <span
              className="text-[10px] sm:text-xs font-black uppercase px-1.5 py-0.5 rounded leading-none border border-black/40"
              style={{
                backgroundColor: colors.bg,
                color: colors.text,
              }}
            >
              {consumable.rarity}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1.5">
            <button
              onClick={onUse}
              className="px-2.5 py-1 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white text-xs font-black uppercase border border-[#0b0710] shadow-[0_2px_0_rgba(0,0,0,0.3)] cursor-pointer active:scale-95 transition-all"
            >
              Usar
            </button>
            <button
              onClick={onSell}
              className="px-2 py-1 rounded-lg bg-[#7f1d1d] hover:bg-[#991b1b] text-[#fca5a5] hover:text-white text-xs font-black uppercase border border-[#0b0710] shadow-[0_2px_0_rgba(0,0,0,0.3)] cursor-pointer active:scale-95 transition-all"
              title={`Vender por $${consumable.sellValue}`}
            >
              ${consumable.sellValue}
            </button>
          </div>
        </div>
      </div>

      {nextShotMultMultiplier > 1 && (
        <div className="ml-2 animate-pulse flex items-center gap-1 px-2 py-1 rounded-xl bg-sky-950/90 border-2 border-sky-400 text-sky-200 text-[10px] font-black uppercase tracking-wider shadow-[0_0_12px_rgba(56,189,248,0.7)] font-cacapa">
          <span>⚡</span>
          <span>5x MULT ATIVO!</span>
        </div>
      )}

      {/* Tooltip flutuante */}
      {showTooltip && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 sm:w-64 bg-[#10151a] border-[3px] border-[#0b0710] rounded-2xl p-3 shadow-[0_8px_0_rgba(0,0,0,0.65)] z-50 pointer-events-none">
          <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-700/60">
            <span className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
              <span>{consumable.icon}</span> {consumable.name}
            </span>
            <span
              className="text-[10px] font-black uppercase"
              style={{ color: colors.text }}
            >
              {consumable.rarity}
            </span>
          </div>
          <p className="text-[11px] text-[#cbd5e1] leading-relaxed">
            {consumable.description}
          </p>
          <div className="mt-2 text-[10px] text-[#9fb4a8] flex justify-between font-bold border-t border-slate-800 pt-1">
            <span>Custo Original: ${consumable.cost}</span>
            <span className="text-[#f59e0b]">Venda: ${consumable.sellValue}</span>
          </div>
        </div>
      )}
    </div>
  );
};
