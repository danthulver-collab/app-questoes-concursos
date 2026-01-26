import { useState, useEffect, useCallback } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { getQuizData, type Question, type QuizData, type Concurso } from "../lib/quiz-store";
import { AppHeader } from "../components/app-header";
import { useAuth } from "../lib/auth-context-supabase";
import { getUserPlan, hasAccessToConcurso, canAccessPackage, getUserAssignedPackages, type PlanType } from "../lib/access-control";

interface SubjectStats {
  nome: string;
  questionsCount: number;
  progress: number;
  icon: string;
  color: {
    bg: string;
    border: string;
    text: string;
  };
}

const SUBJECT_COLORS = [
  { bg: "from-blue-500/20 to-cyan-500/10", border: "border-blue-500/30", text: "text-blue-400", icon: "📘" },
  { bg: "from-emerald-500/20 to-green-500/10", border: "border-emerald-500/30", text: "text-emerald-400", icon: "📗" },
  { bg: "from-purple-500/20 to-pink-500/10", border: "border-purple-500/30", text: "text-purple-400", icon: "📕" },
  { bg: "from-amber-500/20 to-orange-500/10", border: "border-amber-500/30", text: "text-amber-400", icon: "📙" },
  { bg: "from-red-500/20 to-rose-500/10", border: "border-red-500/30", text: "text-red-400", icon: "📓" },
  { bg: "from-teal-500/20 to-cyan-500/10", border: "border-teal-500/30", text: "text-teal-400", icon: "📔" },
  { bg: "from-indigo-500/20 to-violet-500/10", border: "border-indigo-500/30", text: "text-indigo-400", icon: "📚" },
  { bg: "from-rose-500/20 to-pink-500/10", border: "border-rose-500/30", text: "text-rose-400", icon: "📖" },
];

function ConcursoPage() {
  const { user } = useAuth();
  const [, params] = useRoute("/concurso/:id");
  const [, setLocation] = useLocation();
  const concursoId = params?.id || "";
  
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [concurso, setConcurso] = useState<Concurso | null>(null);
  const [subjects, setSubjects] = useState<SubjectStats[]>([]);
  const [concursoQuestions, setConcursoQuestions] = useState<Question[]>([]);
  const [userPlan, setUserPlan] = useState<PlanType | null>(null);
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    const data = getQuizData();
    setQuizData(data);
    
    // Find concurso by ID or by name (URL-encoded)
    const decodedId = decodeURIComponent(concursoId);
    let foundConcurso = data.concursos.find(c => c.id === decodedId);
    
    // If not found by ID, try to find by name
    if (!foundConcurso) {
      foundConcurso = data.concursos.find(c => 
        c.nome.toLowerCase() === decodedId.toLowerCase() ||
        c.nome.toLowerCase().replace(/\s+/g, '-') === decodedId.toLowerCase()
      );
    }
    
    // If still not found, try to match by question concurso field
    if (!foundConcurso) {
      const questionConcurso = data.questions.find(q => 
        q.concurso?.toLowerCase() === decodedId.toLowerCase() ||
        q.concurso?.toLowerCase().replace(/\s+/g, '-') === decodedId.toLowerCase()
      )?.concurso;
      
      if (questionConcurso) {
        foundConcurso = {
          id: decodedId,
          nome: questionConcurso,
          ano: 2024,
          orgao: questionConcurso
        };
      }
    }
    
    setConcurso(foundConcurso || null);
    
    // Check user plan and access
    if (user?.username) {
      // Use email first (for Google login), then username
      const userId = user.email || user.username;
      const plan = getUserPlan(userId);
      setUserPlan(plan);
      
      console.log('[Concurso] userId:', userId);
      console.log('[Concurso] plan:', plan);
      
      if (foundConcurso) {
        // Task 107/110: Check access using multiple methods
        const concursoAccess = hasAccessToConcurso(userId, foundConcurso.nome);
        
        // Also check if user has access to a package with this concurso name
        const assignedPackages = getUserAssignedPackages(userId);
        const pacoteMatch = data.pacotes.find(p => 
          p.nome === foundConcurso.nome && assignedPackages.includes(p.id)
        );
        const hasPackageAccess = pacoteMatch ? canAccessPackage(userId, pacoteMatch.id).canAccess : false;
        
        // Grant access if: Plus plan, Trial, Free plan, direct concurso access, or package access
        // Se plan é null, assume free
        const finalAccess = plan === "plus" || plan === "trial" || plan === "free" || !plan || concursoAccess || hasPackageAccess;
        console.log('[Concurso] hasAccess:', finalAccess);
        setHasAccess(finalAccess);
      }
    }
    
    // Filter questions for this concurso
    if (foundConcurso) {
      const filtered = data.questions.filter(q => 
        q.concurso === foundConcurso.nome ||
        q.concurso?.toLowerCase() === foundConcurso.nome.toLowerCase()
      );
      setConcursoQuestions(filtered);
      
      // Get unique disciplines from these questions
      const disciplinasMap = new Map<string, number>();
      filtered.forEach(q => {
        if (q.disciplina) {
          disciplinasMap.set(q.disciplina, (disciplinasMap.get(q.disciplina) || 0) + 1);
        }
      });
      
      // Convert to stats array
      const subjectsStats: SubjectStats[] = Array.from(disciplinasMap.entries())
        .map(([nome, count], idx) => {
          const color = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
          // Calculate progress (mock for now - would need real user stats)
          const answeredKey = `answered_${user?.username}_${foundConcurso.nome}_${nome}`;
          const answered = parseInt(localStorage.getItem(answeredKey) || "0");
          const progress = count > 0 ? Math.min(100, Math.round((answered / count) * 100)) : 0;
          
          return {
            nome,
            questionsCount: count,
            progress,
            icon: color.icon,
            color
          };
        })
        .sort((a, b) => b.questionsCount - a.questionsCount);
      
      setSubjects(subjectsStats);
    }
  }, [concursoId, user]);

  const handleStartSubject = (disciplina: string) => {
    // 🔥 IR DIRETO PARA QUIZ (sem passar pela tela de seleção)
    if (!concurso) return;
    
    // Conta quantas questões tem nesta matéria
    const questoesDaMateria = concursoQuestions.filter(q => q.disciplina === disciplina);
    
    if (questoesDaMateria.length === 0) {
      alert('Nenhuma questão encontrada para esta matéria');
      return;
    }
    
    // Salva filtros no localStorage para o quiz carregar
    localStorage.setItem('quiz_filters', JSON.stringify({
      concurso: concurso.nome,
      disciplina: disciplina,
      questionsIds: questoesDaMateria.map(q => q.id)
    }));
    
    // Vai DIRETO para página inicial que vai auto-iniciar o quiz
    const params = new URLSearchParams();
    params.set("concurso", concurso.nome);
    params.set("disciplina", disciplina);
    params.set("autostart", "true"); // Flag para iniciar automaticamente
    setLocation(`/?${params.toString()}`);
  };

  const handleStartAll = () => {
    const params = new URLSearchParams();
    params.set("concurso", concurso?.nome || "");
    setLocation(`/?${params.toString()}`);
  };

  if (!concurso) {
    return (
      <div className="min-h-screen bg-[#070b14]">
        <AppHeader />
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="glass-card rounded-3xl p-12 animate-fade-in">
            <span className="text-6xl mb-6 block">🔍</span>
            <h1 className="text-3xl font-bold text-white mb-4">Concurso não encontrado</h1>
            <p className="text-gray-400 mb-8">O concurso que você procura não existe ou foi removido.</p>
            <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold text-white hover:scale-[1.02] transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar para Concursos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#070b14]">
        <AppHeader />
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="glass-card rounded-3xl p-12 animate-fade-in border border-orange-500/30">
            <span className="text-6xl mb-6 block">🔒</span>
            <h1 className="text-3xl font-bold text-white mb-4">Acesso Bloqueado</h1>
            <p className="text-gray-400 mb-8">
              Você não tem acesso a este concurso. Faça upgrade do seu plano para desbloquear.
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

  return (
    <div className="min-h-screen bg-[#070b14]">
      <AppHeader />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar para Concursos
        </Link>
        
        {/* Concurso Banner */}
        <div className="glass-card rounded-3xl p-8 mb-8 relative overflow-hidden animate-fade-in">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">🏆</span>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                      {concurso.nome}
                    </h1>
                    <div className="flex items-center gap-4 mt-2 text-gray-400">
                      <span className="flex items-center gap-1">
                        <span className="text-sm">🏛️</span>
                        {concurso.orgao}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-sm">📅</span>
                        {concurso.ano}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-2xl font-bold text-orange-400">{concursoQuestions.length}</span>
                    <span className="text-gray-400 ml-2 text-sm">questões</span>
                  </div>
                  <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-2xl font-bold text-emerald-400">{subjects.length}</span>
                    <span className="text-gray-400 ml-2 text-sm">matérias</span>
                  </div>
                </div>
              </div>
              
              {/* Start button */}
              <button
                onClick={handleStartAll}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold text-white hover:scale-[1.02] transition-transform shadow-lg shadow-orange-500/20 flex items-center gap-2"
              >
                <span>🚀</span>
                Iniciar Todas as Matérias
              </button>
            </div>
          </div>
        </div>
        
        {/* Subjects Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span>📚</span>
            Matérias do Concurso
          </h2>
          
          {subjects.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <span className="text-5xl mb-4 block">📭</span>
              <h3 className="text-xl font-semibold text-white mb-2">Nenhuma matéria cadastrada</h3>
              <p className="text-gray-400">Este concurso ainda não possui questões cadastradas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {subjects.map((subject, idx) => (
                <button
                  key={subject.nome}
                  onClick={() => handleStartSubject(subject.nome)}
                  className={`group relative p-5 rounded-2xl border-2 transition-all hover:scale-[1.02] text-left overflow-hidden bg-gradient-to-br ${subject.color.bg} ${subject.color.border} hover:shadow-lg`}
                  style={{ 
                    animationDelay: `${idx * 50}ms`,
                  }}
                >
                  {/* Progress bar background */}
                  <div 
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500 transition-all"
                    style={{ width: `${subject.progress}%` }}
                  />
                  
                  <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform">
                    {subject.icon}
                  </span>
                  
                  <h4 className={`font-bold text-sm md:text-base ${subject.color.text}`}>
                    {subject.nome}
                  </h4>
                  
                  <p className="text-xs text-gray-400 mt-1">
                    {subject.questionsCount} questões
                  </p>
                  
                  {subject.progress > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {subject.progress}% concluído
                    </p>
                  )}
                  
                  {/* Hover indicator */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xl">▶️</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Quick tips */}
        <div className="glass-card rounded-2xl p-6 border border-orange-500/20">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <span>💡</span>
            Dicas de Estudo
          </h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-orange-400">•</span>
              Comece pelas matérias com menos questões para ganhar confiança
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400">•</span>
              Revise suas respostas erradas no Dashboard
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400">•</span>
              Consulte a IA para tirar dúvidas durante os estudos
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default ConcursoPage;
