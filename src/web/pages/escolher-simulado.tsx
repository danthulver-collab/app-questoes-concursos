import { useState } from 'react';
import { AppLayout } from '../components/app-layout';
import { useLocation } from 'wouter';
import { QUESTOES_INICIAIS } from '../lib/questoes-iniciais';

const BANCAS = ['CESPE/CEBRASPE', 'FCC', 'VUNESP', 'FGV', 'IBFC', 'CESGRANRIO'];
const MATERIAS = ['Português', 'Matemática', 'Direito Constitucional', 'Direito Administrativo', 'Informática', 'Raciocínio Lógico'];

export default function EscolherSimulado() {
  const [, setLocation] = useLocation();
  const [banca, setBanca] = useState('');
  const [materia, setMateria] = useState('');

  const iniciarSimulado = () => {
    if (!banca || !materia) {
      alert('Selecione banca e matéria');
      return;
    }

    // Filtrar questões da matéria escolhida
    const questoesFiltradas = QUESTOES_INICIAIS.filter(q => q.disciplina === materia);
    
    // Salvar questões filtradas no localStorage para o simulado
    localStorage.setItem('simulado_atual', JSON.stringify({
      banca,
      materia,
      questoes: questoesFiltradas
    }));

    // Ir direto para o simulado
    setLocation('/simulado');
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-white mb-2">🎯 Iniciar Simulado</h1>
        <p className="text-gray-400 mb-8">Escolha banca e matéria para começar</p>

        <div className="space-y-6">
          <div>
            <label className="block text-white font-semibold mb-3">Banca</label>
            <div className="grid grid-cols-2 gap-3">
              {BANCAS.map(b => (
                <button
                  key={b}
                  onClick={() => setBanca(b)}
                  className={`p-4 rounded-xl font-semibold transition-all ${
                    banca === b 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {banca && (
            <div>
              <label className="block text-white font-semibold mb-3">Matéria</label>
              <div className="grid grid-cols-2 gap-3">
                {MATERIAS.map(m => (
                  <button
                    key={m}
                    onClick={() => setMateria(m)}
                    className={`p-4 rounded-xl font-semibold transition-all ${
                      materia === m 
                        ? 'bg-green-600 text-white' 
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {banca && materia && (
            <button
              onClick={iniciarSimulado}
              className="w-full py-5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl font-bold text-white text-lg"
            >
              ▶️ Iniciar Simulado
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
