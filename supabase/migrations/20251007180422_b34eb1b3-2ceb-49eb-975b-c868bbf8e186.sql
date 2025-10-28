-- Fix article saving error by making author_id nullable and creating author records

-- Step 1: Make author_id nullable in articles table
ALTER TABLE public.articles 
ALTER COLUMN author_id DROP NOT NULL;

-- Step 2: Create author records for administrative users
-- Get user IDs and create corresponding author entries
DO $$
DECLARE
  v_user_bs7 uuid;
  v_user_chiquinho uuid;
BEGIN
  -- Get user IDs
  SELECT id INTO v_user_bs7 FROM auth.users WHERE email = 'bs7freitas@gmail.com';
  SELECT id INTO v_user_chiquinho FROM auth.users WHERE email = 'chiquinhomachado@gmail.com';
  
  -- Create author for bs7freitas@gmail.com if user exists
  IF v_user_bs7 IS NOT NULL THEN
    INSERT INTO public.authors (id, name, slug, email, bio)
    VALUES (
      v_user_bs7,
      'Bruno Freitas',
      'bruno-freitas',
      'bs7freitas@gmail.com',
      'Administrador do sistema'
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      updated_at = now();
    
    RAISE NOTICE 'Author created/updated for bs7freitas@gmail.com';
  END IF;
  
  -- Create author for chiquinhomachado@gmail.com if user exists
  IF v_user_chiquinho IS NOT NULL THEN
    INSERT INTO public.authors (id, name, slug, email, bio)
    VALUES (
      v_user_chiquinho,
      'Chiquinho Machado',
      'chiquinho-machado',
      'chiquinhomachado@gmail.com',
      'Administrador do sistema'
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      updated_at = now();
    
    RAISE NOTICE 'Author created/updated for chiquinhomachado@gmail.com';
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN public.articles.author_id IS 'Author ID reference to authors table. Nullable to allow articles from editorial team without specific author.';