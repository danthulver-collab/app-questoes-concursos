import { useState } from "react";
import { AppLayout } from "../components/app-layout";
import { useLocation } from "wouter";
import { getAllAreas, getCarreirasByArea, getMateriasByArea, getQuizData, type Area, type Carreira, type Disciplina } from "../lib/quiz-store";

// Questões organizadas por Área e Matéria
const QUESTOES_POR_AREA: Record<string, Record<string, any[]>> = {
  // ÁREA ADMINISTRATIVA
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
  
  // ÁREA EDUCAÇÃO
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
  
  // ÁREA SAÚDE
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
  
  // ÁREA SEGURANÇA
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
  
  // ÁREA JURÍDICA
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
  
  // ÁREA FISCAL/TRIBUTÁRIA
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
  
  // ÁREA TI
  "area-ti": {
    "informatica": [
      { id: "ti-inf-1", title: "Lógica de Programação", options: ["Algoritmo é sequência de passos para resolver problema", "Código sem lógica funciona", "Algoritmo é linguagem", "Não existe lógica"], correctAnswer: 0, explanation: "Algoritmo é uma sequência finita de instruções para resolver um problema." },
      { id: "ti-inf-2", title: "Banco de Dados", options: ["SQL é linguagem de consulta estruturada", "SQL é linguagem de programação", "Banco não usa SQL", "SQL é sistema operacional"], correctAnswer: 0, explanation: "SQL (Structured Query Language) é usada para manipular bancos de dados relacionais." },
      { id: "ti-inf-3", title: "Redes de Computadores", options: ["TCP/IP é protocolo da internet", "TCP/IP é hardware", "Não existe protocolo", "TCP/IP é software apenas"], correctAnswer: 0, explanation: "TCP/IP é o conjunto de protocolos que permite a comunicação na internet." },
      { id: "ti-inf-4", title: "Segurança da Informação", options: ["Confidencialidade, Integridade e Disponibilidade", "Apenas senhas", "Não existe segurança", "Somente antivírus"], correctAnswer: 0, explanation: "A tríade CIA (Confidentiality, Integrity, Availability) são os pilares da segurança." },
      { id: "ti-inf-5", title: "Sistemas Operacionais", options: ["Gerencia recursos de hardware e software", "Apenas abre programas", "Não faz nada", "É um aplicativo"], correctAnswer: 0, explanation: "O SO gerencia memória, processos, arquivos e dispositivos." },
    ],
  },
  
  // ÁREA CONTROLE/GESTÃO
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
  
  // ÁREA BANCÁRIA
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
  
  // ÁREA TÉCNICA/ENGENHARIA
  "area-tecnica": {
    "administracao": [
      { id: "tec-adm-1", title: "Gestão de Projetos", options: ["Planejamento, execução, monitoramento e encerramento", "Apenas execução", "Não precisa planejar", "Sem fases definidas"], correctAnswer: 0, explanation: "As fases do gerenciamento de projetos segundo o PMBOK." },
    ],
    "direito-administrativo": [
      { id: "tec-da-1", title: "Obras Públicas", options: ["Exigem licitação prévia", "Dispensa sempre", "Não há regras", "Contratação livre"], correctAnswer: 0, explanation: "Obras públicas devem seguir processo licitatório conforme Lei 14.133/21." },
    ],
  },
};

export default function EscolherSimulado() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"area" | "carreira" | "materia">("area");
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [selectedCarreiraId, setSelectedCarreiraId] = useState<string>("");
  const [selectedMateriaId, setSelectedMateriaId] = useState<string>("");

  const areas = getAllAreas();
  const carreiras = selectedAreaId ? getCarreirasByArea(selectedAreaId) : [];
  const materias = selectedAreaId ? getMateriasByArea(selectedAreaId) : [];
  
  const selectedArea = areas.find(a => a.id === selectedAreaId);
  const selectedCarreira = carreiras.find(c => c.id === selectedCarreiraId);
  const selectedMateria = materias.find(m => m.id === selectedMateriaId);

  const handleAreaSelect = (areaId: string) => {
    setSelectedAreaId(areaId);
    setStep("carreira");
  };

  const handleCarreiraSelect = (carreiraId: string) => {
    setSelectedCarreiraId(carreiraId);
    setStep("materia");
  };

  const handleMateriaSelect = (materiaId: string) => {
    setSelectedMateriaId(materiaId);
    
    // Buscar questões da área e matéria
    const areaQuestoes = QUESTOES_POR_AREA[selectedAreaId] || {};
    const questoes = areaQuestoes[materiaId] || [];
    
    const materia = materias.find(m => m.id === materiaId);
    
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
      setSelectedMateriaId("");
    } else if (step === "carreira") {
      setStep("area");
      setSelectedCarreiraId("");
      setSelectedAreaId("");
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#070b14] relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "2s" }} />
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-orange-400/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 p-6">
          <div className="max-w-6xl mx-auto">
            
            {/* STEP 1: ÁREA */}
            {step === "area" && (
              <div className="animate-fade-in">
                {/* Hero Header */}
                <div className="text-center mb-12">
                  <div className="inline-block mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur-xl opacity-50 animate-pulse" />
                      <div className="relative w-24 h-24 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-5xl shadow-2xl">
                        🎯
                      </div>
                    </div>
                  </div>
                  <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                    Escolha sua Área
                  </h1>
                  <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Selecione a área do concurso que você está estudando
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <div className="w-12 h-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" />
                    <div className="w-12 h-2 bg-white/20 rounded-full" />
                    <div className="w-12 h-2 bg-white/20 rounded-full" />
                  </div>
                </div>

                {/* Areas Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {areas.map((area, index) => (
                    <button
                      key={area.id}
                      onClick={() => handleAreaSelect(area.id)}
                      className="group relative glass-card rounded-3xl p-8 border-2 border-white/10 hover:border-orange-500 transition-all duration-500 hover:scale-[1.02] text-left overflow-hidden"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Hover gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-amber-500/0 group-hover:from-orange-500/10 group-hover:to-amber-500/10 transition-all duration-500" />
                      
                      <div className="relative flex items-start gap-6">
                        <div className="text-6xl group-hover:scale-125 transition-transform duration-500 group-hover:rotate-12">
                          {area.icone}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-black text-white text-2xl mb-2 group-hover:text-orange-400 transition-colors">
                            {area.nome}
                          </h3>
                          <p className="text-gray-400 mb-4">{area.descricao}</p>
                          <div className="flex gap-4 text-sm">
                            <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full">
                              {area.carreiras.length} carreiras
                            </span>
                            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full">
                              {area.materias.length} matérias
                            </span>
                          </div>
                        </div>
                        <svg className="w-8 h-8 text-white/30 group-hover:text-orange-400 group-hover:translate-x-2 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: CARREIRA */}
            {step === "carreira" && (
              <div className="animate-fade-in">
                {/* Back Button */}
                <button
                  onClick={goBack}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-all mb-8 group"
                >
                  <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Voltar para Áreas
                </button>

                {/* Hero Header */}
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-full">
                    <span className="text-4xl">{selectedArea?.icone}</span>
                    <span className="text-xl font-bold text-orange-400">{selectedArea?.nome}</span>
                  </div>
                  <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                    Escolha sua Carreira
                  </h1>
                  <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Selecione o cargo/carreira que você deseja
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <div className="w-12 h-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" />
                    <div className="w-12 h-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" />
                    <div className="w-12 h-2 bg-white/20 rounded-full" />
                  </div>
                </div>

                {/* Carreiras Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {carreiras.map((carreira, index) => (
                    <button
                      key={carreira.id}
                      onClick={() => handleCarreiraSelect(carreira.id)}
                      className="group relative glass-card rounded-3xl p-8 border-2 border-white/10 hover:border-orange-500 transition-all duration-500 hover:scale-[1.02] text-left overflow-hidden"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-amber-500/0 group-hover:from-orange-500/10 group-hover:to-amber-500/10 transition-all duration-500" />
                      
                      <div className="relative">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-3xl shadow-xl group-hover:scale-110 transition-transform">
                            💼
                          </div>
                          <div>
                            <h3 className="font-black text-white text-2xl group-hover:text-orange-400 transition-colors">
                              {carreira.nome}
                            </h3>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="text-sm text-gray-400 font-semibold">Cargos disponíveis:</div>
                          <div className="flex flex-wrap gap-2">
                            {carreira.cargos.map((cargo, idx) => (
                              <span
                                key={idx}
                                className="inline-block px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 text-sm rounded-xl border border-orange-500/30"
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
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-all mb-8 group"
                >
                  <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Voltar para Carreiras
                </button>

                {/* Hero Header */}
                <div className="text-center mb-12">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full">
                      <span className="text-2xl mr-2">{selectedArea?.icone}</span>
                      <span className="text-orange-400 font-semibold">{selectedArea?.nome}</span>
                    </div>
                    <span className="text-gray-500">→</span>
                    <div className="px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full">
                      <span className="text-2xl mr-2">💼</span>
                      <span className="text-amber-400 font-semibold">{selectedCarreira?.nome}</span>
                    </div>
                  </div>
                  
                  <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                    Escolha a Matéria
                  </h1>
                  <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Selecione a disciplina para começar as questões
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <div className="w-12 h-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" />
                    <div className="w-12 h-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" />
                    <div className="w-12 h-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" />
                  </div>
                </div>

                {/* Matérias Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {materias.map((materia, index) => {
                    const areaQuestoes = QUESTOES_POR_AREA[selectedAreaId] || {};
                    const numQuestoes = (areaQuestoes[materia.id] || []).length;
                    
                    const icons: Record<string, string> = {
                      "portugues": "📖",
                      "matematica": "🔢",
                      "informatica": "💻",
                      "administracao": "📊",
                      "direito-administrativo": "🏛️",
                      "direito-constitucional": "⚖️",
                      "direito-penal": "🔒",
                      "direito-civil": "📜",
                      "direito-tributario": "💰",
                      "legislacao": "📋",
                      "etica": "🤝",
                      "contabilidade": "📒",
                      "atualidades": "🌍"
                    };
                    
                    return (
                      <button
                        key={materia.id}
                        onClick={() => handleMateriaSelect(materia.id)}
                        disabled={numQuestoes === 0}
                        className={`group relative glass-card rounded-3xl p-6 border-2 transition-all duration-500 text-left overflow-hidden ${
                          numQuestoes > 0 
                            ? "border-white/10 hover:border-orange-500 hover:scale-[1.02]" 
                            : "border-white/5 opacity-50 cursor-not-allowed"
                        }`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-amber-500/0 group-hover:from-orange-500/10 group-hover:to-amber-500/10 transition-all duration-500" />
                        
                        <div className="relative">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                              {icons[materia.id] || "📚"}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-white text-lg group-hover:text-orange-400 transition-colors">
                                {materia.nome}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {numQuestoes} questões disponíveis
                              </p>
                            </div>
                          </div>
                          
                          {numQuestoes > 0 ? (
                            <div className="flex items-center justify-between">
                              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                                ✓ Disponível
                              </span>
                              <svg className="w-5 h-5 text-white/30 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          ) : (
                            <span className="px-3 py-1 bg-gray-500/20 text-gray-500 text-xs rounded-full">
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
        
        {/* CSS for animations */}
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          .animate-fade-in {
            animation: fade-in 0.6s ease-out;
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}</style>
      </div>
    </AppLayout>
  );
}
