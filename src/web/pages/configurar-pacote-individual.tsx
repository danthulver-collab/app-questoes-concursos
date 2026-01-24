import { useState } from 'react';
import { AppLayout } from '../components/app-layout';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth-context-supabase';

const BANCAS = ['CESPE/CEBRASPE', 'FCC', 'VUNESP', 'FGV', 'IBFC', 'CESGRANRIO', 'Outra'];
const MATERIAS = ['Português', 'Matemática', 'Direito Constitucional', 'Direito Administrativo', 'Informática', 'Outra'];

export default function ConfigurarPacoteIndividual() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [banca, setBanca] = useState('');
  const [bancaCustom, setBancaCustom] = useState('');
  const [materias, setMaterias] = useState<string[]>([]);
  const [materiaCustom, setMateriaCustom] = useState('');
  const [qtdQuestoes, setQtdQuestoes] = useState('100');
  const [edital, setEdital] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);

  const toggleMateria = (m: string) => {
    setMaterias(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const handleSubmit = async () => {
    const bancaFinal = banca === 'Outra' ? bancaCustom : banca;
    const materiasFinal = materias.includes('Outra') 
      ? [...materias.filter(m => m !== 'Outra'), materiaCustom].filter(Boolean)
      : materias;

    if (!bancaFinal || materiasFinal.length === 0) {
      alert('Selecione banca e pelo menos uma matéria');
      return;
    }

    setEnviando(true);

    try {
      const { error } = await supabase.from('plan_requests').insert({
        user_id: user?.id,
        concurso: 'Plano Individual',
        banca: bancaFinal,
        materias: materiasFinal,
        observacoes: `Quantidade: ${qtdQuestoes} questões`,
        status: 'pendente'
      });

      if (error) {
        alert('Erro: ' + error.message);
        return;
      }

      alert('✅ Pedido enviado para o admin!');
      setLocation('/');
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
        <p className="text-gray-400 mb-8">Escolha banca, matérias e quantidade</p>

        <div className="space-y-6">
          <div>
            <label className="block text-white font-semibold mb-2">Banca *</label>
            <select
              value={banca}
              onChange={(e) => setBanca(e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white"
            >
              <option value="">Selecione...</option>
              {BANCAS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            {banca === 'Outra' && (
              <input
                type="text"
                placeholder="Digite o nome da banca"
                value={bancaCustom}
                onChange={(e) => setBancaCustom(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white mt-2"
              />
            )}
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Matérias *</label>
            <div className="grid grid-cols-2 gap-2">
              {MATERIAS.map(m => (
                <button
                  key={m}
                  onClick={() => toggleMateria(m)}
                  className={`p-3 rounded-xl ${
                    materias.includes(m) ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-300'
                  }`}
                >
                  {materias.includes(m) && '✓ '}{m}
                </button>
              ))}
            </div>
            {materias.includes('Outra') && (
              <input
                type="text"
                placeholder="Digite a matéria"
                value={materiaCustom}
                onChange={(e) => setMateriaCustom(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white mt-2"
              />
            )}
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Quantidade de Questões</label>
            <input
              type="number"
              value={qtdQuestoes}
              onChange={(e) => setQtdQuestoes(e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white"
              min="50"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Edital (opcional)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setEdital(e.target.files?.[0] || null)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white"
            />
            {edital && <p className="text-green-400 text-sm mt-2">✓ {edital.name}</p>}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={enviando}
              className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl font-bold text-white disabled:opacity-50"
            >
              {enviando ? 'Enviando...' : '📨 Enviar Pedido para Admin'}
            </button>
            <button
              onClick={() => setLocation('/planos')}
              className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-gray-300"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
