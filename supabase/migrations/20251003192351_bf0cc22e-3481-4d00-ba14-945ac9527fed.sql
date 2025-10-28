-- Create webstories table
CREATE TABLE IF NOT EXISTS public.webstories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  publisher_logo TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.webstories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published webstories viewable by everyone"
  ON public.webstories FOR SELECT
  USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage webstories"
  ON public.webstories FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- Create webstory_pages table
CREATE TABLE IF NOT EXISTS public.webstory_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webstory_id UUID REFERENCES public.webstories(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  background_image TEXT,
  background_color TEXT,
  content JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.webstory_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Webstory pages viewable by everyone"
  ON public.webstory_pages FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage webstory pages"
  ON public.webstory_pages FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- Create articles_queue table
CREATE TABLE IF NOT EXISTS public.articles_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  source_url TEXT,
  status TEXT DEFAULT 'pending',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.articles_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage queue"
  ON public.articles_queue FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- Create article_comments table
CREATE TABLE IF NOT EXISTS public.article_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.article_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.article_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments viewable by everyone"
  ON public.article_comments FOR SELECT
  USING (approved = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create comments"
  ON public.article_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON public.article_comments FOR UPDATE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Create communities table
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id),
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public communities viewable by everyone"
  ON public.communities FOR SELECT
  USING (is_private = false OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create communities"
  ON public.communities FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Create community_members table
CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members viewable by community members"
  ON public.community_members FOR SELECT
  USING (true);

-- Create community_posts table
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts viewable by everyone"
  ON public.community_posts FOR SELECT
  USING (true);

CREATE POLICY "Users can create posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create rss_feeds table
CREATE TABLE IF NOT EXISTS public.rss_feeds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES public.categories(id),
  active BOOLEAN DEFAULT true,
  last_fetched TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.rss_feeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage RSS feeds"
  ON public.rss_feeds FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- Create feed_test_results table
CREATE TABLE IF NOT EXISTS public.feed_test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_id UUID REFERENCES public.rss_feeds(id) ON DELETE CASCADE,
  status TEXT,
  items_found INTEGER DEFAULT 0,
  error_message TEXT,
  tested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.feed_test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view test results"
  ON public.feed_test_results FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create import_logs table
CREATE TABLE IF NOT EXISTS public.import_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_id UUID REFERENCES public.rss_feeds(id) ON DELETE CASCADE,
  status TEXT,
  items_imported INTEGER DEFAULT 0,
  error_message TEXT,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view import logs"
  ON public.import_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create live_streams table
CREATE TABLE IF NOT EXISTS public.live_streams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  stream_url TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'scheduled',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Live streams viewable by everyone"
  ON public.live_streams FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage live streams"
  ON public.live_streams FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create media_library table
CREATE TABLE IF NOT EXISTS public.media_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media viewable by everyone"
  ON public.media_library FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can upload media"
  ON public.media_library FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

-- Create platform_integrations table
CREATE TABLE IF NOT EXISTS public.platform_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform_name TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.platform_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own integrations"
  ON public.platform_integrations FOR ALL
  USING (auth.uid() = user_id);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings viewable by everyone"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON public.site_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create site_banners table
CREATE TABLE IF NOT EXISTS public.site_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  image_url TEXT,
  link_url TEXT,
  position INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.site_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Banners viewable by everyone"
  ON public.site_banners FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage banners"
  ON public.site_banners FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create site_ads table
CREATE TABLE IF NOT EXISTS public.site_ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  ad_code TEXT,
  position TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.site_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ads viewable by everyone"
  ON public.site_ads FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage ads"
  ON public.site_ads FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Add triggers for updated_at
CREATE TRIGGER update_webstories_updated_at
  BEFORE UPDATE ON public.webstories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_articles_queue_updated_at
  BEFORE UPDATE ON public.articles_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_article_comments_updated_at
  BEFORE UPDATE ON public.article_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_communities_updated_at
  BEFORE UPDATE ON public.communities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rss_feeds_updated_at
  BEFORE UPDATE ON public.rss_feeds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_live_streams_updated_at
  BEFORE UPDATE ON public.live_streams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platform_integrations_updated_at
  BEFORE UPDATE ON public.platform_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_banners_updated_at
  BEFORE UPDATE ON public.site_banners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_ads_updated_at
  BEFORE UPDATE ON public.site_ads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();