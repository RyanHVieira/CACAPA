import React, { useState } from 'react';
import type { CacapaPoolEngine } from '../../game/engine/CacapaPoolEngine';
import { CUES, CueManager } from '../../game/cues/CueManager';
import { CONSUMABLES, type ConsumableDef } from '../../game/consumables/Consumable';
import { CardCatalog } from '../../game/cards/CardCatalog';
import { BallEnhancementCatalog } from '../../game/enhancements/BallEnhancement';
import { NM, TG } from '../../game/config/gameConfig';
import type { Card, CardEdition } from '../../game/cards/Card';

interface AdminDebugModalProps {
  isOpen: boolean;
  onClose: () => void;
  engine: CacapaPoolEngine;
  onUpdate: () => void;
  user: { name: string; id?: string } | null;
}

type AdminTab = 'partida' | 'tacos' | 'coringas' | 'itens';

export const AdminDebugModal: React.FC<AdminDebugModalProps> = ({
  isOpen,
  onClose,
  engine,
  onUpdate,
  user,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('partida');
  const [customMoney, setCustomMoney] = useState<string>('');
  const [customShots, setCustomShots] = useState<string>('');
  const [jokerEdition, setJokerEdition] = useState<CardEdition>('Base');
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleEquipCue = (cueId: string) => {
    engine.cueId = cueId;
    CueManager.setSelectedCueId(cueId);
    if (cueId === 'gelo') {
      engine.physics.friction = 0.995;
    } else {
      engine.physics.friction = 0.988;
    }
    showNotif(`Taco equipado: ${CueManager.getCue(cueId).name}`);
    onUpdate();
  };

  const handleUnlockAllCues = () => {
    CueManager.unlockAllCues();
    showNotif('Todos os tacos foram desbloqueados!');
    onUpdate();
  };

  const handleSetInfiniteMoney = () => {
    engine.money = 999999;
    showNotif('Dinheiro Infinito ativado: $999,999');
    onUpdate();
  };

  const handleAddMoney = (amount: number) => {
    engine.money = Math.max(0, engine.money + amount);
    showNotif(`${amount >= 0 ? '+' : ''}$${amount} adicionado`);
    onUpdate();
  };

  const handleApplyCustomMoney = () => {
    const val = parseInt(customMoney, 10);
    if (!isNaN(val) && val >= 0) {
      engine.money = val;
      showNotif(`Dinheiro definido para $${val}`);
      setCustomMoney('');
      onUpdate();
    }
  };

  const handleAddShots = (amount: number) => {
    engine.shotsRemaining = Math.max(0, engine.shotsRemaining + amount);
    showNotif(`${amount >= 0 ? '+' : ''}${amount} tacadas`);
    onUpdate();
  };

  const handleSetCustomShots = () => {
    const val = parseInt(customShots, 10);
    if (!isNaN(val) && val >= 0) {
      engine.shotsRemaining = val;
      showNotif(`Tacadas definidas para ${val}`);
      setCustomShots('');
      onUpdate();
    }
  };

  const handleResetFaults = () => {
    engine.foulCount = 0;
    showNotif('Faltas zeradas com sucesso!');
    onUpdate();
  };

  const handleWinBlind = () => {
    engine.currentScore = engine.targetScore + 100;
    showNotif('Meta batida com sucesso!');
    onUpdate();
  };

  const handleSkipToShop = () => {
    engine.state = 'SHOP';
    showNotif('Pulando direto para a Loja...');
    onClose();
    onUpdate();
  };

  const handleJumpToAnte = (anteNum: number) => {
    engine.ante = anteNum;
    engine.targetScore = TG[anteNum - 1] || 120;
    engine.currentScore = 0;
    engine.shotsRemaining = engine.maxShots;
    CueManager.recordStageReached(anteNum - 1);
    showNotif(`Saltou para a Mesa ${anteNum} (${NM[anteNum - 1] || 'Fase'})`);
    onUpdate();
  };

  const handleRerackInfinite = () => {
    engine.reracksRemaining = 99;
    engine.rerack();
    showNotif('Mesa rearumada (Reracks: 99)');
    onUpdate();
  };

  const handlePocketBall8 = () => {
    const ball8 = engine.balls.find((b) => b.number === 8);
    if (ball8) {
      ball8.isPocketed = true;
      ball8.vel.x = 0;
      ball8.vel.y = 0;
      showNotif('Bola 8 encaçapada!');
      onUpdate();
    } else {
      showNotif('Bola 8 não encontrada na mesa.');
    }
  };

  const handleStopAllBalls = () => {
    engine.balls.forEach((b) => {
      b.vel.x = 0;
      b.vel.y = 0;
    });
    if (engine.cueBall) {
      engine.cueBall.vel.x = 0;
      engine.cueBall.vel.y = 0;
    }
    showNotif('Todas as bolas paradas imediatamente.');
    onUpdate();
  };

  const handlePocketAllExcept8 = () => {
    engine.balls.forEach((b) => {
      if (!b.isCue && b.number !== 8) {
        b.isPocketed = true;
        b.vel.x = 0;
        b.vel.y = 0;
      }
    });
    showNotif('Todas as bolas (exceto 8 e branca) encaçapadas.');
    onUpdate();
  };

  const handleAddJoker = (card: Card) => {
    card.edition = jokerEdition;
    engine.ownedJokers.push(card);
    CardCatalog.recordDiscoveredJoker(card.id);
    showNotif(`Coringa adicionado: ${card.name} (${jokerEdition})`);
    onUpdate();
  };

  const handleClearJokers = () => {
    engine.ownedJokers = [];
    showNotif('Todos os coringas foram removidos.');
    onUpdate();
  };

  const handleIncreaseJokerSlots = () => {
    engine.maxJokers = Math.min(10, engine.maxJokers + 1);
    showNotif(`Slots de coringa aumentados para ${engine.maxJokers}`);
    onUpdate();
  };

  const handleGiveConsumable = (item: ConsumableDef) => {
    engine.ownedConsumable = item;
    showNotif(`Consumível recebido: ${item.name} ${item.icon}`);
    onUpdate();
  };

  const handleUnlockAllEncyclopedia = () => {
    // Registra todos os estágios alcançados
    CueManager.recordStageReached(9);
    // Registra todos os modificadores
    BallEnhancementCatalog.getAll().forEach((e) => {
      BallEnhancementCatalog.recordDiscoveredEnhancement(e.id);
    });
    // Registra todos os coringas
    CardCatalog.getAllJokers().forEach((j) => {
      CardCatalog.recordDiscoveredJoker(j.id);
    });
    showNotif('Enciclopédia 100% desbloqueada!');
    onUpdate();
  };

  const handleApplyEnhancement = (enhId: string) => {
    const targetBall = engine.balls.find((b) => !b.isCue && !b.isPocketed) || engine.balls[1];
    if (targetBall) {
      const enh = BallEnhancementCatalog.getById(enhId);
      if (enh) {
        targetBall.enhancement = enh;
        engine.ballMods[targetBall.number] = enh.id;
        BallEnhancementCatalog.recordDiscoveredEnhancement(enh.id);
        showNotif(`Modificador ${enh.name} aplicado na Bola ${targetBall.number}!`);
        onUpdate();
      }
    }
  };

  const allJokers = CardCatalog.getAllJokers();
  const allEnhancements = BallEnhancementCatalog.getAll();
  const currentCue = CueManager.getCue(engine.cueId || 'iniciante');

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200 select-none font-cacapa">
      <div className="w-full max-w-3xl bg-[#12181d] border-[5px] border-[#0b0710] rounded-3xl shadow-[0_12px_0_rgba(0,0,0,0.7)] flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Header com Identificação Vox */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#201138] via-[#2d1b4e] to-[#12181d] border-b-[4px] border-[#0b0710] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-pulse">🛠️</span>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-[#ffd36a] uppercase tracking-wider cacapa-stroke-sm flex items-center gap-2">
                PAINEL DE DEBUG & ADMIN
              </h2>
              <div className="flex items-center gap-2 text-xs text-[#a085d6] font-mono mt-0.5">
                <span className="bg-[#431f75] px-2 py-0.5 rounded border border-[#6b35b8] text-white font-bold">
                  {user?.name?.toUpperCase() || 'VOX'}
                </span>
                <span className="text-slate-400 truncate max-w-[240px] sm:max-w-none">
                  ID: {user?.id || '38921965-4c35-419f-8f02-9ab6cf86f407'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-[#2a1a3a] hover:bg-[#3d2454] border-2 border-[#0b0710] text-[#ffd36a] font-black text-xl flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            title="Fechar (ESC)"
          >
            ✕
          </button>
        </div>

        {/* Notificação Flutuante */}
        {notification && (
          <div className="bg-[#f59e0b] text-[#0b0710] px-4 py-1.5 text-center text-xs sm:text-sm font-black uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
            ⚡ {notification}
          </div>
        )}

        {/* Abas */}
        <div className="flex border-b-2 border-[#0b0710] bg-[#171e24] px-3 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('partida')}
            className={`px-4 py-2 rounded-t-xl font-black text-xs sm:text-sm uppercase tracking-wide border-t-2 border-x-2 border-[#0b0710] transition-colors cursor-pointer ${
              activeTab === 'partida'
                ? 'bg-[#12181d] text-[#ffd36a]'
                : 'bg-[#1e272f] text-slate-400 hover:text-white'
            }`}
          >
            ⚡ Partida & Mesa
          </button>

          <button
            onClick={() => setActiveTab('tacos')}
            className={`px-4 py-2 rounded-t-xl font-black text-xs sm:text-sm uppercase tracking-wide border-t-2 border-x-2 border-[#0b0710] transition-colors cursor-pointer ${
              activeTab === 'tacos'
                ? 'bg-[#12181d] text-[#ffd36a]'
                : 'bg-[#1e272f] text-slate-400 hover:text-white'
            }`}
          >
            🎯 Tacos ({CUES.length})
          </button>

          <button
            onClick={() => setActiveTab('coringas')}
            className={`px-4 py-2 rounded-t-xl font-black text-xs sm:text-sm uppercase tracking-wide border-t-2 border-x-2 border-[#0b0710] transition-colors cursor-pointer ${
              activeTab === 'coringas'
                ? 'bg-[#12181d] text-[#ffd36a]'
                : 'bg-[#1e272f] text-slate-400 hover:text-white'
            }`}
          >
            🃏 Coringas ({engine.ownedJokers.length}/{engine.maxJokers})
          </button>

          <button
            onClick={() => setActiveTab('itens')}
            className={`px-4 py-2 rounded-t-xl font-black text-xs sm:text-sm uppercase tracking-wide border-t-2 border-x-2 border-[#0b0710] transition-colors cursor-pointer ${
              activeTab === 'itens'
                ? 'bg-[#12181d] text-[#ffd36a]'
                : 'bg-[#1e272f] text-slate-400 hover:text-white'
            }`}
          >
            🥤 Consumíveis & Bolas
          </button>
        </div>

        {/* Conteúdo das Abas */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* TAB 1: PARTIDA & MESA */}
          {activeTab === 'partida' && (
            <div className="space-y-5">
              {/* STATUS BAR RÁPIDA */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-[#1b2329] border-2 border-[#0b0710] rounded-2xl p-3 flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Dinheiro</span>
                  <span className="text-xl sm:text-2xl font-black text-[#52dc7e] cacapa-stroke-sm">
                    ${engine.money}
                  </span>
                </div>
                <div className="bg-[#1b2329] border-2 border-[#0b0710] rounded-2xl p-3 flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Tacadas</span>
                  <span className="text-xl sm:text-2xl font-black text-[#2f86ff] cacapa-stroke-sm">
                    {engine.shotsRemaining} / {engine.maxShots}
                  </span>
                </div>
                <div className="bg-[#1b2329] border-2 border-[#0b0710] rounded-2xl p-3 flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Faltas</span>
                  <span className={`text-xl sm:text-2xl font-black cacapa-stroke-sm ${engine.foulCount > 0 ? 'text-[#ff5a4a]' : 'text-slate-300'}`}>
                    {engine.foulCount} / {engine.maxFouls}
                  </span>
                </div>
                <div className="bg-[#1b2329] border-2 border-[#0b0710] rounded-2xl p-3 flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Mesa / Ante</span>
                  <span className="text-xl sm:text-2xl font-black text-[#f2b632] cacapa-stroke-sm truncate">
                    Mesa {engine.ante}
                  </span>
                </div>
              </div>

              {/* SEÇÃO DINHEIRO */}
              <div className="bg-[#182026] border-2 border-[#0b0710] rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-black text-[#52dc7e] uppercase tracking-wider flex items-center gap-2">
                  <span>💰</span> Economia & Dinheiro
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleSetInfiniteMoney}
                    className="px-3.5 py-2 rounded-xl bg-[#1e4620] hover:bg-[#28602b] border-2 border-[#0b0710] text-[#52dc7e] font-black text-xs sm:text-sm cursor-pointer active:scale-95"
                  >
                    👑 Dinheiro Infinito ($999,999)
                  </button>
                  <button
                    onClick={() => handleAddMoney(50)}
                    className="px-3 py-2 rounded-xl bg-[#232c33] hover:bg-[#2d3841] border border-[#0b0710] text-slate-200 font-bold text-xs cursor-pointer active:scale-95"
                  >
                    +$50
                  </button>
                  <button
                    onClick={() => handleAddMoney(200)}
                    className="px-3 py-2 rounded-xl bg-[#232c33] hover:bg-[#2d3841] border border-[#0b0710] text-slate-200 font-bold text-xs cursor-pointer active:scale-95"
                  >
                    +$200
                  </button>
                  <button
                    onClick={() => handleAddMoney(1000)}
                    className="px-3 py-2 rounded-xl bg-[#232c33] hover:bg-[#2d3841] border border-[#0b0710] text-slate-200 font-bold text-xs cursor-pointer active:scale-95"
                  >
                    +$1,000
                  </button>
                  <button
                    onClick={() => {
                      engine.money = 0;
                      onUpdate();
                    }}
                    className="px-3 py-2 rounded-xl bg-[#3f191b] hover:bg-[#522123] border border-[#0b0710] text-[#ff7a7a] font-bold text-xs cursor-pointer active:scale-95"
                  >
                    Zerar ($0)
                  </button>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    value={customMoney}
                    onChange={(e) => setCustomMoney(e.target.value)}
                    placeholder="Definir valor exato..."
                    className="bg-[#12181d] border-2 border-[#0b0710] rounded-xl px-3 py-1.5 text-xs text-white flex-1 focus:outline-none focus:border-[#52dc7e]"
                  />
                  <button
                    onClick={handleApplyCustomMoney}
                    className="px-4 py-1.5 rounded-xl bg-[#2f86ff] hover:bg-[#4aa3ff] border-2 border-[#0b0710] text-white font-black text-xs cursor-pointer"
                  >
                    Aplicar
                  </button>
                </div>
              </div>

              {/* SEÇÃO TACADAS & FALTAS */}
              <div className="bg-[#182026] border-2 border-[#0b0710] rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-black text-[#2f86ff] uppercase tracking-wider flex items-center gap-2">
                  <span>🎱</span> Tacadas & Faltas
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleAddShots(1)}
                    className="px-3 py-2 rounded-xl bg-[#232c33] hover:bg-[#2d3841] border border-[#0b0710] text-slate-200 font-bold text-xs cursor-pointer active:scale-95"
                  >
                    +1 Tacada
                  </button>
                  <button
                    onClick={() => handleAddShots(5)}
                    className="px-3 py-2 rounded-xl bg-[#232c33] hover:bg-[#2d3841] border border-[#0b0710] text-slate-200 font-bold text-xs cursor-pointer active:scale-95"
                  >
                    +5 Tacadas
                  </button>
                  <button
                    onClick={() => handleAddShots(10)}
                    className="px-3 py-2 rounded-xl bg-[#232c33] hover:bg-[#2d3841] border border-[#0b0710] text-slate-200 font-bold text-xs cursor-pointer active:scale-95"
                  >
                    +10 Tacadas
                  </button>
                  <button
                    onClick={() => {
                      engine.shotsRemaining = 99;
                      showNotif('99 Tacadas concedidas!');
                      onUpdate();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#1e3450] hover:bg-[#264368] border-2 border-[#0b0710] text-[#9fcbff] font-black text-xs cursor-pointer active:scale-95"
                  >
                    🚀 99 Tacadas
                  </button>
                  <button
                    onClick={handleResetFaults}
                    className="px-3.5 py-2 rounded-xl bg-[#4a1c1d] hover:bg-[#632426] border-2 border-[#0b0710] text-[#ff8e8e] font-black text-xs cursor-pointer active:scale-95"
                  >
                    🚫 Zerar Faltas ({engine.foulCount})
                  </button>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    value={customShots}
                    onChange={(e) => setCustomShots(e.target.value)}
                    placeholder="Definir tacadas exatas..."
                    className="bg-[#12181d] border-2 border-[#0b0710] rounded-xl px-3 py-1.5 text-xs text-white flex-1 focus:outline-none focus:border-[#2f86ff]"
                  />
                  <button
                    onClick={handleSetCustomShots}
                    className="px-4 py-1.5 rounded-xl bg-[#2f86ff] hover:bg-[#4aa3ff] border-2 border-[#0b0710] text-white font-black text-xs cursor-pointer"
                  >
                    Aplicar
                  </button>
                </div>
              </div>

              {/* SEÇÃO PONTOS & MESAS */}
              <div className="bg-[#182026] border-2 border-[#0b0710] rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-black text-[#ffd36a] uppercase tracking-wider flex items-center gap-2">
                  <span>🏆</span> Pontuação & Avanço de Mesa
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleWinBlind}
                    className="px-3.5 py-2 rounded-xl bg-[#4b3512] hover:bg-[#614518] border-2 border-[#0b0710] text-[#ffd36a] font-black text-xs cursor-pointer active:scale-95"
                  >
                    🎯 Bater Meta da Blind
                  </button>
                  <button
                    onClick={handleSkipToShop}
                    className="px-3.5 py-2 rounded-xl bg-[#27384a] hover:bg-[#344b63] border-2 border-[#0b0710] text-[#9fcbff] font-black text-xs cursor-pointer active:scale-95"
                  >
                    🛍️ Pular para a Loja
                  </button>
                  <button
                    onClick={handleRerackInfinite}
                    className="px-3 py-2 rounded-xl bg-[#232c33] hover:bg-[#2d3841] border border-[#0b0710] text-slate-200 font-bold text-xs cursor-pointer active:scale-95"
                  >
                    🔄 Rearrumar Mesa
                  </button>
                  <button
                    onClick={handleStopAllBalls}
                    className="px-3 py-2 rounded-xl bg-[#33232c] hover:bg-[#442e3b] border border-[#0b0710] text-[#f49fcb] font-bold text-xs cursor-pointer active:scale-95"
                  >
                    🛑 Parar Bolas (Reset Vel)
                  </button>
                </div>

                {/* Saltador de Mesas (1 a 10) */}
                <div className="pt-2">
                  <span className="text-xs text-slate-400 font-bold block mb-1.5">
                    Saltar para Mesa:
                  </span>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((ante) => (
                      <button
                        key={ante}
                        onClick={() => handleJumpToAnte(ante)}
                        className={`py-1.5 rounded-xl border font-black text-xs transition-colors cursor-pointer ${
                          engine.ante === ante
                            ? 'bg-[#f2b632] text-[#0b0710] border-[#0b0710]'
                            : 'bg-[#1b2329] hover:bg-[#253038] text-slate-200 border-[#0b0710]'
                        }`}
                        title={NM[ante - 1]}
                      >
                        {ante}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TACOS */}
          {activeTab === 'tacos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#0b0710]">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{currentCue.icon}</span>
                  <div>
                    <span className="text-xs text-slate-400 block font-bold">Taco Atualmente Equipado:</span>
                    <span className="text-base font-black text-[#52dc7e]">{currentCue.name}</span>
                  </div>
                </div>
                <button
                  onClick={handleUnlockAllCues}
                  className="px-3.5 py-2 rounded-xl bg-[#8b3dff] hover:bg-[#9e55ff] border-2 border-[#0b0710] text-[#ffd36a] font-black text-xs cursor-pointer active:scale-95"
                >
                  🔓 Desbloquear Todos os Tacos
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CUES.map((cue) => {
                  const isCurrent = (engine.cueId || 'iniciante') === cue.id;
                  const isUnlocked = CueManager.isCueUnlocked(cue.id);

                  return (
                    <div
                      key={cue.id}
                      className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-2.5 ${
                        isCurrent
                          ? 'bg-[#1b2f21] border-[#52dc7e]'
                          : 'bg-[#182026] border-[#0b0710] hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-3xl p-1 bg-[#12181d] rounded-xl border border-[#0b0710]">
                            {cue.icon}
                          </span>
                          <div>
                            <h4 className="font-black text-sm text-white flex items-center gap-2">
                              {cue.name}
                              {isCurrent && (
                                <span className="bg-[#52dc7e] text-[#0b0710] text-[10px] px-1.5 py-0.2 rounded font-black">
                                  EQUIPADO
                                </span>
                              )}
                            </h4>
                            <span className="text-xs text-[#f2b632] font-bold block mt-0.5">
                              {cue.effectLabel}
                            </span>
                          </div>
                        </div>

                        {!isUnlocked && (
                          <span className="text-[10px] text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-[#0b0710]">
                            🔒 Bloq
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {cue.description}
                      </p>

                      <div className="flex items-center gap-2 pt-1 border-t border-[#0b0710]">
                        <button
                          onClick={() => handleEquipCue(cue.id)}
                          disabled={isCurrent}
                          className={`flex-1 py-1.5 px-3 rounded-xl font-black text-xs transition-colors cursor-pointer active:scale-95 ${
                            isCurrent
                              ? 'bg-transparent text-[#52dc7e] border border-[#52dc7e]/50 cursor-default'
                              : 'bg-[#2f86ff] hover:bg-[#4aa3ff] text-white border border-[#0b0710]'
                          }`}
                        >
                          {isCurrent ? 'Em Uso' : 'Equipar Imediatamente'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CORINGAS */}
          {activeTab === 'coringas' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#0b0710]">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-bold">Edição ao Adicionar:</span>
                  {(['Base', 'Foil', 'Holográfico', 'Policromático'] as CardEdition[]).map((ed) => (
                    <button
                      key={ed}
                      onClick={() => setJokerEdition(ed)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-xs border transition-colors cursor-pointer ${
                        jokerEdition === ed
                          ? 'bg-[#ffd36a] text-[#0b0710] border-[#0b0710]'
                          : 'bg-[#1b2329] text-slate-300 border-[#0b0710]'
                      }`}
                    >
                      {ed}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleIncreaseJokerSlots}
                    disabled={engine.maxJokers >= 10}
                    className="px-3 py-1.5 rounded-xl bg-[#232c33] hover:bg-[#2d3841] border border-[#0b0710] text-[#ffd36a] font-bold text-xs cursor-pointer active:scale-95 disabled:opacity-40"
                  >
                    +1 Slot ({engine.maxJokers}/10)
                  </button>
                  <button
                    onClick={handleClearJokers}
                    className="px-3 py-1.5 rounded-xl bg-[#3f191b] hover:bg-[#522123] border border-[#0b0710] text-[#ff7a7a] font-bold text-xs cursor-pointer active:scale-95"
                  >
                    Limpar Todos
                  </button>
                </div>
              </div>

              {/* Grid com Todos os Coringas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {allJokers.map((joker) => (
                  <div
                    key={joker.id}
                    className="bg-[#182026] border-2 border-[#0b0710] rounded-2xl p-3 flex flex-col justify-between gap-2 hover:border-[#ffd36a]/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-black text-xs text-white truncate">{joker.name}</h4>
                        <span className="text-[10px] bg-[#12181d] px-1.5 py-0.5 rounded border border-[#0b0710] text-[#ffd36a] font-mono">
                          ${joker.cost}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{joker.description}</p>
                    </div>

                    <button
                      onClick={() => handleAddJoker(joker)}
                      className="w-full py-1.5 rounded-xl bg-[#2f86ff] hover:bg-[#4aa3ff] border border-[#0b0710] text-white font-black text-xs cursor-pointer active:scale-95"
                    >
                      + Adicionar à Mão
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CONSUMÍVEIS & BOLAS */}
          {activeTab === 'itens' && (
            <div className="space-y-5">
              {/* CONSUMÍVEIS */}
              <div className="bg-[#182026] border-2 border-[#0b0710] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#f59e0b] uppercase tracking-wider flex items-center gap-2">
                    <span>🍔</span> Dar Consumível para o Slot
                  </h3>
                  {engine.ownedConsumable && (
                    <span className="text-xs text-[#52dc7e] font-bold">
                      Slot Atual: {engine.ownedConsumable.name} {engine.ownedConsumable.icon}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CONSUMABLES.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleGiveConsumable(item)}
                      className="p-3 rounded-xl bg-[#1f272e] hover:bg-[#28323a] border border-[#0b0710] flex items-center gap-2.5 text-left cursor-pointer active:scale-95 transition-colors"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div className="min-w-0">
                        <span className="font-black text-xs text-white block truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {item.rarity} (${item.cost})
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* BOLAS NA MESA */}
              <div className="bg-[#182026] border-2 border-[#0b0710] rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-black text-[#38bdf8] uppercase tracking-wider flex items-center gap-2">
                  <span>🎱</span> Ações com Bolas na Mesa
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handlePocketBall8}
                    className="px-3.5 py-2 rounded-xl bg-[#232c33] hover:bg-[#2d3841] border border-[#0b0710] text-[#ffd36a] font-bold text-xs cursor-pointer active:scale-95"
                  >
                    🎱 Encaçapar Bola 8
                  </button>
                  <button
                    onClick={handlePocketAllExcept8}
                    className="px-3.5 py-2 rounded-xl bg-[#232c33] hover:bg-[#2d3841] border border-[#0b0710] text-slate-200 font-bold text-xs cursor-pointer active:scale-95"
                  >
                    ⚪ Encaçapar Lisas & Listradas
                  </button>
                  <button
                    onClick={handleStopAllBalls}
                    className="px-3.5 py-2 rounded-xl bg-[#232c33] hover:bg-[#2d3841] border border-[#0b0710] text-slate-200 font-bold text-xs cursor-pointer active:scale-95"
                  >
                    🛑 Parar Bolas em Movimento
                  </button>
                </div>
              </div>

              {/* MODIFICADORES DE BOLA */}
              <div className="bg-[#182026] border-2 border-[#0b0710] rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-black text-[#52dc7e] uppercase tracking-wider flex items-center gap-2">
                  <span>✨</span> Aplicar Modificador em Bola na Mesa
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {allEnhancements.map((enh) => (
                    <button
                      key={enh.id}
                      onClick={() => handleApplyEnhancement(enh.id)}
                      className="p-2 rounded-xl bg-[#1f272e] hover:bg-[#28323a] border border-[#0b0710] flex items-center gap-2 text-left cursor-pointer active:scale-95 transition-colors"
                    >
                      <span className="text-lg">{enh.icon}</span>
                      <div className="min-w-0">
                        <span className="font-black text-xs text-white block truncate">
                          {enh.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          ${enh.cost}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ENCICLOPÉDIA COMPLETA */}
              <div className="bg-[#182026] border-2 border-[#0b0710] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-[#c084fc] uppercase tracking-wider flex items-center gap-2">
                    <span>📖</span> Desbloqueio Global
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Revela todas as 10 mesas, todos os modificadores de bola e todos os coringas na Enciclopédia.
                  </p>
                </div>
                <button
                  onClick={handleUnlockAllEncyclopedia}
                  className="px-4 py-2.5 rounded-xl bg-[#8b3dff] hover:bg-[#a052ff] border-2 border-[#0b0710] text-[#ffd36a] font-black text-xs uppercase cursor-pointer active:scale-95"
                >
                  Revelar Tudo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com Dica de Atalho */}
        <div className="px-5 py-3 bg-[#0d1215] border-t-2 border-[#0b0710] flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono">
            Atalho Rápido: <span className="text-[#ffd36a] font-bold">↑ ↑ ↓ ↓ ← → ← →</span> (Konami sem B A)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#232c33] hover:bg-[#2d3841] text-white font-bold cursor-pointer"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
};
