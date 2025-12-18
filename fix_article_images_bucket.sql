-- Fix RLS policies for article-images bucket to allow authenticated uploads
-- Execute este SQL no Supabase SQL Editor

-- Remove existing restrictive policies
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Service Role Upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view article images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload article images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their article images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete article images" ON storage.objects;
DROP POLICY IF EXISTS "article_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "article_images_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "article_images_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "article_images_admin_delete" ON storage.objects;

-- Public read access for article-images bucket
CREATE POLICY "article_images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');

-- Upload access for authenticated users
CREATE POLICY "article_images_authenticated_upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'article-images' 
  AND auth.uid() IS NOT NULL
);

-- Update access for authenticated users
CREATE POLICY "article_images_authenticated_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'article-images' 
  AND auth.uid() IS NOT NULL
);

-- Delete access for admins/superadmins only
CREATE POLICY "article_images_admin_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'article-images' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('superadmin', 'admin')
  )
);

-- Update bucket configuration to accept correct MIME types and set size limit
UPDATE storage.buckets 
SET 
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  file_size_limit = 5242880,  -- 5MB
  public = true
WHERE id = 'article-images';
