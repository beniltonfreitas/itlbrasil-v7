-- Migration: Sync profiles to user_roles and ensure bs7freitas@gmail.com is superadmin
-- Execute este SQL manualmente no Supabase Cloud -> Database -> SQL Editor

-- Step 1: Ensure bs7freitas@gmail.com has superadmin role
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get user ID for bs7freitas@gmail.com
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'bs7freitas@gmail.com';

  IF v_user_id IS NOT NULL THEN
    -- Insert superadmin role if doesn't exist
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'superadmin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Superadmin role ensured for bs7freitas@gmail.com';
  ELSE
    RAISE NOTICE 'User bs7freitas@gmail.com not found in auth.users';
  END IF;
END $$;

-- Step 2: Sync other users from profiles to user_roles (if they don't have roles yet)
INSERT INTO public.user_roles (user_id, role)
SELECT 
  p.id,
  CASE 
    WHEN p.role = 'admin' THEN 'admin'::public.app_role
    WHEN p.role = 'editor' THEN 'editor'::public.app_role
    WHEN p.role = 'author' THEN 'author'::public.app_role
    ELSE 'author'::public.app_role
  END as role
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id
)
AND p.id IN (SELECT id FROM auth.users)
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: Create trigger to auto-create author role for new users
CREATE OR REPLACE FUNCTION public.auto_create_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create if user doesn't already have a role
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = NEW.id
  ) THEN
    -- Special case for bs7freitas@gmail.com
    IF NEW.email = 'bs7freitas@gmail.com' THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'superadmin');
    ELSE
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'author');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_user_role();

COMMENT ON FUNCTION public.auto_create_user_role() IS 'Automatically creates a role for new users. bs7freitas@gmail.com gets superadmin, others get author.';
