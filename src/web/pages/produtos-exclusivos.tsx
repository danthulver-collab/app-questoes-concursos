/**
 * Página de Produtos Exclusivos para o ALUNO
 * Mostra o pacote exclusivo do aluno com questões por matéria
 * 🔥 REGRA: Tudo lê do Supabase, sem estado local para controle de acesso
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../lib/auth-context-supabase";
import { AppHeader } from "../components/app-header";
import { supabase } from "../lib/supabase";
import { getQuizData, type Question, type Pacote } from "../lib/quiz-store";
import { getPacotesFromSupabase, getQuestoesFromSupabase } from "../lib/supabase-pacotes";

interface ProfileData {
  plan: string | null;
  package_status: 'aguardando' | 'em_andamento' | 'pronto' | null;
}

interface PacoteExclusivo {
  id: string;
  nome: string;
  concurso: string;
  cargo: string;
  banca: string;
  materias: string[];
  totalQuestoes: number;
  questoesPorMateria: Record<string, number>;
  status: string;
}

export default function ProdutosExclusivos() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [pacote, setPacote] = useState<PacoteExclusivo | null>(null);
  const [questoes, setQuestoes] = useState<Question[]>([]);

  // 🔥 Buscar dados do profile e pacote do Supabase
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        // 1. Buscar profile do Supabase
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('plan, package_status')
          .eq('email', user.email)
          .single();

        if (profileError || !profile) {
          console.error('❌ Erro ao buscar profile:', profileError);
          setLocation('/dashboard');
          return;
        }

        setProfileData({
          plan: profile.plan,
          package_status: profile.package_status
        });

        // 🔥 Verificar acesso - APENAS lê do banco
        if (profile.plan !== 'individual' || profile.package_status !== 'pronto') {
          console.log('❌ Acesso negado - plan:', profile.plan, 'status:', profile.package_status);
          setLocation('/dashboard');
          return;
        }

        // 2. Buscar pacote do aluno
        const pacotesSupabase = await getPacotesFromSupabase();
        const questoesSupabase = await getQuestoesFromSupabase();
        
        // Também tenta do localStorage como fallback
        const quizData = getQuizData();
        const allPacotes = [...pacotesSupabase, ...quizData.pacotes];
        const allQuestoes = [...questoesSupabase, ...quizData.questions];
        
        // Encontrar pacote do aluno
        const pacoteAluno = allPacotes.find(p => 
          p.alunoAtribuido === user.email || 
          p.alunoAtribuido === user.id
        );

        if (pacoteAluno) {
          // Buscar questões do pacote
          const questoesDoPacote = allQuestoes.filter(q => 
            pacoteAluno.questionsIds?.includes(q.id)
          );
          
          setQuestoes(questoesDoPacote);

          // Calcular questões por matéria
          const questoesPorMateria: Record<string, number> = {};
          questoesDoPacote.forEach(q => {
            const materia = q.disciplina || 'Geral';
            questoesPorMateria[materia] = (questoesPorMateria[materia] || 0) + 1;
          });

          setPacote({
            id: pacoteAluno.id,
            nome: pacoteAluno.nome,
            concurso: pacoteAluno.nome || 'Concurso',
            cargo: pacoteAluno.orgao || pacoteAluno.cargo || 'Cargo',
            banca: pacoteAluno.banca || 'Banca',
            materias: pacoteAluno.disciplinas || Object.keys(questoesPorMateria),
            totalQuestoes: questoesDoPacote.length,
            questoesPorMateria,
            status: pacoteAluno.status || 'active'
          });
        }

      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Carregando seus produtos exclusivos...</p>
        </div>
      </div>
    );
  }

  // Se não tem acesso (verificação extra)
  if (!profileData || profileData.plan !== 'individual' || profileData.package_status !== 'pronto') {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Acesso Bloqueado</h1>
          <p className="text-gray-400 mb-6">
            {profileData?.plan !== 'individual' 
              ? 'Você precisa ter o Plano Individual para acessar produtos exclusivos.'
              : 'Seu pacote ainda está sendo preparado. Aguarde a liberação.'}
          </p>
          <Link href="/dashboard">
            <button className="px-6 py-3 bg-orange-500 hover:bg-orange-400 rounded-xl font-bold">
              Voltar ao Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />
      
      <AppHeader showBack backUrl="/dashboard" title="Produtos Exclusivos" />

      <main className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 relative z-10">
        {/* Header do Pacote */}
        <div className="glass-card rounded-3xl p-8 mb-8 bg-gradient-to-br from-emerald-500/20 to-green-500/10 border-2 border-emerald-500/30">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-3xl">
              📦
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Seu Pacote Exclusivo</h1>
              <p className="text-emerald-400">✅ Pacote liberado e pronto para uso!</p>
            </div>
          </div>

          {pacote ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Concurso</p>
                <p className="font-bold text-white">{pacote.concurso}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Cargo</p>
                <p className="font-bold text-white">{pacote.cargo}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Banca</p>
                <p className="font-bold text-orange-400">{pacote.banca}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Total de Questões</p>
                <p className="font-bold text-2xl text-emerald-400">{pacote.totalQuestoes}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>Nenhum pacote encontrado. Entre em contato com o suporte.</p>
            </div>
          )}
        </div>

        {/* Lista de Matérias */}
        {pacote && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">📚 Questões por Matéria</h2>
            
            {pacote.materias.length > 0 ? (
              <div className="grid gap-4">
                {pacote.materias.map((materia, index) => {
                  const qtdQuestoes = pacote.questoesPorMateria[materia] || 0;
                  
                  return (
                    <div
                      key={index} 
                      onClick={() => {
                        // 🔥 Preparar simulado com questões da matéria
                        const questoesDaMateria = questoes.filter(q => q.disciplina === materia);
                        
                        if (questoesDaMateria.length === 0) {
                          alert('Nenhuma questão encontrada para esta matéria.');
                          return;
                        }
                        
                        // Formato esperado pelo simulado
                        const simuladoData = {
                          questoes: questoesDaMateria.map(q => ({
                            id: q.id,
                            title: q.pergunta,
                            optionA: q.alternativas[0],
                            optionB: q.alternativas[1],
                            optionC: q.alternativas[2],
                            optionD: q.alternativas[3],
                            correctAnswer: ['A', 'B', 'C', 'D'][q.correta],
                            explanation: q.comentario || 'Sem comentário disponível.',
                            banca: q.banca || pacote.banca,
                            concurso: q.concurso || pacote.concurso,
                            disciplina: q.disciplina,
                            ano: q.ano
                          })),
                          nome: `${pacote.concurso} - ${materia}`,
                          banca: pacote.banca
                        };
                        
                        localStorage.setItem('simulado_atual', JSON.stringify(simuladoData));
                        setLocation('/simulado');
                      }}
                      className="glass-card rounded-2xl p-6 hover:scale-[1.02] transition-all cursor-pointer border border-white/10 hover:border-emerald-500/50 group"
                    >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center text-2xl">
                              📖
                            </div>
                            <div>
                              <h3 className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors">
                                {materia}
                              </h3>
                              <p className="text-sm text-gray-400">
                                {qtdQuestoes} {qtdQuestoes === 1 ? 'questão' : 'questões'} disponíveis
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl font-bold">
                              {qtdQuestoes}
                            </span>
                            <svg className="w-6 h-6 text-gray-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="text-4xl mb-4">📭</div>
                <p className="text-gray-400">Nenhuma matéria cadastrada ainda.</p>
                <p className="text-sm text-gray-500 mt-2">As questões estão sendo preparadas.</p>
              </div>
            )}
          </div>
        )}

        {/* Botão para iniciar simulado geral */}
        {pacote && pacote.totalQuestoes > 0 && (
          <div className="mt-8">
            <button 
              onClick={() => {
                // 🔥 Preparar simulado com TODAS as questões
                if (questoes.length === 0) {
                  alert('Nenhuma questão encontrada.');
                  return;
                }
                
                const simuladoData = {
                  questoes: questoes.map(q => ({
                    id: q.id,
                    title: q.pergunta,
                    optionA: q.alternativas[0],
                    optionB: q.alternativas[1],
                    optionC: q.alternativas[2],
                    optionD: q.alternativas[3],
                    correctAnswer: ['A', 'B', 'C', 'D'][q.correta],
                    explanation: q.comentario || 'Sem comentário disponível.',
                    banca: q.banca || pacote.banca,
                    concurso: q.concurso || pacote.concurso,
                    disciplina: q.disciplina,
                    ano: q.ano
                  })),
                  nome: `${pacote.concurso} - Simulado Completo`,
                  banca: pacote.banca
                };
                
                localStorage.setItem('simulado_atual', JSON.stringify(simuladoData));
                setLocation('/simulado');
              }}
              className="w-full py-5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 rounded-2xl text-white font-bold text-xl shadow-2xl shadow-emerald-500/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
            >
              <span className="text-3xl">🚀</span>
              <span>Iniciar Simulado Completo ({pacote.totalQuestoes} questões)</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
