-- Add missing column to articles table
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;

-- Add missing columns to articles_queue table
ALTER TABLE public.articles_queue 
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text,
ADD COLUMN IF NOT EXISTS meta_keywords text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS import_mode text DEFAULT 'auto',
ADD COLUMN IF NOT EXISTS auto_publish boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS rewrite_content boolean DEFAULT false;

-- Add missing columns to authors table
ALTER TABLE public.authors 
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}';

-- Add missing columns to categories table  
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS color text DEFAULT '#3B82F6',
ADD COLUMN IF NOT EXISTS icon text;