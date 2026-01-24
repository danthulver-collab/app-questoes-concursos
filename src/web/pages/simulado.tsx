import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { AppLayout } from '../components/app-layout';
import { useAuth } from '../lib/auth-context-supabase';
import { isUserPlus, isSuperAdmin, getUserPlan } from '../lib/access-control';
import { canAnswerQuestion, incrementQuestionsAnswered, getRemainingQuestions, hasReachedQuestionLimit } from '../lib/questions-limit';

// Usando Groq API (gratuita) com Llama 3 - via env var
const getGroqKey = () => {
  return import.meta.env.VITE_GROQ_API_KEY || localStorage.getItem('groq_api_key') || '';
};

export default function SimuladoPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [simulado, setSimulado] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respostas, setRespostas] = useState<Record<number, string>>({});
  const [mostrarGabarito, setMostrarGabarito] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiQuery, setAIQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [anotacoes, setAnotacoes] = useState<Record<number, string>>({});
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [questoesRespondidas, setQuestoesRespondidas] = useState(0);
  
  // Verificar plano para comentários - incluindo admin
  const userId = user?.email || user?.username || '';
  const isAdmin = isSuperAdmin(user?.email) || isSuperAdmin(user?.username) || user?.email === 'danthulver@gmail.com';
  const isPlusUser = isUserPlus(userId) || isAdmin;
  const userPlan = getUserPlan(userId);
  const isFreePlan = userPlan === 'free' || userPlan === 'gratuito' || !userPlan;
  const podeVerComentarios = isPlusUser || user?.username === 'admin';
  const remaining = getRemainingQuestions(userId);

  useEffect(() => {
    const data = localStorage.getItem('simulado_atual');
    if (data) {
      setSimulado(JSON.parse(data));
    }
    // Carregar anotações salvas
    const savedNotes = localStorage.getItem(`anotacoes_${userId}`);
    if (savedNotes) {
      setAnotacoes(JSON.parse(savedNotes));
    }
  }, [userId]);

  // Salvar anotação
  const salvarAnotacao = (texto: string) => {
    const novasAnotacoes = { ...anotacoes, [currentIndex]: texto };
    setAnotacoes(novasAnotacoes);
    localStorage.setItem(`anotacoes_${userId}`, JSON.stringify(novasAnotacoes));
  };

  // Função para chamar ChatGPT
  const perguntarChatGPT = async () => {
    if (!aiQuery.trim()) return;
    
    setAiLoading(true);
    setAiResponse('');
    
    try {
      const questaoAtual = simulado?.questoes?.[currentIndex];
      const contexto = `
Você é um professor especialista em concursos públicos. O aluno está estudando a seguinte questão:

QUESTÃO: ${questaoAtual?.title}
A) ${questaoAtual?.optionA}
B) ${questaoAtual?.optionB}
C) ${questaoAtual?.optionC}
D) ${questaoAtual?.optionD}

RESPOSTA CORRETA: ${questaoAtual?.correctAnswer}
EXPLICAÇÃO: ${questaoAtual?.explanation}

DÚVIDA DO ALUNO: ${aiQuery}

Responda de forma clara, didática e objetiva, focando em ajudar o aluno a entender o conceito.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getGroqKey()}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'Você é um professor especialista em concursos públicos brasileiros. Responda sempre em português, de forma clara, didática e objetiva.' },
            { role: 'user', content: contexto }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0]) {
        setAiResponse(data.choices[0].message.content);
      } else if (data.error) {
        setAiResponse(`Erro: ${data.error.message}`);
      } else {
        setAiResponse('Não foi possível obter resposta. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao chamar ChatGPT:', error);
      setAiResponse('Erro ao conectar com a IA. Verifique sua conexão.');
    } finally {
      setAiLoading(false);
    }
  };

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
    // Verificar limite para plano grátis
    if (isFreePlan && !canAnswerQuestion(userId)) {
      setShowLimitModal(true);
      return;
    }
    
    // Se ainda não respondeu esta questão, incrementa contador
    if (!respostas[currentIndex]) {
      incrementQuestionsAnswered(userId);
      setQuestoesRespondidas(prev => prev + 1);
    }
    
    setRespostas(prev => ({ ...prev, [currentIndex]: opcao }));
  };

  const proxima = () => {
    // Verificar limite antes de avançar
    if (isFreePlan && hasReachedQuestionLimit(userId)) {
      setShowLimitModal(true);
      return;
    }
    
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
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-4 flex justify-between items-center">
          <span className="text-gray-400">Questão {currentIndex + 1} de {totalQuestoes}</span>
          <span className="text-blue-400">{simulado.banca} • {simulado.materia}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna da Questão */}
          <div className="lg:col-span-2">
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
                  <div className="mt-2">
                    <div className="text-sm mb-4">{questao.explanation}</div>
                    
                    {/* Funcionalidades Plus - Áudio e ChatGPT */}
                    {isPlusUser && (
                      <div className="flex flex-wrap gap-3 pt-3 border-t border-white/10">
                        {/* Botão Áudio */}
                        <button
                          onClick={() => {
                            const audioFile = questao?.audioComment;
                            if (audioFile) {
                              const audio = new Audio(audioFile);
                              audio.play().catch(() => {
                                // Fallback TTS
                                const text = questao.explanation || "";
                                if ('speechSynthesis' in window && text) {
                                  const utterance = new SpeechSynthesisUtterance(text);
                                  utterance.lang = 'pt-BR';
                                  utterance.rate = 0.9;
                                  speechSynthesis.speak(utterance);
                                }
                              });
                            } else {
                              const text = questao.explanation || "";
                              if ('speechSynthesis' in window && text) {
                                const utterance = new SpeechSynthesisUtterance(text);
                                utterance.lang = 'pt-BR';
                                utterance.rate = 0.9;
                                speechSynthesis.speak(utterance);
                              }
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-400 hover:bg-purple-500/30 transition-all text-sm font-medium"
                        >
                          🎧 Ouvir Comentário
                          <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded">PLUS</span>
                        </button>
                        
                        {/* Botão ChatGPT */}
                        <button
                          onClick={() => setShowAIModal(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 hover:bg-emerald-500/30 transition-all text-sm font-medium"
                        >
                          🤖 Pesquisar com ChatGPT
                          <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded">PLUS</span>
                        </button>
                      </div>
                    )}
                  </div>
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

          {/* Coluna de Anotações */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 rounded-2xl p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📝</span>
                <h3 className="text-lg font-bold text-white">Minhas Anotações</h3>
                {!isPlusUser && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded">PLUS</span>
                )}
              </div>
              
              {isPlusUser ? (
                <>
                  <p className="text-xs text-gray-400 mb-3">
                    Anote pontos importantes da questão
                  </p>
                  <textarea
                    value={anotacoes[currentIndex] || ''}
                    onChange={(e) => salvarAnotacao(e.target.value)}
                    placeholder="Digite suas anotações aqui...&#10;&#10;Ex:&#10;- Ponto importante&#10;- Dica para lembrar&#10;- Palavras-chave"
                    className="w-full h-64 p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 resize-none text-sm"
                  />
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>💾 Salvo automaticamente</span>
                    <span>{(anotacoes[currentIndex] || '').length} caracteres</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🔒</div>
                  <p className="text-gray-400 text-sm mb-2">
                    Recurso exclusivo do Plano Plus
                  </p>
                  <p className="text-gray-500 text-xs">
                    Faça upgrade para fazer anotações nas questões
                  </p>
                </div>
              )}
              
              {isPlusUser && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setShowAIModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 hover:bg-emerald-500/30 transition-all text-sm font-medium"
                  >
                    🤖 Perguntar ao ChatGPT
                    <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded">PLUS</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal ChatGPT */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🤖</span>
                <div>
                  <h3 className="text-xl font-bold text-white">ChatGPT - Tire suas Dúvidas</h3>
                  <p className="text-xs text-gray-400">Pergunte sobre a questão atual</p>
                </div>
              </div>
              <button
                onClick={() => { setShowAIModal(false); setAiResponse(''); setAIQuery(''); }}
                className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 mb-4">
              <p className="text-xs text-emerald-400">
                ✨ ChatGPT integrado! Pergunte qualquer coisa sobre a questão.
              </p>
            </div>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAIQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !aiLoading && perguntarChatGPT()}
                placeholder="Ex: Por que a alternativa B está errada?"
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                disabled={aiLoading}
              />
              <button
                onClick={perguntarChatGPT}
                disabled={!aiQuery.trim() || aiLoading}
                className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl font-semibold disabled:opacity-50 transition-all hover:scale-[1.02] text-white flex items-center gap-2"
              >
                {aiLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Pensando...
                  </>
                ) : (
                  'Perguntar'
                )}
              </button>
            </div>
            
            {/* Resposta do ChatGPT */}
            {aiResponse && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🤖</span>
                  <span className="text-sm font-semibold text-emerald-400">Resposta do ChatGPT:</span>
                </div>
                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {aiResponse}
                </div>
              </div>
            )}
            
            {/* Sugestões de perguntas */}
            {!aiResponse && !aiLoading && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-2">💡 Sugestões de perguntas:</p>
                {[
                  "Explique o conceito principal desta questão",
                  "Por que as outras alternativas estão erradas?",
                  "Dê exemplos práticos deste tema",
                  "Quais são as pegadinhas comuns neste assunto?"
                ].map((sugestao, i) => (
                  <button
                    key={i}
                    onClick={() => setAIQuery(sugestao)}
                    className="block w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-all"
                  >
                    {sugestao}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Modal de Limite de Questões */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-white/10 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-white mb-3">Limite Atingido!</h2>
            <p className="text-gray-400 mb-6">
              Você já respondeu as 10 questões gratuitas do seu plano. 
              Faça upgrade para continuar estudando sem limites!
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setLocation('/planos')}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:opacity-90 transition-all"
              >
                ⭐ Ver Planos
              </button>
              <button
                onClick={() => setShowLimitModal(false)}
                className="w-full py-3 bg-white/10 text-gray-300 font-medium rounded-xl hover:bg-white/20 transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
