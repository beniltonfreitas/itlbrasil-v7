-- Fix RLS Policies for user_roles table
-- Execute este SQL no Supabase SQL Editor após executar sync_user_roles.sql

-- Step 1: Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmins can delete roles" ON public.user_roles;

-- Step 2: Create security definer function to check if user is superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT exists (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'superadmin'
  )
$$;

-- Step 3: Create RLS policies

-- Allow users to view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow superadmins to view all roles
CREATE POLICY "Superadmins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.is_superadmin(auth.uid()));

-- Allow superadmins to insert roles
CREATE POLICY "Superadmins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.is_superadmin(auth.uid()));

-- Allow superadmins to update roles
CREATE POLICY "Superadmins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.is_superadmin(auth.uid()));

-- Allow superadmins to delete roles
CREATE POLICY "Superadmins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.is_superadmin(auth.uid()));

-- Step 4: Verify bs7freitas@gmail.com has superadmin role
DO $$
DECLARE
  v_user_id uuid;
  v_role_count int;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'bs7freitas@gmail.com';
  
  IF v_user_id IS NOT NULL THEN
    -- Count existing roles
    SELECT COUNT(*) INTO v_role_count
    FROM public.user_roles
    WHERE user_id = v_user_id AND role = 'superadmin';
    
    RAISE NOTICE 'User ID: %, Superadmin roles: %', v_user_id, v_role_count;
    
    -- Insert if doesn't exist
    IF v_role_count = 0 THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (v_user_id, 'superadmin')
      ON CONFLICT (user_id, role) DO NOTHING;
      RAISE NOTICE 'Superadmin role inserted for bs7freitas@gmail.com';
    ELSE
      RAISE NOTICE 'Superadmin role already exists for bs7freitas@gmail.com';
    END IF;
  ELSE
    RAISE NOTICE 'ERROR: User bs7freitas@gmail.com not found in auth.users';
  END IF;
END $$;

-- Step 5: Create profile if doesn't exist
INSERT INTO public.profiles (id, name, email, role, status)
SELECT 
  id,
  'Benilton Silva Freitas',
  'bs7freitas@gmail.com',
  'admin',
  'active'
FROM auth.users 
WHERE email = 'bs7freitas@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = 'admin',
  status = 'active';

COMMENT ON FUNCTION public.is_superadmin(uuid) IS 'Security definer function to check if a user has superadmin role. Prevents RLS recursion.';
