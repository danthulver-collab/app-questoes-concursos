/**
 * PARSER UNIVERSAL DE QUESTÕES
 * Aceita TODOS os formatos possíveis
 */

export interface QuestaoParseada {
  pergunta: string;
  alternativas: [string, string, string, string];
  correta: 0 | 1 | 2 | 3;
  comentario: string;
  texto_contexto?: string;
}

export function parsearQuestoesUniversal(texto: string): QuestaoParseada[] {
  const questoes: QuestaoParseada[] = [];
  
  // Separar por "Gabarito: [LETRA]"
  const blocos = texto.split(/(?=Gabarito:\s*[A-E])/gi)
    .filter(b => b.trim().length > 50 && b.match(/Gabarito:\s*[A-E]/i));
  
  console.log(`📊 ${blocos.length} blocos detectados`);
  
  for (let idx = 0; idx < blocos.length; idx++) {
    try {
      const bloco = blocos[idx];
      
      // 1. GABARITO
      const gabMatch = bloco.match(/Gabarito:\s*([A-E])/i);
      const gabarito = gabMatch ? gabMatch[1].toUpperCase() : 'A';
      const correta = {'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4}[gabarito] as 0 | 1 | 2 | 3;
      
      // 2. COMENTÁRIO
      const comentMatch = bloco.match(/Comentário:\s*(.+?)$/is);
      const comentario = comentMatch ? comentMatch[1].trim() : `Gabarito: ${gabarito}`;
      
      // 3. PARTE ANTES DO GABARITO
      const antesGabarito = bloco.split(/Gabarito:/i)[0];
      
      // 4. EXTRAIR ALTERNATIVAS A), B), C), D), E)
      const regexAlt = /([A-E])[\)\.]?\s+(.+?)(?=\n\s*[A-E][\)\.]|$)/gis;
      const matches = [...antesGabarito.matchAll(regexAlt)];
      
      const altMap: Record<string, string> = {};
      matches.forEach(m => {
        const letra = m[1].toUpperCase();
        const texto = m[2].trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
        if (texto.length > 5) {
          altMap[letra] = texto;
        }
      });
      
      const alternativas = [
        altMap['A'] || '',
        altMap['B'] || '',
        altMap['C'] || '',
        altMap['D'] || ''
      ];
      
      // Se não achou 4 alternativas padrão, pode ser formato V/F
      if (Object.keys(altMap).length < 4) {
        console.log(`⚠️ Q${idx+1}: Apenas ${Object.keys(altMap).length} alternativas - pode ser V/F`);
      }
      
      // 5. EXTRAIR PERGUNTA (ÚLTIMA linha antes das alternativas)
      const linhas = antesGabarito.split('\n')
        .map(l => l.trim())
        .filter(l => l && 
                    !l.match(/^[A-E][\)\.]/) && 
                    !l.match(/^\d+\.?\s*$/) &&
                    !l.match(/^\(\s*\)/)); // Remove linhas ( )
      
      let pergunta = '';
      let contexto = '';
      
      if (linhas.length > 0) {
        // Procura linha que termina com ? ou : ou EXCETO:
        let indicePergunta = -1;
        for (let i = linhas.length - 1; i >= 0; i--) {
          if (linhas[i].match(/[?:]$|EXCETO:|correta é:|corretas são:/i)) {
            indicePergunta = i;
            break;
          }
        }
        
        if (indicePergunta >= 0) {
          pergunta = linhas[indicePergunta];
          contexto = linhas.slice(0, indicePergunta).join('\n');
        } else {
          // Última linha = pergunta
          pergunta = linhas[linhas.length - 1];
          contexto = linhas.slice(0, -1).join('\n');
        }
        
        // Remove número inicial
        pergunta = pergunta.replace(/^\d+\.\s*/, '');
      }
      
      // Fallback
      if (!pergunta || pergunta.length < 10) {
        pergunta = contexto.split('\n')[0] || `Questão ${idx + 1}`;
        contexto = contexto.split('\n').slice(1).join('\n');
      }
      
      // Validar
      if (alternativas.filter(a => a.length > 3).length >= 2) {
        questoes.push({
          pergunta,
          alternativas: alternativas as [string, string, string, string],
          correta,
          comentario: comentario.substring(0, 5000),
          texto_contexto: contexto.trim() || undefined
        });
        
        console.log(`✅ Q${questoes.length}: "${pergunta.substring(0, 50)}..."`);
      }
    } catch (e) {
      console.error(`❌ Erro bloco ${idx}:`, e);
    }
  }
  
  console.log(`✅ TOTAL: ${questoes.length} questões parseadas`);
  return questoes;
}
