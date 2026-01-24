import { useState } from 'react';
import { AppLayout } from '../components/app-layout';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth-context-supabase';

const BANCAS_PADRAO = ['CESPE/CEBRASPE', 'FCC', 'VUNESP', 'FGV', 'IBFC', 'CESGRANRIO'];
const MATERIAS_PADRAO = ['Português', 'Matemática', 'Direito Constitucional', 'Direito Administrativo', 'Informática', 'Raciocínio Lógico'];

export default function ConfigurarPacoteIndividual() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [concurso, setConcurso] = useState('');
  const [cargo, setCargo] = useState('');
  const [bancasSelecionadas, setBancasSelecionadas] = useState<string[]>([]);
  const [bancaCustomInput, setBancaCustomInput] = useState('');
  const [materias, setMaterias] = useState<string[]>([]);
  const [materiaCustomInput, setMateriaCustomInput] = useState('');
  const [qtdQuestoes, setQtdQuestoes] = useState('100');
  const [edital, setEdital] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);

  const toggleBanca = (b: string) => {
    setBancasSelecionadas(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  };

  const adicionarBancaCustom = () => {
    if (bancaCustomInput.trim()) {
      setBancasSelecionadas(prev => [...prev, bancaCustomInput.trim()]);
      setBancaCustomInput('');
    }
  };

  const toggleMateria = (m: string) => {
    setMaterias(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const adicionarMateriaCustom = () => {
    if (materiaCustomInput.trim()) {
      setMaterias(prev => [...prev, materiaCustomInput.trim()]);
      setMateriaCustomInput('');
    }
  };

  const handleSubmit = async () => {
    if (!concurso.trim()) {
      alert('Informe o concurso desejado');
      return;
    }
    if (!cargo.trim()) {
      alert('Informe o cargo desejado');
      return;
    }
    if (bancasSelecionadas.length === 0) {
      alert('Selecione pelo menos uma banca');
      return;
    }
    if (materias.length === 0) {
      alert('Selecione pelo menos uma matéria');
      return;
    }

    setEnviando(true);

    try {
      // Campos que existem na tabela plan_requests
      const insertData: any = {
        user_id: user?.id,
        email: user?.email || '',
        nome: user?.nome || user?.email?.split('@')[0],
        concurso: concurso.trim(),
        banca: bancasSelecionadas.join(', '),
        materias: materias,
        plano: 'individual',
        num_questoes: parseInt(qtdQuestoes) || 100,
        status: 'aguardando_montagem',
        // Coloca cargo no campo extras ou message
        extras: `Cargo: ${cargo.trim()}`
      };

      const { data, error } = await supabase
        .from('plan_requests')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Erro ao enviar pedido:', error);
        alert('Erro ao enviar pedido: ' + error.message);
        setEnviando(false);
        return;
      }

      // Redirecionar para acompanhamento
      setLocation('/acompanhar-pedido');
    } catch (e: any) {
      alert('Erro: ' + e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">📦</span>
          <h1 className="text-3xl font-bold text-white">Configure seu Pacote</h1>
        </div>
        <p className="text-gray-400 mb-8">Personalize seu concurso</p>

        <div className="space-y-8">
          {/* Concurso e Cargo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-6">
              <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                <span className="text-xl">🎯</span> Concurso *
              </label>
              <input
                type="text"
                value={concurso}
                onChange={(e) => setConcurso(e.target.value)}
                placeholder="Ex: Polícia Federal, INSS, TRT..."
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            <div className="glass-card rounded-2xl p-6">
              <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                <span className="text-xl">💼</span> Cargo *
              </label>
              <input
                type="text"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Ex: Agente, Técnico, Analista..."
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {/* Bancas */}
          <div className="glass-card rounded-2xl p-6">
            <label className="block text-white font-semibold mb-4 flex items-center gap-2">
              <span className="text-xl">🏛️</span> Bancas *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {BANCAS_PADRAO.map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => toggleBanca(b)}
                  className={`p-4 rounded-xl font-medium transition-all duration-150 active:scale-95 ${
                    bancasSelecionadas.includes(b) 
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {bancasSelecionadas.includes(b) && <span className="mr-1">✓</span>}
                  {b}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Outra banca..."
                value={bancaCustomInput}
                onChange={(e) => setBancaCustomInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && adicionarBancaCustom()}
                className="flex-1 p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
              <button
                type="button"
                onClick={adicionarBancaCustom}
                className="px-6 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold transition-all active:scale-95"
              >
                + Adicionar
              </button>
            </div>
            {bancasSelecionadas.filter(b => !BANCAS_PADRAO.includes(b)).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {bancasSelecionadas.filter(b => !BANCAS_PADRAO.includes(b)).map(b => (
                  <span key={b} className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 text-orange-400 rounded-xl text-sm font-medium">
                    {b}
                    <button type="button" onClick={() => toggleBanca(b)} className="hover:text-orange-200">✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Matérias */}
          <div className="glass-card rounded-2xl p-6">
            <label className="block text-white font-semibold mb-4 flex items-center gap-2">
              <span className="text-xl">📚</span> Matérias *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {MATERIAS_PADRAO.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleMateria(m)}
                  className={`p-4 rounded-xl font-medium transition-all duration-150 active:scale-95 ${
                    materias.includes(m) 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {materias.includes(m) && <span className="mr-1">✓</span>}
                  {m}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Outra matéria..."
                value={materiaCustomInput}
                onChange={(e) => setMateriaCustomInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && adicionarMateriaCustom()}
                className="flex-1 p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <button
                type="button"
                onClick={adicionarMateriaCustom}
                className="px-6 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold transition-all active:scale-95"
              >
                + Adicionar
              </button>
            </div>
            {materias.filter(m => !MATERIAS_PADRAO.includes(m)).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {materias.filter(m => !MATERIAS_PADRAO.includes(m)).map(m => (
                  <span key={m} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium">
                    {m}
                    <button type="button" onClick={() => toggleMateria(m)} className="hover:text-emerald-200">✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quantidade e Edital */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-6">
              <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                <span className="text-xl">🔢</span> Quantidade de Questões
              </label>
              <input
                type="number"
                value={qtdQuestoes}
                onChange={(e) => setQtdQuestoes(e.target.value)}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                min="50"
                max="500"
              />
            </div>

            <div className="glass-card rounded-2xl p-6">
              <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                <span className="text-xl">📄</span> Edital (opcional)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setEdital(e.target.files?.[0] || null)}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-500 file:text-white file:font-semibold"
              />
            </div>
          </div>

          {/* Resumo */}
          {(concurso || cargo || bancasSelecionadas.length > 0 || materias.length > 0) && (
            <div className="glass-card rounded-2xl p-6 border-2 border-orange-500/30">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="text-xl">📋</span> Resumo do Pedido
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Concurso:</span>
                  <div className="text-orange-400 font-semibold">{concurso || '-'}</div>
                </div>
                <div>
                  <span className="text-gray-400">Cargo:</span>
                  <div className="text-blue-400 font-semibold">{cargo || '-'}</div>
                </div>
                <div>
                  <span className="text-gray-400">Bancas:</span>
                  <div className="text-orange-400 font-semibold">{bancasSelecionadas.length} selecionada(s)</div>
                </div>
                <div>
                  <span className="text-gray-400">Matérias:</span>
                  <div className="text-emerald-400 font-semibold">{materias.length} selecionada(s)</div>
                </div>
                <div>
                  <span className="text-gray-400">Questões:</span>
                  <div className="text-purple-400 font-semibold">{qtdQuestoes}</div>
                </div>
                <div>
                  <span className="text-gray-400">Edital:</span>
                  <div className="text-gray-300 truncate">{edital ? edital.name : 'Não anexado'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={enviando || !concurso || !cargo || bancasSelecionadas.length === 0 || materias.length === 0}
              className="flex-1 py-5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-bold text-white text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-orange-500/30 transition-all active:scale-[0.98]"
            >
              {enviando ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Enviando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>🚀</span> Enviar Pedido
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setLocation('/planos')}
              className="px-8 py-5 bg-white/10 hover:bg-white/20 rounded-xl text-gray-300 font-semibold transition-all active:scale-[0.98]"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
