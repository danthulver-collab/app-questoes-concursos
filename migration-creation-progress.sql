-- ================================================
-- MIGRAÇÃO: Adicionar Progresso de Criação
-- ================================================
-- Execute este SQL no Supabase SQL Editor
-- Data: Janeiro 2026
-- ================================================

-- 1. Adicionar coluna creation_progress (JSONB)
-- Armazena: { stage, percentual, timestamps }
ALTER TABLE user_data 
ADD COLUMN IF NOT EXISTS creation_progress JSONB;

-- 2. Adicionar coluna payment_confirmed_date
-- Armazena a data que o admin confirmou o pagamento
ALTER TABLE user_data 
ADD COLUMN IF NOT EXISTS payment_confirmed_date TIMESTAMP WITH TIME ZONE;

-- 3. Criar índice para busca rápida por stage
-- Melhora performance de queries filtrando por estágio
CREATE INDEX IF NOT EXISTS idx_creation_progress_stage 
ON user_data ((creation_progress->>'stage'));

-- 4. Criar índice para busca por percentual
-- Útil para relatórios e dashboards
CREATE INDEX IF NOT EXISTS idx_creation_progress_percentual 
ON user_data (((creation_progress->>'percentual')::integer));

-- 5. Adicionar comentários nas colunas
COMMENT ON COLUMN user_data.creation_progress IS 'Progresso de criação do pacote: { stage: CreationStage, percentual: number, timestamps: {} }';
COMMENT ON COLUMN user_data.payment_confirmed_date IS 'Data em que o admin confirmou o recebimento do pagamento';

-- 6. Verificar estrutura (OPCIONAL - para debug)
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'user_data'
-- AND column_name IN ('creation_progress', 'payment_confirmed_date');

-- ================================================
-- FIM DA MIGRAÇÃO
-- ================================================
-- Resultado esperado:
-- ✅ Coluna creation_progress criada (JSONB)
-- ✅ Coluna payment_confirmed_date criada (TIMESTAMP)
-- ✅ Índices criados para performance
-- ✅ Comentários adicionados
-- ================================================
