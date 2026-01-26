-- ==============================================
-- TABELA: questoes_areas
-- Execute este SQL no Supabase SQL Editor
-- ==============================================

-- Criar tabela para questões por área
CREATE TABLE IF NOT EXISTS questoes_areas (
  id TEXT PRIMARY KEY,
  area_id TEXT NOT NULL,
  materia_id TEXT NOT NULL,
  title TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer INTEGER NOT NULL DEFAULT 0,
  explanation TEXT,
  plano TEXT DEFAULT 'free',
  audio_voice TEXT,
  enable_chatgpt BOOLEAN DEFAULT false,
  audio_comentario TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Se a tabela já existe, adicionar colunas que faltam:
ALTER TABLE questoes_areas ADD COLUMN IF NOT EXISTS plano TEXT DEFAULT 'free';
ALTER TABLE questoes_areas ADD COLUMN IF NOT EXISTS audio_voice TEXT;
ALTER TABLE questoes_areas ADD COLUMN IF NOT EXISTS enable_chatgpt BOOLEAN DEFAULT false;
ALTER TABLE questoes_areas ADD COLUMN IF NOT EXISTS audio_comentario TEXT;

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_questoes_area ON questoes_areas(area_id);
CREATE INDEX IF NOT EXISTS idx_questoes_materia ON questoes_areas(materia_id);
CREATE INDEX IF NOT EXISTS idx_questoes_area_materia ON questoes_areas(area_id, materia_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE questoes_areas ENABLE ROW LEVEL SECURITY;

-- REMOVER policies antigas se existirem
DROP POLICY IF EXISTS "Leitura pública das questões" ON questoes_areas;
DROP POLICY IF EXISTS "Escrita para autenticados" ON questoes_areas;
DROP POLICY IF EXISTS "Permitir tudo" ON questoes_areas;

-- Policy: Permitir TUDO (leitura e escrita) para facilitar
CREATE POLICY "Permitir tudo" ON questoes_areas
  FOR ALL USING (true)
  WITH CHECK (true);

-- ==============================================
-- VERIFICAR SE CRIOU CORRETAMENTE:
-- ==============================================
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'questoes_areas';
-- SELECT * FROM questoes_areas LIMIT 5;
