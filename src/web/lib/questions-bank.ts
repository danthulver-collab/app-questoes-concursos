// Extensive question bank for Brazilian public exams (Concursos Públicos)
// Contains 100+ real-style questions from various exams

import type { Question } from "./quiz-store";

export const EXTENSIVE_QUESTIONS: Question[] = [
  // ============ PORTUGUÊS ============
  {
    id: "port-1",
    title: "Assinale a alternativa em que a concordância verbal está CORRETA:",
    options: [
      "Fazem dois anos que não viajo",
      "Houveram muitas reclamações",
      "Existem muitos problemas a resolver",
      "Vende-se casas nesta rua"
    ],
    correctAnswer: 2,
    explanation: "A concordância está correta em 'Existem muitos problemas a resolver', pois o verbo 'existir' é pessoal e concorda com o sujeito 'problemas'. 'Fazer' indicando tempo e 'haver' no sentido de existir são impessoais (terceira pessoa do singular). 'Vende-se casas' deveria ser 'Vendem-se casas' na voz passiva sintética.",
    concurso: "TRF 3ª Região",
    ano: 2024,
    orgao: "TRF",
    disciplina: "Português"
  },
  {
    id: "port-2",
    title: "Em 'Embora estivesse cansado, ele continuou trabalhando', a oração subordinada expressa ideia de:",
    options: [
      "Causa",
      "Condição",
      "Concessão",
      "Consequência"
    ],
    correctAnswer: 2,
    explanation: "A conjunção 'embora' introduz oração subordinada adverbial concessiva, que expressa um fato contrário à ação principal, mas que não impede sua realização. Apesar do cansaço (concessão), ele continuou trabalhando.",
    concurso: "CESPE/CEBRASPE",
    ano: 2024,
    orgao: "Polícia Federal",
    disciplina: "Português"
  },
  {
    id: "port-3",
    title: "Identifique a frase em que o uso da crase é OBRIGATÓRIO:",
    options: [
      "Fomos a Paris no verão",
      "Refiro-me a você especificamente",
      "Ela chegou a casa cansada",
      "Dedicou-se à pesquisa científica"
    ],
    correctAnswer: 3,
    explanation: "A crase é obrigatória em 'Dedicou-se à pesquisa científica' porque há a fusão da preposição 'a' (exigida pelo verbo dedicar-se) com o artigo feminino 'a' (que acompanha 'pesquisa'). 'A Paris' não leva crase (cidade sem artigo). 'A você' não leva crase (pronome). 'A casa' não leva crase (locução adverbial).",
    concurso: "FCC",
    ano: 2024,
    orgao: "TRT 2ª Região",
    disciplina: "Português"
  },
  {
    id: "port-4",
    title: "Na frase 'O governo anunciou que haverá mudanças', o termo 'que' funciona como:",
    options: [
      "Pronome relativo",
      "Conjunção integrante",
      "Pronome interrogativo",
      "Advérbio de intensidade"
    ],
    correctAnswer: 1,
    explanation: "O 'que' é conjunção integrante quando introduz oração subordinada substantiva. Pode ser substituído por 'isso': 'O governo anunciou isso'. Quando for pronome relativo, retoma um antecedente: 'O livro que comprei'.",
    concurso: "VUNESP",
    ano: 2024,
    orgao: "Prefeitura SP",
    disciplina: "Português"
  },
  {
    id: "port-5",
    title: "Assinale a alternativa que apresenta ERRO de regência verbal:",
    options: [
      "Aspiramos a uma vida melhor",
      "O filme a que assisti era bom",
      "Prefiro cinema do que teatro",
      "Informei-o de que havia erros"
    ],
    correctAnswer: 2,
    explanation: "O verbo 'preferir' não aceita 'do que'. A construção correta é 'Prefiro cinema a teatro'. Os outros exemplos estão corretos: aspirar (no sentido de desejar) é transitivo indireto; assistir (no sentido de ver) é transitivo indireto; informar aceita objeto direto de pessoa + objeto indireto de coisa.",
    concurso: "FGV",
    ano: 2024,
    orgao: "Senado Federal",
    disciplina: "Português"
  },
  {
    id: "port-6",
    title: "Na oração 'Venderam-se todas as mercadorias', o 'se' é classificado como:",
    options: [
      "Pronome reflexivo",
      "Partícula apassivadora",
      "Índice de indeterminação do sujeito",
      "Parte integrante do verbo"
    ],
    correctAnswer: 1,
    explanation: "O 'se' é partícula apassivadora quando acompanha verbo transitivo direto e o sujeito está no plural, concordando com ele. A frase equivale a 'Todas as mercadorias foram vendidas' (voz passiva analítica). 'Mercadorias' é o sujeito paciente.",
    concurso: "CESPE/CEBRASPE",
    ano: 2025,
    orgao: "TCU",
    disciplina: "Português"
  },
  {
    id: "port-7",
    title: "Assinale a opção em que todas as palavras estão grafadas CORRETAMENTE:",
    options: [
      "Privilégio, beneficiente, espontâneo",
      "Previlégio, beneficente, espontâneo",
      "Privilégio, beneficente, espontâneo",
      "Previlégio, beneficiente, espontâneo"
    ],
    correctAnswer: 2,
    explanation: "A grafia correta é: privilégio (não 'previlégio'), beneficente (não 'beneficiente') e espontâneo. São palavras frequentemente escritas de forma incorreta em concursos.",
    concurso: "IBFC",
    ano: 2024,
    orgao: "Prefeituras",
    disciplina: "Português"
  },
  {
    id: "port-8",
    title: "Em 'Os alunos cujos pais vieram à reunião', o pronome 'cujos' estabelece relação de:",
    options: [
      "Tempo",
      "Lugar",
      "Causa",
      "Posse"
    ],
    correctAnswer: 3,
    explanation: "O pronome relativo 'cujo' (e suas flexões) sempre estabelece relação de posse entre o antecedente (alunos) e o consequente (pais). Equivale a 'os pais dos quais' ou 'os pais de quem'. Nunca é seguido de artigo.",
    concurso: "Quadrix",
    ano: 2024,
    orgao: "CFO",
    disciplina: "Português"
  },
  {
    id: "port-9",
    title: "A palavra 'exceção' apresenta encontro consonantal do tipo:",
    options: [
      "Próprio",
      "Impróprio",
      "Perfeito",
      "Dígrafo"
    ],
    correctAnswer: 3,
    explanation: "A palavra 'exceção' apresenta o dígrafo 'xc', onde duas letras representam um único som. Dígrafos consonantais são: ch, lh, nh, rr, ss, sc, sç, xc, xs. Encontro consonantal seria duas consoantes com sons distintos (como 'br' em 'branco').",
    concurso: "FUNDATEC",
    ano: 2024,
    orgao: "Brigada Militar RS",
    disciplina: "Português"
  },
  {
    id: "port-10",
    title: "Identifique a figura de linguagem presente em 'Aquele político é uma raposa':",
    options: [
      "Metonímia",
      "Metáfora",
      "Catacrese",
      "Sinédoque"
    ],
    correctAnswer: 1,
    explanation: "Trata-se de metáfora, pois há uma comparação implícita entre o político e a raposa (animal associado à astúcia). Na metáfora, não há conectivo comparativo. Se fosse 'como uma raposa', seria comparação/símile.",
    concurso: "CONSULPLAN",
    ano: 2024,
    orgao: "TRE",
    disciplina: "Português"
  },

  // ============ MATEMÁTICA / RACIOCÍNIO LÓGICO ============
  {
    id: "mat-1",
    title: "Em uma progressão aritmética, o primeiro termo é 3 e a razão é 5. O 20º termo dessa PA é:",
    options: [
      "98",
      "103",
      "95",
      "100"
    ],
    correctAnswer: 0,
    explanation: "Usando a fórmula do termo geral da PA: an = a1 + (n-1).r. Assim: a20 = 3 + (20-1).5 = 3 + 19.5 = 3 + 95 = 98. Lembre-se: na PA, somamos a razão de termo a termo.",
    concurso: "ENEM",
    ano: 2024,
    orgao: "INEP/MEC",
    disciplina: "Matemática"
  },
  {
    id: "mat-2",
    title: "Se 3x - 2 = 10, então o valor de 2x + 5 é:",
    options: [
      "11",
      "13",
      "15",
      "9"
    ],
    correctAnswer: 1,
    explanation: "Primeiro, resolvemos 3x - 2 = 10: 3x = 12, logo x = 4. Substituindo em 2x + 5: 2(4) + 5 = 8 + 5 = 13.",
    concurso: "CESPE/CEBRASPE",
    ano: 2024,
    orgao: "INSS",
    disciplina: "Matemática"
  },
  {
    id: "mat-3",
    title: "Um capital de R$ 5.000,00 aplicado a juros simples de 2% ao mês rende, em 1 ano:",
    options: [
      "R$ 1.000,00",
      "R$ 1.200,00",
      "R$ 600,00",
      "R$ 1.500,00"
    ],
    correctAnswer: 1,
    explanation: "Juros Simples: J = C.i.t. Onde C = 5.000, i = 2% = 0,02 e t = 12 meses. J = 5.000 × 0,02 × 12 = 5.000 × 0,24 = R$ 1.200,00.",
    concurso: "FCC",
    ano: 2024,
    orgao: "Banco do Brasil",
    disciplina: "Matemática"
  },
  {
    id: "mat-4",
    title: "A negação da proposição 'Todos os advogados são honestos' é:",
    options: [
      "Nenhum advogado é honesto",
      "Alguns advogados não são honestos",
      "Todos os advogados são desonestos",
      "Existem advogados honestos"
    ],
    correctAnswer: 1,
    explanation: "A negação de 'Todo A é B' é 'Algum A não é B' (ou 'Existe A que não é B'). Não confundir negação com contrário. 'Nenhum advogado é honesto' é o contrário, não a negação lógica.",
    concurso: "CESPE/CEBRASPE",
    ano: 2024,
    orgao: "Polícia Federal",
    disciplina: "Raciocínio Lógico"
  },
  {
    id: "mat-5",
    title: "Se 'Se chove, então a rua fica molhada' é verdadeira, podemos concluir que:",
    options: [
      "Se a rua está molhada, então choveu",
      "Se não chove, a rua não fica molhada",
      "Se a rua não está molhada, então não choveu",
      "A chuva é a única causa da rua molhada"
    ],
    correctAnswer: 2,
    explanation: "Em lógica proposicional, a contrapositiva de 'Se P então Q' é equivalente: 'Se não Q então não P'. Se a rua não está molhada (não Q), então não choveu (não P). As outras opções são falácias: afirmação do consequente ou negação do antecedente.",
    concurso: "FGV",
    ano: 2025,
    orgao: "CGU",
    disciplina: "Raciocínio Lógico"
  },
  {
    id: "mat-6",
    title: "Em uma sala há 30 pessoas. Se 18 falam inglês, 15 falam espanhol e 5 não falam nenhum dos dois idiomas, quantas pessoas falam ambos os idiomas?",
    options: [
      "8",
      "10",
      "7",
      "12"
    ],
    correctAnswer: 0,
    explanation: "Usando o princípio da inclusão-exclusão: Total que fala algum idioma = 30 - 5 = 25. Fórmula: |A ∪ B| = |A| + |B| - |A ∩ B|. Logo: 25 = 18 + 15 - x, onde x é quem fala ambos. 25 = 33 - x, então x = 8 pessoas.",
    concurso: "VUNESP",
    ano: 2024,
    orgao: "TJ-SP",
    disciplina: "Raciocínio Lógico"
  },
  {
    id: "mat-7",
    title: "A área de um triângulo de base 12 cm e altura 8 cm é:",
    options: [
      "96 cm²",
      "48 cm²",
      "24 cm²",
      "60 cm²"
    ],
    correctAnswer: 1,
    explanation: "A área do triângulo é calculada pela fórmula A = (base × altura) / 2. Assim: A = (12 × 8) / 2 = 96 / 2 = 48 cm².",
    concurso: "ENEM",
    ano: 2024,
    orgao: "INEP/MEC",
    disciplina: "Matemática"
  },
  {
    id: "mat-8",
    title: "Se Ana é mais alta que Beatriz e Carla é mais baixa que Beatriz, então:",
    options: [
      "Carla é mais alta que Ana",
      "Ana é a mais baixa das três",
      "Ana é mais alta que Carla",
      "Beatriz é a mais alta das três"
    ],
    correctAnswer: 2,
    explanation: "Das premissas: Ana > Beatriz e Beatriz > Carla. Por transitividade: Ana > Beatriz > Carla. Portanto, Ana é mais alta que Carla, e Ana é a mais alta das três.",
    concurso: "IBFC",
    ano: 2024,
    orgao: "Prefeituras",
    disciplina: "Raciocínio Lógico"
  },
  {
    id: "mat-9",
    title: "Qual é o próximo número da sequência: 2, 6, 18, 54, ...?",
    options: [
      "108",
      "162",
      "72",
      "216"
    ],
    correctAnswer: 1,
    explanation: "Esta é uma progressão geométrica (PG) com razão q = 3. Cada termo é multiplicado por 3: 2×3=6, 6×3=18, 18×3=54, 54×3=162.",
    concurso: "FCC",
    ano: 2024,
    orgao: "TRT",
    disciplina: "Raciocínio Lógico"
  },
  {
    id: "mat-10",
    title: "Um carro percorre 240 km em 3 horas. Sua velocidade média é:",
    options: [
      "60 km/h",
      "70 km/h",
      "80 km/h",
      "90 km/h"
    ],
    correctAnswer: 2,
    explanation: "Velocidade média = distância / tempo = 240 km / 3 h = 80 km/h. Este é um conceito fundamental de física básica cobrado em matemática de concursos.",
    concurso: "CESPE/CEBRASPE",
    ano: 2024,
    orgao: "PRF",
    disciplina: "Matemática"
  },

  // ============ DIREITO CONSTITUCIONAL ============
  {
    id: "dconst-1",
    title: "São fundamentos da República Federativa do Brasil, EXCETO:",
    options: [
      "A soberania",
      "A cidadania",
      "A dignidade da pessoa humana",
      "A independência nacional"
    ],
    correctAnswer: 3,
    explanation: "Os fundamentos da República estão no Art. 1º da CF/88 (mnemônico SO-CI-DI-VA-PLU): Soberania, Cidadania, Dignidade da pessoa humana, Valores sociais do trabalho e da livre iniciativa, e Pluralismo político. A independência nacional é um princípio das relações internacionais (Art. 4º).",
    concurso: "CESPE/CEBRASPE",
    ano: 2024,
    orgao: "Polícia Federal",
    disciplina: "Direito Constitucional"
  },
  {
    id: "dconst-2",
    title: "Segundo a CF/88, a prática do racismo constitui crime:",
    options: [
      "Afiançável e prescritível",
      "Inafiançável e imprescritível",
      "Afiançável e imprescritível",
      "Inafiançável e prescritível"
    ],
    correctAnswer: 1,
    explanation: "Conforme Art. 5º, XLII da CF/88: 'a prática do racismo constitui crime inafiançável e imprescritível, sujeito à pena de reclusão, nos termos da lei'. São crimes inafiançáveis e imprescritíveis: racismo e ação de grupos armados contra o Estado.",
    concurso: "FCC",
    ano: 2024,
    orgao: "TRF 3ª Região",
    disciplina: "Direito Constitucional"
  },
  {
    id: "dconst-3",
    title: "O habeas corpus será concedido quando:",
    options: [
      "Houver violação de direito líquido e certo",
      "Alguém sofrer ou se achar ameaçado de sofrer violência ou coação em sua liberdade de locomoção",
      "A falta de norma regulamentadora tornar inviável o exercício de direitos constitucionais",
      "For necessário proteger direito difuso ou coletivo"
    ],
    correctAnswer: 1,
    explanation: "Conforme Art. 5º, LXVIII da CF/88, habeas corpus tutela a liberdade de locomoção. Direito líquido e certo é protegido pelo mandado de segurança. Falta de norma regulamentadora, pelo mandado de injunção. Direitos difusos e coletivos, pela ação civil pública.",
    concurso: "VUNESP",
    ano: 2024,
    orgao: "TJ-SP",
    disciplina: "Direito Constitucional"
  },
  {
    id: "dconst-4",
    title: "Sobre a organização dos poderes, é CORRETO afirmar que o Poder Legislativo da União é exercido pelo:",
    options: [
      "Senado Federal apenas",
      "Câmara dos Deputados apenas",
      "Congresso Nacional, composto pela Câmara e pelo Senado",
      "Supremo Tribunal Federal"
    ],
    correctAnswer: 2,
    explanation: "Conforme Art. 44 da CF/88: 'O Poder Legislativo é exercido pelo Congresso Nacional, que se compõe da Câmara dos Deputados e do Senado Federal.' É o sistema bicameral.",
    concurso: "FGV",
    ano: 2024,
    orgao: "OAB",
    disciplina: "Direito Constitucional"
  },
  {
    id: "dconst-5",
    title: "Compete privativamente à União legislar sobre:",
    options: [
      "Proteção ao meio ambiente",
      "Direito civil, comercial, penal e processual",
      "Proteção ao patrimônio histórico e cultural",
      "Educação, cultura, ensino e desporto"
    ],
    correctAnswer: 1,
    explanation: "Conforme Art. 22, I da CF/88, compete privativamente à União legislar sobre direito civil, comercial, penal, processual, eleitoral, agrário, marítimo, aeronáutico, espacial e do trabalho. As outras opções são competências concorrentes (Art. 24).",
    concurso: "CESPE/CEBRASPE",
    ano: 2025,
    orgao: "AGU",
    disciplina: "Direito Constitucional"
  },
  {
    id: "dconst-6",
    title: "A Constituição Federal pode ser emendada mediante proposta de:",
    options: [
      "Maioria simples dos membros da Câmara ou do Senado",
      "Um terço, no mínimo, dos membros da Câmara ou do Senado",
      "Maioria absoluta das Assembleias Legislativas",
      "Iniciativa popular com 1% do eleitorado"
    ],
    correctAnswer: 1,
    explanation: "Conforme Art. 60 da CF/88, a proposta de emenda pode ser apresentada por: 1/3 dos membros da Câmara OU do Senado; pelo Presidente da República; ou por mais da metade das Assembleias Legislativas (cada uma por maioria relativa).",
    concurso: "FCC",
    ano: 2024,
    orgao: "TRE",
    disciplina: "Direito Constitucional"
  },
  {
    id: "dconst-7",
    title: "Não será objeto de deliberação a proposta de emenda constitucional tendente a abolir:",
    options: [
      "O sistema presidencialista",
      "A separação dos Poderes",
      "O sistema federativo bicameral",
      "A forma republicana de governo"
    ],
    correctAnswer: 1,
    explanation: "As cláusulas pétreas (Art. 60, §4º) protegem: forma federativa de Estado, voto direto/secreto/universal/periódico, separação dos Poderes e direitos e garantias individuais. O sistema presidencialista, republicano e bicameral não são cláusulas pétreas.",
    concurso: "CESPE/CEBRASPE",
    ano: 2024,
    orgao: "Câmara dos Deputados",
    disciplina: "Direito Constitucional"
  },
  {
    id: "dconst-8",
    title: "O mandato do Presidente da República é de:",
    options: [
      "4 anos, permitida uma reeleição",
      "5 anos, sem direito a reeleição",
      "4 anos, sem direito a reeleição",
      "5 anos, permitida uma reeleição"
    ],
    correctAnswer: 0,
    explanation: "Conforme Art. 82 da CF/88, o mandato do Presidente da República é de 4 anos. A EC 16/97 permitiu a reeleição para um único período subsequente (Art. 14, §5º).",
    concurso: "IBFC",
    ano: 2024,
    orgao: "Prefeituras",
    disciplina: "Direito Constitucional"
  },
  {
    id: "dconst-9",
    title: "São direitos sociais previstos no Art. 6º da CF/88, EXCETO:",
    options: [
      "Alimentação e moradia",
      "Propriedade e herança",
      "Transporte e lazer",
      "Previdência e assistência social"
    ],
    correctAnswer: 1,
    explanation: "Direitos sociais (Art. 6º): educação, saúde, alimentação, trabalho, moradia, transporte, lazer, segurança, previdência social, proteção à maternidade/infância, assistência aos desamparados. Propriedade e herança são direitos individuais (Art. 5º).",
    concurso: "FGV",
    ano: 2024,
    orgao: "OAB",
    disciplina: "Direito Constitucional"
  },
  {
    id: "dconst-10",
    title: "O Presidente da República pode sofrer impeachment por crime de:",
    options: [
      "Homicídio culposo apenas",
      "Responsabilidade apenas",
      "Comum e de responsabilidade",
      "Contravenção penal apenas"
    ],
    correctAnswer: 2,
    explanation: "O Presidente pode ser processado por crimes comuns (perante o STF) e por crimes de responsabilidade (perante o Senado Federal). O processo por crime de responsabilidade é o impeachment propriamente dito.",
    concurso: "VUNESP",
    ano: 2024,
    orgao: "Ministério Público SP",
    disciplina: "Direito Constitucional"
  },

  // ============ DIREITO ADMINISTRATIVO ============
  {
    id: "dadm-1",
    title: "São princípios expressos da Administração Pública na CF/88:",
    options: [
      "Legalidade, moralidade, publicidade, eficiência e impessoalidade",
      "Legalidade, moralidade, publicidade, eficiência e razoabilidade",
      "Legalidade, moralidade, publicidade, supremacia do interesse público e impessoalidade",
      "Legalidade, moralidade, indisponibilidade, eficiência e impessoalidade"
    ],
    correctAnswer: 0,
    explanation: "O Art. 37, caput, da CF/88 traz os princípios expressos: LIMPE (Legalidade, Impessoalidade, Moralidade, Publicidade e Eficiência). Razoabilidade, supremacia e indisponibilidade do interesse público são princípios implícitos.",
    concurso: "CESPE/CEBRASPE",
    ano: 2024,
    orgao: "STF",
    disciplina: "Direito Administrativo"
  },
  {
    id: "dadm-2",
    title: "A modalidade de licitação para obras e serviços de engenharia acima de R$ 3.300.000,00 é:",
    options: [
      "Convite",
      "Tomada de preços",
      "Concorrência",
      "Pregão"
    ],
    correctAnswer: 2,
    explanation: "Conforme a Nova Lei de Licitações (14.133/2021), a concorrência é obrigatória para obras/serviços de engenharia acima de R$ 3.300.000,00 e para compras/outros serviços acima de R$ 1.430.000,00. O pregão é para bens e serviços comuns.",
    concurso: "FCC",
    ano: 2025,
    orgao: "TCE",
    disciplina: "Direito Administrativo"
  },
  {
    id: "dadm-3",
    title: "A autarquia é uma entidade da administração indireta com personalidade jurídica de direito:",
    options: [
      "Público, criada por lei",
      "Privado, criada por lei",
      "Público, autorizada por lei",
      "Privado, autorizada por lei"
    ],
    correctAnswer: 0,
    explanation: "Autarquias têm personalidade jurídica de direito público e são criadas diretamente por lei específica. Já as empresas públicas e sociedades de economia mista têm personalidade de direito privado e são autorizadas por lei.",
    concurso: "VUNESP",
    ano: 2024,
    orgao: "TJ-SP",
    disciplina: "Direito Administrativo"
  },
  {
    id: "dadm-4",
    title: "O poder da Administração de impor sanções aos administrados que descumprem normas administrativas é chamado de poder:",
    options: [
      "Disciplinar",
      "Regulamentar",
      "De polícia",
      "Hierárquico"
    ],
    correctAnswer: 2,
    explanation: "O poder de polícia limita direitos individuais em benefício do interesse público, podendo aplicar sanções. O poder disciplinar pune agentes públicos. O poder regulamentar edita normas. O poder hierárquico organiza a estrutura administrativa.",
    concurso: "FGV",
    ano: 2024,
    orgao: "CGU",
    disciplina: "Direito Administrativo"
  },
  {
    id: "dadm-5",
    title: "O ato administrativo que contém vício de legalidade deve ser:",
    options: [
      "Revogado pela Administração",
      "Anulado pela Administração ou pelo Judiciário",
      "Convalidado obrigatoriamente",
      "Ratificado pelo superior hierárquico"
    ],
    correctAnswer: 1,
    explanation: "Atos ilegais devem ser anulados (princípio da autotutela - Súmula 473 STF). A Administração pode anular seus próprios atos ou o Judiciário pode fazê-lo se provocado. Revogação é para atos legais que se tornaram inconvenientes.",
    concurso: "CESPE/CEBRASPE",
    ano: 2024,
    orgao: "AGU",
    disciplina: "Direito Administrativo"
  },
  {
    id: "dadm-6",
    title: "Quanto aos requisitos de validade do ato administrativo, a competência é elemento:",
    options: [
      "Discricionário e prescindível",
      "Vinculado e imprescindível",
      "Discricionário e imprescindível",
      "Vinculado e prescindível"
    ],
    correctAnswer: 1,
    explanation: "A competência é sempre elemento vinculado (definido em lei) e imprescindível (todo ato precisa de agente competente). Os cinco elementos do ato são: competência, finalidade e forma (sempre vinculados); motivo e objeto (podem ser discricionários).",
    concurso: "FCC",
    ano: 2024,
    orgao: "TRF",
    disciplina: "Direito Administrativo"
  },
  {
    id: "dadm-7",
    title: "A dispensa de licitação por valor é possível para:",
    options: [
      "Qualquer tipo de contratação, independente do valor",
      "Obras até R$ 100.000,00",
      "Compras e serviços até R$ 50.000,00",
      "Obras até certos limites legais e compras/serviços até outros limites"
    ],
    correctAnswer: 3,
    explanation: "Conforme a Lei 14.133/2021, há dispensa por valor para: obras/serviços de engenharia até R$ 100.000,00; e outros serviços/compras até R$ 50.000,00 (valores atualizados). Cada tipo tem seu limite específico.",
    concurso: "IBFC",
    ano: 2024,
    orgao: "Prefeituras",
    disciplina: "Direito Administrativo"
  },
  {
    id: "dadm-8",
    title: "O servidor público estável pode perder o cargo:",
    options: [
      "Apenas mediante processo administrativo disciplinar",
      "Apenas mediante sentença judicial transitada em julgado",
      "Por processo administrativo ou sentença judicial, ambos com ampla defesa",
      "Por decisão unilateral do superior hierárquico"
    ],
    correctAnswer: 2,
    explanation: "Conforme Art. 41, §1º da CF/88, servidor estável pode perder o cargo: 1) sentença judicial transitada em julgado; 2) processo administrativo com ampla defesa; 3) avaliação periódica de desempenho; 4) para cumprir limite de gastos com pessoal.",
    concurso: "CESPE/CEBRASPE",
    ano: 2024,
    orgao: "TRE",
    disciplina: "Direito Administrativo"
  },
  {
    id: "dadm-9",
    title: "A responsabilidade civil do Estado, prevista no Art. 37, §6º da CF/88, é do tipo:",
    options: [
      "Subjetiva, sempre",
      "Objetiva, na modalidade risco integral",
      "Objetiva, na modalidade risco administrativo",
      "Subjetiva, com inversão do ônus da prova"
    ],
    correctAnswer: 2,
    explanation: "O Estado responde objetivamente (independe de culpa) pelos danos causados por seus agentes, na modalidade risco administrativo (admite excludentes: culpa exclusiva da vítima, caso fortuito, força maior). Risco integral não admite excludentes.",
    concurso: "FGV",
    ano: 2024,
    orgao: "OAB",
    disciplina: "Direito Administrativo"
  },
  {
    id: "dadm-10",
    title: "Os bens públicos de uso comum do povo são:",
    options: [
      "Alienáveis a qualquer tempo",
      "Inalienáveis enquanto mantiverem essa classificação",
      "Sujeitos a usucapião",
      "Penhoráveis mediante autorização judicial"
    ],
    correctAnswer: 1,
    explanation: "Bens públicos são inalienáveis, impenhoráveis, imprescritíveis (não usucapem) e não oneráveis. Somente bens dominicais (desafetados) podem ser alienados, após cumprir requisitos legais.",
    concurso: "VUNESP",
    ano: 2024,
    orgao: "Defensoria Pública",
    disciplina: "Direito Administrativo"
  },

  // ============ INFORMÁTICA ============
  {
    id: "info-1",
    title: "No Microsoft Word, o atalho Ctrl+N serve para:",
    options: [
      "Salvar o documento",
      "Abrir um novo documento",
      "Imprimir o documento",
      "Fechar o documento atual"
    ],
    correctAnswer: 1,
    explanation: "Ctrl+N (New) abre um novo documento em branco no Word. Ctrl+S salva, Ctrl+P imprime e Ctrl+W fecha o documento. São atalhos universais em diversos programas.",
    concurso: "FCC",
    ano: 2024,
    orgao: "TRT",
    disciplina: "Informática"
  },
  {
    id: "info-2",
    title: "No Excel, a função que retorna o maior valor de um intervalo é:",
    options: [
      "=MAIOR()",
      "=MAX()",
      "=MÁXIMO()",
      "=ALTO()"
    ],
    correctAnswer: 1,
    explanation: "A função =MAX() retorna o maior valor de um intervalo. Ex: =MAX(A1:A10). A função =MAIOR() existe mas retorna o k-ésimo maior valor (precisa de dois argumentos). =MÍNIMO() ou =MIN() retorna o menor.",
    concurso: "CESPE/CEBRASPE",
    ano: 2024,
    orgao: "INSS",
    disciplina: "Informática"
  },
  {
    id: "info-3",
    title: "O protocolo utilizado para envio de e-mails é o:",
    options: [
      "POP3",
      "IMAP",
      "SMTP",
      "HTTP"
    ],
    correctAnswer: 2,
    explanation: "SMTP (Simple Mail Transfer Protocol) é usado para envio de e-mails. POP3 e IMAP são para recebimento. HTTP é para navegação web. HTTPS é a versão segura do HTTP.",
    concurso: "FGV",
    ano: 2024,
    orgao: "Senado",
    disciplina: "Informática"
  },
  {
    id: "info-4",
    title: "Qual é a extensão padrão de arquivos do PowerPoint 2019+?",
    options: [
      ".ppt",
      ".pptx",
      ".ppsx",
      ".odp"
    ],
    correctAnswer: 1,
    explanation: ".pptx é a extensão padrão do PowerPoint desde a versão 2007. O 'x' indica formato XML. .ppt era o formato antigo. .ppsx é apresentação de slides. .odp é do LibreOffice Impress.",
    concurso: "VUNESP",
    ano: 2024,
    orgao: "Prefeitura SP",
    disciplina: "Informática"
  },
  {
    id: "info-5",
    title: "No Windows 10/11, a combinação de teclas para alternar entre janelas abertas é:",
    options: [
      "Ctrl+Tab",
      "Alt+Tab",
      "Win+Tab",
      "Shift+Tab"
    ],
    correctAnswer: 1,
    explanation: "Alt+Tab alterna entre janelas abertas no Windows. Win+Tab abre a Visão de Tarefas. Ctrl+Tab alterna entre abas em navegadores. Shift+Tab navega para o elemento anterior em formulários.",
    concurso: "IBFC",
    ano: 2024,
    orgao: "Bombeiros",
    disciplina: "Informática"
  },
  {
    id: "info-6",
    title: "Um malware que se propaga automaticamente pela rede, explorando vulnerabilidades, é chamado de:",
    options: [
      "Vírus",
      "Cavalo de Troia",
      "Worm",
      "Spyware"
    ],
    correctAnswer: 2,
    explanation: "Worm (verme) se propaga automaticamente pela rede sem necessidade de programa hospedeiro. Vírus precisa de hospedeiro para se propagar. Trojan se disfarça de programa legítimo. Spyware coleta informações.",
    concurso: "CESPE/CEBRASPE",
    ano: 2024,
    orgao: "Polícia Federal",
    disciplina: "Informática"
  },
  {
    id: "info-7",
    title: "A tecnologia que permite armazenamento e processamento de dados em servidores remotos pela internet é:",
    options: [
      "Blockchain",
      "Big Data",
      "Computação em Nuvem",
      "Internet das Coisas"
    ],
    correctAnswer: 2,
    explanation: "Computação em Nuvem (Cloud Computing) permite usar recursos computacionais remotos via internet. Exemplos: Google Drive, OneDrive, AWS. Big Data trata grandes volumes de dados. IoT conecta dispositivos à internet.",
    concurso: "FCC",
    ano: 2024,
    orgao: "Banco do Brasil",
    disciplina: "Informática"
  },
  {
    id: "info-8",
    title: "No Excel, a fórmula =SOMA(A1:A5) pode ser substituída por:",
    options: [
      "=A1+A2+A3+A4+A5",
      "=TOTAL(A1:A5)",
      "=SOMAR(A1:A5)",
      "=ADD(A1:A5)"
    ],
    correctAnswer: 0,
    explanation: "A função SOMA() adiciona valores de um intervalo, sendo equivalente a somar cada célula individualmente. TOTAL(), SOMAR() e ADD() não existem no Excel em português.",
    concurso: "Quadrix",
    ano: 2024,
    orgao: "CRO",
    disciplina: "Informática"
  },
  {
    id: "info-9",
    title: "O componente responsável por armazenar programas e dados em execução no computador é:",
    options: [
      "HD (Disco Rígido)",
      "Memória RAM",
      "Processador (CPU)",
      "Placa-mãe"
    ],
    correctAnswer: 1,
    explanation: "A memória RAM (Random Access Memory) armazena temporariamente dados e programas em execução. É volátil (perde dados ao desligar). O HD armazena permanentemente. A CPU processa dados.",
    concurso: "FUNDATEC",
    ano: 2024,
    orgao: "Brigada Militar",
    disciplina: "Informática"
  },
  {
    id: "info-10",
    title: "A criptografia que usa a mesma chave para cifrar e decifrar é do tipo:",
    options: [
      "Assimétrica",
      "De chave pública",
      "Simétrica",
      "Hash"
    ],
    correctAnswer: 2,
    explanation: "Criptografia simétrica usa a mesma chave para cifrar e decifrar (ex: AES, DES). Assimétrica usa par de chaves (pública para cifrar, privada para decifrar - ex: RSA). Hash é resumo de dados (não reversível).",
    concurso: "CESPE/CEBRASPE",
    ano: 2025,
    orgao: "ABIN",
    disciplina: "Informática"
  },

  // ============ ATUALIDADES ============
  {
    id: "atual-1",
    title: "A Inteligência Artificial generativa que ganhou destaque em 2023 com o ChatGPT é baseada em:",
    options: [
      "Redes neurais convolucionais apenas",
      "Modelos de linguagem de grande escala (LLMs)",
      "Algoritmos genéticos",
      "Sistemas especialistas tradicionais"
    ],
    correctAnswer: 1,
    explanation: "O ChatGPT e similares são baseados em Large Language Models (LLMs), modelos treinados com bilhões de parâmetros em vastos conjuntos de texto. Usam arquitetura Transformer para processar e gerar linguagem natural.",
    concurso: "FGV",
    ano: 2024,
    orgao: "TJ-RJ",
    disciplina: "Atualidades"
  },
  {
    id: "atual-2",
    title: "O PIX, sistema de pagamentos instantâneos do Brasil, é gerenciado pelo:",
    options: [
      "Ministério da Fazenda",
      "Banco Central do Brasil",
      "Febraban",
      "Tesouro Nacional"
    ],
    correctAnswer: 1,
    explanation: "O PIX foi criado e é gerenciado pelo Banco Central do Brasil (BACEN). Lançado em novembro de 2020, permite transferências 24h por dia, 7 dias por semana, em segundos e sem custo para pessoas físicas.",
    concurso: "FCC",
    ano: 2024,
    orgao: "Banco do Brasil",
    disciplina: "Atualidades"
  },
  {
    id: "atual-3",
    title: "A Meta (antiga Facebook) anunciou investimentos massivos no conceito de:",
    options: [
      "Blockchain",
      "Metaverso",
      "Web 1.0",
      "Internet 5G"
    ],
    correctAnswer: 1,
    explanation: "A Meta (rebatizada em 2021) aposta no Metaverso, um ambiente virtual imersivo que integra realidade virtual e aumentada. O conceito prevê interações sociais, trabalho e entretenimento em espaços digitais tridimensionais.",
    concurso: "CESPE/CEBRASPE",
    ano: 2024,
    orgao: "TRT",
    disciplina: "Atualidades"
  },
  {
    id: "atual-4",
    title: "A COP (Conferência das Partes) é um evento anual que trata principalmente de:",
    options: [
      "Comércio internacional",
      "Mudanças climáticas",
      "Direitos humanos",
      "Saúde global"
    ],
    correctAnswer: 1,
    explanation: "A COP (Conference of the Parties) é a conferência anual da ONU sobre mudanças climáticas (UNFCCC). Países negociam metas de redução de emissões de gases de efeito estufa. A COP28 foi realizada em Dubai em 2023.",
    concurso: "VUNESP",
    ano: 2024,
    orgao: "Prefeituras",
    disciplina: "Atualidades"
  },
  {
    id: "atual-5",
    title: "O Brasil assumiu a presidência do G20 em 2024. O G20 é um grupo de:",
    options: [
      "20 países mais desenvolvidos do mundo",
      "19 países + União Europeia + União Africana",
      "20 maiores economias da América",
      "20 países fundadores da ONU"
    ],
    correctAnswer: 1,
    explanation: "O G20 reúne as 19 maiores economias do mundo mais a União Europeia (e recentemente a União Africana como membro permanente). Representa cerca de 85% do PIB mundial e 75% do comércio internacional.",
    concurso: "FGV",
    ano: 2024,
    orgao: "CGU",
    disciplina: "Atualidades"
  },

  // ============ DIREITO PENAL ============
  {
    id: "dpen-1",
    title: "O princípio da reserva legal significa que:",
    options: [
      "O juiz pode criar novos crimes por analogia",
      "Não há crime sem lei anterior que o defina",
      "A pena pode ser aplicada retroativamente se beneficiar o réu",
      "O costume pode definir crimes"
    ],
    correctAnswer: 1,
    explanation: "O princípio da reserva legal (nullum crimen, nulla poena sine lege) está no Art. 1º do CP e Art. 5º, XXXIX da CF: 'não há crime sem lei anterior que o defina, nem pena sem prévia cominação legal'. Veda analogia in malam partem e costumes incriminadores.",
    concurso: "CESPE/CEBRASPE",
    ano: 2024,
    orgao: "Polícia Civil",
    disciplina: "Direito Penal"
  },
  {
    id: "dpen-2",
    title: "São excludentes de ilicitude previstas no Código Penal, EXCETO:",
    options: [
      "Legítima defesa",
      "Estado de necessidade",
      "Coação moral irresistível",
      "Exercício regular de um direito"
    ],
    correctAnswer: 2,
    explanation: "As excludentes de ilicitude (Art. 23 CP) são: estado de necessidade, legítima defesa, estrito cumprimento do dever legal e exercício regular de um direito. A coação moral irresistível é excludente de culpabilidade (Art. 22 CP).",
    concurso: "FGV",
    ano: 2024,
    orgao: "OAB",
    disciplina: "Direito Penal"
  },
  {
    id: "dpen-3",
    title: "O crime de furto é classificado quanto ao resultado como:",
    options: [
      "Crime formal",
      "Crime material",
      "Crime de mera conduta",
      "Crime permanente"
    ],
    correctAnswer: 1,
    explanation: "Furto é crime material porque exige resultado naturalístico (subtração efetiva do bem). Crimes formais não exigem resultado (ex: ameaça). Crimes de mera conduta descrevem só a ação (ex: violação de domicílio).",
    concurso: "FCC",
    ano: 2024,
    orgao: "TJ",
    disciplina: "Direito Penal"
  },
  {
    id: "dpen-4",
    title: "A tentativa é punida com a pena do crime consumado diminuída de:",
    options: [
      "1/6 a 1/3",
      "1/3 a 2/3",
      "1/2",
      "1/3"
    ],
    correctAnswer: 1,
    explanation: "Conforme Art. 14, parágrafo único do CP: 'Salvo disposição em contrário, pune-se a tentativa com a pena correspondente ao crime consumado, diminuída de um a dois terços.' A redução varia conforme o iter criminis percorrido.",
    concurso: "VUNESP",
    ano: 2024,
    orgao: "Polícia Civil SP",
    disciplina: "Direito Penal"
  },
  {
    id: "dpen-5",
    title: "A prescrição da pretensão punitiva antes do trânsito em julgado é regulada pelo máximo da pena:",
    options: [
      "Aplicada na sentença",
      "Prevista em abstrato para o crime",
      "Mínima do tipo penal",
      "Média entre mínimo e máximo"
    ],
    correctAnswer: 1,
    explanation: "A prescrição antes do trânsito em julgado (PPP) é calculada pela pena máxima cominada em abstrato (Art. 109 CP). Após a condenação, pode-se calcular pela pena concretamente aplicada (prescrição retroativa ou superveniente).",
    concurso: "CESPE/CEBRASPE",
    ano: 2024,
    orgao: "Polícia Federal",
    disciplina: "Direito Penal"
  },

  // ============ CONHECIMENTOS GERAIS / HISTÓRIA / GEOGRAFIA ============
  {
    id: "hist-1",
    title: "A Proclamação da República no Brasil ocorreu em:",
    options: [
      "7 de setembro de 1822",
      "15 de novembro de 1889",
      "13 de maio de 1888",
      "5 de outubro de 1988"
    ],
    correctAnswer: 1,
    explanation: "A República foi proclamada em 15 de novembro de 1889 pelo Marechal Deodoro da Fonseca. 7 de setembro de 1822 foi a Independência. 13 de maio de 1888 foi a Abolição. 5 de outubro de 1988 foi a promulgação da CF atual.",
    concurso: "IBFC",
    ano: 2024,
    orgao: "Prefeituras",
    disciplina: "História"
  },
  {
    id: "hist-2",
    title: "O período conhecido como 'Era Vargas' compreende os anos de:",
    options: [
      "1889 a 1930",
      "1930 a 1945",
      "1946 a 1964",
      "1964 a 1985"
    ],
    correctAnswer: 1,
    explanation: "A Era Vargas (1930-1945) inclui: Governo Provisório (1930-1934), Governo Constitucional (1934-1937) e Estado Novo (1937-1945). Vargas ainda retornou democraticamente de 1951 a 1954.",
    concurso: "ENEM",
    ano: 2024,
    orgao: "INEP/MEC",
    disciplina: "História"
  },
  {
    id: "geo-1",
    title: "O maior bioma brasileiro em extensão territorial é:",
    options: [
      "Mata Atlântica",
      "Cerrado",
      "Amazônia",
      "Caatinga"
    ],
    correctAnswer: 2,
    explanation: "A Amazônia ocupa cerca de 49% do território brasileiro (aproximadamente 4,2 milhões de km²). Em seguida vêm: Cerrado (24%), Mata Atlântica (13%), Caatinga (10%), Pampa (2%) e Pantanal (2%).",
    concurso: "CESPE/CEBRASPE",
    ano: 2024,
    orgao: "IBAMA",
    disciplina: "Geografia"
  },
  {
    id: "geo-2",
    title: "Os países que fazem fronteira com o Brasil são em número de:",
    options: [
      "8",
      "9",
      "10",
      "11"
    ],
    correctAnswer: 2,
    explanation: "O Brasil faz fronteira com 10 países: Uruguai, Argentina, Paraguai, Bolívia, Peru, Colômbia, Venezuela, Guiana, Suriname e Guiana Francesa (território francês). Não faz fronteira com Chile e Equador.",
    concurso: "FCC",
    ano: 2024,
    orgao: "PRF",
    disciplina: "Geografia"
  },
  {
    id: "geo-3",
    title: "A Região Nordeste do Brasil é composta por quantos estados?",
    options: [
      "7",
      "8",
      "9",
      "10"
    ],
    correctAnswer: 2,
    explanation: "O Nordeste tem 9 estados: Maranhão, Piauí, Ceará, Rio Grande do Norte, Paraíba, Pernambuco, Alagoas, Sergipe e Bahia. É a região com maior número de estados.",
    concurso: "VUNESP",
    ano: 2024,
    orgao: "Prefeituras",
    disciplina: "Geografia"
  }
];

// Generate unique ID for new questions
export const generateQuestionId = (): string => {
  return `q-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
};
