-- Atualizar RLS policies para incluir superadmin com acesso total

-- Política para user_roles - superadmin pode gerenciar todos os roles
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmins can insert user roles" ON public.user_roles;

CREATE POLICY "Superadmins and admins can view all roles" 
ON public.user_roles 
FOR SELECT
USING (
  has_role(auth.uid(), 'superadmin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  auth.uid() = user_id
);

CREATE POLICY "Superadmins can manage all roles" 
ON public.user_roles 
FOR ALL
USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Política para profiles - superadmin pode gerenciar todos os perfis
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Superadmins and admins can manage profiles" ON public.profiles;

CREATE POLICY "Superadmins and admins can view and manage profiles" 
ON public.profiles 
FOR ALL 
USING (
  has_role(auth.uid(), 'superadmin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  auth.uid() = user_id
);

-- Atualizar políticas de site_settings para superadmin
DROP POLICY IF EXISTS "Admins can manage settings" ON public.site_settings;
CREATE POLICY "Superadmins and admins can manage settings" 
ON public.site_settings 
FOR ALL 
USING (
  has_role(auth.uid(), 'superadmin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Atualizar políticas de outras tabelas administrativas
DROP POLICY IF EXISTS "Admins can manage authors" ON public.authors;
CREATE POLICY "Superadmins and admins can manage authors" 
ON public.authors 
FOR ALL 
USING (
  has_role(auth.uid(), 'superadmin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Superadmins and admins can manage categories" 
ON public.categories 
FOR ALL 
USING (
  has_role(auth.uid(), 'superadmin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Admins can manage RSS feeds" ON public.rss_feeds;
CREATE POLICY "Superadmins and admins can manage RSS feeds" 
ON public.rss_feeds 
FOR ALL 
USING (
  has_role(auth.uid(), 'superadmin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'editor'::app_role)
);

-- Política específica para superadmin ter acesso total a analytics e logs
DROP POLICY IF EXISTS "Analytics viewable by admins" ON public.article_analytics;
CREATE POLICY "Analytics viewable by superadmins and admins" 
ON public.article_analytics 
FOR SELECT 
USING (
  has_role(auth.uid(), 'superadmin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Statistics viewable by admins" ON public.site_statistics;
CREATE POLICY "Statistics viewable by superadmins and admins" 
ON public.site_statistics 
FOR SELECT 
USING (
  has_role(auth.uid(), 'superadmin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Atualizar políticas de site_ads
DROP POLICY IF EXISTS "Admins can manage ads" ON public.site_ads;
CREATE POLICY "Superadmins and admins can manage ads" 
ON public.site_ads 
FOR ALL 
USING (
  has_role(auth.uid(), 'superadmin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Atualizar políticas de site_banners
DROP POLICY IF EXISTS "Admins can manage banners" ON public.site_banners;
CREATE POLICY "Superadmins and admins can manage banners" 
ON public.site_banners 
FOR ALL 
USING (
  has_role(auth.uid(), 'superadmin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Atualizar políticas de live_streams
DROP POLICY IF EXISTS "Admins can manage live streams" ON public.live_streams;
CREATE POLICY "Superadmins and admins can manage live streams" 
ON public.live_streams 
FOR ALL 
USING (
  has_role(auth.uid(), 'superadmin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);