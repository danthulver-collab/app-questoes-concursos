/**
 * =============================================================
 * 🔥 PARSER PADRÃO QCONCURSOS - UNIVERSAL
 * =============================================================
 * 
 * Gera questões no padrão técnico do QConcursos:
 * - Enunciado: até ~900 caracteres, objetivo e impessoal
 * - Alternativas: 4 opções (A-D), extensão similar, linguagem técnica
 * - Gabarito: apenas letra correta
 * - Comentário: até ~1200 caracteres, separado, técnico
 * 
 * TIPOS SUPORTADOS:
 * 1. multipla_escolha - A, B, C, D
 * 2. certo_errado - CERTO ou ERRADO
 * 3. verdadeiro_falso - I, II, III com V/F nas alternativas
 * 4. assertivas - Afirmativas numeradas
 * 5. julgamento_itens - Julgar cada item
 */

// Tipos de questão suportados
export type TipoQuestao = 
  | 'multipla_escolha' 
  | 'certo_errado' 
  | 'verdadeiro_falso' 
  | 'assertivas' 
  | 'julgamento_itens';

// Interface da questão parseada (padrão QConcursos)
export interface QuestaoQConcursos {
  // === CAMPOS OBRIGATÓRIOS ===
  pergunta: string;                              // Enunciado (recomendado até 900 chars)
  alternativas: [string, string, string, string]; // 4 alternativas A-D
  correta: 0 | 1 | 2 | 3;                        // Índice da correta (0=A, 1=B, 2=C, 3=D)
  comentario: string;                            // Comentário separado (recomendado até 1200 chars)
  
  // === CAMPOS OPCIONAIS ===
  texto_contexto?: string;                       // Contexto/texto base (sem limite)
  tipo_questao?: TipoQuestao;                    // Tipo da questão
  assertivas?: string[];                         // Assertivas I, II, III...
  sequencia_vf?: string;                         // Sequência V-F-V-F
  gabarito_texto?: string;                       // Gabarito textual (letra ou CERTO/ERRADO)
}

// Configurações do parser
export interface ConfigParser {
  limiteEnunciado?: number;      // Limite de chars do enunciado (padrão: 900)
  limiteComentario?: number;     // Limite de chars do comentário (padrão: 1200)
  limiteAlternativa?: number;    // Limite de chars por alternativa (padrão: 500)
  validarLimites?: boolean;      // Se true, trunca campos que excedem
  detectarTipo?: boolean;        // Detecta tipo automaticamente
}

const CONFIG_PADRAO: ConfigParser = {
  limiteEnunciado: 900,
  limiteComentario: 1200,
  limiteAlternativa: 500,
  validarLimites: false,         // Não trunca por padrão
  detectarTipo: true
};

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

/**
 * Normaliza texto removendo espaços extras e quebras desnecessárias
 */
function normalizarTexto(texto: string): string {
  return texto
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/ {2,}/g, ' ')
    .trim();
}

/**
 * Limpa número de questão do início (ex: "1.", "01)", "Q1.")
 */
function limparNumeroQuestao(texto: string): string {
  return texto.replace(/^(\d+[\.\)\:]|\s*Q\d+[\.\)\:])\s*/i, '').trim();
}

/**
 * Detecta o tipo de questão baseado no conteúdo
 */
function detectarTipoQuestao(texto: string): TipoQuestao {
  const lower = texto.toLowerCase();
  
  // CERTO/ERRADO (CESPE/CEBRASPE)
  if (lower.includes('julgue o') || lower.includes('julgue os') || 
      lower.includes('certo ou errado') || lower.match(/gabarito:\s*(certo|errado)/i)) {
    return 'certo_errado';
  }
  
  // V/F com assertivas numeradas
  if (lower.match(/\(\s*\)\s*(v|f)/i) || lower.match(/[ivx]+[\.\)]\s/i)) {
    if (lower.includes('verdadeir') && lower.includes('fals')) {
      return 'verdadeiro_falso';
    }
    return 'assertivas';
  }
  
  // Julgamento de itens
  if (lower.includes('julgue os itens') || lower.includes('julgue cada item')) {
    return 'julgamento_itens';
  }
  
  // Padrão: múltipla escolha
  return 'multipla_escolha';
}

/**
 * Extrai gabarito do texto
 */
function extrairGabarito(texto: string): { letra: string; indice: 0|1|2|3; texto: string } {
  // Gabarito: A, B, C, D, E
  const matchLetra = texto.match(/gabarito:\s*([A-E])/i);
  if (matchLetra) {
    const letra = matchLetra[1].toUpperCase();
    const mapa: Record<string, 0|1|2|3> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
    return { 
      letra, 
      indice: mapa[letra] ?? 0, 
      texto: letra 
    };
  }
  
  // Gabarito: CERTO ou ERRADO
  const matchCE = texto.match(/gabarito:\s*(certo|errado)/i);
  if (matchCE) {
    const valor = matchCE[1].toUpperCase();
    return { 
      letra: valor === 'CERTO' ? 'A' : 'B', 
      indice: valor === 'CERTO' ? 0 : 1, 
      texto: valor 
    };
  }
  
  return { letra: 'A', indice: 0, texto: 'A' };
}

/**
 * Extrai comentário do texto
 */
function extrairComentario(texto: string, limite?: number): string {
  const match = texto.match(/coment[áa]rio:\s*(.+?)$/is);
  let comentario = match ? match[1].trim() : '';
  
  // Remove alternativas/letras que podem ter vazado
  comentario = comentario.replace(/^[A-E][\)\.]?\s*/gm, '');
  
  if (limite && comentario.length > limite) {
    comentario = comentario.substring(0, limite - 3) + '...';
  }
  
  return comentario;
}

/**
 * Extrai alternativas A, B, C, D
 */
function extrairAlternativas(texto: string, limite?: number): [string, string, string, string] {
  const resultado: [string, string, string, string] = ['', '', '', ''];
  
  // Regex para capturar alternativas
  // Aceita: A) texto, a. texto, (A) texto
  const regex = /(?:^|\n)\s*[\(\[]?([A-Da-d])[\)\]\.\:]?\s+([^\n]+(?:\n(?![\(\[]?[A-Ea-e][\)\]\.\:])[^\n]+)*)/g;
  
  const matches = [...texto.matchAll(regex)];
  
  for (const match of matches) {
    const letra = match[1].toUpperCase();
    let conteudo = match[2].trim().replace(/\s+/g, ' ');
    
    // Limitar tamanho se configurado
    if (limite && conteudo.length > limite) {
      conteudo = conteudo.substring(0, limite - 3) + '...';
    }
    
    const indice = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 }[letra];
    if (indice !== undefined) {
      resultado[indice] = conteudo;
    }
  }
  
  return resultado;
}

/**
 * Extrai assertivas numeradas (I, II, III, IV, V)
 */
function extrairAssertivas(texto: string): string[] {
  const assertivas: string[] = [];
  
  // Regex para capturar I., II., III., IV., V. ou (I), (II), etc
  const regex = /(?:^|\n)\s*[\(\[]?([IVX]+)[\)\]\.\:]?\s+([^\n]+(?:\n(?![\(\[]?[IVX]+[\)\]\.\:])[^\n]+)*)/gi;
  
  const matches = [...texto.matchAll(regex)];
  
  for (const match of matches) {
    const conteudo = match[2].trim().replace(/\s+/g, ' ');
    if (conteudo.length > 10) {
      assertivas.push(conteudo);
    }
  }
  
  return assertivas;
}

/**
 * Extrai sequência V/F das alternativas
 */
function extrairSequenciaVF(alternativas: string[]): string | undefined {
  // Verifica se alternativas contêm sequência tipo "V-F-V-F"
  for (const alt of alternativas) {
    const match = alt.match(/^[VF][\s\-–,]+[VF][\s\-–,]+[VF]/i);
    if (match) {
      return alt.replace(/[\s\-–,]+/g, '-').toUpperCase();
    }
  }
  return undefined;
}

// ============================================================
// PARSER PRINCIPAL
// ============================================================

/**
 * 🔥 PARSER UNIVERSAL - PADRÃO QCONCURSOS
 * 
 * Aceita texto bruto e retorna array de questões parseadas
 */
export function parsearQuestoesQConcursos(
  textoOriginal: string, 
  config: ConfigParser = {}
): QuestaoQConcursos[] {
  
  const cfg = { ...CONFIG_PADRAO, ...config };
  const questoes: QuestaoQConcursos[] = [];
  
  // Normalizar texto
  const texto = normalizarTexto(textoOriginal);
  
  // ============================================================
  // ESTRATÉGIA 1: Separar por "Gabarito:"
  // ============================================================
  const blocosPorGabarito = texto.split(/(?=gabarito:\s*[A-E]|gabarito:\s*(?:certo|errado))/gi)
    .filter(b => b.trim().length > 50);
  
  console.log(`📊 ${blocosPorGabarito.length} blocos detectados por Gabarito`);
  
  for (let idx = 0; idx < blocosPorGabarito.length; idx++) {
    try {
      const bloco = blocosPorGabarito[idx];
      
      // Detectar tipo
      const tipo = cfg.detectarTipo ? detectarTipoQuestao(bloco) : 'multipla_escolha';
      
      // Extrair gabarito
      const gabarito = extrairGabarito(bloco);
      
      // Extrair comentário
      const comentario = extrairComentario(bloco, cfg.limiteComentario);
      
      // Parte antes do gabarito
      const parteAntes = bloco.split(/gabarito:/i)[0];
      
      // Extrair alternativas
      const alternativas = extrairAlternativas(parteAntes, cfg.limiteAlternativa);
      
      // Extrair assertivas (se houver)
      const assertivas = extrairAssertivas(parteAntes);
      
      // Extrair sequência V/F
      const sequenciaVF = extrairSequenciaVF(alternativas);
      
      // ============================================================
      // EXTRAIR PERGUNTA E CONTEXTO
      // ============================================================
      
      // Remover alternativas do texto para encontrar pergunta
      let textoSemAlternativas = parteAntes
        .replace(/(?:^|\n)\s*[\(\[]?[A-Da-d][\)\]\.\:]?\s+[^\n]+(?:\n(?![\(\[]?[A-Ea-e][\)\]\.\:])[^\n]+)*/g, '\n')
        .trim();
      
      // Separar linhas
      const linhas = textoSemAlternativas.split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 5);
      
      // Procurar linha que parece pergunta
      let indicePergunta = -1;
      for (let i = linhas.length - 1; i >= 0; i--) {
        const linha = linhas[i];
        if (linha.match(/[?:]$/) || 
            linha.match(/exceto/i) ||
            linha.match(/correto|correta|incorreto|incorreta/i) ||
            linha.match(/assinale|marque|indique/i)) {
          indicePergunta = i;
          break;
        }
      }
      
      let pergunta = '';
      let contexto = '';
      
      if (indicePergunta >= 0) {
        pergunta = limparNumeroQuestao(linhas[indicePergunta]);
        if (indicePergunta > 0) {
          contexto = linhas.slice(0, indicePergunta).join('\n');
        }
      } else if (linhas.length > 0) {
        // Última linha = pergunta
        pergunta = limparNumeroQuestao(linhas[linhas.length - 1]);
        if (linhas.length > 1) {
          contexto = linhas.slice(0, -1).join('\n');
        }
      }
      
      // Fallback
      if (!pergunta || pergunta.length < 10) {
        pergunta = contexto.split('\n')[0] || `Questão ${idx + 1}`;
        contexto = contexto.split('\n').slice(1).join('\n');
      }
      
      // Aplicar limite de enunciado se configurado
      if (cfg.validarLimites && cfg.limiteEnunciado && pergunta.length > cfg.limiteEnunciado) {
        pergunta = pergunta.substring(0, cfg.limiteEnunciado - 3) + '...';
      }
      
      // ============================================================
      // VALIDAR E ADICIONAR QUESTÃO
      // ============================================================
      
      const alternativasValidas = alternativas.filter(a => a.length > 3).length;
      
      // Questão CERTO/ERRADO não precisa de 4 alternativas
      if (tipo === 'certo_errado') {
        questoes.push({
          pergunta,
          alternativas: ['CERTO', 'ERRADO', '', ''],
          correta: gabarito.texto === 'CERTO' ? 0 : 1,
          comentario: comentario || `Gabarito: ${gabarito.texto}`,
          texto_contexto: contexto.trim() || undefined,
          tipo_questao: tipo,
          gabarito_texto: gabarito.texto
        });
        console.log(`✅ Q${questoes.length} [CERTO/ERRADO]: "${pergunta.substring(0, 40)}..."`);
        
      } else if (alternativasValidas >= 2) {
        questoes.push({
          pergunta,
          alternativas,
          correta: gabarito.indice,
          comentario: comentario || `Gabarito: ${gabarito.letra}`,
          texto_contexto: contexto.trim() || undefined,
          tipo_questao: tipo,
          assertivas: assertivas.length > 0 ? assertivas : undefined,
          sequencia_vf: sequenciaVF,
          gabarito_texto: gabarito.letra
        });
        console.log(`✅ Q${questoes.length} [${tipo.toUpperCase()}]: "${pergunta.substring(0, 40)}..."`);
      } else {
        console.log(`⚠️ Q${idx + 1} ignorada: apenas ${alternativasValidas} alternativas válidas`);
      }
      
    } catch (e) {
      console.error(`❌ Erro no bloco ${idx}:`, e);
    }
  }
  
  console.log(`✅ TOTAL: ${questoes.length} questões parseadas (padrão QConcursos)`);
  return questoes;
}

// ============================================================
// VALIDADOR DE QUESTÕES (PADRÃO QCONCURSOS)
// ============================================================

export interface ValidacaoQuestao {
  valida: boolean;
  erros: string[];
  avisos: string[];
}

/**
 * Valida se uma questão segue o padrão QConcursos
 */
export function validarQuestaoQConcursos(questao: QuestaoQConcursos): ValidacaoQuestao {
  const erros: string[] = [];
  const avisos: string[] = [];
  
  // ============================================================
  // VALIDAÇÃO DO ENUNCIADO
  // ============================================================
  if (!questao.pergunta || questao.pergunta.length < 10) {
    erros.push('Enunciado muito curto (mínimo 10 caracteres)');
  }
  
  if (questao.pergunta.length > 900) {
    avisos.push(`Enunciado com ${questao.pergunta.length} chars (recomendado: até 900)`);
  }
  
  // Verificar termos absolutos proibidos
  const termosProibidos = /\b(sempre|nunca|apenas|somente|exclusivamente|todo|nenhum)\b/gi;
  const matchProibidos = questao.pergunta.match(termosProibidos);
  if (matchProibidos) {
    avisos.push(`Enunciado contém termos absolutos: ${matchProibidos.join(', ')}`);
  }
  
  // ============================================================
  // VALIDAÇÃO DAS ALTERNATIVAS
  // ============================================================
  const altValidas = questao.alternativas.filter(a => a && a.length > 3);
  
  if (questao.tipo_questao !== 'certo_errado' && altValidas.length < 4) {
    erros.push(`Apenas ${altValidas.length} alternativas válidas (necessário: 4)`);
  }
  
  // Verificar extensão similar
  if (altValidas.length >= 2) {
    const tamanhos = altValidas.map(a => a.length);
    const media = tamanhos.reduce((a, b) => a + b, 0) / tamanhos.length;
    const variacao = Math.max(...tamanhos) - Math.min(...tamanhos);
    
    if (variacao > media * 0.5) {
      avisos.push('Alternativas com extensão muito diferente');
    }
  }
  
  // Verificar termos absolutos nas alternativas
  for (let i = 0; i < questao.alternativas.length; i++) {
    const alt = questao.alternativas[i];
    if (alt && alt.match(termosProibidos)) {
      avisos.push(`Alternativa ${String.fromCharCode(65 + i)} contém termos absolutos`);
    }
  }
  
  // ============================================================
  // VALIDAÇÃO DO COMENTÁRIO
  // ============================================================
  if (!questao.comentario || questao.comentario.length < 10) {
    avisos.push('Comentário muito curto ou ausente');
  }
  
  if (questao.comentario && questao.comentario.length > 1200) {
    avisos.push(`Comentário com ${questao.comentario.length} chars (recomendado: até 1200)`);
  }
  
  // Comentário não pode ter letras de alternativas
  if (questao.comentario && questao.comentario.match(/^[A-D][\)\.]?\s/m)) {
    erros.push('Comentário contém formato de alternativa (deve ser texto corrido)');
  }
  
  // ============================================================
  // VALIDAÇÃO DO GABARITO
  // ============================================================
  if (questao.correta < 0 || questao.correta > 3) {
    erros.push('Gabarito inválido (deve ser 0-3)');
  }
  
  // ============================================================
  // VALIDAÇÃO V/F COM ASSERTIVAS
  // ============================================================
  if (questao.tipo_questao === 'verdadeiro_falso') {
    // Verifica se não tem marcação ( ) V ou F no enunciado
    if (questao.pergunta.match(/\(\s*\)\s*[VF]/i)) {
      erros.push('Questão V/F não deve ter marcações no enunciado (usar apenas nas alternativas)');
    }
  }
  
  return {
    valida: erros.length === 0,
    erros,
    avisos
  };
}

// ============================================================
// FORMATADOR DE QUESTÕES (EXPORTAR PADRÃO QCONCURSOS)
// ============================================================

/**
 * Formata questão no padrão texto QConcursos
 */
export function formatarQuestaoQConcursos(questao: QuestaoQConcursos, numero?: number): string {
  const partes: string[] = [];
  
  // Número da questão
  if (numero) {
    partes.push(`${numero}.`);
  }
  
  // Contexto (se houver)
  if (questao.texto_contexto) {
    partes.push(questao.texto_contexto);
    partes.push('');
  }
  
  // Enunciado
  partes.push(questao.pergunta);
  partes.push('');
  
  // Alternativas
  const letras = ['A', 'B', 'C', 'D'];
  for (let i = 0; i < 4; i++) {
    if (questao.alternativas[i]) {
      partes.push(`${letras[i]}) ${questao.alternativas[i]}`);
    }
  }
  partes.push('');
  
  // Gabarito
  partes.push(`Gabarito: ${questao.gabarito_texto || letras[questao.correta]}`);
  partes.push('');
  
  // Comentário
  if (questao.comentario) {
    partes.push(`Comentário: ${questao.comentario}`);
  }
  
  return partes.join('\n');
}

// ============================================================
// EXPORT DEFAULT
// ============================================================

export default {
  parsearQuestoesQConcursos,
  validarQuestaoQConcursos,
  formatarQuestaoQConcursos,
  detectarTipoQuestao
};
