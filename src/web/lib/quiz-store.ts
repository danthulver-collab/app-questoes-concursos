import { EXTENSIVE_QUESTIONS } from "./questions-bank";

export interface Question {
  id: string;
  title: string;
  options: [string, string, string, string];
  correctAnswer: 0 | 1 | 2 | 3;
  explanation: string;
  concurso?: string;
  ano?: number;
  orgao?: string;
  disciplina?: string;
  modulo?: string;
  banca?: string;
  cargo?: string;
  assunto?: string;
}

export interface Concurso {
  id: string;
  nome: string;
  ano: number;
  orgao: string;
}

export interface Disciplina {
  id: string;
  nome: string;
}

export interface Modulo {
  id: string;
  nome: string;
  descricao?: string;
  concurso?: string;
  disciplina?: string;
  ordem: number;
  questionsIds: string[];
}

export interface Pacote {
  id: string;
  nome: string;
  banca: string;
  ano: number;
  orgao: string;
  descricao: string;
  disciplinas: string[];
  numQuestoes: number;
  preco?: number;
  premium?: boolean;
  alunoAtribuido?: string;
  questionsIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizData {
  theme: string;
  questions: Question[];
  concursos: Concurso[];
  disciplinas: Disciplina[];
  modulos: Modulo[];
  pacotes: Pacote[];
}

const DEFAULT_DISCIPLINAS: Disciplina[] = [
  { id: "portugues", nome: "Português" },
  { id: "matematica", nome: "Matemática" },
  { id: "raciocinio-logico", nome: "Raciocínio Lógico" },
  { id: "direito-constitucional", nome: "Direito Constitucional" },
  { id: "direito-administrativo", nome: "Direito Administrativo" },
  { id: "direito-penal", nome: "Direito Penal" },
  { id: "direito-civil", nome: "Direito Civil" },
  { id: "direito-tributario", nome: "Direito Tributário" },
  { id: "informatica", nome: "Informática" },
  { id: "atualidades", nome: "Atualidades" },
  { id: "conhecimentos-gerais", nome: "Conhecimentos Gerais" },
  { id: "historia", nome: "História" },
  { id: "geografia", nome: "Geografia" },
  { id: "administracao", nome: "Administração" },
  { id: "contabilidade", nome: "Contabilidade" },
  { id: "economia", nome: "Economia" },
  { id: "legislacao", nome: "Legislação Específica" },
  { id: "etica", nome: "Ética no Serviço Público" },
  { id: "arquivologia", nome: "Arquivologia" },
  { id: "redacao", nome: "Redação Oficial" },
];

const DEFAULT_CONCURSOS: Concurso[] = [
  { id: "enem-2024", nome: "ENEM", ano: 2024, orgao: "INEP/MEC" },
  { id: "oab-2024", nome: "Exame de Ordem OAB", ano: 2024, orgao: "OAB" },
  { id: "inss-2024", nome: "INSS", ano: 2024, orgao: "INSS" },
  { id: "pf-2024", nome: "Polícia Federal", ano: 2024, orgao: "PF" },
  { id: "prf-2024", nome: "PRF", ano: 2024, orgao: "PRF" },
  { id: "trf-2024", nome: "TRF 3ª Região", ano: 2024, orgao: "TRF" },
  { id: "trt-2024", nome: "TRT 2ª Região", ano: 2024, orgao: "TRT" },
  { id: "tre-2024", nome: "TRE", ano: 2024, orgao: "TRE" },
  { id: "tcu-2024", nome: "TCU", ano: 2024, orgao: "TCU" },
  { id: "cgu-2024", nome: "CGU", ano: 2024, orgao: "CGU" },
  { id: "receita-2024", nome: "Receita Federal", ano: 2024, orgao: "RFB" },
  { id: "bb-2024", nome: "Banco do Brasil", ano: 2024, orgao: "BB" },
  { id: "caixa-2024", nome: "Caixa Econômica", ano: 2024, orgao: "CEF" },
];

const DEFAULT_MODULOS: Modulo[] = [
  { id: "mod-1", nome: "Módulo 1: Direito Básico", descricao: "Conceitos fundamentais de Direito", concurso: "INSS", disciplina: "Direito Constitucional", ordem: 1, questionsIds: ["1", "2"] },
  { id: "mod-2", nome: "Módulo 2: Língua Portuguesa", descricao: "Gramática e interpretação", concurso: "ENEM", disciplina: "Português", ordem: 2, questionsIds: ["3"] },
];

const DEFAULT_PACOTES: Pacote[] = [];

const DEFAULT_QUIZ: QuizData = {
  theme: "Questões de Concursos",
  concursos: DEFAULT_CONCURSOS,
  disciplinas: DEFAULT_DISCIPLINAS,
  modulos: DEFAULT_MODULOS,
  pacotes: DEFAULT_PACOTES,
  questions: EXTENSIVE_QUESTIONS
};

const STORAGE_KEY = "quiz-app-data-v2";

export const getQuizData = (): QuizData => {
  if (typeof window === "undefined") return DEFAULT_QUIZ;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const data = JSON.parse(stored);
      // Ensure backwards compatibility
      return {
        ...DEFAULT_QUIZ,
        ...data,
        concursos: data.concursos || DEFAULT_CONCURSOS,
        disciplinas: data.disciplinas || DEFAULT_DISCIPLINAS,
        modulos: data.modulos || DEFAULT_MODULOS,
        pacotes: data.pacotes || DEFAULT_PACOTES,
      };
    } catch {
      return DEFAULT_QUIZ;
    }
  }
  return DEFAULT_QUIZ;
};

export const saveQuizData = (data: QuizData): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Helper to get unique concursos from questions
export const getUniqueConcursos = (questions: Question[]): string[] => {
  const concursos = questions.map(q => q.concurso).filter(Boolean) as string[];
  return [...new Set(concursos)];
};

// Helper to get unique disciplinas from questions
export const getUniqueDisciplinas = (questions: Question[]): string[] => {
  const disciplinas = questions.map(q => q.disciplina).filter(Boolean) as string[];
  return [...new Set(disciplinas)];
};

// Helper to get unique modulos from questions
export const getUniqueModulos = (questions: Question[]): string[] => {
  const modulos = questions.map(q => q.modulo).filter(Boolean) as string[];
  return [...new Set(modulos)];
};

// Filter questions by criteria
export const filterQuestions = (
  questions: Question[],
  filters: { concurso?: string; disciplina?: string; ano?: number; modulo?: string }
): Question[] => {
  return questions.filter(q => {
    if (filters.concurso && q.concurso !== filters.concurso) return false;
    if (filters.disciplina && q.disciplina !== filters.disciplina) return false;
    if (filters.ano && q.ano !== filters.ano) return false;
    if (filters.modulo && q.modulo !== filters.modulo) return false;
    return true;
  });
};

// ============ Task 127-129: Custom Bancas and Órgãos Management ============

const CUSTOM_BANCAS_KEY = "custom_bancas";
const CUSTOM_ORGAOS_KEY = "custom_orgaos";

export interface CustomOption {
  id: string;
  nome: string;
  createdAt: string;
}

// Default bancas
const DEFAULT_BANCAS = [
  "CESPE/CEBRASPE",
  "FCC",
  "FGV",
  "VUNESP",
  "IBFC",
  "IDECAN",
  "ESAF",
  "INSTITUTO AOCP",
  "QUADRIX",
  "IADES",
  "FUNDEP",
  "CONSULPLAN",
  "FUMARC",
  "UFPR",
  "OBJETIVA"
];

// Default órgãos
const DEFAULT_ORGAOS = [
  "INSS",
  "INEP/MEC",
  "OAB",
  "Polícia Federal",
  "PRF",
  "TRF",
  "TRT",
  "TRE",
  "TCU",
  "CGU",
  "Receita Federal",
  "Banco do Brasil",
  "Caixa Econômica",
  "IBGE",
  "Correios",
  "BNDES",
  "Petrobrás"
];

// Get custom bancas from localStorage
export const getCustomBancas = (): CustomOption[] => {
  try {
    const stored = localStorage.getItem(CUSTOM_BANCAS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save custom bancas
const saveCustomBancas = (bancas: CustomOption[]) => {
  localStorage.setItem(CUSTOM_BANCAS_KEY, JSON.stringify(bancas));
};

// Add a new custom banca
export const addCustomBanca = (nome: string): CustomOption => {
  const bancas = getCustomBancas();
  const newBanca: CustomOption = {
    id: generateId(),
    nome: nome.trim(),
    createdAt: new Date().toISOString()
  };
  bancas.push(newBanca);
  saveCustomBancas(bancas);
  return newBanca;
};

// Remove a custom banca
export const removeCustomBanca = (id: string) => {
  const bancas = getCustomBancas().filter(b => b.id !== id);
  saveCustomBancas(bancas);
};

// Update a custom banca
export const updateCustomBanca = (id: string, nome: string) => {
  const bancas = getCustomBancas().map(b => 
    b.id === id ? { ...b, nome: nome.trim() } : b
  );
  saveCustomBancas(bancas);
};

// Get all bancas (default + custom)
export const getAllBancas = (): string[] => {
  const custom = getCustomBancas().map(b => b.nome);
  return [...DEFAULT_BANCAS, ...custom];
};

// Get custom órgãos from localStorage
export const getCustomOrgaos = (): CustomOption[] => {
  try {
    const stored = localStorage.getItem(CUSTOM_ORGAOS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save custom órgãos
const saveCustomOrgaos = (orgaos: CustomOption[]) => {
  localStorage.setItem(CUSTOM_ORGAOS_KEY, JSON.stringify(orgaos));
};

// Add a new custom órgão
export const addCustomOrgao = (nome: string): CustomOption => {
  const orgaos = getCustomOrgaos();
  const newOrgao: CustomOption = {
    id: generateId(),
    nome: nome.trim(),
    createdAt: new Date().toISOString()
  };
  orgaos.push(newOrgao);
  saveCustomOrgaos(orgaos);
  return newOrgao;
};

// Remove a custom órgão
export const removeCustomOrgao = (id: string) => {
  const orgaos = getCustomOrgaos().filter(o => o.id !== id);
  saveCustomOrgaos(orgaos);
};

// Update a custom órgão
export const updateCustomOrgao = (id: string, nome: string) => {
  const orgaos = getCustomOrgaos().map(o => 
    o.id === id ? { ...o, nome: nome.trim() } : o
  );
  saveCustomOrgaos(orgaos);
};

// Get all órgãos (default + custom)
export const getAllOrgaos = (): string[] => {
  const custom = getCustomOrgaos().map(o => o.nome);
  return [...DEFAULT_ORGAOS, ...custom];
};

// Count pacotes using a specific banca or órgão
export const countPacotesUsingBanca = (banca: string): number => {
  const data = getQuizData();
  return data.pacotes.filter(p => p.banca === banca).length;
};

export const countPacotesUsingOrgao = (orgao: string): number => {
  const data = getQuizData();
  return data.pacotes.filter(p => p.orgao === orgao).length;
};
