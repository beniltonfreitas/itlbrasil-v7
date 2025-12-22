-- Add missing columns for featured image metadata
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS featured_image_alt TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS featured_image_credit TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS featured_image_json JSONB;

-- Add comments for documentation
COMMENT ON COLUMN public.articles.featured_image_alt IS 'Alt text/caption for the featured image';
COMMENT ON COLUMN public.articles.featured_image_credit IS 'Credit/source attribution for the featured image';
COMMENT ON COLUMN public.articles.featured_image_json IS 'Structured JSON data for the featured image (url, alt, credit, etc)';