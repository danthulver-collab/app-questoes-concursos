export interface QuizResult {
  id: string;
  date: string;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // in seconds
  concurso?: string;
  disciplinas: string[];
  detailedResults: {
    questionId: string;
    disciplina?: string;
    isCorrect: boolean;
    timeSpent: number;
  }[];
}

// Error types for intelligent error analysis
export type ErrorType = "desconhecimento" | "confusao" | "interpretacao" | "distracao";

export interface ErrorRecord {
  questionId: string;
  disciplina?: string;
  errorType: ErrorType;
  timestamp: string;
}

export interface UserStats {
  username: string;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  totalTimeSpent: number;
  quizHistory: QuizResult[];
  disciplinaStats: Record<string, { answered: number; correct: number }>;
  concursoStats: Record<string, { answered: number; correct: number }>;
  dailyStats: Record<string, { answered: number; correct: number }>;
  errorHistory: ErrorRecord[];
  errorTypesByDisciplina: Record<string, Record<ErrorType, number>>;
  badges: string[];
  lastUpdated: string;
}

const STATS_STORAGE_KEY = "quiz_user_stats";

const DEFAULT_STATS: UserStats = {
  username: "",
  totalQuestionsAnswered: 0,
  totalCorrect: 0,
  totalTimeSpent: 0,
  quizHistory: [],
  disciplinaStats: {},
  concursoStats: {},
  dailyStats: {},
  errorHistory: [],
  errorTypesByDisciplina: {},
  badges: [],
  lastUpdated: new Date().toISOString()
};

export const getUserStats = (username: string): UserStats => {
  const key = `${STATS_STORAGE_KEY}_${username}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return { ...DEFAULT_STATS, ...JSON.parse(stored), username };
    } catch {
      return { ...DEFAULT_STATS, username };
    }
  }
  return { ...DEFAULT_STATS, username };
};

export const saveUserStats = (stats: UserStats): void => {
  const key = `${STATS_STORAGE_KEY}_${stats.username}`;
  localStorage.setItem(key, JSON.stringify({ ...stats, lastUpdated: new Date().toISOString() }));
};

export const recordQuizResult = (
  username: string,
  result: Omit<QuizResult, "id" | "date">
): UserStats => {
  const stats = getUserStats(username);
  
  const quizResult: QuizResult = {
    ...result,
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    date: new Date().toISOString()
  };

  // Update totals
  stats.totalQuestionsAnswered += result.totalQuestions;
  stats.totalCorrect += result.correctAnswers;
  stats.totalTimeSpent += result.timeSpent;
  
  // Update quiz history
  stats.quizHistory.unshift(quizResult);
  if (stats.quizHistory.length > 50) {
    stats.quizHistory = stats.quizHistory.slice(0, 50);
  }

  // Update disciplina stats
  for (const detail of result.detailedResults) {
    if (detail.disciplina) {
      if (!stats.disciplinaStats[detail.disciplina]) {
        stats.disciplinaStats[detail.disciplina] = { answered: 0, correct: 0 };
      }
      stats.disciplinaStats[detail.disciplina].answered++;
      if (detail.isCorrect) {
        stats.disciplinaStats[detail.disciplina].correct++;
      }
    }
  }

  // Update concurso stats
  if (result.concurso) {
    if (!stats.concursoStats[result.concurso]) {
      stats.concursoStats[result.concurso] = { answered: 0, correct: 0 };
    }
    stats.concursoStats[result.concurso].answered += result.totalQuestions;
    stats.concursoStats[result.concurso].correct += result.correctAnswers;
  }

  // Update daily stats
  const today = new Date().toISOString().split('T')[0];
  if (!stats.dailyStats[today]) {
    stats.dailyStats[today] = { answered: 0, correct: 0 };
  }
  stats.dailyStats[today].answered += result.totalQuestions;
  stats.dailyStats[today].correct += result.correctAnswers;

  // Update badges
  stats.badges = calculateBadges(stats);

  saveUserStats(stats);
  return stats;
};

export const calculateBadges = (stats: UserStats): string[] => {
  const badges: string[] = [];
  
  // Question count badges
  if (stats.totalQuestionsAnswered >= 10) badges.push("iniciante");
  if (stats.totalQuestionsAnswered >= 50) badges.push("estudante");
  if (stats.totalQuestionsAnswered >= 100) badges.push("dedicado");
  if (stats.totalQuestionsAnswered >= 500) badges.push("veterano");
  if (stats.totalQuestionsAnswered >= 1000) badges.push("mestre");

  // Accuracy badges
  const accuracy = stats.totalQuestionsAnswered > 0 
    ? (stats.totalCorrect / stats.totalQuestionsAnswered) * 100 
    : 0;
  if (accuracy >= 70 && stats.totalQuestionsAnswered >= 20) badges.push("precisao");
  if (accuracy >= 90 && stats.totalQuestionsAnswered >= 50) badges.push("expert");

  // Streak badges
  if (stats.quizHistory.length >= 5) badges.push("consistente");
  if (stats.quizHistory.length >= 20) badges.push("persistente");

  // Perfect score badges
  const perfectScores = stats.quizHistory.filter(q => q.correctAnswers === q.totalQuestions).length;
  if (perfectScores >= 1) badges.push("perfeccionista");
  if (perfectScores >= 5) badges.push("impecavel");

  return [...new Set(badges)];
};

export const getBadgeInfo = (badge: string): { emoji: string; name: string; description: string } => {
  const badges: Record<string, { emoji: string; name: string; description: string }> = {
    iniciante: { emoji: "🌱", name: "Iniciante", description: "Respondeu 10 questões" },
    estudante: { emoji: "📖", name: "Estudante", description: "Respondeu 50 questões" },
    dedicado: { emoji: "💪", name: "Dedicado", description: "Respondeu 100 questões" },
    veterano: { emoji: "⭐", name: "Veterano", description: "Respondeu 500 questões" },
    mestre: { emoji: "👑", name: "Mestre", description: "Respondeu 1000 questões" },
    precisao: { emoji: "🎯", name: "Precisão", description: "70%+ de acerto com 20+ questões" },
    expert: { emoji: "🏆", name: "Expert", description: "90%+ de acerto com 50+ questões" },
    consistente: { emoji: "📅", name: "Consistente", description: "5 simulados realizados" },
    persistente: { emoji: "🔥", name: "Persistente", description: "20 simulados realizados" },
    perfeccionista: { emoji: "💯", name: "Perfeccionista", description: "Gabaritou um simulado" },
    impecavel: { emoji: "🌟", name: "Impecável", description: "5 simulados gabaritados" }
  };
  return badges[badge] || { emoji: "🏅", name: badge, description: "" };
};

// Get all users stats for ranking
export const getAllUsersStats = (): UserStats[] => {
  const users: UserStats[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STATS_STORAGE_KEY + "_")) {
      try {
        const stats = JSON.parse(localStorage.getItem(key) || "{}");
        if (stats.totalQuestionsAnswered > 0) {
          users.push(stats);
        }
      } catch {}
    }
  }
  return users.sort((a, b) => {
    const aAcc = a.totalQuestionsAnswered > 0 ? a.totalCorrect / a.totalQuestionsAnswered : 0;
    const bAcc = b.totalQuestionsAnswered > 0 ? b.totalCorrect / b.totalQuestionsAnswered : 0;
    return bAcc - aAcc;
  });
};

// Error Analysis System
export interface ErrorAnalysis {
  errorType: ErrorType;
  errorTypeName: string;
  emoji: string;
  insight: string;
  howToFix: string;
}

const ERROR_TYPE_INFO: Record<ErrorType, { name: string; emoji: string }> = {
  desconhecimento: { name: "Desconhecimento do Conteúdo", emoji: "📚" },
  confusao: { name: "Confusão Conceitual", emoji: "🔄" },
  interpretacao: { name: "Erro de Interpretação", emoji: "👁️" },
  distracao: { name: "Distração/Pressa", emoji: "⚡" }
};

// Analyze an error and determine its type
export const analyzeError = (
  username: string,
  questionId: string,
  disciplina?: string,
  timeSpent?: number,
  timeLimit?: number
): ErrorAnalysis => {
  const stats = getUserStats(username);
  
  // Count previous errors in this disciplina
  const previousErrorsInDisciplina = stats.errorHistory.filter(
    e => e.disciplina === disciplina
  ).length;
  
  // Count errors of the same question
  const sameQuestionErrors = stats.errorHistory.filter(
    e => e.questionId === questionId
  ).length;
  
  // Determine error type based on patterns
  let errorType: ErrorType;
  
  // If answered very quickly (less than 20% of time), likely distraction
  if (timeSpent !== undefined && timeLimit !== undefined && timeSpent < timeLimit * 0.2) {
    errorType = "distracao";
  }
  // If already erred the same question before, it's confusion
  else if (sameQuestionErrors > 0) {
    errorType = "confusao";
  }
  // If many errors in the same disciplina, likely deeper confusion
  else if (previousErrorsInDisciplina >= 3) {
    errorType = "confusao";
  }
  // First error in this topic/disciplina = lack of knowledge
  else if (previousErrorsInDisciplina === 0) {
    errorType = "desconhecimento";
  }
  // Between 1-2 errors = could be interpretation
  else {
    errorType = "interpretacao";
  }
  
  // Generate personalized insight and tips
  const analysis = generateErrorAnalysis(errorType, disciplina, previousErrorsInDisciplina);
  
  // Record this error
  recordError(username, questionId, disciplina, errorType);
  
  return analysis;
};

const generateErrorAnalysis = (
  errorType: ErrorType,
  disciplina?: string,
  previousErrors?: number
): ErrorAnalysis => {
  const info = ERROR_TYPE_INFO[errorType];
  const disc = disciplina || "este tema";
  
  const insights: Record<ErrorType, string[]> = {
    desconhecimento: [
      `Esta pode ser sua primeira vez com ${disc}. É normal!`,
      `Você pode estar encontrando conceitos novos em ${disc}.`,
      `Identificamos uma área que precisa de estudo inicial: ${disc}.`
    ],
    confusao: [
      `Você já encontrou questões similares em ${disc}. Os conceitos estão se misturando.`,
      `Há padrões repetidos de erro em ${disc}. Os detalhes podem estar confusos.`,
      `Conceitos parecidos em ${disc} estão gerando confusão.`
    ],
    interpretacao: [
      `O enunciado pode ter sido mal interpretado. Releia com atenção.`,
      `Às vezes palavras-chave passam despercebidas no texto.`,
      `A questão pode ter pegadinhas ou negativas que mudaram o sentido.`
    ],
    distracao: [
      `Você respondeu muito rápido. Velocidade nem sempre é aliada.`,
      `Parece que houve pressa na resposta.`,
      `Respostas impulsivas podem levar a erros evitáveis.`
    ]
  };
  
  const fixes: Record<ErrorType, string[]> = {
    desconhecimento: [
      `Estude a teoria de ${disc} antes de mais exercícios. Comece pelo básico.`,
      `Assista videoaulas ou leia material introdutório sobre ${disc}.`,
      `Faça resumos e fichamentos sobre ${disc} para fixar o conteúdo.`,
      `Revise as apostilas/livros focando em ${disc} antes de continuar.`
    ],
    confusao: [
      `Faça quadros comparativos entre conceitos similares de ${disc}.`,
      `Crie mapas mentais para diferenciar os conceitos de ${disc}.`,
      `Revise os erros anteriores em ${disc} identificando o padrão.`,
      `Estude casos práticos para solidificar a diferença entre conceitos.`
    ],
    interpretacao: [
      `Pratique leitura atenta: sublinhe palavras-chave e negativas.`,
      `Antes de responder, releia o enunciado e identifique o que se pede.`,
      `Cuidado com "exceto", "incorreto", "não" - mude a abordagem.`,
      `Faça perguntas: O que a questão está realmente pedindo?`
    ],
    distracao: [
      `Respire fundo antes de responder. Use todo o tempo disponível.`,
      `Leia todas as alternativas antes de escolher a resposta.`,
      `Elimine alternativas obviamente erradas antes de decidir.`,
      `Se estiver cansado, faça uma pausa antes de continuar.`
    ]
  };
  
  // Pick random insight and fix for variety
  const insightList = insights[errorType];
  const fixList = fixes[errorType];
  const randomInsight = insightList[Math.floor(Math.random() * insightList.length)];
  const randomFix = fixList[Math.floor(Math.random() * fixList.length)];
  
  return {
    errorType,
    errorTypeName: info.name,
    emoji: info.emoji,
    insight: randomInsight,
    howToFix: randomFix
  };
};

// Record an error in user stats
const recordError = (
  username: string,
  questionId: string,
  disciplina: string | undefined,
  errorType: ErrorType
): void => {
  const stats = getUserStats(username);
  
  // Add to error history
  stats.errorHistory.push({
    questionId,
    disciplina,
    errorType,
    timestamp: new Date().toISOString()
  });
  
  // Keep only last 100 errors
  if (stats.errorHistory.length > 100) {
    stats.errorHistory = stats.errorHistory.slice(-100);
  }
  
  // Update error types by disciplina
  if (disciplina) {
    if (!stats.errorTypesByDisciplina[disciplina]) {
      stats.errorTypesByDisciplina[disciplina] = {
        desconhecimento: 0,
        confusao: 0,
        interpretacao: 0,
        distracao: 0
      };
    }
    stats.errorTypesByDisciplina[disciplina][errorType]++;
  }
  
  saveUserStats(stats);
};

// Get error statistics for a user
export const getErrorStats = (username: string) => {
  const stats = getUserStats(username);
  
  const totalErrors = stats.errorHistory.length;
  const errorTypeCounts: Record<ErrorType, number> = {
    desconhecimento: 0,
    confusao: 0,
    interpretacao: 0,
    distracao: 0
  };
  
  for (const error of stats.errorHistory) {
    errorTypeCounts[error.errorType]++;
  }
  
  return {
    totalErrors,
    errorTypeCounts,
    errorTypesByDisciplina: stats.errorTypesByDisciplina,
    recentErrors: stats.errorHistory.slice(-20)
  };
};
