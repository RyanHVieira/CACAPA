import React, { useState } from 'react';
import { CacapaPoolEngine } from '../../game/engine/CacapaPoolEngine';
import { BallCanvasPreview } from './BallCanvasPreview';

interface BallRackModalProps {
  isOpen: boolean;
  onClose: () => void;
  engine: CacapaPoolEngine;
  canUpgrade?: boolean;
  onUpdate?: () => void;
}

export const BallRackModal: React.FC<BallRackModalProps> = ({
  isOpen,
  onClose,
  engine,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const deckBalls = engine.deck && engine.deck.length > 0
    ? engine.deck
    : [1, 2, 3, 4, 5, 8, 9, 10, 11, 12].map((num) => ({
        id: `deck-${num}`,
        number: num,
        isStripe: num >= 9,
        enhancement: engine.ballDeck.get(num) || null,
      }));

  const activeOnTableCount = engine.balls.filter((b) => !b.isCue && !b.isPocketed).length;
  const enhancedBallsCount = deckBalls.filter((b) => b.enhancement !== null).length;
  const selectedBall = selectedIndex !== null && selectedIndex < deckBalls.length ? deckBalls[selectedIndex] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl xl:max-w-6xl bg-[#1b2427] border-[5px] border-[#0b0710] rounded-3xl p-6 sm:p-8 shadow-[0_10px_0_rgba(0,0,0,0.6)] relative max-h-[94vh] overflow-y-auto font-cacapa select-none">
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-[#0b0710] pb-4 mb-5">
          <div>
            <span className="text-sm sm:text-base uppercase font-black tracking-widest text-[#f2b632] block cacapa-stroke-sm">
              Caçapa • Observar Caixa
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3 cacapa-stroke mt-0.5">
            </h3>
            <p className="text-sm sm:text-base text-[#9fb4a8] mt-1 cacapa-stroke-sm">
              {activeOnTableCount} bolas na mesa • {deckBalls.length} bolas no deck • {enhancedBallsCount} com modificadores ativos
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#12181a] border-2 border-[#0b0710] shadow-[0_3px_0_rgba(0,0,0,0.45)] px-4 py-2 rounded-2xl font-black text-[#f2b632] text-base sm:text-lg cacapa-stroke-sm">
              ${engine.money}
            </div>
            <button
              onClick={onClose}
              className="bg-[#3a2a4a] border-2 border-[#0b0710] shadow-[0_3px_0_rgba(0,0,0,0.45)] hover:border-[#f2b632] text-[#f2b632] px-4 py-2 rounded-2xl text-sm sm:text-base font-black cursor-pointer transition-all active:scale-95 cacapa-stroke-sm"
            >
              ✕ Fechar
            </button>
          </div>
        </div>

        {/* Info banner */}
        <div className="mb-5 px-4 py-3 rounded-2xl bg-[#3a2a4a] border-2 border-[#0b0710] text-[#f4ecd8] text-sm sm:text-base flex items-center gap-3 shadow-[0_3px_0_rgba(0,0,0,0.45)]">
          <span className="text-xl sm:text-2xl">ℹ️</span>
          <span>
            Bolas compradas na Loja do Bar substituem bolas do seu deck! Cada bola possui seu valor (1-12), listra e modificador.
          </span>
        </div>

        {/* Balls deck */}
        <div>
          <h4 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#9fb4a8] mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2 cacapa-stroke-sm text-base sm:text-lg text-white">
              <span>🎱</span> Bolas do Seu Deck:
            </span>
            <span className="text-xs sm:text-sm text-[#9fb4a8] font-medium">
              Clique em qualquer bola para inspecionar seus poderes
            </span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 sm:gap-4">
            {deckBalls.map((deckBall, idx) => {
              const currentEnh = deckBall.enhancement;
              const liveBall = engine.balls.find((b) => b.number === deckBall.number);
              const isOnTable = liveBall && !liveBall.isPocketed && !liveBall.isSinking;
              const isSelected = selectedIndex === idx;
              const isStripe = deckBall.isStripe;

              return (
                <div
                  key={deckBall.id || `deck-ball-${idx}`}
                  onClick={() => setSelectedIndex(isSelected ? null : idx)}
                  className={`p-3.5 sm:p-4 rounded-2xl border-[3px] flex flex-col items-center justify-between text-center relative transition-all cursor-pointer shadow-[0_4px_0_rgba(0,0,0,0.45)] ${
                    isSelected
                      ? 'border-[#f2b632] bg-[#3a2a4a] scale-105 z-10'
                      : currentEnh
                      ? 'border-[#0b0710] bg-[#3a2a4a] hover:border-[#f2b632]'
                      : 'border-[#0b0710] bg-[#12181a] hover:border-[#9fb4a8]'
                  }`}
                >
                  <span
                    className={`text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 border border-[#0b0710] ${
                      isOnTable
                        ? 'bg-[#2f86ff] text-white'
                        : 'bg-[#0b0710] text-[#9fb4a8]'
                    }`}
                  >
                    {isOnTable ? '● Na Mesa' : '○ Fora da Mesa'}
                  </span>

                  <div className="relative my-2 flex items-center justify-center">
                    <BallCanvasPreview
                      number={deckBall.number}
                      isStripe={isStripe}
                      enhancement={currentEnh}
                      size={68}
                      animate={isSelected}
                    />
                    {currentEnh && (
                      <div className="absolute top-0 right-0 text-sm sm:text-base z-20 drop-shadow">
                        {currentEnh.icon}
                      </div>
                    )}
                  </div>

                  <div className="mt-1 w-full">
                    <span className="text-xs sm:text-sm font-bold text-[#9fb4a8] block">
                      Bola #{deckBall.number} {isStripe ? '(Listrada)' : '(Lisa)'}
                    </span>
                    <span
                      className={`text-sm sm:text-base font-black block mt-0.5 truncate max-w-full cacapa-stroke-sm ${
                        currentEnh ? 'text-[#f2b632]' : 'text-white'
                      }`}
                    >
                      {currentEnh ? currentEnh.name : 'Normal'}
                    </span>
                    <span className="text-xs sm:text-sm text-[#9fb4a8] block mt-0.5 font-bold">
                      +{10 + deckBall.number * 5} Fichas Base
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected ball detail card */}
        {selectedBall !== null && (
          <div className="mt-5 p-4 sm:p-5 bg-[#12181a] border-[3px] border-[#f2b632] rounded-2xl flex items-center justify-between text-sm sm:text-base animate-in fade-in shadow-[0_4px_0_rgba(0,0,0,0.45)]">
            <div className="flex items-center gap-4">
              <span className="text-3xl sm:text-4xl">
                {selectedBall.enhancement?.icon || '🎱'}
              </span>
              <div>
                <span className="font-black text-[#f2b632] block text-base sm:text-lg cacapa-stroke-sm flex items-center gap-2">
                  <span>
                    Bola #{selectedBall.number} ({selectedBall.isStripe ? 'Listrada' : 'Lisa'}) -{' '}
                    {selectedBall.enhancement?.name || 'Bola Normal'}
                  </span>
                  {selectedBall.enhancement?.rarity && (
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-black uppercase text-slate-950"
                      style={{
                        backgroundColor:
                          selectedBall.enhancement.rarity === 'Lendária'
                            ? '#c084fc'
                            : selectedBall.enhancement.rarity === 'Rara'
                            ? '#f59e0b'
                            : selectedBall.enhancement.rarity === 'Incomum'
                            ? '#38bdf8'
                            : '#9fb4a8',
                      }}
                    >
                      {selectedBall.enhancement.rarity}
                    </span>
                  )}
                </span>
                <span className="text-[#9fb4a8] text-xs sm:text-sm block mt-0.5">
                  {selectedBall.enhancement?.description ||
                    'Bola comum sem modificador especial. Concede fichas ao ser encaçapada.'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t-2 border-[#0b0710] flex flex-wrap justify-between items-center gap-3 text-xs sm:text-sm text-[#9fb4a8]">
          <span className="font-bold">
            💡 As melhorias permanecem no seu deck de bolas por toda a corrida!
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-[#3a2a4a] border-2 border-[#0b0710] shadow-[0_3px_0_rgba(0,0,0,0.45)] text-[#f2b632] font-black text-sm sm:text-base hover:border-[#f2b632] transition-all cursor-pointer cacapa-stroke-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
