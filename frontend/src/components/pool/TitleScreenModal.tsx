import React, { useState } from 'react';
import { CacapaLogoWithBall } from './CacapaLogoWithBall';
import { CacapaBackground } from './CacapaBackground';
import { CueManager } from '../../game/cues/CueManager';
import { CueSelectionModal } from './CueSelectionModal';
import { NM, TG } from '../../game/config/gameConfig';

interface TitleScreenModalProps {
  isOpen: boolean;
  selectedCueId: string;
  onSelectCue: (cueId: string) => void;
  onPlay: (cueId?: string) => void;
  onOpenEncyclopedia: () => void;
  onOpenOptions: () => void;
  onToggleSound?: () => void;
  isMuted?: boolean;
}

export const TitleScreenModal: React.FC<TitleScreenModalProps> = ({
  isOpen,
  selectedCueId,
  onSelectCue,
  onPlay,
  onOpenEncyclopedia,
  onOpenOptions,
  onToggleSound,
  isMuted = false,
}) => {
  const [isCueModalOpen, setIsCueModalOpen] = useState(false);

  if (!isOpen) return null;

  const highestStage = CueManager.getHighestStageReached();
  const highestStageName = NM[highestStage] || 'Boteco do Zé';
  const highestStageTarget = TG[highestStage] || 120;

  const savedBgTheme = (() => {
    try {
      return localStorage.getItem('cacapa_selected_bg_theme') || 'auto';
    } catch {
      return 'auto';
    }
  })();
  let effectiveTableIndex = highestStage % 10;
  if (savedBgTheme !== 'auto') {
    const parsed = parseInt(savedBgTheme, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= highestStage) {
      effectiveTableIndex = parsed % 10;
    }
  }

  const handleStartGame = (cueIdToUse?: string) => {
    const cueId = cueIdToUse || CueManager.getSelectedCueId() || selectedCueId || 'iniciante';
    CueManager.setSelectedCueId(cueId);
    onSelectCue(cueId);
    setIsCueModalOpen(false);
    onPlay(cueId);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between items-center bg-black/45 backdrop-blur-[2px] p-4 sm:p-8 animate-in fade-in duration-300 font-cacapa select-none overflow-hidden">
      {/* Fundo Swirl que segue a fase mais alta alcançada pelo jogador (ou o tema escolhido) */}
      <CacapaBackground tableIndex={effectiveTableIndex} />

      {/* Topo: Logo Ampliada com a Bola 8 Rotativa no centro do sprite */}
      <div className="w-full pt-2 sm:pt-6 flex flex-col items-center z-10 animate-cacapa-bob">
        <CacapaLogoWithBall size="lg" className="drop-shadow-[0_16px_36px_rgba(0,0,0,0.95)]" />

        <div className="mt-2 flex items-center gap-2">
          <span className="h-0.5 w-10 sm:w-20 bg-[#f2b632]/70" />
          <span className="text-xs sm:text-base font-black uppercase tracking-[0.28em] text-[#9ff1ff] cacapa-stroke-sm">
            SINUCA ROGUELIKE
          </span>
          <span className="h-0.5 w-10 sm:w-20 bg-[#f2b632]/70" />
        </div>
      </div>

      {/* Centro: Botões de Ação Centralizados na Tela */}
      <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center gap-3.5 z-10 my-auto">
        {/* Botão JOGAR: Abre o Pop Up Rotacional de Seleção de Taco */}
        <button
          onClick={() => setIsCueModalOpen(true)}
          className="group w-full py-4 sm:py-5 px-6 rounded-3xl bg-[#2f86ff] hover:bg-[#4aa3ff] border-[4px] border-[#0b0710] shadow-[0_8px_0_rgba(0,0,0,0.55)] text-white font-black text-xl sm:text-2xl uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer cacapa-stroke-sm flex items-center justify-center gap-3"
        >
          <span className="text-2xl sm:text-3xl transition-transform group-hover:rotate-12">🎱</span>
          <span>JOGAR</span>
        </button>

        {/* Botão ENCICLOPÉDIA */}
        <button
          onClick={onOpenEncyclopedia}
          className="group w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-[#8b3dff] hover:bg-[#9d4edd] border-[4px] border-[#0b0710] shadow-[0_6px_0_rgba(0,0,0,0.55)] text-[#ffd36a] font-black text-base sm:text-lg uppercase tracking-wider transition-all hover:scale-103 active:scale-95 cursor-pointer cacapa-stroke-sm flex items-center justify-center gap-3"
        >
          <span className="text-xl sm:text-2xl transition-transform group-hover:scale-110">📖</span>
          <span>ENCICLOPÉDIA</span>
        </button>

        {/* Botão OPÇÕES */}
        <button
          onClick={onOpenOptions}
          className="group w-full py-3 sm:py-3.5 px-6 rounded-2xl bg-[#232b30] hover:bg-[#2e373d] border-[3px] border-[#0b0710] shadow-[0_5px_0_rgba(0,0,0,0.55)] text-[#9fb4a8] hover:text-white font-black text-sm sm:text-base uppercase tracking-wider transition-all hover:scale-102 active:scale-95 cursor-pointer cacapa-stroke-sm flex items-center justify-center gap-2.5"
        >
          <span className="text-lg transition-transform group-hover:rotate-45">⚙️</span>
          <span>OPÇÕES & CONFIGURAÇÕES</span>
        </button>

        {/* Botão Rápido de Áudio se fornecido */}
        {onToggleSound && (
          <button
            onClick={onToggleSound}
            className="mt-1 py-1.5 px-4 rounded-xl bg-[#12181a]/80 hover:bg-[#1b2327] border-2 border-[#0b0710] text-[#9fb4a8] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            {isMuted ? '🔇 Áudio Desativado' : '🔊 Som e Jazz Ativados'}
          </button>
        )}
      </div>

      {/* Pop Up de Escolha de Taco com Taco em Pé e Menu Rotacional */}
      <CueSelectionModal
        isOpen={isCueModalOpen}
        selectedCueId={selectedCueId}
        onSelectCue={(cueId) => onSelectCue(cueId)}
        onConfirm={handleStartGame}
        onClose={() => setIsCueModalOpen(false)}
      />

      {/* Rodapé: Badge de Progresso / Recorde do Jogador */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 z-10 pt-4 border-t border-black/40 text-xs">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#12181a]/90 border border-[#0b0710] shadow-md text-[#9fb4a8]">
          <span className="text-base">🏆</span>
          <span>
            Tema do Fundo: <strong className="text-[#f2b632]">Mesa {highestStage + 1} ({highestStageName})</strong> • Meta: {highestStageTarget.toLocaleString('pt-BR')} pts
          </span>
        </div>

        <div className="text-[11px] text-white/50 tracking-wider">
          Projeto Caçapa • Versão 2.0 Arcade
        </div>
      </div>
    </div>
  );
};
