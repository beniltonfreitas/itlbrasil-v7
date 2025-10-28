-- Criar bucket para imagens de artigos (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- Permitir leitura pública
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');

-- Permitir upload apenas para service role
DROP POLICY IF EXISTS "Service Role Upload" ON storage.objects;
CREATE POLICY "Service Role Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'article-images' 
  AND auth.role() = 'service_role'
);