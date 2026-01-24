-- =====================================================
-- FIX URGENTE - DESABILITAR RLS QUE ESTÁ CAUSANDO RECURSÃO
-- =====================================================

-- DESABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE plan_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications DISABLE ROW LEVEL SECURITY;

-- DROPAR TODAS AS POLICIES
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON profiles';
    END LOOP;
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'plan_requests') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON plan_requests';
    END LOOP;
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'admin_notifications') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON admin_notifications';
    END LOOP;
END $$;

-- ADICIONAR COLUNAS NECESSÁRIAS
ALTER TABLE plan_requests ADD COLUMN IF NOT EXISTS concurso text;
ALTER TABLE plan_requests ADD COLUMN IF NOT EXISTS cargo text;
ALTER TABLE plan_requests ADD COLUMN IF NOT EXISTS materias jsonb;
ALTER TABLE plan_requests ADD COLUMN IF NOT EXISTS extras text;

-- VERIFICAR
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'plan_requests' ORDER BY ordinal_position;
