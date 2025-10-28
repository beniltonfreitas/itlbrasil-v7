-- First, remove or update articles in queue that reference native feeds
UPDATE articles_queue SET feed_id = NULL WHERE feed_id IN (SELECT id FROM rss_feeds WHERE is_native = true);

-- Remove all existing native RSS feeds
DELETE FROM rss_feeds WHERE is_native = true;

-- Insert Agência Brasil feeds (11 feeds)
INSERT INTO rss_feeds (name, url, description, is_native, active, import_mode, import_interval, max_articles_per_import, auto_publish, review_queue) VALUES
('Agência Brasil – Últimas Notícias', 'http://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml', 'Feed de últimas notícias da Agência Brasil', true, true, 'automatic', 60, 5, false, true),
('Agência Brasil – Internacional', 'http://agenciabrasil.ebc.com.br/rss/internacional/feed.xml', 'Feed internacional da Agência Brasil', true, true, 'automatic', 60, 5, false, true),
('Agência Brasil – Direitos Humanos', 'http://agenciabrasil.ebc.com.br/rss/direitos-humanos/feed.xml', 'Feed de direitos humanos da Agência Brasil', true, true, 'automatic', 60, 5, false, true),
('Agência Brasil – Economia', 'http://agenciabrasil.ebc.com.br/rss/economia/feed.xml', 'Feed de economia da Agência Brasil', true, true, 'automatic', 60, 5, false, true),
('Agência Brasil – Educação', 'http://agenciabrasil.ebc.com.br/rss/educacao/feed.xml', 'Feed de educação da Agência Brasil', true, true, 'automatic', 60, 5, false, true),
('Agência Brasil – Esportes', 'http://agenciabrasil.ebc.com.br/rss/esportes/feed.xml', 'Feed de esportes da Agência Brasil', true, true, 'automatic', 60, 5, false, true),
('Agência Brasil – Geral', 'http://agenciabrasil.ebc.com.br/rss/geral/feed.xml', 'Feed geral da Agência Brasil', true, true, 'automatic', 60, 5, false, true),
('Agência Brasil – Justiça', 'http://agenciabrasil.ebc.com.br/rss/justica/feed.xml', 'Feed de justiça da Agência Brasil', true, true, 'automatic', 60, 5, false, true),
('Agência Brasil – Política', 'http://agenciabrasil.ebc.com.br/rss/politica/feed.xml', 'Feed de política da Agência Brasil', true, true, 'automatic', 60, 5, false, true),
('Agência Brasil – Saúde', 'http://agenciabrasil.ebc.com.br/rss/saude/feed.xml', 'Feed de saúde da Agência Brasil', true, true, 'automatic', 60, 5, false, true),
('Agência Brasil – Parceiros', 'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/parceiros/feed.xml', 'Feed de parceiros da Agência Brasil', true, true, 'automatic', 60, 5, false, true);

-- Insert Radioagência Nacional feeds (14 feeds)
INSERT INTO rss_feeds (name, url, description, is_native, active, import_mode, import_interval, max_articles_per_import, auto_publish, review_queue) VALUES
('Radioagência Nacional – Últimas Notícias', 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/ultimasnoticias/feed.xml', 'Feed de últimas notícias da Radioagência Nacional', true, true, 'automatic', 60, 5, false, true),
('Radioagência Nacional – Internacional', 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/internacional/feed.xml', 'Feed internacional da Radioagência Nacional', true, true, 'automatic', 60, 5, false, true),
('Radioagência Nacional – Cultura', 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/cultura/feed.xml', 'Feed de cultura da Radioagência Nacional', true, true, 'automatic', 60, 5, false, true),
('Radioagência Nacional – Direitos Humanos', 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/direitos-humanos/feed.xml', 'Feed de direitos humanos da Radioagência Nacional', true, true, 'automatic', 60, 5, false, true),
('Radioagência Nacional – Economia', 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/economia/feed.xml', 'Feed de economia da Radioagência Nacional', true, true, 'automatic', 60, 5, false, true),
('Radioagência Nacional – Educação', 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/educacao/feed.xml', 'Feed de educação da Radioagência Nacional', true, true, 'automatic', 60, 5, false, true),
('Radioagência Nacional – Esportes', 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/esportes/feed.xml', 'Feed de esportes da Radioagência Nacional', true, true, 'automatic', 60, 5, false, true),
('Radioagência Nacional – Geral', 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/geral/feed.xml', 'Feed geral da Radioagência Nacional', true, true, 'automatic', 60, 5, false, true),
('Radioagência Nacional – Justiça', 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/justica/feed.xml', 'Feed de justiça da Radioagência Nacional', true, true, 'automatic', 60, 5, false, true),
('Radioagência Nacional – Meio Ambiente', 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/meio-ambiente/feed.xml', 'Feed de meio ambiente da Radioagência Nacional', true, true, 'automatic', 60, 5, false, true),
('Radioagência Nacional – Pesquisa e Inovação', 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/pesquisa-e-inovacao/feed.xml', 'Feed de pesquisa e inovação da Radioagência Nacional', true, true, 'automatic', 60, 5, false, true),
('Radioagência Nacional – Política', 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/politica/feed.xml', 'Feed de política da Radioagência Nacional', true, true, 'automatic', 60, 5, false, true),
('Radioagência Nacional – Saúde', 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/saude/feed.xml', 'Feed de saúde da Radioagência Nacional', true, true, 'automatic', 60, 5, false, true),
('Radioagência Nacional – Segurança', 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/seguranca/feed.xml', 'Feed de segurança da Radioagência Nacional', true, true, 'automatic', 60, 5, false, true);

-- Insert Metrópole Online feeds (19 feeds)
INSERT INTO rss_feeds (name, url, description, is_native, active, import_mode, import_interval, max_articles_per_import, auto_publish, review_queue) VALUES
('Metrópole Online – Últimas Notícias', 'https://metropoleonline.com.br/rss/latest-posts', 'Feed de últimas notícias do Metrópole Online', true, true, 'automatic', 60, 5, false, true),
('Metrópole Online – Mundo', 'https://metropoleonline.com.br/rss/category/mundo', 'Feed de notícias do mundo do Metrópole Online', true, true, 'automatic', 60, 5, false, true),
('Metrópole Online – Barueri', 'https://metropoleonline.com.br/rss/category/barueri', 'Feed de Barueri do Metrópole Online', true, true, 'automatic', 60, 5, false, true),
('Metrópole Online – Cajamar', 'https://metropoleonline.com.br/rss/category/cajamar', 'Feed de Cajamar do Metrópole Online', true, true, 'automatic', 60, 5, false, true),
('Metrópole Online – Cidades', 'https://metropoleonline.com.br/rss/category/cidades', 'Feed de cidades do Metrópole Online', true, true, 'automatic', 60, 5, false, true),
('Metrópole Online – Celebridades', 'https://metropoleonline.com.br/rss/category/celebridades', 'Feed de celebridades do Metrópole Online', true, true, 'automatic', 60, 5, false, true),
('Metrópole Online – Caieiras', 'https://metropoleonline.com.br/rss/category/caieiras', 'Feed de Caieiras do Metrópole Online', true, true, 'automatic', 60, 5, false, true),
('Metrópole Online – Economia', 'https://metropoleonline.com.br/rss/category/economia', 'Feed de economia do Metrópole Online', true, true, 'automatic', 60, 5, false, true),
('Metrópole Online – Esportes', 'https://metropoleonline.com.br/rss/category/esportes', 'Feed de esportes do Metrópole Online', true, true, 'automatic', 60, 5, false, true),
('Metrópole Online – Francisco Morato', 'https://metropoleonline.com.br/rss/category/francisco-morato', 'Feed de Francisco Morato do Metrópole Online', true, true, 'automatic', 60, 5, false, true),
('Metrópole Online – Franco da Rocha', 'https://metropoleonline.com.br/rss/category/franco-da-rocha', 'Feed de Franco da Rocha do Metrópole Online', true, true, 'automatic', 60, 5, false, true),
('Metrópole Online – Grande SP', 'https://metropoleonline.com.br/rss/category/grande-sp', 'Feed da Grande SP do Metrópole Online', true, true, 'automatic', 60, 5, false, true),
('Metrópole Online – Jundiaí', 'https://metropoleonline.com.br/rss/category/jundiai', 'Feed de Jundiaí do Metrópole Online', true, true, 'automatic', 60, 5, false, true),
('Metrópole Online – Polícia', 'https://metropoleonline.com.br/rss/category/policia', 'Feed de polícia do Metrópole Online', true, true, 'automatic', 60, 5, false, true),
('Metrópole Online – Política', 'https://metropoleonline.com.br/rss/category/politica', 'Feed de política do Metrópole Online', true, true, 'automatic', 60, 5, false, true),
('Metrópole Online – Poder Legislativo de Cajamar', 'https://metropoleonline.com.br/rss/category/poder-legislativo', 'Feed do poder legislativo do Metrópole Online', true, true, 'automatic', 60, 5, false, true),
('Metrópole Online – Santana de Parnaíba', 'https://metropoleonline.com.br/rss/category/santana-de-parnaiba', 'Feed de Santana de Parnaíba do Metrópole Online', true, true, 'automatic', 60, 5, false, true),
('Metrópole Online – Tecnologia', 'https://metropoleonline.com.br/rss/category/tecnologia', 'Feed de tecnologia do Metrópole Online', true, true, 'automatic', 60, 5, false, true),
('Metrópole Online – Metrópole Pet', 'https://metropoleonline.com.br/rss/category/territorio-animal', 'Feed de pets do Metrópole Online', true, true, 'automatic', 60, 5, false, true);