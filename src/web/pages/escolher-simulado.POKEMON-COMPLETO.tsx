import { useState, useEffect } from "react";
import { AppLayout } from "../components/app-layout";
import { useLocation } from "wouter";
import { getAllAreas, getCarreirasByArea, getMateriasByArea, getQuizData, saveQuizData } from "../lib/quiz-store";
import { useAuth } from "../lib/auth-context-supabase";
import { getUserPlan, isSuperAdmin } from "../lib/access-control";
import { getQuestoesFromSupabase } from "../lib/supabase-questoes";

// Storage key para questões editáveis
const QUESTOES_STORAGE_KEY = "questoes_por_area_v1";

// Questões padrão organizadas por Área e Matéria
const QUESTOES_PADRAO: Record<string, Record<string, any[]>> = {
  "area-administrativa": {
    "portugues": [
      { id: "adm-port-1", title: "Concordância Verbal", options: ["O sujeito concorda com o verbo em número e pessoa", "O verbo sempre fica no singular", "A concordância é opcional", "Não existe regra"], correctAnswer: 0, explanation: "A concordância verbal é a relação entre o sujeito e o verbo, que devem concordar em número e pessoa." },
      { id: "adm-port-2", title: "Regência Verbal", options: ["Assistir ao filme (sentido de ver)", "Assistir o filme", "Assistir no filme", "Assistir pelo filme"], correctAnswer: 0, explanation: "O verbo assistir no sentido de ver exige a preposição 'a'." },
      { id: "adm-port-3", title: "Crase", options: ["Fui à escola", "Fui a escola", "Fui há escola", "Fui na escola"], correctAnswer: 0, explanation: "Usa-se crase antes de palavras femininas quando há fusão da preposição 'a' com o artigo 'a'." },
    ],
    "matematica": [
      { id: "adm-mat-1", title: "Porcentagem", options: ["20% de 150 = 30", "20% de 150 = 20", "20% de 150 = 50", "20% de 150 = 15"], correctAnswer: 0, explanation: "20% de 150 = 0,20 × 150 = 30" },
      { id: "adm-mat-2", title: "Regra de Três", options: ["Se 5 custa 10, então 15 custa 30", "Se 5 custa 10, então 15 custa 20", "Se 5 custa 10, então 15 custa 45", "Se 5 custa 10, então 15 custa 25"], correctAnswer: 0, explanation: "Regra de três simples: 5/15 = 10/x, logo x = 30" },
      { id: "adm-mat-3", title: "Equação do 1º Grau", options: ["2x + 4 = 10, x = 3", "2x + 4 = 10, x = 4", "2x + 4 = 10, x = 2", "2x + 4 = 10, x = 5"], correctAnswer: 0, explanation: "2x + 4 = 10 → 2x = 6 → x = 3" },
    ],
    "informatica": [
      { id: "adm-inf-1", title: "Microsoft Word", options: ["Ctrl+S salva o documento", "Ctrl+S abre novo documento", "Ctrl+S fecha o programa", "Ctrl+S imprime"], correctAnswer: 0, explanation: "Ctrl+S é o atalho universal para salvar documentos." },
      { id: "adm-inf-2", title: "Excel - Fórmulas", options: ["=SOMA(A1:A10) soma valores", "=SOMA(A1:A10) multiplica valores", "=SOMA(A1:A10) divide valores", "=SOMA(A1:A10) subtrai valores"], correctAnswer: 0, explanation: "A função SOMA() adiciona os valores do intervalo especificado." },
    ],
    "administracao": [
      { id: "adm-adm-1", title: "Funções Administrativas", options: ["Planejar, Organizar, Dirigir e Controlar", "Apenas Planejar e Controlar", "Somente Organizar", "Dirigir e Avaliar"], correctAnswer: 0, explanation: "PODC são as quatro funções básicas da administração segundo Fayol." },
      { id: "adm-adm-2", title: "Princípios da Administração Pública", options: ["LIMPE: Legalidade, Impessoalidade, Moralidade, Publicidade, Eficiência", "Apenas Legalidade", "Somente Eficiência", "Moralidade e Publicidade"], correctAnswer: 0, explanation: "Os princípios constitucionais da administração pública estão no Art. 37 da CF." },
    ],
    "direito-administrativo": [
      { id: "adm-da-1", title: "Atos Administrativos", options: ["Presunção de legitimidade é característica", "Atos são sempre ilegais", "Não possuem atributos", "São revogáveis pelo Judiciário"], correctAnswer: 0, explanation: "Os atos administrativos gozam de presunção de legitimidade e veracidade." },
      { id: "adm-da-2", title: "Licitação", options: ["É obrigatória para contratos públicos", "É opcional para a administração", "Não existe na lei brasileira", "Somente para obras"], correctAnswer: 0, explanation: "A licitação é regra constitucional para contratações públicas (Art. 37, XXI, CF)." },
    ],
    "direito-constitucional": [
      { id: "adm-dc-1", title: "Direitos Fundamentais", options: ["São cláusulas pétreas", "Podem ser abolidos por emenda", "Não estão na Constituição", "São apenas 5 direitos"], correctAnswer: 0, explanation: "Os direitos e garantias individuais são cláusulas pétreas (Art. 60, §4º, CF)." },
    ],
  },
  "area-educacao": {
    "portugues": [
      { id: "edu-port-1", title: "Interpretação de Texto", options: ["Identificar a ideia central é fundamental", "Ignorar o contexto", "Ler apenas o título", "Pular parágrafos"], correctAnswer: 0, explanation: "A interpretação correta exige identificar a ideia central e o contexto." },
      { id: "edu-port-2", title: "Coesão Textual", options: ["Conectivos ligam ideias no texto", "Pontuação é irrelevante", "Repetição é sempre boa", "Não existe coesão"], correctAnswer: 0, explanation: "Coesão é a ligação entre as partes do texto através de conectivos e referências." },
    ],
    "legislacao": [
      { id: "edu-leg-1", title: "LDB - Lei 9.394/96", options: ["Estabelece as diretrizes da educação nacional", "Trata apenas de ensino superior", "Foi revogada em 2000", "Não existe mais"], correctAnswer: 0, explanation: "A LDB é a lei que organiza a educação brasileira em todos os níveis." },
      { id: "edu-leg-2", title: "ECA - Estatuto da Criança", options: ["Garante direitos de crianças e adolescentes", "Aplica-se apenas a adultos", "Foi criado em 2020", "Não trata de educação"], correctAnswer: 0, explanation: "O ECA (Lei 8.069/90) protege os direitos de crianças e adolescentes." },
      { id: "edu-leg-3", title: "BNCC", options: ["Define aprendizagens essenciais", "É opcional para escolas", "Não existe mais", "Aplica-se só ao ensino médio"], correctAnswer: 0, explanation: "A BNCC estabelece as aprendizagens essenciais para toda a educação básica." },
    ],
    "etica": [
      { id: "edu-eti-1", title: "Ética Profissional Docente", options: ["Respeitar a diversidade é fundamental", "Discriminar alunos é permitido", "Favorecer alguns estudantes", "Ignorar necessidades especiais"], correctAnswer: 0, explanation: "O professor deve respeitar a diversidade e tratar todos com equidade." },
    ],
  },
  "area-saude": {
    "portugues": [
      { id: "sau-port-1", title: "Comunicação em Saúde", options: ["Clareza é essencial na comunicação com pacientes", "Usar termos técnicos sempre", "Ignorar dúvidas do paciente", "Falar rapidamente"], correctAnswer: 0, explanation: "A comunicação clara melhora a relação profissional-paciente e os resultados." },
    ],
    "etica": [
      { id: "sau-eti-1", title: "Sigilo Profissional", options: ["Informações do paciente são confidenciais", "Pode compartilhar dados livremente", "Sigilo é opcional", "Redes sociais podem ter dados"], correctAnswer: 0, explanation: "O sigilo profissional é um dever ético de todos os profissionais de saúde." },
      { id: "sau-eti-2", title: "Princípios do SUS", options: ["Universalidade, Integralidade, Equidade", "Apenas Universalidade", "Somente para pobres", "É sistema privado"], correctAnswer: 0, explanation: "Os princípios doutrinários do SUS garantem saúde para todos de forma integral." },
      { id: "sau-eti-3", title: "Lei 8.080/90", options: ["Dispõe sobre organização do SUS", "Criou planos de saúde", "Extinguiu o SUS", "Trata de educação"], correctAnswer: 0, explanation: "A Lei 8.080/90 é a Lei Orgânica da Saúde que regulamenta o SUS." },
    ],
  },
  "area-seguranca": {
    "portugues": [
      { id: "seg-port-1", title: "Redação Oficial", options: ["Impessoalidade é característica", "Usar gírias é permitido", "Informalidade total", "Sem padrão definido"], correctAnswer: 0, explanation: "A redação oficial deve ser impessoal, clara e objetiva." },
    ],
    "direito-penal": [
      { id: "seg-dp-1", title: "Princípio da Legalidade", options: ["Não há crime sem lei anterior que o defina", "Crimes podem ser criados por decreto", "Analogia sempre é permitida", "Costumes definem crimes"], correctAnswer: 0, explanation: "Art. 1º do CP: Não há crime sem lei anterior que o defina (nullum crimen sine lege)." },
      { id: "seg-dp-2", title: "Excludentes de Ilicitude", options: ["Legítima defesa exclui o crime", "Toda violência é crime", "Não existem excludentes", "Estado de necessidade é crime"], correctAnswer: 0, explanation: "Legítima defesa, estado de necessidade, estrito cumprimento do dever legal e exercício regular de direito excluem a ilicitude." },
      { id: "seg-dp-3", title: "Tipos de Pena", options: ["Privativas de liberdade, restritivas de direitos e multa", "Apenas prisão perpétua", "Somente multa", "Pena de morte"], correctAnswer: 0, explanation: "O CP brasileiro prevê penas privativas de liberdade, restritivas de direitos e multa." },
    ],
    "direito-constitucional": [
      { id: "seg-dc-1", title: "Segurança Pública", options: ["É dever do Estado e responsabilidade de todos", "É apenas dever do cidadão", "Não está na Constituição", "É privatizada"], correctAnswer: 0, explanation: "Art. 144 da CF: A segurança pública é dever do Estado e responsabilidade de todos." },
    ],
  },
  "area-juridica": {
    "direito-constitucional": [
      { id: "jur-dc-1", title: "Controle de Constitucionalidade", options: ["STF é o guardião da Constituição", "Qualquer juiz pode declarar inconstitucional com efeitos gerais", "Não existe no Brasil", "Apenas o Congresso controla"], correctAnswer: 0, explanation: "O STF é o órgão máximo de controle de constitucionalidade (Art. 102, CF)." },
      { id: "jur-dc-2", title: "Poder Constituinte", options: ["Originário é ilimitado e incondicionado", "Derivado é ilimitado", "Não existe hierarquia", "Todos são iguais"], correctAnswer: 0, explanation: "O poder constituinte originário cria nova constituição sem limitações jurídicas." },
    ],
    "direito-administrativo": [
      { id: "jur-da-1", title: "Responsabilidade Civil do Estado", options: ["É objetiva, independe de culpa", "Sempre subjetiva", "Estado nunca responde", "Apenas por dolo"], correctAnswer: 0, explanation: "Art. 37, §6º, CF: responsabilidade objetiva do Estado pelos danos causados por seus agentes." },
    ],
    "direito-civil": [
      { id: "jur-dciv-1", title: "Capacidade Civil", options: ["Plena aos 18 anos", "Plena aos 21 anos", "Nunca se adquire", "Aos 16 anos"], correctAnswer: 0, explanation: "Art. 5º do CC: A menoridade cessa aos 18 anos completos." },
      { id: "jur-dciv-2", title: "Contratos", options: ["Exigem agente capaz, objeto lícito e forma prescrita", "Qualquer acordo é válido", "Não precisam de objeto", "Forma é irrelevante"], correctAnswer: 0, explanation: "Art. 104 do CC estabelece os requisitos de validade do negócio jurídico." },
    ],
    "direito-penal": [
      { id: "jur-dp-1", title: "Teoria do Crime", options: ["Crime é fato típico, ilícito e culpável", "Crime é qualquer ato", "Não existe teoria", "Apenas fato típico"], correctAnswer: 0, explanation: "A teoria tripartite define crime como fato típico, antijurídico e culpável." },
    ],
    "portugues": [
      { id: "jur-port-1", title: "Linguagem Jurídica", options: ["Precisão técnica é fundamental", "Usar linguagem coloquial", "Evitar termos técnicos", "Sem padrão"], correctAnswer: 0, explanation: "A linguagem jurídica exige precisão técnica e clareza." },
    ],
  },
  "area-fiscal": {
    "direito-tributario": [
      { id: "fis-dt-1", title: "Espécies Tributárias", options: ["Impostos, taxas, contribuições de melhoria, empréstimos compulsórios e contribuições especiais", "Apenas impostos", "Somente taxas", "Não existem espécies"], correctAnswer: 0, explanation: "São 5 espécies tributárias segundo a teoria pentapartite adotada pelo STF." },
      { id: "fis-dt-2", title: "Princípio da Legalidade Tributária", options: ["Tributo só pode ser criado por lei", "Decreto pode criar tributo", "Portaria institui impostos", "Não há regra"], correctAnswer: 0, explanation: "Art. 150, I, CF: é vedado exigir tributo sem lei que o estabeleça." },
      { id: "fis-dt-3", title: "Competência Tributária", options: ["É indelegável", "Pode ser transferida", "É opcional", "Não existe"], correctAnswer: 0, explanation: "A competência tributária é privativa e indelegável." },
    ],
    "contabilidade": [
      { id: "fis-cont-1", title: "Princípios Contábeis", options: ["Entidade separa patrimônio pessoal do empresarial", "Tudo se mistura", "Não existem princípios", "Apenas lucro importa"], correctAnswer: 0, explanation: "O princípio da entidade distingue o patrimônio da empresa do patrimônio dos sócios." },
      { id: "fis-cont-2", title: "Balanço Patrimonial", options: ["Ativo = Passivo + Patrimônio Líquido", "Ativo = Passivo", "Não há equação", "PL = Ativo"], correctAnswer: 0, explanation: "A equação fundamental da contabilidade: Ativo = Passivo + PL." },
    ],
    "administracao": [
      { id: "fis-adm-1", title: "AFO - Princípios Orçamentários", options: ["Anualidade, universalidade, unidade", "Apenas anualidade", "Não existem princípios", "Somente unidade"], correctAnswer: 0, explanation: "Os princípios orçamentários orientam a elaboração e execução do orçamento público." },
    ],
  },
  "area-ti": {
    "informatica": [
      { id: "ti-inf-1", title: "Lógica de Programação", options: ["Algoritmo é sequência de passos para resolver problema", "Código sem lógica funciona", "Algoritmo é linguagem", "Não existe lógica"], correctAnswer: 0, explanation: "Algoritmo é uma sequência finita de instruções para resolver um problema." },
      { id: "ti-inf-2", title: "Banco de Dados", options: ["SQL é linguagem de consulta estruturada", "SQL é linguagem de programação", "Banco não usa SQL", "SQL é sistema operacional"], correctAnswer: 0, explanation: "SQL (Structured Query Language) é usada para manipular bancos de dados relacionais." },
      { id: "ti-inf-3", title: "Redes de Computadores", options: ["TCP/IP é protocolo da internet", "TCP/IP é hardware", "Não existe protocolo", "TCP/IP é software apenas"], correctAnswer: 0, explanation: "TCP/IP é o conjunto de protocolos que permite a comunicação na internet." },
      { id: "ti-inf-4", title: "Segurança da Informação", options: ["Confidencialidade, Integridade e Disponibilidade", "Apenas senhas", "Não existe segurança", "Somente antivírus"], correctAnswer: 0, explanation: "A tríade CIA (Confidentiality, Integrity, Availability) são os pilares da segurança." },
      { id: "ti-inf-5", title: "Sistemas Operacionais", options: ["Gerencia recursos de hardware e software", "Apenas abre programas", "Não faz nada", "É um aplicativo"], correctAnswer: 0, explanation: "O SO gerencia memória, processos, arquivos e dispositivos." },
    ],
  },
  "area-controle": {
    "administracao": [
      { id: "con-adm-1", title: "Controle Interno", options: ["Visa assegurar eficiência e conformidade", "É opcional", "Não existe no setor público", "Apenas para empresas"], correctAnswer: 0, explanation: "O controle interno é obrigatório na administração pública (Art. 74, CF)." },
      { id: "con-adm-2", title: "Auditoria Governamental", options: ["Verifica legalidade e economicidade", "Apenas conta dinheiro", "Não existe no Brasil", "É sigilosa sempre"], correctAnswer: 0, explanation: "A auditoria governamental avalia a gestão pública em diversos aspectos." },
    ],
    "direito-administrativo": [
      { id: "con-da-1", title: "Controle Externo", options: ["Exercido pelo Poder Legislativo com auxílio do TC", "Não existe", "Apenas interno", "Feito pelo Executivo"], correctAnswer: 0, explanation: "Art. 71, CF: O controle externo é exercido pelo Congresso com auxílio do TCU." },
    ],
    "contabilidade": [
      { id: "con-cont-1", title: "Contabilidade Pública", options: ["Segue normas específicas (NBCASP)", "Igual à privada", "Não existe", "Sem normas"], correctAnswer: 0, explanation: "A contabilidade pública tem normas próprias editadas pelo CFC." },
    ],
  },
  "area-bancaria": {
    "portugues": [
      { id: "ban-port-1", title: "Comunicação Empresarial", options: ["Clareza e objetividade são essenciais", "Usar jargões sempre", "Textos longos são melhores", "Informalidade total"], correctAnswer: 0, explanation: "A comunicação bancária deve ser clara, objetiva e profissional." },
    ],
    "matematica": [
      { id: "ban-mat-1", title: "Juros Simples", options: ["J = C × i × t", "J = C + i + t", "J = C / i / t", "J = C - i - t"], correctAnswer: 0, explanation: "Juros simples: J = Capital × taxa × tempo." },
      { id: "ban-mat-2", title: "Juros Compostos", options: ["M = C × (1 + i)^t", "M = C + i + t", "M = C × i × t", "M = C / i"], correctAnswer: 0, explanation: "Montante em juros compostos considera juros sobre juros." },
    ],
    "informatica": [
      { id: "ban-inf-1", title: "Segurança Bancária Digital", options: ["Token e autenticação de dois fatores protegem", "Senha simples basta", "Não precisa proteção", "Compartilhar senha é ok"], correctAnswer: 0, explanation: "Autenticação em dois fatores aumenta significativamente a segurança." },
    ],
    "atualidades": [
      { id: "ban-atu-1", title: "Sistema Financeiro Nacional", options: ["Banco Central regula o sistema", "Não há regulação", "Bancos se auto regulam", "Governo não participa"], correctAnswer: 0, explanation: "O BACEN é responsável por regular e fiscalizar o sistema financeiro." },
    ],
  },
  "area-tecnica": {
    "administracao": [
      { id: "tec-adm-1", title: "Gestão de Projetos", options: ["Planejamento, execução, monitoramento e encerramento", "Apenas execução", "Não precisa planejar", "Sem fases definidas"], correctAnswer: 0, explanation: "As fases do gerenciamento de projetos segundo o PMBOK." },
    ],
    "direito-administrativo": [
      { id: "tec-da-1", title: "Obras Públicas", options: ["Exigem licitação prévia", "Dispensa sempre", "Não há regras", "Contratação livre"], correctAnswer: 0, explanation: "Obras públicas devem seguir processo licitatório conforme Lei 14.133/21." },
    ],
  },
};

// Função para carregar questões (localStorage ou padrão)
export const getQuestoesPorArea = async (): Promise<Record<string, Record<string, any[]>>> => {
  try {
    // 🔥 Buscar do Supabase SEMPRE
    const questoesSupabase = await getQuestoesFromSupabase();
    
    if (Object.keys(questoesSupabase).length > 0) {
      return questoesSupabase;
    }
    
    // Fallback: localStorage
    const stored = localStorage.getItem(QUESTOES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Erro getQuestoesPorArea:', e);
  }
  return QUESTOES_PADRAO;
};

// Função para salvar questões (usado pelo admin)
export const saveQuestoesPorArea = (questoes: Record<string, Record<string, any[]>>) => {
  localStorage.setItem(QUESTOES_STORAGE_KEY, JSON.stringify(questoes));
};

export default function EscolherSimulado() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"area" | "carreira" | "materia">("area");
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [selectedCarreiraId, setSelectedCarreiraId] = useState<string>("");
  const [questoesSupabase, setQuestoesSupabase] = useState<Record<string, Record<string, any[]>>>({});
  const [isLoading, setIsLoading] = useState(true);

  const userId = user?.email || user?.username || "";
  const userPlan = getUserPlan(userId) || "free";
  const isAdmin = isSuperAdmin(user?.email) || isSuperAdmin(user?.username);
  const isPlusUser = userPlan === 'plus' || isAdmin;

  const areas = getAllAreas();
  const carreiras = selectedAreaId ? getCarreirasByArea(selectedAreaId) : [];
  const materias = selectedAreaId ? getMateriasByArea(selectedAreaId) : [];
  
  const selectedArea = areas.find(a => a.id === selectedAreaId);
  const selectedCarreira = carreiras.find(c => c.id === selectedCarreiraId);

  // Calcular dias desde cadastro para liberação gradual
  const getUserDaysSinceCadastro = () => {
    try {
      const cadastro = localStorage.getItem(`user_cadastro_${userId}`);
      if (!cadastro) {
        // Se não existe, criar registro de cadastro
        localStorage.setItem(`user_cadastro_${userId}`, new Date().toISOString());
        return 0;
      }
      const diffMs = Date.now() - new Date(cadastro).getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return 0;
    }
  };
  
  const daysSinceCadastro = getUserDaysSinceCadastro();
  
  // Matérias liberadas gradualmente (apenas 2 bloqueadas por 7 dias)
  const MATERIAS_7_DIAS = ["direito-tributario", "contabilidade"];
  const isMateriaLocked = (materiaId: string) => {
    if (isPlusUser) return false; // Plus vê tudo
    if (MATERIAS_7_DIAS.includes(materiaId)) {
      return daysSinceCadastro < 7; // Bloqueia se < 7 dias
    }
    return false; // TODAS outras matérias liberadas
  };

  // Carregar questões do Supabase ao montar
  useEffect(() => {
    const loadQuestoes = async () => {
      setIsLoading(true);
      try {
        const supabase = await getQuestoesFromSupabase();
        if (Object.keys(supabase).length > 0) {
          setQuestoesSupabase(supabase);
        } else {
          // Fallback para questões locais
          const local = await getQuestoesPorArea();
          setQuestoesSupabase(local);
        }
      } catch (e) {
        console.error('Erro ao carregar questões:', e);
        const local = await getQuestoesPorArea();
        setQuestoesSupabase(local);
      } finally {
        setIsLoading(false);
      }
    };
    loadQuestoes();
  }, []);

  const QUESTOES_POR_AREA = questoesSupabase;

  const handleAreaSelect = (areaId: string) => {
    setSelectedAreaId(areaId);
    setStep("carreira");
  };

  const handleCarreiraSelect = (carreiraId: string) => {
    setSelectedCarreiraId(carreiraId);
    setStep("materia");
  };

  const handleMateriaSelect = (materiaId: string) => {
    // 🔥 Buscar do Supabase
    console.log('🔍 selectedAreaId:', selectedAreaId);
    console.log('🔍 materiaId:', materiaId);
    console.log('🔍 questoesSupabase:', Object.keys(questoesSupabase));
    
    const areaQuestoes = questoesSupabase[selectedAreaId] || {};
    console.log('🔍 areaQuestoes keys:', Object.keys(areaQuestoes));
    
    const questoes = areaQuestoes[materiaId] || [];
    console.log('🔍 Questões encontradas:', questoes.length);
    
    const materia = materias.find(m => m.id === materiaId);
    
    if (questoes.length === 0) {
      alert(`Nenhuma questão encontrada.\n\nÁrea: ${selectedAreaId}\nMatéria: ${materiaId}\n\nImporte questões no Admin primeiro!`);
      return;
    }
    
    localStorage.setItem('simulado_atual', JSON.stringify({
      area: selectedArea?.nome,
      areaId: selectedAreaId,
      carreira: selectedCarreira?.nome,
      carreiraId: selectedCarreiraId,
      materia: materia?.nome,
      materiaId: materiaId,
      questoes: questoes
    }));

    setLocation("/simulado");
  };

  const goBack = () => {
    if (step === "materia") {
      setStep("carreira");
    } else if (step === "carreira") {
      setStep("area");
      setSelectedCarreiraId("");
      setSelectedAreaId("");
    }
  };

  const icons: Record<string, string> = {
    "portugues": "📖", "matematica": "🔢", "informatica": "💻", "administracao": "📊",
    "direito-administrativo": "🏛️", "direito-constitucional": "⚖️", "direito-penal": "🔒",
    "direito-civil": "📜", "direito-tributario": "💰", "legislacao": "📋", "etica": "🤝",
    "contabilidade": "📒", "atualidades": "🌍", "raciocinio-logico": "🧠"
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#070b14] relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-gradient-to-r from-orange-500/30 to-red-500/20 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-gradient-to-r from-amber-500/25 to-yellow-500/20 rounded-full blur-[130px] animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-float"
              style={{
                width: `${4 + Math.random() * 8}px`,
                height: `${4 + Math.random() * 8}px`,
                background: `rgba(${200 + Math.random() * 55}, ${100 + Math.random() * 100}, 50, ${0.2 + Math.random() * 0.3})`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${8 + Math.random() * 12}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            
            {/* STEP 1: ÁREA */}
            {step === "area" && (
              <div className="animate-fade-in">
                {/* MEGA Hero Header */}
                <div className="text-center mb-16">
                  <div className="inline-block mb-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 rounded-full blur-2xl opacity-60 animate-pulse scale-150" />
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full blur-xl opacity-40 animate-pulse scale-125" style={{ animationDelay: "0.5s" }} />
                      <div className="relative w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-orange-500 via-red-500 to-amber-500 rounded-full flex items-center justify-center text-6xl md:text-7xl shadow-2xl shadow-orange-500/50 border-4 border-white/20">
                        🎯
                      </div>
                    </div>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-orange-400 via-red-400 to-amber-400 bg-clip-text text-transparent drop-shadow-lg">
                    Escolha sua Área
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                    Selecione a área do concurso que você está estudando para começar sua jornada de preparação
                  </p>
                  
                  {/* Progress Bar Grande */}
                  <div className="flex items-center justify-center gap-3 mt-10">
                    <div className="w-20 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg shadow-orange-500/50" />
                    <div className="w-20 h-3 bg-white/10 rounded-full" />
                    <div className="w-20 h-3 bg-white/10 rounded-full" />
                  </div>
                  <p className="text-sm text-gray-500 mt-3">Passo 1 de 3</p>
                </div>

                {/* Areas Grid - Cards GIGANTES */}
                <div className="grid grid-cols-1 gap-6 md:gap-8">
                  {areas.map((area, index) => (
                    <button
                      key={area.id}
                      onClick={() => handleAreaSelect(area.id)}
                      className="group relative rounded-[2rem] p-6 md:p-10 border-2 border-white/10 hover:border-orange-500 transition-all duration-700 hover:scale-[1.03] text-left overflow-hidden bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Hover gradient effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-red-500/0 to-amber-500/0 group-hover:from-orange-500/20 group-hover:via-red-500/10 group-hover:to-amber-500/20 transition-all duration-700 rounded-[2rem]" />
                      
                      {/* Glow effect */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-[2rem] opacity-0 group-hover:opacity-30 blur-xl transition-all duration-700" />
                      
                      <div className="relative flex flex-col md:flex-row items-start gap-4 md:gap-8">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-all duration-500" />
                          <div className="relative text-6xl md:text-8xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 drop-shadow-2xl">
                            {area.icone}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-black text-white text-2xl md:text-4xl mb-2 md:mb-3 group-hover:text-orange-400 transition-colors duration-300">
                            {area.nome}
                          </h3>
                          <p className="text-gray-400 text-base md:text-lg mb-4 md:mb-6 leading-relaxed">{area.descricao}</p>
                          <div className="flex flex-wrap gap-3 md:gap-4">
                            <span className="px-3 py-2 md:px-5 md:py-2.5 bg-gradient-to-r from-orange-500/30 to-red-500/30 text-orange-300 rounded-xl font-bold text-sm md:text-lg border border-orange-500/30">
                              {area.carreiras.length} carreiras
                            </span>
                            <span className="px-3 py-2 md:px-5 md:py-2.5 bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-amber-300 rounded-xl font-bold text-sm md:text-lg border border-amber-500/30">
                              {area.materias.length} matérias
                            </span>
                          </div>
                        </div>
                        <div className="hidden md:flex items-center">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-amber-500 transition-all duration-500">
                            <svg className="w-8 h-8 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: CARREIRA */}
            {step === "carreira" && (
              <div className="animate-fade-in">
                {/* Back Button Grande */}
                <button
                  onClick={goBack}
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-all mb-10 group px-6 py-3 rounded-xl hover:bg-white/5"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-all">
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                  <span className="text-lg font-medium">Voltar para Áreas</span>
                </button>

                {/* Hero Header */}
                <div className="text-center mb-16">
                  <div className="inline-flex items-center gap-4 mb-8 px-8 py-4 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-amber-500/20 border-2 border-orange-500/40 rounded-full shadow-xl shadow-orange-500/20">
                    <span className="text-5xl">{selectedArea?.icone}</span>
                    <span className="text-2xl font-black text-orange-400">{selectedArea?.nome}</span>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-orange-400 via-red-400 to-amber-400 bg-clip-text text-transparent">
                    Escolha sua Carreira
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
                    Selecione o cargo que você deseja conquistar
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="flex items-center justify-center gap-3 mt-10">
                    <div className="w-20 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
                    <div className="w-20 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg shadow-orange-500/50" />
                    <div className="w-20 h-3 bg-white/10 rounded-full" />
                  </div>
                  <p className="text-sm text-gray-500 mt-3">Passo 2 de 3</p>
                </div>

                {/* Carreiras Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {carreiras.map((carreira, index) => (
                    <button
                      key={carreira.id}
                      onClick={() => handleCarreiraSelect(carreira.id)}
                      className="group relative rounded-[2rem] p-10 border-2 border-white/10 hover:border-orange-500 transition-all duration-700 hover:scale-[1.03] text-left overflow-hidden bg-gradient-to-br from-white/5 to-white/0"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-amber-500/0 group-hover:from-orange-500/20 group-hover:to-amber-500/20 transition-all duration-700 rounded-[2rem]" />
                      <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-[2rem] opacity-0 group-hover:opacity-30 blur-xl transition-all duration-700" />
                      
                      <div className="relative">
                        <div className="flex items-center gap-6 mb-6">
                          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-4xl shadow-xl shadow-orange-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            💼
                          </div>
                          <div>
                            <h3 className="font-black text-white text-3xl group-hover:text-orange-400 transition-colors">
                              {carreira.nome}
                            </h3>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="text-lg text-gray-400 font-semibold">Cargos disponíveis:</div>
                          <div className="flex flex-wrap gap-3">
                            {carreira.cargos.map((cargo, idx) => (
                              <span
                                key={idx}
                                className="inline-block px-4 py-2.5 bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 text-base rounded-xl border border-orange-500/30 font-medium"
                              >
                                {cargo}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: MATÉRIA */}
            {step === "materia" && (
              <div className="animate-fade-in">
                {/* Back Button */}
                <button
                  onClick={goBack}
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-all mb-10 group px-6 py-3 rounded-xl hover:bg-white/5"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-all">
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                  <span className="text-lg font-medium">Voltar para Carreiras</span>
                </button>

                {/* Hero Header */}
                <div className="text-center mb-16">
                  <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
                    <div className="px-6 py-3 bg-orange-500/20 border-2 border-orange-500/40 rounded-full">
                      <span className="text-3xl mr-2">{selectedArea?.icone}</span>
                      <span className="text-lg font-bold text-orange-400">{selectedArea?.nome}</span>
                    </div>
                    <span className="text-3xl text-gray-600">→</span>
                    <div className="px-6 py-3 bg-amber-500/20 border-2 border-amber-500/40 rounded-full">
                      <span className="text-3xl mr-2">💼</span>
                      <span className="text-lg font-bold text-amber-400">{selectedCarreira?.nome}</span>
                    </div>
                  </div>
                  
                  <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-orange-400 via-red-400 to-amber-400 bg-clip-text text-transparent">
                    Escolha a Matéria
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
                    Selecione a disciplina para começar o simulado
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="flex items-center justify-center gap-3 mt-10">
                    <div className="w-20 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
                    <div className="w-20 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
                    <div className="w-20 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg shadow-orange-500/50" />
                  </div>
                  <p className="text-sm text-gray-500 mt-3">Passo 3 de 3</p>
                </div>

                {/* Matérias Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {materias.map((materia, index) => {
                    const areaQuestoes = QUESTOES_POR_AREA[selectedAreaId] || {};
                    const numQuestoes = (areaQuestoes[materia.id] || []).length;
                    const isLocked = isMateriaLocked(materia.id);
                    const diasRestantes = isLocked ? 7 - daysSinceCadastro : 0;
                    
                    return (
                      <button
                        key={materia.id}
                        onClick={() => {
                          if (isLocked) {
                            setLocation('/planos');
                            return;
                          }
                          if (numQuestoes > 0 || isAdmin) handleMateriaSelect(materia.id);
                        }}
                        disabled={numQuestoes === 0 && !isLocked && !isAdmin}
                        className={`group relative rounded-3xl p-8 border-2 transition-all duration-500 text-left overflow-hidden ${
                          isLocked
                            ? "border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 cursor-pointer hover:scale-[1.03]"
                            : (numQuestoes > 0 || isAdmin)
                            ? "border-white/10 hover:border-orange-500 hover:scale-[1.03] bg-gradient-to-br from-white/5 to-white/0 cursor-pointer" 
                            : "border-white/5 opacity-40 cursor-not-allowed bg-white/5"
                        }`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        {/* Cadeado para Plus */}
                        {isLocked && (
                          <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/50 z-10 animate-pulse">
                            <span className="text-2xl">🔒</span>
                          </div>
                        )}
                        
                        {numQuestoes > 0 && !isLocked && (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-amber-500/0 group-hover:from-orange-500/20 group-hover:to-amber-500/20 transition-all duration-500 rounded-3xl" />
                            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
                          </>
                        )}
                        
                        <div className="relative">
                          <div className="flex items-center gap-5 mb-5">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg transition-all duration-500 ${
                              isLocked 
                                ? "bg-gradient-to-br from-amber-500/30 to-yellow-500/30"
                                : numQuestoes > 0 
                                ? "bg-gradient-to-br from-orange-500/30 to-amber-500/30 group-hover:scale-110 group-hover:rotate-6" 
                                : "bg-white/10"
                            }`}>
                              {icons[materia.id] || "📚"}
                            </div>
                            <div className="flex-1">
                              <h3 className={`font-bold text-xl transition-colors ${
                                isLocked ? "text-amber-300" : numQuestoes > 0 ? "text-white group-hover:text-orange-400" : "text-gray-500"
                              }`}>
                                {materia.nome}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {numQuestoes} questões
                              </p>
                            </div>
                          </div>
                          
                          {isLocked ? (
                            <div className="space-y-2">
                              <div className="px-4 py-2.5 bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-amber-300 text-sm rounded-xl font-bold border border-amber-500/40">
                                ✨ Apenas Plus
                              </div>
                              <p className="text-xs text-amber-400/80">
                                🔓 Libera em {diasRestantes} {diasRestantes === 1 ? 'dia' : 'dias'} ou assine Plus
                              </p>
                            </div>
                          ) : numQuestoes > 0 || isAdmin ? (
                            <div className="flex items-center justify-between">
                              <span className="px-4 py-2 bg-emerald-500/20 text-emerald-400 text-sm rounded-xl font-semibold border border-emerald-500/30">
                                ✓ {isAdmin && numQuestoes === 0 ? 'Admin (0 questões)' : 'Disponível'}
                              </span>
                              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-amber-500 transition-all duration-300">
                                <svg className="w-5 h-5 text-orange-400 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          ) : (
                            <span className="px-4 py-2 bg-gray-500/20 text-gray-500 text-sm rounded-xl font-medium">
                              Em breve
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-30px) rotate(10deg); }
          }
          .animate-fade-in {
            animation: fade-in 0.8s ease-out;
          }
          .animate-float {
            animation: float 8s ease-in-out infinite;
          }
        `}</style>
      </div>
    </AppLayout>
  );
}
