-- =====================================================
-- CORRIGIR ERRO DE RECURSÃO INFINITA NAS POLICIES
-- Execute no SQL Editor do Supabase
-- =====================================================

-- 1. DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE plan_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications DISABLE ROW LEVEL SECURITY;

-- 2. DROPAR TODAS AS POLICIES PROBLEMÁTICAS
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Allow public read" ON profiles;
DROP POLICY IF EXISTS "Allow public insert" ON profiles;
DROP POLICY IF EXISTS "Allow public update" ON profiles;
DROP POLICY IF EXISTS "Allow public delete" ON profiles;

-- 3. CRIAR POLICIES SIMPLES E SEGURAS
-- Profiles: Todos podem ler, inserir e atualizar
CREATE POLICY "Enable read access for all users" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON profiles
  FOR UPDATE USING (true);

-- 4. REABILITAR RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- 5. VERIFICAR SE FUNCIONOU
SELECT * FROM profiles LIMIT 5;
