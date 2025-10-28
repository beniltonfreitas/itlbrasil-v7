-- Fix security vulnerability: Restrict profile access to prevent email harvesting
-- Remove the overly permissive policy that allows anyone to view all profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create secure policies for profile access
-- 1. Allow users to view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- 2. Allow authenticated users to view basic profile info (name, avatar) but not emails
-- This is needed for features like author attribution on articles
CREATE POLICY "Authenticated users can view basic profile info" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Note: The above policy still allows viewing all data. Let's replace it with a more restrictive approach
-- by creating a view for public profile data instead.

-- Drop the broad policy and create a more restrictive one
DROP POLICY IF EXISTS "Authenticated users can view basic profile info" ON public.profiles;

-- Only allow users to see profiles when they are admins or viewing their own profile
CREATE POLICY "Admin users can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'admin'
  )
);

-- Update existing policies to be more explicit about authentication requirements
-- These policies already exist but let's make sure they're properly secured

-- Ensure INSERT policy is secure (only authenticated users)
DROP POLICY IF EXISTS "Allow profile creation" ON public.profiles;
CREATE POLICY "Authenticated users can create their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Ensure UPDATE policy is secure (users can only update their own profile, or admins can update any)
DROP POLICY IF EXISTS "Allow profile updates" ON public.profiles;
CREATE POLICY "Users can update their own profile or admins can update any" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'admin'
  )
);

-- Ensure DELETE policy is secure (only admins can delete profiles)
DROP POLICY IF EXISTS "Allow profile deletion" ON public.profiles;
CREATE POLICY "Admin users can delete profiles" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'admin'
  )
);