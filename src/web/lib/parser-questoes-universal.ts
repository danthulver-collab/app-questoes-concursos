/**
 * PARSER DEFINITIVO - Pega TUDO até alternativa A)
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
  
  const blocos = texto.split(/(?=Gabarito:\s*[A-E])/i).filter(b => b.match(/Gabarito:\s*[A-E]/i));
  
  console.log(`📊 ${blocos.length} questões detectadas`);
  
  for (let i = 0; i < blocos.length; i++) {
    const bloco = blocos[i];
    
    let questaoTexto = '';
    if (i === 0) {
      const posGab = texto.indexOf('Gabarito:');
      questaoTexto = texto.substring(0, posGab);
    } else {
      const blocoAnt = blocos[i-1];
      const posComentAnt = texto.indexOf(blocoAnt) + blocoAnt.lastIndexOf('Comentário:');
      const posGabAtual = texto.indexOf(bloco);
      questaoTexto = texto.substring(posComentAnt, posGabAtual);
      questaoTexto = questaoTexto.replace(/Comentário:[\s\S]*?(?=QUESTÃO|\n\n)/i, '').trim();
    }
    
    // GABARITO
    const gabMatch = bloco.match(/Gabarito:\s*([A-E])/i);
    const gabarito = gabMatch[1].toUpperCase();
    const correta = {'A':0,'B':1,'C':2,'D':3,'E':4}[gabarito] || 0;
    
    // COMENTÁRIO
    const comentMatch = bloco.match(/Comentário:\s*([\s\S]+?)$/i);
    const comentario = comentMatch ? comentMatch[1].trim() : '';
    
    // ALTERNATIVAS
    const altMatches = [...questaoTexto.matchAll(/([A-E])\)\s+([^\n]+(?:\n(?![A-E]\)|Gabarito)[^\n]+)*)/gi)];
    const altMap: any = {};
    altMatches.forEach(m => altMap[m[1].toUpperCase()] = m[2].trim().replace(/\s+/g, ' '));
    
    const alternativas: [string, string, string, string] = [
      altMap.A || '', altMap.B || '', altMap.C || '', altMap.D || ''
    ];
    
    // 🔥 PERGUNTA COMPLETA = TUDO ATÉ "A)" (inclui assertivas!)
    let perguntaCompleta = questaoTexto.split(/\nA\)/)[0].trim();
    perguntaCompleta = perguntaCompleta.replace(/^QUESTÃO\s+\d+\s*[–-]\s*/i, '');
    
    console.log(`Q${i+1}: ${perguntaCompleta.length} chars - ${perguntaCompleta.substring(0, 80)}...`);
    
    const altValidas = alternativas.filter(a => a.length > 3).length;
    if (altValidas >= 2 && perguntaCompleta.length > 10) {
      questoes.push({
        pergunta: perguntaCompleta,
        alternativas,
        correta: correta as 0|1|2|3,
        comentario,
        texto_contexto: undefined
      });
    }
  }
  
  console.log(`\n🎯 TOTAL: ${questoes.length} questões parseadas`);
  return questoes;
}
