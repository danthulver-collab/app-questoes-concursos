/**
 * 🔥 PARSER DEFINITIVO - SEPARA BLOCOS CORRETAMENTE
 * Evita misturar comentário da questão anterior
 */

interface QuestaoImportada {
  pergunta: string;
  alternativas: [string, string, string, string];
  correta: 0 | 1 | 2 | 3;
  comentario: string;
}

export const parsearQuestoesDefinitivo = (textoOriginal: string): QuestaoImportada[] => {
  const questoes: QuestaoImportada[] = [];
  
  // Normalizar
  const texto = textoOriginal.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // 🔥 ESTRATÉGIA: Encontrar cada bloco completo (Questão → Gabarito → Comentário)
  // Usa lookahead para não perder conteúdo
  const padrao = /(\d+[\.\)]?\s+[\s\S]+?)Gabarito:\s*([A-E])\s*\n\s*Comentário:\s*([\s\S]+?)(?=\n\s*\d+[\.\)]|$)/gi;
  
  const matches = [...texto.matchAll(padrao)];
  
  console.log(`📊 ${matches.length} questões encontradas com padrão completo`);
  
  for (const match of matches) {
    const blocoQuestao = match[1];
    const gabarito = match[2].toUpperCase();
    const comentario = match[3].trim();
    
    // Extrair alternativas
    const altMatch = [...blocoQuestao.matchAll(/\n\s*([A-E])[\)\.]?\s+([^\n]+(?:\n(?!\s*[A-E][\)\.])[^\n]+)*)/gi)];
    const altMap: Record<string, string> = {};
    
    altMatch.forEach(m => {
      const letra = m[1].toUpperCase();
      const texto = m[2].trim().replace(/\s+/g, ' ');
      altMap[letra] = texto;
    });
    
    const alternativas: [string, string, string, string] = [
      altMap.A || '',
      altMap.B || '',
      altMap.C || '',
      altMap.D || ''
    ];
    
    // Pergunta = tudo antes da primeira alternativa
    let pergunta = blocoQuestao.split(/\n\s*A[\)\.]?\s/i)[0];
    pergunta = pergunta.replace(/^\s*\d+[\.\)]\s*/, '').trim();
    
    const correta = {'A':0,'B':1,'C':2,'D':3}[gabarito] || 0;
    
    if (alternativas.filter(a => a.length > 2).length >= 2 && pergunta.length > 5) {
      questoes.push({
        pergunta,
        alternativas,
        correta: correta as 0 | 1 | 2 | 3,
        comentario
      });
      
      console.log(`✅ Q${questoes.length}: ${pergunta.substring(0, 50)}... | Gab: ${gabarito}`);
    }
  }
  
  console.log(`✅ TOTAL: ${questoes.length} questões parseadas`);
  return questoes;
};
