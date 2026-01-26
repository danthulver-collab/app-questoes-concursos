import { useState, useEffect } from "react";
import { AppLayout } from "../components/app-layout";
import { useAuth } from "../lib/auth-context-supabase";
import { getUserPlan, isSuperAdmin } from "../lib/access-control";
import { getAllAreas, getCarreirasByArea, getMateriasByArea } from "../lib/quiz-store";

export default function PlanejamentoEstudos() {
  const { user } = useAuth();
  const userId = user?.email || user?.username || "";
  const userPlan = getUserPlan(userId) || "free";
  const isAdmin = isSuperAdmin(user?.email) || isSuperAdmin(user?.username);
  const isPlusUser = userPlan === 'plus' || isAdmin;

  const [areaId, setAreaId] = useState("");
  const [carreiraId, setCarreiraId] = useState("");
  const [materiasSelecionadas, setMateriasSelecionadas] = useState<string[]>([]);
  const [horasDisponiveis, setHorasDisponiveis] = useState(3);
  const [showPlan, setShowPlan] = useState(false);
  
  const areas = getAllAreas();
  const carreiras = areaId ? getCarreirasByArea(areaId) : [];
  const materias = areaId ? getMateriasByArea(areaId) : [];

  const gerarPlano = () => {
    setShowPlan(true);
  };

  const toggleMateria = (id: string) => {
    setMateriasSelecionadas(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  // Dados de exemplo para gráfico
  const metricas = JSON.parse(localStorage.getItem(`metricas_${userId}`) || '{"total": 0, "acertos": 0}');
  const historicoSemanal = [
    { dia: 'Seg', questoes: 15 },
    { dia: 'Ter', questoes: 22 },
    { dia: 'Qua', questoes: 18 },
    { dia: 'Qui', questoes: 25 },
    { dia: 'Sex', questoes: 20 },
    { dia: 'Sáb', questoes: 30 },
    { dia: 'Dom', questoes: 12 },
  ];

  const maxQuestoes = Math.max(...historicoSemanal.map(h => h.questoes));

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#070b14] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
              📊 Planejamento de Estudos
            </h1>
            <p className="text-gray-400 text-lg">
              {isPlusUser ? 'Plano personalizado com IA' : 'Organize sua rotina de estudos'}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Formulário */}
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6 border border-white/10">
                <h2 className="text-2xl font-bold mb-6">Configure seu plano</h2>
                
                {/* Área */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sua Área</label>
                  <select
                    value={areaId}
                    onChange={e => { setAreaId(e.target.value); setCarreiraId(""); }}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                  >
                    <option value="">Selecione...</option>
                    {areas.map(a => <option key={a.id} value={a.id}>{a.icone} {a.nome}</option>)}
                  </select>
                </div>

                {/* Carreira */}
                {areaId && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sua Carreira</label>
                    <select
                      value={carreiraId}
                      onChange={e => setCarreiraId(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                    >
                      <option value="">Selecione...</option>
                      {carreiras.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                )}

                {/* Matérias */}
                {areaId && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Matérias (marque as que estudará)</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-white/5 rounded-xl border border-white/10">
                      {materias.map(m => (
                        <label key={m.id} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-all">
                          <input
                            type="checkbox"
                            checked={materiasSelecionadas.includes(m.id)}
                            onChange={() => toggleMateria(m.id)}
                            className="w-4 h-4"
                          />
                          <span className="text-white">{m.nome}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Horas */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Horas disponíveis por dia</label>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={horasDisponiveis}
                    onChange={e => setHorasDisponiveis(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-2">
                    <span>1h</span>
                    <span className="text-orange-400 font-bold text-lg">{horasDisponiveis}h/dia</span>
                    <span>12h</span>
                  </div>
                </div>

                <button
                  onClick={gerarPlano}
                  disabled={!areaId || materiasSelecionadas.length === 0}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-bold text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✨ Gerar Plano de Estudos
                </button>
              </div>
            </div>

            {/* Gráfico de Evolução */}
            <div className="glass-card rounded-2xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold mb-6">📈 Sua Evolução Semanal</h2>
              
              {/* Gráfico de barras */}
              <div className="space-y-3">
                {historicoSemanal.map((h, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-gray-400 text-sm w-12">{h.dia}</span>
                      <div className="flex-1 bg-white/5 rounded-lg h-8 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                          style={{ width: `${(h.questoes / maxQuestoes) * 100}%` }}
                        >
                          <span className="text-white text-xs font-bold">{h.questoes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-gradient-to-br from-orange-500/20 to-amber-500/10 rounded-xl border border-orange-500/30">
                  <div className="text-3xl font-black text-orange-400">{metricas.total}</div>
                  <div className="text-sm text-gray-400">Total Respondidas</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-green-500/10 rounded-xl border border-emerald-500/30">
                  <div className="text-3xl font-black text-emerald-400">
                    {metricas.total > 0 ? Math.round((metricas.acertos / metricas.total) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-400">Taxa de Acerto</div>
                </div>
              </div>
            </div>
          </div>

          {/* Plano Gerado */}
          {showPlan && (
            <div className="mt-8 glass-card rounded-2xl p-8 border border-white/10 animate-fade-in">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span>🎯</span>
                {isPlusUser ? 'Plano Personalizado Plus' : 'Plano Básico de Estudos'}
              </h2>

              {isPlusUser ? (
                /* PLANO PLUS - Completo */
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/30">
                    <h3 className="font-bold text-xl text-purple-400 mb-4">📅 Cronograma Semanal</h3>
                    <div className="space-y-3">
                      {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((dia, i) => {
                        const mat = materiasSelecionadas[i % materiasSelecionadas.length];
                        const matNome = materias.find(m => m.id === mat)?.nome || '';
                        const horas = i < 5 ? horasDisponiveis : horasDisponiveis * 1.5;
                        return (
                          <div key={dia} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <span className="font-bold text-white">{dia}</span>
                            <span className="text-orange-400">{matNome}</span>
                            <span className="text-gray-400">{Math.floor(horas)}h</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-6 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-xl border border-orange-500/30">
                      <h3 className="font-bold text-orange-400 mb-3">🔥 Foque Mais Em:</h3>
                      <ul className="space-y-2 text-gray-300">
                        {materiasSelecionadas.slice(0, 3).map(m => (
                          <li key={m}>• {materias.find(mat => mat.id === m)?.nome}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-xl border border-emerald-500/30">
                      <h3 className="font-bold text-emerald-400 mb-3">⏰ Melhor Horário:</h3>
                      <p className="text-2xl font-bold text-white">6h - 9h</p>
                      <p className="text-sm text-gray-400">Manhã (maior foco)</p>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-500/30">
                    <h3 className="font-bold text-blue-400 mb-3">🎯 Técnica Pomodoro:</h3>
                    <p className="text-gray-300">50 min de estudo + 10 min de pausa</p>
                    <p className="text-sm text-gray-400 mt-2">Repita 4x e faça pausa longa de 30 min</p>
                  </div>
                </div>
              ) : (
                /* PLANO FREE - Simples */
                <div className="space-y-6">
                  <div className="p-6 bg-white/5 rounded-xl">
                    <h3 className="font-bold text-xl text-orange-400 mb-4">📅 Sugestão de Rotina</h3>
                    <div className="space-y-3 text-gray-300">
                      <p>🌅 <strong>Manhã (6h-9h):</strong> Matéria mais difícil</p>
                      <p>☀️ <strong>Tarde (14h-17h):</strong> Resolver questões</p>
                      <p>🌙 <strong>Noite (19h-22h):</strong> Revisão do dia</p>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-xl border border-orange-500/30">
                    <h3 className="font-bold text-orange-400 mb-3">💡 Dica:</h3>
                    <p className="text-gray-300">Estude {horasDisponiveis}h por dia com foco total. Revise em 24h, 7 dias e 30 dias.</p>
                  </div>

                  {/* Upgrade para Plus */}
                  <div className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/10 rounded-xl border-2 border-purple-500/30">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">✨</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-purple-400 mb-2">Quer plano completo com IA?</h3>
                        <p className="text-gray-300 text-sm">Cronograma personalizado, técnicas de estudo e análise de desempenho</p>
                      </div>
                      <button 
                        onClick={() => window.location.href = '/planos'}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold whitespace-nowrap hover:scale-105 transition-transform"
                      >
                        Ver Plus
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
