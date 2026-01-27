-- ============================================
-- AUMENTAR LIMITES DE CAMPOS - SEM RESTRIÇÕES
-- Execute no Supabase para aceitar questões grandes
-- ============================================

-- TABELA QUESTOES - Campos ilimitados
ALTER TABLE questoes 
ALTER COLUMN pergunta TYPE TEXT,
ALTER COLUMN comentario TYPE TEXT,
ALTER COLUMN texto_contexto TYPE TEXT;

-- TABELA QUESTOES_AREAS - Campos ilimitados
ALTER TABLE questoes_areas
ALTER COLUMN title TYPE TEXT,
ALTER COLUMN explanation TYPE TEXT,
ALTER COLUMN texto_contexto TYPE TEXT;

-- Verificar tipos atualizados
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'questoes' 
AND column_name IN ('pergunta', 'comentario', 'texto_contexto');

SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'questoes_areas' 
AND column_name IN ('title', 'explanation', 'texto_contexto');
