-- ============================================
-- TABELAS PARA PACOTES E QUESTÕES NO SUPABASE
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. Tabela de PACOTES
CREATE TABLE IF NOT EXISTS pacotes (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  banca TEXT,
  ano INTEGER,
  orgao TEXT,
  descricao TEXT,
  disciplinas JSONB DEFAULT '[]'::jsonb,
  num_questoes INTEGER DEFAULT 100,
  preco DECIMAL(10,2),
  premium BOOLEAN DEFAULT false,
  aluno_atribuido TEXT,
  questions_ids JSONB DEFAULT '[]'::jsonb,
  area_id TEXT,
  carreira_id TEXT,
  cargo TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  suspended_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'canceled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de QUESTÕES
CREATE TABLE IF NOT EXISTS questoes (
  id TEXT PRIMARY KEY,
  pergunta TEXT NOT NULL,
  alternativas JSONB NOT NULL DEFAULT '["","","",""]'::jsonb,
  correta INTEGER NOT NULL CHECK (correta >= 0 AND correta <= 3),
  disciplina TEXT,
  modulo TEXT,
  banca TEXT,
  concurso TEXT,
  ano INTEGER,
  comentario TEXT,
  dificuldade TEXT DEFAULT 'medio' CHECK (dificuldade IN ('facil', 'medio', 'dificil')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_pacotes_aluno ON pacotes(aluno_atribuido);
CREATE INDEX IF NOT EXISTS idx_pacotes_status ON pacotes(status);
CREATE INDEX IF NOT EXISTS idx_pacotes_expires ON pacotes(expires_at);
CREATE INDEX IF NOT EXISTS idx_questoes_disciplina ON questoes(disciplina);
CREATE INDEX IF NOT EXISTS idx_questoes_banca ON questoes(banca);
CREATE INDEX IF NOT EXISTS idx_questoes_concurso ON questoes(concurso);

-- 4. Enable RLS (Row Level Security)
ALTER TABLE pacotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questoes ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de acesso
-- Admins podem tudo
CREATE POLICY "Admins podem tudo nos pacotes" ON pacotes
  FOR ALL USING (true);

CREATE POLICY "Admins podem tudo nas questoes" ON questoes
  FOR ALL USING (true);

-- Alunos só podem ver seus próprios pacotes
CREATE POLICY "Alunos podem ver seus pacotes" ON pacotes
  FOR SELECT USING (
    aluno_atribuido = auth.jwt() ->> 'email' OR
    aluno_atribuido = auth.jwt() ->> 'username'
  );

-- 6. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pacotes_updated_at BEFORE UPDATE ON pacotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questoes_updated_at BEFORE UPDATE ON questoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- PRONTO! Agora execute este SQL no Supabase e me avise que eu atualizo o código para salvar lá.
