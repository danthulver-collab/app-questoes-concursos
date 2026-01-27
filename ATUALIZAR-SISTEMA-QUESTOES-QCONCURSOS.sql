-- ============================================================
-- 🔥 ATUALIZAÇÃO COMPLETA - PADRÃO QCONCURSOS
-- Execute no Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1️⃣ AUMENTAR LIMITES DE CARACTERES (CAMPOS ILIMITADOS)
-- ============================================================

-- Tabela QUESTOES - Aumentar campos
ALTER TABLE questoes 
ALTER COLUMN pergunta TYPE TEXT,
ALTER COLUMN comentario TYPE TEXT,
ALTER COLUMN texto_contexto TYPE TEXT;

-- Adicionar novos campos se não existirem
DO $$ 
BEGIN
  -- Tipo de questão
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questoes' AND column_name = 'tipo_questao') THEN
    ALTER TABLE questoes ADD COLUMN tipo_questao TEXT DEFAULT 'multipla_escolha';
  END IF;
  
  -- Assertivas (para questões V/F e julgamento)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questoes' AND column_name = 'assertivas') THEN
    ALTER TABLE questoes ADD COLUMN assertivas JSONB;
  END IF;
  
  -- Sequência de respostas (V-F-V-V)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questoes' AND column_name = 'sequencia_vf') THEN
    ALTER TABLE questoes ADD COLUMN sequencia_vf TEXT;
  END IF;
  
  -- Gabarito textual (letra ou CERTO/ERRADO)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questoes' AND column_name = 'gabarito_texto') THEN
    ALTER TABLE questoes ADD COLUMN gabarito_texto TEXT;
  END IF;
END $$;

-- Tabela QUESTOES_AREAS - Aumentar campos
ALTER TABLE questoes_areas
ALTER COLUMN title TYPE TEXT,
ALTER COLUMN explanation TYPE TEXT,
ALTER COLUMN texto_contexto TYPE TEXT;

-- Adicionar novos campos em questoes_areas
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questoes_areas' AND column_name = 'tipo_questao') THEN
    ALTER TABLE questoes_areas ADD COLUMN tipo_questao TEXT DEFAULT 'multipla_escolha';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questoes_areas' AND column_name = 'assertivas') THEN
    ALTER TABLE questoes_areas ADD COLUMN assertivas JSONB;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questoes_areas' AND column_name = 'sequencia_vf') THEN
    ALTER TABLE questoes_areas ADD COLUMN sequencia_vf TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questoes_areas' AND column_name = 'gabarito_texto') THEN
    ALTER TABLE questoes_areas ADD COLUMN gabarito_texto TEXT;
  END IF;
END $$;

-- ============================================================
-- 2️⃣ CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================================

-- Índice por tipo de questão
CREATE INDEX IF NOT EXISTS idx_questoes_tipo ON questoes(tipo_questao);
CREATE INDEX IF NOT EXISTS idx_questoes_areas_tipo ON questoes_areas(tipo_questao);

-- Índice por disciplina
CREATE INDEX IF NOT EXISTS idx_questoes_disciplina ON questoes(disciplina);
CREATE INDEX IF NOT EXISTS idx_questoes_areas_materia ON questoes_areas(materia_id);

-- ============================================================
-- 3️⃣ VERIFICAR ESTRUTURA ATUALIZADA
-- ============================================================

-- Verificar campos da tabela questoes
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'questoes' 
ORDER BY ordinal_position;

-- Verificar campos da tabela questoes_areas
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'questoes_areas' 
ORDER BY ordinal_position;

-- ============================================================
-- 4️⃣ COMENTÁRIOS DOS CAMPOS (DOCUMENTAÇÃO)
-- ============================================================

COMMENT ON COLUMN questoes.tipo_questao IS 'Tipos: multipla_escolha, certo_errado, verdadeiro_falso, assertivas, julgamento_itens';
COMMENT ON COLUMN questoes.assertivas IS 'Array JSON com assertivas numeradas (I, II, III...)';
COMMENT ON COLUMN questoes.sequencia_vf IS 'Sequência de V/F para alternativas. Ex: V-F-V-F';
COMMENT ON COLUMN questoes.gabarito_texto IS 'Gabarito textual: letra (A-E) ou CERTO/ERRADO';
COMMENT ON COLUMN questoes.texto_contexto IS 'Texto de contextualização, caso clínico, lei, etc.';
COMMENT ON COLUMN questoes.comentario IS 'Comentário explicativo separado (campo independente)';

-- ============================================================
-- 🎯 LIMITES PADRÃO QCONCURSOS (REFERÊNCIA)
-- ============================================================
-- 
-- ENUNCIADO (pergunta): até 900 caracteres (recomendado)
-- ALTERNATIVAS: 4 alternativas (A, B, C, D), extensão similar
-- COMENTÁRIO: até 1200 caracteres (recomendado)
-- CONTEXTO: sem limite (textos de lei, jurisprudência, etc)
--
-- TIPOS DE QUESTÃO:
-- 1. multipla_escolha: A, B, C, D (padrão)
-- 2. certo_errado: apenas CERTO ou ERRADO
-- 3. verdadeiro_falso: assertivas I, II, III + V/F
-- 4. assertivas: afirmativas numeradas com combinação
-- 5. julgamento_itens: julgue cada item separadamente
--
-- ============================================================
