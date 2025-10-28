-- Adicionar campos ausentes para metadados de imagem
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS featured_image_alt TEXT,
ADD COLUMN IF NOT EXISTS featured_image_credit TEXT;

COMMENT ON COLUMN articles.featured_image_alt IS 'Texto alternativo da imagem para acessibilidade';
COMMENT ON COLUMN articles.featured_image_credit IS 'Crédito da imagem principal';