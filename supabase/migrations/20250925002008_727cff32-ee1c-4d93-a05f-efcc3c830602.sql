-- Remove existing native feeds
DELETE FROM rss_feeds WHERE is_native = true;

-- Insert updated Agência Brasil feeds
INSERT INTO rss_feeds (name, url, description, category_id, active, is_native, import_mode, auto_publish, review_queue) VALUES
-- Agência Brasil
('Agência Brasil - Últimas Notícias', 'http://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml', 'Feed principal da Agência Brasil com as últimas notícias', NULL, true, true, 'manual', false, true),
('Agência Brasil - Direitos Humanos', 'http://agenciabrasil.ebc.com.br/rss/direitos-humanos/feed.xml', 'Notícias sobre direitos humanos da Agência Brasil', NULL, true, true, 'manual', false, true),
('Agência Brasil - Economia', 'http://agenciabrasil.ebc.com.br/rss/economia/feed.xml', 'Notícias econômicas da Agência Brasil', NULL, true, true, 'manual', false, true),
('Agência Brasil - Educação', 'http://agenciabrasil.ebc.com.br/rss/educacao/feed.xml', 'Notícias sobre educação da Agência Brasil', NULL, true, true, 'manual', false, true),
('Agência Brasil - Esportes', 'http://agenciabrasil.ebc.com.br/rss/esportes/feed.xml', 'Notícias esportivas da Agência Brasil', NULL, true, true, 'manual', false, true),
('Agência Brasil - Geral', 'http://agenciabrasil.ebc.com.br/rss/geral/feed.xml', 'Notícias gerais da Agência Brasil', NULL, true, true, 'manual', false, true),
('Agência Brasil - Internacional', 'http://agenciabrasil.ebc.com.br/rss/internacional/feed.xml', 'Notícias internacionais da Agência Brasil', NULL, true, true, 'manual', false, true),
('Agência Brasil - Justiça', 'http://agenciabrasil.ebc.com.br/rss/justica/feed.xml', 'Notícias sobre justiça da Agência Brasil', NULL, true, true, 'manual', false, true),
('Agência Brasil - Política', 'http://agenciabrasil.ebc.com.br/rss/politica/feed.xml', 'Notícias políticas da Agência Brasil', NULL, true, true, 'manual', false, true),
('Agência Brasil - Saúde', 'http://agenciabrasil.ebc.com.br/rss/saude/feed.xml', 'Notícias sobre saúde da Agência Brasil', NULL, true, true, 'manual', false, true),
('Agência Brasil - Parceiros', 'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/parceiros/feed.xml', 'Feed de parceiros da Agência Brasil', NULL, true, true, 'manual', false, true),

-- Radioagência Nacional
('Radioagência Nacional - Últimas Notícias', 'http://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/ultimasnoticias/feed.xml', 'Últimas notícias da Radioagência Nacional', NULL, true, true, 'manual', false, true),
('Radioagência Nacional - Cultura', 'http://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/cultura/feed.xml', 'Notícias culturais da Radioagência Nacional', NULL, true, true, 'manual', false, true),
('Radioagência Nacional - Direitos Humanos', 'http://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/direitos-humanos/feed.xml', 'Direitos humanos da Radioagência Nacional', NULL, true, true, 'manual', false, true),
('Radioagência Nacional - Economia', 'http://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/economia/feed.xml', 'Economia da Radioagência Nacional', NULL, true, true, 'manual', false, true),
('Radioagência Nacional - Educação', 'http://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/educacao/feed.xml', 'Educação da Radioagência Nacional', NULL, true, true, 'manual', false, true),
('Radioagência Nacional - Esportes', 'http://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/esportes/feed.xml', 'Esportes da Radioagência Nacional', NULL, true, true, 'manual', false, true),
('Radioagência Nacional - Geral', 'http://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/geral/feed.xml', 'Notícias gerais da Radioagência Nacional', NULL, true, true, 'manual', false, true),
('Radioagência Nacional - Internacional', 'http://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/internacional/feed.xml', 'Notícias internacionais da Radioagência Nacional', NULL, true, true, 'manual', false, true),
('Radioagência Nacional - Justiça', 'http://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/justica/feed.xml', 'Justiça da Radioagência Nacional', NULL, true, true, 'manual', false, true),
('Radioagência Nacional - Meio Ambiente', 'http://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/meio-ambiente/feed.xml', 'Meio ambiente da Radioagência Nacional', NULL, true, true, 'manual', false, true),
('Radioagência Nacional - Pesquisa e Inovação', 'http://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/pesquisa-e-inovacao/feed.xml', 'Pesquisa e inovação da Radioagência Nacional', NULL, true, true, 'manual', false, true),
('Radioagência Nacional - Política', 'http://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/politica/feed.xml', 'Política da Radioagência Nacional', NULL, true, true, 'manual', false, true),
('Radioagência Nacional - Saúde', 'http://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/saude/feed.xml', 'Saúde da Radioagência Nacional', NULL, true, true, 'manual', false, true),
('Radioagência Nacional - Segurança', 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/seguranca/feed.xml', 'Segurança da Radioagência Nacional', NULL, true, true, 'manual', false, true);