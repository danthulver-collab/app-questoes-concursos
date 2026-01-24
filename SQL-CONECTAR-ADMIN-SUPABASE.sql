-- =====================================================
-- SQL PARA CONECTAR ADMIN AO SUPABASE
-- Execute no SQL Editor do Supabase
-- =====================================================

-- 1. GARANTIR QUE TABELA profiles EXISTE
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  plan text DEFAULT 'free',
  is_admin boolean DEFAULT false,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- 3. RLS (Row Level Security) - PERMISSIVO PARA ADMINS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop policies antigas se existirem
DROP POLICY IF EXISTS "Allow public read" ON profiles;
DROP POLICY IF EXISTS "Allow public insert" ON profiles;
DROP POLICY IF EXISTS "Allow public update" ON profiles;
DROP POLICY IF EXISTS "Allow public delete" ON profiles;

-- Criar policies novas (100% permissivas para facilitar)
CREATE POLICY "Allow public read" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON profiles
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete" ON profiles
  FOR DELETE USING (true);

-- 4. INSERIR PERFIS DE ADMIN SE NÃO EXISTIREM
-- IMPORTANTE: Substitua os IDs pelos IDs reais dos usuários no auth.users
-- Para pegar o ID: SELECT id, email FROM auth.users WHERE email = 'seuemail@gmail.com';

-- Exemplo (você precisa ajustar com o ID real):
-- INSERT INTO profiles (id, email, plan, is_admin, active)
-- VALUES 
--   ('UUID-DO-DANTHULVER', 'danthulver@gmail.com', 'plus', true, true),
--   ('UUID-DA-RIBEIRO', 'ribeiroduda170@gmail.com', 'plus', true, true)
-- ON CONFLICT (id) DO UPDATE SET
--   plan = 'plus',
--   is_admin = true,
--   active = true;

-- 5. FUNÇÃO TRIGGER PARA CRIAR PROFILE AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, plan, is_admin)
  VALUES (
    new.id,
    new.email,
    CASE 
      WHEN new.email IN ('danthulver@gmail.com', 'ribeiroduda170@gmail.com') THEN 'plus'
      ELSE 'free'
    END,
    new.email IN ('danthulver@gmail.com', 'ribeiroduda170@gmail.com')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. CRIAR TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. ATUALIZAR PROFILES EXISTENTES PARA ADMINS
UPDATE profiles 
SET 
  plan = 'plus',
  is_admin = true,
  active = true
WHERE email IN ('danthulver@gmail.com', 'ribeiroduda170@gmail.com');

-- 8. CRIAR TABELA admin_notifications SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'user_registration',
  title text NOT NULL,
  message text NOT NULL,
  user_id text,
  user_name text,
  user_email text,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on admin_notifications" ON admin_notifications;
CREATE POLICY "Allow all on admin_notifications" ON admin_notifications FOR ALL USING (true);

-- 9. CRIAR TABELA plan_requests SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS plan_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  nome text,
  email text,
  telefone text,
  concurso text,
  banca text,
  materias jsonb,
  plano text NOT NULL DEFAULT 'individual',
  num_questoes integer DEFAULT 100,
  extras text,
  status text NOT NULL DEFAULT 'aguardando_montagem',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE plan_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on plan_requests" ON plan_requests;
CREATE POLICY "Allow all on plan_requests" ON plan_requests FOR ALL USING (true);

-- 10. CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_plan_requests_user_id ON plan_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_requests_status ON plan_requests(status);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(read);

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se admins estão configurados
SELECT id, email, plan, is_admin FROM profiles WHERE is_admin = true;

-- Contar usuários
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE plan = 'free') as free_users,
  COUNT(*) FILTER (WHERE plan = 'plus') as plus_users,
  COUNT(*) FILTER (WHERE is_admin = true) as admins
FROM profiles;
