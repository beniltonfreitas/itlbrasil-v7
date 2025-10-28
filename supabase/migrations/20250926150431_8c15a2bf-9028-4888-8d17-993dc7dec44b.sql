-- Adicionar feeds faltantes da Agência Brasil
INSERT INTO rss_feeds (name, url, is_native, active, category_id, auto_publish, review_queue, max_articles_per_import, import_mode) VALUES
('Agência Brasil - Cultura', 'http://agenciabrasil.ebc.com.br/rss/cultura/feed.xml', true, false, null, false, true, 5, 'manual'),
('Agência Brasil - Meio Ambiente', 'http://agenciabrasil.ebc.com.br/rss/meio-ambiente/feed.xml', true, false, null, false, true, 5, 'manual');

-- Adicionar todos os feeds da Radioagência Nacional
INSERT INTO rss_feeds (name, url, is_native, active, category_id, auto_publish, review_queue, max_articles_per_import, import_mode) VALUES
('Radioagência Nacional - Últimas Notícias', 'http://radioagencianacional.ebc.com.br/rss/ultimasnoticias/feed.xml', true, false, null, false, true, 5, 'manual'),
('Radioagência Nacional - Internacional', 'http://radioagencianacional.ebc.com.br/rss/internacional/feed.xml', true, false, null, false, true, 5, 'manual'),
('Radioagência Nacional - Cultura', 'http://radioagencianacional.ebc.com.br/rss/cultura/feed.xml', true, false, null, false, true, 5, 'manual'),
('Radioagência Nacional - Direitos Humanos', 'http://radioagencianacional.ebc.com.br/rss/direitos-humanos/feed.xml', true, false, null, false, true, 5, 'manual'),
('Radioagência Nacional - Economia', 'http://radioagencianacional.ebc.com.br/rss/economia/feed.xml', true, false, null, false, true, 5, 'manual'),
('Radioagência Nacional - Educação', 'http://radioagencianacional.ebc.com.br/rss/educacao/feed.xml', true, false, null, false, true, 5, 'manual'),
('Radioagência Nacional - Esportes', 'http://radioagencianacional.ebc.com.br/rss/esportes/feed.xml', true, false, null, false, true, 5, 'manual'),
('Radioagência Nacional - Geral', 'http://radioagencianacional.ebc.com.br/rss/geral/feed.xml', true, false, null, false, true, 5, 'manual'),
('Radioagência Nacional - Justiça', 'http://radioagencianacional.ebc.com.br/rss/justica/feed.xml', true, false, null, false, true, 5, 'manual'),
('Radioagência Nacional - Meio Ambiente', 'http://radioagencianacional.ebc.com.br/rss/meio-ambiente/feed.xml', true, false, null, false, true, 5, 'manual'),
('Radioagência Nacional - Pesquisa e Inovação', 'http://radioagencianacional.ebc.com.br/rss/pesquisa-e-inovacao/feed.xml', true, false, null, false, true, 5, 'manual'),
('Radioagência Nacional - Política', 'http://radioagencianacional.ebc.com.br/rss/politica/feed.xml', true, false, null, false, true, 5, 'manual'),
('Radioagência Nacional - Saúde', 'http://radioagencianacional.ebc.com.br/rss/saude/feed.xml', true, false, null, false, true, 5, 'manual'),
('Radioagência Nacional - Segurança', 'http://radioagencianacional.ebc.com.br/rss/seguranca/feed.xml', true, false, null, false, true, 5, 'manual');

-- Adicionar feeds faltantes do Metrópole Online
INSERT INTO rss_feeds (name, url, is_native, active, category_id, auto_publish, review_queue, max_articles_per_import, import_mode) VALUES
('Metrópole Online - Últimas Notícias', 'https://metropoleonline.com.br/rss', true, false, null, false, true, 5, 'manual'),
('Metrópole Online - Cotia', 'https://metropoleonline.com.br/rss/category/cotia', true, false, null, false, true, 5, 'manual'),
('Metrópole Online - Crônicas', 'https://metropoleonline.com.br/rss/category/cronicas', true, false, null, false, true, 5, 'manual'),
('Metrópole Online - Itapevi', 'https://metropoleonline.com.br/rss/category/itapevi', true, false, null, false, true, 5, 'manual'),
('Metrópole Online - Jandira', 'https://metropoleonline.com.br/rss/category/jandira', true, false, null, false, true, 5, 'manual');