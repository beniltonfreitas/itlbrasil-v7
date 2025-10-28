-- Corrige as URLs dos feeds RSS da Agência Brasil
UPDATE public.rss_feeds 
SET url = CASE 
  WHEN name = 'Agência Brasil - Geral' THEN 'https://agenciabrasil.ebc.com.br/rss/geral/feed.xml'
  WHEN name = 'Agência Brasil - Política' THEN 'https://agenciabrasil.ebc.com.br/rss/politica/feed.xml'
  WHEN name = 'Agência Brasil - Economia' THEN 'https://agenciabrasil.ebc.com.br/rss/economia/feed.xml'
  WHEN name = 'Agência Brasil - Saúde' THEN 'https://agenciabrasil.ebc.com.br/rss/saude/feed.xml'
  WHEN name = 'Agência Brasil - Educação' THEN 'https://agenciabrasil.ebc.com.br/rss/educacao/feed.xml'
  WHEN name = 'Agência Brasil - Justiça' THEN 'https://agenciabrasil.ebc.com.br/rss/justica/feed.xml'
  WHEN name = 'Agência Brasil - Internacional' THEN 'https://agenciabrasil.ebc.com.br/rss/internacional/feed.xml'
  WHEN name = 'Agência Brasil - Esportes' THEN 'https://agenciabrasil.ebc.com.br/rss/esportes/feed.xml'
  WHEN name = 'Agência Brasil - Direitos Humanos' THEN 'https://agenciabrasil.ebc.com.br/rss/direitos-humanos/feed.xml'
  WHEN name = 'Agência Brasil - Últimas Notícias' THEN 'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml'
  WHEN name = 'Radioagência Nacional - Meio Ambiente' THEN 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/meio-ambiente/feed.xml'
END
WHERE is_native = true AND url != CASE 
  WHEN name = 'Agência Brasil - Geral' THEN 'https://agenciabrasil.ebc.com.br/rss/geral/feed.xml'
  WHEN name = 'Agência Brasil - Política' THEN 'https://agenciabrasil.ebc.com.br/rss/politica/feed.xml'
  WHEN name = 'Agência Brasil - Economia' THEN 'https://agenciabrasil.ebc.com.br/rss/economia/feed.xml'
  WHEN name = 'Agência Brasil - Saúde' THEN 'https://agenciabrasil.ebc.com.br/rss/saude/feed.xml'
  WHEN name = 'Agência Brasil - Educação' THEN 'https://agenciabrasil.ebc.com.br/rss/educacao/feed.xml'
  WHEN name = 'Agência Brasil - Justiça' THEN 'https://agenciabrasil.ebc.com.br/rss/justica/feed.xml'
  WHEN name = 'Agência Brasil - Internacional' THEN 'https://agenciabrasil.ebc.com.br/rss/internacional/feed.xml'
  WHEN name = 'Agência Brasil - Esportes' THEN 'https://agenciabrasil.ebc.com.br/rss/esportes/feed.xml'
  WHEN name = 'Agência Brasil - Direitos Humanos' THEN 'https://agenciabrasil.ebc.com.br/rss/direitos-humanos/feed.xml'
  WHEN name = 'Agência Brasil - Últimas Notícias' THEN 'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml'
  WHEN name = 'Radioagência Nacional - Meio Ambiente' THEN 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/rss/meio-ambiente/feed.xml'
END;