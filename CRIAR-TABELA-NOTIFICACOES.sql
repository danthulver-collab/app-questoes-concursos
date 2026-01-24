-- =====================================================
-- TABELA: admin_notifications
-- Notificações para administradores quando usuários se cadastram
-- =====================================================

-- Criar tabela de notificações
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

-- Permitir leitura/escrita para usuários autenticados
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Policy para admins lerem todas as notificações
CREATE POLICY "Admins can read all notifications" ON admin_notifications
  FOR SELECT USING (true);

-- Policy para qualquer usuário criar notificações (quando se cadastra)
CREATE POLICY "Anyone can create notifications" ON admin_notifications
  FOR INSERT WITH CHECK (true);

-- Policy para admins atualizarem notificações (marcar como lida)
CREATE POLICY "Admins can update notifications" ON admin_notifications
  FOR UPDATE USING (true);

-- Policy para admins deletarem notificações
CREATE POLICY "Admins can delete notifications" ON admin_notifications
  FOR DELETE USING (true);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(read);

-- =====================================================
-- VERIFICAR SE TABELA profiles EXISTE
-- =====================================================

-- Se não existir, criar:
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

CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id OR true);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id OR true);

-- =====================================================
-- VERIFICAR SE TABELA plan_requests EXISTE
-- =====================================================

CREATE TABLE IF NOT EXISTS plan_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  nome text,
  email text,
  telefone text,
  concurso text NOT NULL,
  cargo text NOT NULL,
  banca text NOT NULL,
  banca_custom text,
  materias jsonb NOT NULL,
  materias_custom text,
  plano text NOT NULL,
  num_questoes integer DEFAULT 100,
  edital_file text,
  extras text,
  extras_response text,
  status text NOT NULL DEFAULT 'aguardando_montagem',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE plan_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read plan_requests" ON plan_requests
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert plan_requests" ON plan_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update plan_requests" ON plan_requests
  FOR UPDATE USING (true);
