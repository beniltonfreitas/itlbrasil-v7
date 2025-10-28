-- Fix RLS policies for profiles table to prevent public data exposure
-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Superadmins and admins can view all profiles (already exists but ensure it's correct)
-- The existing "Superadmins and admins can view and manage profiles" policy handles this

-- Add comment for documentation
COMMENT ON TABLE public.profiles IS 'User profiles with restricted access. Users can only view their own profile. Admins and superadmins can view all profiles.';