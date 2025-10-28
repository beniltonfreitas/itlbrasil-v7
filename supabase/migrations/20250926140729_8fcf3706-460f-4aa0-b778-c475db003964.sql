-- Create menu permissions table
CREATE TABLE public.menu_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL,
  menu_item TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role, menu_item)
);

-- Enable RLS
ALTER TABLE public.menu_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Menu permissions are viewable by everyone" 
ON public.menu_permissions 
FOR SELECT 
USING (true);

CREATE POLICY "Menu permissions can be created by admins" 
ON public.menu_permissions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Menu permissions can be updated by admins" 
ON public.menu_permissions 
FOR UPDATE 
USING (true);

CREATE POLICY "Menu permissions can be deleted by admins" 
ON public.menu_permissions 
FOR DELETE 
USING (true);

-- Add trigger for timestamps
CREATE TRIGGER update_menu_permissions_updated_at
BEFORE UPDATE ON public.menu_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default permissions for each role
INSERT INTO public.menu_permissions (role, menu_item, enabled) VALUES
-- Super Admin: All permissions enabled
('superadmin', 'dashboard', true),
('superadmin', 'articles', true),
('superadmin', 'article-editor', true),
('superadmin', 'webstories', true),
('superadmin', 'rss-feeds', true),
('superadmin', 'rss-import', true),
('superadmin', 'articles-queue', true),
('superadmin', 'categories', true),
('superadmin', 'authors', true),
('superadmin', 'radio', true),
('superadmin', 'podcast', true),
('superadmin', 'users', true),
('superadmin', 'analytics', true),
('superadmin', 'themes', true),
('superadmin', 'settings', true),
('superadmin', 'permissions', true),

-- Admin: Most permissions enabled
('admin', 'dashboard', true),
('admin', 'articles', true),
('admin', 'article-editor', true),
('admin', 'webstories', true),
('admin', 'rss-feeds', true),
('admin', 'rss-import', true),
('admin', 'articles-queue', true),
('admin', 'categories', true),
('admin', 'authors', true),
('admin', 'radio', false),
('admin', 'podcast', false),
('admin', 'users', false),
('admin', 'analytics', true),
('admin', 'themes', false),
('admin', 'settings', true),
('admin', 'permissions', false),

-- Editor: Limited permissions
('editor', 'dashboard', true),
('editor', 'articles', true),
('editor', 'article-editor', true),
('editor', 'webstories', false),
('editor', 'rss-feeds', false),
('editor', 'rss-import', false),
('editor', 'articles-queue', true),
('editor', 'categories', true),
('editor', 'authors', false),
('editor', 'radio', false),
('editor', 'podcast', false),
('editor', 'users', false),
('editor', 'analytics', false),
('editor', 'themes', false),
('editor', 'settings', false),
('editor', 'permissions', false),

-- Author: Minimal permissions
('author', 'dashboard', true),
('author', 'articles', false),
('author', 'article-editor', true),
('author', 'webstories', false),
('author', 'rss-feeds', false),
('author', 'rss-import', false),
('author', 'articles-queue', false),
('author', 'categories', false),
('author', 'authors', false),
('author', 'radio', false),
('author', 'podcast', false),
('author', 'users', false),
('author', 'analytics', false),
('author', 'themes', false),
('author', 'settings', false),
('author', 'permissions', false);