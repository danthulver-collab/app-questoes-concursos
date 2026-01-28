/**
 * PARSER SEM LIMITAÇÕES - Preserva TUDO
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
      questaoTexto = texto.substring(0, texto.indexOf('Gabarito:'));
    } else {
      const blocoAnt = blocos[i-1];
      const inicioComentAnt = texto.indexOf(blocoAnt) + blocoAnt.indexOf('Comentário:');
      const fimComentAnt = texto.indexOf('\n\nQUESTÃO', inicioComentAnt);
      const inicioGabAtual = texto.indexOf(bloco);
      
      if (fimComentAnt > 0 && fimComentAnt < inicioGabAtual) {
        questaoTexto = texto.substring(fimComentAnt + 2, inicioGabAtual);
      } else {
        questaoTexto = texto.substring(inicioComentAnt + 100, inicioGabAtual);
      }
    }
    
    questaoTexto = questaoTexto.trim();
    
    // GABARITO
    const gabMatch = bloco.match(/Gabarito:\s*([A-E])/i);
    const gabarito = gabMatch[1].toUpperCase();
    const correta = {'A':0,'B':1,'C':2,'D':3,'E':4}[gabarito];
    
    // COMENTÁRIO (COMPLETO, sem limites)
    const comentMatch = bloco.match(/Comentário:\s*([\s\S]+?)$/i);
    const comentario = comentMatch ? comentMatch[1] : '';
    
    // ALTERNATIVAS (COMPLETAS, preserva quebras de linha)
    const altMatches = [...questaoTexto.matchAll(/([A-E])\)\s+([\s\S]+?)(?=\n[A-E]\)|$)/gi)];
    const altMap: any = {};
    
    altMatches.forEach(m => {
      const letra = m[1].toUpperCase();
      const textoAlt = m[2].trim(); // SEM replace - preserva tudo
      altMap[letra] = textoAlt;
    });
    
    const alternativas: [string, string, string, string] = [
      altMap.A || '', altMap.B || '', altMap.C || '', altMap.D || ''
    ];
    
    // PERGUNTA COMPLETA (até primeira alternativa, SEM cortes)
    const posAlternativaA = questaoTexto.search(/\n[A-E]\)\s/);
    let perguntaCompleta = posAlternativaA > 0 
      ? questaoTexto.substring(0, posAlternativaA)
      : questaoTexto;
    
    perguntaCompleta = perguntaCompleta.replace(/^QUESTÃO\s+\d+\s*[–-]\s*/i, '');
    
    console.log(`Q${i+1}: ${perguntaCompleta.length} chars capturados`);
    
    const altValidas = alternativas.filter(a => a.length > 2).length;
    if (altValidas >= 2) {
      questoes.push({
        pergunta: perguntaCompleta,
        alternativas,
        correta: correta as 0|1|2|3,
        comentario,
        texto_contexto: undefined
      });
    }
  }
  
  console.log(`🎯 TOTAL: ${questoes.length} questões completas`);
  return questoes;
}
