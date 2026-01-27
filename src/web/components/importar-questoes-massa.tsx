/**
 * Componente de Importação em Massa de Questões
 * Admin cola questões em formato texto e sistema insere automaticamente
 */

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { saveQuestaoToSupabase } from '../lib/supabase-pacotes';

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
}

export function ImportarQuestoesMassa({ 
  onClose, 
  materiasFiltradas,
  bancaPadrao,
  concursoPadrao,
  materiaSelecionada
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

  const parsearQuestoes = (texto: string): QuestaoImportada[] => {
    const questoes: QuestaoImportada[] = [];
    
    // Dividir por linhas vazias (cada questão separada por linha vazia dupla)
    const blocos = texto.split(/\n\s*\n/).filter(b => b.trim().length > 30);
    
    for (const bloco of blocos) {
      try {
        const linhas = bloco.split('\n').map(l => l.trim()).filter(l => l);
        
        let pergunta = '';
        let alternativas: string[] = [];
        let correta: 0 | 1 | 2 | 3 = 0;
        let comentario = '';
        let texto_contexto = '';
        
        let i = 0;
        
        // Pegar pergunta e texto contexto (tudo até achar A) ou Alternativas)
        while (i < linhas.length && !linhas[i].match(/^(A[\)\.]|Alternativas)/i)) {
          if (pergunta) {
            texto_contexto += (texto_contexto ? '\n' : '') + linhas[i];
          } else {
            pergunta += (pergunta ? ' ' : '') + linhas[i];
          }
          i++;
        }
        
        // Pular linha "Alternativas" se existir
        if (i < linhas.length && linhas[i].match(/^Alternativas/i)) {
          i++;
        }
        
        // Pegar alternativas A), B), C), D), E)
        while (i < linhas.length && linhas[i].match(/^[A-E][\)\.]/) && alternativas.length < 5) {
          const texto = linhas[i].replace(/^[A-E][\)\.]?\s*/, '').trim();
          alternativas.push(texto);
          i++;
        }
        
        // Se tem menos de 4, não é válida
        if (alternativas.length < 4) {
          console.log('⚠️ Questão ignorada (menos de 4 alternativas):', pergunta.substring(0, 50));
          continue;
        }
        
        // Pegar correta (procura linha com "Correta:" ou "Gabarito:")
        while (i < linhas.length) {
          const linha = linhas[i];
          if (linha.match(/Correta:|Gabarito:|Resposta:/i)) {
            const match = linha.match(/[A-E]/i);
            if (match) {
              const letra = match[0].toUpperCase();
              const mapa: Record<string, number> = {'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4};
              correta = (mapa[letra] || 0) as 0 | 1 | 2 | 3;
            }
            i++;
            break;
          }
          i++;
        }
        
        // Pegar comentário (resto)
        if (i < linhas.length) {
          comentario = linhas.slice(i).join(' ').replace(/Comentário:|Explicação:/i, '').trim();
        }
        
        if (!comentario) {
          comentario = 'Resposta correta: ' + ['A', 'B', 'C', 'D', 'E'][correta];
        }
        
        if (pergunta && alternativas.length >= 4) {
          // Garantir sempre 4 alternativas
          questoes.push({
            pergunta: pergunta.trim(),
            alternativas: [
              alternativas[0] || '',
              alternativas[1] || '',
              alternativas[2] || '',
              alternativas[3] || ''
            ] as [string, string, string, string],
            correta: Math.min(correta, 3) as 0 | 1 | 2 | 3,
            comentario: comentario || 'Sem comentário.',
            texto_contexto: texto_contexto.trim() || undefined
          });
        }
      } catch (e) {
        console.error('Erro ao parsear bloco:', e);
      }
    }
    
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
      
      let sucesso = 0;
      let erros = 0;
      
      for (let i = 0; i < questoesParseadas.length; i++) {
        const q = questoesParseadas[i];
        
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
