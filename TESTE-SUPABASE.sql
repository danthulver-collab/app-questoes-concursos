-- Execute isso no Supabase SQL Editor AGORA:

-- Verificar tabela areas
SELECT * FROM areas LIMIT 5;

-- Verificar tabela questoes_areas  
SELECT * FROM questoes_areas LIMIT 5;

-- Se tabelas não existem, criar:

CREATE TABLE IF NOT EXISTS areas (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  icone TEXT,
  carreiras JSONB DEFAULT '[]'::jsonb,
  materias JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questoes_areas (
  id TEXT PRIMARY KEY,
  area_id TEXT NOT NULL,
  materia_id TEXT NOT NULL,
  title TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  plano TEXT DEFAULT 'free',
  texto_contexto TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
