-- Reorganizar categorias conforme especificado
-- Primeiro, criar as novas categorias
INSERT INTO categories (name, slug, description, color) VALUES
('Últimas Notícias', 'ultimas-noticias', 'Categoria especial para destacar as notícias mais recentes', '#FF6B35'),
('Internacional', 'internacional', 'Notícias internacionais e geopolíticas', '#4A90E2')
ON CONFLICT (slug) DO NOTHING;

-- Migrar artigos da categoria "Geopolítica" para "Internacional"
UPDATE articles 
SET category_id = (SELECT id FROM categories WHERE slug = 'internacional')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'geopolitica');

-- Migrar artigos das categorias que serão removidas para "Geral"
UPDATE articles 
SET category_id = (SELECT id FROM categories WHERE slug = 'geral')
WHERE category_id IN (
  SELECT id FROM categories 
  WHERE slug IN ('celebridades', 'cultura', 'meio-ambiente', 'metropole-pet', 'sociedade', 'tecnologia')
);

-- Remover as categorias desnecessárias
DELETE FROM categories 
WHERE slug IN ('celebridades', 'cultura', 'geopolitica', 'meio-ambiente', 'metropole-pet', 'sociedade', 'tecnologia');