-- ============================================
-- SISTEMA DE RENOVAÇÃO MENSAL AUTOMÁTICA
-- Execute este SQL no Supabase
-- ============================================

-- 1. Adicionar campos de renovação na tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS last_renewed_at TIMESTAMPTZ;

-- 2. Criar tabela de cancelamentos (para salvar motivos)
CREATE TABLE IF NOT EXISTS cancelamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  email TEXT,
  motivo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habilitar RLS
ALTER TABLE cancelamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir inserir cancelamentos" ON cancelamentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin vê cancelamentos" ON cancelamentos FOR SELECT USING (true);

-- 4. Criar tabela de renovações (histórico)
CREATE TABLE IF NOT EXISTS plan_renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  email TEXT,
  plan TEXT,
  renewed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  payment_status TEXT DEFAULT 'pending',
  amount DECIMAL
);

ALTER TABLE plan_renewals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir tudo em renovações" ON plan_renewals FOR ALL USING (true);

-- 5. Atualizar planos existentes com data de expiração (30 dias a partir de agora)
UPDATE profiles 
SET plan_expires_at = (NOW() + INTERVAL '30 days'),
    last_renewed_at = NOW()
WHERE plan IN ('individual', 'plus') 
AND plan_expires_at IS NULL;

-- 6. Criar função para expirar planos automaticamente (pode ser chamada por cron job)
CREATE OR REPLACE FUNCTION expire_overdue_plans()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE profiles
  SET plan = 'free',
      package_status = NULL
  WHERE plan IN ('individual', 'plus')
    AND plan_expires_at < NOW()
    AND (auto_renew = FALSE OR auto_renew IS NULL);
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- 7. Comentário: Como usar
-- Para verificar planos expirando:
-- SELECT email, plan, plan_expires_at, 
--        (plan_expires_at - NOW()) as time_remaining 
-- FROM profiles 
-- WHERE plan IN ('individual', 'plus') 
-- ORDER BY plan_expires_at;

-- Para executar expiração manual:
-- SELECT expire_overdue_plans();
