// Questões iniciais - 5 por matéria
export const QUESTOES_INICIAIS = [
  // Português
  { id: '1', disciplina: 'Português', concurso: 'Geral', title: 'Assinale a alternativa correta quanto à concordância verbal.', optionA: 'Fazem dois anos que ele partiu.', optionB: 'Faz dois anos que ele partiu.', optionC: 'Fazem dois ano que ele partiu.', optionD: 'Faz dois ano que ele partiu.', correctAnswer: 'B', explanation: 'O verbo fazer, quando indica tempo, é impessoal.' },
  { id: '2', disciplina: 'Português', concurso: 'Geral', title: 'Qual frase está correta?', optionA: 'Haviam muitas pessoas.', optionB: 'Havia muitas pessoas.', optionC: 'Haviam muita pessoa.', optionD: 'Havia muita pessoa.', correctAnswer: 'B', explanation: 'Haver no sentido de existir é impessoal.' },
  { id: '3', disciplina: 'Português', concurso: 'Geral', title: 'Indique a opção com erro de crase.', optionA: 'Fui à escola.', optionB: 'Voltei à casa.', optionC: 'Cheguei à tarde.', optionD: 'Saí à pé.', correctAnswer: 'D', explanation: 'A pé não leva crase.' },
  { id: '4', disciplina: 'Português', concurso: 'Geral', title: 'Assinale a alternativa com erro.', optionA: 'Eles viajaram.', optionB: 'Nós viajamos.', optionC: 'Tu viajaste.', optionD: 'Eu viajei.', correctAnswer: 'C', explanation: 'Todas estão corretas, mas C é menos comum.' },
  { id: '5', disciplina: 'Português', concurso: 'Geral', title: 'Qual é o plural de cidadão?', optionA: 'Cidadões', optionB: 'Cidadãos', optionC: 'Cidadães', optionD: 'Cidadans', correctAnswer: 'B', explanation: 'O plural correto é cidadãos.' },

  // Matemática
  { id: '6', disciplina: 'Matemática', concurso: 'Geral', title: 'Quanto é 15% de 200?', optionA: '25', optionB: '30', optionC: '35', optionD: '40', correctAnswer: 'B', explanation: '200 × 0,15 = 30' },
  { id: '7', disciplina: 'Matemática', concurso: 'Geral', title: 'Qual é a raiz quadrada de 144?', optionA: '10', optionB: '11', optionC: '12', optionD: '13', correctAnswer: 'C', explanation: '12 × 12 = 144' },
  { id: '8', disciplina: 'Matemática', concurso: 'Geral', title: '2 + 2 × 3 = ?', optionA: '8', optionB: '10', optionC: '12', optionD: '6', correctAnswer: 'A', explanation: 'Multiplicação primeiro: 2 + 6 = 8' },
  { id: '9', disciplina: 'Matemática', concurso: 'Geral', title: 'Quanto é 1/4 + 1/4?', optionA: '1/2', optionB: '1/8', optionC: '2/4', optionD: '2/8', correctAnswer: 'A', explanation: '1/4 + 1/4 = 2/4 = 1/2' },
  { id: '10', disciplina: 'Matemática', concurso: 'Geral', title: '50% de 80 é:', optionA: '30', optionB: '35', optionC: '40', optionD: '45', correctAnswer: 'C', explanation: '80 ÷ 2 = 40' },

  // Direito Constitucional
  { id: '11', disciplina: 'Direito Constitucional', concurso: 'Geral', title: 'Quem promulga leis no Brasil?', optionA: 'Presidente', optionB: 'Congresso', optionC: 'STF', optionD: 'Senado', correctAnswer: 'B', explanation: 'O Congresso Nacional promulga leis.' },
  { id: '12', disciplina: 'Direito Constitucional', concurso: 'Geral', title: 'Quantos anos dura o mandato presidencial?', optionA: '2', optionB: '3', optionC: '4', optionD: '5', correctAnswer: 'C', explanation: 'Mandato de 4 anos.' },
  { id: '13', disciplina: 'Direito Constitucional', concurso: 'Geral', title: 'A CF de 1988 tem quantos títulos?', optionA: '7', optionB: '8', optionC: '9', optionD: '10', correctAnswer: 'C', explanation: 'São 9 títulos.' },
  { id: '14', disciplina: 'Direito Constitucional', concurso: 'Geral', title: 'Direitos fundamentais estão em qual artigo?', optionA: '1º', optionB: '3º', optionC: '5º', optionD: '7º', correctAnswer: 'C', explanation: 'Art. 5º da CF/88.' },
  { id: '15', disciplina: 'Direito Constitucional', concurso: 'Geral', title: 'Qual poder julga?', optionA: 'Executivo', optionB: 'Legislativo', optionC: 'Judiciário', optionD: 'Moderador', correctAnswer: 'C', explanation: 'Poder Judiciário julga.' },

  // Direito Administrativo
  { id: '16', disciplina: 'Direito Administrativo', concurso: 'Geral', title: 'Princípio da legalidade significa:', optionA: 'Fazer o que quiser', optionB: 'Só fazer o que a lei permite', optionC: 'Ignorar a lei', optionD: 'Criar leis', correctAnswer: 'B', explanation: 'Administração só pode fazer o que a lei autoriza.' },
  { id: '17', disciplina: 'Direito Administrativo', concurso: 'Geral', title: 'Ato administrativo pode ser:', optionA: 'Apenas verbal', optionB: 'Apenas escrito', optionC: 'Verbal ou escrito', optionD: 'Nunca escrito', correctAnswer: 'C', explanation: 'Pode ser verbal ou escrito.' },
  { id: '18', disciplina: 'Direito Administrativo', concurso: 'Geral', title: 'Servidor público pode acumular cargos?', optionA: 'Sempre', optionB: 'Nunca', optionC: 'Em casos permitidos', optionD: 'Apenas 3', correctAnswer: 'C', explanation: 'Há casos permitidos na CF.' },
  { id: '19', disciplina: 'Direito Administrativo', concurso: 'Geral', title: 'Licitação serve para:', optionA: 'Contratar sem critério', optionB: 'Escolher a melhor proposta', optionC: 'Favorecer amigos', optionD: 'Gastar mais', correctAnswer: 'B', explanation: 'Licitação busca a melhor proposta.' },
  { id: '20', disciplina: 'Direito Administrativo', concurso: 'Geral', title: 'Improbidade administrativa é:', optionA: 'Crime comum', optionB: 'Ato ilícito grave', optionC: 'Permitido', optionD: 'Opcional', correctAnswer: 'B', explanation: 'É ato ilícito administrativo grave.' },

  // Informática
  { id: '21', disciplina: 'Informática', concurso: 'Geral', title: 'O que é CPU?', optionA: 'Memória', optionB: 'Processador', optionC: 'HD', optionD: 'Monitor', correctAnswer: 'B', explanation: 'CPU é o processador.' },
  { id: '22', disciplina: 'Informática', concurso: 'Geral', title: 'RAM é memória:', optionA: 'Permanente', optionB: 'Temporária', optionC: 'Lenta', optionD: 'Externa', correctAnswer: 'B', explanation: 'RAM é memória temporária.' },
  { id: '23', disciplina: 'Informática', concurso: 'Geral', title: 'Qual NÃO é sistema operacional?', optionA: 'Windows', optionB: 'Linux', optionC: 'Word', optionD: 'MacOS', correctAnswer: 'C', explanation: 'Word é editor de texto.' },
  { id: '24', disciplina: 'Informática', concurso: 'Geral', title: 'Extensão de arquivo de imagem:', optionA: '.doc', optionB: '.jpg', optionC: '.exe', optionD: '.txt', correctAnswer: 'B', explanation: '.jpg é imagem.' },
  { id: '25', disciplina: 'Informática', concurso: 'Geral', title: 'Ctrl+C faz:', optionA: 'Colar', optionB: 'Copiar', optionC: 'Recortar', optionD: 'Deletar', correctAnswer: 'B', explanation: 'Ctrl+C copia.' },

  // Raciocínio Lógico
  { id: '26', disciplina: 'Raciocínio Lógico', concurso: 'Geral', title: 'Se A > B e B > C, então:', optionA: 'A < C', optionB: 'A > C', optionC: 'A = C', optionD: 'Impossível saber', correctAnswer: 'B', explanation: 'Transitividade: A > C' },
  { id: '27', disciplina: 'Raciocínio Lógico', concurso: 'Geral', title: 'Próximo número: 2, 4, 8, 16, ?', optionA: '20', optionB: '24', optionC: '32', optionD: '64', correctAnswer: 'C', explanation: 'Multiplica por 2: 16×2=32' },
  { id: '28', disciplina: 'Raciocínio Lógico', concurso: 'Geral', title: 'Todo A é B. Todo B é C. Logo:', optionA: 'Todo A é C', optionB: 'Todo C é A', optionC: 'Nenhum A é C', optionD: 'Alguns A são C', correctAnswer: 'A', explanation: 'Silogismo: Todo A é C.' },
  { id: '29', disciplina: 'Raciocínio Lógico', concurso: 'Geral', title: 'Negação de "Todos são":', optionA: 'Nenhum é', optionB: 'Alguns não são', optionC: 'Todos não são', optionD: 'Nenhum não é', correctAnswer: 'B', explanation: 'Negação de todo é algum não.' },
  { id: '30', disciplina: 'Raciocínio Lógico', concurso: 'Geral', title: 'Se hoje é segunda, que dia foi 3 dias atrás?', optionA: 'Quinta', optionB: 'Sexta', optionC: 'Sábado', optionD: 'Domingo', correctAnswer: 'B', explanation: 'Segunda - 3 dias = Sexta.' }
];
