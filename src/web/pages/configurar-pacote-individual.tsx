import { useState } from 'react';
import { AppLayout } from '../components/app-layout';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth-context-supabase';

const BANCAS_PADRAO = ['CESPE/CEBRASPE', 'FCC', 'VUNESP', 'FGV', 'IBFC', 'CESGRANRIO'];
const MATERIAS_PADRAO = ['Português', 'Matemática', 'Direito Constitucional', 'Direito Administrativo', 'Informática'];

export default function ConfigurarPacoteIndividual() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
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
    if (bancasSelecionadas.length === 0 || materias.length === 0) {
      alert('Selecione pelo menos uma banca e uma matéria');
      return;
    }

    setEnviando(true);

    try {
      const { data, error } = await supabase.from('plan_requests').insert({
        user_id: user?.id,
        concurso: 'Plano Individual',
        banca: bancasSelecionadas.join(', '),
        materias: materias,
        observacoes: `Quantidade: ${qtdQuestoes} questões`,
        status: 'aguardando_inicio'
      }).select().single();

      if (error) {
        console.error('Erro ao enviar pedido:', error);
        alert('Erro ao enviar pedido: ' + error.message);
        setEnviando(false);
        return;
      }

      // Redirecionar para acompanhamento
      setTimeout(() => {
        setLocation('/acompanhar-pedido');
      }, 500);
    } catch (e: any) {
      alert('Erro: ' + e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-white mb-2">📦 Configure seu Pacote</h1>
        <p className="text-gray-400 mb-8">Personalize seu concurso</p>

        <div className="space-y-6">
          {/* Bancas */}
          <div>
            <label className="block text-white font-semibold mb-3">Bancas *</label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {BANCAS_PADRAO.map(b => (
                <button
                  key={b}
                  onClick={() => toggleBanca(b)}
                  className={`p-3 rounded-xl ${bancasSelecionadas.includes(b) ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-300'}`}
                >
                  {bancasSelecionadas.includes(b) && '✓ '}{b}
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
                className="flex-1 p-3 bg-white/10 border border-white/20 rounded-xl text-white"
              />
              <button
                onClick={adicionarBancaCustom}
                className="px-6 py-3 bg-blue-600 rounded-xl text-white font-semibold"
              >
                + Adicionar
              </button>
            </div>
            {bancasSelecionadas.filter(b => !BANCAS_PADRAO.includes(b)).map(b => (
              <div key={b} className="mt-2 inline-block px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-sm mr-2">
                {b} <button onClick={() => toggleBanca(b)} className="ml-2">✕</button>
              </div>
            ))}
          </div>

          {/* Matérias */}
          <div>
            <label className="block text-white font-semibold mb-3">Matérias *</label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {MATERIAS_PADRAO.map(m => (
                <button
                  key={m}
                  onClick={() => toggleMateria(m)}
                  className={`p-3 rounded-xl ${materias.includes(m) ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-300'}`}
                >
                  {materias.includes(m) && '✓ '}{m}
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
                className="flex-1 p-3 bg-white/10 border border-white/20 rounded-xl text-white"
              />
              <button
                onClick={adicionarMateriaCustom}
                className="px-6 py-3 bg-blue-600 rounded-xl text-white font-semibold"
              >
                + Adicionar
              </button>
            </div>
            {materias.filter(m => !MATERIAS_PADRAO.includes(m)).map(m => (
              <div key={m} className="mt-2 inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm mr-2">
                {m} <button onClick={() => toggleMateria(m)} className="ml-2">✕</button>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Quantidade</label>
            <input
              type="number"
              value={qtdQuestoes}
              onChange={(e) => setQtdQuestoes(e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white"
              min="50"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Edital</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setEdital(e.target.files?.[0] || null)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={enviando}
              className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-bold text-white disabled:opacity-50"
            >
              {enviando ? 'Enviando...' : '📨 Enviar Pedido'}
            </button>
            <button
              onClick={() => setLocation('/planos')}
              className="px-6 py-4 bg-white/10 rounded-xl text-gray-300"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
