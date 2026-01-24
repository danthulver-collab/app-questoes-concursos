import { useState, useEffect } from 'react';
import { AppLayout } from '../components/app-layout';
import { useAuth } from '../lib/auth-context-supabase';

export default function SimuladoPage() {
  const { user } = useAuth();
  const [simulado, setSimulado] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respostas, setRespostas] = useState<Record<number, string>>({});
  const [mostrarGabarito, setMostrarGabarito] = useState(false);
  
  // Verificar plano para comentários
  const userPlan = localStorage.getItem(`user_plan_${user?.email || user?.username}`) || 'free';
  const podeVerComentarios = userPlan === 'individual' || userPlan === 'plus' || user?.username === 'admin';

  useEffect(() => {
    const data = localStorage.getItem('simulado_atual');
    if (data) {
      setSimulado(JSON.parse(data));
    }
  }, []);

  if (!simulado || !simulado.questoes || simulado.questoes.length === 0) {
    return (
      <AppLayout>
        <div className="text-white text-center p-12">
          <h2 className="text-2xl mb-4">Nenhuma questão encontrada</h2>
          <p className="text-gray-400">Volte e escolha banca e matéria</p>
        </div>
      </AppLayout>
    );
  }

  const questao = simulado.questoes[currentIndex];
  const totalQuestoes = simulado.questoes.length;

  const responder = (opcao: string) => {
    setRespostas(prev => ({ ...prev, [currentIndex]: opcao }));
  };

  const proxima = () => {
    if (currentIndex < totalQuestoes - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setMostrarGabarito(true);
    }
  };

  const calcularAcertos = () => {
    let acertos = 0;
    simulado.questoes.forEach((q: any, i: number) => {
      if (respostas[i] === q.correctAnswer) acertos++;
    });
    return acertos;
  };

  const salvarResultado = (acertos: number, total: number) => {
    const userId = user?.email || user?.username;
    if (!userId) return;

    // Salvar histórico no localStorage
    const historico = JSON.parse(localStorage.getItem(`historico_${userId}`) || '[]');
    historico.push({
      data: new Date().toISOString(),
      acertos,
      total,
      percentual: Math.round((acertos / total) * 100),
      materia: simulado.materia
    });
    localStorage.setItem(`historico_${userId}`, JSON.stringify(historico));

    // Atualizar métricas totais
    const metricas = JSON.parse(localStorage.getItem(`metricas_${userId}`) || '{"total": 0, "acertos": 0}');
    metricas.total += total;
    metricas.acertos += acertos;
    localStorage.setItem(`metricas_${userId}`, JSON.stringify(metricas));
  };

  if (mostrarGabarito) {
    const acertos = calcularAcertos();
    const percentual = Math.round((acertos / totalQuestoes) * 100);
    
    // Salvar resultado
    salvarResultado(acertos, totalQuestoes);

    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto p-6 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">🎉 Simulado Finalizado!</h1>
          <div className="bg-white/5 rounded-2xl p-8 mb-6">
            <div className="text-6xl font-bold text-green-400 mb-2">{percentual}%</div>
            <p className="text-xl text-white">Você acertou {acertos} de {totalQuestoes} questões</p>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="px-8 py-4 bg-blue-600 rounded-xl text-white font-bold"
          >
            Voltar ao Início
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-4 flex justify-between items-center">
          <span className="text-gray-400">Questão {currentIndex + 1} de {totalQuestoes}</span>
          <span className="text-blue-400">{simulado.banca} • {simulado.materia}</span>
        </div>

        <div className="bg-white/5 rounded-2xl p-8">
          <h2 className="text-xl text-white font-semibold mb-6">{questao.title}</h2>

          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map(opcao => (
              <button
                key={opcao}
                onClick={() => responder(opcao)}
                className={`w-full p-5 rounded-xl text-left transition-all transform hover:scale-102 ${
                  respostas[currentIndex] === opcao
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50 scale-105'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:shadow-md'
                }`}
              >
                <span className="font-bold text-lg mr-3">{opcao})</span>
                <span className="text-base">{questao[`option${opcao}`]}</span>
              </button>
            ))}
          </div>

          {respostas[currentIndex] && (
            <div className="mt-6">
              <div className={`p-4 rounded-xl ${
                respostas[currentIndex] === questao.correctAnswer
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                <div className="font-bold mb-2">
                  {respostas[currentIndex] === questao.correctAnswer ? '✅ Correto!' : '❌ Incorreto'}
                </div>
                <div className="text-sm">
                  Resposta correta: <strong>{questao.correctAnswer}</strong>
                </div>
                {podeVerComentarios ? (
                  <div className="text-sm mt-2">{questao.explanation}</div>
                ) : (
                  <div className="text-sm mt-2">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 mb-3">
                      🔒 Comentários disponíveis nos planos Individual e Plus
                    </div>
                    <button
                      onClick={() => window.location.href = '/planos'}
                      className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl text-white font-bold transition-all"
                    >
                      ⭐ Fazer Upgrade Agora
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={proxima}
                className="w-full mt-4 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-bold"
              >
                {currentIndex < totalQuestoes - 1 ? 'Próxima →' : '🏁 Finalizar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
