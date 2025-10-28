-- Configurações essenciais do site
INSERT INTO site_settings (key, value, description) VALUES 
('site_name', '"ITL Brasil"', 'Nome do site'),
('site_description', '"Portal de análises geopolíticas e notícias internacionais"', 'Descrição do site'),
('site_logo', '"/logo-itl-brasil.png"', 'Logo do site'),
('contact_email', '"contato@itlbrasil.com"', 'Email de contato'),
('contact_phone', '"+55 11 99999-9999"', 'Telefone de contato'),
('social_facebook', '"https://facebook.com/itlbrasil"', 'Link do Facebook'),
('social_twitter', '"https://twitter.com/itlbrasil"', 'Link do Twitter'),
('social_youtube', '"https://youtube.com/@itlbrasil"', 'Link do YouTube'),
('social_instagram', '"https://instagram.com/itlbrasil"', 'Link do Instagram'),
('seo_keywords', '"geopolítica, brasil, notícias internacionais, análise política"', 'Palavras-chave SEO'),
('analytics_google', '""', 'ID do Google Analytics'),
('newsletter_provider', '"resend"', 'Provedor de newsletter'),
('theme_default', '"modelo-itl-02"', 'Tema padrão do site'),
('maintenance_mode', 'false', 'Modo de manutenção'),
('comments_enabled', 'true', 'Comentários habilitados'),
('registration_open', 'false', 'Registro aberto para novos usuários')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = now();

-- Criar buckets de storage se não existirem
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit) VALUES 
('article-images', 'article-images', true, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'], 10485760),
('avatars', 'avatars', true, ARRAY['image/jpeg', 'image/png', 'image/webp'], 2097152),
('media-files', 'media-files', true, ARRAY['video/mp4', 'audio/mpeg', 'audio/wav', 'video/webm'], 104857600),
('thumbnails', 'thumbnails', true, ARRAY['image/jpeg', 'image/png', 'image/webp'], 1048576),
('documents', 'documents', false, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], 10485760)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para article-images
CREATE POLICY "Anyone can view article images" ON storage.objects
FOR SELECT USING (bucket_id = 'article-images');

CREATE POLICY "Authenticated users can upload article images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'article-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their article images" ON storage.objects
FOR UPDATE USING (bucket_id = 'article-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete article images" ON storage.objects
FOR DELETE USING (bucket_id = 'article-images' AND is_admin(auth.uid()));

-- Políticas de storage para avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their avatars" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

-- Políticas de storage para media-files
CREATE POLICY "Anyone can view media files" ON storage.objects
FOR SELECT USING (bucket_id = 'media-files');

CREATE POLICY "Admins can manage media files" ON storage.objects
FOR ALL USING (bucket_id = 'media-files' AND is_admin(auth.uid()));

-- Políticas de storage para thumbnails
CREATE POLICY "Anyone can view thumbnails" ON storage.objects
FOR SELECT USING (bucket_id = 'thumbnails');

CREATE POLICY "System can manage thumbnails" ON storage.objects
FOR ALL USING (bucket_id = 'thumbnails');

-- Políticas de storage para documents
CREATE POLICY "Authenticated users can view documents" ON storage.objects
FOR SELECT USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage documents" ON storage.objects
FOR ALL USING (bucket_id = 'documents' AND is_admin(auth.uid()));

-- Tabela para transmissões ao vivo (TV/Rádio)
CREATE TABLE public.live_streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  stream_url TEXT NOT NULL,
  stream_type TEXT NOT NULL CHECK (stream_type IN ('tv', 'radio', 'podcast')),
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('live', 'offline', 'scheduled')),
  thumbnail_url TEXT,
  scheduled_start TIMESTAMP WITH TIME ZONE,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  viewer_count INTEGER DEFAULT 0,
  chat_enabled BOOLEAN DEFAULT true,
  embed_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para programação de conteúdo
CREATE TABLE public.program_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  program_type TEXT NOT NULL CHECK (program_type IN ('tv', 'radio', 'podcast')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  recurring_pattern TEXT CHECK (recurring_pattern IN ('daily', 'weekly', 'monthly', 'none')),
  host_name TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para biblioteca de mídia
CREATE TABLE public.media_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  media_type TEXT NOT NULL CHECK (media_type IN ('video', 'audio', 'image')),
  content_type TEXT NOT NULL CHECK (content_type IN ('tv', 'radio', 'podcast', 'general')),
  duration INTEGER, -- em segundos
  file_size BIGINT, -- em bytes
  tags TEXT[],
  uploaded_by UUID REFERENCES profiles(user_id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para comentários de artigos
CREATE TABLE public.article_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES article_comments(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'rejected')),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para estatísticas detalhadas
CREATE TABLE public.site_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value JSONB NOT NULL DEFAULT '{}',
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(metric_name, recorded_date)
);

-- Habilitar RLS em todas as novas tabelas
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_statistics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para live_streams
CREATE POLICY "Anyone can view live streams" ON public.live_streams
FOR SELECT USING (true);

CREATE POLICY "Only admins can manage live streams" ON public.live_streams
FOR ALL USING (is_admin(auth.uid()));

-- Políticas RLS para program_schedule
CREATE POLICY "Anyone can view program schedule" ON public.program_schedule
FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage program schedule" ON public.program_schedule
FOR ALL USING (is_admin(auth.uid()));

-- Políticas RLS para media_library
CREATE POLICY "Anyone can view public media" ON public.media_library
FOR SELECT USING (is_public = true);

CREATE POLICY "Authenticated users can view all media" ON public.media_library
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can upload media" ON public.media_library
FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Admins can manage all media" ON public.media_library
FOR ALL USING (is_admin(auth.uid()));

-- Políticas RLS para article_comments
CREATE POLICY "Anyone can view approved comments" ON public.article_comments
FOR SELECT USING (status = 'approved');

CREATE POLICY "Anyone can create comments" ON public.article_comments
FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can update comments" ON public.article_comments
FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can delete comments" ON public.article_comments
FOR DELETE USING (is_admin(auth.uid()));

-- Políticas RLS para site_statistics
CREATE POLICY "Only admins can view statistics" ON public.site_statistics
FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can manage statistics" ON public.site_statistics
FOR ALL USING (is_admin(auth.uid()));

-- Triggers para updated_at
CREATE TRIGGER update_live_streams_updated_at
BEFORE UPDATE ON public.live_streams
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_program_schedule_updated_at
BEFORE UPDATE ON public.program_schedule
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_media_library_updated_at
BEFORE UPDATE ON public.media_library
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_article_comments_updated_at
BEFORE UPDATE ON public.article_comments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para coleta de estatísticas diárias
CREATE OR REPLACE FUNCTION public.collect_daily_statistics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Função para limpeza automática de logs antigos
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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