-- Corrigir a função para seguir as práticas de segurança do Supabase
DROP FUNCTION IF EXISTS public.increment_article_views(UUID);

CREATE OR REPLACE FUNCTION public.increment_article_views(article_id UUID)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.articles 
    SET views_count = COALESCE(views_count, 0) + 1 
    WHERE id = article_id;
END;
$$;