-- Ativar feeds prioritários (Últimas Notícias de cada fonte)
UPDATE rss_feeds 
SET active = true 
WHERE name IN (
  'Agência Brasil - Últimas Notícias',
  'Radioagência Nacional - Últimas Notícias', 
  'Metrópole Online - Últimas Notícias'
);