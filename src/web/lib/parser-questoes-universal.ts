/**
 * PARSER DEFINITIVO - SALVA TUDO NO TITLE
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
  
  // Separar por "Gabarito:"
  const blocos = texto.split(/(?=Gabarito:\s*[A-E])/i).filter(b => b.match(/Gabarito:\s*[A-E]/i));
  
  console.log(`📊 ${blocos.length} questões detectadas`);
  
  for (let i = 0; i < blocos.length; i++) {
    const bloco = blocos[i];
    
    // Buscar início desta questão
    let questaoTexto = '';
    if (i === 0) {
      const posGab = texto.indexOf('Gabarito:');
      questaoTexto = texto.substring(0, posGab);
    } else {
      const blocoAnt = blocos[i-1];
      const posComentAnt = texto.indexOf(blocoAnt) + blocoAnt.lastIndexOf('Comentário:');
      const fimComentAnt = texto.indexOf('QUESTÃO', posComentAnt);
      const posGabAtual = texto.indexOf(bloco);
      questaoTexto = texto.substring(fimComentAnt > 0 ? fimComentAnt : posComentAnt, posGabAtual);
    }
    
    questaoTexto = questaoTexto.replace(/Comentário:[\s\S]*/, '').trim();
    
    // GABARITO
    const gabMatch = bloco.match(/Gabarito:\s*([A-E])/i);
    const gabarito = gabMatch[1].toUpperCase();
    const correta = {'A':0,'B':1,'C':2,'D':3,'E':4}[gabarito] || 0;
    
    // COMENTÁRIO
    const comentMatch = bloco.match(/Comentário:\s*([\s\S]+?)$/i);
    const comentario = comentMatch ? comentMatch[1].trim() : '';
    
    // ALTERNATIVAS
    const altMatches = [...questaoTexto.matchAll(/([A-E])\)\s+([^\n]+(?:\n(?![A-E]\))[^\n]+)*)/gi)];
    const altMap: any = {};
    altMatches.forEach(m => altMap[m[1].toUpperCase()] = m[2].trim().replace(/\s+/g, ' '));
    
    const alternativas: [string, string, string, string] = [
      altMap.A || '', altMap.B || '', altMap.C || '', altMap.D || ''
    ];
    
    // 🔥 PERGUNTA = TUDO até a primeira alternativa (SEM SEPARAR!)
    let perguntaCompleta = questaoTexto.split(/\n[A-E]\)/)[0].trim();
    perguntaCompleta = perguntaCompleta.replace(/^QUESTÃO\s+\d+\s*[–-]\s*/i, '');
    
    const altValidas = alternativas.filter(a => a.length > 3).length;
    if (altValidas >= 2 && perguntaCompleta.length > 10) {
      questoes.push({
        pergunta: perguntaCompleta, // 🔥 TUDO AQUI (enunciado + assertivas + comando)
        alternativas,
        correta: correta as 0|1|2|3,
        comentario,
        texto_contexto: undefined // Não usar mais
      });
      console.log(`✅ Q${questoes.length} com ${perguntaCompleta.length} chars`);
    }
  }
  
  console.log(`🎯 TOTAL: ${questoes.length} questões`);
  return questoes;
}
