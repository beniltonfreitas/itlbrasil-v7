-- Add missing categories for Agência Brasil
INSERT INTO public.categories (name, slug, description, color, icon) VALUES
('Direitos Humanos', 'direitos-humanos', 'Notícias sobre direitos humanos e cidadania', '#E11D48', 'Scale') ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (name, slug, description, color, icon) VALUES
('Educação', 'educacao', 'Notícias sobre educação e ensino', '#7C3AED', 'GraduationCap') ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (name, slug, description, color, icon) VALUES
('Geral', 'geral', 'Notícias gerais e diversos assuntos', '#6B7280', 'Newspaper') ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (name, slug, description, color, icon) VALUES
('Justiça', 'justica', 'Notícias sobre justiça e legislação', '#1F2937', 'Scale') ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (name, slug, description, color, icon) VALUES
('Política', 'politica', 'Notícias sobre política nacional e local', '#DC2626', 'Vote') ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (name, slug, description, color, icon) VALUES
('Saúde', 'saude', 'Notícias sobre saúde pública e medicina', '#059669', 'Heart') ON CONFLICT (slug) DO NOTHING;

-- Add new columns to rss_feeds table
ALTER TABLE public.rss_feeds 
ADD COLUMN IF NOT EXISTS is_native BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS review_queue BOOLEAN DEFAULT false;

-- Create articles_queue table for review system
CREATE TABLE IF NOT EXISTS public.articles_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  source_url TEXT,
  source_name TEXT,
  category_id UUID REFERENCES public.categories(id),
  feed_id UUID REFERENCES public.rss_feeds(id),
  featured_image TEXT,
  tags TEXT[],
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  read_time INTEGER DEFAULT 5,
  import_mode TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT
);

-- Enable RLS for articles_queue
ALTER TABLE public.articles_queue ENABLE ROW LEVEL SECURITY;

-- Create policies for articles_queue
CREATE POLICY "Articles queue are viewable by everyone" 
ON public.articles_queue 
FOR SELECT 
USING (true);

CREATE POLICY "Allow articles queue creation" 
ON public.articles_queue 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow articles queue updates" 
ON public.articles_queue 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow articles queue deletion" 
ON public.articles_queue 
FOR DELETE 
USING (true);

-- Insert Agência Brasil RSS feeds
DO $$
DECLARE
    cultura_cat_id UUID;
    direitos_cat_id UUID;
    economia_cat_id UUID;
    educacao_cat_id UUID;
    esportes_cat_id UUID;
    geral_cat_id UUID;
    internacional_cat_id UUID;
    justica_cat_id UUID;
    meio_ambiente_cat_id UUID;
    politica_cat_id UUID;
    saude_cat_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO cultura_cat_id FROM public.categories WHERE slug = 'cultura';
    SELECT id INTO direitos_cat_id FROM public.categories WHERE slug = 'direitos-humanos';
    SELECT id INTO economia_cat_id FROM public.categories WHERE slug = 'economia';
    SELECT id INTO educacao_cat_id FROM public.categories WHERE slug = 'educacao';
    SELECT id INTO esportes_cat_id FROM public.categories WHERE slug = 'esportes';
    SELECT id INTO geral_cat_id FROM public.categories WHERE slug = 'geral';
    SELECT id INTO internacional_cat_id FROM public.categories WHERE slug = 'internacional';
    SELECT id INTO justica_cat_id FROM public.categories WHERE slug = 'justica';
    SELECT id INTO meio_ambiente_cat_id FROM public.categories WHERE slug = 'meio-ambiente';
    SELECT id INTO politica_cat_id FROM public.categories WHERE slug = 'politica';
    SELECT id INTO saude_cat_id FROM public.categories WHERE slug = 'saude';

    -- Insert Agência Brasil feeds
    INSERT INTO public.rss_feeds (name, url, description, category_id, import_mode, import_interval, active, auto_publish, is_native, review_queue) VALUES
    ('Agência Brasil - Cultura', 'https://agenciabrasil.ebc.com.br/rss/cultura.xml', 'Feed oficial da Agência Brasil - Cultura', cultura_cat_id, 'automatic', 60, true, false, true, true) ON CONFLICT (url) DO NOTHING;

    INSERT INTO public.rss_feeds (name, url, description, category_id, import_mode, import_interval, active, auto_publish, is_native, review_queue) VALUES
    ('Agência Brasil - Direitos Humanos', 'https://agenciabrasil.ebc.com.br/rss/direitos-humanos.xml', 'Feed oficial da Agência Brasil - Direitos Humanos', direitos_cat_id, 'automatic', 60, true, false, true, true) ON CONFLICT (url) DO NOTHING;

    INSERT INTO public.rss_feeds (name, url, description, category_id, import_mode, import_interval, active, auto_publish, is_native, review_queue) VALUES
    ('Agência Brasil - Economia', 'https://agenciabrasil.ebc.com.br/rss/economia.xml', 'Feed oficial da Agência Brasil - Economia', economia_cat_id, 'automatic', 60, true, false, true, true) ON CONFLICT (url) DO NOTHING;

    INSERT INTO public.rss_feeds (name, url, description, category_id, import_mode, import_interval, active, auto_publish, is_native, review_queue) VALUES
    ('Agência Brasil - Educação', 'https://agenciabrasil.ebc.com.br/rss/educacao.xml', 'Feed oficial da Agência Brasil - Educação', educacao_cat_id, 'automatic', 60, true, false, true, true) ON CONFLICT (url) DO NOTHING;

    INSERT INTO public.rss_feeds (name, url, description, category_id, import_mode, import_interval, active, auto_publish, is_native, review_queue) VALUES
    ('Agência Brasil - Esportes', 'https://agenciabrasil.ebc.com.br/rss/esportes.xml', 'Feed oficial da Agência Brasil - Esportes', esportes_cat_id, 'automatic', 60, true, false, true, true) ON CONFLICT (url) DO NOTHING;

    INSERT INTO public.rss_feeds (name, url, description, category_id, import_mode, import_interval, active, auto_publish, is_native, review_queue) VALUES
    ('Agência Brasil - Geral', 'https://agenciabrasil.ebc.com.br/rss/geral.xml', 'Feed oficial da Agência Brasil - Geral', geral_cat_id, 'automatic', 60, true, false, true, true) ON CONFLICT (url) DO NOTHING;

    INSERT INTO public.rss_feeds (name, url, description, category_id, import_mode, import_interval, active, auto_publish, is_native, review_queue) VALUES
    ('Agência Brasil - Internacional', 'https://agenciabrasil.ebc.com.br/rss/internacional.xml', 'Feed oficial da Agência Brasil - Internacional', internacional_cat_id, 'automatic', 60, true, false, true, true) ON CONFLICT (url) DO NOTHING;

    INSERT INTO public.rss_feeds (name, url, description, category_id, import_mode, import_interval, active, auto_publish, is_native, review_queue) VALUES
    ('Agência Brasil - Justiça', 'https://agenciabrasil.ebc.com.br/rss/justica.xml', 'Feed oficial da Agência Brasil - Justiça', justica_cat_id, 'automatic', 60, true, false, true, true) ON CONFLICT (url) DO NOTHING;

    INSERT INTO public.rss_feeds (name, url, description, category_id, import_mode, import_interval, active, auto_publish, is_native, review_queue) VALUES
    ('Agência Brasil - Meio Ambiente', 'https://agenciabrasil.ebc.com.br/rss/meio-ambiente.xml', 'Feed oficial da Agência Brasil - Meio Ambiente', meio_ambiente_cat_id, 'automatic', 60, true, false, true, true) ON CONFLICT (url) DO NOTHING;

    INSERT INTO public.rss_feeds (name, url, description, category_id, import_mode, import_interval, active, auto_publish, is_native, review_queue) VALUES
    ('Agência Brasil - Política', 'https://agenciabrasil.ebc.com.br/rss/politica.xml', 'Feed oficial da Agência Brasil - Política', politica_cat_id, 'automatic', 60, true, false, true, true) ON CONFLICT (url) DO NOTHING;

    INSERT INTO public.rss_feeds (name, url, description, category_id, import_mode, import_interval, active, auto_publish, is_native, review_queue) VALUES
    ('Agência Brasil - Saúde', 'https://agenciabrasil.ebc.com.br/rss/saude.xml', 'Feed oficial da Agência Brasil - Saúde', saude_cat_id, 'automatic', 60, true, false, true, true) ON CONFLICT (url) DO NOTHING;
END $$;