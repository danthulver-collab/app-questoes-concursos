-- CRIE TABELA DE MATÉRIAS NO SUPABASE AGORA:

CREATE TABLE IF NOT EXISTS materias (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  area_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar índice
CREATE INDEX IF NOT EXISTS idx_materias_area ON materias(area_id);

-- Popular com matérias existentes
INSERT INTO materias (id, nome, area_id) VALUES
('portugues', 'Português', 'area-administrativa'),
('matematica', 'Matemática', 'area-administrativa'),
('informatica', 'Informática', 'area-administrativa')
ON CONFLICT (id) DO NOTHING;

-- Verificar
SELECT * FROM materias;
