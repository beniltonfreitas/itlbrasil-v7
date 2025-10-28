-- Add missing columns to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Add missing columns to articles_queue table
ALTER TABLE articles_queue ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone;
ALTER TABLE articles_queue ADD COLUMN IF NOT EXISTS reviewed_by uuid;

-- Add missing columns to article_comments table
ALTER TABLE article_comments ADD COLUMN IF NOT EXISTS author_name text;
ALTER TABLE article_comments ADD COLUMN IF NOT EXISTS author_email text;
ALTER TABLE article_comments ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Add missing columns to communities table
ALTER TABLE communities ADD COLUMN IF NOT EXISTS cover_image text;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS type text DEFAULT 'public';
ALTER TABLE communities ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}';
ALTER TABLE communities ADD COLUMN IF NOT EXISTS member_count integer DEFAULT 0;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS post_count integer DEFAULT 0;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Add missing columns to community_posts table
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS author_id uuid;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS type text DEFAULT 'post';
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS media_urls text[] DEFAULT '{}';
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS poll_options jsonb;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS is_pinned boolean DEFAULT false;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS is_locked boolean DEFAULT false;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS comment_count integer DEFAULT 0;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Add missing columns to feed_test_results table
ALTER TABLE feed_test_results ADD COLUMN IF NOT EXISTS test_date timestamp with time zone DEFAULT now();
ALTER TABLE feed_test_results ADD COLUMN IF NOT EXISTS response_time_ms integer;
ALTER TABLE feed_test_results ADD COLUMN IF NOT EXISTS articles_found integer DEFAULT 0;
ALTER TABLE feed_test_results ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();

-- Add missing columns to import_logs table
ALTER TABLE import_logs ADD COLUMN IF NOT EXISTS articles_imported integer DEFAULT 0;
ALTER TABLE import_logs ADD COLUMN IF NOT EXISTS import_mode text DEFAULT 'auto';
ALTER TABLE import_logs ADD COLUMN IF NOT EXISTS started_at timestamp with time zone;
ALTER TABLE import_logs ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;

-- Add missing column to rss_feeds table
ALTER TABLE rss_feeds ADD COLUMN IF NOT EXISTS is_native boolean DEFAULT false;