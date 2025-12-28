-- Create json_generation_history table
CREATE TABLE public.json_generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT,
  news_url TEXT,
  image_url TEXT,
  generated_json JSONB NOT NULL,
  articles_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'done',
  error_message TEXT,
  source_tool TEXT DEFAULT 'rss-to-json',
  feed_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.json_generation_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own history"
  ON public.json_generation_history FOR SELECT
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Users can create history entries"
  ON public.json_generation_history FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own history"
  ON public.json_generation_history FOR DELETE
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

-- Index for faster queries
CREATE INDEX idx_json_generation_history_user_id ON public.json_generation_history(user_id);
CREATE INDEX idx_json_generation_history_created_at ON public.json_generation_history(created_at DESC);