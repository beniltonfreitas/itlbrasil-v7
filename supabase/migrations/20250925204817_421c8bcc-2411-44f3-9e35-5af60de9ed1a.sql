-- Add additional_images field to articles table for multiple images support
ALTER TABLE public.articles 
ADD COLUMN additional_images JSONB DEFAULT '[]'::jsonb;

-- Add comment to document the structure
COMMENT ON COLUMN public.articles.additional_images IS 'Array of image objects with structure: [{url: string, caption?: string, credit?: string, position: number}]';