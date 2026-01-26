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
  plano?: 'free' | 'plus' | 'all'; // Controla quem vê a questão
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

export interface Area {
  id: string;
  nome: string;
  descricao?: string;
  icone?: string;
  carreiras: string[];
  materias: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Carreira {
  id: string;
  nome: string;
  areaId: string;
  cargos: string[];
  materiasEspecificas?: string[];
  descricao?: string;
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
  areaId?: string;
  carreiraId?: string;
  cargo?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string; // Data de expiração (30 dias)
  suspendedAt?: string; // Data de suspensão (+30 dias sem pagar)
  canceledAt?: string; // Data de cancelamento (+15 dias suspenso)
  status?: "active" | "suspended" | "canceled";
}

export interface QuizData {
  theme: string;
  questions: Question[];
  concursos: Concurso[];
  disciplinas: Disciplina[];
  modulos: Modulo[];
  pacotes: Pacote[];
  areas: Area[];
  carreiras: Carreira[];
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

// Dados iniciais de Áreas
const DEFAULT_AREAS: Area[] = [
  {
    id: "area-administrativa",
    nome: "Área Administrativa",
    descricao: "Carreiras voltadas para gestão, organização e suporte administrativo",
    icone: "📋",
    carreiras: ["carr-aux-adm", "carr-agente-adm", "carr-tec-adm", "carr-analista-adm"],
    materias: ["portugues", "matematica", "informatica", "administracao", "direito-administrativo", "direito-constitucional"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "area-educacao",
    nome: "Educação",
    descricao: "Carreiras voltadas para ensino e gestão educacional",
    icone: "📚",
    carreiras: ["carr-professor", "carr-pedagogo", "carr-orientador", "carr-supervisor"],
    materias: ["portugues", "legislacao", "etica"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "area-saude",
    nome: "Saúde",
    descricao: "Carreiras da área da saúde pública e privada",
    icone: "🏥",
    carreiras: ["carr-enfermeiro", "carr-tec-enfermagem", "carr-agente-saude", "carr-psicologo", "carr-assistente-social"],
    materias: ["portugues", "etica"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "area-seguranca",
    nome: "Segurança Pública",
    descricao: "Carreiras voltadas para segurança e ordem pública",
    icone: "🚔",
    carreiras: ["carr-policial-militar", "carr-policial-civil", "carr-guarda-municipal", "carr-policia-penal"],
    materias: ["portugues", "direito-penal", "direito-constitucional"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "area-juridica",
    nome: "Jurídica",
    descricao: "Carreiras voltadas para o direito e judiciário",
    icone: "⚖️",
    carreiras: ["carr-tec-judiciario", "carr-analista-judiciario", "carr-procurador", "carr-defensor"],
    materias: ["direito-constitucional", "direito-administrativo", "direito-civil", "direito-penal", "portugues"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "area-fiscal",
    nome: "Fiscal / Tributária",
    descricao: "Carreiras voltadas para fiscalização e tributação",
    icone: "💰",
    carreiras: ["carr-auditor-fiscal", "carr-fiscal-tributos", "carr-analista-tributario"],
    materias: ["direito-tributario", "contabilidade", "administracao", "direito-constitucional", "direito-administrativo"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "area-ti",
    nome: "Tecnologia da Informação",
    descricao: "Carreiras voltadas para TI e tecnologia",
    icone: "💻",
    carreiras: ["carr-analista-sistemas", "carr-analista-ti", "carr-tec-informatica"],
    materias: ["informatica"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "area-controle",
    nome: "Controle / Gestão Pública",
    descricao: "Carreiras voltadas para controle e auditoria pública",
    icone: "🔍",
    carreiras: ["carr-auditor-controle", "carr-controlador", "carr-analista-gestao"],
    materias: ["administracao", "direito-administrativo", "direito-constitucional", "contabilidade"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "area-bancaria",
    nome: "Bancária",
    descricao: "Carreiras voltadas para instituições bancárias",
    icone: "🏦",
    carreiras: ["carr-tec-bancario", "carr-analista-bancario"],
    materias: ["portugues", "matematica", "informatica", "atualidades"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "area-tecnica",
    nome: "Técnica / Engenharia",
    descricao: "Carreiras técnicas e de engenharia",
    icone: "🏗️",
    carreiras: ["carr-engenheiro", "carr-arquiteto", "carr-tec-edificacoes"],
    materias: ["administracao", "direito-administrativo"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Dados iniciais de Carreiras
const DEFAULT_CARREIRAS: Carreira[] = [
  { id: "carr-aux-adm", nome: "Auxiliar Administrativo", areaId: "area-administrativa", cargos: ["Auxiliar Administrativo"] },
  { id: "carr-agente-adm", nome: "Agente Administrativo", areaId: "area-administrativa", cargos: ["Agente Administrativo"] },
  { id: "carr-tec-adm", nome: "Técnico Administrativo", areaId: "area-administrativa", cargos: ["Técnico Administrativo"] },
  { id: "carr-analista-adm", nome: "Analista Administrativo", areaId: "area-administrativa", cargos: ["Analista Administrativo"] },
  
  { id: "carr-professor", nome: "Professor", areaId: "area-educacao", cargos: ["Professor", "Professor I", "Professor II"] },
  { id: "carr-pedagogo", nome: "Pedagogo", areaId: "area-educacao", cargos: ["Pedagogo"] },
  { id: "carr-orientador", nome: "Orientador Educacional", areaId: "area-educacao", cargos: ["Orientador Educacional"] },
  { id: "carr-supervisor", nome: "Supervisor Escolar", areaId: "area-educacao", cargos: ["Supervisor Escolar"] },
  
  { id: "carr-enfermeiro", nome: "Enfermeiro", areaId: "area-saude", cargos: ["Enfermeiro"] },
  { id: "carr-tec-enfermagem", nome: "Técnico de Enfermagem", areaId: "area-saude", cargos: ["Técnico de Enfermagem"] },
  { id: "carr-agente-saude", nome: "Agente de Saúde", areaId: "area-saude", cargos: ["Agente Comunitário de Saúde", "Agente de Saúde"] },
  { id: "carr-psicologo", nome: "Psicólogo", areaId: "area-saude", cargos: ["Psicólogo"] },
  { id: "carr-assistente-social", nome: "Assistente Social", areaId: "area-saude", cargos: ["Assistente Social"] },
  
  { id: "carr-policial-militar", nome: "Policial Militar", areaId: "area-seguranca", cargos: ["Soldado PM", "Cabo PM", "Sargento PM"] },
  { id: "carr-policial-civil", nome: "Policial Civil", areaId: "area-seguranca", cargos: ["Investigador", "Escrivão", "Delegado"] },
  { id: "carr-guarda-municipal", nome: "Guarda Municipal", areaId: "area-seguranca", cargos: ["Guarda Civil Municipal"] },
  { id: "carr-policia-penal", nome: "Polícia Penal", areaId: "area-seguranca", cargos: ["Agente Penitenciário"] },
  
  { id: "carr-tec-judiciario", nome: "Técnico Judiciário", areaId: "area-juridica", cargos: ["Técnico Judiciário"] },
  { id: "carr-analista-judiciario", nome: "Analista Judiciário", areaId: "area-juridica", cargos: ["Analista Judiciário"] },
  { id: "carr-procurador", nome: "Procurador", areaId: "area-juridica", cargos: ["Procurador Municipal", "Procurador Estadual", "Procurador Federal"] },
  { id: "carr-defensor", nome: "Defensor", areaId: "area-juridica", cargos: ["Defensor Público"] },
  
  { id: "carr-auditor-fiscal", nome: "Auditor Fiscal", areaId: "area-fiscal", cargos: ["Auditor Fiscal", "Auditor Fiscal da Receita"] },
  { id: "carr-fiscal-tributos", nome: "Fiscal de Tributos", areaId: "area-fiscal", cargos: ["Fiscal de Tributos"] },
  { id: "carr-analista-tributario", nome: "Analista Tributário", areaId: "area-fiscal", cargos: ["Analista Tributário"] },
  
  { id: "carr-analista-sistemas", nome: "Analista de Sistemas", areaId: "area-ti", cargos: ["Analista de Sistemas"] },
  { id: "carr-analista-ti", nome: "Analista de TI", areaId: "area-ti", cargos: ["Analista de TI", "Analista de Suporte"] },
  { id: "carr-tec-informatica", nome: "Técnico em Informática", areaId: "area-ti", cargos: ["Técnico em Informática"] },
  
  { id: "carr-auditor-controle", nome: "Auditor de Controle Interno", areaId: "area-controle", cargos: ["Auditor de Controle Interno"] },
  { id: "carr-controlador", nome: "Controlador", areaId: "area-controle", cargos: ["Controlador Interno"] },
  { id: "carr-analista-gestao", nome: "Analista de Gestão", areaId: "area-controle", cargos: ["Analista de Gestão Pública"] },
  
  { id: "carr-tec-bancario", nome: "Técnico Bancário", areaId: "area-bancaria", cargos: ["Escriturário", "Técnico Bancário"] },
  { id: "carr-analista-bancario", nome: "Analista Bancário", areaId: "area-bancaria", cargos: ["Analista Bancário"] },
  
  { id: "carr-engenheiro", nome: "Engenheiro", areaId: "area-tecnica", cargos: ["Engenheiro Civil", "Engenheiro Elétrico", "Engenheiro Mecânico"] },
  { id: "carr-arquiteto", nome: "Arquiteto", areaId: "area-tecnica", cargos: ["Arquiteto"] },
  { id: "carr-tec-edificacoes", nome: "Técnico em Edificações", areaId: "area-tecnica", cargos: ["Técnico em Edificações"] }
];

const DEFAULT_QUIZ: QuizData = {
  theme: "Questões de Concursos",
  concursos: DEFAULT_CONCURSOS,
  disciplinas: DEFAULT_DISCIPLINAS,
  modulos: DEFAULT_MODULOS,
  pacotes: DEFAULT_PACOTES,
  areas: DEFAULT_AREAS,
  carreiras: DEFAULT_CARREIRAS,
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
        areas: data.areas || DEFAULT_AREAS,
        carreiras: data.carreiras || DEFAULT_CARREIRAS,
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

// ============ Áreas e Carreiras Management ============

// Get all áreas
export const getAllAreas = (): Area[] => {
  const data = getQuizData();
  return data.areas || DEFAULT_AREAS;
};

// Get área by id
export const getAreaById = (id: string): Area | undefined => {
  const areas = getAllAreas();
  return areas.find(a => a.id === id);
};

// Get all carreiras
export const getAllCarreiras = (): Carreira[] => {
  const data = getQuizData();
  return data.carreiras || DEFAULT_CARREIRAS;
};

// Get carreiras by area
export const getCarreirasByArea = (areaId: string): Carreira[] => {
  const carreiras = getAllCarreiras();
  return carreiras.filter(c => c.areaId === areaId);
};

// Get carreira by id
export const getCarreiraById = (id: string): Carreira | undefined => {
  const carreiras = getAllCarreiras();
  return carreiras.find(c => c.id === id);
};

// Get matérias by area
export const getMateriasByArea = (areaId: string): Disciplina[] => {
  const area = getAreaById(areaId);
  if (!area) return [];
  
  const data = getQuizData();
  return data.disciplinas.filter(d => area.materias.includes(d.id));
};

// Add new área
export const addArea = (area: Omit<Area, 'id' | 'createdAt' | 'updatedAt'>): Area => {
  const data = getQuizData();
  const newArea: Area = {
    ...area,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  data.areas.push(newArea);
  saveQuizData(data);
  return newArea;
};

// Update área
export const updateArea = (id: string, updates: Partial<Omit<Area, 'id' | 'createdAt'>>): void => {
  const data = getQuizData();
  const index = data.areas.findIndex(a => a.id === id);
  if (index !== -1) {
    data.areas[index] = {
      ...data.areas[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveQuizData(data);
  }
};

// Delete área
export const deleteArea = (id: string): void => {
  const data = getQuizData();
  data.areas = data.areas.filter(a => a.id !== id);
  // Also remove related carreiras
  data.carreiras = data.carreiras.filter(c => c.areaId !== id);
  saveQuizData(data);
};

// Add new carreira
export const addCarreira = (carreira: Omit<Carreira, 'id'>): Carreira => {
  const data = getQuizData();
  const newCarreira: Carreira = {
    ...carreira,
    id: generateId()
  };
  data.carreiras.push(newCarreira);
  saveQuizData(data);
  return newCarreira;
};

// Update carreira
export const updateCarreira = (id: string, updates: Partial<Omit<Carreira, 'id'>>): void => {
  const data = getQuizData();
  const index = data.carreiras.findIndex(c => c.id === id);
  if (index !== -1) {
    data.carreiras[index] = {
      ...data.carreiras[index],
      ...updates
    };
    saveQuizData(data);
  }
};

// Delete carreira
export const deleteCarreira = (id: string): void => {
  const data = getQuizData();
  data.carreiras = data.carreiras.filter(c => c.id !== id);
  saveQuizData(data);
};
