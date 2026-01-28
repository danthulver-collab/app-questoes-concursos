/**
 * PARSER COM DELIMITADOR EXPLÍCITO
 * Usa ===== para separar questões de forma definitiva
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
  
  // ESTRATÉGIA 1: Se tem "=====" usar como delimitador
  let blocos: string[] = [];
  
  if (texto.includes('=====')) {
    blocos = texto.split(/={3,}[^\n]*={3,}/).filter(b => b.trim().length > 50);
    console.log(`📊 ${blocos.length} blocos separados por =====`);
  } else {
    // ESTRATÉGIA 2: Separar manualmente por "Comentário:" até próxima "QUESTÃO"
    const regex = /QUESTÃO\s+\d+[\s\S]+?Comentário:[\s\S]+?(?=\n\s*QUESTÃO\s+\d+|$)/gi;
    const matches = texto.matchAll(regex);
    
    for (const match of matches) {
      blocos.push(match[0]);
    }
    
    console.log(`📊 ${blocos.length} blocos extraídos por regex completo`);
  }
  
  // PROCESSAR CADA BLOCO ISOLADO
  for (let i = 0; i < blocos.length; i++) {
    const bloco = blocos[i].trim();
    
    if (bloco.length < 50) continue;
    
    console.log(`\n=== BLOCO ${i+1} ISOLADO ===`);
    console.log(`Início: ${bloco.substring(0, 80)}`);
    console.log(`Fim: ${bloco.substring(bloco.length - 80)}`);
    
    try {
      // GABARITO (dentro deste bloco fechado)
      const gabMatch = bloco.match(/Gabarito:\s*([A-E])/i);
      if (!gabMatch) {
        console.warn(`❌ Sem gabarito no bloco ${i+1}`);
        continue;
      }
      const gabarito = gabMatch[1].toUpperCase();
      const correta = {'A':0,'B':1,'C':2,'D':3,'E':4}[gabarito];
      
      // COMENTÁRIO (isolado: tudo após "Comentário:" neste bloco)
      const posComent = bloco.indexOf('Comentário:');
      let comentario = '';
      if (posComent >= 0) {
        comentario = bloco.substring(posComent + 11).trim();
        // Não precisa mais cortar - bloco já está isolado!
      }
      
      // PARTE ANTES DO GABARITO (questão + alternativas)
      const posGab = bloco.indexOf('Gabarito:');
      const parteQuestao = bloco.substring(0, posGab).trim();
      
      // ALTERNATIVAS
      const altMatches = [...parteQuestao.matchAll(/([A-E])\)\s+([\s\S]+?)(?=\n[A-E]\)|Gabarito:|$)/gi)];
      const altMap: any = {};
      
      altMatches.forEach(m => {
        const letra = m[1].toUpperCase();
        altMap[letra] = m[2].trim();
      });
      
      const alternativas: [string, string, string, string] = [
        altMap.A || '', altMap.B || '', altMap.C || '', altMap.D || ''
      ];
      
      // PERGUNTA (tudo até primeira alternativa)
      const posAltA = parteQuestao.search(/\n[A-E]\)\s/);
      let pergunta = posAltA > 0 ? parteQuestao.substring(0, posAltA) : parteQuestao;
      pergunta = pergunta.replace(/^QUESTÃO\s+\d+\s*[–-]\s*/i, '').trim();
      
      // VALIDAR
      const altValidas = alternativas.filter(a => a.length > 2).length;
      
      if (altValidas >= 2 && pergunta.length > 10) {
        questoes.push({
          pergunta,
          alternativas,
          correta: correta as 0|1|2|3,
          comentario,
          texto_contexto: undefined
        });
        
        console.log(`✅ Q${questoes.length} processada - BLOCO ISOLADO`);
      }
      
    } catch (e) {
      console.error(`❌ Erro no bloco ${i+1}:`, e);
    }
  }
  
  console.log(`\n🎯 TOTAL: ${questoes.length} questões isoladas`);
  return questoes;
}
