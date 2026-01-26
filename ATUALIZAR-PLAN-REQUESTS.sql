-- ============================================
-- ATUALIZAR ESTRUTURA DE PLAN_REQUESTS
-- Separar campos para melhor visualização
-- ============================================

-- Adicionar/Atualizar campos
ALTER TABLE plan_requests 
ADD COLUMN IF NOT EXISTS concurso TEXT,
ADD COLUMN IF NOT EXISTS cargo TEXT,
ADD COLUMN IF NOT EXISTS materias TEXT[],
ADD COLUMN IF NOT EXISTS detalhamento_materias JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS observacoes TEXT,
ADD COLUMN IF NOT EXISTS num_questoes INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_plan_requests_status ON plan_requests(status);
CREATE INDEX IF NOT EXISTS idx_plan_requests_email ON plan_requests(email);

-- Ver estrutura atualizada
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'plan_requests' ORDER BY ordinal_position;
