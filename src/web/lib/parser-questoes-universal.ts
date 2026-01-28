/**
 * 🔥 PARSER UNIVERSAL - CAPTURA ASSERTIVAS I, II, III, IV, V
 * Aceita: Gabarito:, Correta:, Resposta:
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
  
  let texto = textoOriginal.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Separar por "---" ou numeração
  let blocos: string[] = [];
  
  if (texto.includes('---')) {
    blocos = texto.split(/\n\s*---\s*\n/).filter(b => b.trim().length > 30);
  } else {
    const regex = /([\s\S]+?(?:Gabarito|Correta|Resposta):\s*[A-E][\s\S]+?(?:Comentário|Comentario)?:?[\s\S]*?)(?=\n\s*\d+[\.\)]|\n\s*---|$)/gi;
    const matches = texto.matchAll(regex);
    for (const match of matches) {
      if (match[1].trim().length > 50) blocos.push(match[1].trim());
    }
  }
  
  console.log(`🎯 Total de blocos: ${blocos.length}`);
  
  for (let i = 0; i < blocos.length; i++) {
    try {
      const bloco = blocos[i].trim();
      
      // 1. GABARITO
      const gabMatch = bloco.match(/(?:Gabarito|Correta|Resposta|Certa):\s*([A-E])/i);
      if (!gabMatch) continue;
      const gabarito = gabMatch[1].toUpperCase();
      const correta = {'A':0, 'B':1, 'C':2, 'D':3, 'E':4}[gabarito] || 0;
      
      // 2. COMENTÁRIO
      const comentMatch = bloco.match(/(?:Comentário|Comentario|Explicação|Explicacao|Justificativa):\s*([\s\S]+?)$/i);
      let comentario = comentMatch ? comentMatch[1].trim() : `Resposta: ${gabarito}`;
      comentario = comentario.split(/\n\s*\d+[\.\)]\s/)[0].trim();
      
      // 3. PARTE ANTES DO GABARITO
      const antesGabarito = bloco.split(/(?:Gabarito|Correta|Resposta|Certa):/i)[0].trim();
      
      // 4. EXTRAIR ALTERNATIVAS (A, B, C, D)
      const regexAlt = /([A-E])[\)\.]?\s+([^\n]+(?:\n(?![A-E][\)\.]|\s*(?:Gabarito|Correta)|I\.|II\.))[^\n]+)*)/gi;
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
      
      // 5. EXTRAIR ASSERTIVAS (I, II, III, IV, V) - CRUCIAL!
      const assertivasMatch = antesGabarito.match(/(?:I\.|II\.|III\.|IV\.|V\.|VI\.)\s*[^\n]+(?:\n(?!I\.|II\.|III\.|IV\.|V\.|VI\.|[A-E]\))[^\n]+)*/gi);
      let assertivas = '';
      if (assertivasMatch && assertivasMatch.length > 0) {
        assertivas = assertivasMatch.map(a => a.trim()).join('\n');
        console.log(`✓ ${assertivasMatch.length} assertivas capturadas`);
      }
      
      // 6. EXTRAIR PERGUNTA (até primeira alternativa ou assertiva)
      let parteAntesAlt = antesGabarito;
      
      // Remover assertivas da parte da pergunta se existirem
      if (assertivas) {
        const posAssertivaI = antesGabarito.indexOf('I.');
        if (posAssertivaI > 0) {
          parteAntesAlt = antesGabarito.substring(0, posAssertivaI);
        }
      }
      
      // Remover alternativas
      parteAntesAlt = parteAntesAlt.split(/\n\s*A[\)\.]?\s/i)[0].trim();
      parteAntesAlt = parteAntesAlt.replace(/^\s*\d+[\.\)]\s*/, '');
      
      const linhas = parteAntesAlt.split('\n').map(l => l.trim()).filter(l => l.length > 5);
      
      let pergunta = '';
      let enunciado = '';
      
      // Procurar linha de comando (assinale, analise, etc)
      let indicePergunta = -1;
      for (let j = linhas.length - 1; j >= 0; j--) {
        if (linhas[j].match(/[?:]$|EXCETO|incorreta|correta|assinale|marque|indique|julgue|analise/i)) {
          indicePergunta = j;
          break;
        }
      }
      
      if (indicePergunta >= 0) {
        pergunta = linhas[indicePergunta];
        enunciado = linhas.slice(0, indicePergunta).join('\n');
      } else if (linhas.length > 0) {
        pergunta = linhas[linhas.length - 1];
        enunciado = linhas.slice(0, -1).join('\n');
      }
      
      // 7. MONTAR TEXTO_CONTEXTO = enunciado + assertivas
      let texto_contexto = '';
      if (enunciado) texto_contexto += enunciado;
      if (assertivas) texto_contexto += (texto_contexto ? '\n\n' : '') + assertivas;
      
      // 8. VALIDAR
      const altValidas = alternativas.filter(a => a.length > 3).length;
      if (altValidas < 2 || pergunta.length < 10) continue;
      
      questoes.push({
        pergunta,
        alternativas,
        correta: correta as 0 | 1 | 2 | 3,
        comentario,
        texto_contexto: texto_contexto.trim() || undefined
      });
      
      console.log(`✅ Q${questoes.length}: "${pergunta.substring(0, 50)}..." | Contexto: ${!!texto_contexto}`);
      
    } catch (e) {
      console.error(`❌ Erro bloco ${i+1}:`, e);
    }
  }
  
  console.log(`\n🎯 TOTAL: ${questoes.length} questões`);
  return questoes;
}
