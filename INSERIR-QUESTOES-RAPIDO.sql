-- ============================================
-- INSERÇÃO RÁPIDA DE QUESTÕES
-- Execute este SQL no Supabase
-- ============================================

-- Limpar questões anteriores de teste (opcional)
-- DELETE FROM questoes WHERE banca IN ('CESPE', 'FCC', 'VUNESP', 'FGV');

-- PORTUGUÊS (15 questões)
INSERT INTO questoes (id, pergunta, alternativas, correta, disciplina, banca, concurso, ano, comentario, dificuldade) VALUES
('q_port_001', 'Assinale a alternativa em que a concordância nominal está CORRETA:', $$["É necessário paciência.", "É necessária a paciência.", "É necessário a paciência.", "São necessário paciência."]$$, 1, 'Português', 'CESPE', 'INSS', 2024, 'Concordância correta com artigo "a".', 'medio'),
('q_port_002', 'Em qual frase a crase está empregada CORRETAMENTE?', $$["Vou a pé.", "Refiro-me à pessoa que chegou.", "Chegamos à duas horas.", "Comprei à vista."]$$, 1, 'Português', 'FCC', 'TRT', 2024, 'Crase correta: preposição a + artigo a.', 'medio'),
('q_port_003', 'Quanto à colocação pronominal, está CORRETA:', $$["Me disseram que você viajou.", "Nunca te enganei.", "Aqui trabalha-se muito.", "Tudo se resolve."]$$, 3, 'Português', 'VUNESP', 'Prefeitura', 2024, 'Palavra atrativa (tudo) exige próclise.', 'dificil'),
('q_port_004', 'Função sintática de AO DIRETOR em "Entregou o relatório AO DIRETOR":', $$["Objeto direto", "Objeto indireto", "Complemento nominal", "Adjunto adverbial"]$$, 1, 'Português', 'CESPE', 'BB', 2024, 'Objeto indireto com preposição.', 'medio'),
('q_port_005', 'Qual apresenta voz passiva analítica?', $$["Venderam-se produtos.", "Os produtos foram vendidos.", "Precisa-se de ajuda.", "Vendem-se casas."]$$, 1, 'Português', 'FGV', 'Câmara', 2024, 'Auxiliar + particípio.', 'medio'),
('q_port_006', 'Em "Machado de Assis, QUE FOI UM GRANDE ESCRITOR, nasceu no Rio", a oração destacada é:', $$["Subordinada adjetiva explicativa", "Subordinada adjetiva restritiva", "Coordenada explicativa", "Subordinada substantiva"]$$, 0, 'Português', 'CESPE', 'TRF', 2024, 'Entre vírgulas, explica.', 'medio'),
('q_port_007', 'Há ERRO de regência verbal em:', $$["Assisti ao filme.", "Prefiro café do que chá.", "Esqueci-me do compromisso.", "Simpatizei com ela."]$$, 1, 'Português', 'FCC', 'TJ-SP', 2024, 'Preferir exige A a B, não do que.', 'dificil'),
('q_port_008', 'Pronome relativo INCORRETO:', $$["A casa onde moro.", "O livro cujas páginas rasgaram.", "A pessoa que chegou.", "O filme que assisti."]$$, 3, 'Português', 'CESPE', 'CGU', 2024, 'Assistir exige preposição: a que.', 'dificil'),
('q_port_009', 'Apresenta ambiguidade:', $$["O diretor convocou os funcionários que estavam atrasados.", "O diretor convocou os funcionários, que estavam atrasados.", "O diretor convocou todos.", "O diretor convocou apenas atrasados."]$$, 0, 'Português', 'CESPE', 'TRE', 2024, 'Sem vírgula pode ser ambíguo.', 'dificil'),
('q_port_010', 'Uso CORRETO de mau:', $$["Ele é um mau aluno.", "Ele passou mau.", "O mau tempo.", "Todos os mau exemplos."]$$, 0, 'Português', 'FCC', 'TRT', 2024, 'Mau é adjetivo, oposto de bom.', 'facil'),
('q_port_011', 'Figura de linguagem em "A vida é uma caixa de surpresas":', $$["Metáfora", "Comparação", "Metonímia", "Personificação"]$$, 0, 'Português', 'VUNESP', 'SEDUC', 2024, 'Metáfora é comparação implícita.', 'facil'),
('q_port_012', 'Pronome de tratamento para Prefeito:', $$["Vossa Excelência", "Vossa Senhoria", "Vossa Magnificência", "Vossa Eminência"]$$, 0, 'Português', 'CESPE', 'Prefeitura', 2024, 'Prefeitos usam Vossa Excelência.', 'facil'),
('q_port_013', 'ERRO de pontuação em:', $$["Estudei, porém não passei.", "Estudei; no entanto, não passei.", "Estudei, no entanto não passei.", "Estudei. No entanto, passei."]$$, 2, 'Português', 'FGV', 'TJ-RJ', 2024, 'Conjunção deslocada pede vírgulas.', 'medio'),
('q_port_014', 'Quantos núcleos tem o objeto direto em "Comprei DOIS LIVROS E TRÊS CADERNOS"?', $$["Um", "Dois", "Três", "Nenhum"]$$, 1, 'Português', 'CESPE', 'INSS', 2024, 'Objeto direto composto: livros e cadernos.', 'facil'),
('q_port_015', 'Oração subordinada substantiva objetiva direta:', $$["É importante que você estude.", "Espero que você passe.", "Tenho certeza de que vai dar certo.", "A verdade é que ele mentiu."]$$, 1, 'Português', 'FCC', 'TCE', 2024, 'É objeto direto do verbo esperar.', 'dificil');

-- MATEMÁTICA (15 questões)
INSERT INTO questoes (id, pergunta, alternativas, correta, disciplina, banca, concurso, ano, comentario, dificuldade) VALUES
('q_mat_001', 'Preço de R$ 200 com aumento de 15%:', $$["R$ 215", "R$ 230", "R$ 225", "R$ 220"]$$, 1, 'Matemática', 'CESPE', 'BB', 2024, '200 × 1,15 = 230.', 'facil'),
('q_mat_002', 'R$ 500 com desconto de 20%:', $$["R$ 450", "R$ 400", "R$ 480", "R$ 420"]$$, 1, 'Matemática', 'FCC', 'TRT', 2024, '500 × 0,80 = 400.', 'facil'),
('q_mat_003', '25% de 840:', $$["200", "210", "220", "180"]$$, 1, 'Matemática', 'VUNESP', 'Prefeitura', 2024, '840 ÷ 4 = 210.', 'facil'),
('q_mat_004', 'Salário de R$ 3.000 com aumento de 8%:', $$["R$ 3.180", "R$ 3.240", "R$ 3.200", "R$ 3.280"]$$, 1, 'Matemática', 'CESPE', 'TCU', 2024, '3000 × 1,08 = 3240.', 'facil'),
('q_mat_005', '5 funcionários fazem em 12 dias. Quantos dias para 3 funcionários?', $$["15 dias", "20 dias", "18 dias", "24 dias"]$$, 1, 'Matemática', 'FCC', 'TJ-SP', 2024, 'Inversa: 5×12=60, 60÷3=20.', 'medio'),
('q_mat_006', 'Torneira A enche em 6h, B em 3h. Juntas:', $$["1,5h", "2h", "2,5h", "4,5h"]$$, 1, 'Matemática', 'CESPE', 'PF', 2024, '1/6 + 1/3 = 1/2 por hora = 2h.', 'medio'),
('q_mat_007', 'Triplo de um número menos 15 é 45. O número é:', $$["15", "20", "25", "30"]$$, 1, 'Matemática', 'FGV', 'TJ-RJ', 2024, '3x-15=45, x=20.', 'facil'),
('q_mat_008', 'Média de 5 números é 18. Retirando 8, nova média:', $$["20", "20,5", "19", "21"]$$, 0, 'Matemática', 'CESPE', 'INSS', 2024, 'Soma 90, retira 8: 82÷4=20,5.', 'medio'),
('q_mat_009', '60% são homens. 80 homens = quantos no total?', $$["120", "133", "140", "150"]$$, 1, 'Matemática', 'FCC', 'TRE', 2024, '60%=80, 100%≈133.', 'medio'),
('q_mat_010', 'R$ 10.000 a 2% ao mês por 6 meses (juros simples):', $$["R$ 1.000", "R$ 1.200", "R$ 1.500", "R$ 2.000"]$$, 1, 'Matemática', 'CESPE', 'BB', 2024, 'J=10000×0,02×6=1200.', 'facil'),
('q_mat_011', '3/5 de um número é 45. O número é:', $$["60", "75", "90", "105"]$$, 1, 'Matemática', 'VUNESP', 'TCM', 2024, '45×5/3=75.', 'facil'),
('q_mat_012', 'Área de retângulo 8cm × 5cm:', $$["13 cm²", "26 cm²", "40 cm²", "80 cm²"]$$, 2, 'Matemática', 'CESPE', 'TRT', 2024, '8×5=40.', 'facil'),
('q_mat_013', '8 horas/dia. Quantos dias para 120 horas?', $$["12", "15", "18", "20"]$$, 1, 'Matemática', 'FCC', 'SABESP', 2024, '120÷8=15.', 'facil'),
('q_mat_014', 'Se 2x+5=19, x é:', $$["5", "6", "7", "8"]$$, 2, 'Matemática', 'CESPE', 'PRF', 2024, '2x=14, x=7.', 'facil'),
('q_mat_015', 'Quantos minutos em 2,5 horas?', $$["120", "130", "150", "180"]$$, 2, 'Matemática', 'FGV', 'Câmara', 2024, '2,5×60=150.', 'facil');

-- INFORMÁTICA (15 questões)
INSERT INTO questoes (id, pergunta, alternativas, correta, disciplina, banca, concurso, ano, comentario, dificuldade) VALUES
('q_info_001', 'Tecla de atalho para copiar:', $$["Ctrl+V", "Ctrl+C", "Ctrl+X", "Ctrl+Z"]$$, 1, 'Informática', 'CESPE', 'TRE', 2024, 'Ctrl+C copia.', 'facil'),
('q_info_002', 'Negrito no Word:', $$["Ctrl+I", "Ctrl+B", "Ctrl+U", "Ctrl+N"]$$, 1, 'Informática', 'FCC', 'TRT', 2024, 'Ctrl+B = Bold.', 'facil'),
('q_info_003', 'Extensão de arquivo compactado:', $$[".doc", ".zip", ".exe", ".pdf"]$$, 1, 'Informática', 'VUNESP', 'Prefeitura', 2024, '.zip é compactado.', 'facil'),
('q_info_004', 'O que é navegador?', $$["Antivírus", "Programa para acessar sites", "Sistema operacional", "Firewall"]$$, 1, 'Informática', 'CESPE', 'BB', 2024, 'Chrome, Firefox, Edge.', 'facil'),
('q_info_005', 'Função para média no Excel:', $$["=SOMA()", "=MÉDIA()", "=CONT()", "=SE()"]$$, 1, 'Informática', 'FCC', 'TCE', 2024, '=MÉDIA() calcula média.', 'facil'),
('q_info_006', 'Protocolo para ENVIAR emails:', $$["HTTP", "FTP", "SMTP", "POP3"]$$, 2, 'Informática', 'CESPE', 'TRF', 2024, 'SMTP envia, POP3 recebe.', 'medio'),
('q_info_007', 'HTTP significa:', $$["HyperText Transfer Protocol", "High Transfer Text Protocol", "HyperText Transmission", "High Text Transfer"]$$, 0, 'Informática', 'FGV', 'Câmara', 2024, 'Protocolo de transferência.', 'facil'),
('q_info_008', 'Tecla para atualizar página:', $$["F1", "F5", "F12", "F4"]$$, 1, 'Informática', 'VUNESP', 'SEDUC', 2024, 'F5 atualiza.', 'facil'),
('q_info_009', 'O que é firewall?', $$["Backup", "Barreira de segurança de rede", "Antivírus", "Editor"]$$, 1, 'Informática', 'CESPE', 'PF', 2024, 'Controla tráfego de rede.', 'medio'),
('q_info_010', 'Selecionar tudo:', $$["Ctrl+S", "Ctrl+A", "Ctrl+T", "Ctrl+E"]$$, 1, 'Informática', 'FCC', 'TJ-SP', 2024, 'Ctrl+A = All.', 'facil'),
('q_info_011', 'DNS serve para:', $$["Enviar emails", "Traduzir nomes em IPs", "Proteger vírus", "Backup"]$$, 1, 'Informática', 'CESPE', 'TCU', 2024, 'Traduz domínio em IP.', 'medio'),
('q_info_012', 'Cloud computing é:', $$["Antivírus", "Armazenamento remoto via internet", "Navegador", "Sistema operacional"]$$, 1, 'Informática', 'FGV', 'TJ-RJ', 2024, 'Nuvem: Google Drive, Dropbox.', 'facil'),
('q_info_013', 'Diferença RAM e HD:', $$["Não há", "RAM temporária, HD permanente", "RAM permanente, HD temporária", "Ambos temporários"]$$, 1, 'Informática', 'CESPE', 'INSS', 2024, 'RAM rápida/temporária, HD lenta/permanente.', 'medio'),
('q_info_014', 'O que é phishing?', $$["Vírus", "Fraude para roubo de dados", "Editor", "Firewall"]$$, 1, 'Informática', 'CESPE', 'PF', 2024, 'Engenharia social para roubar dados.', 'medio'),
('q_info_015', 'Onde ficam arquivos excluídos?', $$["Documentos", "Lixeira", "Desktop", "Downloads"]$$, 1, 'Informática', 'CESPE', 'TRE', 2024, 'Lixeira armazena temporariamente.', 'facil');

-- DIREITO CONSTITUCIONAL (15 questões)
INSERT INTO questoes (id, pergunta, alternativas, correta, disciplina, banca, concurso, ano, comentario, dificuldade) VALUES
('q_const_001', 'Todo poder emana:', $$["Do Presidente", "Do povo", "Do Congresso", "Dos Ministros"]$$, 1, 'Direito Constitucional', 'CESPE', 'TRF', 2024, 'Art. 1º, parágrafo único CF/88.', 'facil'),
('q_const_002', 'Poderes da União:', $$["Executivo e Legislativo", "Executivo, Legislativo e Judiciário", "Legislativo e Judiciário", "Executivo e Judiciário"]$$, 1, 'Direito Constitucional', 'FCC', 'TRT', 2024, 'Art. 2º CF/88.', 'facil'),
('q_const_003', 'Mandato presidencial:', $$["3 anos", "4 anos", "5 anos", "6 anos"]$$, 1, 'Direito Constitucional', 'CESPE', 'PF', 2024, 'Art. 82: 4 anos com reeleição.', 'facil'),
('q_const_004', 'Senadores por Estado:', $$["2", "3", "4", "Varia"]$$, 1, 'Direito Constitucional', 'FGV', 'OAB', 2024, 'Art. 46: 3 senadores.', 'facil'),
('q_const_005', 'Direitos fundamentais estão no Título:', $$["I", "II", "III", "IV"]$$, 1, 'Direito Constitucional', 'CESPE', 'TCU', 2024, 'Título II, arts. 5º a 17.', 'medio'),
('q_const_006', 'Remédio para direito líquido e certo:', $$["HC", "Mandado de Segurança", "HD", "Ação Popular"]$$, 1, 'Direito Constitucional', 'FCC', 'TJ-SP', 2024, 'MS protege direito líquido e certo.', 'medio'),
('q_const_007', 'Saúde é direito de:', $$["Quem paga", "Todos", "Trabalhadores", "Idosos"]$$, 1, 'Direito Constitucional', 'CESPE', 'SUS', 2024, 'Art. 196: direito de todos.', 'facil'),
('q_const_008', 'Princípio da legalidade:', $$["Ninguém obrigado senão por lei", "Todos iguais", "Lei retroage", "Juiz cria leis"]$$, 0, 'Direito Constitucional', 'FCC', 'TRE', 2024, 'Art. 5º, II: só lei obriga.', 'facil'),
('q_const_009', 'Entrada em domicílio sem consentimento:', $$["Dia/noite com ordem", "Flagrante a qualquer hora", "Só de dia", "Nunca"]$$, 1, 'Direito Constitucional', 'CESPE', 'PRF', 2024, 'Art. 5º, XI: flagrante qualquer hora.', 'medio'),
('q_const_010', 'Idade mínima para Presidente:', $$["21", "25", "30", "35"]$$, 3, 'Direito Constitucional', 'FGV', 'OAB', 2024, 'Art. 14: 35 anos.', 'facil'),
('q_const_011', 'Voto no Brasil:', $$["Obrigatório todos", "Facultativo todos", "Obrigatório 18-70", "Só homens"]$$, 2, 'Direito Constitucional', 'CESPE', 'TRE', 2024, 'Art. 14: obrigatório 18-70.', 'medio'),
('q_const_012', 'Deputados Federais:', $$["513", "594", "81", "243"]$$, 0, 'Direito Constitucional', 'FCC', 'TRT', 2024, 'Art. 45: 513 deputados.', 'medio'),
('q_const_013', 'Julga Presidente por crime de responsabilidade:', $$["STF", "Senado", "Câmara", "TSE"]$$, 1, 'Direito Constitucional', 'CESPE', 'AGU', 2024, 'Art. 52, I: Senado julga.', 'medio'),
('q_const_014', 'HC protege:', $$["Expressão", "Locomoção", "Imprensa", "Religião"]$$, 1, 'Direito Constitucional', 'CESPE', 'DPE', 2024, 'Art. 5º, LXVIII: liberdade ir/vir.', 'facil'),
('q_const_015', 'STF tem quantos Ministros:', $$["9", "11", "13", "15"]$$, 1, 'Direito Constitucional', 'FGV', 'OAB', 2024, 'Art. 101: 11 Ministros.', 'facil');

-- DIREITO ADMINISTRATIVO (15 questões)  
INSERT INTO questoes (id, pergunta, alternativas, correta, disciplina, banca, concurso, ano, comentario, dificuldade) VALUES
('q_adm_001', 'Princípios da Administração Pública (Art. 37):', $$["LIMPE", "Apenas Legalidade", "LMP", "LIFE"]$$, 0, 'Direito Administrativo', 'CESPE', 'TCU', 2024, 'Legalidade, Impessoalidade, Moralidade, Publicidade, Eficiência.', 'facil'),
('q_adm_002', 'Supremacia do interesse público:', $$["Público prevalece sobre privado", "Privado prevalece", "São iguais", "Não há"]$$, 0, 'Direito Administrativo', 'FCC', 'TRT', 2024, 'Interesse coletivo acima do particular.', 'facil'),
('q_adm_003', 'Poder de polícia é:', $$["Punir servidores", "Limitar direitos pelo interesse público", "Legislar", "Julgar"]$$, 1, 'Direito Administrativo', 'CESPE', 'PF', 2024, 'Condicionar uso de bens/atividades.', 'medio'),
('q_adm_004', 'Investidura em cargo depende de:', $$["Indicação", "Concurso público", "Vontade", "Taxa"]$$, 1, 'Direito Administrativo', 'FCC', 'TJ-SP', 2024, 'Art. 37, II: concurso público.', 'facil'),
('q_adm_005', 'Estabilidade adquirida após:', $$["1 ano", "2 anos", "3 anos", "5 anos"]$$, 2, 'Direito Administrativo', 'CESPE', 'TRE', 2024, 'Art. 41: 3 anos com avaliação.', 'facil'),
('q_adm_006', 'Revogação atinge ato:', $$["Legal e oportuno", "Ilegal", "Inconstitucional", "Nulo"]$$, 0, 'Direito Administrativo', 'FGV', 'TCM', 2024, 'Revoga ato legal. Anula ato ilegal.', 'medio'),
('q_adm_007', 'Licitação obrigatória para:', $$["Só compras grandes", "Obras, serviços, compras", "Só obras", "Não obrigatória"]$$, 1, 'Direito Administrativo', 'CESPE', 'CGU', 2024, 'Art. 37, XXI.', 'facil'),
('q_adm_008', 'Modalidade para obras de grande vulto:', $$["Convite", "Tomada de Preços", "Concorrência", "Pregão"]$$, 2, 'Direito Administrativo', 'FCC', 'TRF', 2024, 'Concorrência: grandes valores.', 'medio'),
('q_adm_009', 'Acumular 2 cargos:', $$["Nunca", "Se houver compatibilidade", "Sempre", "Só com autorização"]$$, 1, 'Direito Administrativo', 'CESPE', 'INSS', 2024, 'Art. 37, XVI: compatibilidade.', 'medio'),
('q_adm_010', 'Autotutela significa:', $$["Administração revê próprios atos", "Só Judiciário anula", "Não pode anular", "Não revê"]$$, 0, 'Direito Administrativo', 'FCC', 'TCE', 2024, 'Súmula 473 STF.', 'medio'),
('q_adm_011', 'Prescrição disciplinar:', $$["2 anos", "3 anos", "5 anos", "10 anos"]$$, 2, 'Direito Administrativo', 'CESPE', 'TRF', 2024, 'Lei 8.112/90: 5 anos.', 'dificil'),
('q_adm_012', 'Desapropriação pode ser por:', $$["Só necessidade", "Necessidade, utilidade ou interesse social", "Não precisa indenização", "Só Presidente"]$$, 1, 'Direito Administrativo', 'FCC', 'TJ-PE', 2024, 'Três hipóteses com indenização.', 'medio'),
('q_adm_013', 'Concessão de serviço é:', $$["Transferência definitiva", "Delegação temporária", "Venda", "Extinção"]$$, 1, 'Direito Administrativo', 'CESPE', 'ANAC', 2024, 'Delegação contratual temporária.', 'medio'),
('q_adm_014', 'Responsabilidade do Estado:', $$["Subjetiva", "Objetiva", "Não existe", "Só por dolo"]$$, 1, 'Direito Administrativo', 'CESPE', 'AGU', 2024, 'Art. 37, §6º: objetiva.', 'medio'),
('q_adm_015', 'Controle externo por:', $$["Própria Administração", "Congresso com TCU", "Só TCU", "Só Presidente"]$$, 1, 'Direito Administrativo', 'FCC', 'TCU', 2024, 'Art. 71: Congresso + TCU.', 'medio');

-- DIREITO PENAL (15 questões)
INSERT INTO questoes (id, pergunta, alternativas, correta, disciplina, banca, concurso, ano, comentario, dificuldade) VALUES
('q_penal_001', 'Crime consumado quando:', $$["Há intenção", "Reúne todos elementos", "É descoberto", "Autor preso"]$$, 1, 'Direito Penal', 'CESPE', 'PF', 2024, 'Art. 14, I CP.', 'facil'),
('q_penal_002', 'Legítima defesa exclui:', $$["Só pena", "Ilicitude", "Só prisão", "Nada"]$$, 1, 'Direito Penal', 'FCC', 'TJ-SP', 2024, 'Art. 23 CP: excludente.', 'medio'),
('q_penal_003', 'Imputabilidade penal:', $$["16 anos", "18 anos", "21 anos", "14 anos"]$$, 1, 'Direito Penal', 'CESPE', 'PRF', 2024, 'Art. 228 CF e 27 CP: 18 anos.', 'facil'),
('q_penal_004', 'Roubo difere de furto por:', $$["Violência ou grave ameaça", "Valor", "Ser de dia", "Lugar"]$$, 0, 'Direito Penal', 'FGV', 'OAB', 2024, 'Art. 157: violência/ameaça.', 'facil'),
('q_penal_005', 'Dolo é quando agente:', $$["Age com culpa", "Quer resultado ou assume risco", "Age sem intenção", "Desconhece lei"]$$, 1, 'Direito Penal', 'CESPE', 'PC-DF', 2024, 'Art. 18, I: dolo direto/eventual.', 'medio'),
('q_penal_006', 'Pena perpétua no Brasil:', $$["Sim", "Não, vedada", "Só hediondos", "Só terrorismo"]$$, 1, 'Direito Penal', 'FCC', 'TRT', 2024, 'Art. 5º, XLVII, b: vedada.', 'facil'),
('q_penal_007', 'Pena máxima no CP:', $$["20 anos", "30 anos", "40 anos", "Perpétua"]$$, 2, 'Direito Penal', 'CESPE', 'AGU', 2024, 'Art. 75 CP: 40 anos.', 'medio'),
('q_penal_008', 'Erro de tipo exclui:', $$["Só pena", "Dolo", "Culpabilidade", "Nada"]$$, 1, 'Direito Penal', 'FCC', 'DPE', 2024, 'Art. 20: exclui dolo.', 'dificil'),
('q_penal_009', 'Crimes hediondos são:', $$["Inafiançáveis", "Afiançáveis", "Prescritos em 5 anos", "Só multa"]$$, 0, 'Direito Penal', 'CESPE', 'PF', 2024, 'Art. 5º, XLIII CF.', 'medio'),
('q_penal_010', 'Homicídio qualificado:', $$["6-20 anos", "12-30 anos", "2-6 anos", "1-3 anos"]$$, 1, 'Direito Penal', 'CESPE', 'PC-SP', 2024, 'Art. 121, §2º: 12-30 anos.', 'medio'),
('q_penal_011', 'Peculato é praticado por:', $$["Qualquer pessoa", "Funcionário público", "Só políticos", "Só juízes"]$$, 1, 'Direito Penal', 'FCC', 'TCE', 2024, 'Art. 312: crime próprio.', 'medio'),
('q_penal_012', 'Pena da tentativa:', $$["Igual consumado", "Reduzida 1/3 a 2/3", "Não punível", "Aumentada"]$$, 1, 'Direito Penal', 'CESPE', 'PRF', 2024, 'Art. 14, parágrafo único.', 'facil'),
('q_penal_013', 'Crime impossível ocorre quando:', $$["Meio ineficaz ou objeto inexistente", "Há tentativa", "Há consumação", "É descoberto"]$$, 0, 'Direito Penal', 'FCC', 'DPE', 2024, 'Art. 17: não punível.', 'medio'),
('q_penal_014', 'Embriaguez voluntária:', $$["Exclui crime", "Não exclui imputabilidade", "Reduz pena", "Exclui culpabilidade"]$$, 1, 'Direito Penal', 'FCC', 'TJ-SP', 2024, 'Art. 28, II: não exclui.', 'medio'),
('q_penal_015', 'Extinção da punibilidade por:', $$["Só perdão", "Morte, prescrição, anistia etc", "Só prescrição", "Não extingue"]$$, 1, 'Direito Penal', 'FCC', 'TJ-PE', 2024, 'Art. 107: várias causas.', 'medio');

-- DIREITO TRIBUTÁRIO (10 questões)
INSERT INTO questoes (id, pergunta, alternativas, correta, disciplina, banca, concurso, ano, comentario, dificuldade) VALUES
('q_trib_001', 'São tributos:', $$["Impostos, taxas, contribuições", "Só impostos", "Só taxas", "Multas e impostos"]$$, 0, 'Direito Tributário', 'CESPE', 'Receita', 2024, 'CTN Art. 5º.', 'facil'),
('q_trib_002', 'Fato gerador do IPTU:', $$["Veículo", "Imóvel urbano", "Renda", "Mercadorias"]$$, 1, 'Direito Tributário', 'FCC', 'ISS-SP', 2024, 'Propriedade imóvel urbano.', 'facil'),
('q_trib_003', 'ICMS é competência:', $$["Federal", "Estadual", "Municipal", "Distrital"]$$, 1, 'Direito Tributário', 'CESPE', 'SEFAZ', 2024, 'Art. 155 CF.', 'facil'),
('q_trib_004', 'Isenção é:', $$["Dispensa legal", "Não pagamento ilegal", "Parcial", "Atrasado"]$$, 0, 'Direito Tributário', 'CESPE', 'Receita', 2024, 'CTN Art. 175.', 'medio'),
('q_trib_005', 'Imunidade prevista em:', $$["Lei ordinária", "Constituição", "Decreto", "Portaria"]$$, 1, 'Direito Tributário', 'FCC', 'ISS-RJ', 2024, 'CF Art. 150, VI.', 'medio'),
('q_trib_006', 'São imunes:', $$["Templos", "Empresas", "Só católicos", "Shoppings"]$$, 0, 'Direito Tributário', 'CESPE', 'SEFAZ', 2024, 'Art. 150, VI, b.', 'facil'),
('q_trib_007', 'Prescrição do crédito tributário:', $$["3 anos", "5 anos", "10 anos", "20 anos"]$$, 1, 'Direito Tributário', 'FCC', 'Receita', 2024, 'CTN Art. 174: 5 anos.', 'medio'),
('q_trib_008', 'ISS é competência:', $$["Federal", "Estadual", "Municipal", "Não existe"]$$, 2, 'Direito Tributário', 'CESPE', 'Prefeitura', 2024, 'Art. 156, III: municipal.', 'facil'),
('q_trib_009', 'ITBI incide sobre:', $$["Mercadorias", "Transmissão imóveis", "Serviços", "Propriedade urbana"]$$, 1, 'Direito Tributário', 'FCC', 'Prefeitura-RJ', 2024, 'Art. 156, II: municipal.', 'facil'),
('q_trib_010', 'ITR é imposto sobre:', $$["Urbana", "Propriedade rural", "Renda", "Veículos"]$$, 1, 'Direito Tributário', 'FCC', 'Receita', 2024, 'Art. 153, VI: federal.', 'facil');

-- Pronto! Total: ~100 questões
