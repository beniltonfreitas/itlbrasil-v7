-- Expandir tabela media_library para suporte a vídeos do YouTube
ALTER TABLE public.media_library ADD COLUMN IF NOT EXISTS youtube_video_id text;
ALTER TABLE public.media_library ADD COLUMN IF NOT EXISTS youtube_channel_id text;
ALTER TABLE public.media_library ADD COLUMN IF NOT EXISTS youtube_channel_name text;
ALTER TABLE public.media_library ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;
ALTER TABLE public.media_library ADD COLUMN IF NOT EXISTS published_at timestamp with time zone;
ALTER TABLE public.media_library ADD COLUMN IF NOT EXISTS category text;

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_media_library_youtube_video_id ON public.media_library(youtube_video_id);
CREATE INDEX IF NOT EXISTS idx_media_library_content_type ON public.media_library(content_type);
CREATE INDEX IF NOT EXISTS idx_media_library_category ON public.media_library(category);
CREATE INDEX IF NOT EXISTS idx_media_library_published_at ON public.media_library(published_at DESC);

-- Comentários para documentação
COMMENT ON COLUMN public.media_library.youtube_video_id IS 'ID do vídeo do YouTube extraído da URL';
COMMENT ON COLUMN public.media_library.youtube_channel_id IS 'ID do canal do YouTube';
COMMENT ON COLUMN public.media_library.youtube_channel_name IS 'Nome do canal do YouTube';
COMMENT ON COLUMN public.media_library.view_count IS 'Contador de visualizações do vídeo';
COMMENT ON COLUMN public.media_library.published_at IS 'Data de publicação original do vídeo';
COMMENT ON COLUMN public.media_library.category IS 'Categoria do vídeo (Geopolítica, Economia, etc)';