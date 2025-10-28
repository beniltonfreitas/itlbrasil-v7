-- Drop all existing policies on profiles table to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Public can view basic profile info" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;
DROP POLICY IF EXISTS "Allow profile updates" ON profiles;
DROP POLICY IF EXISTS "Allow profile deletion" ON profiles;
DROP POLICY IF EXISTS "Allow viewing all profiles for admin" ON profiles;

-- Create clean, non-recursive RLS policies using is_admin() function
CREATE POLICY "Users can view own profile or admins view all"
ON profiles FOR SELECT
USING (id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile or admins update all"
ON profiles FOR UPDATE
USING (id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Only admins can delete profiles"
ON profiles FOR DELETE
USING (is_admin(auth.uid()));