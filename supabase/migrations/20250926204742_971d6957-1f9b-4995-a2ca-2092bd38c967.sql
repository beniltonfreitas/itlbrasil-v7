-- Add fields to rss_feeds table for content quality filtering
ALTER TABLE public.rss_feeds 
ADD COLUMN IF NOT EXISTS min_content_length INTEGER DEFAULT 200,
ADD COLUMN IF NOT EXISTS require_image BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS min_title_length INTEGER DEFAULT 10;

-- Add featured_image column to articles table if it doesn't exist
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS featured_image TEXT;