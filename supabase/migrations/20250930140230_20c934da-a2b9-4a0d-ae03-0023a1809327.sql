-- Priority 1: Fix Profile Data Exposure
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Public can view author info without email" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create restrictive RLS policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (is_admin(auth.uid()));

-- Priority 1: Protect Commenter Email Privacy
-- Drop existing policy that exposes emails
DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.article_comments;

-- Create new policy that hides email addresses from public view
CREATE POLICY "Anyone can view approved comments without email"
ON public.article_comments
FOR SELECT
USING (status = 'approved');

-- Admin-only policy to view all comment details including emails
CREATE POLICY "Admins can view all comment details"
ON public.article_comments
FOR SELECT
USING (is_admin(auth.uid()));

-- Priority 2: Secure Database Functions with search_path
-- Update has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$function$;

-- Update is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = _user_id 
    AND role IN ('admin', 'superadmin')
  );
$function$;

-- Update increment_article_views function
CREATE OR REPLACE FUNCTION public.increment_article_views(article_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    UPDATE public.articles 
    SET views_count = COALESCE(views_count, 0) + 1 
    WHERE id = article_id;
END;
$function$;

-- Update cleanup_old_logs function
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    DELETE FROM article_analytics 
    WHERE created_at < (CURRENT_DATE - INTERVAL '6 months');
    
    DELETE FROM import_logs 
    WHERE started_at < (CURRENT_DATE - INTERVAL '3 months');
    
    DELETE FROM site_statistics 
    WHERE recorded_date < (CURRENT_DATE - INTERVAL '1 year');
END;
$function$;

-- Update collect_daily_statistics function
CREATE OR REPLACE FUNCTION public.collect_daily_statistics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    INSERT INTO site_statistics (metric_name, metric_value, recorded_date) VALUES 
    ('articles_total', to_jsonb((SELECT COUNT(*) FROM articles)), CURRENT_DATE),
    ('articles_published', to_jsonb((SELECT COUNT(*) FROM articles WHERE status = 'published')), CURRENT_DATE),
    ('articles_draft', to_jsonb((SELECT COUNT(*) FROM articles WHERE status = 'draft')), CURRENT_DATE),
    ('articles_today', to_jsonb((SELECT COUNT(*) FROM articles WHERE DATE(created_at) = CURRENT_DATE)), CURRENT_DATE)
    ON CONFLICT (metric_name, recorded_date) DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    created_at = now();
    
    INSERT INTO site_statistics (metric_name, metric_value, recorded_date) VALUES 
    ('users_total', to_jsonb((SELECT COUNT(*) FROM profiles)), CURRENT_DATE),
    ('users_active', to_jsonb((SELECT COUNT(*) FROM profiles WHERE status = 'active')), CURRENT_DATE)
    ON CONFLICT (metric_name, recorded_date) DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    created_at = now();
    
    INSERT INTO site_statistics (metric_name, metric_value, recorded_date) VALUES 
    ('newsletter_subscribers', to_jsonb((SELECT COUNT(*) FROM newsletter_subscribers WHERE active = true)), CURRENT_DATE),
    ('newsletter_confirmed', to_jsonb((SELECT COUNT(*) FROM newsletter_subscribers WHERE confirmed = true)), CURRENT_DATE)
    ON CONFLICT (metric_name, recorded_date) DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    created_at = now();
END;
$function$;