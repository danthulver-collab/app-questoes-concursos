-- Adicionar campo para texto contextual nas questoes
ALTER TABLE questoes ADD COLUMN IF NOT EXISTS texto_contexto TEXT;

-- Adicionar também na tabela questoes_areas
ALTER TABLE questoes_areas ADD COLUMN IF NOT EXISTS texto_contexto TEXT;

-- Exemplo de update para adicionar texto em uma questão:
-- UPDATE questoes 
-- SET texto_contexto = 'Leia o texto abaixo e responda:\n\nTexto longo aqui...' 
-- WHERE id = 'q_port_001';
