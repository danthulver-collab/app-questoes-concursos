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

  // Buscar dados REAIS do histórico
  const historicoReal = JSON.parse(localStorage.getItem(`historico_${userId}`) || '[]');
  const metricas = JSON.parse(localStorage.getItem(`metricas_${userId}`) || '{"total": 0, "acertos": 0}');
  
  // Processar histórico por dia da semana
  const processarHistoricoSemanal = () => {
    const hoje = new Date();
    const ultimos7Dias = [];
    
    for (let i = 6; i >= 0; i--) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i);
      
      const questoesDoDia = historicoReal.filter((h: any) => {
        const dataH = new Date(h.data);
        return dataH.toDateString() === data.toDateString();
      }).reduce((acc: number, h: any) => acc + (h.total || 0), 0);
      
      ultimos7Dias.push({
        dia: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][data.getDay()],
        questoes: questoesDoDia,
        data: data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      });
    }
    
    return ultimos7Dias;
  };

  const historicoSemanal = processarHistoricoSemanal();
  const totalSemana = historicoSemanal.reduce((acc, h) => acc + h.questoes, 0);
  const maxQuestoes = Math.max(...historicoSemanal.map(h => h.questoes), 1);

  // Dados para gráfico de pizza por matéria
  const materiasEstudadas = historicoReal.reduce((acc: any, h: any) => {
    const mat = h.materia || 'Outras';
    acc[mat] = (acc[mat] || 0) + (h.total || 0);
    return acc;
  }, {});

  const cores = ['#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];
  const total = Object.values(materiasEstudadas).reduce((a: any, b: any) => a + b, 0) || 1;

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
                <h2 className="text-2xl font-bold text-white mb-6">Configure seu plano</h2>
                
                {/* Área */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sua Área</label>
                  <select
                    value={areaId}
                    onChange={e => { setAreaId(e.target.value); setCarreiraId(""); }}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                  >
                    <option value="" className="bg-gray-900 text-white">Selecione...</option>
                    {areas.map(a => <option key={a.id} value={a.id} className="bg-gray-900 text-white">{a.icone} {a.nome}</option>)}
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
                      <option value="" className="bg-gray-900 text-white">Selecione...</option>
                      {carreiras.map(c => <option key={c.id} value={c.id} className="bg-gray-900 text-white">{c.nome}</option>)}
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
              <h2 className="text-2xl font-bold text-white mb-6">📈 Sua Evolução</h2>
              
              {/* Gráfico de Pizza */}
              {Object.keys(materiasEstudadas).length > 0 ? (
                <div className="mb-8">
                  <div className="relative w-64 h-64 mx-auto">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      {Object.entries(materiasEstudadas).map(([mat, count]: any, i) => {
                        const percentage = (count / total) * 100;
                        const offset = Object.entries(materiasEstudadas).slice(0, i).reduce((acc: number, [, c]: any) => acc + ((c / total) * 100), 0);
                        return (
                          <circle
                            key={mat}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={cores[i % cores.length]}
                            strokeWidth="20"
                            strokeDasharray={`${percentage * 2.51} ${251.2 - percentage * 2.51}`}
                            strokeDashoffset={-offset * 2.51}
                            className="transition-all duration-500"
                          />
                        );
                      })}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-4xl font-black text-white">{metricas.total}</div>
                      <div className="text-sm text-gray-400">questões</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-6">
                    {Object.entries(materiasEstudadas).map(([mat, count]: any, i) => (
                      <div key={mat} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cores[i % cores.length] }} />
                          <span className="text-white text-sm">{mat}</span>
                        </div>
                        <span className="text-gray-400 text-sm">{count} questões ({Math.round((count/total)*100)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p>Comece a responder questões para ver sua evolução!</p>
                </div>
              )}

              {/* Gráfico de Barras Semanal */}
              <div className="mt-8">
                <h3 className="text-lg font-bold text-white mb-4">📅 Últimos 7 Dias</h3>
                <div className="space-y-2">
                  {historicoSemanal.map((h, i) => (
                    <div key={i}>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-gray-300 text-sm w-16">{h.dia} {h.data}</span>
                        <div className="flex-1 bg-white/5 rounded-lg h-8 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                            style={{ width: `${h.questoes === 0 ? 0 : Math.max((h.questoes / maxQuestoes) * 100, 10)}%` }}
                          >
                            {h.questoes > 0 && <span className="text-white text-xs font-bold">{h.questoes}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="p-3 bg-gradient-to-br from-orange-500/20 to-amber-500/10 rounded-xl border border-orange-500/30">
                  <div className="text-2xl font-black text-orange-400">{metricas.total}</div>
                  <div className="text-xs text-gray-400">Total</div>
                </div>
                <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-green-500/10 rounded-xl border border-emerald-500/30">
                  <div className="text-2xl font-black text-emerald-400">
                    {metricas.total > 0 ? Math.round((metricas.acertos / metricas.total) * 100) : 0}%
                  </div>
                  <div className="text-xs text-gray-400">Acertos</div>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 rounded-xl border border-blue-500/30">
                  <div className="text-2xl font-black text-blue-400">{totalSemana}</div>
                  <div className="text-xs text-gray-400">Esta Semana</div>
                </div>
              </div>
            </div>
          </div>

          {/* Plano Gerado */}
          {showPlan && (
            <div className="mt-8 glass-card rounded-2xl p-8 border border-white/10 animate-fade-in">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span>🎯</span>
                {isPlusUser ? 'Plano Personalizado Plus' : 'Plano Básico de Estudos'}
              </h2>

              {isPlusUser ? (
                /* PLANO PLUS - Completo e Detalhado */
                <div className="space-y-6">
                  {/* Cronograma Semanal */}
                  <div className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/30">
                    <h3 className="font-bold text-xl text-purple-400 mb-4">📅 Cronograma Semanal Otimizado</h3>
                    <div className="space-y-3">
                      {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((dia, i) => {
                        const mat = materiasSelecionadas[i % materiasSelecionadas.length];
                        const matNome = materias.find(m => m.id === mat)?.nome || '';
                        const horas = i < 5 ? horasDisponiveis : Math.floor(horasDisponiveis * 1.5);
                        const periodo = i < 5 ? '19h-22h' : '9h-12h';
                        return (
                          <div key={dia} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                            <div className="flex items-center gap-4">
                              <div className="w-2 h-2 rounded-full bg-purple-400" />
                              <span className="font-bold text-white w-24">{dia}</span>
                              <span className="text-purple-400 font-medium">{matNome}</span>
                            </div>
                            <div className="flex gap-4 text-sm">
                              <span className="text-gray-400">{periodo}</span>
                              <span className="text-orange-400 font-bold">{horas}h</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Estratégias e Técnicas */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-6 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-xl border border-orange-500/30">
                      <h3 className="font-bold text-orange-400 mb-3 flex items-center gap-2">
                        <span className="text-2xl">🔥</span> Matérias Prioritárias
                      </h3>
                      <ul className="space-y-2 text-gray-300">
                        {materiasSelecionadas.slice(0, 3).map((m, i) => (
                          <li key={m} className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-orange-500/30 flex items-center justify-center text-xs font-bold text-orange-300">{i+1}</span>
                            <span>{materias.find(mat => mat.id === m)?.nome}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-gray-500 mt-3">💡 Dedique 60% do tempo nessas</p>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-xl border border-emerald-500/30">
                      <h3 className="font-bold text-emerald-400 mb-3 flex items-center gap-2">
                        <span className="text-2xl">⏰</span> Melhores Horários
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <div className="text-xl font-bold text-white">6h - 9h</div>
                          <p className="text-sm text-gray-400">Manhã (pico de concentração)</p>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-white">14h - 17h</div>
                          <p className="text-sm text-gray-400">Tarde (revisar e exercícios)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Técnica Pomodoro */}
                  <div className="p-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-500/30">
                    <h3 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
                      <span className="text-2xl">⏱️</span> Técnica Pomodoro Recomendada
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-white/5 rounded-xl">
                        <div className="text-3xl font-black text-blue-400">50min</div>
                        <p className="text-sm text-gray-400">Foco Total</p>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-xl">
                        <div className="text-3xl font-black text-emerald-400">10min</div>
                        <p className="text-sm text-gray-400">Pausa Curta</p>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-xl">
                        <div className="text-3xl font-black text-purple-400">30min</div>
                        <p className="text-sm text-gray-400">Pausa Longa</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mt-3">Repita 4 ciclos e faça pausa longa</p>
                  </div>

                  {/* Sistema de Revisão */}
                  <div className="p-6 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-xl border border-amber-500/30">
                    <h3 className="font-bold text-amber-400 mb-3 flex items-center gap-2">
                      <span className="text-2xl">🔄</span> Sistema de Revisão Espaçada
                    </h3>
                    <div className="space-y-2 text-gray-300">
                      <p>📌 <strong>1º Revisão:</strong> 24 horas após estudar</p>
                      <p>📌 <strong>2º Revisão:</strong> 7 dias depois</p>
                      <p>📌 <strong>3º Revisão:</strong> 30 dias depois</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">Combate a curva do esquecimento</p>
                  </div>

                  {/* Meta Semanal */}
                  <div className="p-6 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-xl border border-pink-500/30">
                    <h3 className="font-bold text-pink-400 mb-3 flex items-center gap-2">
                      <span className="text-2xl">🎯</span> Meta Semanal Sugerida
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-white/5 rounded-xl">
                        <div className="text-3xl font-black text-pink-400">{horasDisponiveis * 7}</div>
                        <p className="text-sm text-gray-400">Horas/semana</p>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-xl">
                        <div className="text-3xl font-black text-orange-400">{horasDisponiveis * 20}</div>
                        <p className="text-sm text-gray-400">Questões/semana</p>
                      </div>
                    </div>
                  </div>

                  {/* Dicas Extras */}
                  <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-sky-500/10 rounded-xl border border-cyan-500/30">
                    <h3 className="font-bold text-cyan-400 mb-3 flex items-center gap-2">
                      <span className="text-2xl">💡</span> Dicas de Performance
                    </h3>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li>✓ Durma 7-8h por noite para fixar conteúdo</li>
                      <li>✓ Hidrate-se durante os estudos (2L água/dia)</li>
                      <li>✓ Exercite-se 30min/dia (aumenta foco)</li>
                      <li>✓ Estude no mesmo horário (cria hábito)</li>
                      <li>✓ Use técnica ativa: resumos, mapas mentais</li>
                    </ul>
                  </div>
                </div>
              ) : (
                /* PLANO FREE - Simples */
                <div className="space-y-6">
                  <div className="p-6 bg-white/5 rounded-xl">
                    <h3 className="font-bold text-xl text-orange-400 mb-4">📅 Sugestão de Rotina</h3>
                    <div className="space-y-3 text-gray-300">
                      <p>🌅 <strong className="text-white">Manhã (6h-9h):</strong> Matéria mais difícil</p>
                      <p>☀️ <strong className="text-white">Tarde (14h-17h):</strong> Resolver questões</p>
                      <p>🌙 <strong className="text-white">Noite (19h-22h):</strong> Revisão do dia</p>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-xl border border-orange-500/30">
                    <h3 className="font-bold text-orange-400 mb-3">💡 Dica Essencial:</h3>
                    <p className="text-gray-300">Estude <strong className="text-white">{horasDisponiveis}h por dia</strong> com foco total. Revise em 24h, 7 dias e 30 dias para fixar melhor.</p>
                  </div>

                  {/* Upgrade para Plus */}
                  <div className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/10 rounded-xl border-2 border-purple-500/30">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">✨</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-purple-400 mb-2">Quer plano completo com IA?</h3>
                        <p className="text-gray-300 text-sm">Cronograma personalizado, Pomodoro, revisão espaçada e análise de desempenho detalhada</p>
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
