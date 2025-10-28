-- Fix profiles table RLS policies to restrict to authenticated users only
-- This prevents unauthenticated users from even attempting to query the table

-- Drop existing policies
DROP POLICY IF EXISTS "Superadmins and admins can view and manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create new policies restricted to authenticated users only
-- Policy for viewing: users can see their own profile, admins can see all
CREATE POLICY "authenticated_users_view_own_profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'superadmin'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Policy for updating: users can update their own profile, admins can update all
CREATE POLICY "authenticated_users_update_own_profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'superadmin'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'superadmin'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Policy for inserting: users can create their own profile, admins can create any
CREATE POLICY "authenticated_users_insert_own_profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'superadmin'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Policy for deleting: only admins can delete profiles
CREATE POLICY "admins_delete_profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'superadmin'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Add comment for documentation
COMMENT ON TABLE public.profiles IS 'User profiles table with RLS policies ensuring only authenticated users can access profiles. Users can view/edit their own profile, admins can manage all profiles.';