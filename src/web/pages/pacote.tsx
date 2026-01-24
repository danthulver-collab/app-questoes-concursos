import { useState, useEffect } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { getQuizData, type Question, type QuizData, type Pacote } from "../lib/quiz-store";
import { AppHeader } from "../components/app-header";
import { SubjectCard } from "../components/subject-card";
import { useAuth } from "../lib/auth-context-supabase";
import { getUserPlan, canAccessPackage, getUserAssignedPackages, type PlanType } from "../lib/access-control";

// Task 111: Package visualization page with subject selection

interface SubjectInfo {
  nome: string;
  questionsCount: number;
  questionsIds: string[];
}

function PacotePage() {
  const { user } = useAuth();
  const [, params] = useRoute("/pacote/:id");
  const [, setLocation] = useLocation();
  const pacoteId = params?.id || "";
  
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [pacote, setPacote] = useState<Pacote | null>(null);
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [userPlan, setUserPlan] = useState<PlanType | null>(null);
  const [hasAccess, setHasAccess] = useState(true);
  const [overallProgress, setOverallProgress] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  useEffect(() => {
    const data = getQuizData();
    setQuizData(data);
    
    // Find package by ID
    const decodedId = decodeURIComponent(pacoteId);
    const foundPacote = data.pacotes.find(p => p.id === decodedId);
    setPacote(foundPacote || null);
    
    // BLOQUEAR ACESSO: Se pacote não está pronto, redireciona
    // Bloqueia se: não tem status OU status diferente de "pronto"
    if (foundPacote && foundPacote.status !== "pronto") {
      console.log(`[BLOQUEIO] Pacote ${foundPacote.id} com status "${foundPacote.status || 'undefined'}" - redirecionando...`);
      setLocation("/aguardando-pacote");
      return;
    }
    
    // Check user plan and access
    if (user?.username) {
      // Use email first (for Google login), then username
      const userId = user.email || user.username;
      const plan = getUserPlan(userId);
      setUserPlan(plan);
      
      console.log('[Pacote] userId:', userId);
      console.log('[Pacote] plan:', plan);
      
      if (foundPacote) {
        const accessCheck = canAccessPackage(userId, foundPacote.id);
        // Se plan é null, assume free e libera acesso
        const finalAccess = accessCheck.canAccess || plan === "plus" || plan === "trial" || plan === "free" || !plan;
        console.log('[Pacote] hasAccess:', finalAccess);
        setHasAccess(finalAccess);
      }
    }
    
    // Get questions for this package and group by discipline
    if (foundPacote) {
      // Get questions either from pacote.questionsIds or filter by concurso name
      let pacoteQuestions: Question[] = [];
      
      if (foundPacote.questionsIds && foundPacote.questionsIds.length > 0) {
        pacoteQuestions = data.questions.filter(q => foundPacote.questionsIds.includes(q.id));
      } else {
        // Fallback: filter questions by package name matching concurso
        pacoteQuestions = data.questions.filter(q => 
          q.concurso === foundPacote.nome ||
          q.concurso?.toLowerCase() === foundPacote.nome.toLowerCase()
        );
      }
      
      // Group by discipline
      const disciplinasMap = new Map<string, { count: number; ids: string[] }>();
      pacoteQuestions.forEach(q => {
        const disciplina = q.disciplina || "Geral";
        const current = disciplinasMap.get(disciplina) || { count: 0, ids: [] };
        disciplinasMap.set(disciplina, { 
          count: current.count + 1, 
          ids: [...current.ids, q.id] 
        });
      });
      
      // Task 132: Filter to only show disciplines configured in the package
      // If package has specific disciplinas defined, filter to only show those
      let filteredDisciplinas = Array.from(disciplinasMap.entries());
      if (foundPacote.disciplinas && foundPacote.disciplinas.length > 0) {
        filteredDisciplinas = filteredDisciplinas.filter(([nome]) => 
          foundPacote.disciplinas.includes(nome)
        );
      }
      
      // Convert to array and sort by question count
      const subjectsArray: SubjectInfo[] = filteredDisciplinas
        .map(([nome, data]) => ({
          nome,
          questionsCount: data.count,
          questionsIds: data.ids
        }))
        .sort((a, b) => b.questionsCount - a.questionsCount);
      
      setSubjects(subjectsArray);
      
      // Calculate overall progress from localStorage
      if (user?.username) {
        const storageKey = `quiz_progress_${user.username}_${foundPacote.id}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          try {
            const progressData = JSON.parse(stored);
            let answered = 0;
            for (const key of Object.keys(progressData)) {
              answered += progressData[key]?.answered || 0;
            }
            setTotalAnswered(answered);
            const total = pacoteQuestions.length;
            setOverallProgress(total > 0 ? Math.round((answered / total) * 100) : 0);
          } catch { /* ignore */ }
        }
      }
    }
  }, [pacoteId, user]);

  const handleStartSubject = (disciplina: string) => {
    if (!pacote) return;
    setLocation(`/pacote/${pacote.id}/materia/${encodeURIComponent(disciplina)}`);
  };

  const handleStartAll = () => {
    if (!pacote) return;
    setLocation(`/pacote/${pacote.id}/estudar`);
  };

  // Package not found
  if (!pacote) {
    return (
      <div className="min-h-screen bg-[#070b14]">
        <AppHeader />
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="glass-card rounded-3xl p-12 animate-fade-in">
            <span className="text-6xl mb-6 block">🔍</span>
            <h1 className="text-3xl font-bold text-white mb-4">Pacote não encontrado</h1>
            <p className="text-gray-400 mb-8">O pacote que você procura não existe ou foi removido.</p>
            <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold text-white hover:scale-[1.02] transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar para Início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Access blocked
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#070b14]">
        <AppHeader />
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="glass-card rounded-3xl p-12 animate-fade-in border border-orange-500/30">
            <span className="text-6xl mb-6 block">🔒</span>
            <h1 className="text-3xl font-bold text-white mb-4">Acesso Bloqueado</h1>
            <p className="text-gray-400 mb-8">
              Você não tem acesso a este pacote. Entre em contato com o administrador para solicitar acesso.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/planos" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold text-white hover:scale-[1.02] transition-transform">
                Ver Planos
              </Link>
              <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 glass-card rounded-xl font-semibold text-white hover:bg-white/10 transition-colors">
                Voltar
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalQuestions = subjects.reduce((acc, s) => acc + s.questionsCount, 0);

  return (
    <div className="min-h-screen bg-[#070b14]">
      <AppHeader />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb / Back */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar para Início
        </Link>
        
        {/* Package Banner/Header */}
        <div className="glass-card rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden animate-fade-in">
          {/* Background decorations */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                {/* Package badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-full text-sm text-orange-400 mb-4">
                  <span>📦</span>
                  Pacote de Questões
                </div>
                
                {/* Package name */}
                <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-3">
                  {pacote.nome}
                </h1>
                
                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                  {pacote.banca && (
                    <span className="flex items-center gap-1">
                      <span>🏛️</span>
                      {pacote.banca}
                    </span>
                  )}
                  {pacote.ano && (
                    <span className="flex items-center gap-1">
                      <span>📅</span>
                      {pacote.ano}
                    </span>
                  )}
                  {pacote.orgao && (
                    <span className="flex items-center gap-1">
                      <span>🏢</span>
                      {pacote.orgao}
                    </span>
                  )}
                </div>
                
                {/* Description */}
                {pacote.descricao && (
                  <p className="text-gray-400 text-sm md:text-base max-w-2xl mb-6">
                    {pacote.descricao}
                  </p>
                )}
                
                {/* Stats cards */}
                <div className="flex flex-wrap gap-3 md:gap-4">
                  <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                    <span className="text-2xl md:text-3xl font-bold text-orange-400">{totalQuestions}</span>
                    <span className="text-gray-400 ml-2 text-sm">questões</span>
                  </div>
                  <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                    <span className="text-2xl md:text-3xl font-bold text-emerald-400">{subjects.length}</span>
                    <span className="text-gray-400 ml-2 text-sm">matérias</span>
                  </div>
                  {overallProgress > 0 && (
                    <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                      <span className="text-2xl md:text-3xl font-bold text-amber-400">{overallProgress}%</span>
                      <span className="text-gray-400 ml-2 text-sm">concluído</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right side: Progress circle + CTA */}
              <div className="flex flex-col items-center gap-4">
                {/* Progress ring */}
                <div className="relative w-28 h-28 md:w-32 md:h-32">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-white/10"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="url(#banner-progress)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${overallProgress * 2.83} 283`}
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="banner-progress" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#fbbf24" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl md:text-3xl font-bold text-white">{overallProgress}%</span>
                    <span className="text-xs text-gray-400">progresso</span>
                  </div>
                </div>
                
                {/* Task 133: Start Full Simulation button */}
                <button
                  onClick={handleStartAll}
                  className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-bold text-white hover:scale-[1.02] transition-transform shadow-lg shadow-orange-500/30 flex items-center justify-center gap-3 text-lg"
                >
                  <span className="text-2xl">🚀</span>
                  <div className="text-left">
                    <span className="block">Iniciar Simulado</span>
                    <span className="text-xs opacity-80 font-normal">({totalQuestions} questões)</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Subjects Grid - Netflix/Spotify inspired */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span>📚</span>
            Matérias do Pacote
          </h2>
          
          {subjects.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <span className="text-5xl mb-4 block">📭</span>
              <h3 className="text-xl font-semibold text-white mb-2">Nenhuma matéria encontrada</h3>
              <p className="text-gray-400">Este pacote ainda não possui questões cadastradas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 stagger-children">
              {subjects.map((subject, idx) => (
                <SubjectCard
                  key={subject.nome}
                  nome={subject.nome}
                  questionsCount={subject.questionsCount}
                  pacoteId={pacote.id}
                  username={user?.username || ""}
                  onClick={() => handleStartSubject(subject.nome)}
                  onStatsClick={() => setLocation(`/pacote/${pacote.id}/materia/${encodeURIComponent(subject.nome)}/stats`)}
                  index={idx}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Quick stats */}
        {totalAnswered > 0 && (
          <div className="glass-card rounded-2xl p-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>📊</span>
              Seu Progresso
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{totalAnswered}</div>
                <div className="text-xs text-gray-400">respondidas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{totalQuestions - totalAnswered}</div>
                <div className="text-xs text-gray-400">restantes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">{overallProgress}%</div>
                <div className="text-xs text-gray-400">concluído</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">{subjects.length}</div>
                <div className="text-xs text-gray-400">matérias</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default PacotePage;
