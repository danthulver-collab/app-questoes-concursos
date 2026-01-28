/**
 * Componente de Importação em Massa de Questões
 * Admin cola questões em formato texto e sistema insere automaticamente
 */

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { saveQuestaoToSupabase } from '../lib/supabase-pacotes';
import { saveQuestaoSupabase } from '../lib/supabase-questoes';

const MATERIAS = [
  'Portugues', 'Matematica', 'Informatica', 
  'Raciocinio Logico', 'Direito Constitucional', 
  'Direito Administrativo', 'Direito Penal', 
  'Direito Civil', 'Direito Tributario'
];

const BANCAS = ['CESPE', 'FCC', 'FGV', 'VUNESP', 'IBFC', 'CESGRANRIO'];
const CONCURSOS = ['TRF', 'TRT', 'BB', 'CAIXA', 'PF', 'PRF', 'TCU', 'INSS'];

interface QuestaoImportada {
  pergunta: string;
  alternativas: [string, string, string, string];
  correta: 0 | 1 | 2 | 3;
  comentario: string;
}

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

export function ImportarQuestoesMassa({ 
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
  const [materia, setMateria] = useState(materiaSelecionada || materiasFiltradas?.[0] || 'Portugues');
  const [banca, setBanca] = useState(bancaPadrao || 'CESPE');
  const [concurso, setConcurso] = useState(concursoPadrao || 'TRF');
  const [ano, setAno] = useState(2024);
  const [dificuldade, setDificuldade] = useState<'facil' | 'medio' | 'dificil'>('medio');
  const [plano, setPlano] = useState<'free' | 'plus'>('free');
  const [textoQuestoes, setTextoQuestoes] = useState('');
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState('');
  const [sobrescrever, setSobrescrever] = useState(false);

  const parsearQuestoes = (texto: string): QuestaoImportada[] => {
    const questoes: QuestaoImportada[] = [];
    
    const norm = texto.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const blocosBrutos = norm.split(/Gabarito:\s*([A-E])/i);
    
    console.log(`📊 ${blocosBrutos.length} blocos`);
    
    for (let i = 2; i < blocosBrutos.length; i += 2) {
      const gabarito = blocosBrutos[i-1].toUpperCase();
      const blocoDepois = blocosBrutos[i] || '';
      let blocoAntes = blocosBrutos[i-2] || '';
      
      // 🔥 Limpar "Comentário:" grudado da questão anterior
      blocoAntes = blocoAntes.replace(/^[\s\S]*?Comentário:[\s\S]*?\n\s*(\d+[\.\)])/i, '$1');
      
      const correta = {'A':0,'B':1,'C':2,'D':3,'E':4}[gabarito] || 0;
      
      // COMENTÁRIO
      const comMatch = blocoDepois.match(/Comentário:\s*(.+?)(?=\n\d+\.|$)/is);
      const comentario = comMatch ? comMatch[1].trim() : `Gabarito: ${gabarito}`;
      
      // 🔥 EXTRAIR ALTERNATIVAS (para saber onde termina a pergunta)
      const altMatch = [...blocoAntes.matchAll(/\n\s*([A-E])[\)\.]?\s+([^\n]+)/gi)];
      const altMap: any = {};
      altMatch.forEach(m => altMap[m[1].toUpperCase()] = m[2].trim());
      
      const alternativas = [altMap.A||'',altMap.B||'',altMap.C||'',altMap.D||''];
      
      // 🔥 PERGUNTA = TUDO antes da primeira alternativa "A)"
      // Não processa, não separa, só pega TUDO
      let perguntaCompleta = blocoAntes.split(/\nA[\)\.]?\s/i)[0];
      
      // Remove número da questão no início (1. ou 01.)
      perguntaCompleta = perguntaCompleta.replace(/^\s*\d+[\.\)]\s*/,'').trim();
      
      console.log(`✅ Q${questoes.length + 1} (${perguntaCompleta.length} chars): ${perguntaCompleta.substring(0,100)}...`);
      
      if (alternativas.filter(a=>a.length>2).length >= 2 && perguntaCompleta.length > 10) {
        questoes.push({
          pergunta: perguntaCompleta,
          alternativas: alternativas as any,
          correta: correta as any,
          comentario
        });
      }
    }
    
    console.log(`✅ TOTAL: ${questoes.length} questões parseadas`);
    return questoes;
  };

  const handleImportar = async () => {
    if (!textoQuestoes.trim()) {
      alert('Cole as questões primeiro!');
      return;
    }
    
    setProcessando(true);
    setResultado('');
    
    try {
      const questoesParseadas = parsearQuestoes(textoQuestoes);
      
      if (questoesParseadas.length === 0) {
        alert('Nenhuma questão válida encontrada. Verifique o formato.');
        setProcessando(false);
        return;
      }
      
      setResultado(`✅ ${questoesParseadas.length} questões identificadas. Inserindo no banco...`);
      
      if (sobrescrever) {
        setResultado(`🗑️ Removendo questões antigas de ${materia}...`);
        
        try {
          let deleted = 0;
          
          if (areaId) {
            // 🔥 Deletar TODAS as questões desta matéria nesta área (sem distinção de case)
            const { data: todasQuestoes } = await supabase
              .from('questoes_areas')
              .select('*')
              .eq('area_id', areaId);
            
            const idsParaDeletar: string[] = [];
            todasQuestoes?.forEach(q => {
              // Compara materia_id ignorando case, acentos e espaços
              const materiaDB = q.materia_id?.toLowerCase().replace(/[àáâãäå]/g,'a').replace(/[èéêë]/g,'e').replace(/[ç]/g,'c').replace(/\s+/g, '-');
              const materiaAtual = materia.toLowerCase().replace(/[àáâãäå]/g,'a').replace(/[èéêë]/g,'e').replace(/[ç]/g,'c').replace(/\s+/g, '-');
              
              if (materiaDB === materiaAtual) {
                idsParaDeletar.push(q.id);
              }
            });
            
            console.log(`🗑️ IDs para deletar: ${idsParaDeletar.length}`);
            
            if (idsParaDeletar.length > 0) {
              const { data, error } = await supabase
                .from('questoes_areas')
                .delete()
                .in('id', idsParaDeletar)
                .select();
              
              deleted = data?.length || 0;
              console.log(`✅ ${deleted} questões deletadas de questoes_areas`);
            }
          } else {
            const { data, error } = await supabase
              .from('questoes')
              .delete()
              .eq('disciplina', materia)
              .select();
            
            if (error) {
              console.error('❌ Erro ao deletar:', error);
            } else {
              deleted = data?.length || 0;
            }
          }
          
          setResultado(`🗑️ ${deleted} questões antigas removidas. Inserindo novas...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (e) {
          console.error('Erro ao remover antigas:', e);
        }
      }
      
      let sucesso = 0;
      let erros = 0;
      const questoesIdsImportados: string[] = [];
      
      for (let i = 0; i < questoesParseadas.length; i++) {
        const q = questoesParseadas[i];
        
        try {
          if (areaId) {
            const materiaIdFinal = materiaId || materia.toLowerCase().replace(/\s+/g, '-').replace(/ê/g, 'e').replace(/ã/g, 'a').replace(/ç/g, 'c');
            
            const questaoArea = {
              id: `${areaId}_${materiaIdFinal}_${Date.now()}_${i}`,
              area_id: areaId,
              materia_id: materiaIdFinal,
              title: q.pergunta,
              options: q.alternativas,
              correct_answer: q.correta,
              explanation: q.comentario,
              plano: plano
            };
            
            const result = await saveQuestaoSupabase(questaoArea);
            
            if (result) {
              sucesso++;
            } else {
              erros++;
            }
          } else {
            const questaoId = `${materia.toLowerCase()}_${Date.now()}_${i}`;
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
              dificuldade: dificuldade
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
        
        setResultado(`Processando... ${sucesso + erros}/${questoesParseadas.length}`);
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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161b22] rounded-2xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#161b22] border-b border-white/10 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">📥 Importar Questões em Massa</h2>
            <p className="text-gray-400 text-sm mt-1">Cole suas questões e importe automaticamente</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Configurações */}
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
          
          {/* Área de Texto */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">📝 Cole as questões aqui</label>
            <textarea
              value={textoQuestoes}
              onChange={(e) => setTextoQuestoes(e.target.value)}
              placeholder={`Cole suas questões aqui no formato:

1. Pergunta da questão...

A) Alternativa A
B) Alternativa B
C) Alternativa C
D) Alternativa D

Gabarito: A

Comentário: Explicação...

---

2. Segunda questão...`}
              className="w-full h-64 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm resize-y"
            />
          </div>
          
          {/* Opções */}
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
          
          {/* Resultado */}
          {resultado && (
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
              <pre className="text-blue-300 text-sm whitespace-pre-wrap">{resultado}</pre>
            </div>
          )}
          
          {/* Botões */}
          <div className="flex gap-4">
            <button
              onClick={handleImportar}
              disabled={processando || !textoQuestoes.trim()}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
            >
              {processando ? '⏳ Importando...' : '✅ Importar Questões'}
            </button>
            
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-gray-300 font-semibold rounded-xl transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportarQuestoesMassa;
