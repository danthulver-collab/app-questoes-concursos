-- Criar tabela questoes_areas se nao existir
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
  enable_chatgpt BOOLEAN DEFAULT FALSE,
  audio_comentario TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questoes_area ON questoes_areas(area_id);
CREATE INDEX IF NOT EXISTS idx_questoes_materia ON questoes_areas(materia_id);

ALTER TABLE questoes_areas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for authenticated" ON questoes_areas;
CREATE POLICY "Allow all for authenticated" ON questoes_areas FOR ALL USING (true);

-- Converter questoes da tabela 'questoes' para 'questoes_areas'
-- Mapeamento de disciplinas para areas
INSERT INTO questoes_areas (id, area_id, materia_id, title, options, correct_answer, explanation, created_at)
SELECT 
  q.id,
  CASE 
    WHEN q.disciplina IN ('Portugues', 'Matematica', 'Informatica', 'Direito Administrativo') THEN 'area-administrativa'
    WHEN q.disciplina IN ('Direito Constitucional', 'Direito Penal', 'Direito Administrativo') THEN 'area-juridica'
    WHEN q.disciplina = 'Raciocinio Logico' THEN 'area-administrativa'
    ELSE 'area-administrativa'
  END as area_id,
  CASE
    WHEN q.disciplina = 'Portugues' THEN 'portugues'
    WHEN q.disciplina = 'Matematica' THEN 'matematica'
    WHEN q.disciplina = 'Informatica' THEN 'informatica'
    WHEN q.disciplina = 'Direito Constitucional' THEN 'direito-constitucional'
    WHEN q.disciplina = 'Direito Administrativo' THEN 'direito-administrativo'
    WHEN q.disciplina = 'Direito Penal' THEN 'direito-penal'
    WHEN q.disciplina = 'Raciocinio Logico' THEN 'raciocinio-logico'
    ELSE LOWER(REPLACE(q.disciplina, ' ', '-'))
  END as materia_id,
  q.pergunta as title,
  q.alternativas as options,
  q.correta as correct_answer,
  q.comentario as explanation,
  q.created_at
FROM questoes q
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  options = EXCLUDED.options,
  correct_answer = EXCLUDED.correct_answer,
  explanation = EXCLUDED.explanation,
  updated_at = NOW();
