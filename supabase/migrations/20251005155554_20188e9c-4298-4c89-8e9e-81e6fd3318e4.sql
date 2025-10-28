-- Adicionar campos faltantes em communities
ALTER TABLE communities
ADD COLUMN IF NOT EXISTS monthly_price numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Adicionar campos faltantes em community_posts
ALTER TABLE community_posts
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS reaction_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS share_count integer DEFAULT 0;

-- Adicionar campos faltantes em live_streams
ALTER TABLE live_streams
ADD COLUMN IF NOT EXISTS stream_type text DEFAULT 'live',
ADD COLUMN IF NOT EXISTS viewer_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS chat_enabled boolean DEFAULT true;

-- Adicionar campos faltantes em media_library
ALTER TABLE media_library
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS media_type text,
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS thumbnail_url text,
ADD COLUMN IF NOT EXISTS duration integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Adicionar campos faltantes em platform_integrations
ALTER TABLE platform_integrations
ADD COLUMN IF NOT EXISTS platform text,
ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS channel_id text,
ADD COLUMN IF NOT EXISTS channel_name text,
ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;

-- Adicionar campos faltantes em profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS name text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user',
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_communities_created_by ON communities(created_by);
CREATE INDEX IF NOT EXISTS idx_media_library_media_type ON media_library(media_type);
CREATE INDEX IF NOT EXISTS idx_platform_integrations_platform ON platform_integrations(platform);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);