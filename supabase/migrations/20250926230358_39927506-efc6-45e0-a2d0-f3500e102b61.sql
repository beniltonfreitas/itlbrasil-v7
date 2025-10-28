-- Create tables for Social Post module

-- Social media platforms enum
CREATE TYPE social_platform AS ENUM (
  'instagram', 
  'facebook', 
  'linkedin', 
  'youtube', 
  'tiktok', 
  'twitter', 
  'google_business'
);

-- Post status enum
CREATE TYPE post_status AS ENUM (
  'draft', 
  'scheduled', 
  'published', 
  'failed', 
  'cancelled'
);

-- Content type enum
CREATE TYPE content_type AS ENUM (
  'text', 
  'image', 
  'video', 
  'carousel', 
  'story', 
  'reel'
);

-- Social media accounts connected to the system
CREATE TABLE social_media_accounts (
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
CREATE TABLE social_posts (
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

-- Media library for social posts
CREATE TABLE social_media_library (
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

-- Social campaigns for organizing posts
CREATE TABLE social_campaigns (
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

-- Social analytics and metrics
CREATE TABLE social_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  platform social_platform NOT NULL,
  metric_type TEXT NOT NULL, -- likes, shares, comments, views, clicks, etc
  metric_value INTEGER DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Social comments and interactions inbox
CREATE TABLE social_comments (
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

-- Add foreign key for campaign_id in social_posts
ALTER TABLE social_posts 
ADD CONSTRAINT fk_social_posts_campaign 
FOREIGN KEY (campaign_id) REFERENCES social_campaigns(id) ON DELETE SET NULL;

-- Enable RLS on all tables
ALTER TABLE social_media_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_comments ENABLE ROW LEVEL SECURITY;

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

-- Create indexes for better performance
CREATE INDEX idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX idx_social_posts_status ON social_posts(status);
CREATE INDEX idx_social_posts_scheduled_at ON social_posts(scheduled_at);
CREATE INDEX idx_social_posts_platforms ON social_posts USING GIN(platforms);
CREATE INDEX idx_social_analytics_post_id ON social_analytics(post_id);
CREATE INDEX idx_social_analytics_platform ON social_analytics(platform);
CREATE INDEX idx_social_comments_post_id ON social_comments(post_id);
CREATE INDEX idx_social_comments_platform ON social_comments(platform);

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_social_media_accounts_updated_at
  BEFORE UPDATE ON social_media_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_posts_updated_at
  BEFORE UPDATE ON social_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_media_library_updated_at
  BEFORE UPDATE ON social_media_library
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_campaigns_updated_at
  BEFORE UPDATE ON social_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert menu permissions for Social Post module
INSERT INTO menu_permissions (role, menu_item, enabled) VALUES
('superadmin', 'social-overview', true),
('superadmin', 'social-create', true),
('superadmin', 'social-schedule', true),
('superadmin', 'social-media', true),
('superadmin', 'social-inbox', true),
('superadmin', 'social-reports', true),
('superadmin', 'social-settings', true),
('admin', 'social-overview', true),
('admin', 'social-create', true),
('admin', 'social-schedule', true),
('admin', 'social-media', true),
('admin', 'social-inbox', true),
('admin', 'social-reports', true),
('admin', 'social-settings', true),
('editor', 'social-overview', true),
('editor', 'social-create', true),
('editor', 'social-schedule', true),
('editor', 'social-media', true),
('author', 'social-overview', false),
('author', 'social-create', false),
('author', 'social-schedule', false),
('author', 'social-media', false);