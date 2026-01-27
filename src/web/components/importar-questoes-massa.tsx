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
  texto_contexto?: string;
}

interface ImportarQuestoesMassaProps {
  onClose: () => void;
  materiasFiltradas?: string[]; // 🔥 Se passar, mostra apenas essas matérias
  bancaPadrao?: string; // 🔥 Banca pré-selecionada
  concursoPadrao?: string; // 🔥 Concurso pré-selecionado
  materiaSelecionada?: string; // 🔥 Matéria já selecionada (pacotes exclusivos)
  areaId?: string; // 🔥 Se vier de Áreas, salva em questoes_areas
  materiaId?: string; // 🔥 ID da matéria para questoes_areas
}

export function ImportarQuestoesMassa({ 
  onClose, 
  materiasFiltradas,
  bancaPadrao,
  concursoPadrao,
  materiaSelecionada,
  areaId,
  materiaId
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
  const [sobrescrever, setSobrescrever] = useState(false); // 🔥 Opção sobrescrever

  const parsearQuestoes = (texto: string): QuestaoImportada[] => {
    const questoes: QuestaoImportada[] = [];
    
    // 🔥 PARSER UNIVERSAL: Separa por múltiplos indicadores
    const separadores = [
      /(?=Gabarito:)/gi,
      /(?=Comentário:)/gi,
      /(?=^Questão \d+)/gm,
      /(?=^Analise)/gm,
      /(?=^Assinale)/gm,
      /(?=^Marque)/gm
    ];
    
    let blocos: string[] = [texto];
    
    // Tenta cada separador até encontrar um que funcione
    for (const sep of separadores) {
      const tentativa = texto.split(sep).filter(b => b.trim().length > 50);
      if (tentativa.length > blocos.length) {
        blocos = tentativa;
        console.log(`✅ Separador encontrado! ${tentativa.length} blocos`);
        break;
      }
    }
    
    console.log(`📊 ${blocos.length} blocos detectados para processar`);
    
    for (let idx = 0; idx < blocos.length; idx++) {
      const bloco = blocos[idx];
      
      try {
        // Extrair com REGEX mais robusto
        let pergunta = '';
        let alternativas: string[] = [];
        let correta: 0 | 1 | 2 | 3 = 0;
        let comentario = '';
        let texto_contexto = '';
        
        // Pegar Gabarito/Correta
        const gabaritoMatch = bloco.match(/(Gabarito|Correta|Resposta):\s*([A-E])/i);
        if (gabaritoMatch) {
          const letra = gabaritoMatch[2].toUpperCase();
          const mapa: Record<string, number> = {'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4};
          correta = (mapa[letra] || 0) as 0 | 1 | 2 | 3;
        }
        
        // Separar em partes
        const partes = bloco.split(/(Gabarito:|Comentário:)/i);
        const antesGabarito = partes[0] || '';
        const depoisComentario = partes[partes.length - 1] || '';
        
        // Extrair comentário
        if (bloco.match(/Comentário:/i)) {
          comentario = depoisComentario.replace(/Comentário:/i, '').trim().substring(0, 500);
        }
        
        // Extrair alternativas usando regex
        const regexAlternativas = /([A-Ea-e])[\)\.]?\s+([^A-Ea-e\n]+?)(?=\s*[A-Ea-e][\)\.]|\s*(?:Gabarito|Correta|Comentário|Marque):|\s*$)/gs;
        const matchesAlt = [...antesGabarito.matchAll(regexAlternativas)];
        
        matchesAlt.forEach(match => {
          if (alternativas.length < 4) {
            alternativas.push(match[2].trim());
          }
        });
        
        // Extrair pergunta (primeira linha antes das alternativas)
        const linhas = antesGabarito.split('\n').map(l => l.trim()).filter(l => l);
        for (const linha of linhas) {
          if (!linha.match(/^[A-Ea-e][\)\.]/) && linha.length > 10) {
            if (!pergunta) {
              pergunta = linha;
            } else if (!linha.match(/^(I{1,3}V?|V?I{1,3})\./)) {
              texto_contexto += (texto_contexto ? '\n' : '') + linha;
            }
          }
        }
        
        // Validar e adicionar
        if (pergunta.length > 5 && alternativas.length >= 4) {
          questoes.push({
            pergunta: pergunta.trim(),
            alternativas: [
              alternativas[0] || '',
              alternativas[1] || '',
              alternativas[2] || '',
              alternativas[3] || ''
            ] as [string, string, string, string],
            correta: Math.min(correta, 3) as 0 | 1 | 2 | 3,
            comentario: comentario || 'Resposta: ' + ['A', 'B', 'C', 'D'][correta],
            texto_contexto: texto_contexto.trim().substring(0, 2000) || undefined
          });
          
          console.log(`✅ Q${questoes.length}: ${pergunta.substring(0, 40)}...`);
        }
      } catch (e) {
        console.error(`❌ Erro no bloco ${idx}:`, e);
      }
    }
    
    console.log(`✅ TOTAL PARSEADO: ${questoes.length} questões`);
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
      
      // 🔥 Se sobrescrever, deletar questões antigas da matéria primeiro
      if (sobrescrever) {
        setResultado(`🗑️ Removendo questões antigas de ${materia}...`);
        try {
          if (areaId) {
            // Remover de questoes_areas
            await supabase
              .from('questoes_areas')
              .delete()
              .eq('area_id', areaId)
              .eq('materia_id', materiaId || materia.toLowerCase().replace(/\s+/g, '-'));
          } else {
            // Remover de questoes
            await supabase
              .from('questoes')
              .delete()
              .eq('disciplina', materia);
          }
          console.log(`✅ Questões antigas de ${materia} removidas`);
        } catch (e) {
          console.error('Erro ao remover antigas:', e);
        }
      }
      
      let sucesso = 0;
      let erros = 0;
      
      for (let i = 0; i < questoesParseadas.length; i++) {
        const q = questoesParseadas[i];
        
        try {
          // 🔥 Salvar na tabela correta baseado no contexto
          if (areaId) {
            // Salvar em questoes_areas (para Áreas e Carreiras)
            const materiaIdFinal = materiaId || materia.toLowerCase().replace(/\s+/g, '-').replace(/ê/g, 'e').replace(/ã/g, 'a').replace(/ç/g, 'c');
            
            const questaoArea = {
              id: `${areaId}_${materiaIdFinal}_${Date.now()}_${i}`,
              area_id: areaId,
              materia_id: materiaIdFinal,
              title: q.pergunta,
              options: q.alternativas,
              correct_answer: q.correta,
              explanation: q.comentario,
              plano: plano,
              texto_contexto: q.texto_contexto
            };
            
            const result = await saveQuestaoSupabase(questaoArea);
            
            if (result) {
              sucesso++;
            } else {
              erros++;
            }
          } else {
            // Salvar em questoes (banco geral)
            const questao = {
              id: `${materia.toLowerCase()}_${Date.now()}_${i}`,
              pergunta: q.pergunta,
              alternativas: q.alternativas,
              correta: q.correta,
              disciplina: materia,
              banca: banca,
              concurso: concurso,
              ano: ano,
              comentario: q.comentario,
              dificuldade: dificuldade,
              texto_contexto: q.texto_contexto
            };
            
            const result = await saveQuestaoToSupabase(questao);
            
            if (result.success) {
              sucesso++;
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
        setTimeout(() => {
          alert(`✅ ${sucesso} questões de ${materia} importadas com sucesso!`);
          onClose();
          window.location.reload();
        }, 2000);
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
                disabled={!!materiaSelecionada}
              >
                {(materiasFiltradas || MATERIAS).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              {materiaSelecionada && (
                <p className="text-xs text-purple-400 mt-1">✓ Matéria do pacote</p>
              )}
            </div>
            
            <div>
              <label className="text-gray-400 text-xs mb-2 block">Banca</label>
              <select 
                value={banca} 
                onChange={(e) => setBanca(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                disabled={!!bancaPadrao}
              >
                {BANCAS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              {bancaPadrao && (
                <p className="text-xs text-purple-400 mt-1">✓ Banca do aluno</p>
              )}
            </div>
            
            <div>
              <label className="text-gray-400 text-xs mb-2 block">Concurso</label>
              <select 
                value={concurso} 
                onChange={(e) => setConcurso(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                disabled={!!concursoPadrao}
              >
                {CONCURSOS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {concursoPadrao && (
                <p className="text-xs text-purple-400 mt-1">✓ Concurso do aluno</p>
              )}
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
          </div>

          {/* Formato de exemplo */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-blue-400 font-bold mb-2">📋 Formato aceito:</p>
            <pre className="text-xs text-gray-300 whitespace-pre-wrap">
{`Formato 1 - Simples:
Qual a capital?
A) São Paulo
B) Brasília
C) Rio
D) Salvador
Correta: B

Formato 2 - Com afirmativas:
Analise as afirmativas:
I. Afirmativa 1
II. Afirmativa 2
Alternativas
A I e II
B I e III
C Apenas I
D Todas
Correta: A

Formato 3 - Com texto:
Leia o texto:
(texto longo...)
Pergunta aqui?
A) Alt A
B) Alt B
C) Alt C
D) Alt D
Correta: C`}
            </pre>
            <p className="text-xs text-gray-500 mt-2">
              💡 Separe cada questão com uma linha vazia. Use "Correta: A/B/C/D" para indicar a resposta.
            </p>
          </div>

          {/* 🔥 Opção Sobrescrever */}
          <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <input
              type="checkbox"
              id="sobrescrever"
              checked={sobrescrever}
              onChange={(e) => setSobrescrever(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-amber-500 bg-white/5 checked:bg-amber-500 cursor-pointer"
            />
            <label htmlFor="sobrescrever" className="text-white font-medium cursor-pointer flex-1">
              🗑️ Sobrescrever questões existentes de {materia}
            </label>
            <span className="text-xs text-gray-400">
              {sobrescrever ? 'Remove antigas e adiciona novas' : 'Adiciona às existentes'}
            </span>
          </div>

          {/* Caixa de texto */}
          <div>
            <label className="text-white font-bold mb-2 block">Cole suas questões aqui:</label>
            <textarea
              value={textoQuestoes}
              onChange={(e) => setTextoQuestoes(e.target.value)}
              rows={15}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none font-mono text-sm"
              placeholder="Cole suas questões no formato indicado acima..."
            />
            <p className="text-gray-500 text-xs mt-2">
              {(() => {
                try {
                  const parsed = parsearQuestoes(textoQuestoes);
                  return `${parsed.length} questões válidas detectadas`;
                } catch {
                  return '0 questões detectadas';
                }
              })()}
            </p>
          </div>

          {/* Resultado */}
          {resultado && (
            <div className={`p-4 rounded-xl ${
              resultado.includes('✅') ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
            }`}>
              <pre className="text-sm text-white whitespace-pre-wrap">{resultado}</pre>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3">
            <button
              onClick={handleImportar}
              disabled={processando || !textoQuestoes.trim()}
              className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 disabled:opacity-50 rounded-xl text-white font-bold text-lg"
            >
              {processando ? '⏳ Importando...' : (() => {
                try {
                  const count = parsearQuestoes(textoQuestoes).length;
                  return `📥 Importar ${count} ${count === 1 ? 'Questão' : 'Questões'}`;
                } catch {
                  return '📥 Importar Questões';
                }
              })()}
            </button>
            <button
              onClick={onClose}
              disabled={processando}
              className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
