/**
 * =============================================================
 * 🔥 COMPONENTE DE IMPORTAÇÃO - PADRÃO QCONCURSOS
 * =============================================================
 * 
 * Aceita TODOS os tipos de questão:
 * - Múltipla escolha (A, B, C, D)
 * - Certo/Errado (CESPE)
 * - Verdadeiro/Falso (assertivas)
 * - Julgamento de itens
 * 
 * Limites de campos configuráveis (padrão QConcursos)
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { saveQuestaoToSupabase } from '../lib/supabase-pacotes';
import { saveQuestaoSupabase } from '../lib/supabase-questoes';
import { 
  parsearQuestoesQConcursos, 
  validarQuestaoQConcursos,
  formatarQuestaoQConcursos,
  type QuestaoQConcursos,
  type TipoQuestao,
  type ConfigParser
} from '../lib/parser-questoes-qconcursos';

// ============================================================
// CONSTANTES
// ============================================================

const MATERIAS = [
  'Portugues', 'Matematica', 'Informatica', 
  'Raciocinio Logico', 'Direito Constitucional', 
  'Direito Administrativo', 'Direito Penal', 
  'Direito Civil', 'Direito Tributario',
  'Direito Processual Civil', 'Direito Processual Penal',
  'Direito do Trabalho', 'Direito Previdenciario',
  'Contabilidade', 'Administracao', 'Economia',
  'Atualidades', 'Etica', 'Legislacao Especifica'
];

const BANCAS = ['CESPE', 'CEBRASPE', 'FCC', 'FGV', 'VUNESP', 'IBFC', 'CESGRANRIO', 'QUADRIX', 'IDECAN', 'FUNDATEC'];
const CONCURSOS = ['TRF', 'TRT', 'TRE', 'TST', 'STJ', 'STF', 'BB', 'CAIXA', 'PF', 'PRF', 'TCU', 'INSS', 'CGU', 'RECEITA', 'BACEN', 'MPU', 'DPDF'];

const TIPOS_QUESTAO: { value: TipoQuestao; label: string }[] = [
  { value: 'multipla_escolha', label: '📝 Múltipla Escolha (A, B, C, D)' },
  { value: 'certo_errado', label: '✓✗ Certo ou Errado (CESPE)' },
  { value: 'verdadeiro_falso', label: '🔤 V/F com Assertivas (I, II, III)' },
  { value: 'assertivas', label: '📋 Assertivas Numeradas' },
  { value: 'julgamento_itens', label: '⚖️ Julgamento de Itens' }
];

// ============================================================
// INTERFACE DO COMPONENTE
// ============================================================

interface ImportarQuestoesMassaProps {
  onClose: () => void;
  materiasFiltradas?: string[];
  bancaPadrao?: string;
  concursoPadrao?: string;
  materiaSelecionada?: string;
  areaId?: string;
  materiaId?: string;
  pacoteId?: string;
  onQuestoesImportadas?: (questoesIds: string[]) => void;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function ImportarQuestoesQConcursos({ 
  onClose, 
  materiasFiltradas,
  bancaPadrao,
  concursoPadrao,
  materiaSelecionada,
  areaId,
  materiaId,
  pacoteId,
  onQuestoesImportadas
}: ImportarQuestoesMassaProps) {
  
  // ============================================================
  // ESTADOS
  // ============================================================
  
  // Metadados da questão
  const [materia, setMateria] = useState(materiaSelecionada || materiasFiltradas?.[0] || 'Portugues');
  const [banca, setBanca] = useState(bancaPadrao || 'CESPE');
  const [concurso, setConcurso] = useState(concursoPadrao || 'TRF');
  const [ano, setAno] = useState(2024);
  const [dificuldade, setDificuldade] = useState<'facil' | 'medio' | 'dificil'>('medio');
  const [plano, setPlano] = useState<'free' | 'plus'>('free');
  
  // Tipo de questão
  const [tipoQuestao, setTipoQuestao] = useState<TipoQuestao>('multipla_escolha');
  const [detectarTipoAuto, setDetectarTipoAuto] = useState(true);
  
  // Configuração do parser
  const [validarLimites, setValidarLimites] = useState(false);
  const [limiteEnunciado, setLimiteEnunciado] = useState(900);
  const [limiteComentario, setLimiteComentario] = useState(1200);
  
  // Texto e processamento
  const [textoQuestoes, setTextoQuestoes] = useState('');
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState('');
  const [sobrescrever, setSobrescrever] = useState(false);
  
  // Preview das questões parseadas
  const [questoesPreview, setQuestoesPreview] = useState<QuestaoQConcursos[]>([]);
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [errosValidacao, setErrosValidacao] = useState<string[]>([]);
  
  // ============================================================
  // FUNÇÕES
  // ============================================================
  
  /**
   * Parsear e validar questões (preview)
   */
  const handleParsear = () => {
    if (!textoQuestoes.trim()) {
      alert('Cole as questões primeiro!');
      return;
    }
    
    const config: ConfigParser = {
      limiteEnunciado,
      limiteComentario,
      validarLimites,
      detectarTipo: detectarTipoAuto
    };
    
    const questoesParseadas = parsearQuestoesQConcursos(textoQuestoes, config);
    
    if (questoesParseadas.length === 0) {
      alert('Nenhuma questão válida encontrada. Verifique o formato.');
      return;
    }
    
    // Validar cada questão
    const erros: string[] = [];
    questoesParseadas.forEach((q, idx) => {
      const validacao = validarQuestaoQConcursos(q);
      if (!validacao.valida) {
        erros.push(`Q${idx + 1}: ${validacao.erros.join(', ')}`);
      }
      if (validacao.avisos.length > 0) {
        erros.push(`Q${idx + 1} (avisos): ${validacao.avisos.join(', ')}`);
      }
    });
    
    setQuestoesPreview(questoesParseadas);
    setErrosValidacao(erros);
    setMostrarPreview(true);
    setResultado(`✅ ${questoesParseadas.length} questões identificadas. Revise antes de importar.`);
  };
  
  /**
   * Importar questões para o banco
   */
  const handleImportar = async () => {
    if (questoesPreview.length === 0) {
      alert('Faça o preview primeiro!');
      return;
    }
    
    setProcessando(true);
    setResultado('');
    
    try {
      // Sobrescrever se necessário
      if (sobrescrever) {
        setResultado(`🗑️ Removendo questões antigas de ${materia}...`);
        
        try {
          if (areaId) {
            const materiaIdFinal = materiaId || materia.toLowerCase().replace(/\s+/g, '-').replace(/[êãç]/g, m => ({ 'ê': 'e', 'ã': 'a', 'ç': 'c' }[m] || m));
            
            await supabase
              .from('questoes_areas')
              .delete()
              .eq('area_id', areaId)
              .eq('materia_id', materiaIdFinal);
          } else {
            await supabase
              .from('questoes')
              .delete()
              .eq('disciplina', materia);
          }
          
          setResultado(`🗑️ Questões antigas removidas. Inserindo novas...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (e) {
          console.error('Erro ao remover antigas:', e);
        }
      }
      
      let sucesso = 0;
      let erros = 0;
      const questoesIdsImportados: string[] = [];
      
      for (let i = 0; i < questoesPreview.length; i++) {
        const q = questoesPreview[i];
        
        try {
          if (areaId) {
            // Salvar em questoes_areas
            const materiaIdFinal = materiaId || materia.toLowerCase().replace(/\s+/g, '-').replace(/[êãç]/g, m => ({ 'ê': 'e', 'ã': 'a', 'ç': 'c' }[m] || m));
            
            const questaoArea = {
              id: `${areaId}_${materiaIdFinal}_${Date.now()}_${i}`,
              area_id: areaId,
              materia_id: materiaIdFinal,
              title: q.pergunta,
              options: q.alternativas,
              correct_answer: q.correta,
              explanation: q.comentario,
              plano: plano,
              texto_contexto: q.texto_contexto,
              tipo_questao: q.tipo_questao || tipoQuestao,
              assertivas: q.assertivas ? JSON.stringify(q.assertivas) : null,
              sequencia_vf: q.sequencia_vf,
              gabarito_texto: q.gabarito_texto
            };
            
            const result = await saveQuestaoSupabase(questaoArea);
            
            if (result) {
              sucesso++;
              questoesIdsImportados.push(questaoArea.id);
            } else {
              erros++;
            }
          } else {
            // Salvar em questoes (banco geral)
            const questaoId = `${materia.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}_${i}`;
            
            const questao = {
              id: questaoId,
              pergunta: q.pergunta,
              alternativas: q.alternativas,
              correta: q.correta,
              disciplina: materia,
              banca: banca,
              concurso: concurso,
              ano: ano,
              comentario: q.comentario,
              dificuldade: dificuldade,
              texto_contexto: q.texto_contexto,
              tipo_questao: q.tipo_questao || tipoQuestao,
              assertivas: q.assertivas ? JSON.stringify(q.assertivas) : null,
              sequencia_vf: q.sequencia_vf,
              gabarito_texto: q.gabarito_texto
            };
            
            const result = await saveQuestaoToSupabase(questao);
            
            if (result.success) {
              sucesso++;
              questoesIdsImportados.push(questaoId);
            } else {
              erros++;
            }
          }
        } catch (err) {
          console.error(`❌ Erro ao salvar questão ${i}:`, err);
          erros++;
        }
        
        setResultado(`Processando... ${sucesso + erros}/${questoesPreview.length}`);
      }
      
      setResultado(`✅ Importação concluída!\n\n${sucesso} questões inseridas\n${erros} erros`);
      
      if (sucesso > 0) {
        if (onQuestoesImportadas && questoesIdsImportados.length > 0) {
          onQuestoesImportadas(questoesIdsImportados);
        }
        
        alert(`✅ ${sucesso} questões de ${materia} importadas com sucesso!`);
        onClose();
      }
    } catch (e: any) {
      console.error('Erro ao importar:', e);
      setResultado(`❌ Erro: ${e.message}`);
    } finally {
      setProcessando(false);
    }
  };
  
  // ============================================================
  // RENDER
  // ============================================================
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161b22] rounded-2xl border border-white/10 max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-[#161b22] border-b border-white/10 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">📥 Importar Questões (Padrão QConcursos)</h2>
            <p className="text-gray-400 text-sm mt-1">
              Suporta: Múltipla Escolha, Certo/Errado, V/F, Assertivas
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* ============================================================ */}
          {/* CONFIGURAÇÕES BÁSICAS */}
          {/* ============================================================ */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-white font-semibold mb-4">⚙️ Metadados das Questões</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-gray-400 text-xs mb-2 block">Matéria</label>
                <select 
                  value={materia} 
                  onChange={(e) => setMateria(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                >
                  {(materiasFiltradas || MATERIAS).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-gray-400 text-xs mb-2 block">Banca</label>
                <select 
                  value={banca} 
                  onChange={(e) => setBanca(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                >
                  {BANCAS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-gray-400 text-xs mb-2 block">Concurso</label>
                <select 
                  value={concurso} 
                  onChange={(e) => setConcurso(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                >
                  {CONCURSOS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-gray-400 text-xs mb-2 block">Ano</label>
                <input 
                  type="number" 
                  value={ano} 
                  onChange={(e) => setAno(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                />
              </div>
              
              <div>
                <label className="text-gray-400 text-xs mb-2 block">Dificuldade</label>
                <select 
                  value={dificuldade} 
                  onChange={(e) => setDificuldade(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                >
                  <option value="facil">Fácil</option>
                  <option value="medio">Médio</option>
                  <option value="dificil">Difícil</option>
                </select>
              </div>
              
              <div>
                <label className="text-gray-400 text-xs mb-2 block">Plano</label>
                <select 
                  value={plano} 
                  onChange={(e) => setPlano(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                >
                  <option value="free">Gratuito</option>
                  <option value="plus">Plus</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* ============================================================ */}
          {/* TIPO DE QUESTÃO */}
          {/* ============================================================ */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-white font-semibold mb-4">🎯 Tipo de Questão</h3>
            
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={detectarTipoAuto}
                  onChange={(e) => setDetectarTipoAuto(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                Detectar tipo automaticamente
              </label>
            </div>
            
            {!detectarTipoAuto && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {TIPOS_QUESTAO.map(tipo => (
                  <button
                    key={tipo.value}
                    onClick={() => setTipoQuestao(tipo.value)}
                    className={`p-3 rounded-lg text-left text-sm transition-all ${
                      tipoQuestao === tipo.value
                        ? 'bg-purple-500/30 border-purple-500 text-white'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    } border`}
                  >
                    {tipo.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* ============================================================ */}
          {/* CONFIGURAÇÕES AVANÇADAS */}
          {/* ============================================================ */}
          <details className="bg-white/5 rounded-xl border border-white/10">
            <summary className="p-4 cursor-pointer text-white font-semibold">
              ⚡ Configurações Avançadas (Limites QConcursos)
            </summary>
            
            <div className="p-4 pt-0 space-y-4 border-t border-white/10">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={validarLimites}
                  onChange={(e) => setValidarLimites(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                Truncar campos que excedem limites
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-xs mb-2 block">
                    Limite Enunciado ({limiteEnunciado} chars)
                  </label>
                  <input 
                    type="range" 
                    min="100" 
                    max="2000" 
                    value={limiteEnunciado}
                    onChange={(e) => setLimiteEnunciado(Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Padrão QConcursos: ~900 chars</p>
                </div>
                
                <div>
                  <label className="text-gray-400 text-xs mb-2 block">
                    Limite Comentário ({limiteComentario} chars)
                  </label>
                  <input 
                    type="range" 
                    min="100" 
                    max="3000" 
                    value={limiteComentario}
                    onChange={(e) => setLimiteComentario(Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Padrão QConcursos: ~1200 chars</p>
                </div>
              </div>
            </div>
          </details>
          
          {/* ============================================================ */}
          {/* ÁREA DE TEXTO */}
          {/* ============================================================ */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-gray-400 text-sm">📝 Cole as questões aqui</label>
              <span className="text-xs text-gray-500">
                {textoQuestoes.length.toLocaleString()} caracteres
              </span>
            </div>
            
            <textarea
              value={textoQuestoes}
              onChange={(e) => setTextoQuestoes(e.target.value)}
              placeholder={`Cole suas questões aqui no formato:

1. Enunciado da questão aqui...

A) Alternativa A
B) Alternativa B
C) Alternativa C
D) Alternativa D

Gabarito: A

Comentário: Explicação da resposta correta...

---

Para questões CERTO/ERRADO (CESPE):

Julgue o item a seguir.

O princípio da legalidade estabelece que...

Gabarito: CERTO

Comentário: A assertiva está correta porque...`}
              className="w-full h-64 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm resize-y"
              style={{ minHeight: '200px' }}
            />
          </div>
          
          {/* ============================================================ */}
          {/* OPÇÕES */}
          {/* ============================================================ */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={sobrescrever}
                onChange={(e) => setSobrescrever(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              🗑️ Sobrescrever questões existentes da matéria
            </label>
          </div>
          
          {/* ============================================================ */}
          {/* RESULTADO/PREVIEW */}
          {/* ============================================================ */}
          {resultado && (
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
              <pre className="text-blue-300 text-sm whitespace-pre-wrap">{resultado}</pre>
            </div>
          )}
          
          {/* Erros de validação */}
          {errosValidacao.length > 0 && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
              <h4 className="text-yellow-400 font-semibold mb-2">⚠️ Avisos de Validação</h4>
              <ul className="text-yellow-300 text-sm space-y-1">
                {errosValidacao.slice(0, 10).map((erro, idx) => (
                  <li key={idx}>• {erro}</li>
                ))}
                {errosValidacao.length > 10 && (
                  <li className="text-yellow-400">... e mais {errosValidacao.length - 10} avisos</li>
                )}
              </ul>
            </div>
          )}
          
          {/* Preview das questões */}
          {mostrarPreview && questoesPreview.length > 0 && (
            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-semibold">👁️ Preview ({questoesPreview.length} questões)</h4>
                <button 
                  onClick={() => setMostrarPreview(false)}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Ocultar
                </button>
              </div>
              
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {questoesPreview.slice(0, 5).map((q, idx) => (
                  <div key={idx} className="bg-white/5 rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded text-xs">
                        Q{idx + 1}
                      </span>
                      <span className="bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded text-xs">
                        {q.tipo_questao || 'multipla_escolha'}
                      </span>
                      <span className="bg-green-500/30 text-green-300 px-2 py-0.5 rounded text-xs">
                        Gab: {q.gabarito_texto || ['A','B','C','D'][q.correta]}
                      </span>
                    </div>
                    <p className="text-gray-300 line-clamp-2">{q.pergunta}</p>
                    {q.alternativas[0] && (
                      <p className="text-gray-500 text-xs mt-1">
                        A) {q.alternativas[0].substring(0, 50)}...
                      </p>
                    )}
                  </div>
                ))}
                {questoesPreview.length > 5 && (
                  <p className="text-gray-500 text-center text-sm">
                    ... e mais {questoesPreview.length - 5} questões
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* ============================================================ */}
          {/* BOTÕES */}
          {/* ============================================================ */}
          <div className="flex gap-4">
            <button
              onClick={handleParsear}
              disabled={processando || !textoQuestoes.trim()}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
            >
              👁️ Preview & Validar
            </button>
            
            <button
              onClick={handleImportar}
              disabled={processando || questoesPreview.length === 0}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
            >
              {processando ? '⏳ Importando...' : `✅ Importar ${questoesPreview.length} Questões`}
            </button>
            
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-gray-300 font-semibold rounded-xl transition-colors"
            >
              Cancelar
            </button>
          </div>
          
          {/* ============================================================ */}
          {/* DICAS */}
          {/* ============================================================ */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <h4 className="text-purple-300 font-semibold mb-2">💡 Dicas de Formatação</h4>
            <ul className="text-purple-200/80 text-sm space-y-1">
              <li>• Separe cada questão com <code className="bg-black/30 px-1 rounded">Gabarito: LETRA</code></li>
              <li>• Para CESPE, use <code className="bg-black/30 px-1 rounded">Gabarito: CERTO</code> ou <code className="bg-black/30 px-1 rounded">Gabarito: ERRADO</code></li>
              <li>• O comentário é separado automaticamente após o gabarito</li>
              <li>• Alternativas V/F devem estar nas alternativas (ex: A) V-F-V-F)</li>
              <li>• <strong>Evite</strong> termos absolutos: "sempre", "nunca", "apenas", "somente"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportarQuestoesQConcursos;
