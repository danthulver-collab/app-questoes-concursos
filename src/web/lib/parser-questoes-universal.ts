/**
 * 🔥 PARSER NOVO - TESTADO COM SUAS 4 QUESTÕES
 * Separa por "Gabarito:" e captura assertivas I, II, III
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
  
  const texto = textoOriginal.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Separar por "Gabarito:" usando split
  const partes = texto.split(/Gabarito:\s*([A-E])/gi);
  
  console.log(`📊 Partes: ${partes.length}`);
  
  // partes[0] = antes do primeiro Gabarito (questão 1 sem gabarito)
  // partes[1] = letra do gabarito 1 (E)
  // partes[2] = comentário 1 + questão 2
  // partes[3] = letra do gabarito 2 (C)
  // partes[4] = comentário 2 + questão 3...
  
  for (let i = 1; i < partes.length; i += 2) {
    try {
      const gabarito = partes[i].toUpperCase();
      const blocoAntes = i === 1 ? partes[0] : partes[i-1];
      const blocoDepois = partes[i+1] || '';
      
      console.log(`\n=== QUESTÃO ${(i+1)/2} ===`);
      console.log(`Gabarito: ${gabarito}`);
      
      const correta = {'A':0, 'B':1, 'C':2, 'D':3, 'E':4}[gabarito] || 0;
      
      // COMENTÁRIO (do blocoDepois até próxima QUESTÃO)
      const comentMatch = blocoDepois.match(/Comentário:\s*(.+?)(?=\n\s*QUESTÃO|\n\s*$)/is);
      const comentario = comentMatch ? comentMatch[1].trim() : `Gabarito: ${gabarito}`;
      
      // ALTERNATIVAS (do blocoAntes)
      const altRegex = /([A-E])\)\s+([^\n]+(?:\n(?![A-E]\)|Gabarito)[^\n]+)*)/gi;
      const altMatches = [...blocoAntes.matchAll(altRegex)];
      
      console.log(`Alternativas: ${altMatches.length}`);
      
      const altMap: Record<string, string> = {};
      altMatches.forEach(m => {
        altMap[m[1].toUpperCase()] = m[2].trim().replace(/\s+/g, ' ');
      });
      
      const alternativas: [string, string, string, string] = [
        altMap['A'] || '',
        altMap['B'] || '',
        altMap['C'] || '',
        altMap['D'] || ''
      ];
      
      // ASSERTIVAS (I. II. III. IV. V.)
      const assertivasRegex = /(I\.\s+.+?)(?=\n\s*A\))/is;
      const assertMatch = blocoAntes.match(assertivasRegex);
      const assertivas = assertMatch ? assertMatch[1].trim() : '';
      
      console.log(`Assertivas: ${assertivas ? 'SIM' : 'NÃO'}`);
      
      // PERGUNTA (pegar até "analise" ou "assinale" ou até assertivas)
      let textoPergunta = blocoAntes.replace(/^QUESTÃO\s+\d+\s*[–-]\s*/i, '');
      
      if (assertivas) {
        textoPergunta = textoPergunta.substring(0, textoPergunta.indexOf('I.')).trim();
      } else {
        textoPergunta = textoPergunta.split(/\n[A-E]\)/)[0].trim();
      }
      
      // Separar enunciado e pergunta
      const linhas = textoPergunta.split('\n').filter(l => l.trim().length > 5);
      let pergunta = '';
      let enunciado = '';
      
      for (let j = linhas.length - 1; j >= 0; j--) {
        if (linhas[j].match(/analise|assinale|considere|acerca|[?:]$/i)) {
          pergunta = linhas[j].trim();
          enunciado = linhas.slice(0, j).join('\n').trim();
          break;
        }
      }
      
      if (!pergunta) {
        pergunta = linhas[linhas.length - 1] || 'Questão';
        enunciado = linhas.slice(0, -1).join('\n').trim();
      }
      
      // Montar contexto
      let texto_contexto = '';
      if (enunciado) texto_contexto += enunciado;
      if (assertivas) texto_contexto += (texto_contexto ? '\n\n' : '') + assertivas;
      
      console.log(`Pergunta: ${pergunta.substring(0, 60)}`);
      console.log(`Contexto: ${texto_contexto.length} chars`);
      
      // Validar
      const altValidas = alternativas.filter(a => a.length > 3).length;
      if (altValidas < 2) {
        console.warn(`Apenas ${altValidas} alternativas`);
        continue;
      }
      
      questoes.push({
        pergunta,
        alternativas,
        correta: correta as 0 | 1 | 2 | 3,
        comentario,
        texto_contexto: texto_contexto || undefined
      });
      
      console.log(`✅ Questão ${questoes.length} adicionada!`);
      
    } catch (e) {
      console.error('Erro:', e);
    }
  }
  
  console.log(`\n🎯 TOTAL: ${questoes.length} questões\n`);
  return questoes;
}
