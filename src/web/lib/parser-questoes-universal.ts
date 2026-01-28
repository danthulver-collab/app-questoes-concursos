/**
 * 🔥 PARSER UNIVERSAL DE QUESTÕES - VERSÃO ULTRA FLEXÍVEL
 * Aceita TODOS os formatos: Gabarito:, Correta:, Resposta:, Certa:
 * Separa por ---, ou numeração
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
  
  // Normalizar
  let texto = textoOriginal.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  console.log('🔍 Texto recebido:', texto.substring(0, 200));
  
  // 🔥 ESTRATÉGIA 1: Separar por "---"
  let blocos: string[] = [];
  
  if (texto.includes('---')) {
    blocos = texto.split(/\n\s*---\s*\n/).filter(b => b.trim().length > 30);
    console.log(`📊 Separação por "---": ${blocos.length} blocos`);
  }
  
  // 🔥 ESTRATÉGIA 2: Separar por "Gabarito:" ou "Correta:" com lookbehind
  if (blocos.length === 0) {
    // Aceita: Gabarito:, Correta:, Resposta:, Certa:, Gabarito Oficial:
    const regex = /([\s\S]+?(?:Gabarito|Correta|Resposta|Certa|Gabarito Oficial):\s*[A-E][\s\S]+?(?:Comentário|Comentario|Explicação|Explicacao|Justificativa)?:?[\s\S]*?)(?=\n\s*\d+[\.\)]|\n\s*---|\n\s*(?:Questão|Questao)\s+\d+|$)/gi;
    
    const matches = texto.matchAll(regex);
    for (const match of matches) {
      if (match[1].trim().length > 50) {
        blocos.push(match[1].trim());
      }
    }
    console.log(`📊 Separação por Gabarito/Correta: ${blocos.length} blocos`);
  }
  
  // 🔥 ESTRATÉGIA 3: Separar por numeração (1., 2., 3...)
  if (blocos.length === 0) {
    blocos = texto.split(/\n\s*\d+[\.\)]\s+/).filter(b => b.trim().length > 30);
    console.log(`📊 Separação por numeração: ${blocos.length} blocos`);
  }
  
  console.log(`\n🎯 Total de blocos para processar: ${blocos.length}\n`);
  
  // 🔥 PROCESSAR CADA BLOCO
  for (let i = 0; i < blocos.length; i++) {
    try {
      const bloco = blocos[i].trim();
      
      console.log(`\n--- Processando bloco ${i+1} ---`);
      console.log(bloco.substring(0, 150));
      
      // 1. EXTRAIR GABARITO (aceita vários formatos)
      const gabMatch = bloco.match(/(?:Gabarito|Correta|Resposta|Certa|Gabarito Oficial):\s*([A-E])/i);
      if (!gabMatch) {
        console.warn(`⚠️ Bloco ${i+1} sem Gabarito/Correta, pulando`);
        continue;
      }
      const gabarito = gabMatch[1].toUpperCase();
      const correta = {'A':0, 'B':1, 'C':2, 'D':3, 'E':4}[gabarito] || 0;
      
      console.log(`✓ Gabarito encontrado: ${gabarito}`);
      
      // 2. EXTRAIR COMENTÁRIO (opcional, aceita vários formatos)
      const comentMatch = bloco.match(/(?:Comentário|Comentario|Explicação|Explicacao|Justificativa):\s*([\s\S]+?)$/i);
      let comentario = comentMatch ? comentMatch[1].trim() : `Resposta correta: ${gabarito}`;
      
      // Limpar comentário de numeração da próxima questão
      comentario = comentario.split(/\n\s*\d+[\.\)]\s/)[0].trim();
      
      console.log(`✓ Comentário: ${comentario.substring(0, 50)}...`);
      
      // 3. PARTE ANTES DO GABARITO
      const antesGabarito = bloco.split(/(?:Gabarito|Correta|Resposta|Certa|Gabarito Oficial):/i)[0].trim();
      
      // 4. EXTRAIR ALTERNATIVAS
      const regexAlt = /([A-E])[\)\.]?\s+([^\n]+(?:\n(?![A-E][\)\.]|\s*(?:Gabarito|Correta))[^\n]+)*)/gi;
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
      
      console.log(`✓ Alternativas encontradas: ${Object.keys(altMap).length}`);
      
      // 5. EXTRAIR PERGUNTA
      let parteAntesAlt = antesGabarito.split(/\n\s*A[\)\.]?\s/i)[0].trim();
      parteAntesAlt = parteAntesAlt.replace(/^\s*\d+[\.\)]\s*/, '');
      
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
      
      console.log(`✓ Pergunta: ${pergunta.substring(0, 50)}...`);
      
      // 6. VALIDAR
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
      
      console.log(`✅ Q${questoes.length} adicionada!\n`);
      
    } catch (e) {
      console.error(`❌ Erro bloco ${i+1}:`, e);
    }
  }
  
  console.log(`\n🎯 TOTAL PARSEADO: ${questoes.length} questões válidas`);
  return questoes;
}
