import React from 'react';
import { Card } from '../../game/cards/Card';

interface JokerBarProps {
  jokers: Card[];
  consumables: Card[];
  maxJokers?: number;
  maxConsumables?: number;
  onSellCard: (type: 'Joker' | 'Tarot', index: number) => void;
  onUseConsumable: (index: number) => void;
  highlightedCardId?: string | null;
}

export const JokerBar: React.FC<JokerBarProps> = ({
  jokers,
  consumables,
  maxJokers = 5,
  maxConsumables = 2,
  onSellCard,
  onUseConsumable,
  highlightedCardId,
}) => {
  return (
    <div className="w-full max-w-[960px] mx-auto mt-4 bg-slate-900/90 border-2 border-slate-700/80 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                <div className="flex-1 w-full">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span>🃏</span> Coringas Ativos ({jokers.length}/{maxJokers})
            </span>
            <span className="text-[11px] text-slate-400">
              Ativam da esquerda para a direita
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {Array.from({ length: maxJokers }).map((_, idx) => {
              const card = jokers[idx];

              if (!card) {
                return (
                  <div
                    key={`empty-joker-${idx}`}
                    className="w-28 h-40 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-600 bg-slate-950/40"
                  >
                    <span className="text-xl opacity-30">🃏</span>
                    <span className="text-[10px] mt-1 uppercase tracking-wider font-bold">
                      Vazio
                    </span>
                  </div>
                );
              }

              const isHighlighted = highlightedCardId === card.id;

              return (
                <div
                  key={`joker-${card.id}-${idx}`}
                  className={`w-28 h-40 rounded-xl relative flex flex-col justify-between p-2 shadow-lg transition-all duration-200 group select-none ${
                    isHighlighted
                      ? 'scale-110 -translate-y-2 ring-4 ring-amber-400 z-20 shadow-amber-500/50'
                      : 'hover:-translate-y-1.5 hover:shadow-2xl'
                  } ${
                    card.edition === 'Policromático'
                      ? 'bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-600 border-2 border-pink-400'
                      : card.edition === 'Holográfico'
                      ? 'bg-gradient-to-tr from-cyan-900 via-blue-800 to-indigo-900 border-2 border-cyan-400'
                      : card.edition === 'Foil'
                      ? 'bg-gradient-to-tr from-slate-800 via-amber-900 to-slate-900 border-2 border-amber-300'
                      : 'bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-700'
                  }`}
                >
                                    {card.edition !== 'Base' && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-md">
                      {card.edition}
                    </span>
                  )}

                                    <div className="flex justify-between items-start">
                    <span className="text-2xl drop-shadow">{card.icon}</span>
                    <span
                      className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded border"
                      style={{
                        borderColor: card.getRarityColor(),
                        color: card.getRarityColor(),
                        backgroundColor: 'rgba(0,0,0,0.4)',
                      }}
                    >
                      {card.rarity}
                    </span>
                  </div>

                                    <div className="my-auto text-center">
                    <h4 className="text-[11px] font-black text-amber-200 leading-tight group-hover:text-amber-300">
                      {card.name}
                    </h4>
                    <p className="text-[9px] text-slate-300 line-clamp-3 mt-1 leading-tight">
                      {card.description}
                    </p>
                  </div>

                                    <div className="pt-1 border-t border-slate-700/60 flex justify-between items-center">
                    <span className="text-[8px] text-slate-400 font-mono">
                      x{card.timesTriggered}
                    </span>
                    <button
                      onClick={() => onSellCard('Joker', idx)}
                      className="text-[9px] font-bold text-red-400 hover:text-red-300 bg-red-950/80 hover:bg-red-900 px-1.5 py-0.5 rounded border border-red-800 transition-colors"
                      title="Vender Curinga: 75% do valor"
                    >
                      Vender ${card.sellPrice}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

                <div className="w-full md:w-auto md:border-l md:border-slate-800 md:pl-6">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <span>🔮</span> Consumíveis ({consumables.length}/{maxConsumables})
            </span>
          </div>

          <div className="flex gap-3">
            {Array.from({ length: maxConsumables }).map((_, idx) => {
              const card = consumables[idx];

              if (!card) {
                return (
                  <div
                    key={`empty-consumable-${idx}`}
                    className="w-28 h-40 border-2 border-dashed border-purple-950/60 rounded-xl flex flex-col items-center justify-center text-purple-900/60 bg-purple-950/20"
                  >
                    <span className="text-xl opacity-30">🔮</span>
                    <span className="text-[10px] mt-1 uppercase tracking-wider font-bold">
                      Vazio
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={`tarot-${card.id}-${idx}`}
                  className="w-28 h-40 rounded-xl bg-gradient-to-b from-purple-950 via-slate-900 to-indigo-950 border-2 border-purple-500/80 p-2 flex flex-col justify-between shadow-lg relative group hover:-translate-y-1.5 transition-all select-none"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-2xl drop-shadow">{card.icon}</span>
                    <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-900/80 text-purple-200 border border-purple-600">
                      Tarô
                    </span>
                  </div>

                  <div className="my-auto text-center">
                    <h4 className="text-[11px] font-black text-purple-200 leading-tight">
                      {card.name}
                    </h4>
                    <p className="text-[9px] text-slate-300 line-clamp-3 mt-1 leading-tight">
                      {card.description}
                    </p>
                  </div>

                  <div className="pt-1 border-t border-purple-800/60 flex justify-between items-center gap-1">
                    <button
                      onClick={() => onUseConsumable(idx)}
                      className="flex-1 text-[10px] font-black text-purple-900 bg-purple-300 hover:bg-purple-200 py-0.5 rounded shadow transition-transform active:scale-95"
                    >
                      USAR
                    </button>
                    <button
                      onClick={() => onSellCard('Tarot', idx)}
                      className="text-[9px] font-bold text-red-400 hover:text-red-300 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-800"
                      title="Vender Consumível"
                    >
                      ${card.sellPrice}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
