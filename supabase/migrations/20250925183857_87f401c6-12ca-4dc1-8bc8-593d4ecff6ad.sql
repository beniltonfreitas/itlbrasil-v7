-- Remove duplicate custom feed that conflicts with native feed
DELETE FROM rss_feeds WHERE id = '1efc53b7-f37c-48ee-a138-fc5862ef0073' AND is_native = false;

-- Add constraint to prevent duplicate feeds based on URL
ALTER TABLE rss_feeds ADD CONSTRAINT rss_feeds_url_unique UNIQUE (url);