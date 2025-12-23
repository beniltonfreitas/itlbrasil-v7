-- Add location field to articles table for editorial credits
ALTER TABLE articles ADD COLUMN IF NOT EXISTS location TEXT;

-- Add comment for documentation
COMMENT ON COLUMN articles.location IS 'Location/city where the news was written (e.g., São Paulo, Rio de Janeiro)';