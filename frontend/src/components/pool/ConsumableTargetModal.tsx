import React from 'react';
import { CacapaPoolEngine, type DeckBallItem } from '../../game/engine/CacapaPoolEngine';
import { BallCanvasPreview } from './BallCanvasPreview';
import { type ConsumableDef } from '../../game/consumables/Consumable';

interface ConsumableTargetModalProps {
  isOpen: boolean;
  consumable: ConsumableDef | null;
  engine: CacapaPoolEngine;
  onClose: () => void;
  onSelectBall: (ballNumber: number, ballIndex?: number) => void;
}

export const ConsumableTargetModal: React.FC<ConsumableTargetModalProps> = ({
  isOpen,
  consumable,
  engine,
  onClose,
  onSelectBall,
}) => {
  if (!isOpen || !consumable) return null;

  const deck: DeckBallItem[] = (engine.deck && engine.deck.length > 0)
    ? engine.deck
    : [1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => ({
        id: `deck-${num}`,
        number: num,
        isStripe: num === 8 ? false : num > 8,
        enhancement: null,
      }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none font-cacapa">
      <div className="w-full max-w-2xl bg-[#171d22] border-[5px] border-[#0b0710] rounded-3xl p-6 sm:p-8 shadow-[0_12px_0_rgba(0,0,0,0.65)] flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#0b0710] pb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">{consumable.icon}</span>
            <div>
              <div className="text-xs uppercase font-black tracking-widest text-[#f2b632] cacapa-stroke-sm">
                USAR CONSUMÍVEL • {consumable.rarity.toUpperCase()}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white cacapa-stroke">
                {consumable.name}: ESCOLHA UMA BOLA
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#2a1a3a] hover:bg-[#3a2a4a] text-[#ffd36a] font-black text-lg flex items-center justify-center border-2 border-[#0b0710] cursor-pointer active:scale-95 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Descrição do efeito */}
        <div className="bg-[#1f2930] border-2 border-[#0b0710] rounded-2xl p-3 text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
          <span className="text-[#f2b632] font-black">Efeito: </span>
          {consumable.description}
        </div>

        {/* Grid de Bolas do Baralho */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4 my-2">
          {deck.map((ball: DeckBallItem, idx: number) => {
            const isEight = ball.number === 8;
            const isStripe = isEight ? false : ball.isStripe;

            return (
              <button
                key={`${ball.id}-${idx}`}
                onClick={() => onSelectBall(ball.number, idx)}
                className="group relative flex flex-col items-center justify-between p-3 rounded-2xl bg-[#232b30] hover:bg-[#2e3940] border-[3px] border-[#0b0710] hover:border-[#f2b632] shadow-[0_4px_0_rgba(0,0,0,0.45)] hover:shadow-[0_6px_0_rgba(0,0,0,0.5)] cursor-pointer active:scale-95 transition-all"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <BallCanvasPreview
                    number={ball.number}
                    isStripe={isStripe}
                    enhancement={ball.enhancement || undefined}
                    size={64}
                    animate={false}
                  />
                </div>

                <div className="text-center w-full">
                  <div className="text-xs sm:text-sm font-black text-white cacapa-stroke-sm">
                    Bola #{ball.number}
                  </div>
                  <div className="text-[10px] text-[#9fb4a8] font-bold">
                    {isEight ? 'Bola 8 (Preta)' : isStripe ? 'Listrada' : 'Lisa'}
                  </div>
                  {ball.enhancement && (
                    <div className="text-[9px] text-[#f2b632] font-black truncate max-w-full mt-0.5">
                      {ball.enhancement.name}
                    </div>
                  )}
                </div>

                <div className="mt-2 w-full py-1 text-center bg-[#10b981] group-hover:bg-[#059669] text-white text-[10px] sm:text-xs font-black uppercase rounded-lg border border-[#0b0710] shadow-[0_2px_0_rgba(0,0,0,0.3)]">
                  Selecionar
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t-2 border-[#0b0710]">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#2a1a3a] hover:bg-[#3a2a4a] text-[#ffd36a] font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-[#0b0710] cursor-pointer active:scale-95 transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
