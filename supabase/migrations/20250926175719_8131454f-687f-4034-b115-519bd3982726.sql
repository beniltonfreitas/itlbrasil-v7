-- Fase 1: Desativar todos os feeds nativos e configurar para importação manual
UPDATE public.rss_feeds 
SET 
  active = false,
  import_mode = 'manual',
  auto_publish = false,
  import_interval = 60
WHERE is_native = true;

-- Criar tabela para logs de teste de feeds
CREATE TABLE IF NOT EXISTS public.feed_test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feed_id UUID NOT NULL REFERENCES public.rss_feeds(id) ON DELETE CASCADE,
  test_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'timeout', 'invalid_content')),
  http_status INTEGER,
  response_time_ms INTEGER,
  error_message TEXT,
  content_preview TEXT,
  articles_found INTEGER DEFAULT 0,
  last_article_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.feed_test_results ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Feed test results are viewable by everyone" 
ON public.feed_test_results 
FOR SELECT 
USING (true);

CREATE POLICY "Feed test results can be created by anyone" 
ON public.feed_test_results 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Feed test results can be updated by anyone" 
ON public.feed_test_results 
FOR UPDATE 
USING (true);

-- Criar índices para performance
CREATE INDEX idx_feed_test_results_feed_id ON public.feed_test_results(feed_id);
CREATE INDEX idx_feed_test_results_test_date ON public.feed_test_results(test_date DESC);
CREATE INDEX idx_feed_test_results_status ON public.feed_test_results(status);