-- Fix remaining database functions with secure search_path
CREATE OR REPLACE FUNCTION public.increment_article_views(article_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    UPDATE public.articles 
    SET views_count = COALESCE(views_count, 0) + 1 
    WHERE id = article_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.collect_daily_statistics()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Estatísticas de artigos
    INSERT INTO site_statistics (metric_name, metric_value, recorded_date) VALUES 
    ('articles_total', to_jsonb((SELECT COUNT(*) FROM articles)), CURRENT_DATE),
    ('articles_published', to_jsonb((SELECT COUNT(*) FROM articles WHERE status = 'published')), CURRENT_DATE),
    ('articles_draft', to_jsonb((SELECT COUNT(*) FROM articles WHERE status = 'draft')), CURRENT_DATE),
    ('articles_today', to_jsonb((SELECT COUNT(*) FROM articles WHERE DATE(created_at) = CURRENT_DATE)), CURRENT_DATE)
    ON CONFLICT (metric_name, recorded_date) DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    created_at = now();
    
    -- Estatísticas de usuários  
    INSERT INTO site_statistics (metric_name, metric_value, recorded_date) VALUES 
    ('users_total', to_jsonb((SELECT COUNT(*) FROM profiles)), CURRENT_DATE),
    ('users_active', to_jsonb((SELECT COUNT(*) FROM profiles WHERE status = 'active')), CURRENT_DATE)
    ON CONFLICT (metric_name, recorded_date) DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    created_at = now();
    
    -- Estatísticas de newsletter
    INSERT INTO site_statistics (metric_name, metric_value, recorded_date) VALUES 
    ('newsletter_subscribers', to_jsonb((SELECT COUNT(*) FROM newsletter_subscribers WHERE active = true)), CURRENT_DATE),
    ('newsletter_confirmed', to_jsonb((SELECT COUNT(*) FROM newsletter_subscribers WHERE confirmed = true)), CURRENT_DATE)
    ON CONFLICT (metric_name, recorded_date) DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    created_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Limpar analytics antigos (manter apenas 6 meses)
    DELETE FROM article_analytics 
    WHERE created_at < (CURRENT_DATE - INTERVAL '6 months');
    
    -- Limpar logs de importação antigos (manter apenas 3 meses)
    DELETE FROM import_logs 
    WHERE started_at < (CURRENT_DATE - INTERVAL '3 months');
    
    -- Limpar estatísticas antigas (manter apenas 1 ano)
    DELETE FROM site_statistics 
    WHERE recorded_date < (CURRENT_DATE - INTERVAL '1 year');
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;