-- Tabela de Áreas
CREATE TABLE IF NOT EXISTS areas (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  icone TEXT,
  carreiras JSONB DEFAULT '[]',
  materias JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Carreiras
CREATE TABLE IF NOT EXISTS carreiras (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  area_id TEXT NOT NULL,
  cargos JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE carreiras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir tudo areas" ON areas;
DROP POLICY IF EXISTS "Permitir tudo carreiras" ON carreiras;

CREATE POLICY "Permitir tudo areas" ON areas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo carreiras" ON carreiras FOR ALL USING (true) WITH CHECK (true);
