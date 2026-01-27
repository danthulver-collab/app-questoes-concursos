INSERT INTO questoes (id, pergunta, alternativas, correta, disciplina, banca, concurso, ano, comentario, dificuldade) VALUES

('q_port_001', 'Assinale a alternativa em que a concordancia nominal esta CORRETA:', $$["E necessario paciencia.", "E necessaria a paciencia.", "E necessario a paciencia.", "Sao necessario paciencia."]$$, 1, 'Portugues', 'CESPE', 'INSS', 2024, 'Concordancia correta com artigo.', 'medio'),
('q_port_002', 'Em qual frase a crase esta empregada CORRETAMENTE?', $$["Vou a pe.", "Refiro-me a pessoa que chegou.", "Chegamos a duas horas.", "Comprei a vista."]$$, 1, 'Portugues', 'FCC', 'TRT', 2024, 'Crase correta: preposicao a + artigo a.', 'medio'),
('q_port_003', 'Quanto a colocacao pronominal, esta CORRETA:', $$["Me disseram que voce viajou.", "Nunca te enganei.", "Aqui trabalha-se muito.", "Tudo se resolve."]$$, 3, 'Portugues', 'VUNESP', 'Prefeitura', 2024, 'Palavra atrativa (tudo) exige proclise.', 'dificil'),
('q_port_004', 'Funcao sintatica de AO DIRETOR em Entregou o relatorio AO DIRETOR:', $$["Objeto direto", "Objeto indireto", "Complemento nominal", "Adjunto adverbial"]$$, 1, 'Portugues', 'CESPE', 'BB', 2024, 'Objeto indireto com preposicao.', 'medio'),
('q_port_005', 'Qual apresenta voz passiva analitica?', $$["Venderam-se produtos.", "Os produtos foram vendidos.", "Precisa-se de ajuda.", "Vendem-se casas."]$$, 1, 'Portugues', 'FGV', 'Camara', 2024, 'Auxiliar + participio.', 'medio'),

('q_mat_001', 'Preco de R$ 200 com aumento de 15%:', $$["R$ 215", "R$ 230", "R$ 225", "R$ 220"]$$, 1, 'Matematica', 'CESPE', 'BB', 2024, '200 x 1,15 = 230.', 'facil'),
('q_mat_002', 'R$ 500 com desconto de 20%:', $$["R$ 450", "R$ 400", "R$ 480", "R$ 420"]$$, 1, 'Matematica', 'FCC', 'TRT', 2024, '500 x 0,80 = 400.', 'facil'),
('q_mat_003', '25% de 840:', $$["200", "210", "220", "180"]$$, 1, 'Matematica', 'VUNESP', 'Prefeitura', 2024, '840 dividido por 4 = 210.', 'facil'),
('q_mat_004', 'Salario de R$ 3.000 com aumento de 8%:', $$["R$ 3.180", "R$ 3.240", "R$ 3.200", "R$ 3.280"]$$, 1, 'Matematica', 'CESPE', 'TCU', 2024, '3000 x 1,08 = 3240.', 'facil'),
('q_mat_005', '5 funcionarios fazem em 12 dias. Quantos dias para 3 funcionarios?', $$["15 dias", "20 dias", "18 dias", "24 dias"]$$, 1, 'Matematica', 'FCC', 'TJ-SP', 2024, 'Inversa: 5x12=60, 60/3=20.', 'medio'),

('q_info_001', 'Tecla de atalho para copiar:', $$["Ctrl+V", "Ctrl+C", "Ctrl+X", "Ctrl+Z"]$$, 1, 'Informatica', 'CESPE', 'TRE', 2024, 'Ctrl+C copia.', 'facil'),
('q_info_002', 'Negrito no Word:', $$["Ctrl+I", "Ctrl+B", "Ctrl+U", "Ctrl+N"]$$, 1, 'Informatica', 'FCC', 'TRT', 2024, 'Ctrl+B = Bold.', 'facil'),
('q_info_003', 'Extensao de arquivo compactado:', $$[".doc", ".zip", ".exe", ".pdf"]$$, 1, 'Informatica', 'VUNESP', 'Prefeitura', 2024, '.zip e compactado.', 'facil'),
('q_info_004', 'O que e navegador?', $$["Antivirus", "Programa para acessar sites", "Sistema operacional", "Firewall"]$$, 1, 'Informatica', 'CESPE', 'BB', 2024, 'Chrome, Firefox, Edge.', 'facil'),
('q_info_005', 'Funcao para media no Excel:', $$["=SOMA()", "=MEDIA()", "=CONT()", "=SE()"]$$, 1, 'Informatica', 'FCC', 'TCE', 2024, '=MEDIA() calcula media.', 'facil'),

('q_const_001', 'Todo poder emana:', $$["Do Presidente", "Do povo", "Do Congresso", "Dos Ministros"]$$, 1, 'Direito Constitucional', 'CESPE', 'TRF', 2024, 'Art. 1 paragrafo unico CF/88.', 'facil'),
('q_const_002', 'Poderes da Uniao:', $$["Executivo e Legislativo", "Executivo, Legislativo e Judiciario", "Legislativo e Judiciario", "Executivo e Judiciario"]$$, 1, 'Direito Constitucional', 'FCC', 'TRT', 2024, 'Art. 2 CF/88.', 'facil'),
('q_const_003', 'Mandato presidencial:', $$["3 anos", "4 anos", "5 anos", "6 anos"]$$, 1, 'Direito Constitucional', 'CESPE', 'PF', 2024, 'Art. 82: 4 anos com reeleicao.', 'facil'),
('q_const_004', 'Senadores por Estado:', $$["2", "3", "4", "Varia"]$$, 1, 'Direito Constitucional', 'FGV', 'OAB', 2024, 'Art. 46: 3 senadores.', 'facil'),
('q_const_005', 'Direitos fundamentais estao no Titulo:', $$["I", "II", "III", "IV"]$$, 1, 'Direito Constitucional', 'CESPE', 'TCU', 2024, 'Titulo II, arts. 5 a 17.', 'medio'),

('q_adm_001', 'Principios da Administracao Publica (Art. 37):', $$["LIMPE", "Apenas Legalidade", "LMP", "LIFE"]$$, 0, 'Direito Administrativo', 'CESPE', 'TCU', 2024, 'Legalidade, Impessoalidade, Moralidade, Publicidade, Eficiencia.', 'facil'),
('q_adm_002', 'Supremacia do interesse publico:', $$["Publico prevalece sobre privado", "Privado prevalece", "Sao iguais", "Nao ha"]$$, 0, 'Direito Administrativo', 'FCC', 'TRT', 2024, 'Interesse coletivo acima do particular.', 'facil'),
('q_adm_003', 'Poder de policia e:', $$["Punir servidores", "Limitar direitos pelo interesse publico", "Legislar", "Julgar"]$$, 1, 'Direito Administrativo', 'CESPE', 'PF', 2024, 'Condicionar uso de bens/atividades.', 'medio'),
('q_adm_004', 'Investidura em cargo depende de:', $$["Indicacao", "Concurso publico", "Vontade", "Taxa"]$$, 1, 'Direito Administrativo', 'FCC', 'TJ-SP', 2024, 'Art. 37, II: concurso publico.', 'facil'),
('q_adm_005', 'Estabilidade adquirida apos:', $$["1 ano", "2 anos", "3 anos", "5 anos"]$$, 2, 'Direito Administrativo', 'CESPE', 'TRE', 2024, 'Art. 41: 3 anos com avaliacao.', 'facil'),

('q_penal_001', 'Crime consumado quando:', $$["Ha intencao", "Reune todos elementos", "E descoberto", "Autor preso"]$$, 1, 'Direito Penal', 'CESPE', 'PF', 2024, 'Art. 14, I CP.', 'facil'),
('q_penal_002', 'Legitima defesa exclui:', $$["So pena", "Ilicitude", "So prisao", "Nada"]$$, 1, 'Direito Penal', 'FCC', 'TJ-SP', 2024, 'Art. 23 CP: excludente.', 'medio'),
('q_penal_003', 'Imputabilidade penal:', $$["16 anos", "18 anos", "21 anos", "14 anos"]$$, 1, 'Direito Penal', 'CESPE', 'PRF', 2024, 'Art. 228 CF e 27 CP: 18 anos.', 'facil'),
('q_penal_004', 'Roubo difere de furto por:', $$["Violencia ou grave ameaca", "Valor", "Ser de dia", "Lugar"]$$, 0, 'Direito Penal', 'FGV', 'OAB', 2024, 'Art. 157: violencia/ameaca.', 'facil'),
('q_penal_005', 'Dolo e quando agente:', $$["Age com culpa", "Quer resultado ou assume risco", "Age sem intencao", "Desconhece lei"]$$, 1, 'Direito Penal', 'CESPE', 'PC-DF', 2024, 'Art. 18, I: dolo direto/eventual.', 'medio'),

('q_raciocinio_001', 'Se Todos os gatos sao mamiferos e Todos os mamiferos sao animais, entao:', $$["Todos os animais sao gatos", "Todos os gatos sao animais", "Alguns animais nao sao gatos", "Nenhuma esta correta"]$$, 1, 'Raciocinio Logico', 'CESPE', 'TCU', 2024, 'Silogismo categorico.', 'medio'),
('q_raciocinio_002', 'A negacao de Todos os brasileiros sao altos e:', $$["Nenhum brasileiro e alto", "Alguns brasileiros nao sao altos", "Todos os brasileiros sao baixos", "Alguns sao altos"]$$, 1, 'Raciocinio Logico', 'FCC', 'TRT', 2024, 'Negacao de todo A e B = algum A nao e B.', 'medio'),
('q_raciocinio_003', 'Na sequencia 2, 5, 8, 11, qual o proximo numero?', $$["13", "14", "15", "16"]$$, 1, 'Raciocinio Logico', 'VUNESP', 'Prefeitura', 2024, 'PA com razao 3.', 'facil'),
('q_raciocinio_004', 'Em uma urna ha 3 bolas vermelhas e 2 azuis. Probabilidade de tirar uma vermelha?', $$["2/5", "3/5", "1/2", "3/2"]$$, 1, 'Raciocinio Logico', 'CESPE', 'BB', 2024, 'Probabilidade = 3/5.', 'facil'),
('q_raciocinio_005', 'Se p OU q e falso, entao:', $$["p e q sao falsos", "p e q sao verdadeiros", "p e falso e q verdadeiro", "p e verdadeiro"]$$, 0, 'Raciocinio Logico', 'FGV', 'TCM-RJ', 2024, 'Para p OU q ser falso, ambos devem ser falsos.', 'facil');
