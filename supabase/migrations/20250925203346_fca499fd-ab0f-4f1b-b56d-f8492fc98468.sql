-- Add max_articles_per_import field to rss_feeds table
ALTER TABLE public.rss_feeds 
ADD COLUMN max_articles_per_import integer DEFAULT 5 
CHECK (max_articles_per_import >= 1 AND max_articles_per_import <= 5);

-- Update existing feeds to have the default value
UPDATE public.rss_feeds 
SET max_articles_per_import = 5 
WHERE max_articles_per_import IS NULL;