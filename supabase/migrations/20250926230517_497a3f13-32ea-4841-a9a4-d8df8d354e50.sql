-- Create tables for Social Post module (with existence checks)

-- Create enums only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_status') THEN
    CREATE TYPE post_status AS ENUM (
      'draft', 
      'scheduled', 
      'published', 
      'failed', 
      'cancelled'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_type') THEN
    CREATE TYPE content_type AS ENUM (
      'text', 
      'image', 
      'video', 
      'carousel', 
      'story', 
      'reel'
    );
  END IF;
END$$;

-- Social media accounts connected to the system
CREATE TABLE IF NOT EXISTS social_media_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform social_platform NOT NULL,
  account_name TEXT NOT NULL,
  account_id TEXT NOT NULL,  -- Platform specific account ID
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  profile_image_url TEXT,
  follower_count INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(platform, account_id)
);

-- Social posts (drafts, scheduled, published)
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  platforms social_platform[] NOT NULL,
  content_type content_type DEFAULT 'text',
  media_urls TEXT[],
  hashtags TEXT[],
  status post_status DEFAULT 'draft',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  campaign_id UUID,
  engagement_stats JSONB DEFAULT '{}',
  platform_post_ids JSONB DEFAULT '{}', -- Store post IDs from each platform
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Social campaigns for organizing posts
CREATE TABLE IF NOT EXISTS social_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  budget DECIMAL(10,2),
  target_platforms social_platform[],
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add foreign key for campaign_id in social_posts if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_social_posts_campaign'
  ) THEN
    ALTER TABLE social_posts 
    ADD CONSTRAINT fk_social_posts_campaign 
    FOREIGN KEY (campaign_id) REFERENCES social_campaigns(id) ON DELETE SET NULL;
  END IF;
END$$;

-- Media library for social posts
CREATE TABLE IF NOT EXISTS social_media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- image/jpeg, video/mp4, etc
  file_size BIGINT,
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- for videos in seconds
  tags TEXT[],
  folder TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Social analytics and metrics
CREATE TABLE IF NOT EXISTS social_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  platform social_platform NOT NULL,
  metric_type TEXT NOT NULL, -- likes, shares, comments, views, clicks, etc
  metric_value INTEGER DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Social comments and interactions inbox
CREATE TABLE IF NOT EXISTS social_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID,
  platform social_platform NOT NULL,
  platform_comment_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_username TEXT,
  author_avatar_url TEXT,
  content TEXT NOT NULL,
  parent_comment_id TEXT, -- for replies
  sentiment TEXT, -- positive, negative, neutral
  is_replied BOOLEAN DEFAULT false,
  reply_content TEXT,
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(platform, platform_comment_id)
);

-- Enable RLS on all tables
ALTER TABLE social_media_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can manage their own social accounts" ON social_media_accounts;
DROP POLICY IF EXISTS "Users can manage their own posts" ON social_posts;
DROP POLICY IF EXISTS "Users can manage their own media" ON social_media_library;
DROP POLICY IF EXISTS "Public media is viewable by everyone" ON social_media_library;
DROP POLICY IF EXISTS "Users can manage their own campaigns" ON social_campaigns;
DROP POLICY IF EXISTS "Users can view analytics for their posts" ON social_analytics;
DROP POLICY IF EXISTS "System can insert analytics" ON social_analytics;
DROP POLICY IF EXISTS "Users can view comments for their posts" ON social_comments;
DROP POLICY IF EXISTS "Users can manage comments for their posts" ON social_comments;

-- RLS Policies for social_media_accounts
CREATE POLICY "Users can manage their own social accounts" 
ON social_media_accounts 
FOR ALL 
USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- RLS Policies for social_posts
CREATE POLICY "Users can manage their own posts" 
ON social_posts 
FOR ALL 
USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- RLS Policies for social_media_library
CREATE POLICY "Users can manage their own media" 
ON social_media_library 
FOR ALL 
USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Public media is viewable by everyone" 
ON social_media_library 
FOR SELECT 
USING (is_public = true);

-- RLS Policies for social_campaigns
CREATE POLICY "Users can manage their own campaigns" 
ON social_campaigns 
FOR ALL 
USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- RLS Policies for social_analytics
CREATE POLICY "Users can view analytics for their posts" 
ON social_analytics 
FOR SELECT 
USING (EXISTS(
  SELECT 1 FROM social_posts 
  WHERE social_posts.id = social_analytics.post_id 
  AND (social_posts.user_id = auth.uid() OR is_admin(auth.uid()))
));

CREATE POLICY "System can insert analytics" 
ON social_analytics 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for social_comments
CREATE POLICY "Users can view comments for their posts" 
ON social_comments 
FOR SELECT 
USING (EXISTS(
  SELECT 1 FROM social_posts 
  WHERE social_posts.id = social_comments.post_id 
  AND (social_posts.user_id = auth.uid() OR is_admin(auth.uid()))
) OR is_admin(auth.uid()));

CREATE POLICY "Users can manage comments for their posts" 
ON social_comments 
FOR ALL 
USING (EXISTS(
  SELECT 1 FROM social_posts 
  WHERE social_posts.id = social_comments.post_id 
  AND (social_posts.user_id = auth.uid() OR is_admin(auth.uid()))
) OR is_admin(auth.uid()));

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled_at ON social_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_social_posts_platforms ON social_posts USING GIN(platforms);
CREATE INDEX IF NOT EXISTS idx_social_analytics_post_id ON social_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_social_analytics_platform ON social_analytics(platform);
CREATE INDEX IF NOT EXISTS idx_social_comments_post_id ON social_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_platform ON social_comments(platform);

-- Create triggers for updated_at timestamp
DROP TRIGGER IF EXISTS update_social_media_accounts_updated_at ON social_media_accounts;
CREATE TRIGGER update_social_media_accounts_updated_at
  BEFORE UPDATE ON social_media_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_social_posts_updated_at ON social_posts;
CREATE TRIGGER update_social_posts_updated_at
  BEFORE UPDATE ON social_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_social_media_library_updated_at ON social_media_library;
CREATE TRIGGER update_social_media_library_updated_at
  BEFORE UPDATE ON social_media_library
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_social_campaigns_updated_at ON social_campaigns;
CREATE TRIGGER update_social_campaigns_updated_at
  BEFORE UPDATE ON social_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert menu permissions for Social Post module (avoiding duplicates)
INSERT INTO menu_permissions (role, menu_item, enabled) 
SELECT 'superadmin', 'social-overview', true
WHERE NOT EXISTS (SELECT 1 FROM menu_permissions WHERE role = 'superadmin' AND menu_item = 'social-overview');

INSERT INTO menu_permissions (role, menu_item, enabled) 
SELECT 'superadmin', 'social-create', true
WHERE NOT EXISTS (SELECT 1 FROM menu_permissions WHERE role = 'superadmin' AND menu_item = 'social-create');

INSERT INTO menu_permissions (role, menu_item, enabled) 
SELECT 'superadmin', 'social-schedule', true
WHERE NOT EXISTS (SELECT 1 FROM menu_permissions WHERE role = 'superadmin' AND menu_item = 'social-schedule');

INSERT INTO menu_permissions (role, menu_item, enabled) 
SELECT 'superadmin', 'social-media', true
WHERE NOT EXISTS (SELECT 1 FROM menu_permissions WHERE role = 'superadmin' AND menu_item = 'social-media');

INSERT INTO menu_permissions (role, menu_item, enabled) 
SELECT 'superadmin', 'social-inbox', true
WHERE NOT EXISTS (SELECT 1 FROM menu_permissions WHERE role = 'superadmin' AND menu_item = 'social-inbox');

INSERT INTO menu_permissions (role, menu_item, enabled) 
SELECT 'superadmin', 'social-reports', true
WHERE NOT EXISTS (SELECT 1 FROM menu_permissions WHERE role = 'superadmin' AND menu_item = 'social-reports');

INSERT INTO menu_permissions (role, menu_item, enabled) 
SELECT 'superadmin', 'social-settings', true
WHERE NOT EXISTS (SELECT 1 FROM menu_permissions WHERE role = 'superadmin' AND menu_item = 'social-settings');

INSERT INTO menu_permissions (role, menu_item, enabled) 
SELECT 'admin', 'social-overview', true
WHERE NOT EXISTS (SELECT 1 FROM menu_permissions WHERE role = 'admin' AND menu_item = 'social-overview');

INSERT INTO menu_permissions (role, menu_item, enabled) 
SELECT 'admin', 'social-create', true
WHERE NOT EXISTS (SELECT 1 FROM menu_permissions WHERE role = 'admin' AND menu_item = 'social-create');

INSERT INTO menu_permissions (role, menu_item, enabled) 
SELECT 'admin', 'social-schedule', true
WHERE NOT EXISTS (SELECT 1 FROM menu_permissions WHERE role = 'admin' AND menu_item = 'social-schedule');

INSERT INTO menu_permissions (role, menu_item, enabled) 
SELECT 'admin', 'social-media', true
WHERE NOT EXISTS (SELECT 1 FROM menu_permissions WHERE role = 'admin' AND menu_item = 'social-media');

INSERT INTO menu_permissions (role, menu_item, enabled) 
SELECT 'admin', 'social-inbox', true
WHERE NOT EXISTS (SELECT 1 FROM menu_permissions WHERE role = 'admin' AND menu_item = 'social-inbox');

INSERT INTO menu_permissions (role, menu_item, enabled) 
SELECT 'admin', 'social-reports', true
WHERE NOT EXISTS (SELECT 1 FROM menu_permissions WHERE role = 'admin' AND menu_item = 'social-reports');

INSERT INTO menu_permissions (role, menu_item, enabled) 
SELECT 'admin', 'social-settings', true
WHERE NOT EXISTS (SELECT 1 FROM menu_permissions WHERE role = 'admin' AND menu_item = 'social-settings');

INSERT INTO menu_permissions (role, menu_item, enabled) 
SELECT 'editor', 'social-overview', true
WHERE NOT EXISTS (SELECT 1 FROM menu_permissions WHERE role = 'editor' AND menu_item = 'social-overview');

INSERT INTO menu_permissions (role, menu_item, enabled) 
SELECT 'editor', 'social-create', true
WHERE NOT EXISTS (SELECT 1 FROM menu_permissions WHERE role = 'editor' AND menu_item = 'social-create');

INSERT INTO menu_permissions (role, menu_item, enabled) 
SELECT 'editor', 'social-schedule', true
WHERE NOT EXISTS (SELECT 1 FROM menu_permissions WHERE role = 'editor' AND menu_item = 'social-schedule');

INSERT INTO menu_permissions (role, menu_item, enabled) 
SELECT 'editor', 'social-media', true
WHERE NOT EXISTS (SELECT 1 FROM menu_permissions WHERE role = 'editor' AND menu_item = 'social-media');