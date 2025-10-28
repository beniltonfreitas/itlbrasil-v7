-- Identificar e remover usuários órfãos da tabela profiles
-- (usuários que existem em profiles mas não em auth.users)

-- Primeiro, vamos criar uma função temporária para verificar
CREATE OR REPLACE FUNCTION cleanup_orphaned_profiles()
RETURNS TABLE (
  orphaned_id uuid,
  orphaned_email text,
  orphaned_name text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Retorna os perfis órfãos (que não existem em auth.users)
  RETURN QUERY
  SELECT p.id, p.email, p.name
  FROM profiles p
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = p.id
  );
END;
$$;

-- Criar uma tabela temporária para registrar os usuários que serão removidos
CREATE TEMP TABLE IF NOT EXISTS orphaned_profiles_backup AS
SELECT * FROM cleanup_orphaned_profiles();

-- Remover user_roles para usuários órfãos primeiro (para evitar constraint violations)
DELETE FROM user_roles
WHERE user_id IN (SELECT orphaned_id FROM orphaned_profiles_backup);

-- Remover os perfis órfãos
DELETE FROM profiles
WHERE id IN (SELECT orphaned_id FROM orphaned_profiles_backup);

-- Exibir relatório dos usuários removidos
DO $$
DECLARE
  orphan_count integer;
BEGIN
  SELECT COUNT(*) INTO orphan_count FROM orphaned_profiles_backup;
  RAISE NOTICE 'Removidos % perfis órfãos da tabela profiles', orphan_count;
  
  -- Se houver registros, mostrar quais foram
  IF orphan_count > 0 THEN
    RAISE NOTICE 'Perfis removidos: %', (
      SELECT string_agg(orphaned_email || ' (' || orphaned_name || ')', ', ')
      FROM orphaned_profiles_backup
    );
  END IF;
END;
$$;

-- Limpar a função temporária
DROP FUNCTION cleanup_orphaned_profiles();