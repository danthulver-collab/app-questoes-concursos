-- ============================================
-- ADICIONAR CAMPOS DE CONTROLE DE PAGAMENTO
-- Execute este SQL no Supabase
-- ============================================

-- Adicionar campos na tabela plan_requests
ALTER TABLE plan_requests 
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS concurso TEXT,
ADD COLUMN IF NOT EXISTS cargo TEXT,
ADD COLUMN IF NOT EXISTS materias TEXT[];

-- Criar índice para busca rápida por status
CREATE INDEX IF NOT EXISTS idx_plan_requests_status ON plan_requests(status);
CREATE INDEX IF NOT EXISTS idx_plan_requests_email_status ON plan_requests(email, status);

-- Status possíveis:
-- 'aguardando_pagamento' = Cliente configurou mas não pagou ainda
-- 'pago' = Cliente pagou, aguardando admin começar
-- 'em_andamento' = Admin está elaborando questões
-- 'pronto' = Admin finalizou e liberou para o aluno

-- Verificar pedidos pendentes de pagamento
-- SELECT id, email, concurso, status, created_at 
-- FROM plan_requests 
-- WHERE status = 'aguardando_pagamento' 
-- ORDER BY created_at DESC;

-- Verificar pedidos pagos aguardando elaboração
-- SELECT id, email, concurso, status, paid_at
-- FROM plan_requests 
-- WHERE status = 'pago' 
-- ORDER BY paid_at DESC;
