-- =====================================================
-- POLICY RLS PARA ADMIN VER TODOS USUARIOS
-- Execute no Supabase SQL Editor
-- =====================================================

-- Habilitar RLS na tabela profiles
alter table public.profiles enable row level security;

-- Policy: Admins podem ver todos os profiles
create policy "Admins can read all profiles"
on public.profiles
for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.is_admin = true
  )
);

-- Policy: Usuarios podem ver o proprio profile
create policy "Users can read own profile"
on public.profiles
for select
using (id = auth.uid());

-- Verificar policies criadas
select * from pg_policies where tablename = 'profiles';
