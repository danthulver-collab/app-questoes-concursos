-- =====================================================
-- ATUALIZAR TABELA plan_requests - ADICIONAR COLUNA CARGO
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- Adicionar coluna cargo se não existir
ALTER TABLE plan_requests ADD COLUMN IF NOT EXISTS cargo text;

-- Tornar cargo opcional (remover NOT NULL se existir)
ALTER TABLE plan_requests ALTER COLUMN cargo DROP NOT NULL;

-- Verificar estrutura atual
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'plan_requests';

-- =====================================================
-- CRIAR TABELA profiles SE NÃO EXISTIR
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  plan text DEFAULT 'free',
  is_admin boolean DEFAULT false,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop policies se existirem
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Criar policies permissivas
CREATE POLICY "Users can read all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (true);

-- =====================================================
-- CRIAR TABELA admin_notifications SE NÃO EXISTIR
-- =====================================================

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

DROP POLICY IF EXISTS "Anyone can read notifications" ON admin_notifications;
DROP POLICY IF EXISTS "Anyone can create notifications" ON admin_notifications;
DROP POLICY IF EXISTS "Anyone can update notifications" ON admin_notifications;
DROP POLICY IF EXISTS "Anyone can delete notifications" ON admin_notifications;

CREATE POLICY "Anyone can read notifications" ON admin_notifications FOR SELECT USING (true);
CREATE POLICY "Anyone can create notifications" ON admin_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update notifications" ON admin_notifications FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete notifications" ON admin_notifications FOR DELETE USING (true);

-- =====================================================
-- ATUALIZAR plan_requests - TORNAR CAMPOS OPCIONAIS
-- =====================================================

ALTER TABLE plan_requests ALTER COLUMN concurso DROP NOT NULL;
ALTER TABLE plan_requests ALTER COLUMN banca DROP NOT NULL;

-- Verificar se extras existe
ALTER TABLE plan_requests ADD COLUMN IF NOT EXISTS extras text;
