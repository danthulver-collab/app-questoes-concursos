-- DIAGNÓSTICO: Execute no Supabase SQL Editor

-- 1. Ver todas as áreas
SELECT id, nome, materias FROM areas ORDER BY updated_at DESC LIMIT 10;

-- 2. Ver área administrativa especificamente
SELECT * FROM areas WHERE id = 'area-administrativa';

-- 3. Contar áreas
SELECT COUNT(*) as total_areas FROM areas;

-- 4. Ver log de updates recentes
SELECT id, nome, updated_at FROM areas ORDER BY updated_at DESC LIMIT 5;
