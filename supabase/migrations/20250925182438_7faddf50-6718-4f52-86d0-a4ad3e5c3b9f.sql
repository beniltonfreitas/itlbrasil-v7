-- Robust correction of native RSS feeds: URLs, existence, categories

-- 1) Ensure Agência Brasil key feeds exist and are properly labeled
-- Últimas Notícias (set name/is_native/category using URL as source of truth)
UPDATE public.rss_feeds
SET name = 'Agência Brasil - Últimas Notícias', is_native = true, active = true, category_id = '338f2754-f7b2-4b91-a56a-2ce202173692'
WHERE url = 'http://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml';

-- Direitos Humanos (update if exists by URL)
UPDATE public.rss_feeds
SET name = 'Agência Brasil - Direitos Humanos', is_native = true, active = true, category_id = '2eddac5c-2e5a-4959-87cc-4dfa8fcb4b76'
WHERE url = 'http://agenciabrasil.ebc.com.br/rss/direitos-humanos/feed.xml';

-- If Direitos Humanos does not exist, insert it (idempotent by URL)
INSERT INTO public.rss_feeds (name, url, description, is_native, active, auto_publish, review_queue, import_mode, import_interval, category_id)
VALUES ('Agência Brasil - Direitos Humanos', 'http://agenciabrasil.ebc.com.br/rss/direitos-humanos/feed.xml', 'Notícias sobre direitos humanos da Agência Brasil', true, true, false, false, 'manual', 60, '2eddac5c-2e5a-4959-87cc-4dfa8fcb4b76')
ON CONFLICT (url) DO UPDATE SET
  name = EXCLUDED.name,
  is_native = true,
  active = true,
  category_id = EXCLUDED.category_id;

-- 2) Radioagência Nacional - Segurança (insert or update by URL)
INSERT INTO public.rss_feeds (name, url, description, is_native, active, auto_publish, review_queue, import_mode, import_interval, category_id)
VALUES ('Radioagência Nacional - Segurança', 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/seguranca/feed.xml', 'Notícias sobre segurança da Radioagência Nacional', true, true, false, false, 'manual', 60, '88726b53-d4f4-41d1-9c6b-60eba519e3f2')
ON CONFLICT (url) DO UPDATE SET
  name = EXCLUDED.name,
  is_native = true,
  active = true,
  category_id = EXCLUDED.category_id;

-- 3) Update Radioagência Nacional feeds to HTTPS where applicable (by name)
UPDATE public.rss_feeds SET url = 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/cultura/feed.xml' WHERE name = 'Radioagência Nacional - Cultura' AND url <> 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/cultura/feed.xml';
UPDATE public.rss_feeds SET url = 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/direitos-humanos/feed.xml' WHERE name = 'Radioagência Nacional - Direitos Humanos' AND url <> 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/direitos-humanos/feed.xml';
UPDATE public.rss_feeds SET url = 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/economia/feed.xml' WHERE name = 'Radioagência Nacional - Economia' AND url <> 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/economia/feed.xml';
UPDATE public.rss_feeds SET url = 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/educacao/feed.xml' WHERE name = 'Radioagência Nacional - Educação' AND url <> 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/educacao/feed.xml';
UPDATE public.rss_feeds SET url = 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/esportes/feed.xml' WHERE name = 'Radioagência Nacional - Esportes' AND url <> 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/esportes/feed.xml';
UPDATE public.rss_feeds SET url = 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/geral/feed.xml' WHERE name = 'Radioagência Nacional - Geral' AND url <> 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/geral/feed.xml';
UPDATE public.rss_feeds SET url = 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/internacional/feed.xml' WHERE name = 'Radioagência Nacional - Internacional' AND url <> 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/internacional/feed.xml';
UPDATE public.rss_feeds SET url = 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/justica/feed.xml' WHERE name = 'Radioagência Nacional - Justiça' AND url <> 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/justica/feed.xml';
UPDATE public.rss_feeds SET url = 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/meio-ambiente/feed.xml' WHERE name = 'Radioagência Nacional - Meio Ambiente' AND url <> 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/meio-ambiente/feed.xml';
UPDATE public.rss_feeds SET url = 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/pesquisa-e-inovacao/feed.xml' WHERE name = 'Radioagência Nacional - Pesquisa e Inovação' AND url <> 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/pesquisa-e-inovacao/feed.xml';
UPDATE public.rss_feeds SET url = 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/politica/feed.xml' WHERE name = 'Radioagência Nacional - Política' AND url <> 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/politica/feed.xml';
UPDATE public.rss_feeds SET url = 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/saude/feed.xml' WHERE name = 'Radioagência Nacional - Saúde' AND url <> 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/saude/feed.xml';
UPDATE public.rss_feeds SET url = 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/ultimasnoticias/feed.xml' WHERE name = 'Radioagência Nacional - Últimas Notícias' AND url <> 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/ultimasnoticias/feed.xml';

-- 4) Map categories for all native feeds (by name)
-- Agência Brasil
UPDATE public.rss_feeds SET category_id = '338f2754-f7b2-4b91-a56a-2ce202173692' WHERE name = 'Agência Brasil - Últimas Notícias' AND is_native = true;
UPDATE public.rss_feeds SET category_id = '2eddac5c-2e5a-4959-87cc-4dfa8fcb4b76' WHERE name = 'Agência Brasil - Direitos Humanos' AND is_native = true;
UPDATE public.rss_feeds SET category_id = 'c219d9f2-7367-43a2-bc8f-38a68a51a58e' WHERE name = 'Agência Brasil - Economia' AND is_native = true;
UPDATE public.rss_feeds SET category_id = 'e4c4bb83-eadf-49bd-beab-04cdf20dafe7' WHERE name = 'Agência Brasil - Educação' AND is_native = true;
UPDATE public.rss_feeds SET category_id = '9dcac36e-821a-47c2-8acd-0d1adb65266e' WHERE name = 'Agência Brasil - Esportes' AND is_native = true;
UPDATE public.rss_feeds SET category_id = '338f2754-f7b2-4b91-a56a-2ce202173692' WHERE name = 'Agência Brasil - Geral' AND is_native = true;
UPDATE public.rss_feeds SET category_id = '440c20fd-a12e-4f9f-94b7-17f9ebe69c58' WHERE name = 'Agência Brasil - Internacional' AND is_native = true;
UPDATE public.rss_feeds SET category_id = '396ae68e-6ece-470a-aec3-40afced5817e' WHERE name = 'Agência Brasil - Justiça' AND is_native = true;
UPDATE public.rss_feeds SET category_id = '664155df-a1c8-4359-a42f-b58257cf556f' WHERE name = 'Agência Brasil - Política' AND is_native = true;
UPDATE public.rss_feeds SET category_id = '3f807f98-4c9f-4da9-bbae-eb3bf0c31a51' WHERE name = 'Agência Brasil - Saúde' AND is_native = true;
UPDATE public.rss_feeds SET category_id = '338f2754-f7b2-4b91-a56a-2ce202173692' WHERE name = 'Agência Brasil - Parceiros' AND is_native = true;

-- Radioagência Nacional
UPDATE public.rss_feeds SET category_id = '338f2754-f7b2-4b91-a56a-2ce202173692' WHERE name = 'Radioagência Nacional - Últimas Notícias' AND is_native = true;
UPDATE public.rss_feeds SET category_id = '73942be6-74d1-44f6-88b0-abddc8b2aedf' WHERE name = 'Radioagência Nacional - Cultura' AND is_native = true;
UPDATE public.rss_feeds SET category_id = '2eddac5c-2e5a-4959-87cc-4dfa8fcb4b76' WHERE name = 'Radioagência Nacional - Direitos Humanos' AND is_native = true;
UPDATE public.rss_feeds SET category_id = 'c219d9f2-7367-43a2-bc8f-38a68a51a58e' WHERE name = 'Radioagência Nacional - Economia' AND is_native = true;
UPDATE public.rss_feeds SET category_id = 'e4c4bb83-eadf-49bd-beab-04cdf20dafe7' WHERE name = 'Radioagência Nacional - Educação' AND is_native = true;
UPDATE public.rss_feeds SET category_id = '9dcac36e-821a-47c2-8acd-0d1adb65266e' WHERE name = 'Radioagência Nacional - Esportes' AND is_native = true;
UPDATE public.rss_feeds SET category_id = '338f2754-f7b2-4b91-a56a-2ce202173692' WHERE name = 'Radioagência Nacional - Geral' AND is_native = true;
UPDATE public.rss_feeds SET category_id = '440c20fd-a12e-4f9f-94b7-17f9ebe69c58' WHERE name = 'Radioagência Nacional - Internacional' AND is_native = true;
UPDATE public.rss_feeds SET category_id = '396ae68e-6ece-470a-aec3-40afced5817e' WHERE name = 'Radioagência Nacional - Justiça' AND is_native = true;
UPDATE public.rss_feeds SET category_id = '5aab897c-126f-4836-bb0e-a54ae85707b3' WHERE name = 'Radioagência Nacional - Meio Ambiente' AND is_native = true;
UPDATE public.rss_feeds SET category_id = '70e1d2ff-8b76-434d-bfc0-32cc5bebd019' WHERE name = 'Radioagência Nacional - Pesquisa e Inovação' AND is_native = true;
UPDATE public.rss_feeds SET category_id = '664155df-a1c8-4359-a42f-b58257cf556f' WHERE name = 'Radioagência Nacional - Política' AND is_native = true;
UPDATE public.rss_feeds SET category_id = '3f807f98-4c9f-4da9-bbae-eb3bf0c31a51' WHERE name = 'Radioagência Nacional - Saúde' AND is_native = true;
UPDATE public.rss_feeds SET category_id = '88726b53-d4f4-41d1-9c6b-60eba519e3f2' WHERE name = 'Radioagência Nacional - Segurança' AND is_native = true;
