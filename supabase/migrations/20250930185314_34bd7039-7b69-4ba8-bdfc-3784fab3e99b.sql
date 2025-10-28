-- Drop problematic recursive and duplicate policies
DROP POLICY IF EXISTS "Admin users can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile or admins can update any" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can create their own profile" ON public.profiles;

-- Create consolidated INSERT policy (allows user to create own profile OR admin to create any)
CREATE POLICY "profiles_insert_self_or_admin"
ON public.profiles
FOR INSERT
WITH CHECK (
  (id = auth.uid()) OR 
  (user_id = auth.uid()) OR 
  is_admin(auth.uid())
);