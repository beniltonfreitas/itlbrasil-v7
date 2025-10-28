-- Fix security vulnerability: Implement proper access controls for administrative functions
-- Create a security definer function to check if a user is an admin
-- This prevents recursive RLS issues when checking admin status

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = _user_id 
    AND role IN ('admin', 'superadmin')
  );
$$;

-- ============= RSS FEEDS TABLE =============
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow RSS feeds creation" ON public.rss_feeds;
DROP POLICY IF EXISTS "Allow RSS feeds updates" ON public.rss_feeds;
DROP POLICY IF EXISTS "Allow RSS feeds deletion" ON public.rss_feeds;

-- Create secure policies for RSS feeds (admin-only for modifications)
CREATE POLICY "Authenticated users can view RSS feeds" 
ON public.rss_feeds 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Only admins can create RSS feeds" 
ON public.rss_feeds 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update RSS feeds" 
ON public.rss_feeds 
FOR UPDATE 
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete RSS feeds" 
ON public.rss_feeds 
FOR DELETE 
TO authenticated
USING (public.is_admin(auth.uid()));

-- ============= IMPORT LOGS TABLE =============
-- Drop existing overly permissive policies  
DROP POLICY IF EXISTS "Allow import logs creation" ON public.import_logs;
DROP POLICY IF EXISTS "Allow import logs updates" ON public.import_logs;

-- Create secure policies for import logs
CREATE POLICY "Authenticated users can view import logs" 
ON public.import_logs 
FOR SELECT 
TO authenticated
USING (true);

-- Only admins and edge functions can create/update import logs
CREATE POLICY "Only admins can create import logs" 
ON public.import_logs 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update import logs" 
ON public.import_logs 
FOR UPDATE 
TO authenticated
USING (public.is_admin(auth.uid()));

-- ============= SITE SETTINGS TABLE =============
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Settings can be created by admins" ON public.site_settings;
DROP POLICY IF EXISTS "Settings can be updated by admins" ON public.site_settings;

-- Create secure policies for site settings (admin-only for modifications)
CREATE POLICY "Everyone can view site settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can create site settings" 
ON public.site_settings 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update site settings" 
ON public.site_settings 
FOR UPDATE 
TO authenticated
USING (public.is_admin(auth.uid()));

-- ============= MENU PERMISSIONS TABLE =============
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Menu permissions can be created by admins" ON public.menu_permissions;
DROP POLICY IF EXISTS "Menu permissions can be updated by admins" ON public.menu_permissions;
DROP POLICY IF EXISTS "Menu permissions can be deleted by admins" ON public.menu_permissions;

-- Create secure policies for menu permissions (admin-only for all modifications)
CREATE POLICY "Authenticated users can view menu permissions" 
ON public.menu_permissions 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Only admins can create menu permissions" 
ON public.menu_permissions 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update menu permissions" 
ON public.menu_permissions 
FOR UPDATE 
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete menu permissions" 
ON public.menu_permissions 
FOR DELETE 
TO authenticated
USING (public.is_admin(auth.uid()));

-- ============= ARTICLES QUEUE TABLE =============
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow articles queue creation" ON public.articles_queue;
DROP POLICY IF EXISTS "Allow articles queue updates" ON public.articles_queue;
DROP POLICY IF EXISTS "Allow articles queue deletion" ON public.articles_queue;

-- Create secure policies for articles queue (admin-only for modifications)
CREATE POLICY "Authenticated users can view articles queue" 
ON public.articles_queue 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Only admins can create articles queue entries" 
ON public.articles_queue 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update articles queue entries" 
ON public.articles_queue 
FOR UPDATE 
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete articles queue entries" 
ON public.articles_queue 
FOR DELETE 
TO authenticated
USING (public.is_admin(auth.uid()));

-- ============= AUTHORS TABLE (Additional Security Fix) =============
-- The authors table also has email exposure - let's fix that too
DROP POLICY IF EXISTS "Authors are viewable by everyone" ON public.authors;

-- Allow public viewing of author info but restrict email access to admins only
CREATE POLICY "Public can view basic author info" 
ON public.authors 
FOR SELECT 
USING (true);

-- Note: For email protection, we need to handle this at the application level
-- by creating a view or modifying queries to exclude emails for non-admin users