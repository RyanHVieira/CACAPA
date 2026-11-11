import React, { useState } from 'react';
import { CardCatalog } from '../../game/cards/CardCatalog';
import type { Card } from '../../game/cards/Card';

interface JokerCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JokerCollectionModal: React.FC<JokerCollectionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [filterRarity, setFilterRarity] = useState<string>('all');

  if (!isOpen) return null;

  const allJokers = CardCatalog.getAllJokers();
  const discoveredIds = CardCatalog.getDiscoveredJokerIds();
  const discoveredCount = allJokers.filter((j) => discoveredIds.has(j.id)).length;

  const filteredJokers = allJokers.filter((j) => {
    if (filterRarity === 'all') return true;
    return j.rarity.toLowerCase() === filterRarity.toLowerCase();
  });

  const getRarityBadgeStyle = (rarity: string) => {
    switch (rarity) {
      case 'Lendária':
        return 'bg-purple-950/60 text-purple-300 border-purple-500/50';
      case 'Rara':
        return 'bg-amber-950/60 text-amber-300 border-amber-500/50';
      case 'Incomum':
        return 'bg-sky-950/60 text-sky-300 border-sky-500/50';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-600/50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200 select-none font-cacapa">
      <div className="w-full max-w-5xl bg-[#1b2427] border-[5px] border-[#0b0710] rounded-3xl p-6 sm:p-8 shadow-[0_12px_0_rgba(0,0,0,0.65)] relative max-h-[95vh] overflow-y-auto flex flex-col justify-between">
        {/* Header */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-[#0b0710] pb-4 mb-4 gap-3">
            <div>
              <span className="text-xs sm:text-sm uppercase font-black tracking-widest text-[#f2b632] block cacapa-stroke-sm">
                Compêndio Balatro de Sinuca
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3 cacapa-stroke mt-0.5">
                <span>🃏</span> COLEÇÃO DE CORINGAS
              </h2>
              <p className="text-sm sm:text-base text-[#9fb4a8] mt-1 cacapa-stroke-sm">
                Exibe todos os coringas e garrafas especiais descobertos em suas jornadas.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Contador de Descobertos */}
              <div className="bg-[#12181a] border-2 border-[#0b0710] px-4 py-2 rounded-2xl shadow-[0_2px_0_rgba(0,0,0,0.4)] flex items-center gap-2">
                <span className="text-sm font-bold text-[#9fb4a8]">Descobertos:</span>
                <span className="text-base sm:text-lg font-black text-[#f2b632] cacapa-stroke-sm">
                  {discoveredCount}/{allJokers.length}
                </span>
              </div>

              <button
                onClick={onClose}
                className="bg-[#3a2a4a] border-2 border-[#0b0710] shadow-[0_3px_0_rgba(0,0,0,0.45)] hover:border-[#f2b632] text-[#f2b632] px-4 py-2 rounded-2xl text-sm sm:text-base font-black cursor-pointer transition-all active:scale-95 cacapa-stroke-sm"
              >
                ✕ Fechar
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4">
            <button
              onClick={() => setFilterRarity('all')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider border-2 transition-all cursor-pointer ${
                filterRarity === 'all'
                  ? 'bg-[#f2b632] text-[#0b0710] border-[#0b0710] shadow-[0_2px_0_rgba(0,0,0,0.4)]'
                  : 'bg-[#12181a] text-[#9fb4a8] border-[#0b0710] hover:text-white'
              }`}
            >
              Todos ({allJokers.length})
            </button>
            {['Comum', 'Incomum', 'Rara', 'Lendária'].map((r) => (
              <button
                key={r}
                onClick={() => setFilterRarity(r)}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider border-2 transition-all cursor-pointer ${
                  filterRarity === r
                    ? 'bg-[#f2b632] text-[#0b0710] border-[#0b0710] shadow-[0_2px_0_rgba(0,0,0,0.4)]'
                    : 'bg-[#12181a] text-[#9fb4a8] border-[#0b0710] hover:text-white'
                }`}
              >
                {r} ({allJokers.filter((j) => j.rarity === r).length})
              </button>
            ))}
          </div>

          {/* Grid de Coringas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 my-2">
            {filteredJokers.map((joker: Card) => {
              const isFound = discoveredIds.has(joker.id);

              if (isFound) {
                return (
                  <div
                    key={joker.id}
                    className="p-4 rounded-2xl border-[3px] border-[#0b0710] bg-[#12181a] shadow-[0_4px_0_rgba(0,0,0,0.45)] flex flex-col justify-between text-left transition-transform hover:scale-102"
                  >
                    <div>
                      {/* Top Bar: Icon + Rarity */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-3xl filter drop-shadow">{joker.icon}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getRarityBadgeStyle(
                            joker.rarity
                          )}`}
                        >
                          {joker.rarity}
                        </span>
                      </div>

                      {/* Name & Cost */}
                      <h4 className="text-base sm:text-lg font-black text-white cacapa-stroke-sm">
                        {joker.name}
                      </h4>
                      <p className="text-xs text-[#9fb4a8] mt-1 leading-snug">
                        {joker.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#0b0710]/60 flex items-center justify-between text-xs font-bold text-[#f2b632]">
                      <span>Custo na Loja:</span>
                      <span>${joker.cost}</span>
                    </div>
                  </div>
                );
              }

              // Silhueta / Não Descoberto
              return (
                <div
                  key={joker.id}
                  className="p-4 rounded-2xl border-[3px] border-[#0b0710] bg-[#0c1012]/80 opacity-65 flex flex-col justify-between text-left shadow-none"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-3xl opacity-40">❓</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-slate-500 border border-slate-700">
                        BLOQUEADO
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg font-black text-slate-500 cacapa-stroke-sm">
                      ???
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-snug italic">
                      Compre ou adquira este coringa em uma partida para desvendar sua receita e efeito.
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#0b0710]/40 text-[11px] font-bold text-slate-600">
                    Ainda não descoberto
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t-2 border-[#0b0710] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-[#3a2a4a] border-2 border-[#0b0710] shadow-[0_3px_0_rgba(0,0,0,0.45)] text-[#f2b632] font-black text-sm sm:text-base hover:border-[#f2b632] transition-all cursor-pointer cacapa-stroke-sm"
          >
            Fechar Compêndio
          </button>
        </div>
      </div>
    </div>
  );
};
