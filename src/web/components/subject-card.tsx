import { useState, useEffect } from "react";

// Task 112: Beautiful subject card component with themed colors and icons

interface SubjectStats {
  answeredCount: number;
  correctCount: number;
  totalQuestions: number;
  lastStudied?: string;
}

interface SubjectCardProps {
  nome: string;
  questionsCount: number;
  pacoteId: string;
  username: string;
  onClick: () => void;
  index: number;
}

// Subject-specific theming
const SUBJECT_THEMES: Record<string, { 
  icon: string; 
  gradient: string;
  border: string;
  glow: string;
}> = {
  "Português": { 
    icon: "📖", 
    gradient: "from-sky-500/25 via-blue-500/15 to-cyan-500/10",
    border: "border-sky-500/40",
    glow: "shadow-sky-500/20"
  },
  "Matemática": { 
    icon: "🔢", 
    gradient: "from-emerald-500/25 via-green-500/15 to-teal-500/10",
    border: "border-emerald-500/40",
    glow: "shadow-emerald-500/20"
  },
  "Raciocínio Lógico": { 
    icon: "🧠", 
    gradient: "from-violet-500/25 via-purple-500/15 to-fuchsia-500/10",
    border: "border-violet-500/40",
    glow: "shadow-violet-500/20"
  },
  "Direito Constitucional": { 
    icon: "⚖️", 
    gradient: "from-amber-500/25 via-orange-500/15 to-yellow-500/10",
    border: "border-amber-500/40",
    glow: "shadow-amber-500/20"
  },
  "Direito Administrativo": { 
    icon: "🏛️", 
    gradient: "from-rose-500/25 via-red-500/15 to-pink-500/10",
    border: "border-rose-500/40",
    glow: "shadow-rose-500/20"
  },
  "Direito Penal": { 
    icon: "🔒", 
    gradient: "from-slate-500/25 via-gray-500/15 to-zinc-500/10",
    border: "border-slate-400/40",
    glow: "shadow-slate-500/20"
  },
  "Direito Civil": { 
    icon: "📜", 
    gradient: "from-indigo-500/25 via-blue-500/15 to-violet-500/10",
    border: "border-indigo-500/40",
    glow: "shadow-indigo-500/20"
  },
  "Direito Tributário": { 
    icon: "💰", 
    gradient: "from-lime-500/25 via-green-500/15 to-emerald-500/10",
    border: "border-lime-500/40",
    glow: "shadow-lime-500/20"
  },
  "Informática": { 
    icon: "💻", 
    gradient: "from-cyan-500/25 via-teal-500/15 to-blue-500/10",
    border: "border-cyan-500/40",
    glow: "shadow-cyan-500/20"
  },
  "Atualidades": { 
    icon: "📰", 
    gradient: "from-orange-500/25 via-amber-500/15 to-yellow-500/10",
    border: "border-orange-500/40",
    glow: "shadow-orange-500/20"
  },
  "Conhecimentos Gerais": { 
    icon: "🌍", 
    gradient: "from-teal-500/25 via-cyan-500/15 to-sky-500/10",
    border: "border-teal-500/40",
    glow: "shadow-teal-500/20"
  },
  "História": { 
    icon: "📚", 
    gradient: "from-amber-600/25 via-yellow-500/15 to-orange-500/10",
    border: "border-amber-600/40",
    glow: "shadow-amber-600/20"
  },
  "Geografia": { 
    icon: "🗺️", 
    gradient: "from-green-500/25 via-emerald-500/15 to-teal-500/10",
    border: "border-green-500/40",
    glow: "shadow-green-500/20"
  },
  "Administração": { 
    icon: "📊", 
    gradient: "from-blue-500/25 via-indigo-500/15 to-violet-500/10",
    border: "border-blue-500/40",
    glow: "shadow-blue-500/20"
  },
  "Contabilidade": { 
    icon: "🧮", 
    gradient: "from-emerald-600/25 via-green-500/15 to-lime-500/10",
    border: "border-emerald-600/40",
    glow: "shadow-emerald-600/20"
  },
  "Economia": { 
    icon: "📈", 
    gradient: "from-green-500/25 via-teal-500/15 to-cyan-500/10",
    border: "border-green-500/40",
    glow: "shadow-green-500/20"
  },
  "Legislação Específica": { 
    icon: "📋", 
    gradient: "from-purple-500/25 via-violet-500/15 to-indigo-500/10",
    border: "border-purple-500/40",
    glow: "shadow-purple-500/20"
  },
  "Ética no Serviço Público": { 
    icon: "🤝", 
    gradient: "from-sky-500/25 via-blue-500/15 to-indigo-500/10",
    border: "border-sky-500/40",
    glow: "shadow-sky-500/20"
  },
  "Arquivologia": { 
    icon: "🗄️", 
    gradient: "from-stone-500/25 via-gray-500/15 to-slate-500/10",
    border: "border-stone-500/40",
    glow: "shadow-stone-500/20"
  },
  "Redação Oficial": { 
    icon: "✍️", 
    gradient: "from-rose-500/25 via-pink-500/15 to-red-500/10",
    border: "border-rose-500/40",
    glow: "shadow-rose-500/20"
  },
};

// Fallback themes for subjects not in the map
const FALLBACK_THEMES = [
  { icon: "📘", gradient: "from-blue-500/25 via-indigo-500/15 to-violet-500/10", border: "border-blue-500/40", glow: "shadow-blue-500/20" },
  { icon: "📗", gradient: "from-emerald-500/25 via-green-500/15 to-teal-500/10", border: "border-emerald-500/40", glow: "shadow-emerald-500/20" },
  { icon: "📕", gradient: "from-rose-500/25 via-red-500/15 to-pink-500/10", border: "border-rose-500/40", glow: "shadow-rose-500/20" },
  { icon: "📙", gradient: "from-amber-500/25 via-orange-500/15 to-yellow-500/10", border: "border-amber-500/40", glow: "shadow-amber-500/20" },
  { icon: "📓", gradient: "from-purple-500/25 via-violet-500/15 to-fuchsia-500/10", border: "border-purple-500/40", glow: "shadow-purple-500/20" },
];

const getSubjectTheme = (nome: string, index: number) => {
  // Check for exact match
  if (SUBJECT_THEMES[nome]) return SUBJECT_THEMES[nome];
  
  // Check for partial matches (e.g., "Direito" in name)
  for (const [key, theme] of Object.entries(SUBJECT_THEMES)) {
    if (nome.toLowerCase().includes(key.toLowerCase().split(" ")[0])) {
      return theme;
    }
  }
  
  // Fallback based on index
  return FALLBACK_THEMES[index % FALLBACK_THEMES.length];
};

// Get stats from localStorage - Task 114
const getSubjectStats = (username: string, pacoteId: string, disciplina: string): SubjectStats => {
  const storageKey = `quiz_progress_${username}_${pacoteId}`;
  const stored = localStorage.getItem(storageKey);
  
  if (!stored) {
    return { answeredCount: 0, correctCount: 0, totalQuestions: 0 };
  }
  
  try {
    const data = JSON.parse(stored);
    const disciplinaStats = data[disciplina] || { answered: 0, correct: 0 };
    return {
      answeredCount: disciplinaStats.answered || 0,
      correctCount: disciplinaStats.correct || 0,
      totalQuestions: disciplinaStats.total || 0,
      lastStudied: disciplinaStats.lastStudied
    };
  } catch {
    return { answeredCount: 0, correctCount: 0, totalQuestions: 0 };
  }
};

interface SubjectCardProps {
  nome: string;
  questionsCount: number;
  pacoteId: string;
  username: string;
  onClick: () => void;
  onStatsClick?: () => void;
  index: number;
}

export function SubjectCard({ nome, questionsCount, pacoteId, username, onClick, onStatsClick, index }: SubjectCardProps) {
  const [stats, setStats] = useState<SubjectStats>({ answeredCount: 0, correctCount: 0, totalQuestions: questionsCount });
  const theme = getSubjectTheme(nome, index);
  
  useEffect(() => {
    const loadedStats = getSubjectStats(username, pacoteId, nome);
    setStats({ ...loadedStats, totalQuestions: questionsCount });
  }, [username, pacoteId, nome, questionsCount]);
  
  const progressPercent = questionsCount > 0 ? Math.round((stats.answeredCount / questionsCount) * 100) : 0;
  const accuracyPercent = stats.answeredCount > 0 ? Math.round((stats.correctCount / stats.answeredCount) * 100) : 0;
  const isComplete = progressPercent >= 100;
  
  // Performance indicator color
  const getPerformanceColor = () => {
    if (stats.answeredCount === 0) return "text-gray-400";
    if (accuracyPercent >= 80) return "text-emerald-400";
    if (accuracyPercent >= 60) return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <button
      onClick={onClick}
      className={`
        group relative w-full text-left rounded-2xl overflow-hidden
        border-2 ${theme.border}
        bg-gradient-to-br ${theme.gradient}
        backdrop-blur-sm
        transition-all duration-300 ease-out
        hover:scale-[1.03] hover:shadow-xl hover:${theme.glow}
        active:scale-[0.98]
        focus:outline-none focus:ring-2 focus:ring-white/20
      `}
      style={{ 
        animationDelay: `${index * 75}ms`,
      }}
    >
      {/* Completion badge */}
      {isComplete && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-xs text-emerald-400 font-medium">
            ✓ Completa
          </span>
        </div>
      )}
      
      {/* Progress bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
        <div 
          className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      {/* Card content */}
      <div className="relative z-10 p-5 md:p-6">
        {/* Icon */}
        <div className="mb-4">
          <span className="text-4xl md:text-5xl block group-hover:scale-110 transition-transform duration-300">
            {theme.icon}
          </span>
        </div>
        
        {/* Subject name */}
        <h3 className="text-base md:text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-white/90 transition-colors">
          {nome}
        </h3>
        
        {/* Questions count */}
        <p className="text-sm text-gray-400 mb-3">
          {questionsCount} questões
        </p>
        
        {/* Stats row */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            {/* Progress */}
            <div className="flex items-center gap-1">
              <span className="text-gray-500">{stats.answeredCount}/{questionsCount}</span>
            </div>
            
            {/* Accuracy - only show if answered some */}
            {stats.answeredCount > 0 && (
              <div className={`flex items-center gap-1 ${getPerformanceColor()}`}>
                <span>{accuracyPercent}%</span>
                <span className="text-[10px]">acerto</span>
              </div>
            )}
          </div>
          
          {/* Stats button - Task 116 */}
          {onStatsClick && stats.answeredCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatsClick();
              }}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Ver estatísticas"
            >
              <span className="text-sm">📊</span>
            </button>
          )}
        </div>
        
        {/* Circular progress indicator */}
        <div className="absolute top-5 right-5 w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-white/10"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="url(#progress-gradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${progressPercent * 1.26} 126`}
              className="transition-all duration-500"
            />
            <defs>
              <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white/80">
            {progressPercent}%
          </span>
        </div>
      </div>
      
      {/* Hover shine effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </button>
  );
}

export default SubjectCard;
