import { useState } from 'react';
import { AppLayout } from '../components/app-layout';
import { useLocation } from 'wouter';

const BANCAS = ['CESPE/CEBRASPE', 'FCC', 'VUNESP', 'FGV', 'IBFC', 'CESGRANRIO'];
const MATERIAS = ['Português', 'Matemática', 'Direito Constitucional', 'Direito Administrativo', 'Informática'];

export default function ConfigurarPacoteIndividual() {
  const [, setLocation] = useLocation();
  const [banca, setBanca] = useState('');
  const [materias, setMaterias] = useState<string[]>([]);
  const [qtdQuestoes, setQtdQuestoes] = useState('100');
  const [edital, setEdital] = useState<File | null>(null);

  const toggleMateria = (m: string) => {
    setMaterias(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const handleSubmit = () => {
    if (!banca || materias.length === 0) {
      alert('Selecione banca e pelo menos uma matéria');
      return;
    }

    // Salvar configuração no localStorage temporariamente
    const config = { banca, materias, qtdQuestoes, editalName: edital?.name };
    localStorage.setItem('pacote_config', JSON.stringify(config));
    
    // Redirecionar para pagamento
    setLocation('/checkout');
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-white mb-2">📦 Configure seu Pacote Individual</h1>
        <p className="text-gray-400 mb-8">Personalize as questões do seu concurso</p>

        <div className="space-y-6">
          {/* Banca */}
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
          </div>

          {/* Matérias */}
          <div>
            <label className="block text-white font-semibold mb-2">Matérias * (selecione)</label>
            <div className="grid grid-cols-2 gap-2">
              {MATERIAS.map(m => (
                <button
                  key={m}
                  onClick={() => toggleMateria(m)}
                  className={`p-3 rounded-xl transition-all ${
                    materias.includes(m) 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {materias.includes(m) && '✓ '}{m}
                </button>
              ))}
            </div>
          </div>

          {/* Quantidade */}
          <div>
            <label className="block text-white font-semibold mb-2">Quantidade de Questões</label>
            <input
              type="number"
              value={qtdQuestoes}
              onChange={(e) => setQtdQuestoes(e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white"
              min="50"
              max="1000"
            />
          </div>

          {/* Edital */}
          <div>
            <label className="block text-white font-semibold mb-2">Anexar Edital (opcional)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setEdital(e.target.files?.[0] || null)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-500 file:text-white"
            />
            {edital && <p className="text-green-400 text-sm mt-2">✓ {edital.name}</p>}
          </div>

          {/* Botões */}
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl font-bold text-white"
            >
              💳 Ir para Pagamento
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
