-- Fix the problematic Geopolítica RSS feed URL
UPDATE rss_feeds 
SET url = 'https://agenciabrasil.ebc.com.br/rss/geral/feed.xml'
WHERE name LIKE '%Geopolítica%' OR url LIKE '%geopolitica%';