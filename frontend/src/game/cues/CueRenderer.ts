// Renderer de Sprites Customizados para os Tacos de Sinuca do Caçapa

export class CueRenderer {
  private static cachedDataUrls: Map<string, string> = new Map();

  /**
   * Desenha o taco completo ao longo do eixo X (de x=0 na sola até x=length no calço/bumper).
   * y=0 é o centro longitudinal do taco.
   */
  public static drawCueStick(
    ctx: CanvasRenderingContext2D,
    cueId: string = 'iniciante',
    length: number = 280,
    pullBack: number = 0
  ): void {
    ctx.save();
    if (pullBack > 0) {
      ctx.translate(pullBack, 0);
    }

    const tipR = 4.2; // raio na ponta (diâmetro ~8.4px)
    const buttR = 8.5; // raio no calço (diâmetro ~17px)

    // Caminho da silhueta afunilada do taco
    const buildCuePath = () => {
      ctx.beginPath();
      ctx.moveTo(0, -tipR);
      ctx.lineTo(length, -buttR);
      ctx.lineTo(length, buttR);
      ctx.lineTo(0, tipR);
      ctx.closePath();
    };

    // 1. Contorno cartoon escuro externo
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 4.5;
    ctx.strokeStyle = '#07050a';
    buildCuePath();
    ctx.stroke();

    // 2. Recorte na silhueta para renderizar o interior
    ctx.save();
    buildCuePath();
    ctx.clip();

    switch (cueId) {
      case 'maua':
        this.renderMaua(ctx, length, tipR, buttR);
        break;
      case 'forte':
        this.renderForte(ctx, length, tipR, buttR);
        break;
      case 'magnata':
        this.renderMagnata(ctx, length, tipR, buttR);
        break;
      case 'gelo':
        this.renderGelo(ctx, length, tipR, buttR);
        break;
      case 'paciente':
        this.renderPaciente(ctx, length, tipR, buttR);
        break;
      case 'trapaceiro':
        this.renderTrapaceiro(ctx, length, tipR, buttR);
        break;
      case 'iniciante':
      default:
        this.renderIniciante(ctx, length, tipR, buttR);
        break;
    }

    ctx.restore(); // fim do clip

    // 3. Brilho especular sutil na borda superior do taco (cilindro 3D)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(8, -tipR + 1.2);
    ctx.lineTo(length - 12, -buttR + 1.8);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    // 4. Borda final limpa
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#0b0710';
    buildCuePath();
    ctx.stroke();

    ctx.restore();
  }

  // TACO INICIANTE: Madeira Ash tradicional, splices de ipê, virola marfim e giz azul
  private static renderIniciante(
    ctx: CanvasRenderingContext2D,
    L: number,
    _tipR: number,
    buttR: number
  ): void {
    // Madeira base clara (ash / marfim)
    const shaftGrad = ctx.createLinearGradient(0, -buttR, 0, buttR);
    shaftGrad.addColorStop(0, '#fde6b8');
    shaftGrad.addColorStop(0.3, '#edd09b');
    shaftGrad.addColorStop(0.7, '#c89d67');
    shaftGrad.addColorStop(1, '#8f6432');
    ctx.fillStyle = shaftGrad;
    ctx.fillRect(0, -buttR, L, buttR * 2);

    // Veios sutis da madeira
    ctx.strokeStyle = 'rgba(140, 95, 45, 0.25)';
    ctx.lineWidth = 1;
    for (let i = 15; i < 150; i += 22) {
      ctx.beginPath();
      ctx.moveTo(i, -2);
      ctx.lineTo(i + 40, -1);
      ctx.stroke();
    }

    // Splices tradicionais em pontas triangulares escuras (x: 125 a 170)
    ctx.fillStyle = '#451e0f';
    ctx.beginPath();
    ctx.moveTo(125, 0);
    ctx.lineTo(165, -buttR);
    ctx.lineTo(170, -buttR);
    ctx.lineTo(170, buttR);
    ctx.lineTo(165, buttR);
    ctx.closePath();
    ctx.fill();

    // Filete claro de contorno do splice
    ctx.strokeStyle = '#fff1d0';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(125, 0);
    ctx.lineTo(165, -buttR);
    ctx.moveTo(125, 0);
    ctx.lineTo(165, buttR);
    ctx.stroke();

    // Anel de junção em latão dourado
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(146, -buttR, 6, buttR * 2);
    ctx.fillStyle = '#1e140d';
    ctx.fillRect(144, -buttR, 2, buttR * 2);
    ctx.fillRect(152, -buttR, 2, buttR * 2);

    // Empunhadura de mogno envernizado escuro (x: 170 a 260)
    const gripGrad = ctx.createLinearGradient(0, -buttR, 0, buttR);
    gripGrad.addColorStop(0, '#7c3f1d');
    gripGrad.addColorStop(0.4, '#54260e');
    gripGrad.addColorStop(1, '#2c1206');
    ctx.fillStyle = gripGrad;
    ctx.fillRect(170, -buttR, 90, buttR * 2);

    // Anéis ornamentais marfim no cabo
    ctx.fillStyle = '#fffbeb';
    ctx.fillRect(205, -buttR, 2.5, buttR * 2);
    ctx.fillRect(240, -buttR, 2.5, buttR * 2);

    // Calço / Bumper de borracha preta no fundo (x: 260 a L)
    ctx.fillStyle = '#141118';
    ctx.fillRect(260, -buttR, L - 260, buttR * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(261, -2, 4, 4); // medalha de latão

    // Virola branca de osso (x: 2 a 10)
    ctx.fillStyle = '#fffdf7';
    ctx.fillRect(2, -buttR, 8, buttR * 2);

    // Sola com giz azul royal de salão (x: 0 a 2)
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(0, -buttR, 2.5, buttR * 2);
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(0, -1.5, 1.5, 3);
  }

  // TACO DE MAUÁ: Madeira mística roxo-escura com runas e circuitos de neon ciano brilhante
  private static renderMaua(
    ctx: CanvasRenderingContext2D,
    L: number,
    _tipR: number,
    buttR: number
  ): void {
    // Base violeta espacial escuro
    const shaftGrad = ctx.createLinearGradient(0, -buttR, 0, buttR);
    shaftGrad.addColorStop(0, '#311b47');
    shaftGrad.addColorStop(0.3, '#211233');
    shaftGrad.addColorStop(0.7, '#160a24');
    shaftGrad.addColorStop(1, '#0e0517');
    ctx.fillStyle = shaftGrad;
    ctx.fillRect(0, -buttR, L, buttR * 2);

    // Circuitos e runas de energia ciano brilhante
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 6;

    // Linhas de mira e vetores geométricos inscritos
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(85, 0);
    ctx.stroke();

    // Diamantes rúnicos
    for (const rx of [35, 65, 105]) {
      ctx.beginPath();
      ctx.moveTo(rx - 4, 0);
      ctx.lineTo(rx, -2.5);
      ctx.lineTo(rx + 4, 0);
      ctx.lineTo(rx, 2.5);
      ctx.closePath();
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Anel de metal cromado com cristal de Mauá (x: 144 a 156)
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(144, -buttR, 12, buttR * 2);
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(147, -buttR, 6, buttR * 2);

    // Cabo de fibra de carbono tecnológica com filamentos ciano (x: 156 a 260)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(156, -buttR, 104, buttR * 2);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1;
    for (let x = 160; x < 255; x += 10) {
      ctx.beginPath();
      ctx.moveTo(x, -buttR);
      ctx.lineTo(x + 8, buttR);
      ctx.stroke();
    }

    // Anéis neon
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(195, -buttR, 2.5, buttR * 2);
    ctx.fillRect(230, -buttR, 2.5, buttR * 2);

    // Bumper metálico com núcleo pulsante
    ctx.fillStyle = '#1e1b2e';
    ctx.fillRect(260, -buttR, L - 260, buttR * 2);
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(L - 6, -2, 4, 4);

    // Virola iridescente ciano
    ctx.fillStyle = '#a5f3fc';
    ctx.fillRect(2, -buttR, 8, buttR * 2);

    // Giz de Mauá (Ciano Neon puro que emite aura)
    ctx.fillStyle = '#00f5ff';
    ctx.fillRect(0, -buttR, 2.5, buttR * 2);
  }

  // TACO FORTE: Aço escurecido, listras industriais de alerta laranja e chumbo pesado
  private static renderForte(
    ctx: CanvasRenderingContext2D,
    L: number,
    _tipR: number,
    buttR: number
  ): void {
    // Metal cinza chumbo escovado
    const shaftGrad = ctx.createLinearGradient(0, -buttR, 0, buttR);
    shaftGrad.addColorStop(0, '#52525b');
    shaftGrad.addColorStop(0.35, '#3f3f46');
    shaftGrad.addColorStop(0.8, '#27272a');
    shaftGrad.addColorStop(1, '#18181b');
    ctx.fillStyle = shaftGrad;
    ctx.fillRect(0, -buttR, L, buttR * 2);

    // Listras industriais de perigo/potência (Laranja e Preto fosco)
    ctx.fillStyle = '#ea580c';
    for (let x = 30; x <= 120; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, -buttR);
      ctx.lineTo(x + 12, -buttR);
      ctx.lineTo(x + 6, buttR);
      ctx.lineTo(x - 6, buttR);
      ctx.closePath();
      ctx.fill();
    }

    // Rebites de aço no corpo
    ctx.fillStyle = '#d4d4d8';
    for (let x = 20; x < 140; x += 25) {
      ctx.fillRect(x, -1, 2, 2);
    }

    // Anel duplo de aço reforçado com porcas de pressão
    ctx.fillStyle = '#71717a';
    ctx.fillRect(142, -buttR, 14, buttR * 2);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(147, -buttR, 4, buttR * 2);

    // Empunhadura tática de borracha canelada perfurada (x: 156 a 252)
    ctx.fillStyle = '#18181b';
    ctx.fillRect(156, -buttR, 96, buttR * 2);
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 1.2;
    for (let x = 162; x < 250; x += 8) {
      ctx.beginPath();
      ctx.moveTo(x, -buttR + 1);
      ctx.lineTo(x, buttR - 1);
      ctx.stroke();
    }

    // Contrapeso maciço de chumbo na ponta traseira (28g de peso extra)
    ctx.fillStyle = '#334155';
    ctx.fillRect(252, -buttR, L - 252, buttR * 2);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(255, -buttR, 2, buttR * 2);

    // Virola de bronze titânio reforçada (x: 2 a 12)
    ctx.fillStyle = '#d97706';
    ctx.fillRect(2, -buttR, 10, buttR * 2);

    // Sola densa vermelha vulcânica
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, -buttR, 2.5, buttR * 2);
  }

  // TACO MAGNATA: Mogno real, ouro 24K polido, diamantes e empunhadura verde esmeralda
  private static renderMagnata(
    ctx: CanvasRenderingContext2D,
    L: number,
    _tipR: number,
    buttR: number
  ): void {
    // Mogno nobre avermelhado reluzente
    const shaftGrad = ctx.createLinearGradient(0, -buttR, 0, buttR);
    shaftGrad.addColorStop(0, '#7f1d1d');
    shaftGrad.addColorStop(0.3, '#5c1414');
    shaftGrad.addColorStop(0.7, '#3e0c0c');
    shaftGrad.addColorStop(1, '#230505');
    ctx.fillStyle = shaftGrad;
    ctx.fillRect(0, -buttR, L, buttR * 2);

    // Estrelas de diamante e filigranas douradas ao longo da haste
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    for (const dx of [25, 55, 90, 120]) {
      // Losangos de madrepérola
      ctx.fillStyle = '#fffdf0';
      ctx.beginPath();
      ctx.moveTo(dx, -2);
      ctx.lineTo(dx + 3.5, 0);
      ctx.lineTo(dx, 2);
      ctx.lineTo(dx - 3.5, 0);
      ctx.closePath();
      ctx.fill();

      // Pontinhos de ouro
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(dx + 7, -0.8, 1.6, 1.6);
      ctx.fillRect(dx - 7, -0.8, 1.6, 1.6);
    }

    // Colar de ouro maciço 24K com diamantes incrustados
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(142, -buttR, 14, buttR * 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(145, -2, 2.5, 4);
    ctx.fillRect(150, -2, 2.5, 4);

    // Empunhadura de veludo verde esmeralda com fita de ouro trançada (x: 156 a 258)
    const emeraldGrad = ctx.createLinearGradient(0, -buttR, 0, buttR);
    emeraldGrad.addColorStop(0, '#047857');
    emeraldGrad.addColorStop(0.4, '#064e3b');
    emeraldGrad.addColorStop(1, '#022c22');
    ctx.fillStyle = emeraldGrad;
    ctx.fillRect(156, -buttR, 102, buttR * 2);

    // Fios de ouro cruzados
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 1;
    for (let x = 162; x < 255; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, -buttR);
      ctx.lineTo(x + 10, buttR);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 10, -buttR);
      ctx.lineTo(x, buttR);
      ctx.stroke();
    }

    // Pomo de ouro com gema de Esmeralda reluzente no calço
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(258, -buttR, L - 258, buttR * 2);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(265, -3, 6, 6);
    ctx.fillStyle = '#6ee7b7';
    ctx.fillRect(266, -2, 2, 2); // facet highlight

    // Virola de ouro 24K
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(2, -buttR, 8, buttR * 2);

    // Sola verde esmeralda com pó dourado
    ctx.fillStyle = '#059669';
    ctx.fillRect(0, -buttR, 2.5, buttR * 2);
  }

  // TACO DE GELO: Cristal de gelo translúcido, facetas de geleira e nevoeiro ártico
  private static renderGelo(
    ctx: CanvasRenderingContext2D,
    L: number,
    _tipR: number,
    buttR: number
  ): void {
    // Cristal de gelo translúcido com gradiente de água congelada
    const iceGrad = ctx.createLinearGradient(0, -buttR, 0, buttR);
    iceGrad.addColorStop(0, '#f0f9ff');
    iceGrad.addColorStop(0.2, '#bae6fd');
    iceGrad.addColorStop(0.6, '#38bdf8');
    iceGrad.addColorStop(0.9, '#0284c7');
    iceGrad.addColorStop(1, '#0c4a6e');
    ctx.fillStyle = iceGrad;
    ctx.fillRect(0, -buttR, L, buttR * 2);

    // Facetas de gelo pontiagudas e fraturas cristalinas
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1.2;
    for (let x = 15; x < 145; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x, -buttR + 1);
      ctx.lineTo(x + 12, 0);
      ctx.lineTo(x + 24, -buttR + 1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 12, 0);
      ctx.lineTo(x + 20, buttR - 1);
      ctx.stroke();
    }

    // Bolhas de ar congeladas
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let x = 25; x < 140; x += 19) {
      ctx.beginPath();
      ctx.arc(x, (x % 5) - 2, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Anel de prata congelada com cristais de neve (x: 144 a 156)
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(144, -buttR, 12, buttR * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(148, -buttR, 4, buttR * 2);

    // Empunhadura de couro ártico gelado com cordas brancas (x: 156 a 258)
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(156, -buttR, 102, buttR * 2);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    for (let x = 160; x < 255; x += 11) {
      ctx.beginPath();
      ctx.moveTo(x, -buttR);
      ctx.lineTo(x + 7, buttR);
      ctx.stroke();
    }

    // Calço em ponta de cristal de gelo esculpido
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(258, -buttR, L - 258, buttR * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(265, -2, 5, 4);

    // Virola de quartzo límpido transparente
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(2, -buttR, 8, buttR * 2);

    // Sola de gelo azul pó de neve
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(0, -buttR, 2.5, buttR * 2);
  }

  // TACO PACIENTE: Bambu legítimo com nós naturais, anel de bronze antigo e empunhadura zen de seda
  private static renderPaciente(
    ctx: CanvasRenderingContext2D,
    L: number,
    _tipR: number,
    buttR: number
  ): void {
    // Bambu dourado envernizado
    const bambooGrad = ctx.createLinearGradient(0, -buttR, 0, buttR);
    bambooGrad.addColorStop(0, '#fef9c3');
    bambooGrad.addColorStop(0.3, '#fde047');
    bambooGrad.addColorStop(0.7, '#ca8a04');
    bambooGrad.addColorStop(1, '#854d0e');
    ctx.fillStyle = bambooGrad;
    ctx.fillRect(0, -buttR, L, buttR * 2);

    // Nós de bambu proeminentes e realistas (anéis característicos da cana)
    const nodes = [35, 75, 115];
    for (const nx of nodes) {
      // Sombra e volume do nó
      ctx.fillStyle = '#78350f';
      ctx.fillRect(nx - 2, -buttR - 1, 4, buttR * 2 + 2);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(nx - 0.7, -buttR - 1, 1.4, buttR * 2 + 2);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(nx + 1.2, -buttR, 1, buttR * 2);
    }

    // Anel de bronze antigo trabalhado com flor de lótus
    ctx.fillStyle = '#b45309';
    ctx.fillRect(144, -buttR, 12, buttR * 2);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(147, -buttR, 6, buttR * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(149, -1.5, 2, 3); // pétala

    // Trançado tradicional japonês Ito-maki de seda verde-sálvia (x: 156 a 260)
    ctx.fillStyle = '#14532d';
    ctx.fillRect(156, -buttR, 104, buttR * 2);

    // Losangos de seda verde
    ctx.fillStyle = '#4ade80';
    for (let x = 160; x < 255; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x + 5, -buttR + 1);
      ctx.lineTo(x + 10, 0);
      ctx.lineTo(x + 5, buttR - 1);
      ctx.lineTo(x, 0);
      ctx.closePath();
      ctx.fill();
    }

    // Calço de cerejeira com medalhão de jade calmante
    ctx.fillStyle = '#422006';
    ctx.fillRect(260, -buttR, L - 260, buttR * 2);
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.arc(268, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Virola de chifre de búfalo polido
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(2, -buttR, 8, buttR * 2);

    // Sola de giz matcha verde puro
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(0, -buttR, 2.5, buttR * 2);
  }

  // TACO DO TRAPACEIRO: Ébano fosco, naipes de baralho (♠ ♥ ♦ ♣), anel de fichas de cassino e dado
  private static renderTrapaceiro(
    ctx: CanvasRenderingContext2D,
    L: number,
    _tipR: number,
    buttR: number
  ): void {
    // Ébano negro fosco clandestino
    const shaftGrad = ctx.createLinearGradient(0, -buttR, 0, buttR);
    shaftGrad.addColorStop(0, '#27272a');
    shaftGrad.addColorStop(0.3, '#18181b');
    shaftGrad.addColorStop(0.8, '#09090b');
    shaftGrad.addColorStop(1, '#000000');
    ctx.fillStyle = shaftGrad;
    ctx.fillRect(0, -buttR, L, buttR * 2);

    // Naipes de cartas de baralho estampados ao longo do taco: ♠ ♥ ♦ ♣
    ctx.font = 'bold 8px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const suits = [
      { s: '♠', c: '#ffffff', x: 26 },
      { s: '♥', c: '#ef4444', x: 54 },
      { s: '♦', c: '#ef4444', x: 84 },
      { s: '♣', c: '#ffffff', x: 114 },
    ];

    for (const item of suits) {
      ctx.fillStyle = item.c;
      ctx.fillText(item.s, item.x, 0.5);
    }

    // Colar secreto disfarçado de pilha de fichas de cassino (listras vermelhas e brancas)
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(144, -buttR, 14, buttR * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(146, -buttR, 2, buttR * 2);
    ctx.fillRect(151, -buttR, 2, buttR * 2);
    ctx.fillRect(156, -buttR, 2, buttR * 2);

    // Feltro de mesa de pôquer vermelho veludo (x: 158 a 258)
    const velvetGrad = ctx.createLinearGradient(0, -buttR, 0, buttR);
    velvetGrad.addColorStop(0, '#b91c1c');
    velvetGrad.addColorStop(0.4, '#7f1d1d');
    velvetGrad.addColorStop(1, '#450a0a');
    ctx.fillStyle = velvetGrad;
    ctx.fillRect(158, -buttR, 100, buttR * 2);

    // Listras douradas de carteado
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(190, -buttR, 2, buttR * 2);
    ctx.fillRect(225, -buttR, 2, buttR * 2);

    // Dado de cassino prateado no calço com a face "1" (ás)
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(258, -buttR, L - 258, buttR * 2);
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(268, 0, 2.5, 0, Math.PI * 2); // ponto central do dado
    ctx.fill();

    // Virola marfim envelhecida
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(2, -buttR, 8, buttR * 2);

    // Sola vermelha carmim
    ctx.fillStyle = '#9f1239';
    ctx.fillRect(0, -buttR, 2.5, buttR * 2);
  }

  /**
   * Gera uma imagem em DataURL (PNG) com o sprite horizontal de qualquer taco para uso em UI.
   */
  public static getCueSpriteDataUrl(cueId: string): string {
    if (this.cachedDataUrls.has(cueId)) {
      return this.cachedDataUrls.get(cueId)!;
    }

    const width = 300;
    const height = 30;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      // Centraliza horizontalmente e verticalmente
      ctx.translate(10, height / 2);
      this.drawCueStick(ctx, cueId, 280, 0);
      ctx.restore();

      const url = canvas.toDataURL('image/png');
      this.cachedDataUrls.set(cueId, url);
      return url;
    }

    return '';
  }
}
