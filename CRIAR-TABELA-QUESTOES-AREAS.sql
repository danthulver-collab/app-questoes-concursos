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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_questoes_area ON questoes_areas(area_id);
CREATE INDEX IF NOT EXISTS idx_questoes_materia ON questoes_areas(materia_id);
CREATE INDEX IF NOT EXISTS idx_questoes_area_materia ON questoes_areas(area_id, materia_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE questoes_areas ENABLE ROW LEVEL SECURITY;

-- Policy: Permitir leitura para todos (questões são públicas)
CREATE POLICY "Leitura pública das questões" ON questoes_areas
  FOR SELECT USING (true);

-- Policy: Permitir escrita apenas para usuários autenticados (admin)
CREATE POLICY "Escrita para autenticados" ON questoes_areas
  FOR ALL USING (auth.role() = 'authenticated');

-- Alternativa: Policy que permite tudo (para desenvolvimento)
-- DROP POLICY IF EXISTS "Leitura pública das questões" ON questoes_areas;
-- DROP POLICY IF EXISTS "Escrita para autenticados" ON questoes_areas;
-- CREATE POLICY "Permitir tudo" ON questoes_areas FOR ALL USING (true);

-- ==============================================
-- VERIFICAR SE CRIOU CORRETAMENTE:
-- ==============================================
-- SELECT * FROM questoes_areas LIMIT 5;
