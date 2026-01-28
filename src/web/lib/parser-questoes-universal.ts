/**
 * 🔥 PARSER UNIVERSAL DE QUESTÕES - VERSÃO CORRIGIDA
 * Separa corretamente os blocos: PERGUNTA → ALTERNATIVAS → GABARITO → COMENTÁRIO
 * 
 * FORMATO ESPERADO:
 * 
 * 1. Pergunta aqui...
 * 
 * A) Alternativa A
 * B) Alternativa B
 * C) Alternativa C
 * D) Alternativa D
 * 
 * Gabarito: A
 * 
 * Comentário: Explicação aqui...
 * 
 * ---
 * 
 * 2. Segunda pergunta...
 */

export interface QuestaoParseada {
  pergunta: string;
  alternativas: [string, string, string, string];
  correta: 0 | 1 | 2 | 3;
  comentario: string;
  texto_contexto?: string;
}

export function parsearQuestoesUniversal(textoOriginal: string): QuestaoParseada[] {
  const questoes: QuestaoParseada[] = [];
  
  // 🔥 Normalizar quebras de linha
  let texto = textoOriginal.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // 🔥 ESTRATÉGIA 1: Separar por "---" se existir
  let blocos: string[] = [];
  
  if (texto.includes('---')) {
    blocos = texto.split(/\n\s*---\s*\n/).filter(b => b.trim().length > 30);
    console.log(`📊 Separação por "---": ${blocos.length} blocos`);
  }
  
  // 🔥 ESTRATÉGIA 2: Se não tem "---", separar por numeração + Gabarito
  if (blocos.length === 0) {
    // Encontra padrão: número no início + conteúdo até próximo Gabarito/Comentário completo
    const regex = /(\d+[\.\)]\s*[\s\S]+?Gabarito:\s*[A-E]\s*\n\s*Comentário:[\s\S]+?)(?=\n\s*\d+[\.\)]\s|$)/gi;
    const matches = texto.matchAll(regex);
    
    for (const match of matches) {
      if (match[1].trim().length > 30) {
        blocos.push(match[1].trim());
      }
    }
    console.log(`📊 Separação por numeração: ${blocos.length} blocos`);
  }
  
  // 🔥 ESTRATÉGIA 3: Fallback - separar apenas por "Gabarito:" mas capturar até próximo
  if (blocos.length === 0) {
    const partes = texto.split(/(?=Gabarito:\s*[A-E])/i).filter(p => p.trim().length > 20);
    
    for (let i = 0; i < partes.length; i++) {
      const parte = partes[i];
      if (!parte.match(/Gabarito:\s*[A-E]/i)) continue;
      
      // Pegar conteúdo anterior (pergunta + alternativas)
      const posGabarito = texto.indexOf(parte);
      let inicio = posGabarito;
      
      // Voltar até achar número ou início
      const textoAntes = texto.substring(0, posGabarito);
      const numMatch = textoAntes.match(/\n\s*(\d+[\.\)])\s*[^\n]/g);
      if (numMatch && numMatch.length > 0) {
        const lastNum = numMatch[numMatch.length - 1];
        inicio = textoAntes.lastIndexOf(lastNum);
      }
      
      // Pegar até fim do comentário
      const gabaritoMatch = parte.match(/Gabarito:\s*[A-E]\s*\n\s*Comentário:([\s\S]+?)(?=\n\s*\d+[\.\)]|$)/i);
      if (gabaritoMatch) {
        const blocoCompleto = texto.substring(inicio, posGabarito) + parte.split(/\n\s*\d+[\.\)]/)[0];
        if (blocoCompleto.trim().length > 30) {
          blocos.push(blocoCompleto.trim());
        }
      }
    }
    console.log(`📊 Separação por fallback: ${blocos.length} blocos`);
  }
  
  // 🔥 PROCESSAR CADA BLOCO INDEPENDENTEMENTE
  for (let i = 0; i < blocos.length; i++) {
    try {
      const bloco = blocos[i].trim();
      
      // 1. EXTRAIR GABARITO (OBRIGATÓRIO)
      const gabMatch = bloco.match(/Gabarito:\s*([A-E])/i);
      if (!gabMatch) {
        console.warn(`⚠️ Bloco ${i+1} sem Gabarito, pulando`);
        continue;
      }
      const gabarito = gabMatch[1].toUpperCase();
      const correta = {'A':0, 'B':1, 'C':2, 'D':3, 'E':4}[gabarito] || 0;
      
      // 2. EXTRAIR COMENTÁRIO (tudo APÓS "Comentário:" até fim do bloco)
      const comentMatch = bloco.match(/Comentário:\s*([\s\S]+?)$/i);
      let comentario = comentMatch ? comentMatch[1].trim() : `Gabarito: ${gabarito}`;
      
      // 🔥 LIMPAR COMENTÁRIO: remover qualquer número de questão ou conteúdo da próxima
      comentario = comentario.split(/\n\s*\d+[\.\)]\s/)[0].trim();
      
      // 3. PARTE ANTES DO GABARITO (pergunta + alternativas)
      const antesGabarito = bloco.split(/Gabarito:/i)[0].trim();
      
      // 4. EXTRAIR ALTERNATIVAS
      const regexAlt = /([A-E])[\)\.]?\s+([^\n]+(?:\n(?![A-E][\)\.]|\s*Gabarito)[^\n]+)*)/gi;
      const altMatches = [...antesGabarito.matchAll(regexAlt)];
      
      const altMap: Record<string, string> = {};
      altMatches.forEach(m => {
        const letra = m[1].toUpperCase();
        const textoAlt = m[2].trim().replace(/\s+/g, ' ');
        altMap[letra] = textoAlt;
      });
      
      const alternativas: [string, string, string, string] = [
        altMap['A'] || '',
        altMap['B'] || '',
        altMap['C'] || '',
        altMap['D'] || ''
      ];
      
      // 5. EXTRAIR PERGUNTA (tudo antes da primeira alternativa)
      let parteAntesAlt = antesGabarito.split(/\n\s*A[\)\.]?\s/i)[0].trim();
      parteAntesAlt = parteAntesAlt.replace(/^\s*\d+[\.\)]\s*/, ''); // Remove numeração
      
      // Encontrar linha da pergunta (termina com ? : ou tem EXCETO, assinale etc)
      const linhas = parteAntesAlt.split('\n').map(l => l.trim()).filter(l => l.length > 5);
      
      let pergunta = '';
      let contexto = '';
      
      // Procurar linha que parece pergunta
      let indicePergunta = -1;
      for (let j = linhas.length - 1; j >= 0; j--) {
        if (linhas[j].match(/[?:]$|EXCETO|incorreta|correta|assinale|marque|indique|julgue/i)) {
          indicePergunta = j;
          break;
        }
      }
      
      if (indicePergunta >= 0) {
        pergunta = linhas[indicePergunta];
        contexto = linhas.slice(0, indicePergunta).join('\n');
      } else if (linhas.length > 0) {
        pergunta = linhas[linhas.length - 1];
        contexto = linhas.slice(0, -1).join('\n');
      } else {
        pergunta = `Questão ${i + 1}`;
      }
      
      // 6. VALIDAR E ADICIONAR
      const altValidas = alternativas.filter(a => a.length > 3).length;
      
      if (altValidas < 2) {
        console.warn(`⚠️ Bloco ${i+1}: apenas ${altValidas} alternativas válidas`);
        continue;
      }
      
      if (pergunta.length < 10) {
        console.warn(`⚠️ Bloco ${i+1}: pergunta muito curta`);
        continue;
      }
      
      questoes.push({
        pergunta,
        alternativas,
        correta: correta as 0 | 1 | 2 | 3,
        comentario,
        texto_contexto: contexto.trim() || undefined
      });
      
      console.log(`✅ Q${questoes.length}: "${pergunta.substring(0, 50)}..." | Gab: ${gabarito}`);
      
    } catch (e) {
      console.error(`❌ Erro processando bloco ${i+1}:`, e);
    }
  }
  
  console.log(`\n🎯 TOTAL PARSEADO: ${questoes.length} questões válidas`);
  return questoes;
}
