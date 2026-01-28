/**
 * 🔥 PARSER DEFINITIVO - TESTADO COM SUAS 4 QUESTÕES
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
  
  // SEPARAR POR "Gabarito:" usando lookahead
  const blocos = texto.split(/(?=Gabarito:\s*[A-E])/i).filter(b => b.match(/Gabarito:\s*[A-E]/i));
  
  console.log(`📊 ${blocos.length} questões detectadas por Gabarito:`);
  
  for (let i = 0; i < blocos.length; i++) {
    const bloco = blocos[i];
    
    // Pegar conteúdo ANTERIOR a este Gabarito (é a questão)
    let questaoCompleta = '';
    if (i === 0) {
      // Primeira questão: pegar tudo antes do primeiro Gabarito
      const posGab = texto.indexOf('Gabarito:');
      questaoCompleta = texto.substring(0, posGab);
    } else {
      // Demais: pegar entre o Comentário anterior e este Gabarito
      const blocoAnterior = blocos[i-1];
      const posComentAnterior = texto.indexOf(blocoAnterior) + blocoAnterior.indexOf('Comentário:');
      const posGabAtual = texto.indexOf(bloco);
      questaoCompleta = texto.substring(posComentAnterior, posGabAtual);
      // Limpar o "Comentário: texto" do anterior
      questaoCompleta = questaoCompleta.replace(/Comentário:[\s\S]+?(?=QUESTÃO|$)/i, '').trim();
    }
    
    // GABARITO
    const gabMatch = bloco.match(/Gabarito:\s*([A-E])/i);
    const gabarito = gabMatch[1].toUpperCase();
    const correta = {'A':0,'B':1,'C':2,'D':3,'E':4}[gabarito] || 0;
    
    // COMENTÁRIO
    const comentMatch = bloco.match(/Comentário:\s*([\s\S]+?)$/i);
    const comentario = comentMatch ? comentMatch[1].trim() : '';
    
    // EXTRAIR ALTERNATIVAS
    const altMatches = [...questaoCompleta.matchAll(/([A-E])\)\s+([^\n]+(?:\n(?![A-E]\))[^\n]+)*)/gi)];
    const altMap: any = {};
    altMatches.forEach(m => altMap[m[1].toUpperCase()] = m[2].trim().replace(/\s+/g, ' '));
    
    const alternativas: [string, string, string, string] = [
      altMap.A || '', altMap.B || '', altMap.C || '', altMap.D || ''
    ];
    
    // EXTRAIR ASSERTIVAS (I. II. III. IV. V.)
    const assertivasMatch = questaoCompleta.match(/(I\.\s+.+?)(?=\n[A-E]\))/s);
    const assertivas = assertivasMatch ? assertivasMatch[1].trim() : '';
    
    // EXTRAIR PERGUNTA (tudo até as assertivas ou até as alternativas)
    let pergunta = questaoCompleta;
    pergunta = pergunta.replace(/^QUESTÃO\s+\d+\s*[–-]\s*/i, '');
    
    if (assertivas) {
      pergunta = pergunta.substring(0, pergunta.indexOf('I.')).trim();
    } else {
      pergunta = pergunta.split(/\n[A-E]\)/)[0].trim();
    }
    
    // Separar enunciado e comando
    const linhas = pergunta.split('\n').filter(l => l.trim().length > 5);
    let comando = '';
    let enunciado = '';
    
    for (let j = linhas.length - 1; j >= 0; j--) {
      if (linhas[j].match(/analise|assinale|considere|acerca/i)) {
        comando = linhas[j];
        enunciado = linhas.slice(0, j).join('\n');
        break;
      }
    }
    
    if (!comando) {
      comando = linhas[linhas.length - 1];
      enunciado = linhas.slice(0, -1).join('\n');
    }
    
    // MONTAR CONTEXTO
    let texto_contexto = '';
    if (enunciado) texto_contexto += enunciado;
    if (assertivas) texto_contexto += (texto_contexto ? '\n\n' : '') + assertivas;
    
    const altValidas = alternativas.filter(a => a.length > 3).length;
    if (altValidas >= 2) {
      questoes.push({
        pergunta: comando,
        alternativas,
        correta: correta as 0|1|2|3,
        comentario,
        texto_contexto: texto_contexto.trim() || undefined
      });
      console.log(`✅ Q${questoes.length}: ${comando.substring(0,50)} | Contexto: ${!!texto_contexto}`);
    }
  }
  
  console.log(`\n🎯 TOTAL: ${questoes.length} questões parseadas`);
  return questoes;
}
