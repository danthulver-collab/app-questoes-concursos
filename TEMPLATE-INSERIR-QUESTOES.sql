-- ============================================
-- TEMPLATE PARA INSERIR SUAS QUESTÕES
-- Copie este modelo e preencha com suas questões
-- ============================================

-- EXEMPLO DE COMO PREENCHER:
-- ('id_unico', 'Pergunta aqui', $$["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"]$$, 0, 'Portugues', 'CESPE', 'TRF', 2024, 'Comentário', 'medio', 'Texto contextual da questão aqui'),

INSERT INTO questoes (id, pergunta, alternativas, correta, disciplina, banca, concurso, ano, comentario, dificuldade, texto_contexto) VALUES

-- COLE SUAS QUESTÕES AQUI NO FORMATO:
-- ID único | Pergunta | [Alt A, Alt B, Alt C, Alt D] | Correta (0=A, 1=B, 2=C, 3=D) | Disciplina | Banca | Concurso | Ano | Comentário | Dificuldade | Texto

('minha_q_001', 'Sua pergunta aqui?', $$["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"]$$, 1, 'Portugues', 'CESPE', 'TRF', 2024, 'Explicação da resposta', 'medio', 'Texto longo da questão (se houver). Pode ser um parágrafo inteiro que aparece ao clicar no +'),

('minha_q_002', 'Segunda pergunta?', $$["Alt A", "Alt B", "Alt C", "Alt D"]$$, 0, 'Matematica', 'FCC', 'TRT', 2024, 'Resolução passo a passo', 'facil', NULL),

('minha_q_003', 'Terceira pergunta?', $$["A", "B", "C", "D"]$$, 2, 'Informatica', 'VUNESP', 'Prefeitura', 2024, 'Comentário', 'dificil', 'Enunciado longo da questão com contexto adicional...');

-- Continue copiando quantas questões quiser!
-- Lembre-se de colocar vírgula entre as questões, EXCETO na última

-- CAMPOS:
-- id: identificador único (ex: minha_q_001, minha_q_002...)
-- pergunta: texto da pergunta
-- alternativas: array JSON com 4 opções usando $$[...]$$
-- correta: 0=A, 1=B, 2=C, 3=D
-- disciplina: Portugues, Matematica, Informatica, Direito Constitucional, etc
-- banca: CESPE, FCC, FGV, VUNESP, etc
-- concurso: TRF, TRT, BB, PF, etc
-- ano: 2024, 2023, etc
-- comentario: explicação da resposta
-- dificuldade: facil, medio, dificil
-- texto_contexto: texto longo (enunciado) - pode ser NULL se não tiver
