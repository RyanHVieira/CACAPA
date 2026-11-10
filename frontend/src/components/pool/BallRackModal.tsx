import React, { useState } from 'react';
import { CacapaPoolEngine } from '../../game/engine/CacapaPoolEngine';
import { BALL_COLORS } from '../../game/models/Ball';

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
  const [selectedBallNumber, setSelectedBallNumber] = useState<number | null>(null);

  if (!isOpen) return null;

  // Standard 10 object balls in game rack
  const rackBallNumbers = [1, 2, 3, 4, 5, 8, 9, 10, 11, 12];
  const activeOnTableCount = engine.balls.filter((b) => !b.isCue && !b.isPocketed).length;
  const enhancedBallsCount = Array.from(engine.ballDeck.values()).filter((e) => e !== null).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#1b2427] border-[4px] border-[#0b0710] rounded-3xl p-5 sm:p-6 shadow-[0_6px_0_rgba(0,0,0,0.45)] relative max-h-[92vh] overflow-y-auto font-cacapa select-none">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#0b0710] pb-3 mb-4">
          <div>
            <span className="text-xs uppercase font-black tracking-widest text-[#f2b632] block cacapa-stroke-sm">
              Caçapa • Observar Caixa
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2 cacapa-stroke">
              <span>📦</span> CAIXA DE BOLAS
            </h3>
            <p className="text-xs text-[#9fb4a8] mt-0.5 cacapa-stroke-sm">
              {activeOnTableCount} bolas na mesa • {enhancedBallsCount} com modificadores ativos
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#1b2427] border-2 border-[#0b0710] shadow-[0_2px_0_rgba(0,0,0,0.45)] px-3 py-1 rounded-xl font-bold text-[#f2b632] text-sm cacapa-stroke-sm">
              ${engine.money}
            </div>
            <button
              onClick={onClose}
              className="bg-[#3a2a4a] border-2 border-[#0b0710] shadow-[0_2px_0_rgba(0,0,0,0.45)] hover:border-[#f2b632] text-[#f2b632] px-3 py-1 rounded-xl text-xs font-black cursor-pointer transition-all cacapa-stroke-sm"
            >
              ✕ Fechar
            </button>
          </div>
        </div>

        {/* Notice: Ball mods can only be bought in the bar shop! */}
        <div className="mb-4 px-3 py-2 rounded-xl bg-[#3a2a4a] border-2 border-[#0b0710] text-[#f4ecd8] text-xs flex items-center gap-2 shadow-[0_2px_0_rgba(0,0,0,0.45)]">
          <span>ℹ️</span>
          <span>
            Novos modificadores de bola são adquiridos exclusivamente pelas <strong>garrafas de bolas na Loja do Bar</strong>!
          </span>
        </div>

        {/* RACK OF BALLS IN PLAY */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-[#9fb4a8] mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5 cacapa-stroke-sm">
              <span>🎱</span> Bolas do Seu Deck:
            </span>
            <span className="text-[10px] text-[#9fb4a8] font-normal">
              Clique em qualquer bola para inspecionar seus poderes
            </span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {rackBallNumbers.map((num) => {
              const currentEnh = engine.ballDeck.get(num) || null;
              const liveBall = engine.balls.find((b) => b.number === num);
              const isOnTable = liveBall && !liveBall.isPocketed && !liveBall.isSinking;
              const isSelected = selectedBallNumber === num;
              const baseColor = BALL_COLORS[num] || '#ffffff';
              const isStripe = num >= 9;

              return (
                <div
                  key={`deck-ball-${num}`}
                  onClick={() => setSelectedBallNumber(isSelected ? null : num)}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-between text-center relative transition-all cursor-pointer shadow-[0_3px_0_rgba(0,0,0,0.45)] ${
                    isSelected
                      ? 'border-[#f2b632] bg-[#3a2a4a] scale-105'
                      : currentEnh
                      ? 'border-[#0b0710] bg-[#3a2a4a] hover:border-[#f2b632]'
                      : 'border-[#0b0710] bg-[#12181a] hover:border-[#9fb4a8]'
                  }`}
                >
                  {/* Status Indicator (Na Mesa ou Encaçapada) */}
                  <span
                    className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full mb-1 border border-[#0b0710] ${
                      isOnTable
                        ? 'bg-[#2f86ff] text-white'
                        : 'bg-[#0b0710] text-[#9fb4a8]'
                    }`}
                  >
                    {isOnTable ? '● Na Mesa' : '○ Encaçapada'}
                  </span>

                  {/* Visual Ball Render */}
                  <div
                    className="relative w-12 h-12 rounded-full shadow-lg flex items-center justify-center my-1 overflow-hidden border-2 border-[#0b0710]"
                    style={{
                      backgroundColor: currentEnh?.color || baseColor,
                    }}
                  >
                    {isStripe && !currentEnh && (
                      <div className="absolute inset-x-0 h-4 bg-white" />
                    )}
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#0b0710] font-black text-xs z-10 shadow-inner">
                      {num}
                    </div>

                    {currentEnh && (
                      <div className="absolute top-0 right-0 text-[10px] z-20">
                        {currentEnh.icon}
                      </div>
                    )}
                  </div>

                  {/* Ball Info */}
                  <div className="mt-1">
                    <span className="text-[10px] font-bold text-[#9fb4a8] block">
                      Bola #{num}
                    </span>
                    <span
                      className={`text-xs font-black block mt-0.5 truncate max-w-[100px] cacapa-stroke-sm ${
                        currentEnh ? 'text-[#f2b632]' : 'text-white'
                      }`}
                    >
                      {currentEnh ? currentEnh.name : 'Normal'}
                    </span>
                    <span className="text-[9px] text-[#9fb4a8] block">
                      +{15 + num * 3} Fichas
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Ball Details Box */}
        {selectedBallNumber !== null && (
          <div className="mt-4 p-3 bg-[#12181a] border-2 border-[#f2b632] rounded-2xl flex items-center justify-between text-xs animate-in fade-in shadow-[0_2px_0_rgba(0,0,0,0.45)]">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {engine.ballDeck.get(selectedBallNumber)?.icon || '🎱'}
              </span>
              <div>
                <span className="font-black text-[#f2b632] block text-sm cacapa-stroke-sm">
                  Bola #{selectedBallNumber} -{' '}
                  {engine.ballDeck.get(selectedBallNumber)?.name || 'Bola Normal'}
                </span>
                <span className="text-[#9fb4a8] text-[11px]">
                  {engine.ballDeck.get(selectedBallNumber)?.description ||
                    'Bola comum sem efeitos adicionais. Concede fichas ao ser encaçapada.'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-[#0b0710] flex flex-wrap justify-between items-center gap-2 text-xs text-[#9fb4a8]">
          <span>
            💡 As melhorias permanecem no seu deck de bolas por toda a corrida!
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#3a2a4a] border-2 border-[#0b0710] shadow-[0_3px_0_rgba(0,0,0,0.45)] text-[#f2b632] font-black hover:border-[#f2b632] transition-all cursor-pointer cacapa-stroke-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
