-- Create webstories table
CREATE TABLE public.webstories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  cover_image text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author_id uuid REFERENCES public.authors(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  meta_description text,
  meta_keywords text[],
  source_article_id uuid REFERENCES public.articles(id),
  views_count integer DEFAULT 0
);

-- Create webstory_pages table
CREATE TABLE public.webstory_pages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webstory_id uuid NOT NULL REFERENCES public.webstories(id) ON DELETE CASCADE,
  page_number integer NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('text', 'image', 'video')),
  content_data jsonb NOT NULL DEFAULT '{}',
  background_color text DEFAULT '#000000',
  text_color text DEFAULT '#ffffff',
  font_family text DEFAULT 'Inter',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(webstory_id, page_number)
);

-- Enable RLS
ALTER TABLE public.webstories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webstory_pages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for webstories
CREATE POLICY "WebStories are viewable by everyone" 
ON public.webstories 
FOR SELECT 
USING (true);

CREATE POLICY "Published webstories are publicly viewable" 
ON public.webstories 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Allow webstory creation" 
ON public.webstories 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow webstory updates" 
ON public.webstories 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow webstory deletion" 
ON public.webstories 
FOR DELETE 
USING (true);

-- Create RLS policies for webstory_pages
CREATE POLICY "WebStory pages are viewable by everyone" 
ON public.webstory_pages 
FOR SELECT 
USING (true);

CREATE POLICY "Allow webstory pages creation" 
ON public.webstory_pages 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow webstory pages updates" 
ON public.webstory_pages 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow webstory pages deletion" 
ON public.webstory_pages 
FOR DELETE 
USING (true);

-- Create indexes for performance
CREATE INDEX idx_webstories_status ON public.webstories(status);
CREATE INDEX idx_webstories_author ON public.webstories(author_id);
CREATE INDEX idx_webstories_slug ON public.webstories(slug);
CREATE INDEX idx_webstory_pages_story ON public.webstory_pages(webstory_id);
CREATE INDEX idx_webstory_pages_order ON public.webstory_pages(webstory_id, page_number);

-- Create trigger for updated_at
CREATE TRIGGER update_webstories_updated_at
BEFORE UPDATE ON public.webstories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add WebStories settings
INSERT INTO public.site_settings (key, value, description) VALUES
('webstories_enabled', 'true', 'Ativar/desativar sistema WebStories'),
('webstories_auto_publish', 'false', 'Publicação automática via RSS')
ON CONFLICT (key) DO NOTHING;