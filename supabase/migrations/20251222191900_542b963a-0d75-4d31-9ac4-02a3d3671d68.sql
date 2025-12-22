-- Remove políticas conflitantes do article-images
DROP POLICY IF EXISTS "article_images_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload article images" ON storage.objects;

-- Criar política única e simples para upload de imagens
CREATE POLICY "Allow authenticated upload to article-images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'article-images' 
  AND auth.role() = 'authenticated'
);

-- Garantir que UPDATE também funcione
DROP POLICY IF EXISTS "Users can update their article images" ON storage.objects;
DROP POLICY IF EXISTS "article_images_owner_update" ON storage.objects;

CREATE POLICY "Allow authenticated update to article-images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'article-images' 
  AND auth.role() = 'authenticated'
);