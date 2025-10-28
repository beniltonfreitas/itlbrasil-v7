-- Insert categories for Metrópole Online feeds (if they don't exist)
INSERT INTO public.categories (name, slug, description, color, icon) 
VALUES 
  ('Celebridades', 'celebridades', 'Notícias sobre celebridades e famosos', '#E91E63', 'Star'),
  ('Metrópole Pet', 'metropole-pet', 'Notícias sobre animais e pets', '#4CAF50', 'Heart')
ON CONFLICT (slug) DO NOTHING;

-- Insert only the new Metrópole Online RSS Feeds (skip the one that already exists)
INSERT INTO public.rss_feeds (name, url, description, is_native, active, import_mode, review_queue, max_articles_per_import, category_id) 
VALUES 
  ('Metrópole Online - Cidades', 'https://metropoleonline.com.br/rss/category/cidades', 'Notícias sobre cidades da região metropolitana', true, false, 'manual', true, 5, (SELECT id FROM categories WHERE slug = 'geral' LIMIT 1)),
  ('Metrópole Online - Cajamar', 'https://metropoleonline.com.br/rss/category/cajamar', 'Notícias específicas da cidade de Cajamar', true, false, 'manual', true, 5, (SELECT id FROM categories WHERE slug = 'geral' LIMIT 1)),
  ('Metrópole Online - Franco da Rocha', 'https://metropoleonline.com.br/rss/category/franco-da-rocha', 'Notícias específicas da cidade de Franco da Rocha', true, false, 'manual', true, 5, (SELECT id FROM categories WHERE slug = 'geral' LIMIT 1)),
  ('Metrópole Online - Francisco Morato', 'https://metropoleonline.com.br/rss/category/francisco-morato', 'Notícias específicas da cidade de Francisco Morato', true, false, 'manual', true, 5, (SELECT id FROM categories WHERE slug = 'geral' LIMIT 1)),
  ('Metrópole Online - Caieiras', 'https://metropoleonline.com.br/rss/category/caieiras', 'Notícias específicas da cidade de Caieiras', true, false, 'manual', true, 5, (SELECT id FROM categories WHERE slug = 'geral' LIMIT 1)),
  ('Metrópole Online - Santana de Parnaíba', 'https://metropoleonline.com.br/rss/category/santana-de-parnaiba', 'Notícias específicas da cidade de Santana de Parnaíba', true, false, 'manual', true, 5, (SELECT id FROM categories WHERE slug = 'geral' LIMIT 1)),
  ('Metrópole Online - Barueri', 'https://metropoleonline.com.br/rss/category/barueri', 'Notícias específicas da cidade de Barueri', true, false, 'manual', true, 5, (SELECT id FROM categories WHERE slug = 'geral' LIMIT 1)),
  ('Metrópole Online - Jundiaí', 'https://metropoleonline.com.br/rss/category/jundiai', 'Notícias específicas da cidade de Jundiaí', true, false, 'manual', true, 5, (SELECT id FROM categories WHERE slug = 'geral' LIMIT 1)),
  ('Metrópole Online - Grande SP', 'https://metropoleonline.com.br/rss/category/grande-sp', 'Notícias da Grande São Paulo', true, false, 'manual', true, 5, (SELECT id FROM categories WHERE slug = 'geral' LIMIT 1)),
  ('Metrópole Online - Política', 'https://metropoleonline.com.br/rss/category/politica', 'Notícias políticas da região', true, false, 'manual', true, 5, (SELECT id FROM categories WHERE slug = 'politica' LIMIT 1)),
  ('Metrópole Online - Celebridades', 'https://metropoleonline.com.br/rss/category/celebridades', 'Notícias sobre celebridades e famosos', true, false, 'manual', true, 5, (SELECT id FROM categories WHERE slug = 'celebridades' LIMIT 1)),
  ('Metrópole Online - Esportes', 'https://metropoleonline.com.br/rss/category/esportes', 'Notícias esportivas', true, false, 'manual', true, 5, (SELECT id FROM categories WHERE slug = 'esportes' LIMIT 1)),
  ('Metrópole Online - Economia', 'https://metropoleonline.com.br/rss/category/economia', 'Notícias econômicas', true, false, 'manual', true, 5, (SELECT id FROM categories WHERE slug = 'economia' LIMIT 1)),
  ('Metrópole Online - Tecnologia', 'https://metropoleonline.com.br/rss/category/tecnologia', 'Notícias sobre tecnologia', true, false, 'manual', true, 5, (SELECT id FROM categories WHERE slug = 'geral' LIMIT 1)),
  ('Metrópole Online - Mundo', 'https://metropoleonline.com.br/rss/category/mundo', 'Notícias internacionais', true, false, 'manual', true, 5, (SELECT id FROM categories WHERE slug = 'internacional' LIMIT 1)),
  ('Metrópole Online - Polícia', 'https://metropoleonline.com.br/rss/category/policia', 'Notícias policiais e de segurança', true, false, 'manual', true, 5, (SELECT id FROM categories WHERE slug = 'geral' LIMIT 1)),
  ('Metrópole Online - Poder Legislativo de Cajamar', 'https://metropoleonline.com.br/rss/category/poder-legislativo', 'Notícias do poder legislativo de Cajamar', true, false, 'manual', true, 5, (SELECT id FROM categories WHERE slug = 'politica' LIMIT 1)),
  ('Metrópole Online - Metrópole Pet', 'https://metropoleonline.com.br/rss/category/territorio-animal', 'Notícias sobre animais e pets', true, false, 'manual', true, 5, (SELECT id FROM categories WHERE slug = 'metropole-pet' LIMIT 1))
ON CONFLICT (url) DO NOTHING;

-- Update the existing feed to match the naming pattern
UPDATE public.rss_feeds 
SET name = 'Metrópole Online - Últimas Notícias', is_native = true
WHERE url = 'https://metropoleonline.com.br/rss/latest-posts';