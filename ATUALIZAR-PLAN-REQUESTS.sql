-- ============================================
-- ATUALIZAR ESTRUTURA DE PLAN_REQUESTS
-- Separar campos para melhor visualização
-- ============================================

-- Adicionar campos se não existirem
ALTER TABLE plan_requests ADD COLUMN IF NOT EXISTS concurso TEXT;
ALTER TABLE plan_requests ADD COLUMN IF NOT EXISTS cargo TEXT;
ALTER TABLE plan_requests ADD COLUMN IF NOT EXISTS materias TEXT[];
ALTER TABLE plan_requests ADD COLUMN IF NOT EXISTS detalhamento_materias JSONB DEFAULT '{}';
ALTER TABLE plan_requests ADD COLUMN IF NOT EXISTS observacoes TEXT;
ALTER TABLE plan_requests ADD COLUMN IF NOT EXISTS num_questoes INTEGER DEFAULT 100;
ALTER TABLE plan_requests ADD COLUMN IF NOT EXISTS payment_id TEXT;
ALTER TABLE plan_requests ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_plan_requests_status ON plan_requests(status);
CREATE INDEX IF NOT EXISTS idx_plan_requests_email ON plan_requests(email);

-- Ver estrutura atualizada (opcional - pode comentar essa linha)
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'plan_requests' ORDER BY ordinal_position;
