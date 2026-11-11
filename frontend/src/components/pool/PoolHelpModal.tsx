import React from 'react';

interface PoolHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PoolHelpModal: React.FC<PoolHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl sm:max-w-4xl bg-[#1b2427] border-[5px] border-[#0b0710] rounded-3xl p-6 sm:p-8 shadow-[0_10px_0_rgba(0,0,0,0.6)] relative max-h-[92vh] overflow-y-auto font-cacapa select-none">
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-[#0b0710] pb-4 mb-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">📖</span>
            <h3 className="text-3xl sm:text-4xl font-black text-[#f2b632] cacapa-stroke">
              Como Jogar Caçapa
            </h3>
          </div>
          <button
            onClick={onClose}
            className="bg-[#3a2a4a] border-2 border-[#0b0710] shadow-[0_3px_0_rgba(0,0,0,0.45)] hover:border-[#f2b632] text-[#f2b632] px-4 py-2 rounded-2xl text-sm sm:text-base font-black cursor-pointer transition-all cacapa-stroke-sm"
          >
            ✕ Fechar
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 text-sm sm:text-base text-[#9fb4a8] leading-relaxed">
          {/* Controls */}
          <div className="bg-[#12181a] border-[3px] border-[#0b0710] rounded-2xl p-5 shadow-inner">
            <h4 className="font-black text-[#f2b632] uppercase tracking-wider mb-3 flex items-center gap-2 text-base sm:text-lg cacapa-stroke-sm">
              <span>🎯</span> Controles da Tacada
            </h4>
            <ul className="list-disc list-inside space-y-2 text-slate-200 text-sm sm:text-base">
              <li>
                <strong>Mirar:</strong> Mova o mouse na mesa; a linha de mira e o taco apontam na direção do tiro.
              </li>
              <li>
                <strong>Força e Disparo:</strong> Segure o botão esquerdo do mouse (ou a tecla Espaço); a força oscilará continuamente na barra inferior. Solte na hora certa para disparar na força desejada!
              </li>
              <li>
                <strong>Cancelar:</strong> Clique com o botão direito ou pressione ESC para cancelar o tiro.
              </li>
              <li>
                <strong>Previsão de Trajetória:</strong> A linha pontilhada mostra onde a bola branca vai bater e a seta amarela indica o desvio da bola alvo!
              </li>
            </ul>
          </div>

          {/* Scoring */}
          <div className="bg-[#12181a] border-[3px] border-[#0b0710] rounded-2xl p-5 shadow-inner">
            <h4 className="font-black text-[#2f86ff] uppercase tracking-wider mb-3 flex items-center gap-2 text-base sm:text-lg cacapa-stroke-sm">
              <span>🔵🔴</span> Sistema de Pontuação Caçapa
            </h4>
            <p className="mb-3 text-slate-300 text-sm sm:text-base">
              Sua pontuação final por tacada é calculada exatamente como no Caçapa:
            </p>
            <div className="bg-[#1b2427] border-2 border-[#0b0710] p-3 rounded-2xl text-center text-lg sm:text-xl font-black text-[#f2b632] mb-3 cacapa-stroke-sm">
              [ Fichas ] × [ Multiplicador ] = Pontos
            </div>
            <ul className="list-disc list-inside space-y-2 text-slate-200 text-sm sm:text-base">
              <li>
                <strong>Bolas Encaçapadas:</strong> Cada bola derrubada concede Fichas de acordo com seu número.
              </li>
              <li>
                <strong>Mãos Especiais:</strong> Tabeladas, Caçapas Duplas, Triplas e a Bola 8 concedem grandes bônus de Fichas e Multiplicadores!
              </li>
              <li>
                <strong>Ativação de Coringas:</strong> Seus Coringas ativam em ordem da esquerda para a direita, adicionando mais Fichas (+), Mult (+) e até multiplicadores exponenciais (×Mult)!
              </li>
            </ul>
          </div>

          {/* Shop */}
          <div className="bg-[#12181a] border-[3px] border-[#0b0710] rounded-2xl p-5 shadow-inner">
            <h4 className="font-black text-[#ff5a4a] uppercase tracking-wider mb-3 flex items-center gap-2 text-base sm:text-lg cacapa-stroke-sm">
              <span>🛒</span> Loja e Baralho de Cartas
            </h4>
            <ul className="list-disc list-inside space-y-2 text-slate-200 text-sm sm:text-base">
              <li>
                Ao bater a meta de pontos, você vence a rodada e ganha dinheiro ($) para gastar na Loja do Bar!
              </li>
              <li>
                Compre até <strong>5 Coringas</strong> que mudam as regras e turbinam suas tacadas.
              </li>
              <li>
                Compre <strong>Garrafas de Bolas</strong> para transformar suas bolas com selos e efeitos mágicos!
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t-2 border-[#0b0710] text-center">
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-2xl bg-[#3a2a4a] border-[3px] border-[#0b0710] shadow-[0_4px_0_rgba(0,0,0,0.45)] text-[#f2b632] font-black text-base sm:text-lg hover:border-[#f2b632] transition-all cursor-pointer cacapa-stroke-sm"
          >
            Entendido, Bora Jogar!
          </button>
        </div>
      </div>
    </div>
  );
};
