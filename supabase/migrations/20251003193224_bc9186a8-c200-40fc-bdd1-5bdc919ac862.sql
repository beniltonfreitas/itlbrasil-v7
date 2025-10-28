-- Add missing columns to articles table
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS read_time integer DEFAULT 5,
ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS meta_keywords text[] DEFAULT '{}';

-- Add missing columns to academy_categories table
ALTER TABLE public.academy_categories 
ADD COLUMN IF NOT EXISTS icon text,
ADD COLUMN IF NOT EXISTS color text DEFAULT '#3B82F6';

-- Add missing columns to academy_courses table
ALTER TABLE public.academy_courses 
ADD COLUMN IF NOT EXISTS price numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS level text DEFAULT 'beginner',
ADD COLUMN IF NOT EXISTS duration integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS short_description text,
ADD COLUMN IF NOT EXISTS featured_image text,
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS enrollment_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 0;

-- Add missing columns to articles_queue table
ALTER TABLE public.articles_queue 
ADD COLUMN IF NOT EXISTS excerpt text,
ADD COLUMN IF NOT EXISTS source_name text,
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id),
ADD COLUMN IF NOT EXISTS feed_id uuid REFERENCES public.rss_feeds(id),
ADD COLUMN IF NOT EXISTS featured_image text,
ADD COLUMN IF NOT EXISTS author text,
ADD COLUMN IF NOT EXISTS published_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS language text DEFAULT 'pt-BR',
ADD COLUMN IF NOT EXISTS read_time integer DEFAULT 5,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS error_message text;

-- Add missing columns to article_analytics table
ALTER TABLE public.article_analytics 
ADD COLUMN IF NOT EXISTS event_type text DEFAULT 'view';

-- Add missing column to site_statistics table
ALTER TABLE public.site_statistics 
ADD COLUMN IF NOT EXISTS recorded_date date DEFAULT CURRENT_DATE;