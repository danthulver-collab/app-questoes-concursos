// Task 136-138: Study Techniques System

export interface StudyTechnique {
  id: string;
  name: string;
  emoji: string;
  description: string;
  application: string;
  recommendedFor: string[];  // disciplinas this technique works best for
  questionTypes: string[];   // types of questions this helps with
}

// Bank of study techniques
export const STUDY_TECHNIQUES: StudyTechnique[] = [
  {
    id: "estudo-reverso",
    name: "Estudo Reverso",
    emoji: "🔄",
    description: "Tente explicar o conceito em voz alta, como se estivesse ensinando outra pessoa.",
    application: "Feche os olhos e explique a resposta correta com suas próprias palavras. Se travar, revise o conteúdo.",
    recommendedFor: ["Português", "Direito Constitucional", "Direito Administrativo", "História"],
    questionTypes: ["conceitual", "interpretativa"]
  },
  {
    id: "leitura-dinamica",
    name: "Leitura Dinâmica",
    emoji: "👁️",
    description: "Técnica de leitura rápida focando em palavras-chave e conceitos principais.",
    application: "Sublinhe mentalmente os termos técnicos da questão. Isso acelera a compreensão em provas longas.",
    recommendedFor: ["Português", "Atualidades", "Conhecimentos Gerais"],
    questionTypes: ["interpretativa", "texto"]
  },
  {
    id: "estudo-ativo",
    name: "Estudo Ativo",
    emoji: "✍️",
    description: "Faça anotações, resumos e perguntas durante o estudo ao invés de apenas ler.",
    application: "Anote no campo ao lado: qual era a pegadinha? O que você não sabia? O que precisa revisar?",
    recommendedFor: ["Matemática", "Raciocínio Lógico", "Contabilidade", "Economia"],
    questionTypes: ["cálculo", "lógica"]
  },
  {
    id: "repeticao-espacada",
    name: "Repetição Espaçada",
    emoji: "📅",
    description: "Revisar o conteúdo em intervalos crescentes: 1 dia, 3 dias, 7 dias, 15 dias.",
    application: "Marque esta questão para revisar. A repetição em intervalos fixa o conhecimento na memória de longo prazo.",
    recommendedFor: ["Direito", "Legislação Específica", "Administração"],
    questionTypes: ["decoreba", "conceitual"]
  },
  {
    id: "mnemotecnica",
    name: "Mnemotécnica",
    emoji: "🧠",
    description: "Crie siglas, rimas ou associações para memorizar informações complexas.",
    application: "Crie uma sigla ou frase para lembrar dos elementos da resposta correta. Ex: LIMPE para princípios da administração.",
    recommendedFor: ["Direito Constitucional", "Direito Administrativo", "Contabilidade"],
    questionTypes: ["decoreba", "lista"]
  },
  {
    id: "mapa-mental",
    name: "Mapas Mentais",
    emoji: "🗺️",
    description: "Organize informações visualmente com o conceito central no meio e ramificações.",
    application: "Desenhe um mini mapa mental conectando os conceitos da questão. Isso ajuda a ver as relações entre temas.",
    recommendedFor: ["Direito", "Administração", "Geografia", "História"],
    questionTypes: ["conceitual", "relacional"]
  },
  {
    id: "pomodoro",
    name: "Técnica Pomodoro",
    emoji: "🍅",
    description: "Estude por 25 minutos focado, depois faça 5 minutos de pausa.",
    application: "Se sentiu fadiga ao errar, pode ser hora de um intervalo. Cérebro descansado = mais acertos.",
    recommendedFor: ["Matemática", "Raciocínio Lógico", "Informática"],
    questionTypes: ["cálculo", "lógica"]
  },
  {
    id: "resumo-proprio",
    name: "Resumos Próprios",
    emoji: "📝",
    description: "Escreva resumos com suas palavras, não copie textos prontos.",
    application: "Escreva nas anotações um resumo de 2-3 linhas sobre o tema desta questão.",
    recommendedFor: ["Português", "Redação Oficial", "Direito"],
    questionTypes: ["conceitual", "texto"]
  },
  {
    id: "questoes-similares",
    name: "Questões Similares",
    emoji: "🔗",
    description: "Após errar, busque questões semelhantes para praticar o mesmo conceito.",
    application: "Filtre por esta disciplina e faça mais 5 questões sobre o mesmo tema para consolidar o aprendizado.",
    recommendedFor: ["Matemática", "Contabilidade", "Raciocínio Lógico"],
    questionTypes: ["cálculo", "prática"]
  },
  {
    id: "flashcards",
    name: "Flashcards",
    emoji: "🃏",
    description: "Crie cartões com pergunta de um lado e resposta do outro para revisão rápida.",
    application: "Crie um flashcard mental: de um lado o conceito errado, do outro a explicação correta.",
    recommendedFor: ["Direito", "Legislação Específica", "Atualidades"],
    questionTypes: ["decoreba", "conceitual"]
  },
  {
    id: "releitura-critica",
    name: "Releitura Crítica",
    emoji: "🔍",
    description: "Leia o texto/enunciado questionando cada afirmação antes de responder.",
    application: "Antes de escolher, pergunte-se: 'Qual palavra-chave mudaria esta resposta?'",
    recommendedFor: ["Português", "Direito", "Atualidades"],
    questionTypes: ["interpretativa", "pegadinha"]
  },
  {
    id: "analogia",
    name: "Analogias",
    emoji: "🔀",
    description: "Relacione conceitos novos com algo que você já conhece bem.",
    application: "Compare este conceito com algo do seu dia a dia. Analogias tornam o abstrato concreto.",
    recommendedFor: ["Direito", "Economia", "Administração"],
    questionTypes: ["conceitual", "abstrato"]
  }
];

// Determine question type based on disciplina and content
const determineQuestionType = (disciplina?: string): string[] => {
  const mathDisciplinas = ["Matemática", "Raciocínio Lógico", "Contabilidade", "Economia"];
  const textDisciplinas = ["Português", "Redação Oficial", "Atualidades"];
  const lawDisciplinas = ["Direito Constitucional", "Direito Administrativo", "Direito Penal", "Direito Civil", "Direito Tributário", "Legislação Específica"];
  
  if (!disciplina) return ["conceitual"];
  
  if (mathDisciplinas.some(d => disciplina.includes(d))) {
    return ["cálculo", "lógica"];
  }
  if (textDisciplinas.some(d => disciplina.includes(d))) {
    return ["interpretativa", "texto"];
  }
  if (lawDisciplinas.some(d => disciplina.includes(d))) {
    return ["conceitual", "decoreba"];
  }
  
  return ["conceitual"];
};

// Get favorite techniques from localStorage
const getFavoriteTechniques = (username: string): string[] => {
  try {
    const stored = localStorage.getItem(`favorite_techniques_${username}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save favorite technique
export const toggleFavoriteTechnique = (username: string, techniqueId: string): boolean => {
  const favorites = getFavoriteTechniques(username);
  const index = favorites.indexOf(techniqueId);
  
  if (index === -1) {
    favorites.push(techniqueId);
  } else {
    favorites.splice(index, 1);
  }
  
  localStorage.setItem(`favorite_techniques_${username}`, JSON.stringify(favorites));
  return index === -1; // returns true if added, false if removed
};

// Check if technique is favorite
export const isFavoriteTechnique = (username: string, techniqueId: string): boolean => {
  return getFavoriteTechniques(username).includes(techniqueId);
};

// Track recently shown techniques to avoid repetition
const RECENT_TECHNIQUES_KEY = "recent_techniques";
const MAX_RECENT = 4;

const getRecentTechniques = (username: string): string[] => {
  try {
    const stored = localStorage.getItem(`${RECENT_TECHNIQUES_KEY}_${username}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const addRecentTechnique = (username: string, techniqueId: string) => {
  const recent = getRecentTechniques(username);
  const newRecent = [techniqueId, ...recent.filter(id => id !== techniqueId)].slice(0, MAX_RECENT);
  localStorage.setItem(`${RECENT_TECHNIQUES_KEY}_${username}`, JSON.stringify(newRecent));
};

// Intelligent technique recommendation based on context
export const getRecommendedTechnique = (
  username: string,
  disciplina?: string,
  wasCorrect?: boolean,
  isFirstAttempt?: boolean
): StudyTechnique => {
  const questionTypes = determineQuestionType(disciplina);
  const favorites = getFavoriteTechniques(username);
  const recentIds = getRecentTechniques(username);
  
  // Score each technique based on relevance
  const scoredTechniques = STUDY_TECHNIQUES.map(technique => {
    let score = 0;
    
    // Disciplina match
    if (disciplina && technique.recommendedFor.some(d => disciplina.toLowerCase().includes(d.toLowerCase()))) {
      score += 30;
    }
    
    // Question type match
    if (questionTypes.some(qt => technique.questionTypes.includes(qt))) {
      score += 20;
    }
    
    // Favor favorites
    if (favorites.includes(technique.id)) {
      score += 15;
    }
    
    // Penalize recently shown
    const recentIndex = recentIds.indexOf(technique.id);
    if (recentIndex !== -1) {
      score -= (MAX_RECENT - recentIndex) * 10;
    }
    
    // Context-specific scoring
    if (!wasCorrect) {
      // Wrong answer - recommend active study techniques
      if (["estudo-reverso", "estudo-ativo", "questoes-similares", "resumo-proprio"].includes(technique.id)) {
        score += 10;
      }
    }
    
    if (isFirstAttempt) {
      // First attempt - recommend foundational techniques
      if (["mnemotecnica", "mapa-mental", "flashcards"].includes(technique.id)) {
        score += 10;
      }
    }
    
    // Add some randomness to vary suggestions
    score += Math.random() * 10;
    
    return { technique, score };
  });
  
  // Sort by score and pick the best
  scoredTechniques.sort((a, b) => b.score - a.score);
  const selectedTechnique = scoredTechniques[0].technique;
  
  // Track this selection
  addRecentTechnique(username, selectedTechnique.id);
  
  return selectedTechnique;
};

// Get all techniques for display
export const getAllTechniques = (): StudyTechnique[] => STUDY_TECHNIQUES;

// Get technique by ID
export const getTechniqueById = (id: string): StudyTechnique | undefined => {
  return STUDY_TECHNIQUES.find(t => t.id === id);
};
