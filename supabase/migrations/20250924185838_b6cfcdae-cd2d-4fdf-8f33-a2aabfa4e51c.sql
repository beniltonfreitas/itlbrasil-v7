-- Expansão da tabela articles para suportar funcionalidades avançadas
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS source_name TEXT,
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
ADD COLUMN IF NOT EXISTS import_mode TEXT CHECK (import_mode IN ('manual', 'automatic')),
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS meta_keywords TEXT,
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0;

-- Criar tabela para feeds RSS
CREATE TABLE IF NOT EXISTS public.rss_feeds (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    description TEXT,
    import_mode TEXT DEFAULT 'manual' CHECK (import_mode IN ('manual', 'automatic')),
    import_interval INTEGER DEFAULT 60, -- minutos
    last_import TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT true,
    category_id UUID REFERENCES public.categories(id),
    auto_publish BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para histórico de versões de artigos
CREATE TABLE IF NOT EXISTS public.article_versions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL DEFAULT 1,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    changes_description TEXT,
    created_by TEXT, -- user_id quando implementarmos auth
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para logs de importação
CREATE TABLE IF NOT EXISTS public.import_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    feed_id UUID REFERENCES public.rss_feeds(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('success', 'error', 'processing')),
    articles_imported INTEGER DEFAULT 0,
    error_message TEXT,
    import_mode TEXT CHECK (import_mode IN ('manual', 'automatic')),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Criar tabela para créditos de imagens
CREATE TABLE IF NOT EXISTS public.image_credits (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    credit_text TEXT NOT NULL,
    credit_url TEXT,
    position TEXT DEFAULT 'featured' CHECK (position IN ('featured', 'content')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para analytics de artigos
CREATE TABLE IF NOT EXISTS public.article_analytics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('view', 'share', 'click')),
    source TEXT, -- referrer, social media, etc.
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_scheduled_at ON public.articles(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON public.articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_rss_feeds_active ON public.rss_feeds(active);
CREATE INDEX IF NOT EXISTS idx_article_versions_article_id ON public.article_versions(article_id);
CREATE INDEX IF NOT EXISTS idx_article_analytics_article_id ON public.article_analytics(article_id);
CREATE INDEX IF NOT EXISTS idx_article_analytics_created_at ON public.article_analytics(created_at);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.rss_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_analytics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (serão refinadas quando implementarmos auth)
CREATE POLICY "RSS feeds are viewable by everyone" ON public.rss_feeds FOR SELECT USING (true);
CREATE POLICY "Article versions are viewable by everyone" ON public.article_versions FOR SELECT USING (true);
CREATE POLICY "Import logs are viewable by everyone" ON public.import_logs FOR SELECT USING (true);
CREATE POLICY "Image credits are viewable by everyone" ON public.image_credits FOR SELECT USING (true);
CREATE POLICY "Analytics can be inserted by anyone" ON public.article_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Analytics are private" ON public.article_analytics FOR SELECT USING (false);

-- Atualizar política de artigos para incluir rascunhos
DROP POLICY IF EXISTS "Published articles are viewable by everyone" ON public.articles;
CREATE POLICY "Published articles are viewable by everyone" ON public.articles 
FOR SELECT USING (status = 'published' AND published_at IS NOT NULL);

-- Trigger para atualizar updated_at nas novas tabelas
CREATE TRIGGER update_rss_feeds_updated_at
    BEFORE UPDATE ON public.rss_feeds
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Função para incrementar views
CREATE OR REPLACE FUNCTION public.increment_article_views(article_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.articles 
    SET views_count = COALESCE(views_count, 0) + 1 
    WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;